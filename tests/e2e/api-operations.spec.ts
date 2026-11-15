import { test, expect } from '@fixtures/test.fixture';
import * as http from 'http';

test.describe('REST API Client Operations Suite', { tag: ['@regression', '@api'] }, () => {
  let mockServer: http.Server;
  let mockServerUrl: string;

  test.beforeAll(async () => {
    // Spin up an in-memory mock REST API server for deterministic local execution
    await new Promise<void>((resolve) => {
      mockServer = http.createServer((req, res) => {
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        let body = '';

        req.on('data', (chunk) => {
          body += chunk;
        });

        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json');

          // GET /api/users
          if (req.method === 'GET' && url.pathname === '/api/users') {
            const roleFilter = url.searchParams.get('role');
            const users = [
              { id: 1, name: 'Alice Smith', role: 'Architect' },
              { id: 2, name: 'Bob Jones', role: 'SDET' },
            ];
            const filtered = roleFilter ? users.filter((u) => u.role === roleFilter) : users;
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, count: filtered.length, data: filtered }));
            return;
          }

          // GET /api/users/:id
          if (req.method === 'GET' && url.pathname === '/api/users/1') {
            res.writeHead(200);
            res.end(JSON.stringify({ id: 1, name: 'Alice Smith', email: 'alice@example.com' }));
            return;
          }

          // POST /api/users
          if (req.method === 'POST' && url.pathname === '/api/users') {
            const parsed = JSON.parse(body || '{}');
            res.writeHead(201);
            res.end(JSON.stringify({ id: 101, ...parsed, createdAt: '2026-11-15T00:00:00Z' }));
            return;
          }

          // PUT /api/users/1
          if (req.method === 'PUT' && url.pathname === '/api/users/1') {
            const parsed = JSON.parse(body || '{}');
            res.writeHead(200);
            res.end(JSON.stringify({ id: 1, ...parsed, updatedAt: '2026-11-15T00:00:00Z' }));
            return;
          }

          // DELETE /api/users/1
          if (req.method === 'DELETE' && url.pathname === '/api/users/1') {
            res.writeHead(204);
            res.end();
            return;
          }

          // GET /api/secure/data (Requires Authorization)
          if (url.pathname === '/api/secure/data') {
            const authHeader = req.headers['authorization'];
            if (authHeader === 'Bearer secret-token-xyz') {
              res.writeHead(200);
              res.end(JSON.stringify({ authenticated: true, secret: 'enterprise-core-data' }));
            } else {
              res.writeHead(401);
              res.end(JSON.stringify({ authenticated: false, message: 'Unauthorized' }));
            }
            return;
          }

          // Fallback 404
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Endpoint not found' }));
        });
      });

      mockServer.listen(0, '127.0.0.1', () => {
        const address = mockServer.address() as { port: number };
        mockServerUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  test.afterAll(async () => {
    if (mockServer) {
      await new Promise<void>((resolve) => mockServer.close(() => resolve()));
    }
  });

  test('GET request with query params and response verification @smoke', async ({ createApiClient }) => {
    const client = createApiClient(mockServerUrl);

    // Call GET /api/users?role=Architect
    const response = await client.get('/api/users', {
      params: { role: 'Architect' },
    });

    response.expectStatus(200);
    response.expectSuccess();
    expect(response.data.success).toBe(true);
    expect(response.data.count).toBe(1);
    expect(response.data.data[0].name).toBe('Alice Smith');
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  test('POST request with JSON payload @smoke', async ({ createApiClient }) => {
    const client = createApiClient(mockServerUrl);

    const newUserPayload = {
      name: 'Carlos Ray',
      role: 'Principal SDET',
      department: 'Quality Engineering',
    };

    const response = await client.post('/api/users', newUserPayload);

    response.expectStatus(201);
    response.expectSuccess();
    expect(response.data.id).toBe(101);
    expect(response.data.name).toBe('Carlos Ray');
    expect(response.data.role).toBe('Principal SDET');
  });

  test('PUT request to update resource', async ({ createApiClient }) => {
    const client = createApiClient(mockServerUrl);

    const updatePayload = {
      name: 'Alice Smith-Jones',
      role: 'Director of QA Architecture',
    };

    const response = await client.put('/api/users/1', updatePayload);

    response.expectStatus(200);
    response.expectSuccess();
    expect(response.data.name).toBe('Alice Smith-Jones');
    expect(response.data.role).toBe('Director of QA Architecture');
  });

  test('DELETE request validating 204 No Content', async ({ createApiClient }) => {
    const client = createApiClient(mockServerUrl);

    const response = await client.delete('/api/users/1');

    response.expectStatus(204);
    expect(response.ok).toBe(true);
  });

  test('Bearer token authorization handling (authorized vs unauthorized) @smoke', async ({ createApiClient }) => {
    const client = createApiClient(mockServerUrl);

    // 1. Request without token -> 401 Unauthorized
    const unauthResponse = await client.get('/api/secure/data');
    unauthResponse.expectStatus(401);
    expect(unauthResponse.ok).toBe(false);

    // 2. Set Bearer token -> 200 OK
    client.setAuthToken('secret-token-xyz');
    const authResponse = await client.get('/api/secure/data');
    authResponse.expectStatus(200);
    authResponse.expectSuccess();
    expect(authResponse.data.authenticated).toBe(true);
    expect(authResponse.data.secret).toBe('enterprise-core-data');
  });
});

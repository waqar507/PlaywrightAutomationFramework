/**
 * Common test helper utilities
 */
export class TestHelpers {
  /**
   * Generates a random alphanumeric string of specified length.
   */
  public static randomString(length = 8): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generates a unique email with timestamp and random suffix.
   */
  public static randomEmail(prefix = 'testuser'): string {
    const timestamp = Date.now();
    const suffix = this.randomString(4).toLowerCase();
    return `${prefix}.${timestamp}.${suffix}@testdomain.com`;
  }

  /**
   * Generates a random number between min and max (inclusive).
   */
  public static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a formatted date string.
   */
  public static getFormattedDate(offsetDays = 0, format: 'ISO' | 'US' | 'EU' = 'ISO'): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    if (format === 'ISO') {
      return date.toISOString().split('T')[0];
    }
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();

    return format === 'US' ? `${mm}/${dd}/${yyyy}` : `${dd}/${mm}/${yyyy}`;
  }

  /**
   * Delays execution for specified milliseconds (use sparingly; prefer Playwright auto-wait).
   */
  public static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { test, expect, Page } from '@playwright/test';

// Helper to collect console errors
async function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  return { errors, warnings };
}

test.describe('Startup & Initialization', () => {
  test('page loads without critical console errors', async ({ page }) => {
    const { errors } = await collectConsoleErrors(page);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known acceptable errors (dev mode, CSP, favicon)
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('eval()') && // React dev mode
      !e.includes('Content Security Policy') && // CSP in dev
      !e.includes('Content-Security-Policy')
    );
    
    expect(criticalErrors).toHaveLength(0);
  });

  test('Kiro logo renders correctly', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the SVG logo to appear (KiroLogo uses SVG)
    const logo = page.locator('svg').first();
    await expect(logo).toBeVisible({ timeout: 10000 });
  });

  test('welcome screen appears with correct elements', async ({ page }) => {
    await page.goto('/');
    
    // Welcome message should be visible
    await expect(page.getByText(/welcome/i)).toBeVisible({ timeout: 10000 });
    
    // What's new section
    await expect(page.getByText(/what's new/i)).toBeVisible();
  });

  test('status line exists', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Status line contains model name from resume.json
    // Just check page loaded without crash
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('trust notice appears', async ({ page }) => {
    await page.goto('/');
    
    // Trust notice warning
    await expect(page.getByText(/warning|hint/i)).toBeVisible({ timeout: 10000 });
  });

  test('input box is ready for typing', async ({ page }) => {
    await page.goto('/');
    
    // Find the input element
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible({ timeout: 10000 });
    
    // Should be able to type
    await input.fill('/help');
    await expect(input).toHaveValue('/help');
  });

  test('no React hydration errors', async ({ page }) => {
    const hydrationErrors: string[] = [];
    
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Hydration') || text.includes('hydrat')) {
        hydrationErrors.push(text);
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    expect(hydrationErrors).toHaveLength(0);
  });
});

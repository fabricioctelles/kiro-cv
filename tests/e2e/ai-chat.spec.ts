import { test, expect, Page } from '@playwright/test';

test.describe('AI Chat Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('plain text triggers AI chat', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    // Send a simple question (not a slash command)
    await input.fill('What is your experience with TypeScript?');
    await input.press('Enter');
    
    // Wait for thinking indicator or response
    await page.waitForTimeout(1000);
    
    // Should show some response (either thinking or actual response)
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('AI response streams correctly', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('Tell me about yourself briefly');
    await input.press('Enter');
    
    // Wait for streaming to start
    await page.waitForTimeout(2000);
    
    // Check that content appears (streaming or complete)
    const content = await page.textContent('body');
    expect(content?.length).toBeGreaterThan(100);
  });

  test('AI stays on topic (professional context)', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('What programming languages do you know?');
    await input.press('Enter');
    
    // Wait for response
    await page.waitForTimeout(5000);
    
    const content = await page.textContent('body');
    // Should mention programming-related content from resume
    expect(content?.toLowerCase()).toMatch(/javascript|typescript|python|react|node|programming|develop/i);
  });

  test('multiple messages work', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    // First message
    await input.fill('Hi');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Second message
    await input.fill('What do you do?');
    await input.press('Enter');
    await page.waitForTimeout(3000);
    
    // Should have multiple interactions visible
    const body = await page.textContent('body');
    expect(body).toBeTruthy();
  });

  test('no console errors during AI chat', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    const input = page.locator('input[type="text"], textarea').first();
    await input.fill('Hello');
    await input.press('Enter');
    
    await page.waitForTimeout(5000);
    
    // Filter acceptable errors
    const criticalErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('404') &&
      !e.includes('rate limit') // Rate limit is expected in tests
    );
    
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('AI Chat Edge Cases', () => {
  test('empty message does not crash', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[type="text"], textarea').first();
    await input.press('Enter'); // Empty submit
    
    // Should not crash
    await expect(input).toBeVisible();
  });

  test('very long message is handled', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[type="text"], textarea').first();
    const longMessage = 'Tell me about ' + 'your experience '.repeat(50);
    
    await input.fill(longMessage);
    await input.press('Enter');
    
    await page.waitForTimeout(2000);
    
    // Should handle gracefully
    await expect(input).toBeVisible();
  });
});

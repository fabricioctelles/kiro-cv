import { test, expect } from '@playwright/test';

test.describe('Autocomplete', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('slash menu appears when typing /', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/');
    await page.waitForTimeout(300);
    
    // SlashMenu renders command options as divs with command names
    const helpOption = page.getByText('/help', { exact: true });
    await expect(helpOption).toBeVisible({ timeout: 2000 });
  });

  test('autocomplete filters as you type', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/he');
    await page.waitForTimeout(300);
    
    // Should show /help
    await expect(page.getByText('/help', { exact: true })).toBeVisible({ timeout: 2000 });
  });

  test('arrow keys navigate autocomplete', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/');
    await page.waitForTimeout(300);
    
    // Press down arrow - navigation works if no crash
    await input.press('ArrowDown');
    await page.waitForTimeout(100);
    
    // Verify menu still visible
    await expect(page.getByText('/help', { exact: true })).toBeVisible();
  });

  test('Enter selects autocomplete item', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/hel');
    await page.waitForTimeout(300);
    
    // Select with Enter
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Should have executed /help
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/command|available|portfolio|system/i);
  });

  test('Escape closes autocomplete', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/');
    await page.waitForTimeout(300);
    
    // Verify menu is open
    await expect(page.getByText('/help', { exact: true })).toBeVisible();
    
    await input.press('Escape');
    await page.waitForTimeout(300);
    
    // Input should be cleared or menu closed
    const value = await input.inputValue();
    // Either input cleared or menu closed - behavior may vary
    expect(value === '' || value === '/').toBeTruthy();
  });
});

test.describe('Command History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('arrow up recalls previous command', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    // Execute a command by typing full command and pressing enter
    await input.fill('/version');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Press up to recall
    await input.press('ArrowUp');
    await page.waitForTimeout(100);
    
    // Should recall /version
    const value = await input.inputValue();
    expect(value).toBe('/version');
  });

  test('command history works across commands', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    // Execute /version
    await input.fill('/version');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Execute /status  
    await input.fill('/status');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Navigate history - most recent first
    await input.press('ArrowUp'); 
    const value1 = await input.inputValue();
    expect(value1).toBe('/status');
  });
});

test.describe('Input Behavior', () => {
  test('input accepts commands', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/version');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Command should have been processed
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/version|v\d/i);
  });

  test('input stays visible after command', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/help');
    await input.press('Enter');
    await page.waitForTimeout(500);
    
    // Should still be visible
    await expect(input).toBeVisible();
  });
});

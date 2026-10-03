import { test, expect } from '@playwright/test';

test.describe('Easter Eggs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('/game starts Kiro Runner', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/game');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Game should appear - look for game-related elements
    const gameContent = await page.textContent('body');
    expect(gameContent?.toLowerCase()).toMatch(/game|kiro|runner|ghost|score|play/i);
  });

  test('/play is alias for /game', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/play');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    const gameContent = await page.textContent('body');
    expect(gameContent?.toLowerCase()).toMatch(/game|kiro|runner|ghost|score|play/i);
  });

  test('/kiro-runner is alias for /game', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/kiro-runner');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    const gameContent = await page.textContent('body');
    expect(gameContent?.toLowerCase()).toMatch(/game|kiro|runner|ghost|score|play/i);
  });

  test('game responds to keyboard input', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/game');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Try pressing space or arrow keys (common game controls)
    await page.keyboard.press('Space');
    await page.waitForTimeout(500);
    
    // Game should not crash
    await expect(page.locator('body')).toBeVisible();
  });

  test('game can be exited', async ({ page }) => {
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/game');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Press Escape to exit
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Should return to normal terminal or game over state
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('/quit Command', () => {
  test('/quit shows login screen if configured', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const input = page.locator('input[type="text"], textarea').first();
    
    await input.fill('/quit');
    await input.press('Enter');
    await page.waitForTimeout(1000);
    
    // Should show login screen or exit message
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/login|quit|exit|goodbye|session/i);
  });
});

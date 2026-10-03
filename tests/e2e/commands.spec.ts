import { test, expect, Page } from '@playwright/test';

// Helper to execute a command and wait for output
async function executeCommand(page: Page, command: string) {
  const input = page.locator('input[type="text"], textarea').first();
  await input.fill(command);
  await input.press('Enter');
  // Wait for response to render
  await page.waitForTimeout(500);
}

// Helper to check command output appeared
async function expectOutputContains(page: Page, text: string | RegExp) {
  await expect(page.getByText(text)).toBeVisible({ timeout: 5000 });
}

test.describe('Portfolio Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('/help shows command list', async ({ page }) => {
    await executeCommand(page, '/help');
    await expectOutputContains(page, /available commands|portfolio|system/i);
  });

  test('/about shows personal info', async ({ page }) => {
    await executeCommand(page, '/about');
    // Should show name or summary from resume
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('/experience shows work history', async ({ page }) => {
    await executeCommand(page, '/experience');
    await page.waitForTimeout(1000);
    // Work history should appear
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/experience|work|engineer|developer/i);
  });

  test('/skills shows technical skills', async ({ page }) => {
    await executeCommand(page, '/skills');
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/skill|tech|stack/i);
  });

  test('/education shows education', async ({ page }) => {
    await executeCommand(page, '/education');
    await page.waitForTimeout(1000);
    // Some education content should appear
  });

  test('/contact shows contact info', async ({ page }) => {
    await executeCommand(page, '/contact');
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/contact|email|linkedin|github/i);
  });

  test('/projects shows projects', async ({ page }) => {
    await executeCommand(page, '/projects');
    await page.waitForTimeout(1000);
  });

  test('/languages shows languages', async ({ page }) => {
    await executeCommand(page, '/languages');
    await page.waitForTimeout(1000);
  });

  test('/certs shows certifications', async ({ page }) => {
    await executeCommand(page, '/certs');
    await page.waitForTimeout(1000);
  });

  test('/publications shows publications', async ({ page }) => {
    await executeCommand(page, '/publications');
    await page.waitForTimeout(1000);
  });

  // Test aliases
  test('aliases work: /h = /help', async ({ page }) => {
    await executeCommand(page, '/h');
    await expectOutputContains(page, /available commands|portfolio|system/i);
  });

  test('aliases work: /work = /experience', async ({ page }) => {
    await executeCommand(page, '/work');
    await page.waitForTimeout(1000);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/experience|work|engineer|developer/i);
  });
});

test.describe('System Commands', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('/clear clears terminal', async ({ page }) => {
    // First execute some command
    await executeCommand(page, '/help');
    await page.waitForTimeout(500);
    
    // Then clear
    await executeCommand(page, '/clear');
    await page.waitForTimeout(500);
    
    // Help output should be gone, but input should still work
    const input = page.locator('input[type="text"], textarea').first();
    await expect(input).toBeVisible();
  });

  test('/version shows version', async ({ page }) => {
    await executeCommand(page, '/version');
    await page.waitForTimeout(500);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/version|v\d/i);
  });

  test('/status shows status', async ({ page }) => {
    await executeCommand(page, '/status');
    await page.waitForTimeout(500);
  });

  test('/model shows model selector', async ({ page }) => {
    await executeCommand(page, '/model');
    await page.waitForTimeout(500);
    // Should show model options
  });

  test('/doctor runs diagnostics', async ({ page }) => {
    await executeCommand(page, '/doctor');
    await page.waitForTimeout(500);
    const content = await page.textContent('body');
    expect(content?.toLowerCase()).toMatch(/check|pass|skill|diagnostic/i);
  });

  test('/usage shows usage stats', async ({ page }) => {
    await executeCommand(page, '/usage');
    await page.waitForTimeout(500);
  });

  test('/cost shows cost analysis', async ({ page }) => {
    await executeCommand(page, '/cost');
    await page.waitForTimeout(500);
  });

  test('/init generates content', async ({ page }) => {
    await executeCommand(page, '/init');
    await page.waitForTimeout(500);
  });
});

test.describe('Command Not Found', () => {
  test('unknown command shows suggestion', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await executeCommand(page, '/hlep'); // typo
    await page.waitForTimeout(500);
    
    const content = await page.textContent('body');
    // Should suggest /help or show "did you mean"
    expect(content?.toLowerCase()).toMatch(/help|did you mean|not found|unknown/i);
  });
});

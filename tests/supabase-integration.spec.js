// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Basic smoke tests for Supabase Integration
 */

test.describe('Supabase Configuration UI', () => {
  test('should show configuration modal with required fields', async ({ page }) => {
    await page.goto('/');
    
    // Check configuration modal is visible
    const configModal = page.locator('#configModal');
    await expect(configModal).toBeVisible();
    
    // Check required fields
    await expect(page.locator('#supabaseUrl')).toBeVisible();
    await expect(page.locator('#supabaseKey')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
  });

  test('should hide import and export buttons', async ({ page }) => {
    await page.goto('/');
    
    // Verify buttons are not visible
    const importBtn = page.locator('#importBtn');
    const exportBtn = page.locator('#exportBtn');
    
    await expect(importBtn).not.toBeVisible();
    await expect(exportBtn).not.toBeVisible();
  });
});

test.describe('Mock Database Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Supabase client
    await page.addInitScript(() => {
      window.mockSupabaseData = {
        data: null,
        shouldFail: false,
        saveCount: 0
      };

      // Mock Supabase createClient
      window.supabase = {
        createClient: (url, key) => {
          return {
            from: (tableName) => {
              return {
                select: (columns) => {
                  return {
                    eq: (column, value) => {
                      return {
                        single: async () => {
                          if (window.mockSupabaseData.shouldFail) {
                            return { data: null, error: { message: 'Connection failed' } };
                          }
                          
                          // Return stored data or empty
                          if (window.mockSupabaseData.data) {
                            return { 
                              data: { state: window.mockSupabaseData.data }, 
                              error: null 
                            };
                          }
                          
                          // No data found
                          return { 
                            data: null, 
                            error: { code: 'PGRST116', message: 'No rows found' } 
                          };
                        }
                      };
                    }
                  };
                },
                upsert: async (data, options) => {
                  if (window.mockSupabaseData.shouldFail) {
                    return { error: { message: 'Save failed' } };
                  }
                  
                  window.mockSupabaseData.data = data.state;
                  window.mockSupabaseData.saveCount++;
                  return { error: null };
                }
              };
            }
          };
        }
      };
    });
  });

  test('should connect with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Fill in configuration
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    
    // Submit form
    await page.click('#configForm button[type="submit"]');
    
    // Wait for async configuration to complete - modal becomes hidden
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // App should be loaded
    await expect(page.locator('#songListView')).toBeVisible();
  });

  test('should show error on connection failure', async ({ page }) => {
    await page.goto('/');
    
    // Set mock to fail
    await page.evaluate(() => {
      window.mockSupabaseData.shouldFail = true;
    });
    
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Configuration failed');
      dialogShown = true;
      dialog.accept();
    });
    
    // Fill and submit
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    
    // Wait for error handling to complete by checking button is re-enabled
    await page.waitForFunction(() => {
      const btn = document.querySelector('#configForm button[type="submit"]');
      return !btn.disabled && btn.textContent === 'Connect';
    }, { timeout: 5000 });
    
    // Verify error was shown
    expect(dialogShown).toBe(true);
    
    // Modal should still be visible (active)
    await expect(page.locator('#configModal')).toHaveClass(/active/);
    
    // Submit button should be re-enabled
    const submitBtn = page.locator('#configForm button[type="submit"]');
    await expect(submitBtn).not.toBeDisabled();
    await expect(submitBtn).toHaveText('Connect');
  });

  test('should save song to database', async ({ page }) => {
    await page.goto('/');
    
    // Configure app
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    
    // Wait for modal to close
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Database Test Song');
    await page.fill('#songArtist', 'Test Artist');
    await page.fill('#songLyrics', '[C]Test lyrics');
    await page.click('#saveSongBtn');
    
    // Check that database was called
    const saveCount = await page.evaluate(() => window.mockSupabaseData.saveCount);
    expect(saveCount).toBeGreaterThan(0);
    
    // Verify song is displayed
    await expect(page.locator('.song-header h2')).toHaveText('Database Test Song');
  });

  test('should prevent save on database error', async ({ page }) => {
    await page.goto('/');
    
    // Configure app
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Set mock to fail on save
    await page.evaluate(() => {
      window.mockSupabaseData.shouldFail = true;
    });
    
    // Set up dialog handler
    let dialogShown = false;
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Failed to save song');
      dialogShown = true;
      dialog.accept();
    });
    
    // Try to add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Fail Test');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    // Wait for save attempt to complete by checking we're still on edit view
    await expect(page.locator('#songEditView')).toBeVisible();
    
    // Verify error dialog was shown
    expect(dialogShown).toBe(true);
  });

  test('should persist data across page reloads', async ({ page }) => {
    await page.goto('/');
    
    // Configure app
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Persistent Song');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Get the saved data
    const savedData = await page.evaluate(() => window.mockSupabaseData.data);
    
    // Reload page with saved data
    await page.goto('/');
    
    // Restore the saved data before configuration
    await page.evaluate((data) => {
      window.mockSupabaseData.data = data;
    }, savedData);
    
    // Configure again
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    
    // Wait for configuration and song list to load
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Song should be there
    const songCard = page.locator('.song-card').first();
    await expect(songCard).toBeVisible();
    await expect(songCard.locator('h3')).toHaveText('Persistent Song');
  });

  test('should update song in database on edit', async ({ page }) => {
    await page.goto('/');
    
    // Configure app
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Original Title');
    await page.fill('#songLyrics', 'Original lyrics');
    await page.click('#saveSongBtn');
    
    // Get initial save count
    const initialCount = await page.evaluate(() => window.mockSupabaseData.saveCount);
    
    // Edit the song
    await page.click('#editSongBtn');
    await page.fill('#songTitle', 'Updated Title');
    await page.click('#saveSongBtn');
    
    // Check that database was called again
    const finalCount = await page.evaluate(() => window.mockSupabaseData.saveCount);
    expect(finalCount).toBeGreaterThan(initialCount);
    
    // Verify update is displayed
    await expect(page.locator('.song-header h2')).toHaveText('Updated Title');
  });

  test('should delete song from database', async ({ page }) => {
    await page.goto('/');
    
    // Configure app
    await page.fill('#supabaseUrl', 'https://test.supabase.co');
    await page.fill('#supabaseKey', 'test-key');
    await page.fill('#username', 'testuser');
    await page.click('#configForm button[type="submit"]');
    await page.waitForSelector('#configModal', { state: 'hidden', timeout: 5000 });
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Delete Test');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    // Get initial save count
    const initialCount = await page.evaluate(() => window.mockSupabaseData.saveCount);
    
    // Set up dialog handler to confirm deletion
    let dialogShown = false;
    page.on('dialog', dialog => {
      dialogShown = true;
      dialog.accept();
    });
    
    await page.click('#deleteSongBtn');
    
    // Verify dialog was shown
    expect(dialogShown).toBe(true);
    
    // Check that database was called
    const finalCount = await page.evaluate(() => window.mockSupabaseData.saveCount);
    expect(finalCount).toBeGreaterThan(initialCount);
    
    // Should be back to list with empty state
    await expect(page.locator('#songListView')).toBeVisible();
    await expect(page.locator('#emptySongList')).toBeVisible();
  });
});

// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Visual Snapshot Tests for Songbook Application
 * These tests capture screenshots to detect unintended visual changes
 */

// Helper to clear local storage and set up test data
test.beforeEach(async ({ page }) => {
  await page.goto('/?testMode=true');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Visual Snapshots', () => {
  test('should match snapshot of empty song list', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Wait for the page to be fully loaded
    await page.waitForSelector('#emptySongList');
    
    // Take screenshot of the entire page
    await expect(page).toHaveScreenshot('empty-song-list.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of song list with songs', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add sample songs
    const songs = [
      { title: 'Amazing Grace', artist: 'Traditional', lyrics: '[C]Amazing [F]grace, how [C]sweet the sound\nThat [Am]saved a [G]wretch like [C]me' },
      { title: 'Happy Birthday', artist: 'Traditional', lyrics: '[C]Happy birthday to [G]you\n[G7]Happy birthday to [C]you' },
      { title: 'Twinkle Star', artist: 'Mozart', lyrics: '[C]Twinkle, twinkle, [F]little [C]star\n[F]How I [C]wonder [G]what you [C]are' }
    ];
    
    for (const song of songs) {
      await page.click('#addSongBtn');
      await page.fill('#songTitle', song.title);
      await page.fill('#songArtist', song.artist);
      await page.fill('#songLyrics', song.lyrics);
      await page.click('#saveSongBtn');
      await page.click('#backToListBtn');
    }
    
    // Wait for songs to be rendered
    await page.waitForSelector('.song-card');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('song-list-with-songs.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of add song form', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Click Add Song button
    await page.click('#addSongBtn');
    
    // Wait for form to be visible
    await page.waitForSelector('#songEditView');
    await page.waitForSelector('#songTitle');
    
    // Take screenshot of the form
    await expect(page).toHaveScreenshot('add-song-form.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of song display with chords', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add a song with chords
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Chord Display Test');
    await page.fill('#songArtist', 'Test Artist');
    await page.fill('#songLyrics', '[C]Amazing [F]grace, how [C]sweet the sound\nThat [Am]saved a [G]wretch like [C]me\n\n[C]\'Twas [F]grace that [C]taught my [G]heart to fear\nAnd [C]grace my [G]fears re[C]lieved');
    await page.click('#saveSongBtn');
    
    // Wait for song to be displayed
    await page.waitForSelector('.song-content');
    
    // Take screenshot of the song display
    await expect(page).toHaveScreenshot('song-display-with-chords.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of edit song form with data', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add a song first
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Edit Test Song');
    await page.fill('#songArtist', 'Edit Artist');
    await page.fill('#songLyrics', '[C]Test lyrics for editing\n[G]Second line here');
    await page.click('#saveSongBtn');
    
    // Click edit button
    await page.click('#editSongBtn');
    
    // Wait for form to be populated
    await page.waitForSelector('#songEditView');
    await expect(page.locator('#songTitle')).toHaveValue('Edit Test Song');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('edit-song-form.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of search results', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add multiple songs
    const songs = [
      { title: 'Amazing Grace', artist: 'Traditional' },
      { title: 'Happy Birthday', artist: 'Traditional' },
      { title: 'Twinkle Star', artist: 'Mozart' }
    ];
    
    for (const song of songs) {
      await page.click('#addSongBtn');
      await page.fill('#songTitle', song.title);
      await page.fill('#songArtist', song.artist);
      await page.fill('#songLyrics', '[C]Test lyrics');
      await page.click('#saveSongBtn');
      await page.click('#backToListBtn');
    }
    
    // Search for "Amazing"
    await page.fill('#searchInput', 'Amazing');
    await page.waitForTimeout(300); // Wait for filtering
    
    // Take screenshot
    await expect(page).toHaveScreenshot('search-results.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of import modal', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Open import modal
    await page.click('#importBtn');
    
    // Wait for modal to be visible
    await page.waitForSelector('#importModal.active');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('import-modal.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of search with no results', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Test Song');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Search for non-existent song
    await page.fill('#searchInput', 'NonExistent');
    await page.waitForTimeout(300);
    
    // Wait for no results message
    await page.waitForSelector('#emptySongList');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('search-no-results.png', {
      fullPage: true,
    });
  });

  test('should match snapshot of mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/?testMode=true');
    
    // Add a song
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Mobile Test');
    await page.fill('#songArtist', 'Mobile Artist');
    await page.fill('#songLyrics', '[C]Test on mobile\n[G]Second line');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Wait for song card
    await page.waitForSelector('.song-card');
    
    // Take screenshot
    await expect(page).toHaveScreenshot('mobile-song-list.png', {
      fullPage: true,
    });
  });
});

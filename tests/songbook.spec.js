// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E Tests for Songbook Application
 * Testing all features from a user perspective
 */

// Helper to clear local storage before each test
test.beforeEach(async ({ page }) => {
  await page.goto('/?testMode=true');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test.describe('Song List View', () => {
  test('should display empty state when no songs exist', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Check for empty state message
    const emptyState = page.locator('#emptySongList');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No songs yet');
  });

  test('should display app title and main buttons', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Check header elements
    await expect(page.locator('#mainTitle')).toHaveText('🎵 Songbook');
    await expect(page.locator('#addSongBtn')).toBeVisible();
    await expect(page.locator('#importBtn')).toBeVisible();
    await expect(page.locator('#exportBtn')).toBeVisible();
  });

  test('should show search input', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search songs...');
  });
});

test.describe('Add Song Functionality', () => {
  test('should open add song form when clicking Add Song button', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Click Add Song button
    await page.click('#addSongBtn');
    
    // Verify form is displayed
    await expect(page.locator('#songEditView')).toBeVisible();
    await expect(page.locator('#songTitle')).toBeEmpty();
    await expect(page.locator('#songArtist')).toBeEmpty();
    await expect(page.locator('#songLyrics')).toBeEmpty();
  });

  test('should add a new song successfully', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    // Fill in song details
    await page.fill('#songTitle', 'Test Song');
    await page.fill('#songArtist', 'Test Artist');
    await page.fill('#songLyrics', '[C]Test lyrics [G]here');
    
    // Save the song
    await page.click('#saveSongBtn');
    
    // Should navigate to song display view
    await expect(page.locator('#songDisplayView')).toBeVisible();
    await expect(page.locator('.song-header h2')).toHaveText('Test Song');
    await expect(page.locator('.artist')).toHaveText('Test Artist');
  });

  test('should persist song in local storage', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Persistent Song');
    await page.fill('#songArtist', 'Storage Artist');
    await page.fill('#songLyrics', '[C]This should persist');
    await page.click('#saveSongBtn');
    
    // Reload page
    await page.reload();
    
    // Song should still be there
    const songCard = page.locator('.song-card').first();
    await expect(songCard).toBeVisible();
    await expect(songCard.locator('h3')).toHaveText('Persistent Song');
  });

  test('should cancel adding a song and return to list', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Cancelled Song');
    
    // Click cancel
    await page.click('#cancelEditBtn');
    
    // Should return to song list view
    await expect(page.locator('#songListView')).toBeVisible();
    await expect(page.locator('#emptySongList')).toBeVisible();
  });

  test('should require title and lyrics to save', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    // Try to save without filling required fields
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('#saveSongBtn');
    
    // Should still be on edit view
    await expect(page.locator('#songEditView')).toBeVisible();
  });
});

test.describe('Song Display and Navigation', () => {
  test('should display song with formatted chords', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Chord Test');
    await page.fill('#songArtist', 'Chord Artist');
    await page.fill('#songLyrics', '[C]Amazing [F]grace, how [C]sweet the sound');
    await page.click('#saveSongBtn');
    
    // Check that chords are displayed as spans
    const chordSpans = page.locator('.chord');
    await expect(chordSpans).toHaveCount(3);
    
    // Verify chord content
    await expect(chordSpans.first()).toHaveAttribute('data-chord', 'C');
  });

  test('should handle empty lines in lyrics', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Multi-line Song');
    await page.fill('#songLyrics', 'Line 1\n\nLine 3');
    await page.click('#saveSongBtn');
    
    const lyricsLines = page.locator('.lyrics-line');
    await expect(lyricsLines).toHaveCount(3);
  });

  test('should navigate back to list from song display', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Nav Test');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    
    // Click back button
    await page.click('#backToListBtn');
    
    // Should be on list view
    await expect(page.locator('#songListView')).toBeVisible();
    await expect(page.locator('.song-card')).toHaveCount(1);
  });

  test('should navigate to song details when clicking song card', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Click Test');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Click on song card
    await page.click('.song-card');
    
    // Should show song display
    await expect(page.locator('#songDisplayView')).toBeVisible();
    await expect(page.locator('.song-header h2')).toHaveText('Click Test');
  });

  test('should navigate to list when clicking main title', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    
    await page.fill('#songTitle', 'Title Click Test');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    
    // Click main title
    await page.click('#mainTitle');
    
    // Should be on list view
    await expect(page.locator('#songListView')).toBeVisible();
  });
});

test.describe('Edit Song Functionality', () => {
  test('should edit an existing song', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Create a song first
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Original Title');
    await page.fill('#songArtist', 'Original Artist');
    await page.fill('#songLyrics', 'Original lyrics');
    await page.click('#saveSongBtn');
    
    // Click edit button
    await page.click('#editSongBtn');
    
    // Verify form is pre-filled
    await expect(page.locator('#songTitle')).toHaveValue('Original Title');
    await expect(page.locator('#songArtist')).toHaveValue('Original Artist');
    await expect(page.locator('#songLyrics')).toHaveValue('Original lyrics');
    
    // Edit the song
    await page.fill('#songTitle', 'Updated Title');
    await page.click('#saveSongBtn');
    
    // Verify update
    await expect(page.locator('.song-header h2')).toHaveText('Updated Title');
  });

  test('should cancel editing and return to song display', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Cancel Edit Test');
    await page.fill('#songLyrics', 'Original');
    await page.click('#saveSongBtn');
    
    await page.click('#editSongBtn');
    await page.fill('#songTitle', 'Changed');
    
    // Cancel edit
    await page.click('#cancelEditBtn');
    
    // Should return to display with original data
    await expect(page.locator('#songDisplayView')).toBeVisible();
    await expect(page.locator('.song-header h2')).toHaveText('Cancel Edit Test');
  });
});

test.describe('Delete Song Functionality', () => {
  test('should delete a song after confirmation', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Delete Me');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    // Set up dialog handler to accept confirmation
    page.on('dialog', dialog => dialog.accept());
    
    // Delete the song
    await page.click('#deleteSongBtn');
    
    // Should return to list view with empty state
    await expect(page.locator('#songListView')).toBeVisible();
    await expect(page.locator('#emptySongList')).toBeVisible();
  });

  test('should not delete song if user cancels', async ({ page }) => {
    await page.goto('/?testMode=true');
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Keep Me');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    // Set up dialog handler to cancel confirmation
    page.on('dialog', dialog => dialog.dismiss());
    
    await page.click('#deleteSongBtn');
    
    // Should still be on song display
    await expect(page.locator('#songDisplayView')).toBeVisible();
    await expect(page.locator('.song-header h2')).toHaveText('Keep Me');
  });
});

test.describe('Search Functionality', () => {
  test('should filter songs by title', async ({ page }) => {
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
      await page.fill('#songLyrics', 'Test lyrics');
      await page.click('#saveSongBtn');
      await page.click('#backToListBtn');
    }
    
    // Search for "Amazing"
    await page.fill('#searchInput', 'Amazing');
    
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(1);
    await expect(songCards.first().locator('h3')).toHaveText('Amazing Grace');
  });

  test('should filter songs by artist', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    const songs = [
      { title: 'Song A', artist: 'Artist One' },
      { title: 'Song B', artist: 'Artist Two' },
      { title: 'Song C', artist: 'Artist One' }
    ];
    
    for (const song of songs) {
      await page.click('#addSongBtn');
      await page.fill('#songTitle', song.title);
      await page.fill('#songArtist', song.artist);
      await page.fill('#songLyrics', 'Test lyrics');
      await page.click('#saveSongBtn');
      await page.click('#backToListBtn');
    }
    
    // Search for "Artist One"
    await page.fill('#searchInput', 'Artist One');
    
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(2);
  });

  test('should show no results message when search has no matches', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Test Song');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Search for non-existent song
    await page.fill('#searchInput', 'NonExistent');
    
    await expect(page.locator('#emptySongList')).toBeVisible();
    await expect(page.locator('#emptySongList')).toContainText('No songs found matching "NonExistent"');
  });

  test('should be case insensitive', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Test Song');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    await page.fill('#searchInput', 'test song');
    
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(1);
  });
});

test.describe('Import Functionality', () => {
  test('should open import modal when clicking Import button', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#importBtn');
    
    await expect(page.locator('#importModal')).toHaveClass(/active/);
    await expect(page.locator('#importData')).toBeVisible();
    await expect(page.locator('#importFile')).toBeVisible();
  });

  test('should close import modal when clicking Cancel', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#importBtn');
    await page.click('#cancelImportBtn');
    
    await expect(page.locator('#importModal')).not.toHaveClass(/active/);
  });

  test('should import songs from JSON text', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#importBtn');
    
    const importData = {
      songs: [
        {
          id: '1',
          title: 'Imported Song 1',
          artist: 'Import Artist',
          lyrics: '[C]Test lyrics',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Imported Song 2',
          artist: 'Import Artist',
          lyrics: '[G]More lyrics',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    
    // Set up dialog handler for success message
    page.on('dialog', dialog => dialog.accept());
    
    await page.fill('#importData', JSON.stringify(importData));
    await page.click('#confirmImportBtn');
    
    // Should show list view with imported songs
    await expect(page.locator('#songListView')).toBeVisible();
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(2);
  });

  test('should show error for invalid JSON', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#importBtn');
    
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Import failed');
      dialog.accept();
    });
    
    await page.fill('#importData', 'invalid json');
    await page.click('#confirmImportBtn');
    
    // Should still be on import modal
    await expect(page.locator('#importModal')).toHaveClass(/active/);
  });

  test('should show error when no data provided', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#importBtn');
    
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('Please select a file or paste JSON data');
      dialog.accept();
    });
    
    await page.click('#confirmImportBtn');
  });

  test('should avoid importing duplicate songs by ID', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // First import
    await page.click('#importBtn');
    const importData = {
      songs: [
        {
          id: 'unique-id-1',
          title: 'Unique Song',
          lyrics: 'Test',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
    };
    
    page.on('dialog', dialog => dialog.accept());
    
    await page.fill('#importData', JSON.stringify(importData));
    await page.click('#confirmImportBtn');
    
    // Second import with same ID
    await page.click('#importBtn');
    await page.fill('#importData', JSON.stringify(importData));
    await page.click('#confirmImportBtn');
    
    // Should still have only 1 song
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(1);
  });
});

test.describe('Export Functionality', () => {
  test('should export songs as JSON file', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add a song first
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Export Test');
    await page.fill('#songArtist', 'Export Artist');
    await page.fill('#songLyrics', '[C]Export lyrics');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Set up download handler
    const downloadPromise = page.waitForEvent('download');
    await page.click('#exportBtn');
    const download = await downloadPromise;
    
    // Verify download
    expect(download.suggestedFilename()).toMatch(/songbook-export-\d{4}-\d{2}-\d{2}\.json/);
  });

  test('should export empty songbook', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('#exportBtn');
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('songbook-export');
  });
});

test.describe('Print Functionality', () => {
  test('should have print button on song display', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Print Test');
    await page.fill('#songLyrics', 'Test lyrics');
    await page.click('#saveSongBtn');
    
    await expect(page.locator('#printSongBtn')).toBeVisible();
  });
});

test.describe('Song List Sorting', () => {
  test('should display songs sorted alphabetically by title', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    const songs = ['Zebra Song', 'Apple Song', 'Moon Song'];
    
    for (const title of songs) {
      await page.click('#addSongBtn');
      await page.fill('#songTitle', title);
      await page.fill('#songLyrics', 'Test');
      await page.click('#saveSongBtn');
      await page.click('#backToListBtn');
    }
    
    const songTitles = await page.locator('.song-card h3').allTextContents();
    expect(songTitles).toEqual(['Apple Song', 'Moon Song', 'Zebra Song']);
  });
});

test.describe('Local Storage Persistence', () => {
  test('should maintain songs across page reloads', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    // Add songs
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Persistent Song');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    // Reload page
    await page.reload();
    
    // Verify song is still there
    const songCards = page.locator('.song-card');
    await expect(songCards).toHaveCount(1);
    await expect(songCards.first().locator('h3')).toHaveText('Persistent Song');
  });

  test('should persist edited songs', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Edit Persist');
    await page.fill('#songLyrics', 'Original');
    await page.click('#saveSongBtn');
    
    await page.click('#editSongBtn');
    await page.fill('#songLyrics', 'Updated');
    await page.click('#saveSongBtn');
    
    // Reload
    await page.reload();
    
    // Click on song
    await page.click('.song-card');
    
    // Verify updated lyrics are persisted
    await expect(page.locator('.song-lyrics')).toContainText('Updated');
  });
});

test.describe('Edge Cases', () => {
  test('should handle special characters in song title', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Song with "quotes" & <tags>');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    await expect(page.locator('.song-header h2')).toHaveText('Song with "quotes" & <tags>');
  });

  test('should handle songs without artist', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'No Artist');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    
    await expect(page.locator('.artist')).toHaveText('Unknown Artist');
  });

  test('should handle empty artist field in song list', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'No Artist List');
    await page.fill('#songLyrics', 'Test');
    await page.click('#saveSongBtn');
    await page.click('#backToListBtn');
    
    const artistText = page.locator('.song-card p').first();
    await expect(artistText).toHaveText('Unknown Artist');
  });

  test('should handle multiple chord formats', async ({ page }) => {
    await page.goto('/?testMode=true');
    
    await page.click('#addSongBtn');
    await page.fill('#songTitle', 'Complex Chords');
    await page.fill('#songLyrics', '[C][G7][Am][F#m][Bb]');
    await page.click('#saveSongBtn');
    
    const chordSpans = page.locator('.chord');
    await expect(chordSpans).toHaveCount(5);
  });
});

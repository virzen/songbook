# 🎵 Songbook

A simple, front-end only web application for managing and displaying song lyrics with chords. Perfect for musicians who want to keep their songbook organized and accessible.

## Features

- 📝 **Add Songs**: Easy interface to add songs with lyrics and chords
- 🎸 **Chord Positioning**: Chords are displayed above the corresponding words
- 🔍 **Search**: Quickly find songs by title or artist
- 💾 **Local Storage**: All songs are saved in your browser's local storage
- 📤 **Export**: Export your entire songbook as JSON
- 📥 **Import**: Import songs from JSON files
- 🖨️ **Print**: Clean print layout for printing individual songs
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## Demo

Visit the live demo: [https://virzen.github.io/songbook/](https://virzen.github.io/songbook/)

## Usage

### Adding Songs

1. Click the "Add Song" button
2. Enter the song title and artist (optional)
3. Enter lyrics with chords in square brackets before the words they apply to
   - Example: `[C]Hello [G]world`
4. Click "Save"

### Chord Format

Place chords in square brackets `[C]` immediately before the word or syllable they apply to:

```
[C]Amazing [F]grace, how [C]sweet the sound
That [Am]saved a [G]wretch like [C]me
```

This will display as:
```
 C        F          C
Amazing grace, how sweet the sound
     Am      G            C
That saved a wretch like me
```

### Importing Sample Songs

1. Click the "Import" button
2. Copy the contents of `sample-songs.json`
3. Paste into the import dialog
4. Click "Import"

### Exporting Your Songbook

Click the "Export" button to download all your songs as a JSON file. This file can be:
- Backed up for safekeeping
- Shared with others
- Imported into another browser or device

## Installation

This is a static web application with no build process or dependencies required.

### Option 1: GitHub Pages (Recommended)

The app is hosted on GitHub Pages and ready to use at the URL above.

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/virzen/songbook.git
   cd songbook
   ```

2. Open `index.html` in your web browser, or serve it with a local web server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server
   ```

3. Open `http://localhost:8000` in your browser

## Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks or build tools required
- **Local Storage**: All data is stored in the browser's localStorage
- **No Backend**: Completely client-side application
- **Print Optimized**: CSS print styles for clean printed output

## Browser Compatibility

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- LocalStorage API

## Privacy

All data is stored locally in your browser. No data is sent to any server. Your songs never leave your device unless you explicitly export them.

## License

MIT License - feel free to use and modify as needed.
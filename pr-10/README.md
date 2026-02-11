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

This application is built with [Astro](https://astro.build/) and generates a static website that can be deployed anywhere.

### Option 1: GitHub Pages (Recommended)

The app is hosted on GitHub Pages and ready to use at the URL above.

### Option 2: Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/virzen/songbook.git
   cd songbook
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:4321` in your browser

### Building for Production

```bash
# Build the static site
npm run build

# Preview the production build
npm run preview
```

The built files will be in the `dist/` directory and can be deployed to any static hosting service.

## Testing

The application has a comprehensive E2E test suite using Playwright covering all features from a user perspective, including visual snapshot tests for UI regression detection.

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with browser UI visible
npm run test:headed

# Run tests in interactive mode
npm run test:ui
```

See [tests/README.md](tests/README.md) for more information about the test suite.

## Technical Details

- **Astro**: Modern static site generator with optimal performance
- **Static Output**: Fully pre-rendered HTML for fast page loads
- **Client-Side Interactivity**: JavaScript runs in the browser for dynamic features
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
// Songbook App
class SongbookApp {
    constructor() {
        this.songs = [];
        this.currentSongId = null;
        this.editingSongId = null;
        this.init();
    }

    async init() {
        await this.loadFromStorage();
        this.setupEventListeners();
        this.renderSongList();
    }

    // Local Storage
    async loadFromStorage() {
        const stored = localStorage.getItem('songbook');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.songs = data.songs || [];
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
        }
        
        // If no songs loaded, initialize with sample songs
        if (this.songs.length === 0) {
            await this.loadSampleSongs();
        }
    }
    
    async loadSampleSongs() {
        try {
            const response = await fetch('sample-songs.json');
            if (response.ok) {
                const data = await response.json();
                if (data.songs && Array.isArray(data.songs)) {
                    this.songs = data.songs;
                    this.saveToStorage();
                }
            }
        } catch (e) {
            console.error('Error loading sample songs:', e);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem('songbook', JSON.stringify({ songs: this.songs }));
        } catch (e) {
            console.error('Error saving to storage:', e);
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Header buttons
        document.getElementById('addSongBtn').addEventListener('click', () => this.showAddSong());
        document.getElementById('importBtn').addEventListener('click', () => this.showImportModal());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportSongs());

        // Song list
        document.getElementById('searchInput').addEventListener('input', (e) => this.filterSongs(e.target.value));

        // Song display
        document.getElementById('backToListBtn').addEventListener('click', () => this.showSongList());
        document.getElementById('editSongBtn').addEventListener('click', () => this.editCurrentSong());
        document.getElementById('printSongBtn').addEventListener('click', () => window.print());
        document.getElementById('deleteSongBtn').addEventListener('click', () => this.deleteCurrentSong());

        // Song edit
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            if (this.currentSongId) {
                this.showSong(this.currentSongId);
            } else {
                this.showSongList();
            }
        });
        document.getElementById('saveSongBtn').addEventListener('click', () => this.saveSong());

        // Import modal
        document.getElementById('cancelImportBtn').addEventListener('click', () => this.hideImportModal());
        document.getElementById('confirmImportBtn').addEventListener('click', () => this.importSongs());
    }

    // View Management
    showView(viewId) {
        document.querySelectorAll('.view').forEach(view => {
            view.style.display = 'none';
        });
        document.getElementById(viewId).style.display = 'block';
    }

    showSongList() {
        this.currentSongId = null;
        this.editingSongId = null;
        this.showView('songListView');
        this.renderSongList();
    }

    showSong(songId) {
        this.currentSongId = songId;
        this.showView('songDisplayView');
        this.renderSong(songId);
    }

    showAddSong() {
        this.currentSongId = null;
        this.editingSongId = null;
        this.showView('songEditView');
        document.getElementById('songForm').reset();
    }

    editCurrentSong() {
        if (!this.currentSongId) return;
        this.editingSongId = this.currentSongId;
        this.showView('songEditView');
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (song) {
            document.getElementById('songTitle').value = song.title;
            document.getElementById('songArtist').value = song.artist || '';
            document.getElementById('songLyrics').value = song.lyrics;
        }
    }

    // Song Management
    saveSong() {
        const title = document.getElementById('songTitle').value.trim();
        const artist = document.getElementById('songArtist').value.trim();
        const lyrics = document.getElementById('songLyrics').value;

        if (!title || !lyrics) {
            alert('Please enter a title and lyrics');
            return;
        }

        if (this.editingSongId) {
            // Update existing song
            const song = this.songs.find(s => s.id === this.editingSongId);
            if (song) {
                song.title = title;
                song.artist = artist;
                song.lyrics = lyrics;
                song.updatedAt = new Date().toISOString();
            }
            this.saveToStorage();
            this.showSong(this.editingSongId);
        } else {
            // Add new song
            const newSong = {
                id: Date.now().toString(),
                title,
                artist,
                lyrics,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.songs.push(newSong);
            this.saveToStorage();
            this.showSong(newSong.id);
        }
    }

    deleteCurrentSong() {
        if (!this.currentSongId) return;
        
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (!song) return;

        if (confirm(`Delete "${song.title}"?`)) {
            this.songs = this.songs.filter(s => s.id !== this.currentSongId);
            this.saveToStorage();
            this.showSongList();
        }
    }

    // Rendering
    renderSongList() {
        const listEl = document.getElementById('songList');
        const emptyEl = document.getElementById('emptySongList');

        if (this.songs.length === 0) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            return;
        }

        emptyEl.style.display = 'none';
        const sorted = [...this.songs].sort((a, b) => a.title.localeCompare(b.title));
        
        listEl.innerHTML = sorted.map(song => `
            <div class="song-card" onclick="app.showSong('${song.id}')">
                <h3>${this.escapeHtml(song.title)}</h3>
                <p>${this.escapeHtml(song.artist || 'Unknown Artist')}</p>
            </div>
        `).join('');
    }

    filterSongs(query) {
        const listEl = document.getElementById('songList');
        const emptyEl = document.getElementById('emptySongList');
        
        const filtered = this.songs.filter(song => 
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            (song.artist && song.artist.toLowerCase().includes(query.toLowerCase()))
        );

        if (filtered.length === 0) {
            listEl.innerHTML = '';
            emptyEl.style.display = 'block';
            emptyEl.innerHTML = `<p>No songs found matching "${this.escapeHtml(query)}"</p>`;
            return;
        }

        emptyEl.style.display = 'none';
        const sorted = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        
        listEl.innerHTML = sorted.map(song => `
            <div class="song-card" onclick="app.showSong('${song.id}')">
                <h3>${this.escapeHtml(song.title)}</h3>
                <p>${this.escapeHtml(song.artist || 'Unknown Artist')}</p>
            </div>
        `).join('');
    }

    renderSong(songId) {
        const song = this.songs.find(s => s.id === songId);
        if (!song) {
            this.showSongList();
            return;
        }

        const contentEl = document.getElementById('songContent');
        const formattedLyrics = this.formatLyrics(song.lyrics);
        
        contentEl.innerHTML = `
            <div class="song-header">
                <h2>${this.escapeHtml(song.title)}</h2>
                <div class="artist">${this.escapeHtml(song.artist || 'Unknown Artist')}</div>
            </div>
            <div class="song-lyrics">${formattedLyrics}</div>
        `;
    }

    formatLyrics(lyrics) {
        const lines = lyrics.split('\n');
        return lines.map(line => {
            if (!line.trim()) {
                return '<div class="lyrics-line">&nbsp;</div>';
            }
            
            const formatted = this.processChords(line);
            return `<div class="lyrics-line">${formatted}</div>`;
        }).join('');
    }

    processChords(line) {
        // Find all chords in brackets [C], [Am], etc.
        const chordRegex = /\[([^\]]+)\]/g;
        let result = '';
        let lastIndex = 0;
        let match;

        while ((match = chordRegex.exec(line)) !== null) {
            // Add text before the chord
            if (match.index > lastIndex) {
                result += this.escapeHtml(line.substring(lastIndex, match.index));
            }

            // Add the chord as a span with data attribute
            const chord = match[1];
            result += `<span class="chord" data-chord="${this.escapeHtml(chord)}">\u200B</span>`;
            lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < line.length) {
            result += this.escapeHtml(line.substring(lastIndex));
        }

        return result || '&nbsp;';
    }

    // Import/Export
    showImportModal() {
        document.getElementById('importModal').classList.add('active');
        document.getElementById('importData').value = '';
    }

    hideImportModal() {
        document.getElementById('importModal').classList.remove('active');
    }

    importSongs() {
        const data = document.getElementById('importData').value;
        if (!data.trim()) {
            alert('Please paste JSON data to import');
            return;
        }

        try {
            const parsed = JSON.parse(data);
            if (!parsed.songs || !Array.isArray(parsed.songs)) {
                throw new Error('Invalid format: missing songs array');
            }

            // Validate songs
            for (const song of parsed.songs) {
                if (!song.title || !song.lyrics) {
                    throw new Error('Invalid song format: missing title or lyrics');
                }
            }

            // Merge with existing songs (avoid duplicates by ID)
            const existingIds = new Set(this.songs.map(s => s.id));
            const newSongs = parsed.songs.filter(s => !existingIds.has(s.id));
            
            this.songs = [...this.songs, ...newSongs];
            this.saveToStorage();
            this.hideImportModal();
            this.showSongList();
            alert(`Imported ${newSongs.length} song(s)`);
        } catch (e) {
            alert(`Import failed: ${e.message}`);
        }
    }

    exportSongs() {
        const data = JSON.stringify({ songs: this.songs }, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `songbook-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app
const app = new SongbookApp();

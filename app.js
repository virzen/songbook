// Songbook App
class SongbookApp {
    constructor() {
        this.songs = [];
        this.currentSongId = null;
        this.editingSongId = null;
        this.supabaseClient = null;
        this.username = null;
        this.configured = false;
        this.init();
    }

    init() {
        this.setupConfigModal();
        this.setupEventListeners();
    }

    // Configuration Modal
    setupConfigModal() {
        // Check if in test mode (bypass configuration for testing)
        if (window.location.search.includes('testMode=true')) {
            // Skip configuration in test mode
            this.configured = true;
            this.supabaseClient = null; // No Supabase in test mode
            document.getElementById('configModal').classList.remove('active');
            this.loadFromStorage();
            this.renderSongList();
            return;
        }

        const configForm = document.getElementById('configForm');
        configForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleConfiguration();
        });
    }

    async handleConfiguration() {
        const supabaseUrl = document.getElementById('supabaseUrl').value.trim();
        const supabaseKey = document.getElementById('supabaseKey').value.trim();
        const username = document.getElementById('username').value.trim();

        if (!supabaseUrl || !supabaseKey || !username) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Initialize Supabase client
            this.supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
            this.username = username;

            // Test connection by trying to read from database
            const { error } = await this.loadFromDatabase();
            
            if (error) {
                throw new Error('Failed to connect to database: ' + error.message);
            }

            // Mark as configured and hide modal
            this.configured = true;
            document.getElementById('configModal').classList.remove('active');
            
            // Load songs and render
            this.renderSongList();
        } catch (error) {
            alert('Configuration failed: ' + error.message);
            console.error('Configuration error:', error);
        }
    }

    // Supabase Database Methods
    async loadFromDatabase() {
        try {
            const { data, error } = await this.supabaseClient
                .from('global_state')
                .select('state')
                .eq('username', this.username)
                .single();

            if (error) {
                // If no data found, it's not an error - just empty state
                if (error.code === 'PGRST116') {
                    this.songs = [];
                    return { error: null };
                }
                return { error };
            }

            if (data && data.state) {
                const parsed = JSON.parse(data.state);
                this.songs = parsed.songs || [];
            }

            return { error: null };
        } catch (e) {
            console.error('Error loading from database:', e);
            return { error: e };
        }
    }

    async saveToDatabase() {
        // In test mode, there's no Supabase client
        if (!this.supabaseClient) {
            return { error: null };
        }

        if (!this.configured) {
            throw new Error('Database not configured');
        }

        try {
            const stateData = JSON.stringify({ songs: this.songs });
            
            const { error } = await this.supabaseClient
                .from('global_state')
                .upsert({
                    username: this.username,
                    state: stateData
                }, {
                    onConflict: 'username'
                });

            if (error) {
                throw new Error('Database save failed: ' + error.message);
            }

            return { error: null };
        } catch (e) {
            console.error('Error saving to database:', e);
            throw e;
        }
    }

    // Local Storage (kept for backward compatibility)
    loadFromStorage() {
        const stored = localStorage.getItem('songbook');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.songs = data.songs || [];
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
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
        // Header title
        document.getElementById('mainTitle').addEventListener('click', () => this.showSongList());

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
        document.getElementById('deleteSongBtn').addEventListener('click', async () => await this.deleteCurrentSong());

        // Song edit
        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            if (this.currentSongId) {
                this.showSong(this.currentSongId);
            } else {
                this.showSongList();
            }
        });
        document.getElementById('saveSongBtn').addEventListener('click', async () => await this.saveSong());

        // Import modal
        document.getElementById('cancelImportBtn').addEventListener('click', () => this.hideImportModal());
        document.getElementById('confirmImportBtn').addEventListener('click', () => this.importSongs());
        document.getElementById('importFile').addEventListener('change', (e) => this.handleFileSelect(e));
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
    async saveSong() {
        const title = document.getElementById('songTitle').value.trim();
        const artist = document.getElementById('songArtist').value.trim();
        const lyrics = document.getElementById('songLyrics').value;

        if (!title || !lyrics) {
            alert('Please enter a title and lyrics');
            return;
        }

        try {
            if (this.editingSongId) {
                // Update existing song
                const song = this.songs.find(s => s.id === this.editingSongId);
                if (song) {
                    song.title = title;
                    song.artist = artist;
                    song.lyrics = lyrics;
                    song.updatedAt = new Date().toISOString();
                }
                
                // Save to database (errors will prevent save)
                await this.saveToDatabase();
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
                
                // Save to database (errors will prevent save)
                await this.saveToDatabase();
                this.saveToStorage();
                this.showSong(newSong.id);
            }
        } catch (error) {
            alert('Failed to save song: ' + error.message);
            console.error('Save error:', error);
            // Don't navigate away if save failed
        }
    }

    async deleteCurrentSong() {
        if (!this.currentSongId) return;
        
        const song = this.songs.find(s => s.id === this.currentSongId);
        if (!song) return;

        if (confirm(`Delete "${song.title}"?`)) {
            try {
                this.songs = this.songs.filter(s => s.id !== this.currentSongId);
                
                // Save to database
                await this.saveToDatabase();
                this.saveToStorage();
                this.showSongList();
            } catch (error) {
                alert('Failed to delete song: ' + error.message);
                console.error('Delete error:', error);
                // Restore the song if delete failed
                this.songs.push(song);
            }
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
        document.getElementById('importFile').value = '';
    }

    hideImportModal() {
        document.getElementById('importModal').classList.remove('active');
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            document.getElementById('importData').value = content;
        };
        reader.onerror = () => {
            alert(`Error reading file "${file.name}". Please ensure the file is a valid text file.`);
        };
        reader.readAsText(file, 'UTF-8');
    }

    importSongs() {
        const data = document.getElementById('importData').value;
        if (!data.trim()) {
            alert('Please select a file or paste JSON data to import');
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

/**
 * Discord Presence WebSocket Client using Lanyard API
 * Redesigned for jhtdesu.me style interface
 */

class DiscordPresence {
    constructor(userId) {
        this.userId = userId;
        this.wsUrl = 'wss://api.lanyard.rest/socket';
        this.ws = null;
        this.heartbeatInterval = null;
        this.reconnectTimeout = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        // DOM elements
        this.elements = {
            connectionStatus: document.getElementById('connectionStatus'),
            userAvatar: document.getElementById('userAvatar'),
            username: document.getElementById('username'),
            statusText: document.getElementById('statusText'),
            statusIndicator: document.getElementById('statusIndicator'),
            activitiesContainer: document.getElementById('activities')
        };
        
        this.init();
    }
    
    init() {
        this.connectWebSocket();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        window.addEventListener('online', () => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.connectWebSocket();
            }
        });
    }
    
    updateConnectionStatus(status, message) {
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.className = `connection-status ${status}`;
            this.elements.connectionStatus.textContent = message;
            this.elements.connectionStatus.style.display = 'block';
            
            // Auto hide success messages
            if (status === 'connected') {
                setTimeout(() => {
                    if (this.elements.connectionStatus) {
                        this.elements.connectionStatus.style.display = 'none';
                    }
                }, 3000);
            }
        }
    }
    
    connectWebSocket() {
        this.updateConnectionStatus('connecting', 'Connecting...');
        
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
                this.subscribeToUser();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };
            
            this.ws.onclose = (event) => {
                this.handleClose(event);
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.updateConnectionStatus('disconnected', 'Connection error');
            };
            
        } catch (error) {
            console.error('❌ Cannot create WebSocket:', error);
            this.updateConnectionStatus('disconnected', 'Cannot connect');
        }
    }
    
    subscribeToUser() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const subscribeMessage = {
                op: 2,
                d: {
                    subscribe_to_id: this.userId
                }
            };
            
            this.ws.send(JSON.stringify(subscribeMessage));
            console.log(`📡 Subscribed to user: ${this.userId}`);
        }
    }
    
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 Received:', data);
            
            switch(data.op) {
                case 1: // Hello
                    this.handleHello(data.d);
                    break;
                    
                case 0: // Event
                    this.handleEvent(data);
                    break;
            }
        } catch (error) {
            console.error('❌ JSON parse error:', error);
        }
    }
    
    handleHello(data) {
        this.updateConnectionStatus('connected', 'Connected!');
        
        if (data.heartbeat_interval) {
            this.startHeartbeat(data.heartbeat_interval);
        }
    }
    
    handleEvent(data) {
        if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
            this.updatePresence(data.d);
        }
    }
    
    startHeartbeat(interval) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 3 }));
                console.log('💓 Heartbeat sent');
            }
        }, interval);
        
        console.log(`💓 Heartbeat started: ${interval}ms`);
    }
    
    handleClose(event) {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        this.updateConnectionStatus('disconnected', 'Disconnected');
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        this.attemptReconnect();
    }
    
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            this.updateConnectionStatus(
                'connecting', 
                `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );
            
            this.reconnectTimeout = setTimeout(() => {
                this.connectWebSocket();
            }, delay);
        } else {
            this.updateConnectionStatus('disconnected', 'Connection failed');
        }
    }
    
    updatePresence(data) {
        console.log('🔄 Updating presence:', data);
        
        this.updateUserInfo(data.discord_user);
        this.updateStatus(data.discord_status);
        this.updateActivities(data.activities || []);
        this.updateSpotify(data.spotify);
    }
    
    updateUserInfo(user) {
        if (!user) return;
        
        if (this.elements.username) {
            // Remove underscores and show clean username
            const displayName = user.global_name || user.username;
            this.elements.username.textContent = displayName.replace(/_/g, '');
        }
        
        if (this.elements.userAvatar && user.avatar) {
            // Get avatar URL with proper size for better quality
            // Add timestamp to prevent caching issues
            const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith('a_') ? 'gif' : 'png'}?size=256&t=${Date.now()}`;
            
            this.elements.userAvatar.src = avatarUrl;
            this.elements.userAvatar.alt = `${user.username}'s avatar`;
            
            // Check for avatar decoration data (Discord profile effects/frames)
            const avatarContainer = this.elements.userAvatar.parentElement;
            if (user.avatar_decoration_data) {
                // User has a Discord decoration/frame
                avatarContainer.classList.add('has-discord-decoration');
                avatarContainer.setAttribute('data-decoration-id', user.avatar_decoration_data.asset);
                
                // Create decoration overlay if available
                if (user.avatar_decoration_data.asset) {
                    const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${user.avatar_decoration_data.asset}.png?size=240&passthrough=false`;
                    
                    // Remove old decoration if exists
                    const oldDecoration = avatarContainer.querySelector('.discord-decoration-overlay');
                    if (oldDecoration) oldDecoration.remove();
                    
                    // Create new decoration overlay
                    const decorationImg = document.createElement('img');
                    decorationImg.className = 'discord-decoration-overlay';
                    decorationImg.src = decorationUrl;
                    decorationImg.alt = 'Discord decoration';
                    avatarContainer.appendChild(decorationImg);
                }
            } else {
                // No decoration - show custom CSS effect
                avatarContainer.classList.remove('has-discord-decoration');
                const oldDecoration = avatarContainer.querySelector('.discord-decoration-overlay');
                if (oldDecoration) oldDecoration.remove();
            }
        }
    }
    
    updateStatus(status) {
        const statusMap = {
            'online': 'Online',
            'idle': 'Idle',
            'dnd': 'Do Not Disturb',
            'offline': 'Offline'
        };
        
        const currentStatus = status || 'offline';
        
        if (this.elements.statusIndicator) {
            this.elements.statusIndicator.className = `status-indicator ${currentStatus}`;
        }
        
        if (this.elements.statusText) {
            this.elements.statusText.textContent = statusMap[currentStatus] || 'Unknown';
            this.elements.statusText.className = `status-text ${currentStatus}`;
        }
    }
    
    updateActivities(activities) {
        if (!this.elements.activitiesContainer) return;
        
        this.elements.activitiesContainer.innerHTML = '';
        
        if (activities.length === 0) {
            return; // Don't show anything if no activities
        }
        
        activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            this.elements.activitiesContainer.appendChild(activityElement);
        });
    }
    
    createActivityElement(activity) {
        const activityDiv = document.createElement('div');
        activityDiv.className = activity.name === 'Spotify' ? 'activity spotify' : 'activity';
        
        let activityHTML = '';
        
        if (activity.name === 'Spotify') {
            activityHTML = `
                <div class="activity-name">🎵 Listening to Spotify</div>
                <div class="activity-details"><strong>${this.escapeHtml(activity.details || 'Unknown Track')}</strong></div>
                <div class="activity-state">by ${this.escapeHtml(activity.state || 'Unknown Artist')}</div>
            `;
        } else {
            activityHTML = `<div class="activity-name">${this.escapeHtml(activity.name)}</div>`;
            
            if (activity.details) {
                activityHTML += `<div class="activity-details">${this.escapeHtml(activity.details)}</div>`;
            }
            
            if (activity.state) {
                activityHTML += `<div class="activity-state">${this.escapeHtml(activity.state)}</div>`;
            }
        }
        
        activityDiv.innerHTML = activityHTML;
        return activityDiv;
    }
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    updateSpotify(spotify) {
        const spotifyActivity = document.getElementById('spotify-activity');
        
        if (!spotifyActivity) return;
        
        if (spotify && spotify.track_id) {
            // Show Spotify activity
            spotifyActivity.style.display = 'block';
            
            // Update album cover
            const albumImg = document.getElementById('spotify-album');
            if (albumImg && spotify.album_art_url) {
                albumImg.src = spotify.album_art_url;
            }
            
            // Update song name
            const songTitle = document.getElementById('spotify-song');
            if (songTitle) {
                songTitle.textContent = spotify.song || 'Unknown Track';
            }
            
            // Update artist
            const artistName = document.getElementById('spotify-artist');
            if (artistName) {
                artistName.textContent = `by ${spotify.artist || 'Unknown Artist'}`;
            }
            
            // Update progress bar and time
            this.updateSpotifyProgress(spotify);
            
            // Update Spotify link
            const spotifyLink = document.getElementById('spotify-link');
            if (spotifyLink && spotify.track_id) {
                spotifyLink.href = `https://open.spotify.com/track/${spotify.track_id}`;
            }
            
            console.log('🎵 Now playing:', spotify.song, 'by', spotify.artist);
        } else {
            // Hide Spotify activity
            spotifyActivity.style.display = 'none';
            console.log('🎵 Not playing Spotify');
        }
    }
    
    updateSpotifyProgress(spotify) {
        if (!spotify.timestamps) return;
        
        const now = Date.now();
        const start = spotify.timestamps.start;
        const end = spotify.timestamps.end;
        
        // Calculate current and total duration
        const currentMs = now - start;
        const totalMs = end - start;
        
        // Format time as M:SS
        const formatTime = (ms) => {
            const totalSeconds = Math.floor(ms / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            return `${minutes}:${seconds.toString().padStart(2, '0')}`;
        };
        
        // Update time displays
        const currentTime = document.getElementById('spotify-current');
        const durationTime = document.getElementById('spotify-duration');
        
        if (currentTime) {
            currentTime.textContent = formatTime(Math.max(0, currentMs));
        }
        
        if (durationTime) {
            durationTime.textContent = formatTime(totalMs);
        }
        
        // Update progress bar
        const progressBar = document.getElementById('spotify-bar-fill');
        if (progressBar) {
            const percentage = Math.min(100, Math.max(0, (currentMs / totalMs) * 100));
            progressBar.style.width = `${percentage}%`;
        }
    }
    
    cleanup() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        console.log('🧹 Cleaned up WebSocket');
    }
    
    reconnect() {
        this.cleanup();
        this.reconnectAttempts = 0;
        this.connectWebSocket();
    }
    
    getConnectionState() {
        if (!this.ws) return 'disconnected';
        
        switch(this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return 'connected';
            case WebSocket.CLOSING: return 'disconnecting';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }
}

// Export for global use
window.DiscordPresence = DiscordPresence;

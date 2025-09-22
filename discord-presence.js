/**
 * Discord Presence WebSocket Client using Lanyard API
 * Kết nối real-time với Discord thông qua Lanyard WebSocket
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
            discriminator: document.getElementById('discriminator'),
            statusContainer: document.getElementById('statusContainer'),
            statusText: document.getElementById('statusText'),
            activitiesContainer: document.getElementById('activities')
        };
        
        this.init();
    }
    
    /**
     * Khởi tạo kết nối WebSocket
     */
    init() {
        this.connectWebSocket();
        this.setupEventListeners();
    }
    
    /**
     * Thiết lập event listeners
     */
    setupEventListeners() {
        // Cleanup khi đóng trang
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Tự động reconnect khi online lại
        window.addEventListener('online', () => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                this.connectWebSocket();
            }
        });
    }
    
    /**
     * Cập nhật trạng thái kết nối
     */
    updateConnectionStatus(status, message) {
        if (this.elements.connectionStatus) {
            this.elements.connectionStatus.className = `connection-status ${status}`;
            this.elements.connectionStatus.textContent = message;
        }
    }
    
    /**
     * Kết nối WebSocket
     */
    connectWebSocket() {
        this.updateConnectionStatus('connecting', 'Đang kết nối với Discord...');
        
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket đã kết nối');
                this.reconnectAttempts = 0;
                
                // Đăng ký theo dõi user
                this.subscribeToUser();
            };
            
            this.ws.onmessage = (event) => {
                this.handleMessage(event);
            };
            
            this.ws.onclose = (event) => {
                this.handleClose(event);
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ Lỗi WebSocket:', error);
                this.updateConnectionStatus('disconnected', 'Lỗi kết nối');
            };
            
        } catch (error) {
            console.error('❌ Không thể tạo WebSocket:', error);
            this.updateConnectionStatus('disconnected', 'Không thể kết nối');
        }
    }
    
    /**
     * Đăng ký theo dõi user Discord
     */
    subscribeToUser() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const subscribeMessage = {
                op: 2,
                d: {
                    subscribe_to_id: this.userId
                }
            };
            
            this.ws.send(JSON.stringify(subscribeMessage));
            console.log(`📡 Đã đăng ký theo dõi user: ${this.userId}`);
        }
    }
    
    /**
     * Xử lý tin nhắn từ WebSocket
     */
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            console.log('📨 Nhận dữ liệu:', data);
            
            switch(data.op) {
                case 1: // Hello - khởi tạo kết nối
                    this.handleHello(data.d);
                    break;
                    
                case 0: // Event - sự kiện cập nhật
                    this.handleEvent(data);
                    break;
                    
                default:
                    console.log('📝 Tin nhắn không xác định:', data);
            }
        } catch (error) {
            console.error('❌ Lỗi parse JSON:', error);
        }
    }
    
    /**
     * Xử lý tin nhắn Hello từ server
     */
    handleHello(data) {
        this.updateConnectionStatus('connected', 'Đã kết nối với Discord! 🎉');
        
        // Bắt đầu heartbeat
        if (data.heartbeat_interval) {
            this.startHeartbeat(data.heartbeat_interval);
        }
    }
    
    /**
     * Xử lý các sự kiện cập nhật
     */
    handleEvent(data) {
        if (data.t === 'INIT_STATE' || data.t === 'PRESENCE_UPDATE') {
            this.updatePresence(data.d);
        }
    }
    
    /**
     * Bắt đầu heartbeat để duy trì kết nối
     */
    startHeartbeat(interval) {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ op: 3 }));
                console.log('💓 Heartbeat gửi');
            }
        }, interval);
        
        console.log(`💓 Heartbeat bắt đầu với interval: ${interval}ms`);
    }
    
    /**
     * Xử lý khi WebSocket đóng
     */
    handleClose(event) {
        console.log('🔌 WebSocket đã đóng:', event.code, event.reason);
        this.updateConnectionStatus('disconnected', 'Mất kết nối với Discord');
        
        // Dọn dẹp heartbeat
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        // Thử reconnect
        this.attemptReconnect();
    }
    
    /**
     * Thử kết nối lại
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            this.updateConnectionStatus(
                'connecting', 
                `Đang thử kết nối lại sau ${delay/1000}s... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );
            
            this.reconnectTimeout = setTimeout(() => {
                this.connectWebSocket();
            }, delay);
        } else {
            this.updateConnectionStatus('disconnected', 'Không thể kết nối lại sau nhiều lần thử');
        }
    }
    
    /**
     * Cập nhật thông tin presence
     */
    updatePresence(data) {
        console.log('🔄 Cập nhật presence:', data);
        
        // Cập nhật thông tin user
        this.updateUserInfo(data.discord_user);
        
        // Cập nhật trạng thái
        this.updateStatus(data.discord_status);
        
        // Cập nhật hoạt động
        this.updateActivities(data.activities || []);
    }
    
    /**
     * Cập nhật thông tin user
     */
    updateUserInfo(user) {
        if (!user) return;
        
        if (this.elements.username) {
            this.elements.username.textContent = user.global_name || user.username;
        }
        
        if (this.elements.discriminator) {
            this.elements.discriminator.textContent = 
                user.discriminator !== '0' ? `#${user.discriminator}` : '';
        }
        
        if (this.elements.userAvatar && user.avatar) {
            this.elements.userAvatar.src = 
                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
            this.elements.userAvatar.alt = `${user.username}'s avatar`;
        }
    }
    
    /**
     * Cập nhật trạng thái online
     */
    updateStatus(status) {
        const statusMap = {
            'online': 'Trực tuyến',
            'idle': 'Vắng mặt',
            'dnd': 'Không làm phiền',
            'offline': 'Ngoại tuyến'
        };
        
        const currentStatus = status || 'offline';
        
        if (this.elements.statusContainer) {
            this.elements.statusContainer.className = `status ${currentStatus}`;
        }
        
        if (this.elements.statusText) {
            this.elements.statusText.textContent = statusMap[currentStatus] || 'Không xác định';
        }
    }
    
    /**
     * Cập nhật hoạt động
     */
    updateActivities(activities) {
        if (!this.elements.activitiesContainer) return;
        
        this.elements.activitiesContainer.innerHTML = '';
        
        if (activities.length === 0) {
            this.elements.activitiesContainer.innerHTML = 
                '<div class="activity"><div class="activity-name">Không có hoạt động nào</div></div>';
            return;
        }
        
        activities.forEach(activity => {
            const activityElement = this.createActivityElement(activity);
            this.elements.activitiesContainer.appendChild(activityElement);
        });
    }
    
    /**
     * Tạo element cho hoạt động
     */
    createActivityElement(activity) {
        const activityDiv = document.createElement('div');
        activityDiv.className = activity.name === 'Spotify' ? 'activity spotify' : 'activity';
        
        let activityHTML = `<div class="activity-name">${this.escapeHtml(activity.name)}</div>`;
        
        // Xử lý đặc biệt cho Spotify
        if (activity.name === 'Spotify') {
            activityHTML = `
                <div class="activity-name">🎵 Đang nghe Spotify</div>
                <div class="activity-details"><strong>${this.escapeHtml(activity.details || 'Bài hát không xác định')}</strong></div>
                <div class="activity-state">của ${this.escapeHtml(activity.state || 'Nghệ sĩ không xác định')}</div>
            `;
        } else {
            // Các hoạt động khác
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
    
    /**
     * Escape HTML để tránh XSS
     */
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * Dọn dẹp khi đóng
     */
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
        
        console.log('🧹 Đã dọn dẹp WebSocket');
    }
    
    /**
     * Kết nối lại thủ công
     */
    reconnect() {
        this.cleanup();
        this.reconnectAttempts = 0;
        this.connectWebSocket();
    }
    
    /**
     * Lấy trạng thái kết nối hiện tại
     */
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

// Export cho sử dụng global
window.DiscordPresence = DiscordPresence;

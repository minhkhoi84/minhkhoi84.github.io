/**
 * Simple Character Follow Mouse
 * Một nhân vật PNG đơn giản chạy theo chuột
 * Dễ dàng thay đổi ảnh và tùy chỉnh
 */

class SimpleCharacter {
    constructor(options = {}) {
        // Cấu hình mặc định
        this.config = {
            imagePath: options.imagePath || '/assets/images/image-2.png',
            width: options.width || 156,      // Chiều rộng ảnh
            height: options.height || 62,     // Chiều cao ảnh
            speed: options.speed || 0.08,     // Tốc độ di chuyển (0-1, càng nhỏ càng mượt)
            delay: options.delay || 300       // Độ trễ trước khi bắt đầu di chuyển (ms)
        };

        // Vị trí hiện tại
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        
        // Vị trí đích (nơi chuột đang ở)
        this.targetX = this.x;
        this.targetY = this.y;
        
        // Trạng thái
        this.isMoving = false;
        this.facingRight = true;
        this.lastMouseTime = Date.now();
        
        this.init();
    }

    init() {
        // Tạo element cho nhân vật
        this.element = document.createElement('div');
        this.element.className = 'simple-character';
        this.element.style.width = this.config.width + 'px';
        this.element.style.height = this.config.height + 'px';
        
        // Tạo img tag
        this.img = document.createElement('img');
        this.img.src = this.config.imagePath;
        this.img.alt = 'Character';
        this.img.style.width = '100%';
        this.img.style.height = '100%';
        this.img.style.objectFit = 'contain'; // Giữ nguyên tỷ lệ, không bị cắt
        
        this.element.appendChild(this.img);
        document.body.appendChild(this.element);
        
        // Set vị trí ban đầu
        this.updatePosition();
        
        // Lắng nghe sự kiện di chuột
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        
        // Bắt đầu vòng lặp animation
        this.animate();
    }

    onMouseMove(e) {
        // Cập nhật vị trí đích (trừ đi nửa kích thước để center)
        this.targetX = e.clientX - (this.config.width / 2);
        this.targetY = e.clientY - (this.config.height / 2);
        
        // Lưu thời gian di chuột
        this.lastMouseTime = Date.now();
    }

    updatePosition() {
        // Cập nhật vị trí trên DOM
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
    }

    updateDirection() {
        // Tính hướng di chuyển
        const deltaX = this.targetX - this.x;
        
        // Chỉ đổi hướng khi có di chuyển đáng kể
        if (Math.abs(deltaX) > 5) {
            const shouldFaceRight = deltaX > 0;
            
            if (shouldFaceRight !== this.facingRight) {
                this.facingRight = shouldFaceRight;
                
                // Flip ảnh bằng CSS transform
                if (this.facingRight) {
                    this.img.style.transform = 'scaleX(1)';
                } else {
                    this.img.style.transform = 'scaleX(-1)';
                }
            }
        }
    }

    animate() {
        // Kiểm tra độ trễ
        const timeSinceMouseMove = Date.now() - this.lastMouseTime;
        const canMove = timeSinceMouseMove >= this.config.delay;
        
        // Tính khoảng cách đến đích
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Chỉ di chuyển nếu đủ điều kiện
        if (distance > 2 && canMove) {
            // Di chuyển mượt mà (interpolation)
            this.x += dx * this.config.speed;
            this.y += dy * this.config.speed;
            
            // Cập nhật hướng
            this.updateDirection();
            
            this.isMoving = true;
        } else {
            this.isMoving = false;
        }
        
        // Cập nhật vị trí
        this.updatePosition();
        
        // Tiếp tục vòng lặp
        requestAnimationFrame(() => this.animate());
    }

    // ===== PUBLIC METHODS - Dễ dàng tùy chỉnh =====
    
    // Thay đổi ảnh
    changeImage(imagePath) {
        this.img.src = imagePath;
    }
    
    // Thay đổi kích thước
    setSize(width, height) {
        this.config.width = width;
        this.config.height = height;
        this.element.style.width = width + 'px';
        this.element.style.height = height + 'px';
    }
    
    // Thay đổi tốc độ
    setSpeed(speed) {
        this.config.speed = Math.max(0.01, Math.min(1, speed));
    }
    
    // Thay đổi độ trễ
    setDelay(delay) {
        this.config.delay = Math.max(0, delay);
    }
    
    // Ẩn/hiện nhân vật
    hide() {
        this.element.style.display = 'none';
    }
    
    show() {
        this.element.style.display = 'block';
    }
}

// ===== KHỞI TẠO =====
// Tự động khởi tạo khi trang load xong
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCharacter);
} else {
    initCharacter();
}

function initCharacter() {
    // Tạo nhân vật với cấu hình tùy chỉnh
    window.character = new SimpleCharacter({
        imagePath: '/assets/images/image-2.png',  // Đường dẫn ảnh
        width: 156,                                 // Chiều rộng
        height: 62,                                 // Chiều cao
        speed: 0.08,                                // Tốc độ (0.01 - 1)
        delay: 100                                  // Độ trễ (ms)
    });
    
    // Ví dụ sử dụng các method (optional):
    // character.setSpeed(0.15);           // Di chuyển nhanh hơn
    // character.setDelay(500);            // Tăng độ trễ
    // character.changeImage('/new.png');  // Đổi ảnh khác
}


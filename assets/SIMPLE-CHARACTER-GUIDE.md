# 🎮 Simple Character - Hướng dẫn sử dụng

## ✨ Tính năng

- ✅ Nhân vật di chuyển mượt mà theo chuột
- ✅ Không bị cắt ảnh, luôn hiển thị đầy đủ
- ✅ Tự động flip hướng trái/phải
- ✅ Dễ dàng thay đổi ảnh
- ✅ Code gọn gàng, dễ hiểu

## 📦 Cài đặt

### 1. HTML
```html
<!-- Không cần thêm element, JS sẽ tự tạo -->
<script src="/assets/simple-character.js"></script>
```

### 2. CSS
```css
/* Đã có trong styles.css */
.simple-character { ... }
```

## 🎨 Tùy chỉnh

### Thay đổi ảnh
```javascript
// Trong file simple-character.js, dòng 190:
window.character = new SimpleCharacter({
    imagePath: '/assets/images/your-image.png',  // ⬅️ Đổi đường dẫn
    width: 156,
    height: 62,
    speed: 0.08,
    delay: 100
});
```

### Thay đổi kích thước
```javascript
window.character = new SimpleCharacter({
    width: 200,   // ⬅️ Chiều rộng mới
    height: 100,  // ⬅️ Chiều cao mới
    // ...
});
```

### Thay đổi tốc độ
```javascript
// Tốc độ di chuyển (0.01 - 1)
// Càng nhỏ = càng mượt nhưng chậm
// Càng lớn = càng nhanh
speed: 0.08  // Mặc định
speed: 0.15  // Nhanh hơn
speed: 0.05  // Chậm hơn, mượt hơn
```

### Thay đổi độ trễ
```javascript
// Thời gian chờ trước khi nhân vật bắt đầu di chuyển (ms)
delay: 100   // Mặc định - 0.1 giây
delay: 500   // 0.5 giây
delay: 0     // Không có độ trễ
```

## 🔧 Sử dụng nâng cao

### Thay đổi ảnh động (Runtime)
```javascript
// Trong console hoặc script khác:
character.changeImage('/new-character.png');
```

### Thay đổi kích thước động
```javascript
character.setSize(200, 100);
```

### Thay đổi tốc độ động
```javascript
character.setSpeed(0.15);  // Nhanh hơn
```

### Thay đổi độ trễ động
```javascript
character.setDelay(500);  // Tăng độ trễ
```

### Ẩn/hiện nhân vật
```javascript
character.hide();  // Ẩn
character.show();  // Hiện
```

## 📝 Ví dụ thực tế

### Ví dụ 1: Character chibi 156x62
```javascript
new SimpleCharacter({
    imagePath: '/images/chibi.png',
    width: 156,
    height: 62,
    speed: 0.08,
    delay: 100
});
```

### Ví dụ 2: Character lớn hơn, di chuyển nhanh
```javascript
new SimpleCharacter({
    imagePath: '/images/big-character.png',
    width: 200,
    height: 150,
    speed: 0.15,  // Nhanh hơn
    delay: 50     // Phản ứng nhanh hơn
});
```

### Ví dụ 3: Character nhỏ, di chuyển chậm rãi
```javascript
new SimpleCharacter({
    imagePath: '/images/mini.png',
    width: 64,
    height: 64,
    speed: 0.05,  // Rất mượt
    delay: 300    // Độ trễ lâu hơn
});
```

## 🎯 Tips

1. **Ảnh PNG trong suốt** sẽ đẹp nhất
2. **Tỷ lệ ảnh** nên giữ đúng để không bị méo
3. **Speed 0.08** là tốc độ cân bằng tốt
4. **Delay 100ms** cho cảm giác tự nhiên
5. Ảnh **không quá lớn** để tránh che UI

## 📱 Responsive

Character tự động ẩn trên màn hình < 768px (mobile/tablet)

## 🐛 Troubleshooting

**Ảnh không hiển thị?**
- Kiểm tra đường dẫn `imagePath`
- Kiểm tra file ảnh có tồn tại không

**Ảnh bị cắt?**
- Kiểm tra `width` và `height` có đúng với ảnh không
- Dùng `object-fit: contain` (đã có sẵn)

**Di chuyển không mượt?**
- Giảm `speed` xuống (ví dụ: 0.05)
- Tăng `delay` lên một chút

**Ảnh bị lật ngược?**
- Flip logic tự động, không cần chỉnh
- Nếu cần đổi hướng mặc định, sửa `facingRight` trong code


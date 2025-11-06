# 📚 Hướng Dẫn Sử Dụng CSS Classes

## 🎨 CSS Variables (Biến CSS)

Thay vì viết giá trị cứng, dùng biến để dễ thay đổi:

```css
/* ❌ Cách cũ */
color: #9B5CFF;
padding: 20px;

/* ✅ Cách mới */
color: var(--color-primary);
padding: var(--space-lg);
```

### 📋 Danh Sách Biến:

#### Colors (Màu sắc):
- `--color-primary` - Tím chủ đạo (#9B5CFF)
- `--color-primary-dark` - Tím đậm (#7c3aed)
- `--color-primary-light` - Tím nhạt (#b37fff)
- `--color-text-main` - Chữ chính (#DADADA)
- `--color-text-secondary` - Chữ phụ (#b3b3b3)
- `--color-bg-card` - Nền card
- `--color-spotify` - Xanh Spotify (#1DB954)

#### Spacing (Khoảng cách):
- `--space-xs` - 5px
- `--space-sm` - 10px
- `--space-md` - 15px
- `--space-lg` - 20px
- `--space-xl` - 30px

#### Border Radius (Bo góc):
- `--radius-sm` - 8px
- `--radius-md` - 12px
- `--radius-lg` - 16px

#### Transitions (Hiệu ứng):
- `--transition-fast` - 0.2s
- `--transition-normal` - 0.3s
- `--transition-slow` - 0.5s

#### Shadows (Bóng đổ):
- `--shadow-sm` - Bóng nhỏ
- `--shadow-md` - Bóng vừa
- `--shadow-lg` - Bóng lớn
- `--shadow-purple-glow` - Ánh sáng tím

---

## 🔧 Utility Classes (Class Tiện Ích)

### Layout Classes:

#### `.flex-center`
Căn giữa nội dung theo cả 2 chiều:
```html
<div class="flex-center">
    <p>Nội dung được căn giữa</p>
</div>
```

#### `.flex-column`
Xếp nội dung theo cột:
```html
<div class="flex-column">
    <p>Item 1</p>
    <p>Item 2</p>
</div>
```

#### `.text-center`
Căn giữa chữ:
```html
<h1 class="text-center">Tiêu đề căn giữa</h1>
```

### Component Classes:

#### `.card`
Card cơ bản với border tím và hover effect:
```html
<div class="card">
    <h3>Card Title</h3>
    <p>Card content</p>
</div>
```

**Tự động có:**
- Background mờ
- Border tím
- Bo góc 16px
- Hiệu ứng hover (nổi lên + đổi màu)
- Backdrop blur

#### `.section-title`
Tiêu đề section chuẩn:
```html
<h2 class="section-title">Tiêu Đề Section</h2>
```

**Tự động có:**
- Font size 1.8rem
- Màu chữ #DADADA
- Margin bottom 25px
- Font weight 700

#### `.grid-responsive`
Grid layout responsive:
```html
<div class="grid-responsive grid-2">
    <div class="card">Item 1</div>
    <div class="card">Item 2</div>
</div>
```

**Options:**
- `.grid-2` - 2 cột trên desktop
- Tự động 1 cột trên mobile

---

## 💡 Ví Dụ Sử Dụng

### Tạo Section Mới:

```html
<!-- HTML -->
<section class="my-section text-center">
    <h2 class="section-title">My New Section</h2>
    <div class="grid-responsive grid-2">
        <article class="card">
            <h3>Card 1</h3>
            <p>Content here</p>
        </article>
        <article class="card">
            <h3>Card 2</h3>
            <p>Content here</p>
        </article>
    </div>
</section>

<!-- CSS (chỉ cần thêm style riêng) -->
<style>
.my-section {
    margin: var(--space-xl) 0;
}
</style>
```

### Tạo Button Mới:

```html
<!-- HTML -->
<button class="btn-custom">Click Me</button>

<!-- CSS -->
<style>
.btn-custom {
    background: var(--color-primary);
    color: white;
    padding: var(--space-md) var(--space-lg);
    border: none;
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
}

.btn-custom:hover {
    background: var(--color-primary-dark);
    box-shadow: var(--shadow-md);
}
</style>
```

### Tạo Card Tùy Chỉnh:

```html
<!-- Kế thừa từ .card và thêm style riêng -->
<div class="card my-custom-card">
    <h3>Custom Card</h3>
</div>

<style>
.my-custom-card {
    /* Đã có: background, border, padding, hover từ .card */
    /* Chỉ cần thêm style riêng: */
    border-color: var(--color-spotify);
}

.my-custom-card:hover {
    border-color: var(--color-spotify-hover);
}
</style>
```

---

## 🎯 Lợi Ích Của Cách Tổ Chức Mới

### 1. **Dễ Thay Đổi Màu Sắc**
Chỉ cần đổi 1 chỗ trong `:root`:
```css
:root {
    --color-primary: #FF0080; /* Đổi từ tím sang hồng */
}
```
→ Toàn bộ website đổi màu!

### 2. **Code Ngắn Gọn Hơn**
```html
<!-- ❌ Cách cũ -->
<div class="playlist-section">
    <h2 class="playlist-title">Title</h2>
    <div class="playlist-grid">
        <div class="playlist-card">...</div>
    </div>
</div>

<!-- ✅ Cách mới -->
<section class="text-center">
    <h2 class="section-title">Title</h2>
    <div class="grid-responsive grid-2">
        <article class="card">...</article>
    </div>
</section>
```

### 3. **Dễ Tái Sử Dụng**
Class `.card` có thể dùng cho:
- Playlist cards
- Profile cards
- Social cards
- Bất kỳ card nào khác!

### 4. **Dễ Maintain**
Muốn đổi shadow cho tất cả cards? Chỉ cần sửa `--shadow-md`!

---

## 📝 Quy Tắc Đặt Tên

1. **Utility classes**: `flex-center`, `text-center`
2. **Component classes**: `card`, `section-title`
3. **Specific classes**: `playlist-card`, `spotify-activity`
4. **Variables**: `--color-primary`, `--space-lg`

---

## 🚀 Cách Thêm Phần Mới

1. Dùng HTML semantic: `<section>`, `<article>`, `<header>`
2. Dùng utility classes có sẵn: `.card`, `.grid-responsive`
3. Chỉ viết CSS mới cho style đặc biệt
4. Dùng CSS variables cho màu/spacing

**Happy Coding! 🎨✨**


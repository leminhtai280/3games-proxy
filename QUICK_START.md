# Hướng dẫn sử dụng nhanh

## 🚀 Website đã sẵn sàng!

Website với chức năng đăng ký người dùng, nạp tiền và admin panel đã được tạo thành công và đang chạy.

### 📍 Truy cập website:
- **Frontend (React)**: http://localhost:3000
- **Backend API**: http://localhost:5000

### 👤 Tài khoản Admin:
- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@example.com`

### 🔧 Các tính năng chính:

#### Cho người dùng thường:
1. **Đăng ký tài khoản mới** - Tạo tài khoản với thông tin cá nhân
2. **Đăng nhập** - Sử dụng username/email và mật khẩu
3. **Dashboard** - Xem thông tin tài khoản, số dư, thống kê
4. **Nạp tiền** - Tạo yêu cầu nạp tiền với nhiều phương thức thanh toán
5. **Lịch sử giao dịch** - Xem các giao dịch đã thực hiện
6. **Cập nhật thông tin** - Chỉnh sửa thông tin cá nhân

#### Cho Admin:
1. **Admin Dashboard** - Thống kê tổng quan hệ thống
2. **Quản lý người dùng** - Xem, cập nhật, khóa/mở khóa tài khoản
3. **Quản lý giao dịch** - Xử lý các yêu cầu nạp tiền
4. **Báo cáo doanh thu** - Theo dõi thu nhập

### 🛠️ Công nghệ sử dụng:

**Backend:**
- Node.js + Express.js
- MongoDB với Mongoose
- JWT Authentication
- bcryptjs cho mã hóa mật khẩu
- express-validator cho validation

**Frontend:**
- React.js
- Material-UI (MUI) cho giao diện đẹp
- React Router cho navigation
- Axios cho API calls
- React Toastify cho notifications

### 📱 Giao diện:
- **Responsive design** - Hoạt động tốt trên desktop và mobile
- **Material Design** - Giao diện hiện đại và thân thiện
- **Dark/Light theme** - Hỗ trợ chế độ tối/sáng
- **Intuitive navigation** - Dễ dàng điều hướng

### 🔒 Bảo mật:
- Mật khẩu được mã hóa bằng bcryptjs
- JWT tokens cho authentication
- Input validation đầy đủ
- CORS được cấu hình
- Environment variables cho sensitive data

### 🚀 Cách sử dụng:

1. **Đăng nhập với tài khoản admin:**
   - Vào http://localhost:3000
   - Click "Đăng nhập"
   - Nhập: username: `admin`, password: `admin123`

2. **Tạo tài khoản người dùng mới:**
   - Click "Đăng ký"
   - Điền thông tin cá nhân
   - Tạo tài khoản

3. **Nạp tiền:**
   - Đăng nhập với tài khoản người dùng
   - Vào Dashboard
   - Click "Nạp tiền"
   - Chọn số tiền và phương thức thanh toán

4. **Xử lý giao dịch (Admin):**
   - Đăng nhập với tài khoản admin
   - Vào "Quản lý giao dịch"
   - Xem và xử lý các yêu cầu nạp tiền

### 📊 API Endpoints:

**Authentication:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user

**User Management:**
- `PUT /api/users/profile` - Cập nhật thông tin
- `PUT /api/users/password` - Đổi mật khẩu
- `GET /api/users/balance` - Lấy số dư

**Payments:**
- `POST /api/payments/create` - Tạo yêu cầu nạp tiền
- `GET /api/payments/my-payments` - Lịch sử giao dịch
- `PUT /api/payments/:id/process` - Xử lý giao dịch (Admin)

### 🎯 Tính năng nổi bật:

✅ **Đăng ký/Đăng nhập hoàn chỉnh**
✅ **Dashboard với thống kê real-time**
✅ **Hệ thống nạp tiền với nhiều phương thức**
✅ **Admin panel với quyền quản lý đầy đủ**
✅ **Giao diện responsive và đẹp mắt**
✅ **Bảo mật cao với JWT và mã hóa**
✅ **Validation đầy đủ cho tất cả input**
✅ **Error handling và user feedback**

### 🔧 Development:

**Chạy development mode:**
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

**Tạo admin user:**
```bash
npm run create-admin
```

**Build production:**
```bash
cd client && npm run build
npm start
```

---

🎉 **Website đã sẵn sàng sử dụng!** 

Truy cập http://localhost:3000 để bắt đầu trải nghiệm.
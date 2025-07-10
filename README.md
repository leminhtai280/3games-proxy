# Hệ thống quản lý người dùng và nạp tiền

Một website hoàn chỉnh với chức năng đăng ký người dùng, nạp tiền và admin panel được xây dựng bằng Node.js, Express, MongoDB và React.

## Tính năng

### Cho người dùng:
- ✅ Đăng ký tài khoản mới
- ✅ Đăng nhập/đăng xuất
- ✅ Xem thông tin tài khoản và số dư
- ✅ Tạo yêu cầu nạp tiền
- ✅ Xem lịch sử giao dịch
- ✅ Cập nhật thông tin cá nhân
- ✅ Đổi mật khẩu

### Cho Admin:
- ✅ Dashboard với thống kê tổng quan
- ✅ Quản lý người dùng (xem, cập nhật, khóa/mở khóa)
- ✅ Quản lý giao dịch (xem, xử lý, phê duyệt/từ chối)
- ✅ Xem báo cáo doanh thu

## Công nghệ sử dụng

### Backend:
- Node.js
- Express.js
- MongoDB với Mongoose
- JWT Authentication
- bcryptjs cho mã hóa mật khẩu
- express-validator cho validation

### Frontend:
- React.js
- Material-UI (MUI)
- React Router
- Axios cho API calls
- React Toastify cho notifications

## Cài đặt

### Yêu cầu hệ thống:
- Node.js (v14 trở lên)
- MongoDB
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd user-management-system
```

### Bước 2: Cài đặt dependencies
```bash
# Cài đặt backend dependencies
npm install

# Cài đặt frontend dependencies
cd client
npm install
cd ..
```

### Bước 3: Cấu hình MongoDB
Đảm bảo MongoDB đang chạy trên máy local hoặc cập nhật MONGODB_URI trong file `.env`

### Bước 4: Cấu hình environment variables
Tạo file `.env` trong thư mục gốc:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/user-management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Bước 5: Chạy ứng dụng

#### Development mode:
```bash
# Terminal 1: Chạy backend
npm run dev

# Terminal 2: Chạy frontend
cd client
npm start
```

#### Production mode:
```bash
# Build frontend
cd client
npm run build
cd ..

# Chạy production server
npm start
```

## Sử dụng

### Đăng ký tài khoản admin:
1. Đăng ký tài khoản thông thường
2. Vào MongoDB và cập nhật role thành "admin":
```javascript
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

### API Endpoints:

#### Authentication:
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

#### User Management:
- `PUT /api/users/profile` - Cập nhật thông tin cá nhân
- `PUT /api/users/password` - Đổi mật khẩu
- `GET /api/users/balance` - Lấy số dư

#### Payments:
- `POST /api/payments/create` - Tạo yêu cầu nạp tiền
- `GET /api/payments/my-payments` - Lấy lịch sử giao dịch
- `GET /api/payments/:id` - Lấy chi tiết giao dịch
- `PUT /api/payments/:id/upload-proof` - Upload chứng minh thanh toán

#### Admin:
- `GET /api/admin/dashboard` - Dashboard thống kê
- `GET /api/admin/users` - Danh sách người dùng
- `PUT /api/admin/users/:id` - Cập nhật người dùng
- `GET /api/admin/payments` - Danh sách giao dịch
- `PUT /api/payments/:id/process` - Xử lý giao dịch

## Cấu trúc thư mục

```
├── server.js              # Entry point của backend
├── package.json           # Backend dependencies
├── .env                   # Environment variables
├── models/                # MongoDB models
│   ├── User.js
│   └── Payment.js
├── routes/                # API routes
│   ├── auth.js
│   ├── users.js
│   ├── payments.js
│   └── admin.js
├── middleware/            # Custom middleware
│   └── auth.js
└── client/                # React frontend
    ├── package.json
    ├── public/
    └── src/
        ├── components/
        │   ├── auth/
        │   ├── dashboard/
        │   ├── admin/
        │   └── layout/
        ├── contexts/
        ├── services/
        └── App.js
```

## Bảo mật

- Mật khẩu được mã hóa bằng bcryptjs
- JWT tokens cho authentication
- Input validation với express-validator
- CORS được cấu hình
- Environment variables cho sensitive data

## Deployment

### Backend (Heroku/Netlify):
1. Tạo file `Procfile`:
```
web: node server.js
```

2. Cấu hình environment variables trên hosting platform

### Frontend (Netlify/Vercel):
1. Build project: `npm run build`
2. Deploy thư mục `build`

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License
# FoodCare AI - Frontend

FoodCare AI là một ứng dụng web thương mại điện tử thông minh kết hợp AI, chuyên cung cấp các thực đơn và gợi ý món ăn dinh dưỡng được cá nhân hóa theo thể trạng sức khỏe của người dùng.

Dự án được xây dựng với các công nghệ hiện đại nhất:
- **React + Vite**
- **Tailwind CSS v4** cho giao diện.
- **Framer Motion** cho các chuyển động mượt mà.

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu cầu
- Đã cài đặt Node.js
- Backend server đang chạy tại cổng `5000` (xem thư mục `backend`).

### Cài đặt và Khởi động
```bash
# Cài đặt dependencies
npm install

# Khởi động server dev
npm run dev
```

Sau khi chạy xong, hãy truy cập vào `http://localhost:5173` để trải nghiệm.

## 🔑 Tài Khoản Kiểm Thử

Tài khoản seed được cấu hình bằng các biến `SEED_ADMIN_*` và `SEED_USER_*`
trong file môi trường backend. Không lưu mật khẩu kiểm thử trong source code.

## 🧩 Tính năng nổi bật
- Giao diện Landing Page 3D cực kỳ sống động và hiện đại.
- **AI Chatbot:** Nhận diện nhu cầu dinh dưỡng (tiểu đường, giảm cân...) và gọi trực tiếp món ăn từ Database.
- Giỏ hàng & Thanh toán mượt mà.
- Admin Dashboard theo dõi doanh thu và trạng thái đơn hàng thời gian thực.

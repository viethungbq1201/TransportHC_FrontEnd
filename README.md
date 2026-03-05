# TransportHC Front-End
_A comprehensive Transport and Fleet Management System_

This project is the front-end application for the TransportHC system. It provides a modern, responsive, and role-based web interface for managing transportation schedules, trucks, users, inventory, and financial reports.

Đây là ứng dụng giao diện người dùng (front-end) cho hệ thống TransportHC. Nó cung cấp một giao diện web hiện đại, tương thích trên mọi thiết bị (responsive) và phân quyền chi tiết cho việc quản lý các chuyến xe, xe tải, người dùng, kho bãi và báo cáo tài chính.

---

## 🇬🇧 English Description

### Core Technologies
- **Framework:** React 18 + Vite
- **Routing:** React Router DOM (v6)
- **Styling:** Tailwind CSS + Radix UI Primitives (shadcn/ui inspired)
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **State & Data Fetching:** React Context API + Custom Hooks (`useAuth`, `usePermissions`) + Axios for API requests
- **Form Handling:** React Hook Form + Zod (Validation)
- **Notifications:** React Hot Toast + Sonner
- **Build Tool:** Vite

### Key Features
1. **Role-Based Access Control (RBAC):** Dynamic sidebar navigation and page routing based on user roles (`ADMIN`, `MANAGER`, `ACCOUNTANT`, `DRIVER`).
2. **Dashboard:** Real-time metrics overview including active trucks, schedules, pending transactions, revenue vs. costs charts, and schedule distribution.
3. **Fleet Management:** Complete CRUD interface for managing Trucks, Drivers, and Routes.
4. **Logistics & Inventory:** Tracking and management of Products, Categories, and current Warehouse Inventory.
5. **Operations:** Creation and approval flows for Schedules (chuyến xe) and business Transactions.
6. **Financials & Reports:** Management of operational Costs, Salary Reports for drivers, and detailed Revenue vs. Cost reporting over time.
7. **Responsive Design:** Fully optimized data tables and layouts for mobile devices.

### Directory Structure
```
src/
├── components/      # Reusable UI components (buttons, dialogs, tables, layout elements)
│   ├── layout/      # AppLayout structure containing the responsive Sidebar and Header Taskbar 
│   ├── ui/          # Radix UI primitives and complex UI elements (shadcn/ui components)
├── constants/       # Enums, standard status codes, and RBAC permission mappings 
├── context/         # React Context providers (AuthContext)
├── hooks/           # Custom React hooks (e.g., usePermissions, useDebounce)
├── pages/           # Route components for all application views (Dashboard, UserList, etc.)
├── services/        # Axios-based API client modules for interacting with the backend
├── utils/           # Helper functions (e.g., formatting dates, parsing currency, cn)
├── App.jsx          # Main application router and Providers wrapper
└── main.jsx         # React application entry point
```

### Setup & Development
1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Ensure `vite.config.js` proxy and `.env` contain the correct backend API URL.
   ```env
   VITE_API_BASE_URL=https://transporthc-backend.onrender.com
   ```
3. **Run Development Server:**
   ```bash
   npm run dev
   ```
4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 🇻🇳 Mô tả tiếng Việt

### Công nghệ Lõi
- **Framework:** React 18 + Vite
- **Định tuyến (Routing):** React Router DOM (v6)
- **Giao diện (Styling):** Tailwind CSS + Radix UI Primitives (dựa trên shadcn/ui)
- **Biểu tượng (Icons):** Lucide React
- **Trực quan hóa Dữ liệu (Biểu đồ):** Recharts
- **Quản lý Trạng thái & Lấy dữ liệu:** React Context API + Custom Hooks (`useAuth`, `usePermissions`) + Axios để gọi API
- **Xử lý Biểu mẫu (Forms):** React Hook Form + Zod (Ràng buộc dữ liệu)
- **Thông báo (Notifications):** React Hot Toast + Sonner
- **Công cụ Build:** Vite

### Các tính năng chính
1. **Phân quyền người dùng (RBAC):** Thanh điều hướng (sidebar) và quyền truy cập trang tự động hiển thị/ẩn dựa vào vai trò tài khoản (`ADMIN`, `MANAGER`, `ACCOUNTANT`, `DRIVER`).
2. **Bảng điều khiển (Dashboard):** Xem tổng quan các chỉ số theo thời gian thực (số xe khả dụng, chuyến xe đang chạy, doanh thu/chi phí) với biểu đồ trực quan.
3. **Quản lý Đội xe:** Giao diện CRUD (Thêm, Xóa, Sửa, Đọc) hoàn chỉnh cho Xe tải, Tài xế và Tuyến đường.
4. **Vận tải & Kho bãi:** Theo dõi, quản lý Danh mục sản phẩm, Sản phẩm và Tồn kho tại nhà kho.
5. **Vận hành (Operations):** Luồng tạo mới, giao việc và phê duyệt Lịch trình chuyến xe (Schedules) và Giao dịch kinh doanh (Transactions).
6. **Tài chính & Báo cáo:** Quản lý Chi phí vận hành, Báo cáo lương tài xế, và Báo cáo Doanh thu - Chi phí chi tiết theo thời gian.
7. **Thiết kế Responsive:** Bảng dữ liệu và giao diện tối ưu hóa cho màn hình điện thoại di động và máy tính bảng.

### Cấu trúc Thư mục
```
src/
├── components/      # Các thành phần giao diện tái sử dụng được (nút bấm, modal, bảng, bố cục)
│   ├── layout/      # Cấu trúc AppLayout chứa Thanh điều hướng (Sidebar) và Thanh công cụ (Header)
│   ├── ui/          # Các components cơ bản từ Radix UI và shadcn/ui
├── constants/       # Khai báo các biến hằng số, Enum trạng thái và cấu hình phân quyền RBAC
├── context/         # React Context providers (ví dụ: AuthContext quản lý đăng nhập)
├── hooks/           # Các Custom React hooks (e.g., usePermissions, useDebounce)
├── pages/           # Chứa giao diện của tất cả các trang (Dashboard, Danh sách người dùng, v.v.)
├── services/        # Nơi chứa các file gọi API bằng Axios giao tiếp với Backend
├── utils/           # Các hàm hỗ trợ (kết hợp class Tailwind, định dạng ngày tháng/tiền tệ)
├── App.jsx          # Cấu hình Router chính và bọc các Providers
└── main.jsx         # Điểm khởi chạy của ứng dụng React
```

### Cài đặt & Phát triển
1. **Cài đặt thư viện (Dependencies):**
   ```bash
   npm install
   ```
2. **Biến môi trường (Environment Variables):**
   Đảm bảo proxy trong `vite.config.js` hoặc file `.env` chứa URL chính xác của Backend.
   ```env
   VITE_API_BASE_URL=https://transporthc-backend.onrender.com
   ```
3. **Khởi chạy Server Development:**
   ```bash
   npm run dev
   ```
4. **Build để Triển khai (Production):**
   ```bash
   npm run build
   ```

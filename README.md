
# 🌙 Midnight Wallet DevKit (pnpm Edition)

Bộ công cụ phát triển dành cho kỹ sư xây dựng ví và ứng dụng trên mạng lưới **Midnight Network**. Tập trung vào việc thử nghiệm token balances, shielded transfers và mô phỏng hợp đồng thông minh Compact.

## 🚀 Tính năng chính
- **Shielded Transactions**: Thử nghiệm quy trình tạo ZK-Proof cho các giao dịch bảo mật.
- **pnpm Workflow**: Tối ưu hóa hiệu suất cài đặt và quản lý dependencies.
- **Script Lab**: Chạy các script kiểm thử ví trực tiếp từ giao diện hoặc terminal.
- **AI Assistant**: Tích hợp Gemini 3 Pro để giải đáp các thắc mắc về kỹ thuật Midnight.

## 🛠 Yêu cầu hệ thống
- [pnpm](https://pnpm.io/installation) v8.0.0 trở lên.
- Node.js v18+.

## 📦 Cài đặt
Sử dụng pnpm để cài đặt dependencies nhanh và tiết kiệm dung lượng:
```bash
pnpm install
```

## 💻 Các lệnh thực thi
| Lệnh | Mô tả |
| :--- | :--- |
| `pnpm dev` | Khởi động môi trường phát triển UI |
| `pnpm test` | Chạy script kiểm thử ví (`test-script.ts`) |
| `pnpm build` | Đóng gói ứng dụng cho production |

## 🧪 Chạy Script Test (ts-node)
Để chạy script lấy balance hoặc test transfer trực tiếp từ Terminal, hãy sử dụng:
```bash
pnpm dlx ts-node test-script.ts
```

## 📂 Cấu trúc dự án
- `services/`: Chứa logic cốt lõi tương tác với Midnight SDK (mock).
- `components/`: Các thành phần UI (Console, AI Assistant, Script Lab).
- `types.ts`: Định nghĩa các interface cho Wallet, Tx và Log.
- `test-script.ts`: File mẫu để viết code test ví.

## 🛡 Bảo mật
Project này hiện đang ở chế độ **Simulated Lab**. Các địa chỉ và khóa riêng tư được tạo ra chỉ phục vụ mục đích thử nghiệm giao diện và luồng logic.

---
*Built for the Midnight Developer Community.*

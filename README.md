# 🎮 Game Tracker - Wuthering Waves

> Ứng dụng web theo dõi lịch sử triệu hồi (gacha) và quản lý dữ liệu game Wuthering Waves.

[![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20RDS%20%7C%20S3-orange)](https://aws.amazon.com/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.1.1-blue)](https://reactjs.org/)
[![Java](https://img.shields.io/badge/Java-21-red)](https://www.oracle.com/java/)

## 📋 Tổng Quan

**Game Tracker** là nền tảng web giúp người chơi Wuthering Waves:
- 📊 Theo dõi lịch sử triệu hồi (gacha history) với **Roll Tracker** tự động
- 🎯 Xem thông tin chi tiết nhân vật, vũ khí, echo và set echo
- 📅 Cập nhật banner hiện tại, sắp tới và lịch sử banner
- 📰 Theo dõi sự kiện game đang diễn ra
- 👤 Quản lý tài khoản cá nhân với avatar tùy chỉnh
- 🔐 Đăng nhập bằng Google OAuth2

**Live Demo:** [https://trackerplus.site/](https://trackerplus.site/)

---

## ✨ Tính Năng Chính

### 🏠 Trang Chủ (Home)
- Hiển thị banner hiện tại với nhân vật/vũ khí featured
- Danh sách nhân vật nổi bật (5★ đang trong banner)
- Timeline sự kiện game
- Điều hướng nhanh đến các trang chính

### 👥 Nhân Vật (Characters)
- Danh sách đầy đủ nhân vật với filter theo:
- Badge "Banner" cho nhân vật đang rate-up
- Xem chi tiết nhân vật: stats, skills, talents

### ⚔️ Vũ Khí (Weapons)
- Danh sách vũ khí với filter theo type và rarity
- Badge "Banner" cho vũ khí đang rate-up
- Chi tiết vũ khí với stats và passive skills

### 🎲 Banner
- Xem banner hiện tại, sắp tới và lịch sử
- Thông tin chi tiết featured 5★ và 4★
- Mô phỏng gacha (Pull simulation) với animation

### 📊 Roll Tracker (★ Tính Năng Nổi Bật)
**Tự động import lịch sử triệu hồi từ game bằng PowerShell script!**

#### Cách Sử Dụng Tracker:

1. **Mở PowerShell** (Windows)
   
2. **Copy và chạy lệnh:**
   ```powershell
   iwr -UseBasicParsing -Headers @{"User-Agent"="Mozilla/5.0"} https://raw.githubusercontent.com/AliceAlicek2304/gametracker/main/backend/src/main/java/com/alice/gametracker/script/import.ps1 | iex
   ```

3. **Script sẽ tự động:**
   - Tìm thư mục game Wuthering Waves
   - Đọc URL gacha từ log file
   - Gửi dữ liệu lên server
   - Mở browser với kết quả đã import

4. **Xem kết quả:**
   - Lịch sử pulls theo từng banner (1-7)
   - Thống kê 5★ và 4★
   - Pity counter (số pulls từ lần cuối cùng nhận được cùng rarity)
   - Filter theo rarity
   - Phân trang

---

## 🛠️ Tech Stack

**Frontend:**
- React 19.1.1 + TypeScript
- Vite (Build tool)
- React Router v7
- CSS Modules
- Canvas Confetti (Animations)

**Backend:**
- Java 21
- Spring Boot 3.5.6
- Spring Security + JWT
- Spring Data JPA
- AWS Lambda (Serverless)
- MS SQL Server (RDS)

**Infrastructure (AWS):**
- **Lambda**: Serverless backend (Container Image)
- **API Gateway**: REST API endpoint
- **RDS**: MS SQL Server database
- **S3**: Static assets storage (images)
- **CloudFront**: CDN for frontend
- **Route53**: DNS management
- **SES**: Email service
- **VPC + NAT Gateway**: Network infrastructure
- **EventBridge**: Lambda warmer (giảm cold start)
- **CloudWatch**: Logs và monitoring

**CI/CD:**
- GitHub Actions
- Automatic deploy on push to `main`

---

## 🚀 Triển Khai

### Backend (Lambda)
```yaml
# .github/workflows/deploy.yml
- Build Spring Boot với Maven
- Build Docker image
- Push to AWS ECR
- Update Lambda function
```

### Frontend (S3 + CloudFront)
```yaml
# .github/workflows/deploy-frontend.yml
- Build React app với Vite
- Upload to S3
- Invalidate CloudFront cache
```

---

## 🛠️ Development Setup

### Prerequisites:
- Java 21
- Node.js 20+
- MS SQL Server
- Maven 3.9+
- AWS CLI (for deployment)

### Backend (Local):
```bash
cd backend
mvn spring-boot:run
# API sẽ chạy tại http://localhost:8080
```

### Frontend (Local):
```bash
cd frontend
npm install
npm run dev
# App sẽ chạy tại http://localhost:3000
```

### Environment Variables:
```properties
# backend/src/main/resources/application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;...
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
app.jwtSecret=your-secret-key
spring.security.oauth2.client.registration.google.client-id=...
spring.security.oauth2.client.registration.google.client-secret=...
```

```env
# frontend/.env.local
VITE_API_URL=http://localhost:8080/api
```

---

## 🚀 Tính Năng Trong Tương Lai

- 📊 **Quản lý tài nguyên thời gian thực** - Theo dõi materials, mora, exp books
- 🔍 **Tra cứu thông tin theo UID** - Tìm kiếm player profile và stats
- 🐧 **Hỗ trợ Linux** - PowerShell script cho Linux shell (bash/zsh)
- 📱 **Mobile App** - Ứng dụng di động iOS/Android
- 🔔 **Thông báo banner mới** - Push notification khi có banner mới
- 📈 **Thống kê nâng cao** - Deeper analytics cho gacha history

---

## 📄 License

Dự án này được cấp phép theo **GPL-3.0 License**.

PowerShell import script được lấy cảm hứng từ [WuWa Tracker](https://wuwatracker.com/) và tuân theo GPL-3.0.

---

## 👨‍💻 Author

**Alice** - [@AliceAlicek2304](https://github.com/AliceAlicek2304)

---

## 🙏 Acknowledgments

- Wuthering Waves game data API
- WuWa Tracker community
- Spring Boot & AWS community
- React community

---

## 📮 Support

Nếu gặp vấn đề hoặc có câu hỏi:
- Open an [Issue](https://github.com/AliceAlicek2304/gametracker/issues)
- Contact: alicek23004@gmail.com

---

**⭐ Nếu thấy hữu ích, hãy star repo này nhé!**

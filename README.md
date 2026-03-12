# ☕ LoyaltyCard — Full-Stack Loyalty Program

A complete loyalty card system for small businesses, built with **Spring Boot 3 + Java 21** (backend) and **Angular 17** (frontend).

---

## 🗂️ Project Structure

```
loyalty-app/
├── backend/                    ← Spring Boot (IntelliJ)
│   ├── pom.xml
│   └── src/main/java/com/loyalty/
│       ├── LoyaltyApplication.java
│       ├── config/
│       │   ├── SecurityConfig.java
│       │   └── GlobalExceptionHandler.java
│       ├── controller/
│       │   ├── AuthController.java
│       │   ├── CustomerController.java
│       │   └── AdminController.java
│       ├── dto/
│       │   ├── AuthDto.java
│       │   ├── LoyaltyCardDto.java
│       │   └── CustomerDto.java
│       ├── entity/
│       │   ├── User.java
│       │   ├── Business.java
│       │   ├── LoyaltyCard.java
│       │   ├── Stamp.java
│       │   └── Reward.java
│       ├── repository/
│       │   ├── UserRepository.java
│       │   ├── BusinessRepository.java
│       │   ├── LoyaltyCardRepository.java
│       │   ├── StampRepository.java
│       │   └── RewardRepository.java
│       ├── security/
│       │   ├── JwtService.java
│       │   └── JwtAuthenticationFilter.java
│       └── service/
│           ├── AuthService.java
│           ├── LoyaltyCardService.java
│           └── QrCodeService.java
│
└── frontend/                   ← Angular 17 (VS Code / Angular CLI)
    ├── angular.json
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── main.ts
        ├── index.html
        ├── styles.css
        └── app/
            ├── app.component.ts
            ├── app.config.ts
            ├── app.routes.ts
            ├── components/
            │   └── navbar.component.ts
            ├── guards/
            │   ├── auth.guard.ts
            │   └── role.guard.ts
            ├── interceptors/
            │   └── auth.interceptor.ts
            ├── models/
            │   └── models.ts
            ├── pages/
            │   ├── login/login.component.ts
            │   ├── register/register.component.ts
            │   ├── customer-card/customer-card.component.ts
            │   ├── qr-display/qr-display.component.ts
            │   ├── admin-dashboard/admin-dashboard.component.ts
            │   ├── qr-scanner/qr-scanner.component.ts
            │   └── customer-search/customer-search.component.ts
            └── services/
                ├── auth.service.ts
                └── loyalty.service.ts
```

---

## 🚀 Setup

### Prerequisites
- Java 21
- Maven 3.9+
- MySQL 8.0+
- Node.js 18+ & npm
- Angular CLI 17: `npm install -g @angular/cli`

### Backend Setup

1. **Create MySQL database:**
```sql
CREATE DATABASE loyalty_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configure credentials** in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=your_user
spring.datasource.password=your_password
```

3. **Run the backend:**
```bash
cd backend
mvn spring-boot:run
```
Backend starts at: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
ng serve
```
Frontend starts at: `http://localhost:4200`

---

## 🔌 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/customer/card` | CUSTOMER | Get my loyalty card |
| GET | `/api/customer/qr` | CUSTOMER | Get my QR code image |
| GET | `/api/admin/customers` | BUSINESS_OWNER | List all customers |
| GET | `/api/admin/customers/search?q=` | BUSINESS_OWNER | Search customers |
| GET | `/api/admin/customers/{id}/card` | BUSINESS_OWNER | Get customer card |
| POST | `/api/admin/stamps` | BUSINESS_OWNER | Add stamp by userId |
| POST | `/api/admin/stamps/scan` | BUSINESS_OWNER | Add stamp by QR code |

---

## 🌐 i18n

Language is switched in real-time from the navbar (EN / ES). Translation files are in:
- `frontend/src/assets/i18n/en.json`
- `frontend/src/assets/i18n/es.json`

---

## 💡 Features

- **JWT Auth** — Stateless authentication with role-based access (CUSTOMER / BUSINESS_OWNER)
- **QR Codes** — Generated server-side using ZXing, served as base64 PNG
- **Stamp tracking** — Visual stamp grid with animated fills
- **Rewards** — Auto-generated when stamp threshold reached
- **i18n** — English and Spanish with ngx-translate
- **Mobile-first** — Responsive design with CSS variables and flexbox/grid

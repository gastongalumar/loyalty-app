# 🎫 Loyalty App — Enterprise Customer Loyalty Management System

> A **production-ready MVP** of a comprehensive customer loyalty system designed for small-to-medium businesses. Built with modern technologies: **Spring Boot 3 + Java 21** (backend), **Angular 17** (frontend), **MySQL 8.0** (database), and **Docker** containerization.

**Status:** ✅ Functional MVP | **Version:** 1.0.0 | **License:** MIT

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Authentication & Security](#authentication--security)
- [Database Design](#database-design)
- [Deployment Architecture](#deployment-architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Running with Docker](#running-with-docker)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

### What It Does

**Loyalty App** is a **digital loyalty card system** that bridges the gap between small businesses and their customers. It replaces traditional punch cards with a modern, mobile-first web application that:

- **Customers** can view their loyalty progress, scan QR codes to share identity, and redeem rewards
- **Business Owners** can manage loyalty programs, scan customer QR codes to add stamps, track redemptions, and customize branding

### Real-World Use Case

A coffee shop owner wants to encourage repeat customers without managing physical punch cards. They:

1. Register as a BUSINESS_OWNER
2. Configure their loyalty program (10 stamps = 1 free coffee)
3. Download the app and scan customers' QR codes at checkout
4. Customers download the app, view their loyalty card progress
5. When the stamp threshold is reached, a reward is automatically generated

### MVP Status

This is a **fully functional MVP** with:
- ✅ User authentication (JWT-based)
- ✅ QR code generation and scanning
- ✅ Stamp tracking and reward management
- ✅ Multi-role authorization (Customer/Business Owner)
- ✅ File upload (avatars, logos, backgrounds)
- ✅ i18n (English & Spanish)
- ✅ PWA support (installable on mobile)
- ✅ Production deployment via Docker

**Note:** Multi-tenancy is **partially implemented** (multiple businesses can exist, but the system is not fully optimized for large-scale SaaS). See [Roadmap](#roadmap) for improvements.

---

## 💎 Key Features

### For Customers

| Feature | Description |
|---------|-------------|
| **Digital Loyalty Card** | View stamp progress and rewards in a visual, intuitive interface |
| **QR Identity** | Unique QR code generated at registration for fast checkout scanning |
| **Reward Tracking** | Real-time notifications when rewards are earned or redeemed |
| **Multi-Business Support** | Manage loyalty cards for multiple businesses in one app |
| **Profile Management** | Upload profile avatar and manage personal information |
| **Offline Support** | PWA allows viewing cards offline (syncs when online) |
| **Mobile App Experience** | Installable as a native-like app on iOS/Android |

### For Business Owners

| Feature | Description |
|---------|-------------|
| **QR Scanner** | Real-time QR code scanner for stamping customers at checkout |
| **Customer Search** | Find and manage customers by email or name |
| **Analytics Dashboard** | View stamp distribution, redemption rates, and active customers |
| **Loyalty Program Config** | Customize stamp requirements and reward descriptions |
| **Branding Customization** | Upload logo, background image, and customize app colors/themes |
| **Reward Redemption** | Track pending and completed rewards; mark as redeemed |
| **Fidelity Tiers** | (Partial) Support for tiered loyalty (bronze/silver/gold) |
| **Admin Controls** | Create/update user roles and manage business settings |

### Technology Highlights

| Category | Highlight |
|----------|-----------|
| **Authentication** | Stateless JWT with secure token storage and auto-refresh |
| **Authorization** | Role-based access control (RBAC) for CUSTOMER and BUSINESS_OWNER |
| **QR Codes** | Server-side generation using Google ZXing library |
| **Real-time** | Responsive updates via REST API polling (WebSocket ready for future) |
| **File Handling** | Secure file upload for images with validation and storage isolation |
| **i18n** | Dynamic language switching (English/Spanish) without page reload |
| **PWA** | Angular Service Worker for offline capability and installability |
| **CORS** | Whitelist-based CORS configuration for API security |

---

## 🛠 Tech Stack

### **Backend: Spring Boot 3 + Java 21**

**Why Spring Boot?**
- Industry-standard for enterprise Java applications
- Built-in security, validation, and dependency injection
- Rapid development with conventions over configuration
- Excellent ecosystem (Spring Data, Spring Security)

**Key Dependencies:**
```xml
<!-- Core -->
spring-boot-starter-web              <!-- REST APIs -->
spring-boot-starter-data-jpa         <!-- Database ORM -->
spring-boot-starter-security         <!-- Authentication -->
spring-boot-starter-validation       <!-- DTO validation -->

<!-- JWT -->
jjwt-api, jjwt-impl, jjwt-jackson   <!-- JWT creation & validation -->

<!-- QR Codes -->
zxing-core, zxing-javase            <!-- QR code generation -->

<!-- Database -->
mysql-connector-j                    <!-- MySQL driver -->
h2 (test)                           <!-- In-memory DB for testing -->
```

**Java 21:** Latest LTS (Long-Term Support) version with virtual threads, records, and pattern matching.

### **Frontend: Angular 17**

**Why Angular?**
- Full-featured framework with built-in routing, validation, and dependency injection
- TypeScript for type safety and better IDE support
- Component-based architecture for reusability
- Large community and extensive third-party libraries

**Key Libraries:**
```json
@angular/core @angular/router @angular/forms @angular/service-worker
@ngx-translate/core                 /* i18n (English/Spanish) */
html5-qrcode                        /* QR code scanning */
rxjs                                /* Reactive programming */
```

### **Database: MySQL 8.0**

**Why MySQL?**
- Reliable, widely-supported relational database
- Full ACID compliance for transactional integrity
- Excellent performance for read-heavy loyalty scenarios
- UTF-8 support for internationalization

**Schema Tables:**
- **users** — User accounts (CUSTOMER, BUSINESS_OWNER)
- **businesses** — Business profiles linked to owners
- **loyalty_cards** — Customer-Business loyalty relationships
- **stamps** — Individual stamp records with timestamps
- **rewards** — Earned/redeemed rewards with status tracking
- **business_themes** — Customizable branding per business
- **fidelity_tiers** — Tiered loyalty support

### **Deployment Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Containerization** | Docker | Consistent environment across dev/staging/prod |
| **Orchestration** | Docker Compose | Multi-container local development |
| **Web Server** | Nginx | Reverse proxy, static file serving, SSL/TLS |
| **Security Proxy** | Cloudflare | DDoS protection, caching, SSL/TLS termination |
| **CDN** | Cloudflare | Global content distribution |
| **VPS Hosting** | Any (AWS, DigitalOcean, Linode) | Production deployment |
| **Domain** | api.programandos.site | API domain (configured in CORS) |

---

## 🏗 System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER (Angular 17)                       │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │   Login Page    │  │  Customer Card │  │   Admin Dashboard/       │ │
│  │   Register      │  │   QR Display   │  │   Scanner/Redemptions    │ │
│  └────────┬────────┘  └────────┬───────┘  └──────────┬───────────────┘ │
│           │                    │                     │                  │
│           └────────────────────┼─────────────────────┘                  │
│                                │                                        │
│                    ┌───────────▼──────────────┐                        │
│                    │  Auth Interceptor        │                        │
│                    │  (JWT Token Injection)   │                        │
│                    └───────────┬──────────────┘                        │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   HTTPS / REST API       │
                    │   (Nginx Reverse Proxy)  │
                    └────────────┬─────────────┘
                                 │
┌────────────────────────────────┼──────────────────────────────────────────┐
│                    APPLICATION LAYER (Spring Boot 3)                      │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    Security Layer                                │    │
│  │  ┌─────────────────────┐  ┌──────────────────────────────────┐  │    │
│  │  │ JWT Filter          │  │ Role-Based Access Control (RBAC) │  │    │
│  │  │ (Extract & Validate)│  │ @PreAuthorize("hasRole(...)")    │  │    │
│  │  └─────────────────────┘  └──────────────────────────────────┘  │    │
│  └───────────────────────────────────────┬──────────────────────────┘    │
│                                          │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │               REST API Controllers (8 controllers)              │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │    │
│  │  │ AuthController   │ │ CustomerController  │ │ AdminController        │    │    │
│  │  │ /auth/*      │ │ /customer/*  │ │ /admin/*     │    │    │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘    │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
│                                         │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │              Service Layer (Business Logic)                     │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │ AuthService    QrCodeService    FileStorageService       │  │    │
│  │  │ LoyaltyCardService   BusinessService                      │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
│                                         │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │          Repository Layer (Data Access / ORM)                   │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │ Spring Data JPA Repositories (UserRepo, StampRepo, etc)  │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
└────────────────────────────────────────┼──────────────────────────────────┘
                                         │
                        ┌────────────────▼─────────────┐
                        │    DATABASE LAYER            │
                        │  MySQL 8.0 (InnoDB)          │
                        │  (8 normalized tables)       │
                        └────────────────────────────────┘
```

### Request/Response Flow Example: Adding a Stamp

```
1. FRONTEND (QR Scanner)
   └─ Scans customer QR code → POST /api/admin/stamps/scan
   
2. NETWORK
   └─ HTTPS Request → Nginx Reverse Proxy → Spring Boot (port 8080)
   
3. BACKEND (Spring Security)
   ├─ JwtAuthenticationFilter extracts & validates token
   ├─ RBAC checks: hasRole('BUSINESS_OWNER') ✅
   └─ Delegates to AdminController

4. CONTROLLER & SERVICE
   ├─ Input validation
   ├─ Business logic (LoyaltyCardService)
   ├─ Create/update entities
   └─ Persist to database (JPA)

5. DATABASE
   ├─ Insert STAMP record
   ├─ Update LOYALTY_CARD stamps count
   └─ Create REWARD if threshold reached

6. RESPONSE (JSON)
   ├─ HTTP 200 OK + updated card state
   └─ FRONTEND updates UI with new stamp count
```

---

## 🔐 Authentication & Security

### JWT Flow (Step-by-Step)

**1. User Registration**
```
POST /api/auth/register
{
  "email": "customer@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "CUSTOMER"
}
→ Backend: Hash password (BCrypt), generate unique QR code, create User
→ HTTP 200 OK + UserDto
```

**2. User Login**
```
POST /api/auth/login
{
  "email": "customer@example.com",
  "password": "SecurePass123!"
}
→ Backend: Validate credentials, generate JWT with 24-hour expiration
→ HTTP 200 OK + JWT Token + UserDto
```

**3. Token Storage (Frontend)**
```
AuthService stores JWT in localStorage (or sessionStorage for PWA)
```

**4. Token Injection (Auth Interceptor)**
```
Every HTTP request automatically adds:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**5. Token Validation (Backend JWT Filter)**
```
JwtAuthenticationFilter on each request:
├─ Extract token from Authorization header
├─ Parse JWT signature & verify not expired
├─ Load User from database
├─ Create SecurityContext
└─ Continue to controller (or throw 401)
```

**6. Authorization (RBAC)**
```
@PreAuthorize("hasRole('BUSINESS_OWNER')")
public void addStamp(@RequestBody request) { ... }
→ Spring checks user roles → allow or throw 403
```

**7. Protected Routes (Frontend)**
```
authGuard: Token exists? → allow or redirect to /login
roleGuard: User role matches? → allow or redirect to dashboard
```

### Security Best Practices Implemented

✅ BCrypt password hashing  
✅ HMAC-SHA256 JWT signatures  
✅ CORS whitelist (only authorized origins)  
✅ HTTPS enforcement (Nginx + Cloudflare)  
✅ 24-hour token expiration  
✅ Role-based access control (RBAC)  
✅ Input validation (@Valid @NotNull @Email)  
✅ SQL injection prevention (parameterized queries)  
✅ XSS protection (Angular sanitization)  
✅ File upload validation (extension & size checks)

---

## 💾 Database Design

### Entity Relationship Diagram

```
USERS (1) ◄──────── (N) BUSINESSES (owner_id)
  │
  └──────(1:1)──────► LOYALTY_CARDS ◄────(N)──── STAMPS
                         │
                         ├────(1:N)───► REWARDS
                         │
                         └────(1:N)───► FIDELITY_TIERS

BUSINESSES (1) ◄──────(1:1)──────► BUSINESS_THEMES
```

### SQL Schema Highlights

**Users Table:**
```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,           -- Hashed with BCrypt
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE,
    role ENUM('CUSTOMER','BUSINESS_OWNER') DEFAULT 'CUSTOMER',
    qr_code VARCHAR(64) UNIQUE NOT NULL,     -- Unique identifier
    avatar_url VARCHAR(500),                 -- Path to uploaded avatar
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Loyalty Cards Table:**
```sql
CREATE TABLE loyalty_cards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    business_id BIGINT NOT NULL,
    total_stamps INT DEFAULT 10,             -- Configurable per business
    current_stamps INT DEFAULT 0,            -- Incremented when stamp added
    completed_cards INT DEFAULT 0,           -- Tracks completed cycles
    status ENUM('ACTIVE','COMPLETED','REWARD_PENDING') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (business_id) REFERENCES businesses(id)
) ENGINE=InnoDB;
```

### ORM: Spring Data JPA

**Why JPA/Hibernate?**
- Eliminates boilerplate SQL code
- Type-safe queries via Spring Data repositories
- Automatic relationship mapping
- Support for multiple databases

**Example:**
```java
public interface LoyaltyCardRepository extends JpaRepository<LoyaltyCard, Long> {
    Optional<LoyaltyCard> findByUserIdAndBusinessId(Long userId, Long businessId);
}
```

---

## 🚀 Deployment Architecture

### Production Infrastructure

```
Internet → Cloudflare (DDoS, Cache, DNS) → VPS
                                            ├─ Nginx (Reverse Proxy, SSL/TLS)
                                            │  ├─ Angular App (Port 80)
                                            │  ├─ Spring Boot API (Port 8080)
                                            │  └─ Static Files
                                            │
                                            ├─ MySQL 8.0 (Port 3306)
                                            └─ File Storage (/uploads/)
```

### Docker Compose Setup (Development & Staging)

```yaml
version: '3.9'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: loyalty_db
    ports:
      - "3306:3306"
    
  backend:
    build: ./backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://db:3306/loyalty_db
    ports:
      - "8080:8080"
    
  frontend:
    build: ./frontend
    ports:
      - "80:80"
```

---

## 📁 Project Structure (Detailed)

### Backend Structure

```
backend/
├── pom.xml                          [Maven POM]
├── src/main/java/com/loyalty/
│   ├── LoyaltyApplication.java      [Spring Boot entry]
│   ├── controller/                  [8 REST Controllers]
│   ├── service/                     [Business Logic]
│   ├── repository/                  [Spring Data JPA]
│   ├── entity/                      [JPA Entities]
│   ├── dto/                         [Data Transfer Objects]
│   ├── security/                    [JWT & Auth]
│   └── config/                      [Config & Exception Handling]
│
└── src/test/java/com/loyalty/       [Unit & Integration Tests]
```

### Frontend Structure

```
frontend/
├── angular.json                     [Angular CLI config]
├── package.json                     [npm dependencies]
├── src/
│   ├── index.html                   [App shell]
│   ├── main.ts                      [Bootstrap]
│   ├── app/
│   │   ├── app.routes.ts            [Route definitions]
│   │   ├── controller/              [8 REST Controllers]
│   │   ├── pages/                   [13 feature pages]
│   │   ├── services/                [API services]
│   │   ├── guards/                  [auth, role guards]
│   │   ├── interceptors/            [auth, error interceptors]
│   │   ├── models/                  [TypeScript interfaces]
│   │   └── assets/
│   │       ├── i18n/                [EN, ES translations]
│   │       └── icons/               [Icon assets]
│   │
│   └── ngsw-config.json             [PWA config]
```

---

## 📦 Installation & Setup

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Java** | 21 LTS | Backend runtime |
| **Maven** | 3.9+ | Build tool |
| **Node.js** | 18+ | Frontend tooling |
| **MySQL** | 8.0+ | Database |
| **Docker** | 20.10+ | Containerization |

### Step 1: Clone & Setup

```bash
git clone https://github.com/yourusername/loyalty-app.git
cd loyalty-app
```

### Step 2: Backend Setup

```bash
# Create MySQL database
docker run --name loyalty-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=loyalty_db \
  -p 3306:3306 -d mysql:8.0

# Or via Docker Compose:
docker-compose up -d db

# Configure in backend/src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/loyalty_db

# Run backend
cd backend
mvn clean install
mvn spring-boot:run
# Backend: http://localhost:8080
```

### Step 3: Frontend Setup

```bash
cd frontend
npm install
ng serve
# Frontend: http://localhost:4200
```

### Step 4: Verify Installation

```bash
# Test backend health
curl http://localhost:8080/actuator/health

# Test login
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "CUSTOMER"
  }'
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register user |
| POST | `/api/auth/login` | None | Login |

### Customer Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/customer/card` | CUSTOMER | Get loyalty card |
| GET | `/api/customer/qr` | CUSTOMER | Get QR code image |
| GET | `/api/customer/profile` | CUSTOMER | Get profile |
| PUT | `/api/customer/profile` | CUSTOMER | Update profile |
| POST | `/api/customer/avatar` | CUSTOMER | Upload avatar |

### Business Owner Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | BUSINESS_OWNER | Dashboard stats |
| GET | `/api/admin/customers` | BUSINESS_OWNER | List customers |
| GET | `/api/admin/customers/search?q=email` | BUSINESS_OWNER | Search customers |
| POST | `/api/admin/stamps` | BUSINESS_OWNER | Add stamp by ID |
| POST | `/api/admin/stamps/scan` | BUSINESS_OWNER | Add stamp by QR |
| GET | `/api/admin/redemptions` | BUSINESS_OWNER | List rewards |
| PUT | `/api/admin/redemptions/{id}` | BUSINESS_OWNER | Mark as redeemed |
| GET | `/api/theme` | None | Get business theme |
| PUT | `/api/theme` | BUSINESS_OWNER | Update theme |

---

## 🐳 Running with Docker

### All Services

```bash
docker-compose up --build

# Or in background:
docker-compose up -d --build

# View logs:
docker-compose logs -f

# Stop:
docker-compose down
```

Access:
- **Frontend:** http://localhost
- **Backend:** http://localhost:8080
- **MySQL:** localhost:3306

---

## 🗺 Roadmap

### v1.0 (Current - MVP)

✅ User registration & login  
✅ JWT authentication  
✅ QR code generation & scanning  
✅ Stamp tracking  
✅ Reward management  
✅ PWA support  
✅ Docker deployment  
✅ Multi-language (EN/ES)

### v1.1 (Near-term)

🔜 Email notifications  
🔜 Advanced analytics  
🔜 Multi-tenant optimization

### v2.0 (Mid-term)

🔜 Payment integration (Stripe/PayPal)  
🔜 WebSocket support  
🔜 Advanced fidelity tiers

### v3.0 (Long-term)

🔜 Machine learning (churn prediction)  
🔜 Blockchain integration  
🔜 Global marketplace

---

## 📝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Test changes
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 👨‍💼 Author

**Developed by:** Your Development Team  
**Version:** 1.0.0 (MVP)  
**Last Updated:** April 2026

---

**Full documentation available at:** [Docs](https://docs.loyaltyapp.com)


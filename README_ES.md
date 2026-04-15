# 🎫 Loyalty App — Sistema de Gestión de Fidelización Empresarial

> Un **MVP listo para producción** de un sistema completo de fidelización de clientes diseñado para pequeñas y medianas empresas. Construido con tecnologías modernas: **Spring Boot 3 + Java 21** (backend), **Angular 17** (frontend), **MySQL 8.0** (base de datos), y **Docker** (containerización).

**Estado:** ✅ MVP Funcional | **Versión:** 1.0.0 | **Licencia:** MIT

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Autenticación y Seguridad](#autenticación-y-seguridad)
- [Diseño de Base de Datos](#diseño-de-base-de-datos)
- [Arquitectura de Deployment](#arquitectura-de-deployment)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Endpoints de API](#endpoints-de-api)
- [Ejecutar con Docker](#ejecutar-con-docker)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

---

## 🎯 Descripción General

### ¿Qué Hace?

**Loyalty App** es un **sistema digital de tarjetas de fidelización** que cierra la brecha entre pequeños negocios y sus clientes. Reemplaza las tarjetas de puntos tradicionales con una aplicación web moderna y móvil que:

- **Los Clientes** pueden ver su progreso de puntos, escanear códigos QR para identificarse, y canjear recompensas
- **Los Dueños de Negocio** pueden gestionar programas de fidelización, escanear códigos QR de clientes para agregar puntos, rastrear canjes, y personalizar la marca

### Caso de Uso Real

Un dueño de cafetería quiere fomentar clientes frecuentes sin gestionar tarjetas de puntos físicas. Ellos:

1. Se registran como BUSINESS_OWNER
2. Configuran su programa de fidelización (10 puntos = 1 café gratis)
3. Descargan la app y escanean códigos QR de clientes en la caja
4. Los clientes descargan la app y ven el progreso de su tarjeta
5. Cuando alcanzan el límite de puntos, se genera automáticamente una recompensa

### Estado del MVP

Este es un **MVP completamente funcional** con:
- ✅ Autenticación de usuarios (basada en JWT)
- ✅ Generación y escaneo de códigos QR
- ✅ Seguimiento de puntos y gestión de recompensas
- ✅ Autorización multi-rol (Cliente/Dueño de Negocio)
- ✅ Carga de archivos (avatares, logos, fondos)
- ✅ i18n (Inglés & Español)
- ✅ Soporte PWA (instalable en móvil)
- ✅ Deployment en producción con Docker

**Nota:** La multi-tenencia está **parcialmente implementada** (múltiples negocios pueden existir, pero el sistema no está completamente optimizado para SaaS a gran escala). Ver [Roadmap](#roadmap) para mejoras.

---

## 💎 Características Principales

### Para Clientes

| Característica | Descripción |
|---------|-------------|
| **Tarjeta de Lealtad Digital** | Ver progreso de puntos y recompensas en una interfaz visual intuitiva |
| **Identidad QR** | Código QR único generado en el registro para escaneo rápido en caja |
| **Seguimiento de Recompensas** | Notificaciones en tiempo real cuando se ganan o canjejan recompensas |
| **Soporte Multi-Negocio** | Gestionar tarjetas de fidelización de múltiples negocios en una app |
| **Gestión de Perfil** | Subir avatar de perfil y gestionar información personal |
| **Soporte Offline** | PWA permite ver tarjetas sin conexión (sincroniza al conectar) |
| **Experiencia de App Móvil** | Instalable como app nativa en iOS/Android |

### Para Dueños de Negocio

| Característica | Descripción |
|---------|-------------|
| **Escáner QR** | Escáner de código QR en tiempo real para agregar puntos en caja |
| **Búsqueda de Clientes** | Buscar y gestionar clientes por email o nombre |
| **Dashboard de Analítica** | Ver distribución de puntos, tasas de canje y clientes activos |
| **Configuración de Programa** | Personalizar requisitos de puntos y descripción de recompensas |
| **Personalización de Marca** | Subir logo, imagen de fondo y personalizar colores/temas |
| **Canje de Recompensas** | Rastrear recompensas pendientes y completadas; marcar como canjeadas |
| **Niveles de Fidelización** | (Parcial) Soporte para fidelización por niveles (bronce/plata/oro) |
| **Controles de Admin** | Crear/actualizar roles de usuario y gestionar configuración del negocio |

### Características Tecnológicas

| Categoría | Característica |
|----------|-----------|
| **Autenticación** | JWT sin estado con almacenamiento seguro de tokens y auto-renovación |
| **Autorización** | Control de acceso basado en roles (RBAC) para CUSTOMER y BUSINESS_OWNER |
| **Códigos QR** | Generación servidor usando librería Google ZXing |
| **Tiempo Real** | Actualizaciones responsivas vía REST API (listo para WebSocket en futuro) |
| **Manejo de Archivos** | Carga segura de imágenes con validación y almacenamiento aislado |
| **i18n** | Cambio dinámico de idioma (Inglés/Español) sin recargar página |
| **PWA** | Angular Service Worker para capacidad offline e instalabilidad |
| **CORS** | Configuración CORS basada en whitelist para seguridad de API |

---

## 🛠 Stack Tecnológico

### **Backend: Spring Boot 3 + Java 21**

**¿Por qué Spring Boot?**
- Estándar de la industria para aplicaciones Java empresariales
- Seguridad, validación e inyección de dependencias integradas
- Desarrollo rápido con convenciones sobre configuración
- Excelente ecosistema (Spring Data, Spring Security)

**Dependencias Clave:**
```xml
<!-- Core -->
spring-boot-starter-web              <!-- APIs REST -->
spring-boot-starter-data-jpa         <!-- ORM de Base de Datos -->
spring-boot-starter-security         <!-- Autenticación -->
spring-boot-starter-validation       <!-- Validación de DTO -->

<!-- JWT -->
jjwt-api, jjwt-impl, jjwt-jackson   <!-- Creación y validación JWT -->

<!-- Códigos QR -->
zxing-core, zxing-javase            <!-- Generación de códigos QR -->

<!-- Base de Datos -->
mysql-connector-j                    <!-- Driver MySQL -->
h2 (test)                           <!-- BD en memoria para testing -->
```

**Java 21:** Versión LTS (Soporte a Largo Plazo) más reciente con threads virtuales, records y pattern matching.

### **Frontend: Angular 17**

**¿Por qué Angular?**
- Framework completo con routing, validación e inyección de dependencias integrados
- TypeScript para seguridad de tipos y mejor soporte de IDE
- Arquitectura basada en componentes para reutilización
- Gran comunidad y amplia librería de terceros

**Librerías Clave:**
```json
@angular/core @angular/router @angular/forms @angular/service-worker
@ngx-translate/core                 /* i18n (Inglés/Español) */
html5-qrcode                        /* Escaneo de códigos QR */
rxjs                                /* Programación reactiva */
```

### **Base de Datos: MySQL 8.0**

**¿Por qué MySQL?**
- Base de datos relacional confiable y ampliamente soportada
- Cumplimiento completo de ACID para integridad transaccional
- Excelente rendimiento para escenarios con muchas lecturas de fidelización
- Soporte UTF-8 para internacionalización

**Tablas de Esquema:**
- **users** — Cuentas de usuario (CUSTOMER, BUSINESS_OWNER)
- **businesses** — Perfiles de negocio vinculados a propietarios
- **loyalty_cards** — Relaciones de fidelización Cliente-Negocio
- **stamps** — Registros de puntos individuales con marcas de tiempo
- **rewards** — Recompensas ganadas/canjeadas con seguimiento de estado
- **business_themes** — Personalización de marca por negocio
- **fidelity_tiers** — Soporte de fidelización por niveles

### **Stack de Deployment**

| Capa | Tecnología | Propósito |
|-------|-----------|---------|
| **Containerización** | Docker | Ambiente consistente entre dev/staging/prod |
| **Orquestación** | Docker Compose | Desarrollo local multi-contenedor |
| **Servidor Web** | Nginx | Proxy inverso, servicio de archivos estáticos, SSL/TLS |
| **Proxy de Seguridad** | Cloudflare | Protección DDoS, caché, terminación SSL/TLS |
| **CDN** | Cloudflare | Distribución de contenido global |
| **Hosting VPS** | AWS, DigitalOcean, Linode | Deployment en producción |
| **Dominio** | api.programandos.site | Dominio de API (configurado en CORS) |

---

## 🏗 Arquitectura del Sistema

### Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CAPA DE CLIENTE (Angular 17)                    │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────────────────┐ │
│  │  Página Login   │  │  Tarjeta Clien │  │   Dashboard Admin/       │ │
│  │  Registro       │  │   Visualizar QR│  │   Escáner/Canjes        │ │
│  └────────┬────────┘  └────────┬───────┘  └──────────┬───────────────┘ │
│           │                    │                     │                  │
│           └────────────────────┼─────────────────────┘                  │
│                                │                                        │
│                    ┌───────────▼──────────────┐                        │
│                    │  Interceptor Auth        │                        │
│                    │  (Inyección de JWT)      │                        │
│                    └───────────┬──────────────┘                        │
└────────────────────────────────┼─────────────────────────────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   HTTPS / REST API       │
                    │   (Proxy Inverso Nginx)  │
                    └────────────┬─────────────┘
                                 │
┌────────────────────────────────┼──────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN (Spring Boot 3)                     │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                    Capa de Seguridad                             │    │
│  │  ┌─────────────────────┐  ┌──────────────────────────────────┐  │    │
│  │  │ Filtro JWT          │  │ Control de Acceso por Rol (RBAC) │  │    │
│  │  │ (Extrae & Valida)   │  │ @PreAuthorize("hasRole(...)")    │  │    │
│  │  └─────────────────────┘  └──────────────────────────────────┘  │    │
│  └───────────────────────────────────────┬──────────────────────────┘    │
│                                          │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │               Controladores REST API (8 controladores)          │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐    │    │
│  │  │ AuthController   │ │ CustomerController  │ │ AdminController        │    │    │
│  │  │ /auth/*      │ │ /customer/*  │ │ /admin/*     │    │    │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘    │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
│                                         │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │              Capa de Servicio (Lógica de Negocio)              │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │ AuthService    QrCodeService    FileStorageService       │  │    │
│  │  │ LoyaltyCardService   BusinessService                      │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
│                                         │                               │
│  ┌──────────────────────────────────────▼──────────────────────────┐    │
│  │          Capa de Repositorio (Acceso a Datos / ORM)            │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │ Repositorios Spring Data JPA (UserRepo, StampRepo, etc)  │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────┬──────────────────────────┘    │
└────────────────────────────────────────┼──────────────────────────────────┘
                                         │
                        ┌────────────────▼─────────────┐
                        │    CAPA DE BASE DE DATOS     │
                        │  MySQL 8.0 (InnoDB)          │
                        │  (8 tablas normalizadas)     │
                        └────────────────────────────────┘
```

### Ejemplo de Flujo Request/Response: Agregar un Punto

```
1. FRONTEND (Escáner QR)
   └─ Escanea QR del cliente → POST /api/admin/stamps/scan
   
2. RED
   └─ Solicitud HTTPS → Proxy Inverso Nginx → Spring Boot (puerto 8080)
   
3. BACKEND (Spring Security)
   ├─ JwtAuthenticationFilter extrae & valida token
   ├─ Verifica RBAC: hasRole('BUSINESS_OWNER') ✅
   └─ Delega a AdminController

4. CONTROLADOR & SERVICIO
   ├─ Validación de entrada
   ├─ Lógica de negocio (LoyaltyCardService)
   ├─ Crear/actualizar entidades
   └─ Persistir en base de datos (JPA)

5. BASE DE DATOS
   ├─ Insertar registro STAMP
   ├─ Actualizar contador de puntos LOYALTY_CARD
   └─ Crear REWARD si se alcanzó el límite

6. RESPUESTA (JSON)
   ├─ HTTP 200 OK + estado actualizado de tarjeta
   └─ FRONTEND actualiza UI con nueva cantidad de puntos
```

---

## 🔐 Autenticación y Seguridad

### Flujo JWT (Paso a Paso)

**1. Registro de Usuario**
```
POST /api/auth/register
{
  "email": "cliente@ejemplo.com",
  "password": "ContraseñaSegura123!",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "CUSTOMER"
}
→ Backend: Hash de contraseña (BCrypt), genera código QR único, crea Usuario
→ HTTP 200 OK + UserDto
```

**2. Login de Usuario**
```
POST /api/auth/login
{
  "email": "cliente@ejemplo.com",
  "password": "ContraseñaSegura123!"
}
→ Backend: Valida credenciales, genera token JWT con expiración de 24 horas
→ HTTP 200 OK + Token JWT + UserDto
```

**3. Almacenamiento de Token (Frontend)**
```
AuthService guarda JWT en localStorage (o sessionStorage para PWA)
```

**4. Inyección de Token (Auth Interceptor)**
```
Cada solicitud HTTP automáticamente añade:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**5. Validación de Token (Backend JWT Filter)**
```
JwtAuthenticationFilter en cada solicitud:
├─ Extrae token del header Authorization
├─ Parsea firma JWT & verifica que no esté expirado
├─ Carga Usuario de la base de datos
├─ Crea SecurityContext
└─ Continúa al controlador (o lanza 401)
```

**6. Autorización (RBAC)**
```
@PreAuthorize("hasRole('BUSINESS_OWNER')")
public void addStamp(@RequestBody request) { ... }
→ Spring verifica roles del usuario → permite o lanza 403
```

**7. Rutas Protegidas (Frontend)**
```
authGuard: ¿Tengo token? → permite o redirige a /login
roleGuard: ¿Mi rol coincide? → permite o redirige a dashboard
```

### Prácticas de Seguridad Implementadas

✅ Hash de contraseña con BCrypt  
✅ Firmas JWT HMAC-SHA256  
✅ Whitelist de CORS (solo orígenes autorizados)  
✅ Aplicación de HTTPS (Nginx + Cloudflare)  
✅ Expiración de token de 24 horas  
✅ Control de acceso basado en roles (RBAC)  
✅ Validación de entrada (@Valid @NotNull @Email)  
✅ Prevención de inyección SQL (consultas parametrizadas)  
✅ Protección XSS (sanitización de Angular)  
✅ Validación de carga de archivos (extensión & tamaño)

---

## 💾 Diseño de Base de Datos

### Diagrama de Relación de Entidades

```
USUARIOS (1) ◄──────── (N) NEGOCIOS (owner_id)
   │
   └──────(1:1)──────► TARJETAS_LEALTAD ◄────(N)──── PUNTOS
                           │
                           ├────(1:N)───► RECOMPENSAS
                           │
                           └────(1:N)───► NIVELES_FIDELIDAD

NEGOCIOS (1) ◄──────(1:1)──────► TEMAS_NEGOCIO
```

### Puntos Destacados del Esquema SQL

**Tabla de Usuarios:**
```sql
CREATE TABLE usuarios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,           -- Hash con BCrypt
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) UNIQUE,
    role ENUM('CUSTOMER','BUSINESS_OWNER') DEFAULT 'CUSTOMER',
    qr_code VARCHAR(64) UNIQUE NOT NULL,     -- Identificador único
    avatar_url VARCHAR(500),                 -- Ruta a avatar subido
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

**Tabla de Tarjetas de Lealtad:**
```sql
CREATE TABLE tarjetas_lealtad (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL,
    business_id BIGINT NOT NULL,
    total_puntos INT DEFAULT 10,             -- Configurable por negocio
    puntos_actuales INT DEFAULT 0,           -- Se incrementa al agregar punto
    tarjetas_completadas INT DEFAULT 0,      -- Rastrea ciclos completados
    status ENUM('ACTIVE','COMPLETED','REWARD_PENDING') DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id),
    FOREIGN KEY (business_id) REFERENCES negocios(id)
) ENGINE=InnoDB;
```

### ORM: Spring Data JPA

**¿Por qué JPA/Hibernate?**
- Elimina código SQL repetitivo
- Consultas type-safe vía repositorios de Spring Data
- Mapeo automático de relaciones
- Soporte para múltiples bases de datos

**Ejemplo:**
```java
public interface TarjetaLealtadRepository extends JpaRepository<TarjetaLealtad, Long> {
    Optional<TarjetaLealtad> findByUserIdAndBusinessId(Long userId, Long businessId);
}
```

---

## 🚀 Arquitectura de Deployment

### Infraestructura de Producción

```
Internet → Cloudflare (DDoS, Caché, DNS) → VPS
                                            ├─ Nginx (Proxy Inverso, SSL/TLS)
                                            │  ├─ App Angular (Puerto 80)
                                            │  ├─ API Spring Boot (Puerto 8080)
                                            │  └─ Archivos Estáticos
                                            │
                                            ├─ MySQL 8.0 (Puerto 3306)
                                            └─ Almacenamiento de Archivos (/uploads/)
```

### Configuración Docker Compose (Desarrollo & Staging)

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

## 📁 Estructura del Proyecto (Detallada)

### Estructura del Backend

```
backend/
├── pom.xml                          [POM de Maven]
├── src/main/java/com/loyalty/
│   ├── LoyaltyApplication.java      [Entrada Spring Boot]
│   ├── controller/                  [8 Controladores REST]
│   ├── service/                     [Lógica de Negocio]
│   ├── repository/                  [Spring Data JPA]
│   ├── entity/                      [Entidades JPA]
│   ├── dto/                         [Objetos de Transferencia de Datos]
│   ├── security/                    [JWT & Autenticación]
│   └── config/                      [Configuración y Manejo de Excepciones]
│
└── src/test/java/com/loyalty/       [Tests Unitarios e Integración]
```

### Estructura del Frontend

```
frontend/
├── angular.json                     [Configuración Angular CLI]
├── package.json                     [Dependencias npm]
├── src/
│   ├── index.html                   [Shell de la app]
│   ├── main.ts                      [Bootstrap]
│   ├── app/
│   │   ├── app.routes.ts            [Definición de rutas]
│   │   ├── pages/                   [13 páginas feature]
│   │   ├── services/                [Servicios de API]
│   │   ├── guards/                  [Guards de auth y rol]
│   │   ├── interceptors/            [Interceptores de auth y error]
│   │   ├── models/                  [Interfaces TypeScript]
│   │   └── assets/
│   │       ├── i18n/                [Traducciones EN, ES]
│   │       └── icons/               [Activos de iconos]
│   │
│   └── ngsw-config.json             [Configuración PWA]
```

---

## 📦 Instalación y Configuración

### Requisitos Previos

| Requisito | Versión | Propósito |
|-------------|---------|---------|
| **Java** | 21 LTS | Runtime del backend |
| **Maven** | 3.9+ | Herramienta de compilación |
| **Node.js** | 18+ | Tooling del frontend |
| **MySQL** | 8.0+ | Base de datos |
| **Docker** | 20.10+ | Containerización |

### Paso 1: Clonar y Configurar

```bash
git clone https://github.com/tuusuario/loyalty-app.git
cd loyalty-app
```

### Paso 2: Configurar Backend

```bash
# Crear base de datos MySQL
docker run --name loyalty-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=loyalty_db \
  -p 3306:3306 -d mysql:8.0

# O vía Docker Compose:
docker-compose up -d db

# Configurar en backend/src/main/resources/application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/loyalty_db

# Ejecutar backend
cd backend
mvn clean install
mvn spring-boot:run
# Backend: http://localhost:8080
```

### Paso 3: Configurar Frontend

```bash
cd frontend
npm install
ng serve
# Frontend: http://localhost:4200
```

### Paso 4: Verificar Instalación

```bash
# Probar health del backend
curl http://localhost:8080/actuator/health

# Probar registro
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prueba@ejemplo.com",
    "password": "Prueba123!",
    "firstName": "Prueba",
    "lastName": "Usuario",
    "role": "CUSTOMER"
  }'
```

---

## 🔌 Endpoints de API

### Autenticación

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Ninguno | Registrar usuario |
| POST | `/api/auth/login` | Ninguno | Login |

### Endpoints de Cliente

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/customer/card` | CUSTOMER | Obtener tarjeta de lealtad |
| GET | `/api/customer/qr` | CUSTOMER | Obtener imagen de código QR |
| GET | `/api/customer/profile` | CUSTOMER | Obtener perfil |
| PUT | `/api/customer/profile` | CUSTOMER | Actualizar perfil |
| POST | `/api/customer/avatar` | CUSTOMER | Subir avatar |

### Endpoints de Dueño de Negocio

| Método | Endpoint | Auth | Descripción |
|--------|----------|------|-------------|
| GET | `/api/admin/dashboard` | BUSINESS_OWNER | Estadísticas del dashboard |
| GET | `/api/admin/customers` | BUSINESS_OWNER | Listar clientes |
| GET | `/api/admin/customers/search?q=email` | BUSINESS_OWNER | Buscar clientes |
| POST | `/api/admin/stamps` | BUSINESS_OWNER | Agregar punto por ID |
| POST | `/api/admin/stamps/scan` | BUSINESS_OWNER | Agregar punto por QR |
| GET | `/api/admin/redemptions` | BUSINESS_OWNER | Listar recompensas |
| PUT | `/api/admin/redemptions/{id}` | BUSINESS_OWNER | Marcar como canjeada |
| GET | `/api/theme` | Ninguno | Obtener tema del negocio |
| PUT | `/api/theme` | BUSINESS_OWNER | Actualizar tema |

---

## 🐳 Ejecutar con Docker

### Todos los Servicios

```bash
docker-compose up --build

# O en background:
docker-compose up -d --build

# Ver logs:
docker-compose logs -f

# Detener:
docker-compose down
```

Acceso:
- **Frontend:** http://localhost
- **Backend:** http://localhost:8080
- **MySQL:** localhost:3306

---

## 🗺 Roadmap

### v1.0 (Actual - MVP)

✅ Registro & login de usuario  
✅ Autenticación JWT  
✅ Generación & escaneo de códigos QR  
✅ Seguimiento de puntos  
✅ Gestión de recompensas  
✅ Soporte PWA  
✅ Deployment con Docker  
✅ Multi-idioma (EN/ES)

### v1.1 (Corto plazo)

🔜 Notificaciones por email  
🔜 Analítica avanzada  
🔜 Optimización multi-tenencia

### v2.0 (Mediano plazo)

🔜 Integración de pagos (Stripe/PayPal)  
🔜 Soporte WebSocket  
🔜 Niveles de fidelización avanzados

### v3.0 (Largo plazo)

🔜 Machine learning (predicción de churn)  
🔜 Integración blockchain  
🔜 Marketplace global

---

## 📝 Contribuir

1. Crear rama de feature: `git checkout -b feature/tu-feature`
2. Probar cambios
3. Commit: `git commit -m "feat: descripción"`
4. Push: `git push origin feature/tu-feature`
5. Crear Pull Request

---

## 📄 Licencia

Licencia MIT - Ver archivo LICENSE para detalles.

---

## 👨‍💼 Autor

**Desarrollado por:** Tu Equipo de Desarrollo  
**Versión:** 1.0.0 (MVP)  
**Última Actualización:** Abril 2026

---

**Documentación completa disponible en:** [Docs](https://docs.loyaltyapp.com)


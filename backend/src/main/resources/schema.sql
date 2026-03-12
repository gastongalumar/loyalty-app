-- ============================================================
-- Loyalty Card System — MySQL Schema
-- Run this once to set up the database manually (optional,
-- Hibernate will auto-create via ddl-auto=update)
-- ============================================================

CREATE DATABASE IF NOT EXISTS loyalty_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE loyalty_db;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    first_name  VARCHAR(100)    NOT NULL,
    last_name   VARCHAR(100)    NOT NULL,
    phone       VARCHAR(30)     UNIQUE,
    role        ENUM('CUSTOMER','BUSINESS_OWNER') NOT NULL DEFAULT 'CUSTOMER',
    qr_code     VARCHAR(64)     NOT NULL UNIQUE,
    created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email  (email),
    INDEX idx_users_qr     (qr_code),
    INDEX idx_users_role   (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- BUSINESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    name                VARCHAR(200)    NOT NULL,
    description         TEXT,
    logo_url            VARCHAR(500),
    stamps_required     INT             NOT NULL DEFAULT 10,
    reward_description  VARCHAR(500)    NOT NULL,
    owner_id            BIGINT          NOT NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_business_owner
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- LOYALTY CARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_cards (
    id              BIGINT  NOT NULL AUTO_INCREMENT,
    user_id         BIGINT  NOT NULL UNIQUE,
    business_id     BIGINT  NOT NULL,
    total_stamps    INT     NOT NULL DEFAULT 10,
    current_stamps  INT     NOT NULL DEFAULT 0,
    completed_cards INT     NOT NULL DEFAULT 0,
    status          ENUM('ACTIVE','COMPLETED','REWARD_PENDING') NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_card_user
        FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
    CONSTRAINT fk_card_business
        FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
    INDEX idx_card_user     (user_id),
    INDEX idx_card_business (business_id),
    INDEX idx_card_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- STAMPS
-- ============================================================
CREATE TABLE IF NOT EXISTS stamps (
    id              BIGINT  NOT NULL AUTO_INCREMENT,
    loyalty_card_id BIGINT  NOT NULL,
    added_by_id     BIGINT  NOT NULL,
    note            VARCHAR(300),
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_stamp_card
        FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_stamp_added_by
        FOREIGN KEY (added_by_id)     REFERENCES users(id)         ON DELETE RESTRICT,
    INDEX idx_stamp_card       (loyalty_card_id),
    INDEX idx_stamp_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- REWARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS rewards (
    id              BIGINT  NOT NULL AUTO_INCREMENT,
    loyalty_card_id BIGINT  NOT NULL,
    description     VARCHAR(500) NOT NULL,
    status          ENUM('AVAILABLE','REDEEMED') NOT NULL DEFAULT 'AVAILABLE',
    earned_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    redeemed_at     DATETIME,
    PRIMARY KEY (id),
    CONSTRAINT fk_reward_card
        FOREIGN KEY (loyalty_card_id) REFERENCES loyalty_cards(id) ON DELETE CASCADE,
    INDEX idx_reward_card   (loyalty_card_id),
    INDEX idx_reward_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED DATA (optional demo data — remove in production)
-- ============================================================
-- INSERT INTO users (email, password, first_name, last_name, role, qr_code)
-- VALUES ('owner@demo.com', '$2a$10$...bcrypt...', 'Demo', 'Owner', 'BUSINESS_OWNER', 'DEMOOWNER01');
--
-- INSERT INTO businesses (name, description, stamps_required, reward_description, owner_id)
-- VALUES ('Demo Coffee', 'The best coffee in town', 10, 'Buy 10 coffees, get 1 FREE!', 1);

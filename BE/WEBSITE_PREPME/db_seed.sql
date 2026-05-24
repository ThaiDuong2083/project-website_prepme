-- ─────────────────────────────────────────────────────────────────────────────
-- PrepMe Auth Seed Data  (v2 — hỗ trợ phone + Google OAuth2)
-- ─────────────────────────────────────────────────────────────────────────────
-- Lưu ý: DDL (tạo bảng) do Hibernate ddl-auto=update tự xử lý.
-- File này chỉ chứa DML seed data (INSERT).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Roles (Quyền hạn)
INSERT IGNORE INTO roles (name, description, is_deleted, created_at, updated_at)
VALUES
    ('ADMIN',     'Quản trị viên toàn hệ thống',  false, NOW(), NOW()),
    ('USER',      'Người dùng tiêu chuẩn',          false, NOW(), NOW()),
    ('MODERATOR', 'Người kiểm duyệt nội dung',      false, NOW(), NOW());

-- 2. Users
-- ┌─────────────────────────────────────────────────────────────────────────┐
-- │ Admin account — đăng nhập LOCAL bằng email + password                  │
-- │ Password (plain): Admin@123                                             │
-- │ Password (BCrypt $2a$12): $2a$12$aO54B9bW/w/9.eA.U.zLxutd5C0Cj7JbK0H8m2BmV/Fp5y3X8yX7e │
-- └─────────────────────────────────────────────────────────────────────────┘
INSERT IGNORE INTO users (
    username, email, phone, password,
    full_name, is_active, email_verified, phone_verified,
    provider, google_id, is_deleted, created_at, updated_at
)
VALUES
    -- Tài khoản admin (LOCAL — email + password)
    ('admin', 'admin@fpt.edu.vn', NULL,
     '$2a$12$aO54B9bW/w/9.eA.U.zLxutd5C0Cj7JbK0H8m2BmV/Fp5y3X8yX7e',
     'System Administrator',
     true, true, false, 'LOCAL', NULL, false, NOW(), NOW()),

    -- Tài khoản demo LOCAL (đăng ký bằng SĐT)
    ('user_78901', NULL, '0987890123',
     '$2a$12$aO54B9bW/w/9.eA.U.zLxutd5C0Cj7JbK0H8m2BmV/Fp5y3X8yX7e',
     'Demo Phone User',
     true, false, false, 'LOCAL', NULL, false, NOW(), NOW()),

    -- Tài khoản demo GOOGLE (đăng nhập bằng Google, không có password)
    ('demo_google', 'google.demo@gmail.com', NULL, NULL,
     'Google Demo User',
     true, true, false, 'GOOGLE', '118362741234567890123', false, NOW(), NOW());

-- 3. User_Roles (Cấp quyền)
-- Admin → ADMIN role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ADMIN';

-- Phone user → USER role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'user_78901' AND r.name = 'USER';

-- Google user → USER role
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT u.id, r.id FROM users u, roles r
WHERE u.username = 'demo_google' AND r.name = 'USER';

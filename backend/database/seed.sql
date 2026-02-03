-- Seed data

-- Default admin user (password: admin123)
INSERT INTO users (email, password_hash) VALUES 
('admin@piercloud.io', '$2a$10$IbXylVbPsj2AE3YMp9fnZut79YXGdTAdd4P8r8ZckKNrYrudRmqVC');

-- Sample services
INSERT INTO services (name, description, status, position) VALUES 
('API', 'Main API Service', 'operational', 1),
('Website', 'Main Website', 'operational', 2),
('Database', 'PostgreSQL Database', 'operational', 3),
('CDN', 'Content Delivery Network', 'operational', 4);

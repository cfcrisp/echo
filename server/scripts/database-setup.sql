-- Create database (run this separately if needed)
-- CREATE DATABASE echo_db;

-- Connect to the database
-- \c echo_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'Active',
  revenue INTEGER NOT NULL DEFAULT 0,
  tier VARCHAR(50) NOT NULL DEFAULT 'Commercial',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Requests table
CREATE TABLE requests (
  id VARCHAR(20) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) NOT NULL DEFAULT 'Medium',
  effort INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Customer requests junction table
CREATE TABLE customer_requests (
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  request_id VARCHAR(20) REFERENCES requests(id) ON DELETE CASCADE,
  PRIMARY KEY (customer_id, request_id)
);

-- Request labels table
CREATE TABLE request_labels (
  request_id VARCHAR(20) REFERENCES requests(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL,
  PRIMARY KEY (request_id, label)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id VARCHAR(20) REFERENCES requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
-- Sample users
INSERT INTO users (id, name, email, password, role) VALUES
  (uuid_generate_v4(), 'Admin User', 'admin@echo.com', '$2b$10$xLRGxmVFsf5BPHqOzfmTwuEn/9QnQJj5OGUfLCNV9xpY4Q3kHDUxe', 'admin'),
  (uuid_generate_v4(), 'Agent User', 'agent@echo.com', '$2b$10$xLRGxmVFsf5BPHqOzfmTwuEn/9QnQJj5OGUfLCNV9xpY4Q3kHDUxe', 'member');

-- Sample customers
INSERT INTO customers (id, name, stage, revenue, tier, user_id) VALUES
  (uuid_generate_v4(), 'Acme Corporation', 'Active', 250000, 'Enterprise', (SELECT id FROM users WHERE email = 'admin@echo.com')),
  (uuid_generate_v4(), 'Globex Industries', 'Active', 500000, 'Strategic', (SELECT id FROM users WHERE email = 'admin@echo.com')),
  (uuid_generate_v4(), 'Initech Solutions', 'Active', 120000, 'Commercial', (SELECT id FROM users WHERE email = 'admin@echo.com')),
  (uuid_generate_v4(), 'Umbrella Corp', 'Active', 350000, 'Enterprise', (SELECT id FROM users WHERE email = 'admin@echo.com')),
  (uuid_generate_v4(), 'Stark Industries', 'Active', 750000, 'Strategic', (SELECT id FROM users WHERE email = 'admin@echo.com')),
  (uuid_generate_v4(), 'Wayne Enterprises', 'Prospect', 0, 'Enterprise', (SELECT id FROM users WHERE email = 'agent@echo.com')),
  (uuid_generate_v4(), 'Cyberdyne Systems', 'Churned', 0, 'Commercial', (SELECT id FROM users WHERE email = 'agent@echo.com'));

-- Sample requests
INSERT INTO requests (id, title, priority, effort, status, position, user_id) VALUES
  ('REQ-001', 'API Integration with Salesforce', 'High', 3, 'In Progress', 1, (SELECT id FROM users WHERE email = 'admin@echo.com')),
  ('REQ-002', 'Mobile App Notifications', 'Critical', 2, 'In Review', 1, (SELECT id FROM users WHERE email = 'admin@echo.com')),
  ('REQ-003', 'Dashboard Redesign', 'Medium', 4, 'Not Started', 2, (SELECT id FROM users WHERE email = 'admin@echo.com')),
  ('REQ-004', 'User Authentication Flow', 'High', 3, 'In Progress', 2, (SELECT id FROM users WHERE email = 'agent@echo.com')),
  ('REQ-005', 'Payment Gateway Integration', 'Critical', 5, 'In Review', 1, (SELECT id FROM users WHERE email = 'agent@echo.com')),
  ('REQ-006', 'Export to CSV/Excel', 'Low', 1, 'Completed', 3, (SELECT id FROM users WHERE email = 'admin@echo.com')),
  ('REQ-007', 'Role-based Access Control', 'Medium', 4, 'Not Started', 3, (SELECT id FROM users WHERE email = 'agent@echo.com')),
  ('REQ-008', 'Custom Reporting Engine', 'High', 5, 'Blocked', 2, (SELECT id FROM users WHERE email = 'admin@echo.com'));

-- Link customers to requests
INSERT INTO customer_requests (customer_id, request_id) VALUES
  ((SELECT id FROM customers WHERE name = 'Acme Corporation'), 'REQ-001'),
  ((SELECT id FROM customers WHERE name = 'Globex Industries'), 'REQ-001'),
  ((SELECT id FROM customers WHERE name = 'Acme Corporation'), 'REQ-002'),
  ((SELECT id FROM customers WHERE name = 'Stark Industries'), 'REQ-002'),
  ((SELECT id FROM customers WHERE name = 'Initech Solutions'), 'REQ-003'),
  ((SELECT id FROM customers WHERE name = 'Umbrella Corp'), 'REQ-003'),
  ((SELECT id FROM customers WHERE name = 'Globex Industries'), 'REQ-004'),
  ((SELECT id FROM customers WHERE name = 'Stark Industries'), 'REQ-004'),
  ((SELECT id FROM customers WHERE name = 'Acme Corporation'), 'REQ-005'),
  ((SELECT id FROM customers WHERE name = 'Umbrella Corp'), 'REQ-005'),
  ((SELECT id FROM customers WHERE name = 'Initech Solutions'), 'REQ-006'),
  ((SELECT id FROM customers WHERE name = 'Globex Industries'), 'REQ-007'),
  ((SELECT id FROM customers WHERE name = 'Stark Industries'), 'REQ-007'),
  ((SELECT id FROM customers WHERE name = 'Acme Corporation'), 'REQ-008'),
  ((SELECT id FROM customers WHERE name = 'Umbrella Corp'), 'REQ-008'),
  ((SELECT id FROM customers WHERE name = 'Stark Industries'), 'REQ-008');

-- Add labels to requests
INSERT INTO request_labels (request_id, label) VALUES
  ('REQ-001', 'Integration'),
  ('REQ-001', 'API'),
  ('REQ-002', 'Mobile'),
  ('REQ-002', 'UX'),
  ('REQ-003', 'UI'),
  ('REQ-003', 'Dashboard'),
  ('REQ-004', 'Security'),
  ('REQ-004', 'UX'),
  ('REQ-005', 'Integration'),
  ('REQ-005', 'Payments'),
  ('REQ-006', 'Data'),
  ('REQ-006', 'Export'),
  ('REQ-007', 'Security'),
  ('REQ-007', 'Admin'),
  ('REQ-008', 'Reporting'),
  ('REQ-008', 'Data');

-- Add sample comments
INSERT INTO comments (request_id, user_id, content) VALUES
  ('REQ-001', (SELECT id FROM users WHERE email = 'admin@echo.com'), 'Initial requirements gathered from the client.'),
  ('REQ-001', (SELECT id FROM users WHERE email = 'agent@echo.com'), 'Started working on the API endpoints.'),
  ('REQ-002', (SELECT id FROM users WHERE email = 'admin@echo.com'), 'Need to finalize the notification templates.'),
  ('REQ-004', (SELECT id FROM users WHERE email = 'agent@echo.com'), 'Security review scheduled for next week.'),
  ('REQ-005', (SELECT id FROM users WHERE email = 'admin@echo.com'), 'Waiting for API credentials from the payment provider.');

-- Add sample activities
INSERT INTO activities (user_id, action, target_type, target_id) VALUES
  ((SELECT id FROM users WHERE email = 'admin@echo.com'), 'created', 'request', 'REQ-001'),
  ((SELECT id FROM users WHERE email = 'agent@echo.com'), 'updated', 'request', 'REQ-001'),
  ((SELECT id FROM users WHERE email = 'admin@echo.com'), 'created', 'request', 'REQ-002'),
  ((SELECT id FROM users WHERE email = 'admin@echo.com'), 'updated', 'request', 'REQ-002'),
  ((SELECT id FROM users WHERE email = 'agent@echo.com'), 'commented on', 'request', 'REQ-001');


-- Create users table for Menu Analyzer
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  business_name VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Create policy for service role to manage all users (for API operations)
CREATE POLICY "Service role can manage all users" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Insert sample data (your existing users from users.json)
INSERT INTO users (id, email, password, name, business_name, phone) VALUES
  ('1756116448804'::text::uuid, 'revathykrishna@mailinator.com', 'Hello#123', 'Revathy', 'Revathy''s', NULL),
  ('1756117004294'::text::uuid, 'veenagkrishna01@gmail.com', 'Hello#123', 'Veena Krishnan', 'TEst', NULL),
  ('1756119326345'::text::uuid, 'ajaisajin@gmail.com', 'Hello#123', 'Ajai', 'Aj''s', NULL),
  ('1756195322337'::text::uuid, 'ajaisajin95@gmail.com', 'Alexa321', 'Ajai Sajin', 'Ajai', '+919688249795')
ON CONFLICT (email) DO NOTHING;

-- Create a view for user profiles (without passwords)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    id,
    email,
    name,
    business_name,
    phone,
    created_at,
    updated_at
FROM users;
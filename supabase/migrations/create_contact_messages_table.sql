-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (anyone visiting the website can send a message)
CREATE POLICY "Allow anonymous inserts" ON contact_messages
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to view messages (admin dashboard)
CREATE POLICY "Allow authenticated users to select" ON contact_messages
  FOR SELECT TO authenticated USING (true);

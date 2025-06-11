-- SQL script to create the fan_photos table in Supabase
-- Run this in the Supabase SQL editor to set up the gallery functionality

-- Create the fan_photos table
CREATE TABLE IF NOT EXISTS fan_photos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  name VARCHAR NOT NULL,
  image_data TEXT NOT NULL,
  caption TEXT,
  status VARCHAR NOT NULL DEFAULT 'pending',
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create an index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_fan_photos_status ON fan_photos(status);

-- Create an index on created_at for faster ordering
CREATE INDEX IF NOT EXISTS idx_fan_photos_created_at ON fan_photos(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE fan_photos ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to approved photos
CREATE POLICY "Anyone can view approved photos" ON fan_photos
  FOR SELECT USING (status = 'approved');

-- Create policy for authenticated users to insert photos
CREATE POLICY "Authenticated users can insert photos" ON fan_photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy for admin users to manage all photos
CREATE POLICY "Admin users can manage all photos" ON fan_photos
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'admin' OR 
    auth.jwt() ->> 'email' IN (
      'admin@cuca.com', 
      'admin@example.com'
    )
  );

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_fan_photos_updated_at 
  BEFORE UPDATE ON fan_photos 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data for testing (optional)
INSERT INTO fan_photos (name, image_data, caption, status, approved_by, approved_at) VALUES
  ('João Silva', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'Curtindo uma CUCA gelada!', 'approved', 'admin', NOW()),
  ('Maria Santos', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'Momento perfeito com amigos', 'pending'),
  ('Pedro Costa', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=', 'CUCA sempre presente!', 'approved', 'admin', NOW());

COMMENT ON TABLE fan_photos IS 'Tabela para armazenar fotos enviadas pelos fãs da CUCA';
COMMENT ON COLUMN fan_photos.image_data IS 'Dados da imagem em formato base64';
COMMENT ON COLUMN fan_photos.status IS 'Status da foto: pending, approved, rejected';
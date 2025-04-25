-- Create chapter_requests table
CREATE TABLE IF NOT EXISTS public.chapter_requests (
  id SERIAL PRIMARY KEY,
  chapter_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  preferred_date DATE NOT NULL,
  alternate_date DATE,
  estimated_attendees INTEGER NOT NULL,
  instructor_name TEXT NOT NULL,
  additional_info TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create workshop_sessions table
CREATE TABLE IF NOT EXISTS public.workshop_sessions (
  id SERIAL PRIMARY KEY,
  chapter_name TEXT NOT NULL,
  workshop_date DATE NOT NULL,
  instructor_name TEXT NOT NULL,
  max_attendees INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  request_id INTEGER REFERENCES public.chapter_requests(id),
  reported_to_cfp_board BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create participants table
CREATE TABLE IF NOT EXISTS public.participants (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  cfp_id TEXT NOT NULL,
  email TEXT NOT NULL,
  session_id INTEGER REFERENCES public.workshop_sessions(id),
  attendance_confirmed BOOLEAN NOT NULL DEFAULT true,
  reported_to_cfp_board BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.chapter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
CREATE POLICY "Enable all operations for authenticated users" 
  ON public.chapter_requests 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" 
  ON public.workshop_sessions 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Enable all operations for authenticated users" 
  ON public.participants 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- Enable anon access for read operations
CREATE POLICY "Enable read access for anonymous users" 
  ON public.chapter_requests 
  FOR SELECT 
  TO anon 
  USING (true);

CREATE POLICY "Enable read access for anonymous users" 
  ON public.workshop_sessions 
  FOR SELECT 
  TO anon 
  USING (true);
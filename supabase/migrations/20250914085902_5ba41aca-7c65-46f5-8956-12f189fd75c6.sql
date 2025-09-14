-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT,
  phone_number TEXT,
  preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'hi')),
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create route analyses table
CREATE TABLE public.route_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  origin_lat DECIMAL(10, 8),
  origin_lng DECIMAL(11, 8),
  destination_lat DECIMAL(10, 8),
  destination_lng DECIMAL(11, 8),
  travel_time TIMESTAMP WITH TIME ZONE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  short_reason TEXT NOT NULL,
  detailed_reason JSONB NOT NULL,
  recommended_route TEXT,
  analysis_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergency contacts table
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('police', 'hospital', 'helpline', 'fire')),
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  distance_km DECIMAL(5, 2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat sessions table
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  route_analysis_id UUID REFERENCES public.route_analyses(id) ON DELETE SET NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  session_type TEXT DEFAULT 'route_safety' CHECK (session_type IN ('route_safety', 'general', 'emergency')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create risk factors table
CREATE TABLE public.risk_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  factor_type TEXT NOT NULL CHECK (factor_type IN ('lighting', 'crime', 'traffic', 'infrastructure', 'crowd')),
  risk_level INTEGER NOT NULL CHECK (risk_level >= 1 AND risk_level <= 5),
  description TEXT,
  time_periods JSONB DEFAULT '[]', -- Array of time periods when this factor is relevant
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create safety incidents table
CREATE TABLE public.safety_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incident_type TEXT NOT NULL CHECK (incident_type IN ('theft', 'assault', 'harassment', 'accident', 'other')),
  location_name TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 5),
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  public_data BOOLEAN DEFAULT true, -- Whether this can be used in analysis
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_incidents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for route_analyses
CREATE POLICY "Users can view their own route analyses"
ON public.route_analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own route analyses"
ON public.route_analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own route analyses"
ON public.route_analyses FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for emergency_contacts (public read access)
CREATE POLICY "Anyone can view emergency contacts"
ON public.emergency_contacts FOR SELECT
USING (true);

-- Create RLS policies for chat_sessions
CREATE POLICY "Users can view their own chat sessions"
ON public.chat_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
ON public.chat_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
ON public.chat_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- Create RLS policies for risk_factors (public read, authenticated write)
CREATE POLICY "Anyone can view risk factors"
ON public.risk_factors FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create risk factors"
ON public.risk_factors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

-- Create RLS policies for safety_incidents (public read for verified incidents)
CREATE POLICY "Anyone can view verified public incidents"
ON public.safety_incidents FOR SELECT
USING (verified = true AND public_data = true);

CREATE POLICY "Users can view their own reported incidents"
ON public.safety_incidents FOR SELECT
USING (auth.uid() = reported_by);

CREATE POLICY "Authenticated users can create incidents"
ON public.safety_incidents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reported_by);

-- Create indexes for performance
CREATE INDEX idx_route_analyses_user_created ON public.route_analyses(user_id, created_at DESC);
CREATE INDEX idx_emergency_contacts_city ON public.emergency_contacts(city, contact_type);
CREATE INDEX idx_emergency_contacts_location ON public.emergency_contacts(lat, lng);
CREATE INDEX idx_chat_sessions_user_active ON public.chat_sessions(user_id, is_active, created_at DESC);
CREATE INDEX idx_risk_factors_location ON public.risk_factors(lat, lng, factor_type);
CREATE INDEX idx_safety_incidents_location_date ON public.safety_incidents(lat, lng, incident_date DESC);
CREATE INDEX idx_safety_incidents_verified_public ON public.safety_incidents(verified, public_data, incident_date DESC);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergency_contacts_updated_at
  BEFORE UPDATE ON public.emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, preferred_language)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert sample emergency contacts for demo
INSERT INTO public.emergency_contacts (name, phone_number, contact_type, address, city, state, lat, lng) VALUES
('Bandra Police Station', '+91-22-26422222', 'police', 'Hill Road, Bandra West', 'Mumbai', 'Maharashtra', 19.0596, 72.8295),
('Andheri Police Station', '+91-22-26392237', 'police', 'S.V. Road, Andheri West', 'Mumbai', 'Maharashtra', 19.1136, 72.8697),
('Mumbai Police Control Room', '100', 'police', 'Mumbai Police Headquarters', 'Mumbai', 'Maharashtra', 18.9322, 72.8264),
('Women Helpline Mumbai', '1091', 'helpline', 'Mumbai Women Safety', 'Mumbai', 'Maharashtra', 18.9322, 72.8264),
('Cooper Hospital', '+91-22-26602288', 'hospital', 'J.V.P.D. Scheme, Juhu', 'Mumbai', 'Maharashtra', 19.1075, 72.8263),
('Lilavati Hospital', '+91-22-26567777', 'hospital', 'A-791, Bandra Reclamation', 'Mumbai', 'Maharashtra', 19.0501, 72.8326);
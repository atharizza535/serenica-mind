-- Create role enum for users
CREATE TYPE public.app_role AS ENUM ('patient', 'psychologist');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- Create profiles table (references auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'patient',
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create psychologists table (extended profile for therapists)
CREATE TABLE public.psychologists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  license_number TEXT NOT NULL,
  session_fee DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  years_experience INTEGER DEFAULT 0,
  available_days TEXT[] DEFAULT '{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  psychologist_id UUID NOT NULL REFERENCES public.psychologists(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'PENDING',
  payment_link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create mood_logs table for AI analysis
CREATE TABLE public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  journal_text TEXT NOT NULL,
  ai_analysis JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view psychologist profiles"
  ON public.profiles FOR SELECT
  USING (role = 'psychologist');

-- Psychologists policies (public read for browsing)
CREATE POLICY "Anyone can view psychologists"
  ON public.psychologists FOR SELECT
  USING (true);

CREATE POLICY "Psychologists can update their own data"
  ON public.psychologists FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Psychologists can insert their own data"
  ON public.psychologists FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Bookings policies
CREATE POLICY "Patients can view their own bookings"
  ON public.bookings FOR SELECT
  USING (patient_id = auth.uid());

CREATE POLICY "Psychologists can view bookings for them"
  ON public.bookings FOR SELECT
  USING (psychologist_id IN (SELECT id FROM public.psychologists WHERE profile_id = auth.uid()));

CREATE POLICY "Patients can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (patient_id = auth.uid());

CREATE POLICY "Psychologists can update their bookings"
  ON public.bookings FOR UPDATE
  USING (psychologist_id IN (SELECT id FROM public.psychologists WHERE profile_id = auth.uid()));

-- Mood logs policies (private to user)
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'patient')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_psychologists_updated_at
  BEFORE UPDATE ON public.psychologists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
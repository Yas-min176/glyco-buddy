-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE,
  user_type TEXT NOT NULL DEFAULT 'patient' CHECK (user_type IN ('patient', 'caregiver', 'doctor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dosage rules table (editable by user)
CREATE TABLE public.dosage_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  min_glucose INT NOT NULL,
  max_glucose INT,
  insulin_units INT,
  recommendation TEXT NOT NULL,
  is_emergency BOOLEAN DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create glucose readings table
CREATE TABLE public.glucose_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  value INT NOT NULL,
  recommendation TEXT,
  insulin_units INT,
  status TEXT NOT NULL,
  is_fasting BOOLEAN DEFAULT false,
  meal_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient-caregiver connections
CREATE TABLE public.patient_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, caregiver_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosage_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_connections ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Caregivers/Doctors can view connected patient profiles
CREATE POLICY "Caregivers can view connected patient profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_connections
      WHERE patient_id = profiles.user_id
      AND caregiver_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Dosage rules policies
CREATE POLICY "Users can manage their own dosage rules"
  ON public.dosage_rules FOR ALL
  USING (auth.uid() = user_id);

-- Glucose readings policies
CREATE POLICY "Users can manage their own readings"
  ON public.glucose_readings FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Caregivers can view connected patient readings"
  ON public.glucose_readings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_connections
      WHERE patient_id = glucose_readings.user_id
      AND caregiver_id = auth.uid()
      AND status = 'accepted'
    )
  );

-- Patient connections policies
CREATE POLICY "Patients can view their connections"
  ON public.patient_connections FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Caregivers can view their connections"
  ON public.patient_connections FOR SELECT
  USING (auth.uid() = caregiver_id);

CREATE POLICY "Patients can create connection requests"
  ON public.patient_connections FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Caregivers can update connection status"
  ON public.patient_connections FOR UPDATE
  USING (auth.uid() = caregiver_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'));
  
  -- Insert default dosage rules for new patient
  INSERT INTO public.dosage_rules (user_id, min_glucose, max_glucose, insulin_units, recommendation, is_emergency, display_order)
  VALUES
    (NEW.id, 450, NULL, 4, 'Tome 4 unidades de insulina humana regular.', true, 1),
    (NEW.id, 350, 449, 3, 'Tome 3 unidades de insulina humana regular.', false, 2),
    (NEW.id, 250, 349, 2, 'Tome 2 unidades de insulina humana regular.', false, 3),
    (NEW.id, 0, 60, NULL, 'Coma um alimento doce IMEDIATAMENTE e vá ao hospital caso a condição se mantenha.', true, 4),
    (NEW.id, 61, 89, NULL, 'Coma um alimento doce para elevar a glicemia.', false, 5),
    (NEW.id, 90, 249, NULL, 'Glicemia estável. Continue monitorando normalmente.', false, 6);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for glucose readings (for caregiver alerts)
ALTER PUBLICATION supabase_realtime ADD TABLE public.glucose_readings;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dosage_rules_updated_at
  BEFORE UPDATE ON public.dosage_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
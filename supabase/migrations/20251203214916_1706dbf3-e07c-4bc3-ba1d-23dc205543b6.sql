-- Add dosage calculation columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS dosage_calculation_type TEXT NOT NULL DEFAULT 'rules' CHECK (dosage_calculation_type IN ('rules', 'formula'));

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS insulin_formula TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS insulin_type TEXT;
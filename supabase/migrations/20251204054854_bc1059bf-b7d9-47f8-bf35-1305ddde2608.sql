-- Create a trigger function to prevent user_type changes after initial creation
CREATE OR REPLACE FUNCTION public.prevent_user_type_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow if this is the first time user_type is being set (from default 'patient')
  -- or if the value hasn't changed
  IF OLD.user_type IS NOT NULL AND OLD.user_type != NEW.user_type THEN
    RAISE EXCEPTION 'User type cannot be changed after initial registration';
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger to enforce the rule
DROP TRIGGER IF EXISTS enforce_user_type_immutable ON public.profiles;
CREATE TRIGGER enforce_user_type_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_user_type_change();
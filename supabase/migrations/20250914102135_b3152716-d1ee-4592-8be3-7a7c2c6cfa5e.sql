-- Fix the contact_type check constraint to allow the correct values
ALTER TABLE public.emergency_contacts 
DROP CONSTRAINT IF EXISTS emergency_contacts_contact_type_check;

-- Add correct check constraint with the values used in the form
ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT emergency_contacts_contact_type_check 
CHECK (contact_type IN ('family', 'friend', 'doctor', 'police', 'other'));
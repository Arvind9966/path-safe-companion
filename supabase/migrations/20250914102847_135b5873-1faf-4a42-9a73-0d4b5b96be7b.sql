-- Drop the existing constraint
ALTER TABLE public.emergency_contacts 
DROP CONSTRAINT emergency_contacts_contact_type_check;

-- Update existing data to match new values
UPDATE public.emergency_contacts 
SET contact_type = 'doctor' 
WHERE contact_type = 'hospital';

UPDATE public.emergency_contacts 
SET contact_type = 'other' 
WHERE contact_type IN ('helpline', 'fire');

-- Add new constraint with form values
ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT emergency_contacts_contact_type_check 
CHECK (contact_type IN ('family', 'friend', 'doctor', 'police', 'other'));
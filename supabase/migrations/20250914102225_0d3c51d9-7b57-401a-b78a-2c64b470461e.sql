-- First update invalid contact_type values to match the form options
UPDATE public.emergency_contacts 
SET contact_type = 'other' 
WHERE contact_type = 'helpline';

UPDATE public.emergency_contacts 
SET contact_type = 'doctor' 
WHERE contact_type = 'hospital';

-- Now add the check constraint with the correct values
ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT emergency_contacts_contact_type_check 
CHECK (contact_type IN ('family', 'friend', 'doctor', 'police', 'other'));
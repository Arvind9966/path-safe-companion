-- Add the check constraint for contact_type values
ALTER TABLE public.emergency_contacts 
ADD CONSTRAINT emergency_contacts_contact_type_check 
CHECK (contact_type IN ('family', 'friend', 'doctor', 'police', 'other'));
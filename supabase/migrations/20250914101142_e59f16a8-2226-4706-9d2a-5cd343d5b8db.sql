-- Update emergency_contacts table to allow users to manage their own emergency contacts
ALTER TABLE public.emergency_contacts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create policy for users to insert their own emergency contacts
CREATE POLICY "Users can create their own emergency contacts"
ON public.emergency_contacts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own emergency contacts  
CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for users to view their own emergency contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts  
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy for users to delete their own emergency contacts
CREATE POLICY "Users can delete their own emergency contacts"
ON public.emergency_contacts
FOR DELETE  
TO authenticated
USING (auth.uid() = user_id);
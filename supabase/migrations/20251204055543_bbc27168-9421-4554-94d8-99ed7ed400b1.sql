-- Allow caregivers to view dosage rules for their connected patients
CREATE POLICY "Caregivers can view connected patient dosage rules"
ON public.dosage_rules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM patient_connections
    WHERE patient_connections.patient_id = dosage_rules.user_id
    AND patient_connections.caregiver_id = auth.uid()
    AND patient_connections.status = 'accepted'
  )
);

-- Allow patients to delete their own connections
CREATE POLICY "Patients can delete their own connections"
ON public.patient_connections
FOR DELETE
USING (auth.uid() = patient_id);

-- Allow caregivers to delete their own connections  
CREATE POLICY "Caregivers can delete their own connections"
ON public.patient_connections
FOR DELETE
USING (auth.uid() = caregiver_id);
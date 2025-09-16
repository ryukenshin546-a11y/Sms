-- Create a function for initial profile creation during registration
-- This bypasses RLS for the initial insert during registration

CREATE OR REPLACE FUNCTION create_user_profile(
  user_id uuid,
  profile_data jsonb
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert profile data during registration
  INSERT INTO profiles (
    id,
    username,
    email,
    first_name,
    last_name,
    phone,
    account_type,
    email_verified,
    phone_verified,
    credit_balance,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    profile_data->>'username',
    profile_data->>'email',
    profile_data->>'first_name',
    profile_data->>'last_name',
    profile_data->>'phone',
    profile_data->>'account_type',
    COALESCE((profile_data->>'email_verified')::boolean, false),
    COALESCE((profile_data->>'phone_verified')::boolean, false),
    COALESCE((profile_data->>'credit_balance')::numeric, 0),
    NOW(),
    NOW()
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(uuid, jsonb) TO anon;

-- Alternative: Create a more permissive INSERT policy for new users
CREATE POLICY "allow_initial_profile_creation" ON profiles
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (
    -- Allow if user is creating their own profile AND profile doesn't exist yet
    auth.uid() = id OR (
      SELECT COUNT(*) FROM profiles WHERE id = auth.uid()
    ) = 0
  );
# ระบบสมาชิกใหม่ - Simple & Standard

## 1. Database Schema ที่เรียบง่าย

```sql
-- ตาราง users (ใช้ Supabase auth.users เป็นหลัก)
-- ไม่ต้องสร้าง profiles table แยก

-- ตาราง user_profiles (เฉพาะข้อมูลเพิ่มเติม)
CREATE TABLE public.user_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  first_name text,
  last_name text,
  phone text,
  account_type text DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
  
  -- Business fields (optional)
  company_name text,
  tax_id text,
  business_address text,
  
  -- System fields
  credit_balance decimal DEFAULT 100,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 2. Frontend Flow ที่เรียบง่าย

```typescript
// Single-step registration
interface RegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: 'personal' | 'business';
  
  // Business fields (conditional)
  companyName?: string;
  taxId?: string;
  businessAddress?: string;
}

// Registration process
const registerUser = async (data: RegistrationData) => {
  // 1. Create auth user
  const { user, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password
  });
  
  // 2. Create profile (after email confirmation)
  if (user) {
    await createUserProfile(user.id, data);
  }
};
```

## 3. Backend API ที่สอดคล้อง

```typescript
// Simple API endpoints
POST /api/auth/register     // Create user + send verification email
POST /api/auth/verify       // Verify email + create profile
POST /api/auth/login        // Standard login
POST /api/profile/update    // Update user profile

// No complex multi-step, no race conditions, no duplicate handling
```

## 4. Authentication Flow

```
1. User fills registration form
2. Click "Register" → Send verification email
3. User clicks email link → Account activated + Profile created
4. Redirect to dashboard

Simple. Standard. Works.
```

## 5. Benefits

✅ **Simple**: Single-step process, no complex state management
✅ **Standard**: Follows common auth patterns
✅ **Reliable**: No race conditions, no duplicate keys
✅ **Maintainable**: Clean code, easy to understand
✅ **Scalable**: Standard Supabase patterns
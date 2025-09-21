# Real Supabase Database Connection Guide

## 🔌 **How to Connect to Real Supabase Database**

### **📋 Prerequisites**
1. Active Supabase project
2. Correct API keys from Supabase Dashboard
3. Proper database schema (tables created)

---

## 🔑 **Step 1: Update API Keys**

### **Get Real Supabase Credentials**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy the following:
   - **Project URL** 
   - **Anon/Public Key** 
   - **Service Role Key** (if needed)

### **Update Environment Variables**
Edit `.env` file:
```properties
# Real Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_CLIENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-real-key
VITE_SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-real-service-key
```

---

## 🗄️ **Step 2: Verify Database Schema**

### **Required Tables**
Your database should have these tables:

```sql
-- OTP Verifications (Main table)
CREATE TABLE otp_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    formatted_phone text NOT NULL,
    phone_number text NOT NULL,
    otp_code text NOT NULL,
    status text DEFAULT 'pending',
    expires_at timestamptz NOT NULL,
    created_at timestamptz DEFAULT now(),
    verified_at timestamptz,
    verification_attempts integer DEFAULT 0,
    external_service text,
    external_otp_id text,
    session_token text
);

-- Phone Verifications
CREATE TABLE phone_verifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number text NOT NULL,
    status text DEFAULT 'pending',
    created_at timestamptz DEFAULT now()
);

-- Verified Phone Numbers
CREATE TABLE verified_phone_numbers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number text NOT NULL UNIQUE,
    verified_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);
```

---

## 🧪 **Step 3: Test Real Database Connection**

### **Option A: Command Line Test**
```bash
# Navigate to test directory
cd src/test

# Update realDatabaseTest.cjs with your credentials
# Then run:
node realDatabaseTest.cjs
```

### **Option B: Web Interface Test**
1. Start the development server: `npm run dev`
2. Go to `http://localhost:2020/performance`
3. Click "Start Performance Tests"

---

## 🔧 **Step 4: Update Test Files (If Needed)**

### **Update realDatabaseTest.cjs**
Replace the hardcoded credentials:
```javascript
// Replace these with your real credentials
const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseAnonKey = 'your-real-anon-key-here';
```

### **Or Use Environment Variables**
```javascript
// Better approach - use environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_CLIENT_API_KEY;
```

---

## 🚨 **Common Issues & Solutions**

### **❌ "Invalid API key" Error**
- **Cause**: Wrong or expired API key
- **Solution**: Get fresh keys from Supabase Dashboard → Settings → API

### **❌ "Table does not exist" Error**  
- **Cause**: Database schema not created
- **Solution**: Run the SQL commands above to create tables

### **❌ "Permission denied" Error**
- **Cause**: RLS (Row Level Security) policies blocking access
- **Solutions**:
  1. Disable RLS temporarily for testing:
     ```sql
     ALTER TABLE otp_verifications DISABLE ROW LEVEL SECURITY;
     ```
  2. Or create proper RLS policies for your use case

### **❌ Connection timeout**
- **Cause**: Network issues or wrong URL
- **Solution**: 
  1. Check internet connection
  2. Verify Supabase project URL
  3. Ensure project is not paused/suspended

---

## 📊 **Expected Real Database Performance**

### **Typical Response Times**
- **Simple queries**: 50-150ms
- **Complex queries**: 100-300ms  
- **Insert operations**: 80-200ms
- **Update operations**: 70-180ms

### **Factors Affecting Performance**
1. **Geographic location** (distance to Supabase servers)
2. **Internet connection speed**
3. **Database load** (other users/queries)
4. **Query complexity**
5. **Data volume**

---

## ✅ **Verification Checklist**

Before running real database tests:

- [ ] ✅ Supabase project is active and not paused
- [ ] ✅ Database tables are created with correct schema
- [ ] ✅ API keys are updated and correct
- [ ] ✅ Environment variables are set properly
- [ ] ✅ Network connection is stable
- [ ] ✅ RLS policies allow the operations (or RLS disabled for testing)

---

## 🎯 **Next Steps After Real Database Testing**

### **If Tests Pass**
1. 🎉 **Compare results** with mock test baseline
2. 📊 **Identify performance differences**
3. 🔧 **Apply any needed optimizations**
4. 📈 **Set up monitoring** for ongoing performance tracking

### **If Tests Fail**
1. 🔍 **Check error messages** for specific issues
2. 🔧 **Fix database schema** or permissions
3. 📞 **Contact Supabase support** if needed
4. 🧪 **Re-run tests** after fixes

---

## 🛠️ **Performance Optimization Tips**

### **Database Indexes**
Add these indexes for better performance:
```sql
-- Index for phone number lookups
CREATE INDEX idx_otp_phone_status ON otp_verifications(formatted_phone, status);

-- Index for recent records
CREATE INDEX idx_otp_created_at ON otp_verifications(created_at DESC);

-- Index for verification status
CREATE INDEX idx_otp_status_expires ON otp_verifications(status, expires_at);
```

### **Connection Optimization**
```javascript
// Use connection pooling for high loads
const supabase = createClient(url, key, {
  db: {
    schema: 'public',
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' },
  },
});
```

---

**Ready to test with real database! 🚀**
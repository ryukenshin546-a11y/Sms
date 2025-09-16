# 🔑 วิธีการได้ Supabase Credentials ที่ถูกต้อง

## ขั้นตอนที่ 1: เข้า Supabase Dashboard
1. ไป https://app.supabase.com
2. Login เข้าบัญชีของคุณ
3. เลือก Project: `mnhdueclyzwtfkmwttkc`

## ขั้นตอนที่ 2: หา API Keys
1. ไปที่ **Settings** → **API**
2. คัดลอก **Project URL**: `https://mnhdueclyzwtfkmwttkc.supabase.co` ✅ (ถูกต้องแล้ว)
3. คัดลอก **anon public** key (จะขึ้นต้นด้วย `eyJ...`)
4. คัดลอก **service_role** key (จะขึ้นต้นด้วย `eyJ...`)

## ขั้นตอนที่ 3: แทนที่ใน .env
```bash
# เปลี่ยนจาก
SUPABASE_CLIENT_API_KEYY=sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH
VITE_SUPABASE_SERVICE_KEY=sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf

# เป็น Keys ที่แท้จริงจาก Dashboard
SUPABASE_CLIENT_API_KEYY=eyJ...your-real-anon-key
VITE_SUPABASE_SERVICE_KEY=eyJ...your-real-service-key
```

## ขั้นตอนที่ 4: ทดสอบ Database จริง
หลังจากแก้ไข .env แล้ว รันคำสั่ง:
```bash
node realDatabaseTest.cjs
```

## 🚨 หมายเหตุสำคัญ
- Keys ที่แท้จริงจะยาวมาก (เป็น JWT tokens)
- อย่าแชร์ service_role key กับใคร
- หาก Keys หมดอายุ ให้สร้างใหม่ใน Dashboard

## 🔍 วิธีตรวจสอบ Keys ถูกต้อง
Keys ที่ถูกต้องจะมีลักษณะนี้:
- ขึ้นต้นด้วย `eyJ`
- ยาวประมาณ 100+ ตัวอักษร
- เป็น JWT format

Keys ที่ไม่ถูกต้อง (placeholder):
- `sb_publishable_...` 
- `sb_secret_...`
- สั้นเกินไป
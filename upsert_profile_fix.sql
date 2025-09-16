-- Fix registration duplicate key issue
-- เปลี่ยนจาก INSERT เป็น UPSERT (INSERT ... ON CONFLICT DO UPDATE)

-- ตัวอย่าง SQL สำหรับแก้ปัญหา Duplicate Key
-- โดยใช้ UPSERT แทน INSERT ธรรมดา

INSERT INTO public.profiles (
    id, username, email, first_name, last_name, phone, 
    account_type, email_verified, phone_verified, 
    credit_balance, password, created_at, updated_at
) VALUES (
    '1e316edd-0a6f-4670-b1d1-942e7030a1e2',
    'riwkindo123',
    'riwkindo123@gmail.com', 
    'สิรภพ',
    'ตันเอี่ยม',
    '0917799614',
    'personal',
    false,
    false,
    100,
    '',
    NOW(),
    NOW()
)
ON CONFLICT (id) 
DO UPDATE SET
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    account_type = EXCLUDED.account_type,
    updated_at = NOW();

-- หรือใช้ ON CONFLICT DO NOTHING ถ้าไม่ต้องการ update
-- ON CONFLICT (id) DO NOTHING;
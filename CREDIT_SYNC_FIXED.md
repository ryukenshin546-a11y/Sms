# ✅ Credit Sync System - แก้ไขเสร็จแล้ว!

## 🎯 การแก้ไข

### ❌ **ปัญหาเดิม**
- ใช้ตาราง `credit_balance` ที่สร้างใหม่
- มีปัญหา upsert และ unique constraint
- ความซับซ้อนในการจัดการ 2 ตาราง

### ✅ **วิธีแก้ใหม่**
- ใช้ `user_profiles` table ที่มีอยู่แล้ว
- มี field `credit_balance` อยู่แล้ว
- แก้ไข Edge Function และ Frontend Services

## 🔧 **สิ่งที่แก้ไข**

### 1. **Edge Function (`sync-credit/index.ts`)**
```typescript
// เปลี่ยนจาก credit_balance table เป็น user_profiles
await supabaseClient
  .from('user_profiles')
  .update({
    credit_balance: creditData.balance,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId)
```

### 2. **CreditSyncService.ts**
```typescript
// ดึงข้อมูลจาก user_profiles แทน
const { data } = await supabase
  .from('user_profiles')
  .select('id, credit_balance, updated_at')
  .eq('id', targetUserId)
  .single()
```

### 3. **Realtime Subscription**
```typescript
// ติดตาม user_profiles table แทน
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'user_profiles',
  filter: `id=eq.${targetUserId}`
})
```

## 🚀 **Status**

- ✅ **Edge Function** - Deploy แล้ว
- ✅ **Frontend Services** - แก้ไขเสร็จ  
- ✅ **Component** - อัปเดตแล้ว
- 🗑️ **credit_balance table** - ไม่จำเป็นต้องสร้าง

## 📱 **วิธีทดสอบ**

1. **รีเฟรชหน้าเว็บ**
2. **เข้าหน้า Profile** 
3. **ดูยอดเครดิตที่แสดง**
4. **กดปุ่ม "อัปเดต"** เพื่อ sync ข้อมูลใหม่

## 🎯 **ผลลัพธ์ที่คาดหวัง**

- ✅ ยอดเครดิตแสดงจาก `user_profiles.credit_balance`
- ✅ เมื่อกดอัปเดต จะเรียก SMSUP API
- ✅ API จะคืนยอด 9713.0 บาท
- ✅ ข้อมูลจะอัปเดตใน `user_profiles` table
- ✅ UI จะแสดงยอดเครดิตใหม่แบบ real-time

## 📊 **Database Schema ที่ใช้**

```sql
-- ใช้ table ที่มีอยู่แล้ว
user_profiles {
  id: uuid (PK)
  credit_balance: numeric (default 100.00)
  updated_at: timestamp
  ...
}
```

ตอนนี้ระบบควรทำงานได้แล้วครับ! ลองทดสอบดูและบอกผลให้ฟังครับ 🎉
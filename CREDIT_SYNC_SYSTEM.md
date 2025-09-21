# Credit Balance Sync System

## ✅ สิ่งที่สร้างเสร็จแล้ว

### 1. **Database Migration**
- ✅ สร้างตาราง `credit_balance` สำหรับเก็บยอดเครดิต
- ✅ เพิ่ม RLS policies สำหรับความปลอดภัย
- ✅ สร้าง indexes สำหรับประสิทธิภาพ

### 2. **Edge Function**
- ✅ สร้าง `sync-credit` Edge Function ที่:
  - เรียก SMSUP API เพื่อ authenticate
  - ดึงยอดเครดิตจริงจาก API
  - บันทึกลง `credit_balance` table
  - อัปเดต `user_profiles` table ด้วย
  - รองรับ rate limiting (5 นาที)

### 3. **Frontend Services**
- ✅ `CreditSyncService.ts` - Service สำหรับเรียก Edge Function
- ✅ `CreditBalanceDisplay.tsx` - Component แสดงยอดเครดิตแบบ real-time
- ✅ อัปเดต `Profile_Enhanced.tsx` ใช้ component ใหม่

### 4. **API Flow ที่ทำงาน**
```
User เข้าเว็บ/กดปุ่ม → CreditSyncService → Edge Function → SMSUP API → Database → UI Update
```

## 🔧 การ Deploy

### Deploy Edge Function:
```bash
cd c:\Users\Ryu\Documents\Sms
supabase functions deploy sync-credit
```

### Run Migration:
```bash
supabase db push
```

## 🎯 การใช้งาน

### 1. **แบบ Auto Sync (เมื่อเข้าเว็บ)**
```tsx
<CreditBalanceDisplay 
  userId={user.id}
  autoSync={true}
  showSyncButton={true}
/>
```

### 2. **แบบ Manual Sync**
```typescript
import { CreditSyncService } from '@/services/creditSyncService';

// Force sync เครดิต
const result = await CreditSyncService.syncCreditBalance(true);

// Auto sync ถ้าข้อมูลเก่า
const result = await CreditSyncService.checkAndSyncIfNeeded();
```

## 📡 Edge Function API

### Endpoint:
```
POST https://your-project.supabase.co/functions/v1/sync-credit
```

### Headers:
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN",
  "Content-Type": "application/json"
}
```

### Request Body:
```json
{
  "forceSync": true
}
```

### Response:
```json
{
  "success": true,
  "message": "Credit balance synced successfully",
  "data": {
    "user_id": "uuid",
    "balance": 9713.0,
    "last_sync_at": "2025-09-17T07:32:02Z",
    "api_response": {
      "id": 54,
      "paytype": 1,
      "balance": 9713.0,
      "errormsg": null
    }
  }
}
```

## 🔄 SMSUP API Integration

### Step 1: Get Token
```
POST https://web.smsup-plus.com/api/Token
{
  "username": "Landingpage",
  "password": "@Atoz123",
  "expireMinutes": "60",
  "ip": "58.8.213.44",
  "device": ""
}
```

### Step 2: Get Credit Balance
```
POST https://web.smsup-plus.com/api/credit/get_credit_byuser
Authorization: Bearer {token}
```

## 🎨 UI Features

- ✅ **Real-time Updates** - แสดงยอดเครดิตแบบ real-time
- ✅ **Auto Sync** - ตรวจสอบอัตโนมัติเมื่อเข้าเว็บ
- ✅ **Manual Sync Button** - ปุ่มอัปเดตด้วยตนเอง
- ✅ **Loading States** - แสดงสถานะกำลังโหลด
- ✅ **Error Handling** - แสดง error และปุ่มลองใหม่
- ✅ **Cache Status** - แสดงว่าข้อมูลมาจากแคชหรือ API ใหม่
- ✅ **Last Sync Time** - แสดงเวลาอัปเดตล่าสุด

## 🚨 ขั้นตอนต่อไป

1. **Deploy Edge Function:**
   ```bash
   supabase functions deploy sync-credit
   ```

2. **Run Database Migration:**
   ```bash
   supabase db push
   ```

3. **Test การทำงาน:**
   - เข้าหน้าโปรไฟล์
   - กดปุ่มอัปเดตเครดิต
   - ตรวจสอบใน Supabase Dashboard

## 💡 คุณสมบัติพิเศษ

- **Rate Limiting:** ป้องกันการเรียก API บ่อยเกินไป (5 นาที)
- **Error Recovery:** บันทึก error ลง database เพื่อ debug
- **Realtime Sync:** ข้อมูลอัปเดตแบบ real-time
- **TypeScript:** Type safety ครบถ้วน
- **Security:** RLS policies ป้องกันข้อมูลผู้ใช้
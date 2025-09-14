# 📋 Phase 2 Implementation Guide
**เป้าหมาย**: Authentication & User Management System  
**ระยะเวลา**: 5-7 วัน  
**วันที่เริ่ม**: 16 กันยายน 2025

---

## 🎯 **Next Immediate Actions**

### 1. **Login System (วันนี้)**
สร้างไฟล์ Login page และ authentication logic:

```bash
# สร้างไฟล์ที่จำเป็น
touch src/pages/Login.tsx
touch src/hooks/useAuth.tsx
touch src/lib/auth.ts
```

#### **Template สำหรับ Login.tsx:**
```typescript
// Login form with email/password
// Integration กับ supabase.auth.signInWithPassword()
// Error handling และ validation
// Redirect logic หลัง login สำเร็จ
```

### 2. **AuthGuard Component**
สร้าง component สำหรับป้องกันการเข้าถึงหน้าที่ต้อง authentication:

```typescript
// Check authentication status
// Redirect to login if not authenticated  
// Show loading state
// Wrap protected routes
```

### 3. **Navigation Updates**
เพิ่ม Login/Logout buttons และ conditional rendering:

```typescript
// Show different nav items for authenticated/unauthenticated users
// Add logout functionality
// User avatar/profile dropdown
```

---

## 🔧 **Implementation Priority**

### **Week 1 (Sep 16-20)**
1. ✅ Registration System (เสร็จแล้ว)
2. 🎯 Login System (กำลังทำ)
3. 🔄 AuthGuard Component
4. 🔄 Password Reset Flow

### **Week 2 (Sep 23-27)**  
1. 🔄 Profile Management
2. 🔄 Email Verification
3. 🔄 Auto-Bot API Planning
4. 🔄 Database RLS Policies

---

## 📁 **File Structure Plan**

```
src/
├── pages/
│   ├── Login.tsx ← สร้างใหม่
│   ├── ForgotPassword.tsx ← สร้างใหม่
│   ├── ResetPassword.tsx ← สร้างใหม่
│   └── Profile.tsx ← ปรับปรุง
├── components/
│   ├── AuthGuard.tsx ← สร้างใหม่
│   ├── PasswordResetForm.tsx ← สร้างใหม่
│   └── Navigation.tsx ← แก้ไข
├── hooks/
│   ├── useAuth.tsx ← สร้างใหม่
│   └── useProfile.tsx ← สร้างใหม่
├── lib/
│   ├── auth.ts ← สร้างใหม่
│   └── validation.ts ← ปรับปรุง
└── services/
    └── profileService.ts ← ปรับปรุง
```

---

## 🚨 **Critical Notes**

### **Database RLS**
- ปัจจุบันใช้ TEMP_DISABLE_RLS.sql (ไม่ปลอดภัย)
- ต้อง implement FIX_REGISTRATION_SYSTEM.sql เร็วที่สุด
- Test ใน development environment ก่อน

### **Security Considerations**
- ไม่ใช้ service keys ใน browser
- Validate input ทุกตัว
- Implement rate limiting
- Secure session management

### **User Experience**
- Loading states ทุกที่
- Error messages ที่เข้าใจง่าย
- Smooth transitions
- Mobile responsive

---

## 🔄 **Testing Strategy**

### **Manual Testing Checklist**
- [ ] Registration flow ทำงานสมบูรณ์
- [ ] Login/Logout ทำงานถูกต้อง
- [ ] Password reset ส่ง email ได้
- [ ] Profile update บันทึกได้
- [ ] Session persistence ทำงาน
- [ ] Error handling ครอบคลุม

### **Database Testing**
- [ ] ตรวจสอบ RLS policies
- [ ] Profile creation working
- [ ] Data validation ทำงาน
- [ ] Migration scripts ถูกต้อง

---

## 📞 **Daily Standup Questions**

1. **งานที่ทำเสร็จเมื่อวาน?**
2. **งานที่จะทำวันนี้?**  
3. **มีปัญหาหรืออุปสรรคอะไรไหม?**
4. **ต้องการความช่วยเหลืออะไรไหม?**

---

**การติดตามความคืบหน้า**: ใช้ todo list ใน VS Code และอัพเดท status ทุกวัน
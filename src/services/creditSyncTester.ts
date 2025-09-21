import { CreditSyncService } from '@/services/creditSyncService';

/**
 * ทดสอบ Credit Sync System
 * ใช้ในหน้า Console ของ browser
 */

// ตัวอย่างการใช้งาน:

// 1. ทดสอบ Auto Sync
async function testAutoSync() {
  console.log('🧪 ทดสอบ Auto Sync...');
  try {
    const result = await CreditSyncService.checkAndSyncIfNeeded();
    console.log('✅ ผลลัพธ์:', result);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// 2. ทดสอบ Force Sync
async function testForceSync() {
  console.log('🧪 ทดสอบ Force Sync...');
  try {
    const result = await CreditSyncService.syncCreditBalance(true);
    console.log('✅ ผลลัพธ์:', result);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    return { success: false, error: error.message };
  }
}

// 3. ดูข้อมูลเครดิตปัจจุบัน
async function getCurrentCredit() {
  console.log('📊 ดูข้อมูลเครดิตปัจจุบัน...');
  try {
    const result = await CreditSyncService.getCurrentCreditBalance();
    console.log('✅ ข้อมูลเครดิต:', result);
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

// 4. ตั้งค่า Realtime Subscription
function setupRealtimeSync() {
  console.log('📡 ตั้งค่า Realtime Sync...');
  
  const subscription = CreditSyncService.subscribeToCreditUpdates((data) => {
    console.log('🔔 Credit Balance Updated!', data);
  });
  
  console.log('✅ Subscription ตั้งค่าแล้ว');
  return subscription;
}

// Export ฟังก์ชันสำหรับใช้ใน Console
if (typeof window !== 'undefined') {
  window.testCreditSync = {
    testAutoSync,
    testForceSync,
    getCurrentCredit,
    setupRealtimeSync,
    
    // ฟังก์ชันรวม - ทดสอบทั้งหมด
    async runAllTests() {
      console.log('🚀 เริ่มทดสอบ Credit Sync System');
      
      try {
        // 1. ดูข้อมูลปัจจุบัน
        console.log('\n--- 1. ข้อมูลเครดิตปัจจุบัน ---');
        await getCurrentCredit();
        
        // 2. ทดสอบ Auto Sync
        console.log('\n--- 2. ทดสอบ Auto Sync ---');
        await testAutoSync();
        
        // 3. ทดสอบ Force Sync
        console.log('\n--- 3. ทดสอบ Force Sync ---');
        await testForceSync();
        
        // 4. ตั้งค่า Realtime
        console.log('\n--- 4. ตั้งค่า Realtime ---');
        const sub = setupRealtimeSync();
        
        console.log('\n✅ ทดสอบทั้งหมดเสร็จสิ้น!');
        
        return {
          success: true,
          subscription: sub
        };
        
      } catch (error) {
        console.error('💥 เกิดข้อผิดพลาดในการทดสอบ:', error);
        return { success: false, error: error.message };
      }
    }
  };
  
  // แสดงคำแนะนำการใช้งาน
  console.log(`
🔧 Credit Sync System Test Functions
=====================================

ใช้คำสั่งเหล่านี้ใน Browser Console:

1. ทดสอบ Auto Sync:
   await testCreditSync.testAutoSync()

2. ทดสอบ Force Sync:
   await testCreditSync.testForceSync()

3. ดูข้อมูลเครดิตปัจจุบัน:
   await testCreditSync.getCurrentCredit()

4. ตั้งค่า Realtime Sync:
   const sub = testCreditSync.setupRealtimeSync()

5. รันทดสอบทั้งหมด:
   await testCreditSync.runAllTests()

=====================================
  `);
}

export default {
  testAutoSync,
  testForceSync,
  getCurrentCredit,
  setupRealtimeSync
};
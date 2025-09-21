#!/usr/bin/env node

/**
 * Credit Balance API Test Runner
 * ใช้สำหรับทดสอบการทำงานของ Credit Balance API
 *
 * วิธีใช้งาน:
 * 1. ตั้งค่า USER_ID ใน environment variable หรือแก้ไขในโค้ด
 * 2. รันคำสั่ง: node test-credit-api.js
 */

import { CreditAPITester } from './services/creditAPITester';

// ตัวอย่าง User ID (ควรเปลี่ยนเป็น ID จริงของผู้ใช้)
const TEST_USER_ID = process.env.TEST_USER_ID || 'your-user-id-here';

async function main() {
  console.log('='.repeat(60));
  console.log('🧪 CREDIT BALANCE API TEST RUNNER');
  console.log('='.repeat(60));
  console.log(`📋 Test User ID: ${TEST_USER_ID}`);
  console.log('');

  if (TEST_USER_ID === 'your-user-id-here') {
    console.log('⚠️  กรุณาตั้งค่า TEST_USER_ID ใน environment variable หรือแก้ไขในโค้ด');
    console.log('   ตัวอย่าง: export TEST_USER_ID="123e4567-e89b-12d3-a456-426614174000"');
    process.exit(1);
  }

  try {
    const results = await CreditAPITester.runAllTests(TEST_USER_ID);

    console.log('\n' + '='.repeat(60));
    console.log('📊 สรุปผลการทดสอบ');
    console.log('='.repeat(60));
    console.log(`💰 เครดิตปัจจุบัน: ${results.creditData.credit_balance}`);
    console.log(`📊 สถานะบัญชี: ${results.creditData.status}`);
    console.log(`🏷️  ประเภทบัญชี: ${results.creditData.account_type}`);
    console.log(`🤖 สามารถใช้ Auto-Bot: ${results.creditData.can_use_autobot ? '✅' : '❌'}`);

  } catch (error) {
    console.error('\n💥 เกิดข้อผิดพลาดในการทดสอบ:', error);
    process.exit(1);
  }
}

// รันการทดสอบ
main().catch(console.error);
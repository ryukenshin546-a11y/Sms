/**
 * OTP System Test
 * Manual test to validate OTP functionality
 * Updated: September 14, 2025
 */

import { simpleOTPService } from '../services/simpleOTPService';

// Test configuration
const TEST_PHONE_NUMBERS = [
  '0812345678',    // Thai format
  '66812345678',   // With country code
  '812345678'      // Without leading zero
];

async function testOTPSystem() {
  console.log('🧪 Starting OTP System Test');
  console.log('='.repeat(50));

  for (const phoneNumber of TEST_PHONE_NUMBERS) {
    console.log(`\n📱 Testing phone: ${phoneNumber}`);
    console.log('-'.repeat(30));

    try {
      // Test 1: Check if phone is already verified
      console.log('1️⃣ Checking if phone is verified...');
      const isVerified = await simpleOTPService.isPhoneVerified(phoneNumber);
      console.log(`   Result: ${isVerified ? '✅ Already verified' : '❌ Not verified'}`);

      if (isVerified) {
        console.log('   ⏩ Skipping already verified phone');
        continue;
      }

      // Test 2: Send OTP
      console.log('2️⃣ Sending OTP...');
      const sendResult = await simpleOTPService.sendOTP({
        phoneNumber,
        userId: 'test-user-123'
      });

      if (!sendResult.success) {
        console.log(`   ❌ Failed: ${sendResult.message}`);
        continue;
      }

      console.log(`   ✅ Success: ${sendResult.message}`);
      console.log(`   📄 Session ID: ${sendResult.session?.id}`);
      
      if (!sendResult.session) {
        console.log('   ❌ No session created');
        continue;
      }

      // Test 3: Get session details
      console.log('3️⃣ Getting session details...');
      const session = await simpleOTPService.getSession(sendResult.session.id);
      
      if (!session) {
        console.log('   ❌ Session not found');
        continue;
      }

      console.log(`   ✅ Session found:`);
      console.log(`      - Phone: ${session.phoneNumber}`);
      console.log(`      - Status: ${session.status}`);
      console.log(`      - Expires: ${session.expiresAt}`);
      console.log(`      - Attempts: ${session.verificationAttempts}/${session.maxAttempts}`);

      // Test 4: Test invalid OTP
      console.log('4️⃣ Testing invalid OTP...');
      const invalidResult = await simpleOTPService.verifyOTP({
        sessionId: session.id,
        otpCode: '0000'
      });

      console.log(`   Result: ${invalidResult.success ? '❌ Should have failed' : '✅ Correctly rejected'}`);
      console.log(`   Message: ${invalidResult.message}`);

      // Note: We can't test valid OTP without actual SMS
      console.log('5️⃣ Valid OTP test skipped (requires actual SMS)');

    } catch (error) {
      console.log(`   💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log('\n🏁 Test Complete');
  console.log('='.repeat(50));
}

// Export for manual testing
export { testOTPSystem };
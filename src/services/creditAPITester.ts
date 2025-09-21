import { UserProfileService } from './userProfileService';

/**
 * ทดสอบการทำงานของ Credit Balance API
 * ใช้สำหรับตรวจสอบการทำงานของฟังก์ชันต่างๆ ที่เกี่ยวข้องกับเครดิต
 */
export class CreditAPITester {
  /**
   * ทดสอบการดึงข้อมูลเครดิตคงเหลือ
   */
  static async testGetCreditBalance(userId: string) {
    console.log('🧪 ทดสอบการดึงข้อมูลเครดิตคงเหลือ...');

    try {
      const result = await UserProfileService.getCreditBalance(userId);
      console.log('✅ สำเร็จ:', result);
      return result;
    } catch (error) {
      console.error('❌ ล้มเหลว:', error);
      throw error;
    }
  }

  /**
   * ทดสอบการเพิ่มเครดิต
   */
  static async testAddCredit(userId: string, amount: number) {
    console.log(`🧪 ทดสอบการเพิ่มเครดิต ${amount}...`);

    try {
      const result = await UserProfileService.addCredit(userId, amount);
      console.log('✅ สำเร็จ:', result);
      return result;
    } catch (error) {
      console.error('❌ ล้มเหลว:', error);
      throw error;
    }
  }

  /**
   * ทดสอบการลดเครดิต
   */
  static async testDeductCredit(userId: string, amount: number) {
    console.log(`🧪 ทดสอบการลดเครดิต ${amount}...`);

    try {
      const result = await UserProfileService.deductCredit(userId, amount);
      console.log('✅ สำเร็จ:', result);
      return result;
    } catch (error) {
      console.error('❌ ล้มเหลว:', error);
      throw error;
    }
  }

  /**
   * ทดสอบการอัปเดตเครดิตคงเหลือ
   */
  static async testUpdateCreditBalance(userId: string, newBalance: number) {
    console.log(`🧪 ทดสอบการอัปเดตเครดิตเป็น ${newBalance}...`);

    try {
      const result = await UserProfileService.updateCreditBalance(userId, newBalance);
      console.log('✅ สำเร็จ:', result);
      return result;
    } catch (error) {
      console.error('❌ ล้มเหลว:', error);
      throw error;
    }
  }

  /**
   * ทดสอบการดึงข้อมูลโปรไฟล์ผู้ใช้แบบครบถ้วน
   */
  static async testGetUserProfile(userId: string) {
    console.log('🧪 ทดสอบการดึงข้อมูลโปรไฟล์ผู้ใช้...');

    try {
      const result = await UserProfileService.getUserProfile(userId);
      console.log('✅ สำเร็จ:', result);
      return result;
    } catch (error) {
      console.error('❌ ล้มเหลว:', error);
      throw error;
    }
  }

  /**
   * เรียกใช้งานการทดสอบทั้งหมด
   */
  static async runAllTests(userId: string) {
    console.log('🚀 เริ่มการทดสอบ Credit Balance API...\n');

    try {
      // ทดสอบการดึงข้อมูลเครดิต
      const creditData = await this.testGetCreditBalance(userId);
      console.log('');

      // ทดสอบการดึงข้อมูลโปรไฟล์
      const profileData = await this.testGetUserProfile(userId);
      console.log('');

      // ทดสอบการเพิ่มเครดิต
      const addResult = await this.testAddCredit(userId, 100);
      console.log('');

      // ทดสอบการลดเครดิต
      const deductResult = await this.testDeductCredit(userId, 50);
      console.log('');

      // ทดสอบการอัปเดตเครดิต
      const updateResult = await this.testUpdateCreditBalance(userId, 1000);
      console.log('');

      console.log('🎉 การทดสอบทั้งหมดเสร็จสิ้น!');

      return {
        creditData,
        profileData,
        addResult,
        deductResult,
        updateResult
      };

    } catch (error) {
      console.error('💥 การทดสอบล้มเหลว:', error);
      throw error;
    }
  }
}

// Export สำหรับการใช้งาน
export default CreditAPITester;
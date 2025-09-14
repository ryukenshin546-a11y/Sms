// Test script for registration system
// Run with: npx tsx test_registration.ts

// Set environment variables for testing
process.env.VITE_SUPABASE_URL = 'https://mnhdueclyzwtfkmwttkc.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH';

// Create supabase client directly for testing
import { createClient } from '@supabase/supabase-js';
import type { Database } from './src/types/database.types';

const supabase = createClient<Database>(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

// Import ProfileService and create instance with our client
// We'll create the service directly to avoid import.meta.env issues
class TestProfileService {
  private client;

  constructor(client: any) {
    this.client = client;
  }

  async createProfile(profileData: any) {
    try {
      const { data, error } = await this.client
        .from('profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Database operation failed');
    }
  }
}

async function testRegistration() {
  console.log('🧪 Testing Registration System...\n');

  const profileService = new TestProfileService(supabase);

  // Test data for individual account
  const individualData = {
    account_type: 'individual' as const,
    first_name: 'สมชาย',
    last_name: 'ใจดี',
    username: 'somchai_test_' + Date.now(),
    email: 'somchai_test_' + Date.now() + '@example.com',
    phone: '0812345678',
    password: 'TestPassword123!',
    id_card: '1234567890123',
    address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    use_same_address: false,
    billing_address: '456 ถนนสีลม แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    credit_balance: 100,
    email_verified: false,
    phone_verified: false,
    status: 'active' as const
  };

  // Test data for corporate account
  const corporateData = {
    account_type: 'corporate' as const,
    first_name: 'วิชัย',
    last_name: 'ธุรกิจ',
    username: 'wichai_corp_test_' + Date.now(),
    email: 'wichai_corp_test_' + Date.now() + '@example.com',
    phone: '022345678',
    password: 'CorpPassword123!',
    company_registration: '0123456789123',
    company_name_th: 'บริษัท ทดสอบ จำกัด',
    company_name_en: 'Test Company Limited',
    company_address: '789 ถนนพระรามที่ 4 แขวงสีลม เขตบางรัก กรุงเทพฯ 10500',
    tax_id: '1234567890123',
    company_phone: '022345678',
    authorized_person: 'นายวิชัย ธุรกิจ',
    position: 'manager',
    business_type: 'software-tech',
    use_same_address_for_billing: true,
    billing_address: null,
    credit_balance: 100,
    email_verified: false,
    phone_verified: false,
    status: 'active' as const
  };

  try {
    console.log('📝 Testing Individual Account Registration...');
    const individualProfile = await profileService.createProfile(individualData);
    console.log('✅ Individual profile created:', individualProfile.id);
    console.log('   Username:', individualProfile.username);
    console.log('   Email:', individualProfile.email);
    console.log('   Account Type:', individualProfile.account_type);
    console.log('   ID Card:', (individualProfile as any).id_card);
    console.log('   Credit Balance:', individualProfile.credit_balance);
    console.log('');

    console.log('🏢 Testing Corporate Account Registration...');
    const corporateProfile = await profileService.createProfile(corporateData);
    console.log('✅ Corporate profile created:', corporateProfile.id);
    console.log('   Username:', corporateProfile.username);
    console.log('   Email:', corporateProfile.email);
    console.log('   Account Type:', corporateProfile.account_type);
    console.log('   Company:', (corporateProfile as any).company_name_th);
    console.log('   Registration:', (corporateProfile as any).company_registration);
    console.log('   Credit Balance:', corporateProfile.credit_balance);
    console.log('');

    console.log('🎉 All tests passed! Registration system is working correctly.');
    console.log('\n💡 You can now test the registration form in the browser at: http://localhost:2021/register');

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testRegistration();
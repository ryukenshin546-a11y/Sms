// Quick database check
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnhdueclyzwtfkmwttkc.supabase.co',
  'sb_publishable_yu9gJ7X8C7CjbpqVsvNgGg_LOLkI7mH'
);

async function checkDatabase() {
  console.log('🔍 Checking profiles table...\n');

  try {
    // Check table structure
    const { data: structure, error: structError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (structError) {
      console.error('❌ Error getting table structure:', structError);
      return;
    }

    console.log('📊 Table structure (sample record):');
    console.log(JSON.stringify(structure, null, 2));
    console.log('');

    // Check if we have any data
    const { data: count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact' });

    if (countError) {
      console.error('❌ Error getting count:', countError);
      return;
    }

    console.log(`📈 Total records in profiles table: ${count?.length || 0}`);

  } catch (error) {
    console.error('❌ Database check failed:', error);
  }
}

checkDatabase();
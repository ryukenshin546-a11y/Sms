// Emergency migration script
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnhdueclyzwtfkmwttkc.supabase.co',
  'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf'
);

async function runMigration() {
  console.log('🚀 Running emergency migration...\n');

  const migrationSQL = `
    -- Add missing fields to profiles table
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name character varying(100) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name character varying(100) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_card character varying(13) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address text null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_same_address boolean null default false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS billing_address text null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_registration character varying(13) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name_th character varying(255) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name_en character varying(255) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_address text null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tax_id character varying(13) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_phone character varying(20) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS authorized_person character varying(255) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS position character varying(100) null;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS use_same_address_for_billing boolean null default false;

    -- Add constraints
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_id_card_check') THEN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_card_check
            CHECK (id_card IS NULL OR id_card ~ '^[0-9]{13}$');
        END IF;
    END $$;

    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_company_registration_check') THEN
            ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_registration_check
            CHECK (company_registration IS NULL OR company_registration ~ '^[0-9]{13}$');
        END IF;
    END $$;

    -- Add indexes
    CREATE INDEX IF NOT EXISTS idx_profiles_id_card ON public.profiles(id_card) WHERE id_card IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_profiles_company_registration ON public.profiles(company_registration) WHERE company_registration IS NOT NULL;
  `;

  try {
    // Split SQL into individual statements and execute them
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });

        if (error) {
          console.error('❌ Error executing statement:', error);
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully');
        }
      }
    }

    console.log('\n🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

runMigration();
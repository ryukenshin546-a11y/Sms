import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mnhdueclyzwtfkmwttkc.supabase.co',
  'sb_secret_QZOyKOuNRIndQKMItJVD1Q_OSyctXNf'
);

async function getSchema() {
  try {
    // Get all tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .neq('table_name', 'schema_migrations');

    if (tablesError) throw tablesError;

    console.log('=== DATABASE TABLES ===');
    tables.forEach(table => {
      console.log(`${table.table_type}: ${table.table_name}`);
    });

    // Get columns for each table
    for (const table of tables) {
      if (table.table_type === 'BASE TABLE') {
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name)
          .order('ordinal_position');

        if (!columnsError && columns) {
          console.log(`\n=== ${table.table_name.toUpperCase()} TABLE ===`);
          columns.forEach(col => {
            console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}${col.column_default ? ' DEFAULT: ' + col.column_default : ''}`);
          });
        }
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

getSchema();
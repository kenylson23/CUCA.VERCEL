import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function setupSupabaseTables() {
  try {
    console.log('Setting up Supabase tables...');

    // Create admin_users table with missing columns
    const { error: adminUsersError } = await supabase.rpc('sql', {
      query: `
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
            ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
          END IF;
        END $$;
      `
    });

    if (adminUsersError) {
      console.log('Admin users table update completed or already exists');
    }

    // Create sessions table if it doesn't exist
    const { error: sessionsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS sessions (
          sid varchar NOT NULL COLLATE "default",
          sess json NOT NULL,
          expire timestamp(6) NOT NULL
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS sessions_pkey ON sessions (sid);
        CREATE INDEX IF NOT EXISTS idx_sessions_expire ON sessions(expire);
      `
    });

    if (sessionsError) {
      console.log('Sessions table setup completed');
    }

    // Create orders table if it doesn't exist
    const { error: ordersError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id integer NOT NULL REFERENCES users(id),
          total_amount decimal(10,2) NOT NULL,
          status varchar NOT NULL DEFAULT 'pending',
          delivery_address text,
          phone varchar,
          notes text,
          created_at timestamp NOT NULL DEFAULT NOW(),
          updated_at timestamp NOT NULL DEFAULT NOW()
        );
      `
    });

    if (ordersError) {
      console.log('Orders table setup completed');
    }

    // Create order_items table if it doesn't exist
    const { error: orderItemsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id integer NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id integer NOT NULL REFERENCES products(id),
          quantity integer NOT NULL,
          unit_price decimal(10,2) NOT NULL,
          total_price decimal(10,2) NOT NULL,
          created_at timestamp NOT NULL DEFAULT NOW()
        );
      `
    });

    if (orderItemsError) {
      console.log('Order items table setup completed');
    }

    // Create analytics_events table if it doesn't exist
    const { error: analyticsError } = await supabase.rpc('sql', {
      query: `
        CREATE TABLE IF NOT EXISTS analytics_events (
          id SERIAL PRIMARY KEY,
          event_type varchar NOT NULL,
          event_data jsonb,
          user_agent text,
          ip_address varchar,
          user_id integer REFERENCES users(id),
          session_id varchar,
          created_at timestamp NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
      `
    });

    if (analyticsError) {
      console.log('Analytics events table setup completed');
    }

    console.log('✓ Supabase tables setup completed successfully');
    return true;

  } catch (error) {
    console.error('Error setting up Supabase tables:', error);
    return false;
  }
}
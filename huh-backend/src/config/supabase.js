const { createClient } = require('@supabase/supabase-js');
const config = require('./env');

if (!config.supabaseUrl || !config.supabaseKey) {
    console.warn("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

module.exports = { supabase };

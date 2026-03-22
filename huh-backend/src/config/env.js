// Environment variables loader
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    geminiApiKey: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null
};

const SUPABASE_URL = "https://ivbpamfwiwtbxdwzdudq.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2YnBhbWZ3aXd0Ynhkd3pkdWRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODAxMzAsImV4cCI6MjA5MTI1NjEzMH0.v1TI8iuzZUCd3PvQMKh56PN4NtJ9IItwgb6Y4_k0ZFk";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hojzqqefgvvaztkcsiys.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_w5bc9NxWE5o-G1h-OnVNWg_03Tp0ZSx';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  console.log('Fetching all profiles...\n');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, display_name, bio, is_public, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found in the database.');
    return;
  }

  console.log(`Found ${profiles.length} profile(s):\n`);
  
  profiles.forEach((profile, index) => {
    console.log(`${index + 1}. Profile ID: ${profile.id.slice(0, 8)}...`);
    console.log(`   Display Name: ${profile.display_name || '(not set)'}`);
    console.log(`   Bio: ${profile.bio ? profile.bio.substring(0, 50) + '...' : '(not set)'}`);
    console.log(`   Public: ${profile.is_public}`);
    console.log(`   Created: ${new Date(profile.created_at).toLocaleString()}`);
    console.log('');
  });
}

checkProfiles();

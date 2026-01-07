import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hojzqqefgvvaztkcsiys.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_w5bc9NxWE5o-G1h-OnVNWg_03Tp0ZSx';

const supabase = createClient(supabaseUrl, supabaseKey);

// Auth user IDs from your screenshot
const authUsers = [
  { id: 'db15c23a-a119-4184-b585-4a2f3b8b3f20', email: 'jay-parkin91@hotmail.com' },
  { id: 'ba1df6da-67ff-40a1-98e4-6b044c22015d', email: 'ktaylor211091@gmail.com' },
  { id: 'd428b0ed-39ba-4994-849d-25b38880d443', email: 'ktaylor211091@gmail.com' }
];

async function createMissingProfiles() {
  console.log('Checking for missing profiles...\n');
  
  for (const user of authUsers) {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      console.log(`✓ Profile already exists for ${user.email}`);
    } else {
      console.log(`✗ Missing profile for ${user.email}, creating...`);
      
      // Create profile
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          role: 'user',
          is_public: true,
          display_name: null
        });

      if (error) {
        console.error(`  Error creating profile: ${error.message}`);
      } else {
        console.log(`  ✓ Profile created successfully!`);
      }
    }
  }
  
  console.log('\nDone!');
}

createMissingProfiles();

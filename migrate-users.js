#!/usr/bin/env node

/**
 * Migration script to move users from users.json to Supabase
 * Run with: node migrate-users.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateUsers() {
  try {
    console.log('🚀 Starting user migration from users.json to Supabase...');
    
    // Read users from JSON file
    const usersFile = path.join(__dirname, 'users.json');
    
    if (!fs.existsSync(usersFile)) {
      console.error('❌ users.json file not found');
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    console.log(`📄 Found ${usersData.length} users in users.json`);

    // Check if users table exists and get current users
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('email');

    if (fetchError) {
      console.error('❌ Error checking existing users:', fetchError.message);
      console.log('Make sure you have created the users table in Supabase first!');
      return;
    }

    const existingEmails = new Set(existingUsers?.map(u => u.email) || []);
    console.log(`📊 Found ${existingEmails.size} existing users in Supabase`);

    // Prepare users for migration
    const usersToMigrate = usersData
      .filter(user => !existingEmails.has(user.email))
      .map(user => ({
        id: user.id,
        email: user.email,
        password: user.password, // In production, you should hash these
        name: user.name,
        business_name: user.businessName || null,
        phone: user.phone || null
      }));

    if (usersToMigrate.length === 0) {
      console.log('✅ All users are already migrated!');
      return;
    }

    console.log(`📦 Migrating ${usersToMigrate.length} new users...`);

    // Insert users in batches
    const batchSize = 10;
    let migratedCount = 0;

    for (let i = 0; i < usersToMigrate.length; i += batchSize) {
      const batch = usersToMigrate.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('users')
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Error migrating batch starting at index ${i}:`, error.message);
        continue;
      }

      migratedCount += batch.length;
      console.log(`✅ Migrated batch: ${batch.length} users (${migratedCount}/${usersToMigrate.length} total)`);
    }

    console.log(`🎉 Migration complete! Successfully migrated ${migratedCount} users.`);
    
    // Verify migration
    const { data: finalCount, error: countError } = await supabase
      .from('users')
      .select('email', { count: 'exact' });

    if (!countError) {
      console.log(`📊 Total users in Supabase: ${finalCount?.length || 0}`);
    }

    // Create backup of original file
    const backupFile = `users.json.backup.${Date.now()}`;
    fs.copyFileSync(usersFile, backupFile);
    console.log(`💾 Created backup: ${backupFile}`);

    console.log('\n🔧 Next steps:');
    console.log('1. Verify users in Supabase dashboard');
    console.log('2. Test login/signup functionality');
    console.log('3. Test password reset functionality');
    console.log('4. Consider removing users.json file after verification');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrateUsers();
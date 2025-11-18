#!/usr/bin/env node

/**
 * Script to pull database schema and create migrations when changes are detected
 * Usage: node scripts/sync-schema.js
 * 
 * This script:
 * 1. Backs up the current schema.prisma
 * 2. Pulls the current database schema
 * 3. Compares the pulled schema with the original
 * 4. If changes are detected, creates a migration using prisma migrate diff
 * 5. Applies the migration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');
const BACKUP_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma.backup');
const MIGRATIONS_DIR = path.join(__dirname, '../prisma/migrations');

function runCommand(command, description, silent = false) {
  console.log(`\n📋 ${description}...`);
  try {
    const output = execSync(command, { 
      stdio: silent ? 'pipe' : 'inherit', 
      cwd: path.join(__dirname, '..'),
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully`);
    return { success: true, output: silent ? output : null };
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

function normalizeSchema(schema) {
  // Normalize schema for comparison (remove comments, normalize whitespace)
  return schema
    .split('\n')
    .map(line => line.trim())
    .filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && !trimmed.startsWith('//');
    })
    .join('\n')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasSchemaChanges(originalSchema, newSchema) {
  const normalizedOriginal = normalizeSchema(originalSchema);
  const normalizedNew = normalizeSchema(newSchema);
  return normalizedOriginal !== normalizedNew;
}

function cleanup() {
  // Cleanup backup file
  if (fs.existsSync(BACKUP_SCHEMA_PATH)) {
    fs.unlinkSync(BACKUP_SCHEMA_PATH);
  }
}

function createMigrationFromDiff(originalSchemaPath, newSchemaPath, migrationName) {
  // Use prisma migrate diff to create migration SQL
  const migrationDir = path.join(MIGRATIONS_DIR, migrationName);
  const migrationFile = path.join(migrationDir, 'migration.sql');
  
  // Create migration directory
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  // Generate diff SQL
  const result = runCommand(
    `npx prisma migrate diff --from-schema-datamodel "${originalSchemaPath}" --to-schema-datamodel "${newSchemaPath}" --script`,
    'Generating migration SQL',
    true
  );
  
  if (!result.success) {
    // Cleanup on failure
    if (fs.existsSync(migrationDir)) {
      fs.rmSync(migrationDir, { recursive: true });
    }
    return false;
  }
  
  // Write migration SQL
  const migrationSQL = result.output || '';
  if (migrationSQL.trim().length === 0) {
    console.log('⚠️  No SQL changes detected in diff');
    fs.rmSync(migrationDir, { recursive: true });
    return false;
  }
  
  fs.writeFileSync(migrationFile, migrationSQL);
  console.log(`📝 Migration SQL written to ${migrationFile}`);
  return true;
}

function main() {
  console.log('🚀 Starting database schema sync...\n');
  
  // Check if schema file exists
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.log('⚠️  No schema.prisma found. Pulling initial schema from database...');
    if (!runCommand('npx prisma db pull', 'Pulling schema from database').success) {
      process.exit(1);
    }
    runCommand('npx prisma generate', 'Generating Prisma Client');
    console.log('\n🎉 Initial schema pulled successfully!');
    return;
  }
  
  // Step 1: Backup current schema
  const originalSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  fs.writeFileSync(BACKUP_SCHEMA_PATH, originalSchema);
  console.log('💾 Backed up current schema');
  
  // Step 2: Pull schema from database (this overwrites schema.prisma)
  if (!runCommand('npx prisma db pull', 'Pulling schema from database').success) {
    cleanup();
    process.exit(1);
  }
  
  // Step 3: Read the pulled schema
  const pulledSchema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  
  // Step 4: Check if schema has changed
  if (hasSchemaChanges(originalSchema, pulledSchema)) {
    console.log('\n📝 Schema changes detected!');
    console.log('The database schema differs from schema.prisma');
    
    // Step 5: Create migration using migrate diff
    // The pulled schema is currently in SCHEMA_PATH, and original is in BACKUP_SCHEMA_PATH
    // We want to create a migration FROM original TO pulled (what changed in the DB)
    const migrationName = `sync_${new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)}`;
    console.log(`\n📦 Creating migration: ${migrationName}`);
    
    // Create migration from diff: from original schema to pulled schema
    if (!createMigrationFromDiff(BACKUP_SCHEMA_PATH, SCHEMA_PATH, migrationName)) {
      cleanup();
      console.log('⚠️  Could not create migration. Schema has been updated to match database.');
      process.exit(1);
    }
    
    // Step 6: Mark migration as applied (since DB already has these changes)
    // We'll use migrate resolve to mark it as applied
    const isCI = process.env.CI === 'true';
    
    if (isCI) {
      // In CI, use migrate deploy which will apply pending migrations
      // But since DB already matches, we need to mark this one as applied
      console.log('📌 Marking migration as applied (database already has these changes)...');
      // The migration is already in the DB, so we'll resolve it
      runCommand(
        `npx prisma migrate resolve --applied ${migrationName}`,
        'Marking migration as applied'
      );
    } else {
      // In dev, we can use migrate dev which will handle this
      console.log('📌 Database already has these changes, migration created for history');
    }
    
    console.log('\n✅ Schema sync completed with migration!');
  } else {
    console.log('\n✅ No schema changes detected. Database schema matches schema.prisma');
    // Restore original schema to preserve any formatting/comments
    fs.writeFileSync(SCHEMA_PATH, originalSchema);
  }
  
  // Step 7: Generate Prisma Client
  if (!runCommand('npx prisma generate', 'Generating Prisma Client').success) {
    cleanup();
    process.exit(1);
  }
  
  cleanup();
  console.log('\n🎉 All done!');
}

// Handle cleanup on exit
process.on('SIGINT', () => {
  cleanup();
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  cleanup();
  throw error;
});

main();

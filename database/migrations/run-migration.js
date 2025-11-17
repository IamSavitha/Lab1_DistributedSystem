/**
 * Migration Script: Add profile_image column to travelers table
 * Run: node database/migrations/run-migration.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'airbnb'
    });

    console.log('✓ Connected to database');

    // Check if column already exists
    const [columns] = await connection.query(
      `SHOW COLUMNS FROM travelers LIKE 'profile_image'`
    );

    if (columns.length > 0) {
      console.log('✓ Column profile_image already exists');
      return;
    }

    // Add profile_image column
    await connection.query(`
      ALTER TABLE travelers
      ADD COLUMN profile_image LONGTEXT DEFAULT NULL
      COMMENT 'Base64 encoded profile image or image URL'
    `);

    console.log('✓ Added profile_image column to travelers table');

    // Verify the column was added
    const [result] = await connection.query('DESCRIBE travelers');
    console.log('\nCurrent travelers table schema:');
    console.table(result);

  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

runMigration();

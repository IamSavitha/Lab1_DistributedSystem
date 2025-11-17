/**
 * Migration Script: Add property_image column to properties table
 * Run from backend directory: node scripts/add-property-image-column.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addPropertyImageColumn() {
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
      `SHOW COLUMNS FROM properties LIKE 'property_image'`
    );

    if (columns.length > 0) {
      console.log('✓ Column property_image already exists');
      process.exit(0);
    }

    // Add property_image column
    console.log('Adding property_image column...');
    await connection.query(`
      ALTER TABLE properties
      ADD COLUMN property_image LONGTEXT DEFAULT NULL
      COMMENT 'Base64 encoded property image or image URL'
    `);

    console.log('✓ Successfully added property_image column to properties table');

    // Verify the column was added
    const [result] = await connection.query('DESCRIBE properties');
    console.log('\nProperties table schema:');
    result.forEach(col => {
      console.log(`  ${col.Field}: ${col.Type}${col.Null === 'YES' ? ' (nullable)' : ''}`);
    });

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

addPropertyImageColumn();

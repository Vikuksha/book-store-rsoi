const bcrypt = require('bcrypt');
const pool = require('../config/database');

// Ensure default admin user exists
async function ensureAdminUser() {
  try {
    const adminEmailPrimary = process.env.ADMIN_EMAIL || 'admin@bookstore.com';
    const adminEmailAlias = 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    const targets = [
      { email: adminEmailPrimary, first: 'Admin', last: 'User', phone: '+0-000-000-00-00', address: 'Admin Panel' },
      { email: adminEmailAlias, first: 'admin', last: 'admin', phone: '111111111', address: 'admin' },
    ];

    for (const t of targets) {
      const existing = await pool.query('SELECT "ID" FROM "Users" WHERE "Email" = $1', [t.email]);
      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO "Users" ("Email", "Password", "First_name", "Last_name", "Phone", "Address")
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [t.email, hashedPassword, t.first, t.last, t.phone, t.address]
        );
        console.log(`👑 Admin user created: ${t.email}`);
      }
    }
  } catch (e) {
    console.error('Failed to ensure admin user exists:', e.message);
  }
}

module.exports = ensureAdminUser;


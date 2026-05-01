import path from 'path';
import fs from 'fs';

afterAll(async () => {
  // Clean up test database file
  const dbPath = path.join(__dirname, '../hotel_test.db');
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
});
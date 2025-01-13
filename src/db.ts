import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open a connection to the SQLite database
export const connectDB = async () => {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
};

export const initDB = async () => {
  const db = await connectDB();
  await db.exec(`
      CREATE TABLE IF NOT EXISTS wallets (
        address TEXT PRIMARY KEY,
        mnemonic TEXT
      );
    `);
  return db;
};

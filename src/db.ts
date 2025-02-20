import sqlite3 from "sqlite3";
import { open } from "sqlite";

/**
 * Establishes a connection to the SQLite database
 * @returns Promise<Database> A promise that resolves to the database connection
 * Uses the local file 'data.db' as the database storage
 */
export const connectDB = async () => {
  return open({
    filename: "./data.db",
    driver: sqlite3.Database,
  });
};

/**
 * Initializes the database by creating necessary tables if they don't exist
 * Creates a 'wallets' table with columns:
 * - address: TEXT (Primary Key) - stores the wallet address
 * - mnemonic: TEXT - stores the wallet's mnemonic phrase
 * @returns Promise<Database> A promise that resolves to the initialized database connection
 */
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
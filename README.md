# SafeExam API

A blockchain-powered API for secure and tamper-proof online examination data storage using Algorand.

## Overview

SafeExam API provides a secure backend service for storing exam-related data on the Algorand blockchain. It manages wallet creation, exam data submission, and blockchain interactions to ensure the integrity and immutability of examination records.

## Project Structure

```
/safeexam-api/
├── dist/                   # Compiled JavaScript output from TypeScript
├── node_modules/          # Project dependencies
├── src/                   # Source code directory
│   ├── client.ts         # Algorand blockchain client configurations
│   ├── config.ts         # Environment configuration and validation
│   ├── db.ts            # Database connection and initialization
│   ├── index.ts         # Main Express application and route handlers
│   └── utils.ts         # Utility functions for blockchain operations
├── .env                  # Environment variables (not in version control)
├── .env.sample          # Example environment configuration
├── .gitignore           # Git ignore rules
├── data.db              # SQLite database file (not in version control)
├── package.json         # Project metadata and dependencies
├── README.md            # Project documentation (this file)
└── tsconfig.json        # TypeScript configuration
```

## Features

- Automated wallet creation and management
- Secure exam data storage on Algorand blockchain
- Automatic wallet funding system
- Tamper-proof exam record storage
- Real-time transaction verification
- Cross-origin resource sharing enabled

## Prerequisites

- Node.js (v20 or higher)
- SQLite3
- Algorand account with funded wallet for master operations
- Environment variables configured in `.env` file

## Installation

```bash
# Clone the repository
git clone https://github.com/SatishGAXL/safeexam-api.git

# Install dependencies
cd safeexam-api
npm install

# Copy environment file and configure it
cp .env.sample .env
```

## Configuration

Create a `.env` file with the following configurations:

```env
MASTER_WALLET_MNEMONIC=your_25_word_mnemonic_here
MIN_DELTA_AMOUNT=1
FUND_AMOUNT=1
CURRENT_NETWORK=testnet
```

See `.env.sample` for complete configuration options.

## API Endpoints

### Health Check
- GET `/` - Basic health check endpoint

### Wallet Management
- POST `/create-wallet` - Creates a new funded wallet on Algorand

### Exam Data
- POST `/write-answer` - Writes exam data to blockchain
  ```json
  {
    "student_id": "string",
    "exam_title": "string",
    "city": "string",
    "center_name": "string",
    "booklet": "string",
    "start_time": "string",
    "end_time": "string",
    "que_ans": "string",
    "suspicious_activity_detected": "string",
    "address": "string"
  }
  ```

## Architecture

- **SQLite Database**: Stores wallet information
- **Algorand Integration**: Uses testnet/mainnet for data storage
- **Express Server**: Handles API requests
- **Environment-based Configuration**: Supports both testnet and mainnet

## Security Features

- Secure wallet management
- Automatic minimum balance maintenance
- Transaction confirmation verification
- Environment-based configuration
- Cross-origin resource sharing (CORS) enabled

## Development

```bash
# Start the server
npm start

# The server will run on http://localhost:3000
```

## Transaction Verification

All transactions can be verified on the Algorand explorer:
- Testnet: `https://lora.algokit.io/testnet/`
- Mainnet: `https://lora.algokit.io/mainnet/`
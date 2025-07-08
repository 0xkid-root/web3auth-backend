# Web3Auth Backend Server

This is the backend server for the Web3Auth integration project. It handles user authentication, token verification, and blockchain interactions.

## Features

- JWT token verification using Web3Auth's JWKS
- User authentication middleware
- Private key processing and wallet generation
- CORS enabled for frontend integration

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables

## Environment Variables

- `WEB3AUTH_CLIENT_ID`: Your Web3Auth client ID
- `PORT`: Server port (default: 3000)
- `CORS_ORIGIN`: Frontend application URL (default: http://localhost:5173)

## Available Scripts

- Start development server:
  ```bash
  npm run dev
  ```

- Start production server:
  ```bash
  npm start
  ```

## API Endpoints

### POST /verify
- Verifies Web3Auth token
- Returns user information

### POST /process-keys
- Processes private key from frontend
- Generates wallet address and public key

## Security Considerations

- Environment variables for sensitive data
- JWT token validation
- CORS configuration
- Private key handling security
# Web3Auth Integration Project

This project demonstrates the integration of Web3Auth authentication with a React application, enabling secure web3 wallet functionality and blockchain interactions.

## Features

- Web3Auth Integration for secure authentication
- Blockchain wallet functionality
- Balance checking
- Network switching capability
- Transaction sending
- React + Vite frontend
- Express.js backend with JWT validation

## Tech Stack

- Frontend:
  - React 18
  - Vite
  - Web3Auth Modal
  - Wagmi (Ethereum interactions)
  - TypeScript

- Backend:
  - Express.js
  - JWT for authentication
  - CORS enabled
  - Environment variable configuration

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn package manager

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```env
   WEB3AUTH_CLIENT_ID=your_client_id
   PORT=your_port_number
   CORS_ORIGIN=http://localhost:5173
   ```

## Available Scripts

- Development server:
  ```bash
  npm run dev
  ```

- Build for production:
  ```bash
  npm run build
  ```

- Preview production build:
  ```bash
  npm run preview
  ```

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── getBalance.tsx
│   │   ├── sendTransaction.tsx
│   │   └── switchNetwork.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── web3authContext.tsx
├── server.js
├── vite.config.ts
└── tsconfig.json
```

## Features Implementation

- **Authentication**: Implemented using Web3Auth Modal with Google and email passwordless login options
- **Blockchain Interactions**: Using Wagmi hooks for balance checking and transaction sending
- **Network Switching**: Capability to switch between different blockchain networks
- **Backend Security**: JWT validation middleware for secure API endpoints

## Security Considerations

- Environment variables for sensitive data
- JWT token validation
- CORS configuration
- Secure private key handling

## License

MIT
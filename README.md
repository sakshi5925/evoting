# 🗳️ Decentralized E-Voting System (Blockchain Based)

A **secure, transparent, and decentralized e-voting platform** built using **Ethereum smart contracts**, **Node.js**, **MongoDB**, and **React**.  
This system ensures **tamper-proof elections**, **role-based access**, and **verifiable results** using blockchain technology.

---

## 🚀 Features

### 🔐 Authentication & Roles
- Wallet-based authentication using **MetaMask**
- Role-based access control:
  - **SUPER_ADMIN**
  - **ELECTION_MANAGER**
  - **ELECTION_AUTHORITY**
  - **VOTER**

---

### 🏗️ Election Management
- Create elections **on-chain** via `ElectionFactory`
- Store election metadata securely in **MongoDB**
- Activate / Deactivate elections
- Start candidate registration
- Start voting (validated by time & blockchain state)
- End election
- Declare results on blockchain

---

### 🧑‍💼 Candidate Management
- Candidate registration (on-chain + database sync)
- Authority-based candidate validation
- Prevent duplicate candidate registration
- Only approved candidates can contest
- Vote count synced using blockchain events

---

### 🗳️ Voting
- One-person-one-vote enforcement
- Vote casting via smart contracts
- Total votes synced to MongoDB
- Immutable voting records on blockchain

---

### 📊 Results
- Declare results on-chain
- Fetch winner securely
- Display vote counts and winner details
- Fully verifiable and transparent outcomes

---

## 🧱 Tech Stack

### Frontend
- React.js
- Redux Toolkit
- Tailwind CSS
- Ethers.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Ethers.js

### Blockchain
- Solidity
- Ethereum
- Hardhat
- MetaMask

---

## ⚙️ Environment Variables

Create a `.env` file inside the **backend** directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/evoting
RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_deployer_private_key



🔧 Installation & Setup
1️⃣ Clone the Repository

git clone https://github.com/sakshi5925/evoting
cd evoting

2️⃣ Backend Setup
cd backend
npm install
npm run dev
3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

4️⃣ Smart Contract Deployment
cd smart-contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia


After deployment, update the contract addresses in:

backend/utils/blockchain.js

🔐 Security Practices

Ethereum addresses are normalized before database storage

Strict role-based authorization for sensitive actions

Blockchain state validated before database updates

Prevents duplicate candidate registration

Prevents double voting at smart contract level

🧠 Key Design Decisions

Blockchain is the single source of truth

MongoDB is used as a read-optimization layer

On-chain events are used to sync database state

Strict validation before election state transitions

👩‍💻 Author

Sakshi Kumari
Blockchain & Full-Stack Developer

🗳️ Decentralized E-Voting System (Blockchain Based)

A secure, transparent, and decentralized e-voting platform built using Ethereum smart contracts, Node.js, MongoDB, and React.
This system ensures tamper-proof elections, role-based access, and verifiable results using blockchain technology.

🚀 Features
🔐 Authentication & Roles

Wallet-based authentication (MetaMask)

Role-based access:

SUPER_ADMIN

ELECTION_MANAGER

ELECTION_AUTHORITY

VOTER

🏗️ Election Management

Create elections on-chain via ElectionFactory

Store election metadata securely in MongoDB

Activate / Deactivate elections

Start candidate registration

Start voting (time & status validated)

End election

Declare results on blockchain

🧑‍💼 Candidate Management

Candidate registration (on-chain + DB sync)

Authority-based candidate validation

Prevent duplicate registration

Approved candidates only can contest

Vote count synced with blockchain events

🗳️ Voting

One-person-one-vote enforcement

Vote casting via smart contract

Total votes synced to MongoDB

Immutable voting records on blockchain

📊 Results

Declare results on-chain

Fetch winner securely

Display vote counts and winner details

Verifiable and transparent outcomes

🧱 Tech Stack
Frontend

React.js

Redux Toolkit

Tailwind CSS

Ethers.js

Backend

Node.js

Express.js

MongoDB + Mongoose

Ethers.js

Blockchain

Solidity

Ethereum

Hardhat

MetaMask

⚙️ Environment Variables

Create a .env file in the backend directory:
PORT=5000
MONGO_URI=mongodb://localhost:27017/evoting
RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
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


Update deployed contract addresses in:

backend/utils/blockchain.js

🔐 Security Practices

Ethereum addresses are normalized before DB storage

Role-based authorization for critical actions

Blockchain state validated before DB updates

Prevents duplicate candidate registration

Prevents double voting

🧠 Key Design Decisions

Blockchain = Source of Truth

MongoDB = Read Optimization Layer

On-chain events used to sync database

Strict state validation before transitions

👩‍💻 Author

Sakshi Kumari
Blockchain & Full-Stack Developer

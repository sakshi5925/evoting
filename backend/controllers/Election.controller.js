import { ethers } from "ethers";
import Election from "../models/Election.js"
import User from "../models/User.js";
import Candidate from "../models/Candidate.js";
import { bnToNumber, normalizeAddress } from "../utils/helpers.js";
import {
    ElectionFactoryAddress,
    electionAbi,
    provider,
    ElectionFactoryContract,
    ElectionFactoryReadOnly
} from "../utils/blockchain.js";



// create election

export const createElection = async (req, res) => {
    try {
        const {
            privateKey,
            ElectionName,
            description,
            ElectionStartTime,
            ElectionEndTime,
            registrationDeadline,
            electionManager
        } = req.body;

      
        if (!privateKey)
            return res.status(400).json({ message: "Private key is required" });

        if (!ElectionName)
            return res.status(400).json({ message: "Election name is required" });

        if (!electionManager)
            return res.status(400).json({ message: "Election manager address required" });

        if (!ethers.isAddress(electionManager)) {
            return res.status(400).json({ message: "Invalid election manager address" });
        }

        const managerAddress = ethers.getAddress(electionManager);

        //  Create on-chain
        const electionFactory = ElectionFactoryContract(privateKey);

        const tx = await electionFactory.createElection(
            managerAddress,
            ElectionName,
            description || "",
            Number(ElectionStartTime),
            Number(ElectionEndTime),
            Number(registrationDeadline)
        );

        const receipt = await tx.wait();

        // Parse ONLY address/id from factory event
        const parsedLogs = receipt.logs
            .map(log => {
                try {
                    return electionFactory.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        const createdEvent = parsedLogs.find(
            e => e.name === "ElectionCreated"
        );

        if (!createdEvent) {
            return res.status(500).json({ message: "ElectionCreated event not found" });
        }

        const electionAddress = ethers.getAddress(createdEvent.args.electionAddress);
        const electionmanager = ethers.getAddress(createdEvent.args.manager);
        const startTime = Number(ElectionStartTime);
        const endTime = Number(ElectionEndTime);
        const regDeadline = Number(registrationDeadline);

        if (
            !Number.isFinite(startTime) ||
            !Number.isFinite(endTime) ||
            !Number.isFinite(regDeadline)
        ) {
            return res.status(400).json({ message: "Invalid timestamps" });
        }

        const newElection = new Election({
            ElectionName: ElectionName,
            description: description || "",
            managerAddress: electionmanager,
            contractAddress: normalizeAddress(electionAddress),
            startTime,
            endTime,
            registrationDeadline: regDeadline,
            startdate: new Date(startTime * 1000),
            enddate: new Date(endTime * 1000),
            totalVotes: 0,
            totalCandidates: 0,
            candidates: [],
            isActive: true
        });

        await newElection.save();

        return res.status(201).json({
            message: "Election created successfully",
            electionAddress
        });

    } catch (error) {
        console.error("Error creating election:", error);
        return res.status(500).json({ error: error.message });
    }
};



//deactivate election

export const deactivateElection = async (req, res) => {
    try {
        const { privateKey, electionAddress } = req.body;

        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });

        const electionFactory = ElectionFactoryContract(privateKey);
        const tx = await electionFactory.deactivateElection(electionAddress);
        await tx.wait();

        await Election.findOneAndUpdate({ contractAddress: normalizeAddress(electionAddress) }, { isActive: false });

        return res.status(200).json({ message: "Election deactivated successfully" });

    } catch (error) {
        console.error("Error deactivating election:", error);
        return res.status(500).json({ error: error.message });
    }
};


//reactivate election

export const reactivateElection = async (req, res) => {
    try {
        const { privateKey, electionAddress } = req.body;
        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });

        const electionFactory = ElectionFactoryContract(privateKey);
        const tx = await electionFactory.reactivateElection(electionAddress);
        await tx.wait();


        await Election.findOneAndUpdate({ contractAddress: normalizeAddress(electionAddress) }, { isActive: true });

        return res.status(200).json({ message: "Election reactivated successfully" });
    } catch (error) {
        console.error("Error reactivating election:", error);
        return res.status(500).json({ error: error.message });
    }
};



const getSignedElectionContract = (privateKey, electionAddress) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(electionAddress, electionAbi, wallet);
};



export const startCandidateRegistration = async (req, res) => {
    try {
        const { privateKey, electionAddress } = req.body;
        console.log("reiceved data",electionAddress)
        if (!privateKey || !electionAddress) {
            return res.status(400).json({ message: "Missing required fields" });
        }


        const election = await Election.findOne({ contractAddress: normalizeAddress(electionAddress) });
        
        if (!election) {
            return res.status(404).json({ message: "Election not found in database" });
        }

        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.startCandidateRegistration();
        await tx.wait();

        election.status = "Registration";
        await election.save();

        return res.status(200).json({
            message: "Candidate registration started successfully",
        });

    } catch (error) {
        console.error("Error starting candidate registration:", error);
        return res.status(500).json({ error: error.message });
    }
};

export const startVoting = async (req, res) => {
    try {
        const { privateKey, electionAddress } = req.body;

        if (!privateKey || !electionAddress) {
            return res.status(400).json({
                message: "Private key and election address are required",
            });
        }

        const electionContract = getSignedElectionContract(
            privateKey,
            electionAddress
        );


        // const info = await electionContract.electionInfo();

        // console.log("ON-CHAIN STATUS:", info.status.toString());
        // console.log("START TIME:", info.startTime.toString());
        // console.log("TOTAL CANDIDATES:", info.totalCandidates.toString());
        // console.log("NOW:", Math.floor(Date.now() / 1000));


        // if (Number(info.status) !== 1) {
        //     return res.status(400).json({
        //         message: "Election is not in Registration state on blockchain",
        //     });
        // }

        // if (Math.floor(Date.now() / 1000) < Number(info.startTime)) {
        //     return res.status(400).json({
        //         message: "Voting time not reached yet",
        //     });
        // }

        // if (Number(info.totalCandidates) === 0) {
        //     return res.status(400).json({
        //         message: "No approved candidates",
        //     });
        // }


        const tx = await electionContract.startVoting();
        await tx.wait(1);


        const updatedElection = await Election.findOneAndUpdate(
            { contractAddress: normalizeAddress(electionAddress) },
            { status: "Voting" },
            { new: true }
        );

        if (!updatedElection) {
            console.warn(
                "Voting started on-chain, but election not found in DB"
            );
        }

        return res.status(200).json({
            message: "Voting started successfully",
            txHash: tx.hash,
            election: updatedElection,
        });

    } catch (error) {
        console.error("Error starting voting:", error);

        return res.status(500).json({
            message: error.shortMessage || error.message,
        });
    }
};




export const endElection = async function (req, res) {
  try {
    const { privateKey, electionAddress } = req.body;

    if (!privateKey || !electionAddress) {
      return res.status(400).json({
        message: "Private key and election address are required",
      });
    }

    const electionContract = getSignedElectionContract(
      privateKey,
      electionAddress
    );

    // 🔍 READ ON-CHAIN STATUS FIRST
    const rawStatus = await electionContract.electionInfo().then(info => info.status);

    const statusMap = {
      0: "Created",
      1: "Registration",
      2: "Voting",
      3: "Ended",
      4: "ResultDeclared",
    };

    console.log("🔎 ON-CHAIN ELECTION STATUS:", Number(rawStatus));
    console.log("📝 STATUS (Readable):", statusMap[Number(rawStatus)]);

    // ❌ GUARD: only allow endElection in Voting
    if (Number(rawStatus) !== 2) {
      return res.status(400).json({
        message: `Cannot end election. Current status: ${statusMap[Number(rawStatus)]}`,
      });
    }

    // ✅ END ELECTION
    const tx = await electionContract.endElection();
    await tx.wait();

    console.log("✅ endElection TX HASH:", tx.hash);

    // 🔄 UPDATE DB (SYNC ONLY)
    await Election.updateOne(
      { contractAddress: normalizeAddress(electionAddress) },
      { status: "Ended" }
    );

    return res.status(200).json({
      message: "Election ended successfully",
    });

  } catch (error) {
    console.error("❌ Error ending election:", error);

    return res.status(500).json({
      error: error.shortMessage || error.message,
    });
  }
};



export const declareResults = async (req, res) => {
  try {
    const { privateKey, electionAddress } = req.body;

    const electionContract = getSignedElectionContract(
      privateKey,
      electionAddress
    );

    // 🔎 READ ON-CHAIN STATUS
    const rawStatus = (await electionContract.electionInfo()).status;

    const statusMap = [
      "Created",
      "Registration",
      "Voting",
      "Ended",
      "ResultDeclared",
    ];

    console.log("🔎 ON-CHAIN STATUS:", Number(rawStatus));
    console.log("📝 STATUS:", statusMap[Number(rawStatus)]);

    // ❌ BLOCK DOUBLE DECLARE
    if (Number(rawStatus) === 4) {
      return res.status(400).json({
        message: "Results already declared for this election",
      });
    }

    // ❌ MUST BE ENDED
    if (Number(rawStatus) !== 3) {
      return res.status(400).json({
        message: `Cannot declare results in status: ${statusMap[Number(rawStatus)]}`,
      });
    }

    // ✅ DECLARE RESULTS
    const tx = await electionContract.declareResult();
    const receipt = await tx.wait();

    await Election.updateOne(
      { contractAddress: normalizeAddress(electionAddress) },
      { status: "ResultDeclared" }
    );

    return res.status(200).json({
      message: "Results declared successfully",
      transactionHash: tx.hash,
    });

  } catch (error) {
    console.error("❌ Error declaring results:", error);

    return res.status(500).json({
      message: error.shortMessage || error.message,
    });
  }
};




export const changeStatus = async function (req, res) {
    try {
        const { electionAddress, status, privateKey } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.changeStatus(status);
        await tx.wait();

        return res.status(200).json({ message: "Election status changed successfully" });
    }

    catch (error) {
        console.error("Error changing election status:", error);
        return res.status(500).json({ error: error.message });
    }
};

// register candidate

export const registerCandidate = async (req, res) => {
    const { privateKey, electionAddress, candidateName, party } = req.body;

    try {
        if (!privateKey || !electionAddress || !candidateName || !party) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(
            electionAddress,
            electionAbi,
            wallet
        );

        // 🔹 TRY normal registration
        const tx = await electionContract.registerCandidate(candidateName, party);
        const receipt = await tx.wait();

        const parsed = receipt.logs
            .map(log => {
                try {
                    return electionContract.interface.parseLog(log);
                } catch {
                    return null;
                }
            })
            .find(e => e?.name === "CandidateRegistered");

        if (!parsed) {
            throw new Error("CandidateRegistered event not found");
        }

        const { candidateId, candidateAddress } = parsed.args;

        // ✅ Save to DB
        await Candidate.create({
            electionAddress: normalizeAddress(electionAddress),
            candidateId: Number(candidateId),
            candidateAddress: normalizeAddress(candidateAddress),
            name: candidateName,
            party,
            status: "Pending",
            voteCount: 0,
        });

        return res.status(200).json({
            message: "Candidate registered successfully",
            candidateId: Number(candidateId),
            candidateAddress,
        });

    } catch (error) {
        // 🔁 HANDLE ALREADY REGISTERED CASE
        if (error.shortMessage?.includes("Already registered")) {
            console.log("Candidate already registered on-chain, syncing DB...");

            const wallet = new ethers.Wallet(privateKey);
            const candidateAddress = wallet.address;

            const readContract = new ethers.Contract(
                electionAddress,
                electionAbi,
                provider
            );

            // 🔹 READ FROM BLOCKCHAIN
            const candidateId = await readContract.candidateAddressToId(candidateAddress);

            if (candidateId.toString() === "0") {
                return res.status(400).json({
                    message: "Candidate not found on-chain",
                });
            }

            const candidateOnChain = await readContract.candidates(candidateId);

            const addr = normalizeAddress(electionAddress);
            // 🔹 UPSERT INTO DB (safe)
            await Candidate.updateOne(
                { electionAddress: addr, candidateId: Number(candidateId) },
                {
                    $set: {
                        electionAddress: addr,
                        candidateId: Number(candidateId),
                        candidateAddress: normalizeAddress(candidateAddress),
                        name: candidateName,
                        party,
                        status: "Pending",
                    }
                },
                { upsert: true }
            );

            return res.status(200).json({
                message: "Candidate already registered (DB synced)",
                candidateId: Number(candidateId),
                candidateAddress,
            });
        }

        console.error("Error registering candidate:", error);
        return res.status(500).json({ message: error.message });
    }
};
//validate candidate

export const validateCandidate = async function (req, res) {
    try {
        const { privateKey, electionAddress, isValid, candidateId } = req.body;

        if (!privateKey)
            return res.status(400).json({ message: "Private key is required" });

        if (!electionAddress)
            return res.status(400).json({ message: "Election address is required" });

        if (candidateId === undefined || candidateId === null)
            return res.status(400).json({ message: "candidateId is required" });

        const addr = normalizeAddress(electionAddress);


        // ✅ 1. Fetch candidate from DB first  

        const candidate = await Candidate.findOne({
            candidateId: Number(candidateId),
            electionAddress: addr,
        });

        if (!candidate)
            return res.status(404).json({ message: "Candidate not found" });

        // ✅ 2. Prevent duplicate validation
        if (candidate.status !== "Pending") {
            return res.status(400).json({
                message: "Candidate already validated",
            });
        }

        // ✅ 3. Call blockchain only if allowed
        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(
            electionAddress,
            electionAbi,
            wallet
        );

        const tx = await electionContract.validateCandidate(
            candidateId,
            Boolean(isValid)
        );
        await tx.wait();

        await Candidate.updateOne(
            { electionAddress: addr, candidateId: Number(candidateId), status: "Pending" },
            { $set: { status: isValid ? "Approved" : "Rejected" } }
        );

        if (isValid) {
            await Election.updateOne(
                { contractAddress: addr },
                {
                    $inc: { totalCandidates: 1 },
                    $addToSet: { candidates: candidate._id }
                }
            );
        }

        return res.status(200).json({
            message: "Candidate validation status updated successfully",
        });
    } catch (error) {
        console.error("Error validating candidate:", error);

        // ✅ Better error message to frontend
        if (error.reason === "Already validated") {
            return res.status(400).json({
                message: "Candidate already validated on blockchain",
            });
        }

        return res.status(500).json({
            message: error.reason || error.message,
        });
    }
};


//castVote 

export const castVote = async function (req, res) {

    try {

        const { privateKey, electionAddress, candidateId } = req.body;

        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });
        if (candidateId === undefined || candidateId === null) return res.status(400).json({ message: "candidateId is required" });
        console.log("privatekey", electionAddress, candidateId)
        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(electionAddress, electionAbi, wallet);

        const tx = await electionContract.castVote(candidateId);

        await tx.wait();

        const addr = normalizeAddress(electionAddress);

        const candidateDoc = await Candidate.updateOne(
            { electionAddress: addr, candidateId: Number(candidateId) },
            { $inc: { voteCount: 1 } }
        );

        if (candidateDoc.matchedCount === 0) {
            return res.status(404).json({ message: "Candidate not found" });
        }



        const updatedElection = await Election.updateOne(
            { contractAddress: addr },
            { $inc: { totalVotes: 1 } }
        );
        if (!updatedElection) {
            console.error("Election not found for address:", electionAddress);
            return res.status(404).json({ message: "Election not found" });
        }
        return res.status(200).json({ message: "Vote cast successfully" });

    }
    catch (error) {
        console.error("Error casting vote:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getWinner

export const getWinner = async function (req, res) {
    try {

        const { electionAddress } = req.body;

        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const winnerIdRaw = await electionContract.getWinner();
        const winnerId = bnToNumber(winnerIdRaw);

        const candidate = await Candidate.findOne({ candidateId: Number(winnerId), electionAddress: normalizeAddress(electionAddress) });
        if (!candidate) {
            return res.status(404).json({ message: "Winner candidate not found" });
        }

        return res.status(200).json({
            message: "Winner fetched successfully",
            winner: {
                candidateId: candidate.candidateId,
                candidateAddress: candidate.candidateAddress,
                name: candidate.name,
                party: candidate.party,
                voteCount: candidate.voteCount,
                status: candidate.status
            }
        });
    }
    catch (error) {
        console.error("Error fetching winner:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getCandidateDetails

export const getCandidateDetails = async function (req, res) {
    try {

        const { candidateId, electionAddress } = req.body;

        if (candidateId === undefined || candidateId === null) return res.status(400).json({ message: "Candidate ID is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });


        const candidateDoc = await Candidate.findOne({ candidateId: Number(candidateId), electionAddress: normalizeAddress(electionAddress) });
        if (!candidateDoc) {
            return res.status(404).json({ message: "Candidate not found" });
        }

        return res.status(200).json({
            message: "Candidate details fetched successfully",
            candidate: {
                candidateId: candidateDoc.candidateId,
                candidateAddress: candidateDoc.candidateAddress,
                name: candidateDoc.name,
                party: candidateDoc.party,
                status: candidateDoc.status,
                voteCount: candidateDoc.voteCount
            }
        });

    }
    catch (error) {
        console.error("Error fetching candidate details:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getPendingCandidates

export const getPendingCandidates = async function (req, res) {
    try {

        const { electionAddress } = req.body;


        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        const pendingCandidates = await Candidate.find({

            electionAddress: normalizeAddress(electionAddress),
            status: "Pending"
        });

        return res.status(200).json({
            message: "Pending candidates fetched successfully",
            candidates: pendingCandidates.map(candidate => ({
                candidateId: candidate.candidateId,
                candidateAddress: candidate.candidateAddress,
                name: candidate.name,
                party: candidate.party,

            }))
        });

    } catch (error) {
        console.error("Error fetching pending candidates:", error);
        return res.status(500).json({ error: error.message });
    }
}

// GET APPROVED CANDIDATES FOR ELECTION
export const getApprovedCandidates = async (req, res) => {
    try {
        const { electionAddress } = req.body;

        const candidates = await Candidate.find({
            electionAddress: normalizeAddress(electionAddress),
            status: "Approved",
        }).sort({ candidateId: 1 });

        res.status(200).json({
            success: true,
            candidates,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



//isVoterRole

export const isVoterRole = async function (req, res) {
    try {
        const { electionAddress, voterAddress } = req.body;

        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        if (!voterAddress) {
            return res.status(400).json({ message: "Voter address is required" });
        }

        const user = await User.findOne({ walletAddress: voterAddress });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isVoter = user.role === "VOTER";

        return res.status(200).json({
            message: "Voter role status fetched successfully",
            isVoter
        });

    }
    catch (error) {
        console.error("Error fetching voter role status:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getTotalCandidates    

export const getTotalCandidates = async function (req, res) {
    try {
        const { electionAddress } = req.body;

        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        const election = await Election.findOne({ contractAddress: normalizeAddress(electionAddress) });
        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        const totalCandidates = election.totalCandidates;

        return res.status(200).json({
            message: "Total candidates fetched successfully",
            totalCandidates: bnToNumber(totalCandidates)
        });

    }
    catch (error) {
        console.error("Error fetching total candidates:", error);
        return res.status(500).json({ error: error.message });
    }
}

// get upcoming elections 

export const getUpcomingElections = async (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);

        const elections = await Election.find({
            startTime: { $gt: now },
            isActive: true
        }).sort({ startTime: 1 });

        return res.status(200).json({
            success: true,
            elections
        });
    } catch (error) {
        console.error("Error fetching upcoming elections:", error);
        return res.status(500).json({ error: error.message });
    }
};

//get ongoing elections

export const getOngoingElections = async (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);

        const elections = await Election.find({
            startTime: { $lte: now },
            endTime: { $gte: now },
            isActive: true
        }).sort({ startTime: 1 });


        return res.status(200).json({
            success: true,
            elections
        });
    } catch (error) {
        console.error("Error fetching ongoing elections:", error);
        return res.status(500).json({ error: error.message });
    }
};

//get past elections

export const getCompletedElections = async (req, res) => {
    try {
        const now = Math.floor(Date.now() / 1000);

        const elections = await Election.find({
            $or: [
                { endTime: { $lt: now } },
                { status: { $in: ["Ended", "ResultDeclared"] } }
            ]
        }).sort({ endTime: -1 });

        return res.status(200).json({
            success: true,
            elections
        });
    } catch (error) {
        console.error("Error fetching completed elections:", error);
        return res.status(500).json({ error: error.message });
    }
};

//get all elections

export const getAllElections = async (req, res) => {
    try {
        const elections = await Election.find().sort({ startTime: -1 });

        return res.status(200).json({
            success: true,
            elections
        });
    } catch (error) {
        console.error("Error fetching all elections:", error);
        return res.status(500).json({ error: error.message });
    }
};

//register as voter

export const voterRegister = async (req, res) => {
    try {
        const { walletAddress } = req.body;

        if (!walletAddress) {
            return res.status(400).json({
                success: false,
                message: "Wallet address is required",
            });
        }

        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.role = "voter";
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Voter registered successfully (pending validation)",
        });

    } catch (error) {
        console.error("Error in voter registration:", error);
        return res.status(500).json({ error: error.message });
    }
};

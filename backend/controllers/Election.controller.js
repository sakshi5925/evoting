import { ethers } from "ethers";
import Election from "../models/Election.js";
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

        console.log("Received election creation request:", req.body);
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
            contractAddress: electionAddress,
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


//get election by address

// export const getElectionByAddress = async (req, res) => {
//     try {
//         const { electionAddress } = req.body;

//         if (!electionAddress)
//             return res.status(400).json({ message: "Election address is required" });

//         const electionFactory = ElectionFactoryReadOnly();
//         const electionData = await electionFactory.getElection(electionAddress);

//         return res.status(200).json({
//             success: true,
//             election: {
//                 id: bnToNumber(electionData.id),
//                 electionAddress: normalizeAddress(electionData.electionAddress),
//                 creator: normalizeAddress(electionData.creator),
//                 name: electionData.name,
//                 description: electionData.description,
//                 startTime: bnToNumber(electionData.startTime),
//                 endTime: bnToNumber(electionData.endTime),
//                 createdAt: bnToNumber(electionData.createdAt),
//                 isActive: electionData.isActive
//             }
//         });

//     } catch (error) {
//         if (error.reason === "Election not found") {
//             return res.status(404).json({ message: "Election not found" });
//         }

//         console.error("Error fetching election:", error);
//         return res.status(500).json({ error: error.message });
//     }
// };


// startCandidateRegistration, startVoting, endElection, declareResults, changeStatus

const getSignedElectionContract = (privateKey, electionAddress) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(electionAddress, electionAbi, wallet);
};



export const startCandidateRegistration = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;

        console.log("Received request to start candidate registration for election:", electionAddress, privateKey);
        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }

        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });
        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.startCandidateRegistration();
        await tx.wait();
        await Election.findOneAndUpdate({ contractAddress: normalizeAddress(electionAddress) }, { status: "Registration" });
        console.log("Candidate registration started on-chain for election:", tx);
        return res.status(200).json({ message: "Candidate registration started successfully" });
    }

    catch (error) {
        console.error("Error starting candidate registration:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const startVoting = async (req, res) => {
    try {
        const { privateKey, electionAddress } = req.body;
        if (!privateKey) return res.status(400).json({ message: "Private key is required" });

        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.startVoting();
        await tx.wait();

        return res.status(200).json({ message: "Voting started successfully" });
    } catch (error) {
        console.error("Error starting voting:", error);
        return res.status(500).json({ error: error.message });
    }
};


export const endElection = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.endElection();
        await tx.wait();

        return res.status(200).json({ message: "Election ended successfully" });
    }

    catch (error) {
        console.error("Error ending election:", error);
        return res.status(500).json({ error: error.message });
    }
};


export const declareResults = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.declareResult();
        await tx.wait();

        return res.status(200).json({ message: "Results declared successfully" });
    }

    catch (error) {
        console.error("Error declaring results:", error);
        return res.status(500).json({ error: error.message });
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

      // 🔹 UPSERT INTO DB (safe)
      await Candidate.updateOne(
        {
          electionAddress: normalizeAddress(electionAddress),
          candidateAddress: normalizeAddress(candidateAddress),
        },
        {
          $setOnInsert: {
            electionAddress: normalizeAddress(electionAddress),
            candidateId: Number(candidateId),
            candidateAddress: normalizeAddress(candidateAddress),
            name: candidateOnChain.name,
            party: candidateOnChain.party,
            status: "Pending",
            voteCount: Number(candidateOnChain.voteCount),
          },
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

        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });
        if (candidateId === undefined || candidateId === null) return res.status(400).json({ message: "candidateId is required" });


        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(electionAddress, electionAbi, wallet);

        const tx = await electionContract.validateCandidate(candidateId, Boolean(isValid));
        await tx.wait();

        const candidate = await Candidate.findOne({ candidateId: Number(candidateId), election: normalizeAddress(electionAddress) });
        if (!candidate) return res.status(404).json({ message: "Candidate not found" });

        candidate.status = isValid ? "Approved" : "Rejected";
        await candidate.save();

        const election = await Election.findOne({ contractAddress: normalizeAddress(electionAddress) });
        if (!election) return res.status(404).json({ message: "Election not found" });
        if (isValid) {
            election.candidates.push(candidate._id);
            election.totalCandidates += 1;
            await election.save();
        }

        return res.status(200).json({ message: "Candidate validation status updated successfully" });

    }
    catch (error) {
        console.error("Error validating candidate:", error);
        return res.status(500).json({ error: error.message });
    }
}


//castVote 

export const castVote = async function (req, res) {

    try {

        const { privateKey, electionAddress, candidateId } = req.body;

        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });
        if (candidateId === undefined || candidateId === null) return res.status(400).json({ message: "candidateId is required" });

        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(electionAddress, electionAbi, wallet);

        const tx = await electionContract.castVote(candidateId);

        await tx.wait();


        // const candidateData = await (new ethers.Contract(electionAddress, electionAbi, provider)).getCandidateDetails(candidateId);
        // const chainVoteCount = bnToNumber(candidateData.voteCount);

        const candidateDoc = await Candidate.findOne({ candidateId: Number(candidateId), election: normalizeAddress(electionAddress) });

        if (!candidateDoc) {
            return res.status(404).json({ message: "Candidate not found" });
        } else {
            candidateDoc.voteCount += 1;
            await candidateDoc.save();
        }


        await Election.findOneAndUpdate({ contractAddress: normalizeAddress(electionAddress) }, { totalVotes: totalVotes + 1 }).catch(() => null);

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

        const candidate = await Candidate.findOne({ candidateId: Number(winnerId), election: normalizeAddress(electionAddress) });
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


        const candidateDoc = await Candidate.findOne({ candidateId: Number(candidateId), election: normalizeAddress(electionAddress) });
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
            election: normalizeAddress(electionAddress),
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

//getVoterStatus

// export const getVoterStatus = async function (req, res) {
//     try {

//         const { electionAddress, voterAddress } = req.body;

//         if (!electionAddress) {
//             return res.status(400).json({ message: "Election address is required" });
//         }

//         if (!voterAddress) {
//             return res.status(400).json({ message: "Voter address is required" });
//         }

//         const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

//         const voterStatus = await electionContract.getVoterStatus(voterAddress);

//         return res.status(200).json({
//             message: "Voter status fetched successfully",
//             voterStatus: {
//                 isRoleVoter: voterStatus.isRoleVoter,
//                 hasAlreadyVoted: voterStatus.hasAlreadyVoted,
//                 votedFor: voterStatus.votedFor ? Number(voterStatus.votedFor) : null
//             }
//         });

//     }
//     catch (error) {
//         console.error("Error fetching voter status:", error);
//         return res.status(500).json({ error: error.message });
//     }
// }

//getElectionInfo

// export const getElectionInfo = async function (req, res) {
//     try {
//         const { electionAddress } = req.body;

//         if (!electionAddress) {
//             return res.status(400).json({ message: "Election address is required" });
//         }

//         const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

//         const electionInfo = await electionContract.getElectionInfo();

//         return res.status(200).json({
//             message: "Election info fetched successfully",
//             electionInfo: {
//                 name: electionInfo.name,
//                 description: electionInfo.description,
//                 startTime: bnToNumber(electionInfo.startTime),
//                 endTime: bnToNumber(electionInfo.endTime),
//                 registrationDeadline: bnToNumber(electionInfo.registrationDeadline),
//                 status: bnToNumber(electionInfo.status),
//                 totalVotes: bnToNumber(electionInfo.totalVotes),
//                 totalCandidates: bnToNumber(electionInfo.totalCandidates)
//             }
//         });

//     }
//     catch (error) {
//         console.error("Error fetching election info:", error);
//         return res.status(500).json({ error: error.message });
//     }
// }

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
            status: "Voting",
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
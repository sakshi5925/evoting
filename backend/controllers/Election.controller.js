import { ethers } from "ethers";
import { Election } from "../models/Election.js";
import { Candidate } from "../models/Candidate.js";
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

        if (!privateKey) return res.status(400).json({ message: "Private key is required" });
        if (!ElectionName) return res.status(400).json({ message: "Election name is required" });
        if (!electionManager) return res.status(400).json({ message: "Election manager address required" });

        const electionFactory = ElectionFactoryContract(privateKey);

        const tx = await electionFactory.createElection(
            electionManager,
            ElectionName,
            description || "",
            ElectionStartTime,
            ElectionEndTime,
            registrationDeadline
        );

        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "ElectionCreated");
        if (!event) return res.status(500).json({ message: "ElectionCreated event not found" });

        const [
            rawElectionId,
            rawElectionAddress,
            rawCreator,
            rawName,
            rawStartTime,
            rawEndTime
        ] = event.args;

        const electionId = bnToNumber(rawElectionId);
        const electionAddress = normalizeAddress(rawElectionAddress);
        const creator = normalizeAddress(rawCreator);
        const startTime = bnToNumber(rawStartTime);
        const endTime = bnToNumber(rawEndTime);

        const newElection = new Election({
            electionId,
            name: rawName || ElectionName,
            description: description || "",
            managerAddress: creator,
            contractAddress: electionAddress,
            startTime,
            endTime,
            registrationDeadline,
            startdate: new Date(startTime * 1000),
            enddate: new Date(endTime * 1000),
            totalVotes: 0,
            totalCandidates: 0,
            candidates: [],
            isActive: true,
        });

        await newElection.save();

        return res.status(201).json({
            message: "Election created successfully",
            electionAddress: electionAddress,
            electionId: electionId
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

export const getElectionByAddress = async (req, res) => {
    try {
        const { electionAddress } = req.body;

        if (!electionAddress)
            return res.status(400).json({ message: "Election address is required" });

        const electionFactory = ElectionFactoryReadOnly();
        const electionData = await electionFactory.getElection(electionAddress);

        return res.status(200).json({
            success: true,
            election: {
                id: bnToNumber(electionData.id),
                electionAddress: normalizeAddress(electionData.electionAddress),
                creator: normalizeAddress(electionData.creator),
                name: electionData.name,
                description: electionData.description,
                startTime: bnToNumber(electionData.startTime),
                endTime: bnToNumber(electionData.endTime),
                createdAt: bnToNumber(electionData.createdAt),
                isActive: electionData.isActive
            }
        });

    } catch (error) {
        if (error.reason === "Election not found") {
            return res.status(404).json({ message: "Election not found" });
        }

        console.error("Error fetching election:", error);
        return res.status(500).json({ error: error.message });
    }
};


// startCandidateRegistration, startVoting, endElection, declareResults, changeStatus

const getSignedElectionContract = (privateKey, electionAddress) => {
    const wallet = new ethers.Wallet(privateKey, provider);
    return new ethers.Contract(electionAddress, electionAbi, wallet);
};



export const startCandidateRegistration = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }

        if (!electionAddress) return res.status(400).json({ message: "Election address is required" });
        const electionContract = getSignedElectionContract(privateKey, electionAddress);
        const tx = await electionContract.startCandidateRegistration();
        await tx.wait();
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

export const registerCandidate = async function (req, res) {
    try {
        const { privateKey, electionAddress, name, party, manifesto, imageHash } = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }
        if (!name || !party) {
            return res.status(400).json({ message: "Name and Party are required" });
        }


        const wallet = new ethers.Wallet(privateKey, provider);
        const electionContract = new ethers.Contract(electionAddress, electionAbi, wallet);


        const tx = await electionContract.registerCandidate(
            name,
            party,
            manifesto || "",
            imageHash || ""
        );


        const receipt = await tx.wait();
        const event = receipt.events?.find(e => e.event === "CandidateRegistered");

        if (!event) {
            return res.status(500).json({ message: "CandidateRegistered event not found" });
        }

        const [candidateId, candidateAddress, candidateName] = event.args;


        const candidate = new Candidate({
            election: normalizeAddress(electionAddress),
            candidateId: Number(candidateId),
            candidateAddress: candidateAddress,
            name,
            party,
            manifesto: manifesto || "",
            imageHash: imageHash || "",
            status: "Pending",
            voteCount: 0
        });

        await candidate.save();

        return res.status(200).json({
            message: "Candidate registered successfully",
            candidateId: Number(candidateId),
            candidateAddress,
        });

    }

    catch (error) {
        console.error("Error registering candidate:", error);
        return res.status(500).json({ error: error.message });
    }

}

//validate candidate

export const validateCandidate = async function (req, res) {
    try {
        const { privateKey, electionAddress, candidateAddress, isValid, candidateId } = req.body;

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


        const candidateData = await (new ethers.Contract(electionAddress, electionAbi, provider)).getCandidateDetails(candidateId);
        const chainVoteCount = bnToNumber(candidateData.voteCount);

        const candidateDoc = await Candidate.findOne({ candidateId: Number(candidateId), election: normalizeAddress(electionAddress) });

        if (!candidateDoc) {
            // If DB candidate absent, optionally create it from chain info
            await Candidate.create({
                election: normalizeAddress(electionAddress),
                candidateId: Number(candidateId),
                candidateAddress: normalizeAddress(candidateData.candidateAddress || ""),
                name: candidateData.name || "",
                party: candidateData.party || "",
                manifesto: candidateData.manifesto || "",
                imageHash: candidateData.imageHash || "",
                status: String(candidateData.status || "0"),
                voteCount: chainVoteCount
            });
        } else {
            candidateDoc.voteCount = chainVoteCount;
            await candidateDoc.save();
        }

        const electionInfo = await (new ethers.Contract(electionAddress, electionAbi, provider)).getElectionInfo();
        const chainTotalVotes = bnToNumber(electionInfo.totalVotes);
        await Election.findOneAndUpdate({ contractAddress: normalizeAddress(electionAddress) }, { totalVotes: chainTotalVotes }).catch(() => null);

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
                manifesto: candidate.manifesto,
                imageHash: candidate.imageHash,
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


        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const candidateData = await electionContract.getCandidateDetails(candidateId);

        return res.status(200).json({
            message: "Candidate details fetched successfully",
            candidate: {
                candidateId: bnToNumber(candidateData.id),
                candidateAddress: normalizeAddress(candidateData.candidateAddress),
                name: candidateData.name,
                party: candidateData.party,
                manifesto: candidateData.manifesto,
                imageHash: candidateData.imageHash,
                status: bnToNumber(candidateData.status),
                voteCount: bnToNumber(candidateData.voteCount)
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

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const pendingCandidates = await electionContract.getPendingCandidates();



        const formatted = pendingCandidates.map(c => ({
            id: bnToNumber(c.id),
            name: c.name,
            party: c.party,
            voteCount: bnToNumber(c.voteCount),
            status: bnToNumber(c.status)
        }));

        return res.status(200).json({
            message: "Pending candidates fetched successfully",
            pendingCandidates: formatted
        });

    } catch (error) {
        console.error("Error fetching pending candidates:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getVoterStatus

export const getVoterStatus = async function (req, res) {
    try {

        const { electionAddress, voterAddress } = req.body;

        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        if (!voterAddress) {
            return res.status(400).json({ message: "Voter address is required" });
        }

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const voterStatus = await electionContract.getVoterStatus(voterAddress);

        return res.status(200).json({
            message: "Voter status fetched successfully",
            voterStatus: {
                isRoleVoter: voterStatus.isRoleVoter,
                hasAlreadyVoted: voterStatus.hasAlreadyVoted,
                votedFor: voterStatus.votedFor ? Number(voterStatus.votedFor) : null
            }
        });

    }
    catch (error) {
        console.error("Error fetching voter status:", error);
        return res.status(500).json({ error: error.message });
    }
}

//getElectionInfo

export const getElectionInfo = async function (req, res) {
    try {
        const { electionAddress } = req.body;

        if (!electionAddress) {
            return res.status(400).json({ message: "Election address is required" });
        }

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const electionInfo = await electionContract.getElectionInfo();

        return res.status(200).json({
            message: "Election info fetched successfully",
            electionInfo: {
                name: electionInfo.name,
                description: electionInfo.description,
                startTime: bnToNumber(electionInfo.startTime),
                endTime: bnToNumber(electionInfo.endTime),
                registrationDeadline: bnToNumber(electionInfo.registrationDeadline),
                status: bnToNumber(electionInfo.status),
                totalVotes: bnToNumber(electionInfo.totalVotes),
                totalCandidates: bnToNumber(electionInfo.totalCandidates)
            }
        });

    }
    catch (error) {
        console.error("Error fetching election info:", error);
        return res.status(500).json({ error: error.message });
    }
}

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

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const isVoter = await electionContract.isVoter(voterAddress);

        return res.status(200).json({
            message: "Voter role status fetched successfully",
            isVoter: isVoter
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

        const electionContract = new ethers.Contract(electionAddress, electionAbi, provider);

        const totalCandidates = await electionContract.getTotalCandidates();

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


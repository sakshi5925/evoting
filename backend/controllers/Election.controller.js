import {ether} from 'ethers';
import {Election} from '../models/Election';
import { ElectionFactoryAddress,electionAbi,provider,ElectionFactoryContract } from '../utils/blockchain';

export const createElection = async function (req, res) {

    try {

        const { privateKey, electionAddress, name, description, startTime, endTime, registrationDeadline } = req.body;
        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        
        const electionFactory = ElectionFactoryContract(privateKey);
        const tx = await electionFactory.createElection(name, description, startTime, endTime, registrationDeadline);
        const receipt = await tx.wait();
        const event = receipt.events.find(event => event.event === 'ElectionCreated');
        const [electionAddr] = event.args;
        
        const newElection=new Election({
            name,
            description,
            managerAddress: await electionFactory.signer.getAddress(),
            contractAddress: electionAddr,
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

        return res.status(201).json({ message: "Election created successfully", electionAddress: electionAddr });
    }

    catch (error) {
        console.error("Error starting candidate registration:", error);
        return res.status(500).json({ error: error.message });
    }
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           



export const startCandidateRegistration = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;
        
        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = new ether.Contract(electionAddress, electionAbi, new ether.Wallet(privateKey, provider));
        const tx = await electionContract.startCandidateRegistration();
        await tx.wait();

        return res.status(200).json({ message: "Candidate registration started successfully" });
    }

    catch (error) {
        console.error("Error starting candidate registration:", error);
        return res.status(500).json({ error: error.message });
    }

}

export const startVoting = async function (req, res) {
    try {
        const { privateKey, electionAddress } = req.body;
        
        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = new ether.Contract(electionAddress, electionAbi, new ether.Wallet(privateKey, provider));
        const tx = await electionContract.startVoting();
        await tx.wait();

        return res.status(200).json({ message: "Voting started successfully" });
    }

    catch (error) {
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
        const electionContract = new ether.Contract(electionAddress, electionAbi, new ether.Wallet(privateKey, provider));
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
        const electionContract = new ether.Contract(electionAddress, electionAbi, new ether.Wallet(privateKey, provider));
        const tx = await electionContract.declareResults();
        await tx.wait();

        return res.status(200).json({ message: "Results declared successfully" });
    }

    catch (error) {
        console.error("Error declaring results:", error);
        return res.status(500).json({ error: error.message });
    }
};


export const _changeStatus = async function (req, res) {
    try {
        const { electionAddress, status ,privateKey} = req.body;

        if (!privateKey) {
            return res.status(400).json({ message: "Private key is required" });
        }
        const electionContract = new ether.Contract(electionAddress, electionAbi, new ether.Wallet(privateKey, provider));
        const tx = await electionContract.changeStatus(status);
        await tx.wait();

        return res.status(200).json({ message: "Election status changed successfully" });
    }

    catch (error) {
        console.error("Error changing election status:", error);
        return res.status(500).json({ error: error.message });
    }
};



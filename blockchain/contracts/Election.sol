// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./Roles.sol";

contract Election is ReentrancyGuard {
    Roles public roles;
    address public electionManager;
    
    enum ElectionStatus { Created, Registration, Voting, Ended, ResultDeclared }
    enum CandidateStatus { Pending, Approved, Rejected }
    
    struct Candidate {
        uint256 id;
        address candidateAddress;
        string name;
        string party;
        CandidateStatus status;
        uint256 voteCount;
        bool exists;        
    }
    
    // struct VoterInfo {
    //     bool isRegistered;
    //     bool hasVoted;
    //     uint256 votedCandidateId;
    //     uint256 registrationTime;
    // }
    
    struct ElectionInfo {
        string electionName;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 registrationDeadline;
        ElectionStatus status;
        uint256 totalVotes;
        uint256 totalCandidates;
    }

    ElectionInfo public electionInfo;
    uint256 private candidateIdCounter;
    
    mapping(uint256 => Candidate) public candidates;
    mapping(address => uint256) public candidateAddressToId;
    mapping(address => bool) public hasVoted;
    mapping(address => uint256) public votedCandidateId;    
    
    uint256[] public candidateIds;

    event ElectionCreated(string electionName, uint256 startTime, uint256 endTime, ElectionStatus status);
    event ElectionStatusChanged(ElectionStatus oldStatus, ElectionStatus newStatus);
    event CandidateRegistered(uint256 indexed candidateId, address indexed candidateAddress, string name);
    event CandidateValidated(uint256 indexed candidateId, CandidateStatus status);
    event VoterRegistered(address indexed voter);
    event VoteCasted(address indexed voter, uint indexed candidateId);
    event ResultDeclared(uint indexed winnerCandidateId, uint256 totalVotes);

    modifier onlyElectionManager() {
        require(msg.sender == electionManager, "Only election manager");
        _;
    }

    modifier onlyElectionAuthorityOrManager() {
        require(
            roles.hasRole(roles.ELECTION_AUTHORITY(), msg.sender) || msg.sender == electionManager,
            "Only authority or manager"
        );
        _;
    }

    modifier onlyVoter() {
        require(roles.hasRole(roles.VOTER(), msg.sender), "Only registered voter");
        _;
    }

    modifier inStatus(ElectionStatus _status) {
        require(electionInfo.status == _status, "Invalid election status");
        _;
    }

    constructor(
        address _rolesContract,
        address _electionManager,
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _registrationDeadline
    ) {
        require(_rolesContract != address(0), "Invalid roles contract");
        require(_electionManager != address(0), "Invalid manager");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_registrationDeadline < _startTime, "Registration must end before voting starts");
        require(bytes(_name).length > 0, "Name required");
        
        roles = Roles(_rolesContract);
        electionManager = _electionManager;
        
        electionInfo = ElectionInfo({
            electionName: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            registrationDeadline: _registrationDeadline,
            status: ElectionStatus.Created,
            totalVotes: 0,
            totalCandidates: 0
        });

        candidateIdCounter = 0;
        emit ElectionCreated(_name, _startTime, _endTime,electionInfo.status);
    }

    function startCandidateRegistration() external onlyElectionManager inStatus(ElectionStatus.Created) {
        require(block.timestamp < electionInfo.registrationDeadline, "Registration deadline passed");
        _changeStatus(ElectionStatus.Registration);
    }

    function startVoting() external onlyElectionManager inStatus(ElectionStatus.Registration) {
        require(block.timestamp >= electionInfo.startTime, "Voting time not reached");
        require(electionInfo.totalCandidates > 0, "No approved candidates");
        _changeStatus(ElectionStatus.Voting);
    }

    function endElection() external onlyElectionManager inStatus(ElectionStatus.Voting) {
        require(block.timestamp >= electionInfo.endTime, "Election end time not reached");
        _changeStatus(ElectionStatus.Ended);
    }

    function declareResult() external onlyElectionManager inStatus(ElectionStatus.Ended) {
        _changeStatus(ElectionStatus.ResultDeclared);
        uint256 winnerId = getWinner();
        emit ResultDeclared(winnerId, electionInfo.totalVotes);
    }

    function _changeStatus(ElectionStatus newStatus) private onlyElectionManager {
        ElectionStatus oldStatus = electionInfo.status;
        electionInfo.status = newStatus;
        emit ElectionStatusChanged(oldStatus, newStatus);
    }

    function registerCandidate(
        string memory _name,
        string memory _party
    ) external inStatus(ElectionStatus.Registration) {
        require(block.timestamp < electionInfo.registrationDeadline, "Registration closed");
        require(candidateAddressToId[msg.sender] == 0, "Already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_party).length > 0, "Party required");
        candidateIdCounter++;
        candidates[candidateIdCounter] = Candidate({
            id: candidateIdCounter,
            candidateAddress: msg.sender,
            name: _name,
            party: _party,
            status: CandidateStatus.Pending,
            voteCount: 0,
            exists: true
        });

        candidateAddressToId[msg.sender] = candidateIdCounter;
        candidateIds.push(candidateIdCounter);
        emit CandidateRegistered(candidateIdCounter, msg.sender, _name);
    }

    function validateCandidate(uint256 _candidateId, bool _approve) 
        external 
        onlyElectionAuthorityOrManager 
        inStatus(ElectionStatus.Registration) 
    {
        require(candidates[_candidateId].exists, "Candidate not found");
        require(candidates[_candidateId].status == CandidateStatus.Pending, "Already validated");

        if (_approve) {
            candidates[_candidateId].status = CandidateStatus.Approved;
            electionInfo.totalCandidates++;
        } else {
            candidates[_candidateId].status = CandidateStatus.Rejected;
        }

        emit CandidateValidated(_candidateId, candidates[_candidateId].status);
    }


    function castVote(uint256 _candidateId) external onlyVoter inStatus(ElectionStatus.Voting) nonReentrant {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidates[_candidateId].exists, "Candidate not found");
        require(candidates[_candidateId].status == CandidateStatus.Approved, "Candidate not approved");
        require(block.timestamp >= electionInfo.startTime, "Voting not started");
        require(block.timestamp <= electionInfo.endTime, "Voting ended");

        hasVoted[msg.sender] = true;
        votedCandidateId[msg.sender] = _candidateId;
        candidates[_candidateId].voteCount++;
        electionInfo.totalVotes++;

        emit VoteCasted(msg.sender, _candidateId);
    }

    function getWinner() public view returns (uint256) {
        require(
            electionInfo.status == ElectionStatus.Ended || 
            electionInfo.status == ElectionStatus.ResultDeclared,
            "Election not ended"
        );
        
        uint256 maxVotes = 0;
        uint256 winnerId = 0;

        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 candidateId = candidateIds[i];
            if (candidates[candidateId].status == CandidateStatus.Approved && candidates[candidateId].voteCount > maxVotes) {
                maxVotes = candidates[candidateId].voteCount;
                winnerId = candidateId;
            }
        }

        return winnerId;
    }

  

    function getResults() external view returns (uint256[] memory ids, string[] memory names, uint256[] memory voteCounts) {
        require(electionInfo.status == ElectionStatus.Ended || electionInfo.status == ElectionStatus.ResultDeclared, "Results not available yet");

        uint256 approvedCount = 0;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            if (candidates[candidateIds[i]].status == CandidateStatus.Approved) approvedCount++;
        }

        ids = new uint256[](approvedCount);
        names = new string[](approvedCount);
        voteCounts = new uint256[](approvedCount);

        uint256 index = 0;
        for (uint256 i = 0; i < candidateIds.length; i++) {
            uint256 candidateId = candidateIds[i];
            if (candidates[candidateId].status == CandidateStatus.Approved) {
                ids[index] = candidateId;
                names[index] = candidates[candidateId].name;
                voteCounts[index] = candidates[candidateId].voteCount;
                index++;
            }
        }
    }

    // function getCandidateDetails(uint256 _candidateId) external view returns (Candidate memory) {
    //     require(candidates[_candidateId].exists, "Candidate not found");
    //     return candidates[_candidateId];
    // }

    // function getAllApprovedCandidates() external view returns (Candidate[] memory) {
    //     uint256 count = 0;
    //     for (uint256 i = 0; i < candidateIds.length; i++) {
    //         if (candidates[candidateIds[i]].status == CandidateStatus.Approved) count++;
    //     }

    //     Candidate[] memory approved = new Candidate[](count);
    //     uint256 index = 0;
    //     for (uint256 i = 0; i < candidateIds.length; i++) {
    //         if (candidates[candidateIds[i]].status == CandidateStatus.Approved) {
    //             approved[index++] = candidates[candidateIds[i]];
    //         }
    //     }
    //     return approved;
    // }

    // function getPendingCandidates() external view returns (Candidate[] memory) {
    //     uint256 count = 0;
    //     for (uint256 i = 0; i < candidateIds.length; i++) {
    //         if (candidates[candidateIds[i]].status == CandidateStatus.Pending) count++;
    //     }

    //     Candidate[] memory pending = new Candidate[](count);
    //     uint256 index = 0;
    //     for (uint256 i = 0; i < candidateIds.length; i++) {
    //         if (candidates[candidateIds[i]].status == CandidateStatus.Pending) {
    //             pending[index++] = candidates[candidateIds[i]];
    //         }
    //     }
    //     return pending;
    // }

    // function getVoterStatus(address _voter) external view returns (bool isRoleVoter, bool hasAlreadyVoted, uint256 votedFor) {
    //     isRoleVoter = roles.hasRole(roles.VOTER(), _voter);
    //     hasAlreadyVoted = hasVoted[_voter];
    //     votedFor = votedCandidateId[_voter];
    // }

    // function getElectionInfo() external view returns (ElectionInfo memory) {
    //     return electionInfo;
    // }

    // function isVoterRole(address _voter) external view returns (bool) {
    //     return roles.hasRole(roles.VOTER(), _voter);
    // }

    // function getTotalCandidates() external view returns (uint256) {
    //     return candidateIds.length;
    // }

    // function getCandidateIdCounter() external view returns (uint256) {
    //     return candidateIdCounter;
    // }
}
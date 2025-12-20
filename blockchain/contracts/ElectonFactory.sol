// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./Election.sol";
import "./Roles.sol";

contract ElectionFactory {
    Roles public roles;
    uint256 private electionIdCounter;

    struct ElectionMetadata {
        uint256 id;
        address electionAddress;
        address manager;
        string name;
        uint256 createdAt;
        bool isActive;
        address creator;
    }

    mapping(address => ElectionMetadata) public elections;
    mapping(address => address[]) public managerElections;
    address[] public allElectionAddresses;

    event ElectionCreated(
        uint256 indexed electionId,
        address  electionAddress,
        address  creator,
        address  manager,
        string name
    );
   
    event ElectionDeactivated(uint256 indexed electionId, address deactivatedBy);
    event ElectionReactivated(uint256 indexed electionId, address reactivatedBy);

    modifier onlySuperAdmin() {
        require(
            roles.hasRole(roles.SUPER_ADMIN(), msg.sender),
            "Only super admin"
        );
        _;
    }


    constructor(address _rolesAddress) {
        require(_rolesAddress != address(0), "Invalid roles address");
        roles = Roles(_rolesAddress);
        electionIdCounter = 0;
    }

    function createElection(
        address _electionManager,
        string memory _name,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _registrationDeadline
    ) external onlySuperAdmin returns (address electionAddress) {
        require(bytes(_name).length > 0, "Name required");
        require(
            roles.hasRole(roles.ELECTION_MANAGER(), _electionManager),
            "Manager lacks ELECTION_MANAGER role"
        );
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        require(_registrationDeadline < _startTime, "Registration must end before voting");

        electionIdCounter++;
        uint256 newElectionId = electionIdCounter;

        Election newElection = new Election(
            address(roles),
            _electionManager,
            _name,
            _description,
            _startTime,
            _endTime,
            _registrationDeadline
        );

        electionAddress = address(newElection);

        elections[electionAddress] = ElectionMetadata({
            id: newElectionId,
            electionAddress: electionAddress,
            manager: _electionManager,
            name: _name,
            createdAt: block.timestamp,
            isActive: true,
            creator: msg.sender
        });

        managerElections[_electionManager].push(electionAddress);
        allElectionAddresses.push(electionAddress);

        emit ElectionCreated(
            newElectionId,
            electionAddress,
            msg.sender,
            _electionManager,
            _name
        );

        return electionAddress;
    }

    function deactivateElection(address _electionAddress) onlySuperAdmin external {
        require(elections[_electionAddress].electionAddress != address(0), "Election not found");
        require(elections[_electionAddress].isActive, "Election already inactive");
        elections[_electionAddress].isActive = false;
        emit ElectionDeactivated(elections[_electionAddress].id, msg.sender);
    }

    function reactivateElection(address _electionAddress) external onlySuperAdmin {
        require(elections[_electionAddress].electionAddress != address(0), "Election not found");
        require(!elections[_electionAddress].isActive, "Election already active");

        elections[_electionAddress].isActive = true;
        emit ElectionReactivated(elections[_electionAddress].id, msg.sender);
    }


    function getAllElections() external view returns (ElectionMetadata[] memory) {
        ElectionMetadata[] memory allElections = new ElectionMetadata[](allElectionAddresses.length);
        for (uint256 i = 0; i < allElectionAddresses.length; i++) {
            allElections[i] = elections[allElectionAddresses[i]];
        }
        return allElections;
    }
}

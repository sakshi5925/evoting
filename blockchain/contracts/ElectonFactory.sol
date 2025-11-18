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
        address creator;
        string name;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => ElectionMetadata) public elections;
    mapping(address => address[]) public managerElections;
    mapping(address => bool) public isElectionContract;
    address[] public allElectionAddresses;

    event ElectionCreated(
        uint256 indexed electionId,
        address indexed electionAddress,
        address indexed creator,
        string name,
        uint256 startTime,
        uint256 endTime
    );
    event ElectionDeactivated(uint256 indexed electionId, address deactivatedBy);

    modifier onlyElectionManager() {
        require(
            roles.hasRole(roles.ELECTION_MANAGER(), msg.sender),
            "Only election manager"
        );
        _;
    }

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
    ) external onlyElectionManager returns (address electionAddress) {
        require(bytes(_name).length > 0, "Name required");
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
            creator: _electionManager,
            name: _name,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            createdAt: block.timestamp,
            isActive: true
        });

        managerElections[_electionManager].push(electionAddress);
        allElectionAddresses.push(electionAddress);
        isElectionContract[electionAddress] = true;

        emit ElectionCreated(
            newElectionId,
            electionAddress,
            _electionManager,
            _name,
            _startTime,
            _endTime
        );

        return electionAddress;
    }

    function deactivateElection(address _electionAddress) external {
        require(elections[_electionAddress].electionAddress != address(0), "Election not found");
        require(elections[_electionAddress].isActive, "Election already inactive");
        require(
            elections[_electionAddress].creator == msg.sender || 
            roles.hasRole(roles.SUPER_ADMIN(), msg.sender),
            "Not authorized"
        );

        elections[_electionAddress].isActive = false;
        emit ElectionDeactivated(elections[_electionAddress].id, msg.sender);
    }

    function reactivateElection(address _electionAddress) external onlySuperAdmin {
        require(elections[_electionAddress].electionAddress != address(0), "Election not found");
        require(!elections[_electionAddress].isActive, "Election already active");

        elections[_electionAddress].isActive = true;
    }

    function getElection(address _electionAddress) external view returns (ElectionMetadata memory) {
        require(elections[_electionAddress].electionAddress != address(0), "Election not found");
        return elections[_electionAddress];
    }

    function getManagerElections(address _manager) external view returns (address[] memory) {
        return managerElections[_manager];
    }

    function getAllElections() external view returns (ElectionMetadata[] memory) {
        ElectionMetadata[] memory allElections = new ElectionMetadata[](allElectionAddresses.length);
        for (uint256 i = 0; i < allElectionAddresses.length; i++) {
            allElections[i] = elections[allElectionAddresses[i]];
        }
        return allElections;
    }

    function getTotalElections() external view returns (uint256) {
        return allElectionAddresses.length;
    }


    function isValidElection(address _address) external view returns (bool) {
        return isElectionContract[_address];
    }

    function getElectionsByAddresses(address[] memory _addresses)
        external
        view
        returns (ElectionMetadata[] memory)
    {
        ElectionMetadata[] memory result = new ElectionMetadata[](_addresses.length);
        for (uint256 i = 0; i < _addresses.length; i++) {
            require(elections[_addresses[i]].electionAddress != address(0), "Election not found");
            result[i] = elections[_addresses[i]];
        }
        return result;
    }

    function getElectionsByTimeRange(uint256 _startTime, uint256 _endTime)
        external
        view
        returns (ElectionMetadata[] memory)
    {
        require(_endTime >= _startTime, "Invalid time range");
        uint256 count = 0;
        for (uint256 i = 0; i < allElectionAddresses.length; i++) {
            ElectionMetadata memory e = elections[allElectionAddresses[i]];
            if (e.createdAt >= _startTime && e.createdAt <= _endTime) count++;
        }
        ElectionMetadata[] memory result = new ElectionMetadata[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allElectionAddresses.length; i++) {
            ElectionMetadata memory e = elections[allElectionAddresses[i]];
            if (e.createdAt >= _startTime && e.createdAt <= _endTime)
                result[idx++] = e;
        }
        return result;
    }

    function getElectionIdCounter() external view returns (uint256) {
        return electionIdCounter;
    }
}

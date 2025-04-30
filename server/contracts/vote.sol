// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    struct Vote {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address creator;
        uint256 maxParticipants;
        uint256 currentParticipants;
        string roomName;
        string accessCode;
        string status;
    }

    struct Option {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct VoteOption {
        string name;
        uint256 voteCount;
    }

    struct Candidate {
        string name;
        uint256 voteCount;
    }

    struct Voter {
        bool hasVoted;
        uint256 votedOptionId;
    }

    mapping(uint256 => Vote) public votes;
    mapping(uint256 => mapping(uint256 => Option)) public voteOptions;
    mapping(uint256 => mapping(address => Voter)) public voters;
    mapping(uint256 => uint256) public optionCounts;
    
    uint256 private voteCounter;
    
    event VoteCreated(uint256 indexed voteId, string title, address creator);
    event VoteCast(uint256 indexed voteId, address indexed voter, uint256 optionId);
    event VoteEnded(uint256 indexed voteId);
    event VoteStatusUpdated(uint256 indexed voteId, string newStatus);

    modifier onlyCreator(uint256 _voteId) {
        require(votes[_voteId].creator == msg.sender, "Only creator can perform this action");
        _;
    }

    modifier voteExists(uint256 _voteId) {
        require(votes[_voteId].id == _voteId, "Vote does not exist");
        _;
    }

    modifier voteActive(uint256 _voteId) {
        require(votes[_voteId].isActive, "Vote is not active");
        require(block.timestamp >= votes[_voteId].startTime, "Vote has not started");
        require(block.timestamp <= votes[_voteId].endTime, "Vote has ended");
        _;
    }

    modifier hasNotVoted(uint256 _voteId) {
        require(!voters[_voteId][msg.sender].hasVoted, "Already voted");
        _;
    }

    function createVote(
        string memory _title,
        string memory _description,
        string[] memory _optionNames,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _maxParticipants,
        string memory _roomName,
        string memory _accessCode
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(bytes(_roomName).length > 0, "Room name cannot be empty");
        require(bytes(_accessCode).length > 0, "Access code cannot be empty");
        require(
            _startTime >= block.timestamp, 
            string(abi.encodePacked(
                "Start time must be in the future. Given: ", 
                toString(_startTime),
                ", Current: ",
                toString(block.timestamp)
            ))
        );
        require(
            _endTime > _startTime, 
            string(abi.encodePacked(
                "End time must be after start time. Start: ",
                toString(_startTime),
                ", End: ",
                toString(_endTime)
            ))
        );
        require(_optionNames.length >= 2, "Must have at least 2 options");
        require(_maxParticipants > 0, "Max participants must be greater than 0");
        require(_maxParticipants <= 1000, "Max participants cannot exceed 1000");

        for (uint256 i = 0; i < _optionNames.length; i++) {
            require(
                bytes(_optionNames[i]).length > 0, 
                string(abi.encodePacked("Option name at index ", toString(i), " cannot be empty"))
            );
        }

        voteCounter++;
        uint256 voteId = voteCounter;

        votes[voteId] = Vote({
            id: voteId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            creator: msg.sender,
            maxParticipants: _maxParticipants,
            currentParticipants: 0,
            roomName: _roomName,
            accessCode: _accessCode,
            status: "new"
        });

        for (uint256 i = 0; i < _optionNames.length; i++) {
            voteOptions[voteId][i] = Option({
                id: i,
                name: _optionNames[i],
                voteCount: 0
            });
        }
        
        optionCounts[voteId] = _optionNames.length;
        emit VoteCreated(voteId, _title, msg.sender);
        return voteId;
    }

    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function castVote(uint256 _voteId, uint256 _optionId) 
        external 
        voteExists(_voteId)
        voteActive(_voteId)
        hasNotVoted(_voteId)
    {
        require(_optionId < optionCounts[_voteId], "Invalid option");
        require(
            votes[_voteId].currentParticipants < votes[_voteId].maxParticipants,
            "Maximum participants reached"
        );

        voters[_voteId][msg.sender] = Voter({
            hasVoted: true,
            votedOptionId: _optionId
        });

        voteOptions[_voteId][_optionId].voteCount++;
        votes[_voteId].currentParticipants++;
        emit VoteCast(_voteId, msg.sender, _optionId);
    }

    function endVote(uint256 _voteId) 
        external 
        voteExists(_voteId)
        onlyCreator(_voteId)
    {
        require(votes[_voteId].isActive, "Vote already ended");
        votes[_voteId].isActive = false;
        votes[_voteId].status = "closed";
        emit VoteEnded(_voteId);
    }
    
    // Function to update vote status
    function updateVoteStatus(uint256 _voteId, string memory _newStatus) 
        external 
        voteExists(_voteId)
    {
        // Only allow the creator or the contract deployer to update status
        require(
            msg.sender == votes[_voteId].creator || msg.sender == address(0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199),
            "Only creator or admin can update status"
        );
        
        // Update the status
        votes[_voteId].status = _newStatus;
        
        // If status is active, ensure isActive is true
        if (keccak256(bytes(_newStatus)) == keccak256(bytes("active"))) {
            votes[_voteId].isActive = true;
        }
        // If status is closed/ended, ensure isActive is false
        else if (keccak256(bytes(_newStatus)) == keccak256(bytes("closed"))) {
            votes[_voteId].isActive = false;
        }
        
        emit VoteStatusUpdated(_voteId, _newStatus);
    }

    function getVoteDetails(uint256 _voteId) 
        external 
        view 
        voteExists(_voteId)
        returns (
            string memory title,
            string memory description,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            address creator,
            uint256 maxParticipants,
            uint256 currentParticipants,
            string memory roomName,
            string memory accessCode,
            string memory status
        )
    {
        Vote memory vote = votes[_voteId];
        return (
            vote.title,
            vote.description,
            vote.startTime,
            vote.endTime,
            vote.isActive,
            vote.creator,
            vote.maxParticipants,
            vote.currentParticipants,
            vote.roomName,
            vote.accessCode,
            vote.status
        );
    }

    function getVoteResults(uint256 _voteId) 
        external 
        view 
        voteExists(_voteId)
        returns (string[] memory names, uint256[] memory counts)
    {
        uint256 optionCount = optionCounts[_voteId];
        names = new string[](optionCount);
        counts = new uint256[](optionCount);

        for (uint256 i = 0; i < optionCount; i++) {
            Option memory option = voteOptions[_voteId][i];
            names[i] = option.name;
            counts[i] = option.voteCount;
        }

        return (names, counts);
    }

    function hasUserVoted(uint256 _voteId, address _voter) 
        external 
        view 
        returns (bool)
    {
        return voters[_voteId][_voter].hasVoted;
    }

    function getAllVotesPart1() external view returns (
        uint256[] memory voteIds,
        string[] memory titles,
        string[] memory descriptions,
        uint256[] memory startTimes
    ) {
        uint256 totalVotes = voteCounter;
        voteIds = new uint256[](totalVotes);
        titles = new string[](totalVotes);
        descriptions = new string[](totalVotes);
        startTimes = new uint256[](totalVotes);

        for (uint256 i = 1; i <= totalVotes; i++) {
            Vote memory vote = votes[i];
            if (vote.id != 0) {
                uint256 index = i - 1;
                voteIds[index] = vote.id;
                titles[index] = vote.title;
                descriptions[index] = vote.description;
                startTimes[index] = vote.startTime;
            }
        }
    }

    function getAllVotesPart2() external view returns (
        uint256[] memory endTimes,
        bool[] memory isActives,
        address[] memory creators,
        uint256[] memory maxParticipants
    ) {
        uint256 totalVotes = voteCounter;
        endTimes = new uint256[](totalVotes);
        isActives = new bool[](totalVotes);
        creators = new address[](totalVotes);
        maxParticipants = new uint256[](totalVotes);

        for (uint256 i = 1; i <= totalVotes; i++) {
            Vote memory vote = votes[i];
            if (vote.id != 0) {
                uint256 index = i - 1;
                endTimes[index] = vote.endTime;
                isActives[index] = vote.isActive;
                creators[index] = vote.creator;
                maxParticipants[index] = vote.maxParticipants;
            }
        }
    }

    function getAllVotesPart3() external view returns (
        uint256[] memory currentParticipants,
        string[] memory roomNames,
        string[] memory accessCodes,
        string[] memory statuses
    ) {
        uint256 totalVotes = voteCounter;
        currentParticipants = new uint256[](totalVotes);
        roomNames = new string[](totalVotes);
        accessCodes = new string[](totalVotes);
        statuses = new string[](totalVotes);

        for (uint256 i = 1; i <= totalVotes; i++) {
            Vote memory vote = votes[i];
            if (vote.id != 0) {
                uint256 index = i - 1;
                currentParticipants[index] = vote.currentParticipants;
                roomNames[index] = vote.roomName;
                accessCodes[index] = vote.accessCode;
                statuses[index] = vote.status;
            }
        }
    }

    function getVoteOptions(uint256 voteId) external view returns (VoteOption[] memory) {
        uint256 optionCount = optionCounts[voteId];
        VoteOption[] memory options = new VoteOption[](optionCount);
        
        for (uint256 i = 0; i < optionCount; i++) {
            Option memory option = voteOptions[voteId][i];
            options[i] = VoteOption({
                name: option.name,
                voteCount: option.voteCount
            });
        }
        
        return options;
    }

    function getAllVoteOptions() external view returns (VoteOption[][] memory) {
        uint256 totalVotes = voteCounter;
        VoteOption[][] memory allOptions = new VoteOption[][](totalVotes);
        
        for (uint256 i = 1; i <= totalVotes; i++) {
            if (votes[i].id != 0) {
                uint256 optionCount = optionCounts[i];
                allOptions[i-1] = new VoteOption[](optionCount);
                
                for (uint256 j = 0; j < optionCount; j++) {
                    Option memory option = voteOptions[i][j];
                    allOptions[i-1][j] = VoteOption({
                        name: option.name,
                        voteCount: option.voteCount
                    });
                }
            }
        }
        
        return allOptions;
    }

    function getTotalVotes() external view returns (
        uint256 totalVotes,
        VoteOption[] memory options
    ) {
        totalVotes = voteCounter;
        
        // For the latest vote
        uint256 latestVoteId = voteCounter - 1;
        uint256 optionCount = optionCounts[latestVoteId];
        
        options = new VoteOption[](optionCount);
        
        for(uint256 i = 0; i < optionCount; i++) {
            Option memory option = voteOptions[latestVoteId][i];
            options[i] = VoteOption({
                name: option.name,
                voteCount: option.voteCount
            });
        }
        
        return (totalVotes, options);
    }
    
    // Simple function to get the total number of votes created
    function getVoteCount() external view returns (uint256) {
        return voteCounter;
    }
}
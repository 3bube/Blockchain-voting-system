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
        string status; // Added status field
    }

    struct Option {
        uint256 id;
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
            status: "new" // Set default status to "new"
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
        votes[_voteId].status = "ended"; // Update status to "ended" when vote ends
        emit VoteEnded(_voteId);
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
            string memory status // Added status to the return parameters
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
            vote.status // Return the status of the vote
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

function getAllVotes() external view returns (
    uint256[] memory voteIds,
    string[] memory titles,
    string[] memory descriptions,
    uint256[] memory startTimes,
    uint256[] memory endTimes,
    bool[] memory isActives,
    address[] memory creators,
    uint256[] memory maxParticipants,
    uint256[] memory currentParticipants,
    string[] memory roomNames,
    string[] memory accessCodes,
    string[] memory statuses
) {
    uint256 totalVotes = voteCounter;

    // Initialize the arrays for each field
    voteIds = new uint256[](totalVotes);
    titles = new string[](totalVotes);
    descriptions = new string[](totalVotes);
    startTimes = new uint256[](totalVotes);
    endTimes = new uint256[](totalVotes);
    isActives = new bool[](totalVotes);
    creators = new address[](totalVotes);
    maxParticipants = new uint256[](totalVotes);
    currentParticipants = new uint256[](totalVotes);
    roomNames = new string[](totalVotes);
    accessCodes = new string[](totalVotes);
    statuses = new string[](totalVotes);

    // Populate the arrays
    for (uint256 i = 1; i <= totalVotes; i++) {
        Vote memory vote = votes[i];
        if (vote.id != 0) { // Ensure the vote exists
            voteIds[i - 1] = vote.id;
            titles[i - 1] = vote.title;
            descriptions[i - 1] = vote.description;
            startTimes[i - 1] = vote.startTime;
            endTimes[i - 1] = vote.endTime;
            isActives[i - 1] = vote.isActive;
            creators[i - 1] = vote.creator;
            maxParticipants[i - 1] = vote.maxParticipants;
            currentParticipants[i - 1] = vote.currentParticipants;
            roomNames[i - 1] = vote.roomName;
            accessCodes[i - 1] = vote.accessCode;
            statuses[i - 1] = vote.status;
        }
    }
}

}

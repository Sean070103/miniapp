// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title DailyBase
 * @dev Smart contract for storing daily crypto activity entries on Base
 * @notice This contract allows users to store their daily crypto activities on-chain
 */
contract DailyBase is Ownable {
    using Strings for uint256;

    struct DailyEntry {
        string content;
        string[] tags;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from user address to date to entry
    mapping(address => mapping(string => DailyEntry)) public userEntries;
    
    // Mapping from user address to their entry dates
    mapping(address => string[]) public userEntryDates;
    
    // Events
    event EntryCreated(address indexed user, string date, string content, string[] tags);
    event EntryUpdated(address indexed user, string date, string content, string[] tags);
    event EntryDeleted(address indexed user, string date);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create or update a daily entry
     * @param date Date in YYYY-MM-DD format
     * @param content The daily entry content
     * @param tags Array of tags for the entry
     */
    function createEntry(
        string memory date,
        string memory content,
        string[] memory tags
    ) external {
        require(bytes(date).length > 0, "Date cannot be empty");
        require(bytes(content).length > 0, "Content cannot be empty");
        require(content.length <= 1000, "Content too long");

        bool isNewEntry = !userEntries[msg.sender][date].exists;
        
        userEntries[msg.sender][date] = DailyEntry({
            content: content,
            tags: tags,
            timestamp: block.timestamp,
            exists: true
        });

        if (isNewEntry) {
            userEntryDates[msg.sender].push(date);
            emit EntryCreated(msg.sender, date, content, tags);
        } else {
            emit EntryUpdated(msg.sender, date, content, tags);
        }
    }

    /**
     * @dev Get a user's entry for a specific date
     * @param user User address
     * @param date Date in YYYY-MM-DD format
     * @return content Entry content
     * @return tags Entry tags
     * @return timestamp Entry timestamp
     * @return exists Whether entry exists
     */
    function getEntry(address user, string memory date) 
        external 
        view 
        returns (string memory content, string[] memory tags, uint256 timestamp, bool exists) 
    {
        DailyEntry memory entry = userEntries[user][date];
        return (entry.content, entry.tags, entry.timestamp, entry.exists);
    }

    /**
     * @dev Get all entry dates for a user
     * @param user User address
     * @return dates Array of entry dates
     */
    function getUserEntryDates(address user) external view returns (string[] memory dates) {
        return userEntryDates[user];
    }

    /**
     * @dev Delete an entry
     * @param date Date in YYYY-MM-DD format
     */
    function deleteEntry(string memory date) external {
        require(userEntries[msg.sender][date].exists, "Entry does not exist");
        
        delete userEntries[msg.sender][date];
        
        // Remove from dates array
        string[] storage dates = userEntryDates[msg.sender];
        for (uint i = 0; i < dates.length; i++) {
            if (keccak256(bytes(dates[i])) == keccak256(bytes(date))) {
                dates[i] = dates[dates.length - 1];
                dates.pop();
                break;
            }
        }
        
        emit EntryDeleted(msg.sender, date);
    }

    /**
     * @dev Get user's streak information
     * @param user User address
     * @return currentStreak Current streak count
     * @return longestStreak Longest streak count
     */
    function getStreakInfo(address user) external view returns (uint256 currentStreak, uint256 longestStreak) {
        string[] memory dates = userEntryDates[user];
        
        if (dates.length == 0) return (0, 0);
        
        // Sort dates (simplified - in production you'd want a more efficient approach)
        // For now, we'll assume dates are stored in order
        
        uint256 tempStreak = 0;
        uint256 maxStreak = 0;
        uint256 current = 0;
        
        for (uint i = 0; i < dates.length; i++) {
            if (userEntries[user][dates[i]].exists) {
                tempStreak++;
                if (tempStreak > maxStreak) {
                    maxStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
            }
        }
        
        // Calculate current streak (simplified)
        current = tempStreak;
        
        return (current, maxStreak);
    }

    /**
     * @dev Get total entries for a user
     * @param user User address
     * @return count Total number of entries
     */
    function getUserEntryCount(address user) external view returns (uint256 count) {
        return userEntryDates[user].length;
    }
}

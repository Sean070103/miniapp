# DailyBase Smart Contract

## Overview

The DailyBase smart contract is designed to store daily crypto activity entries on the Base blockchain. It provides a decentralized way for users to track their daily crypto activities, build streaks, and maintain their Web3 life log.

## Features

### Core Functionality
- **Daily Entry Creation**: Users can create entries for any date with content and tags
- **Entry Updates**: Users can update existing entries
- **Entry Deletion**: Users can delete their entries
- **Streak Tracking**: Built-in streak calculation for user engagement
- **Entry Retrieval**: Query entries by date and user address

### Smart Contract Functions

#### `createEntry(string date, string content, string[] tags)`
Creates or updates a daily entry for the specified date.

**Parameters:**
- `date`: Date in YYYY-MM-DD format
- `content`: The daily entry content (max 1000 characters)
- `tags`: Array of tags for categorization

#### `getEntry(address user, string date)`
Retrieves a user's entry for a specific date.

**Returns:**
- `content`: Entry content
- `tags`: Entry tags
- `timestamp`: Entry creation timestamp
- `exists`: Whether entry exists

#### `getUserEntryDates(address user)`
Gets all entry dates for a user.

**Returns:**
- `dates`: Array of entry dates

#### `deleteEntry(string date)`
Deletes a user's entry for the specified date.

#### `getStreakInfo(address user)`
Calculates streak information for a user.

**Returns:**
- `currentStreak`: Current consecutive days
- `longestStreak`: Longest streak achieved

#### `getUserEntryCount(address user)`
Gets total number of entries for a user.

## Events

- `EntryCreated`: Emitted when a new entry is created
- `EntryUpdated`: Emitted when an existing entry is updated
- `EntryDeleted`: Emitted when an entry is deleted

## Deployment

### Prerequisites
- Node.js and npm/yarn
- Hardhat or Foundry
- Base network configuration

### Deployment Steps

1. **Install Dependencies**
```bash
npm install @openzeppelin/contracts
```

2. **Configure Network**
Add Base network configuration to your deployment script.

3. **Deploy Contract**
```bash
npx hardhat run scripts/deploy.js --network base
```

### Contract Address
After deployment, the contract will be available on Base at the deployed address.

## Integration

### Frontend Integration
The contract can be integrated with the DailyBase frontend using:

```javascript
// Example contract interaction
const contract = new ethers.Contract(contractAddress, abi, signer);

// Create entry
await contract.createEntry(
  "2024-01-15",
  "Bought my first NFT on Base!",
  ["NFT", "Base", "First"]
);

// Get entry
const entry = await contract.getEntry(userAddress, "2024-01-15");
```

### Gas Optimization
- Content is limited to 1000 characters to control gas costs
- Tags are stored as arrays for efficient querying
- Events are used for off-chain indexing

## Security Considerations

- Only entry owners can modify their entries
- Input validation prevents empty content
- Gas limits are considered for all operations
- Owner functions are protected with Ownable pattern

## Future Enhancements

- **Batch Operations**: Support for creating multiple entries
- **Privacy Features**: Optional encryption for sensitive content
- **Social Features**: Sharing and following other users
- **Rewards System**: Token incentives for consistent journaling
- **IPFS Integration**: Store larger content off-chain

## License

MIT License - see LICENSE file for details.

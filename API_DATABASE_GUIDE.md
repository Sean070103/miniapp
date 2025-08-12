# API Database Connection Guide

## Overview
Your API is now properly connected to MongoDB using Prisma ORM. All API endpoints are configured to work with your database schema.

## Database Schema
Your Prisma schema includes the following models:
- **BaseUsers**: User accounts with baseUserId, bio, profile, and dateCreated
- **Journal**: Journal entries with baseUserId, photo, journal content, likes, tags, privacy, and dateCreated
- **Comment**: Comments on journals with baseUserId, journalId, comment content, and dateCreated
- **Repost**: Reposts of journals with journalId, baseUserId, and dateCreated
- **Chaincomments**: Nested comments on existing comments with commentId, baseUserId, comment content, and dateCreated

## API Endpoints

### Base Users
- **POST** `/api/baseuser/post` - Create a new user
  ```json
  {
    "baseUserId": "user123",
    "bio": "Optional bio",
    "profile": "Optional profile image URL"
  }
  ```

### Journals
- **POST** `/api/journal/post` - Create a new journal entry
  ```json
  {
    "baseUserId": "user123",
    "journal": "Journal content",
    "privacy": "public",
    "photo": "Optional photo URL",
    "likes": 0,
    "tags": ["tag1", "tag2"]
  }
  ```
- **GET** `/api/journal/get` - Get all journals
- **GET** `/api/journal/getby/id` - Get journal by ID

### Comments
- **POST** `/api/comment/post` - Create a comment on a journal
  ```json
  {
    "baseUserId": "user123",
    "journalId": "journal_id_here",
    "comment": "Comment content"
  }
  ```
- **GET** `/api/comment/get` - Get all comments

### Chain Comments
- **POST** `/api/comment/chainComment/post` - Create a nested comment
  ```json
  {
    "baseUserId": "user123",
    "commentId": "parent_comment_id",
    "comment": "Nested comment content"
  }
  ```
- **GET** `/api/comment/chainComment/get` - Get all chain comments

### Reposts
- **POST** `/api/repost/post` - Create a repost
  ```json
  {
    "baseUserId": "user123",
    "journalId": "journal_id_here"
  }
  ```
- **GET** `/api/repost/getby/id` - Get repost by ID

### Database Test
- **GET** `/api/test-db` - Test database connection and get record counts

## Database Connection
The database connection is handled by `utils/connect.ts` which creates a singleton Prisma client instance to avoid multiple connections.

## Helper Functions
Use the utility functions in `utils/db-helpers.ts` for common operations:
- `createUser()` - Create a new user
- `createJournal()` - Create a new journal
- `createComment()` - Create a new comment
- `createRepost()` - Create a new repost
- `createChainComment()` - Create a new chain comment
- `handleDbError()` - Handle database errors consistently
- `validateRequiredFields()` - Validate required fields

## Testing the Connection
1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/api/test-db` to test the database connection
3. You should see a JSON response with record counts for each table

## Environment Variables
Make sure your MongoDB connection string is properly configured in your environment variables. The current connection string is in your Prisma schema, but for production, you should move it to an environment variable.

## Error Handling
All API endpoints now include proper error handling and will return appropriate HTTP status codes and error messages when database operations fail.

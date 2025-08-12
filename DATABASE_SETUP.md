# Database Setup and Connection Details

## MongoDB Connection Information

Your application is connected to MongoDB using the following details from `prisma/schema.prisma`:

### Connection String
```
mongodb+srv://lornayocor:cXqrgEX74ex576j3@juntos.n0m0ol6.mongodb.net/miniapp?retryWrites=true&w=majority&appName=juntos
```

### Database Details
- **Provider**: MongoDB
- **Database Name**: `miniapp`
- **Cluster**: `juntos.n0m0ol6.mongodb.net`
- **Username**: `lornayocor`
- **App Name**: `juntos`

## Database Schema Models

### 1. BaseUsers
```prisma
model BaseUsers {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 baseUserId  String
 bio         String?
 profile     String?
 dateCreated DateTime @default(now())
}
```

### 2. Journal
```prisma
model Journal {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 baseUserId  String
 photo       String?
 journal     String
 likes       Int      @default(0)
 tags        String[]
 privacy     String
 dateCreated DateTime @default(now())
}
```

### 3. Comment
```prisma
model Comment {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 baseUserId  String
 journalId   String
 comment     String
 dateCreated DateTime @default(now())
}
```

### 4. Repost
```prisma
model Repost {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 journalId   String
 baseUserId  String
 dateCreated DateTime @default(now())
}
```

### 5. Chaincomments
```prisma
model Chaincomments {
 id          String   @id @default(auto()) @map("_id") @db.ObjectId
 commentId   String
 baseUserId  String
 comment     String
 dateCreated DateTime @default(now())
}
```

## API Endpoints Connected to Database

### Base Users
- **POST** `/api/baseuser/post` - Create user account
- **POST** `/api/baseuser/getby/id` - Get user by baseUserId

### Journals
- **POST** `/api/journal/post` - Create journal entry
- **GET** `/api/journal/get` - Get all journals
- **POST** `/api/journal/getby/id` - Get journals by baseUserId

### Comments
- **POST** `/api/comment/post` - Create comment on journal
- **POST** `/api/comment/get` - Get comments by journalId

### Chain Comments
- **POST** `/api/comment/chainComment/post` - Create nested comment
- **POST** `/api/comment/chainComment/get` - Get chain comments by commentId

### Reposts
- **POST** `/api/repost/post` - Create repost
- **POST** `/api/repost/getby/id` - Get reposts by baseUserId

### Database Test
- **GET** `/api/test-db` - Test database connection and get record counts

## Database Connection Management

### Connection File: `utils/connect.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
    return new PrismaClient();
};

const prisma = globalThis.prismaGlobal || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma;
}

export default prisma;
```

### Helper Functions: `utils/db-helpers.ts`
- `createUser()` - Create new user
- `createJournal()` - Create new journal
- `createComment()` - Create new comment
- `createRepost()` - Create new repost
- `createChainComment()` - Create new chain comment
- `handleDbError()` - Handle database errors
- `validateRequiredFields()` - Validate required fields

## Testing Database Connection

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the connection**:
   Visit: `http://localhost:3000/api/test-db`
   
   Expected response:
   ```json
   {
     "status": "success",
     "message": "Database connection successful",
     "counts": {
       "users": 0,
       "journals": 0,
       "comments": 0,
       "reposts": 0,
       "chainComments": 0
     }
   }
   ```

## Security Considerations

⚠️ **Important**: The database connection string is currently hardcoded in the schema file. For production, consider:

1. **Environment Variables**: Move the connection string to `.env` file
2. **Connection String Format**:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority"
   ```

3. **Update schema.prisma**:
   ```prisma
   datasource db {
     provider = "mongodb"
     url      = env("DATABASE_URL")
   }
   ```

## Database Operations

All API endpoints are now properly connected to your MongoDB database and will:
- ✅ Create records in the database
- ✅ Read records from the database
- ✅ Handle errors gracefully
- ✅ Return appropriate HTTP status codes
- ✅ Validate required fields before database operations

Your database is ready to use with all the API endpoints!

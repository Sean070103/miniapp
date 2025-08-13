# CSV Upload System Guide

## Overview

Your miniapp now includes a complete CSV upload system that allows bulk import of users, journals, and comments directly into your MongoDB database. This system is inspired by the employee CSV upload functionality you showed me.

## Features

✅ **Bulk Data Import**: Upload multiple records at once  
✅ **Multiple Data Types**: Support for users, journals, and comments  
✅ **Automatic Format Detection**: System detects CSV type based on headers  
✅ **Error Handling**: Graceful handling of upload errors  
✅ **Sample Files**: Pre-made CSV templates for testing  
✅ **Real-time Feedback**: Upload status and progress indicators  

## API Endpoint

### CSV Upload API
- **URL**: `/api/upload/csv`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameter**: `csvFile` (CSV file)

## Supported CSV Formats

### 1. Users CSV
```csv
baseUserId,bio,profile
user001,Passionate developer who loves coding,https://example.com/profile1.jpg
user002,Creative writer and storyteller,https://example.com/profile2.jpg
```

**Required Fields:**
- `baseUserId` (required)
- `bio` (optional)
- `profile` (optional)

### 2. Journals CSV
```csv
baseUserId,journal,privacy,photo,likes,tags
user001,Today I learned about React hooks!,public,https://example.com/photo1.jpg,5,"react,learning"
user002,Just finished writing my first novel,public,https://example.com/photo2.jpg,12,"writing,novel"
```

**Required Fields:**
- `baseUserId` (required)
- `journal` (required)
- `privacy` (required, defaults to "public")
- `photo` (optional)
- `likes` (optional, defaults to 0)
- `tags` (optional, comma-separated)

### 3. Comments CSV
```csv
baseUserId,journalId,comment
user002,64f8a1b2c3d4e5f678901234,Great post! React hooks are indeed powerful.
user003,64f8a1b2c3d4e5f678901234,Thanks for sharing your learning journey!
```

**Required Fields:**
- `baseUserId` (required)
- `journalId` (required)
- `comment` (required)

## Frontend Components

### CSV Upload Component
Location: `components/csv-upload.tsx`

**Features:**
- File selection with validation
- Upload progress indicator
- Success/error status messages
- Format examples display

**Usage:**
```tsx
import CSVUpload from './components/csv-upload'

<CSVUpload 
  onUploadSuccess={(data) => console.log('Success:', data)}
  onUploadError={(error) => console.error('Error:', error)}
/>
```

### CSV Upload Page
Location: `app/csv-upload/page.tsx`

**Features:**
- Complete upload interface
- Sample file downloads
- Format requirements display
- Usage instructions

### Admin Dashboard
Location: `app/admin/page.tsx`

**Features:**
- Centralized admin interface
- Quick access to CSV upload
- Database status testing
- API endpoint information

## Sample Files

### Available Sample Files
- `public/sample-users.csv` - Sample user data
- `public/sample-journals.csv` - Sample journal entries
- `public/sample-comments.csv` - Sample comments

### Download URLs
- `/sample-users.csv`
- `/sample-journals.csv`
- `/sample-comments.csv`

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Successfully uploaded 5 records",
  "uploadType": "users",
  "data": [
    {
      "id": "64f8a1b2c3d4e5f678901234",
      "baseUserId": "user001",
      "bio": "Passionate developer",
      "profile": "https://example.com/profile1.jpg",
      "dateCreated": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Error Response
```json
{
  "error": "No CSV file provided"
}
```

## Database Integration

### Prisma Models Used
- `BaseUsers` - For user imports
- `Journal` - For journal imports
- `Comment` - For comment imports

### Connection Details
- **Database**: MongoDB Atlas
- **Connection**: `mongodb+srv://lornayocor:cXqrgEX74ex576j3@juntos.n0m0ol6.mongodb.net/miniapp`
- **ORM**: Prisma Client

## Testing the System

### 1. Test Database Connection
Visit: `http://localhost:3001/api/test-db`

### 2. Access Admin Dashboard
Visit: `http://localhost:3001/admin`

### 3. Use CSV Upload
Visit: `http://localhost:3001/csv-upload`

### 4. Download Sample Files
- Click download buttons on the admin dashboard
- Or visit direct URLs like `/sample-users.csv`

## Error Handling

### Common Errors
1. **No CSV file provided** - File not selected
2. **Please upload a CSV file** - Wrong file type
3. **CSV file is empty** - No data in file
4. **Unsupported CSV format** - Wrong headers
5. **Failed to create user** - Database error

### Error Recovery
- System continues processing other records if one fails
- Detailed error messages for debugging
- Graceful fallback for missing optional fields

## Security Considerations

### File Validation
- Only `.csv` files accepted
- File size limits (handled by server)
- Header validation for data integrity

### Data Validation
- Required field checking
- Data type validation
- Duplicate prevention (handled by database)

## Performance

### Optimizations
- Batch processing for multiple records
- Error isolation (one failed record doesn't stop others)
- Efficient CSV parsing
- Database connection pooling via Prisma

### Limitations
- Large files may take time to process
- Memory usage scales with file size
- Network timeout considerations

## Usage Examples

### 1. Upload Users
1. Download `sample-users.csv`
2. Modify with your user data
3. Upload via `/csv-upload` page
4. Check results in database

### 2. Upload Journals
1. Download `sample-journals.csv`
2. Add your journal entries
3. Upload and verify in database
4. Check via `/api/journal/get`

### 3. Upload Comments
1. Download `sample-comments.csv`
2. Add comments with valid journalIds
3. Upload and verify
4. Check via `/api/comment/get`

## Integration with Existing API

The CSV upload system works alongside your existing API endpoints:

- **Individual Operations**: Use existing POST endpoints for single records
- **Bulk Operations**: Use CSV upload for multiple records
- **Data Consistency**: Same validation and error handling
- **Database Schema**: Uses existing Prisma models

## Future Enhancements

### Potential Improvements
1. **Progress Tracking**: Real-time upload progress
2. **Data Validation**: More sophisticated CSV validation
3. **Template Generation**: Dynamic CSV templates
4. **Export Functionality**: Download existing data as CSV
5. **Batch Operations**: Update/delete operations via CSV

### Additional Data Types
- Repost CSV uploads
- Chain comment CSV uploads
- User profile updates via CSV

Your CSV upload system is now fully functional and ready for production use!

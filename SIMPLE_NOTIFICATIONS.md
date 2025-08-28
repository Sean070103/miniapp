# Simple Notification System

A clean, efficient notification system for DailyBase that focuses on simplicity and reliability.

## 🚀 Features

- **Real-time notifications** with clean UI
- **Database persistence** for reliable storage
- **Multiple notification types**: like, comment, repost, follow, mention, system
- **User preferences** for notification control
- **Mark as read** functionality
- **Efficient state management** with React hooks

## 📁 File Structure

```
lib/
├── simple-notifications.ts          # Core notification types and utilities
├── notification-service.ts          # Service for creating notifications
└── prisma.ts                       # Database connection

hooks/
└── use-simple-notifications.ts     # React hook for notification state

components/ui/
└── simple-notification-dropdown.tsx # Notification dropdown component

app/api/simple-notifications/
├── route.ts                        # Main API routes (GET, POST)
├── mark-read/route.ts              # Mark notifications as read
└── preferences/route.ts            # User preferences management
```

## 🗄️ Database Schema

### SimpleNotification
```prisma
model SimpleNotification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  type        String   // 'like', 'comment', 'repost', 'follow', 'mention', 'system'
  title       String
  message     String
  senderId    String?  // ID of the user who triggered the notification
  receiverId  String   // ID of the user who receives the notification
  postId      String?  // ID of the post being referenced
  data        String?  // JSON string for additional data
  isRead      Boolean  @default(false)
  dateCreated DateTime @default(now())
  
  @@index([receiverId, isRead])
  @@index([receiverId, dateCreated])
  @@index([senderId, dateCreated])
}
```

### SimpleNotificationPreferences
```prisma
model SimpleNotificationPreferences {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  userId    String   @unique
  likes     Boolean  @default(true)
  comments  Boolean  @default(true)
  reposts   Boolean  @default(true)
  follows   Boolean  @default(true)
  mentions  Boolean  @default(true)
  system    Boolean  @default(true)
  dateCreated DateTime @default(now())
  dateUpdated DateTime @updatedAt
}
```

## 🔧 Usage

### 1. Using the Hook

```typescript
import { useSimpleNotifications } from '@/hooks/use-simple-notifications';

function MyComponent() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification
  } = useSimpleNotifications(userId);

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      {notifications.map(notification => (
        <div key={notification.id}>
          {notification.message}
        </div>
      ))}
    </div>
  );
}
```

### 2. Using the Dropdown Component

```typescript
import { SimpleNotificationDropdown } from '@/components/ui/simple-notification-dropdown';

function Header() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useSimpleNotifications(userId);

  return (
    <SimpleNotificationDropdown
      notifications={notifications}
      unreadCount={unreadCount}
      isLoading={isLoading}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onNotificationClick={(notification) => {
        console.log('Notification clicked:', notification);
      }}
    />
  );
}
```

### 3. Creating Notifications

```typescript
import { NotificationService } from '@/lib/notification-service';

// Create a like notification
await NotificationService.createLikeNotification(
  senderId,
  receiverId,
  postId,
  senderName
);

// Create a comment notification
await NotificationService.createCommentNotification(
  senderId,
  receiverId,
  postId,
  senderName
);

// Create a system notification
await NotificationService.createSystemNotification(
  receiverId,
  'Welcome!',
  'Your account has been created successfully.'
);
```

## 🎨 Notification Types

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| `like` | ❤️ | Red | When someone likes your post |
| `comment` | 💬 | Blue | When someone comments on your post |
| `repost` | 🔄 | Green | When someone reposts your content |
| `follow` | 👤 | Purple | When someone follows you |
| `mention` | 📢 | Yellow | When someone mentions you |
| `system` | 🔔 | Gray | System notifications |

## 🔌 API Endpoints

### GET /api/simple-notifications
Fetch notifications for a user
```typescript
GET /api/simple-notifications?userId=123&limit=50&offset=0
```

### POST /api/simple-notifications
Create a new notification
```typescript
POST /api/simple-notifications
{
  "type": "like",
  "title": "New Like",
  "message": "User liked your post",
  "senderId": "sender123",
  "receiverId": "receiver123",
  "postId": "post123"
}
```

### POST /api/simple-notifications/mark-read
Mark notifications as read
```typescript
POST /api/simple-notifications/mark-read
{
  "userId": "user123",
  "notificationIds": ["notif1", "notif2"] // Optional, marks all if not provided
}
```

### GET /api/simple-notifications/preferences
Get user notification preferences
```typescript
GET /api/simple-notifications/preferences?userId=123
```

### POST /api/simple-notifications/preferences
Update user notification preferences
```typescript
POST /api/simple-notifications/preferences
{
  "userId": "user123",
  "preferences": {
    "likes": true,
    "comments": false,
    "reposts": true
  }
}
```

## 🧪 Testing

Run the test script to verify the system works:

```bash
node scripts/test-simple-notifications.js
```

## 🚀 Setup

1. **Database Migration**
   ```bash
   npx prisma db push
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Test the System**
   ```bash
   node scripts/test-simple-notifications.js
   ```

## ✨ Benefits

- **Simple**: Easy to understand and maintain
- **Efficient**: Minimal overhead and fast performance
- **Reliable**: Database persistence ensures no data loss
- **Scalable**: Can easily add new notification types
- **User-friendly**: Clean UI with intuitive interactions

## 🔮 Future Enhancements

- Real-time WebSocket updates
- Push notifications
- Email notifications
- Notification grouping
- Advanced filtering options
- Notification templates

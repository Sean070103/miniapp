# Real-time Notification System

This project includes a real-time notification system powered by Pusher that allows instant communication between the server and client.

## Features

- ✅ Real-time notifications using Pusher
- ✅ Instant UI updates without page refresh
- ✅ Connection status indicator
- ✅ Beautiful, responsive UI
- ✅ Test page for easy testing

## Files Created

1. **API Route**: `app/api/notify/route.ts`
   - Accepts POST requests with `baseUserId` and `message`
   - Triggers Pusher events on the `notifications` channel
   - Event name: `new-notification`

2. **Component**: `components/NotificationList.tsx`
   - Real-time notification display
   - Connection status indicator
   - Auto-prepends new notifications

3. **Test Page**: `app/test-notifications-page/page.tsx`
   - Complete testing interface
   - Form to send test notifications
   - Real-time notification display

4. **Test Script**: `scripts/test-notification.js`
   - Node.js script for API testing

## Environment Variables

The system uses these environment variables (already configured in your project):

```env
NEXT_PUBLIC_PUSHER_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
PUSHER_APP_ID=your_pusher_app_id
PUSHER_SECRET=your_pusher_secret
```

## How to Test

### Method 1: Using the Test Page

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:3000/test-notifications-page`

3. Fill in the form and send notifications
4. Watch them appear instantly in the notification list

### Method 2: Using the Test Script

1. Install node-fetch (if not already installed):
   ```bash
   npm install node-fetch
   ```

2. Run the test script:
   ```bash
   node scripts/test-notification.js
   ```

### Method 3: Using curl

```bash
curl -X POST http://localhost:3000/api/notify \
  -H "Content-Type: application/json" \
  -d '{
    "baseUserId": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "message": "Hello from curl!"
  }'
```

### Method 4: Using Postman or similar

- **URL**: `POST http://localhost:3000/api/notify`
- **Headers**: `Content-Type: application/json`
- **Body**:
  ```json
  {
    "baseUserId": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "message": "Hello from Postman!"
  }
  ```

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "id": "1703123456789",
    "userId": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "message": "Hello! This is a test notification.",
    "timestamp": "2023-12-21T10:30:45.123Z"
  }
}
```

### Error Response
```json
{
  "error": "baseUserId and message are required"
}
```

## Real-time Features

- **Instant Updates**: Notifications appear immediately without page refresh
- **Multiple Tabs**: All open browser tabs receive the same notifications
- **Connection Status**: Visual indicator shows Pusher connection status
- **Auto-scroll**: New notifications are prepended to the list
- **Timestamp Display**: Each notification shows when it was received

## Integration with Existing Code

The notification system is designed to work alongside your existing Pusher setup. It uses the same Pusher configuration but operates on a separate channel (`notifications`) to avoid conflicts with your existing notification system.

## Troubleshooting

1. **No notifications appearing**: Check browser console for Pusher connection errors
2. **API errors**: Verify environment variables are set correctly
3. **Connection issues**: Ensure Pusher app is configured properly
4. **CORS errors**: Make sure you're testing from the correct domain

## Next Steps

To integrate this into your main application:

1. Import the `NotificationList` component where needed
2. Use the `/api/notify` endpoint to send notifications from your backend
3. Customize the notification styling to match your app's design
4. Add persistence to store notifications in a database

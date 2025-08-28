// Test script for Simple Notification System
const BASE_URL = 'http://localhost:3000';

async function testSimpleNotifications() {
  console.log('🧪 Testing Simple Notification System...\n');

  const testUserId = 'test-user-' + Date.now();
  const testSenderId = 'sender-' + Date.now();

  console.log('📝 Test User ID:', testUserId);
  console.log('👤 Test Sender ID:', testSenderId);
  console.log('');

  try {
    // Test 1: Create a like notification
    console.log('1️⃣ Testing Like Notification...');
    const likeResponse = await fetch(`${BASE_URL}/api/simple-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'like',
        title: 'New Like',
        message: `${testSenderId} liked your post`,
        senderId: testSenderId,
        receiverId: testUserId,
        postId: 'test-post-123'
      })
    });

    if (likeResponse.ok) {
      const likeData = await likeResponse.json();
      console.log('✅ Like notification created:', likeData.notification.id);
    } else {
      console.log('❌ Failed to create like notification');
    }

    // Test 2: Create a comment notification
    console.log('\n2️⃣ Testing Comment Notification...');
    const commentResponse = await fetch(`${BASE_URL}/api/simple-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'comment',
        title: 'New Comment',
        message: `${testSenderId} commented on your post`,
        senderId: testSenderId,
        receiverId: testUserId,
        postId: 'test-post-123'
      })
    });

    if (commentResponse.ok) {
      const commentData = await commentResponse.json();
      console.log('✅ Comment notification created:', commentData.notification.id);
    } else {
      console.log('❌ Failed to create comment notification');
    }

    // Test 3: Create a system notification
    console.log('\n3️⃣ Testing System Notification...');
    const systemResponse = await fetch(`${BASE_URL}/api/simple-notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'system',
        title: 'System Notice',
        message: 'Welcome to DailyBase! Your account has been created successfully.',
        receiverId: testUserId
      })
    });

    if (systemResponse.ok) {
      const systemData = await systemResponse.json();
      console.log('✅ System notification created:', systemData.notification.id);
    } else {
      console.log('❌ Failed to create system notification');
    }

    // Test 4: Fetch notifications
    console.log('\n4️⃣ Testing Fetch Notifications...');
    const fetchResponse = await fetch(`${BASE_URL}/api/simple-notifications?userId=${testUserId}`);
    
    if (fetchResponse.ok) {
      const fetchData = await fetchResponse.json();
      console.log('✅ Fetched notifications:', fetchData.notifications.length, 'notifications');
      fetchData.notifications.forEach((notification, index) => {
        console.log(`   ${index + 1}. ${notification.type}: ${notification.message}`);
      });
    } else {
      console.log('❌ Failed to fetch notifications');
    }

    // Test 5: Mark notifications as read
    console.log('\n5️⃣ Testing Mark as Read...');
    const markReadResponse = await fetch(`${BASE_URL}/api/simple-notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testUserId
      })
    });

    if (markReadResponse.ok) {
      console.log('✅ Notifications marked as read');
    } else {
      console.log('❌ Failed to mark notifications as read');
    }

    // Test 6: Verify notifications are marked as read
    console.log('\n6️⃣ Verifying Read Status...');
    const verifyResponse = await fetch(`${BASE_URL}/api/simple-notifications?userId=${testUserId}`);
    
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const unreadCount = verifyData.notifications.filter(n => !n.isRead).length;
      console.log(`✅ Unread notifications: ${unreadCount}`);
    } else {
      console.log('❌ Failed to verify read status');
    }

    console.log('\n🎉 Simple Notification System Test Complete!');
    console.log('\n📱 Next Steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Navigate to your dashboard');
    console.log('   3. Check the notification dropdown in the header');
    console.log('   4. Visit the Notifications page in the sidebar');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSimpleNotifications();

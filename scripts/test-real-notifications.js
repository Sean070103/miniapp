// Test script to trigger real notifications
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testRealNotifications() {
  console.log('🧪 Testing Real Notification System...\n');

  const testUser = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  const targetUser = '0x9dEa1234567890abcdef1234567890abcdef1234';

  const tests = [
    {
      name: 'Create Post',
      endpoint: '/api/journal/post',
      body: {
        baseUserId: testUser,
        journal: 'This is a test post for notifications! 🚀',
        privacy: 'public'
      }
    },
    {
      name: 'Like Post',
      endpoint: '/api/like/post',
      body: {
        journalId: 'test-journal-id',
        userId: targetUser
      }
    },
    {
      name: 'Comment on Post',
      endpoint: '/api/comment/post',
      body: {
        baseUserId: targetUser,
        journalId: 'test-journal-id',
        comment: 'Great post! This is a test comment. 👍'
      }
    },
    {
      name: 'Repost',
      endpoint: '/api/repost/post',
      body: {
        journalId: 'test-journal-id',
        baseUserId: targetUser
      }
    },
    {
      name: 'Follow User',
      endpoint: '/api/follow',
      body: {
        followerId: targetUser,
        followingId: testUser
      }
    }
  ];

  for (const test of tests) {
    console.log(`📤 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Data:`, test.body);

    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(test.body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ Success: ${data.message || 'Operation completed'}`);
      } else {
        console.log(`   ⚠️  Expected Error: ${data.error || 'Operation failed (this is expected for test data)'}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }

    console.log('');
  }

  console.log('🎉 Test completed!');
  console.log('📱 Check your notifications page to see real-time updates!');
  console.log('🌐 Visit: http://localhost:3000/notifications');
}

// Run the test
testRealNotifications();

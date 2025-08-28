// Test script to trigger real notifications in the main feed
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testFeedNotifications() {
  console.log('🧪 Testing Real-Time Feed Notifications...\n');

  const testUser = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  const targetUser = '0x9dEa1234567890abcdef1234567890abcdef1234';

  console.log('📱 This will test notifications appearing in the main feed in real-time!');
  console.log('🌐 Make sure you have the main page open at: http://localhost:3000');
  console.log('🔔 Notifications will appear as live updates in the feed and as toast popups\n');

  const tests = [
    {
      name: 'Create Post (notifies followers)',
      endpoint: '/api/journal/post',
      body: {
        baseUserId: testUser,
        journal: '🚀 Just posted something amazing! Check out this new content!',
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
        comment: '🔥 This is absolutely amazing! Great post!'
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

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`📤 Test ${i + 1}/${tests.length}: ${test.name}`);
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
        console.log(`   🎉 Check your feed for the real-time notification!`);
      } else {
        console.log(`   ⚠️  Expected Error: ${data.error || 'Operation failed (this is expected for test data)'}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }

    console.log('');
    
    // Wait 2 seconds between tests to see notifications appear
    if (i < tests.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('🎉 All tests completed!');
  console.log('📱 Check your main feed for real-time notifications!');
  console.log('🔔 You should see:');
  console.log('   - Live notifications in the feed section');
  console.log('   - Toast popups in the top-right corner');
  console.log('   - Notification bell badge updates');
  console.log('🌐 Visit: http://localhost:3000');
}

// Run the test
testFeedNotifications();

// Test script specifically for Vercel deployment
const fetch = require('node-fetch');

const VERCEL_URL = 'https://miniapp-dailybase.vercel.app';

async function testVercelNotifications() {
  console.log('🚀 Testing Vercel Production Notifications...\n');
  console.log(`📍 Vercel URL: ${VERCEL_URL}\n`);

  const testUser = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  const targetUser = '0x9dEa1234567890abcdef1234567890abcdef1234';

  console.log('📱 This will test notifications on your Vercel deployment!');
  console.log('🌐 Make sure you have the main page open at:', VERCEL_URL);
  console.log('🔔 Notifications will appear as live updates in the feed and as toast popups\n');

  const tests = [
    {
      name: 'Create Post (notifies followers)',
      endpoint: '/api/journal/post',
      body: {
        baseUserId: testUser,
        journal: '🚀 Vercel test: Just posted something amazing! Check out this new content!',
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
        comment: '🔥 Vercel test: This is absolutely amazing! Great post!'
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

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    console.log(`📤 Test ${i + 1}/${tests.length}: ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    console.log(`   Data:`, test.body);

    try {
      const startTime = Date.now();
      const response = await fetch(`${VERCEL_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Vercel-Notification-Test/1.0'
        },
        body: JSON.stringify(test.body),
        signal: AbortSignal.timeout(15000) // 15 second timeout for Vercel
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ Success (${responseTime}ms): ${data.message || 'Operation completed'}`);
        console.log(`   🎉 Check your Vercel app for the real-time notification!`);
        successCount++;
      } else {
        console.log(`   ⚠️  Expected Error (${responseTime}ms): ${data.error || 'Operation failed (this is expected for test data)'}`);
        errorCount++;
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.log(`   ❌ Timeout Error: Request took longer than 15 seconds`);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log(`   ❌ Network Error: Unable to connect to ${VERCEL_URL}`);
        console.log(`   💡 Make sure your Vercel deployment is live`);
      } else {
        console.log(`   ❌ Network Error: ${error.message}`);
      }
      errorCount++;
    }

    console.log('');
    
    // Wait between tests to see notifications appear
    if (i < tests.length - 1) {
      console.log('⏳ Waiting 3 seconds before next test...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  // Summary
  console.log('📊 Test Summary:');
  console.log(`   ✅ Successful: ${successCount}/${tests.length}`);
  console.log(`   ❌ Errors: ${errorCount}/${tests.length}`);
  console.log(`   📈 Success Rate: ${Math.round((successCount / tests.length) * 100)}%`);

  console.log('\n🎉 All tests completed!');
  console.log('📱 Check your Vercel app for real-time notifications!');
  console.log('🔔 You should see:');
  console.log('   - Live notifications in the feed section');
  console.log('   - Toast popups in the top-right corner');
  console.log('   - Notification bell badge updates');
  console.log(`🌐 Visit: ${VERCEL_URL}`);

  // Vercel-specific recommendations
  console.log('\n🚀 Vercel Production Recommendations:');
  console.log('   - Check Vercel dashboard for deployment status');
  console.log('   - Verify environment variables in Vercel settings');
  console.log('   - Monitor function logs in Vercel dashboard');
  console.log('   - Check Pusher dashboard for connection status');
}

// Run the test
testVercelNotifications().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});

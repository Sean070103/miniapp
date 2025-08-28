// Production-ready test script for real-time notifications
const fetch = require('node-fetch');

// Configuration - can be overridden with environment variables
const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const TEST_USER = process.env.TEST_USER || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const TARGET_USER = process.env.TARGET_USER || '0x9dEa1234567890abcdef1234567890abcdef1234';

async function testProductionNotifications() {
  console.log('🚀 Testing Production-Ready Real-Time Notifications...\n');
  console.log(`📍 API URL: ${BASE_URL}`);
  console.log(`👤 Test User: ${TEST_USER}`);
  console.log(`🎯 Target User: ${TARGET_USER}\n`);

  // Test environment variables
  const requiredEnvVars = [
    'PUSHER_APP_ID',
    'PUSHER_KEY', 
    'PUSHER_SECRET',
    'PUSHER_CLUSTER',
    'NEXT_PUBLIC_PUSHER_KEY',
    'NEXT_PUBLIC_PUSHER_CLUSTER'
  ];

  console.log('🔧 Checking environment configuration...');
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('⚠️  Missing environment variables:');
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log('\n💡 Make sure these are set in your production environment!\n');
  } else {
    console.log('✅ All required environment variables are configured\n');
  }

  console.log('📱 This will test notifications appearing in the main feed in real-time!');
  console.log('🌐 Make sure you have the main page open at:', BASE_URL);
  console.log('🔔 Notifications will appear as live updates in the feed and as toast popups\n');

  const tests = [
    {
      name: 'Create Post (notifies followers)',
      endpoint: '/api/journal/post',
      body: {
        baseUserId: TEST_USER,
        journal: '🚀 Production test: Just posted something amazing! Check out this new content!',
        privacy: 'public'
      }
    },
    {
      name: 'Like Post',
      endpoint: '/api/like/post',
      body: {
        journalId: 'test-journal-id',
        userId: TARGET_USER
      }
    },
    {
      name: 'Comment on Post',
      endpoint: '/api/comment/post',
      body: {
        baseUserId: TARGET_USER,
        journalId: 'test-journal-id',
        comment: '🔥 Production test: This is absolutely amazing! Great post!'
      }
    },
    {
      name: 'Repost',
      endpoint: '/api/repost/post',
      body: {
        journalId: 'test-journal-id',
        baseUserId: TARGET_USER
      }
    },
    {
      name: 'Follow User',
      endpoint: '/api/follow',
      body: {
        followerId: TARGET_USER,
        followingId: TEST_USER
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
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Production-Notification-Test/1.0'
        },
        body: JSON.stringify(test.body),
        // Production-ready timeout
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (response.ok) {
        console.log(`   ✅ Success (${responseTime}ms): ${data.message || 'Operation completed'}`);
        console.log(`   🎉 Check your feed for the real-time notification!`);
        successCount++;
      } else {
        console.log(`   ⚠️  Expected Error (${responseTime}ms): ${data.error || 'Operation failed (this is expected for test data)'}`);
        errorCount++;
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        console.log(`   ❌ Timeout Error: Request took longer than 10 seconds`);
      } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.log(`   ❌ Network Error: Unable to connect to ${BASE_URL}`);
        console.log(`   💡 Make sure the server is running and accessible`);
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
  console.log('📱 Check your main feed for real-time notifications!');
  console.log('🔔 You should see:');
  console.log('   - Live notifications in the feed section');
  console.log('   - Toast popups in the top-right corner');
  console.log('   - Notification bell badge updates');
  console.log(`🌐 Visit: ${BASE_URL}`);

  // Production recommendations
  if (BASE_URL !== 'http://localhost:3000') {
    console.log('\n🚀 Production Recommendations:');
    console.log('   - Monitor Pusher connection logs');
    console.log('   - Set up error tracking (Sentry, etc.)');
    console.log('   - Configure proper CORS settings');
    console.log('   - Set up monitoring for notification delivery rates');
    console.log('   - Consider rate limiting for notification endpoints');
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Usage: node scripts/test-production-notifications.js [options]');
  console.log('');
  console.log('Options:');
  console.log('  --url <url>     Set the API URL (default: http://localhost:3000)');
  console.log('  --test-user <address>  Set the test user wallet address');
  console.log('  --target-user <address>  Set the target user wallet address');
  console.log('  --help, -h      Show this help message');
  console.log('');
  console.log('Environment Variables:');
  console.log('  API_URL         API base URL');
  console.log('  TEST_USER       Test user wallet address');
  console.log('  TARGET_USER     Target user wallet address');
  process.exit(0);
}

// Parse command line arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--url' && args[i + 1]) {
    process.env.API_URL = args[i + 1];
    i++;
  } else if (args[i] === '--test-user' && args[i + 1]) {
    process.env.TEST_USER = args[i + 1];
    i++;
  } else if (args[i] === '--target-user' && args[i + 1]) {
    process.env.TARGET_USER = args[i + 1];
    i++;
  }
}

// Run the test
testProductionNotifications().catch(error => {
  console.error('❌ Test script failed:', error);
  process.exit(1);
});

// Simple test script for Vercel notifications
const fetch = require('node-fetch');

const VERCEL_URL = 'https://miniapp-dailybase.vercel.app';

async function testSimpleVercelNotifications() {
  console.log('🧪 Testing Simple Vercel Notifications...\n');
  console.log(`📍 Vercel URL: ${VERCEL_URL}\n`);

  const testData = {
    baseUserId: '0x9dEa1234567890abcdef1234567890abcdef1234',
    message: '🔥 Test notification from Vercel deployment!',
    type: 'test'
  };

  console.log('📤 Sending test notification...');
  console.log('Data:', testData);

  try {
    const startTime = Date.now();
    const response = await fetch(`${VERCEL_URL}/api/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Simple-Notification-Test/1.0'
      },
      body: JSON.stringify(testData),
      signal: AbortSignal.timeout(15000) // 15 second timeout
    });

    const responseTime = Date.now() - startTime;
    const data = await response.json();

    console.log('📥 Response status:', response.status);
    console.log('📥 Response time:', responseTime + 'ms');
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Notification sent successfully!');
      console.log('🔔 Check your Vercel app for the real-time notification');
      console.log('🌐 Visit:', `${VERCEL_URL}/test-notifications-simple`);
    } else {
      console.log('❌ Failed to send notification:', data.error);
    }
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.log('❌ Timeout Error: Request took longer than 15 seconds');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.log('❌ Network Error: Unable to connect to Vercel');
      console.log('💡 Make sure your Vercel deployment is live');
    } else {
      console.log('❌ Network Error:', error.message);
    }
  }

  console.log('\n🎯 Next Steps:');
  console.log('1. Visit:', `${VERCEL_URL}/test-notifications-simple`);
  console.log('2. Check if you see the test notification');
  console.log('3. Try sending more notifications from the test page');
  console.log('4. Check browser console for connection status');
}

testSimpleVercelNotifications();

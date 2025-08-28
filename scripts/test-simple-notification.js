// Simple notification test
const fetch = require('node-fetch');

async function testSimpleNotification() {
  console.log('🧪 Testing Simple Notification...\n');

  const testData = {
    baseUserId: '0x9dEa1234567890abcdef1234567890abcdef1234',
    message: '🔥 Test notification from script!'
  };

  console.log('📤 Sending test notification...');
  console.log('Data:', testData);

  try {
    const response = await fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', data);

    if (response.ok) {
      console.log('✅ Notification sent successfully!');
      console.log('🔔 Check your notifications page for the new notification');
    } else {
      console.log('❌ Failed to send notification:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure your server is running on http://localhost:3000');
  }
}

testSimpleNotification();

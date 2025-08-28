// Test script for the notification API
const fetch = require('node-fetch');

async function testNotification() {
  const baseUserId = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
  const message = 'Hello! This is a test notification from the script.';

  try {
    console.log('Sending test notification...');
    console.log('User ID:', baseUserId);
    console.log('Message:', message);

    const response = await fetch('http://localhost:3000/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ baseUserId, message }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Success:', data.message);
      console.log('📊 Data:', data.data);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

// Run the test
testNotification();

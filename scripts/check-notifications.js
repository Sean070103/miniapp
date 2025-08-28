// Check notifications API
const fetch = require('node-fetch');

async function checkNotifications() {
  console.log('🔍 Checking Notifications API...\n');

  const userId = '0x9dEa1234567890abcdef1234567890abcdef1234';

  console.log('📤 Fetching notifications for user:', userId);

  try {
    const response = await fetch(`http://localhost:3000/api/notifications?userId=${userId}&limit=10`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('📥 Response status:', response.status);
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      if (data.success && data.data) {
        console.log('✅ Notifications fetched successfully!');
        console.log('📊 Total notifications:', data.data.length);
        
        if (data.data.length > 0) {
          console.log('📋 Notifications:');
          data.data.forEach((notification, index) => {
            console.log(`  ${index + 1}. ${notification.title}: ${notification.message}`);
          });
        } else {
          console.log('📭 No notifications found');
        }
      } else {
        console.log('❌ API returned error:', data.error);
      }
    } else {
      console.log('❌ Failed to fetch notifications:', data.error);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('💡 Make sure your server is running on http://localhost:3000');
  }
}

checkNotifications();

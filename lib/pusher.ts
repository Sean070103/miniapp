import PusherServer from 'pusher';
import PusherClient from 'pusher-js';

// Ensure only one instance of the Pusher server client is created.
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Ensure only one instance of the Pusher client is created for the frontend.
export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.PUSHER_CLUSTER!,
  }
);




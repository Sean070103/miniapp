# 🚀 Production Deployment Guide - Real-Time Notifications

This guide ensures your real-time notification system works perfectly in production environments.

## 📋 Prerequisites

- ✅ Next.js application ready for deployment
- ✅ Pusher account with production credentials
- ✅ Database (PostgreSQL/MySQL) configured
- ✅ Environment variables properly set

## 🔧 Environment Variables

### Required for Production

```bash
# Pusher Configuration
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster

# Public Pusher Keys (for client-side)
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster

# Database
DATABASE_URL=your_database_url

# Optional: Encryption (recommended for production)
PUSHER_ENCRYPTION_MASTER_KEY=your_encryption_key
```

### Vercel Configuration

If using Vercel, add these to your `vercel.json`:

```json
{
  "env": {
    "PUSHER_APP_ID": "your_app_id",
    "PUSHER_KEY": "your_key",
    "PUSHER_SECRET": "your_secret",
    "PUSHER_CLUSTER": "your_cluster",
    "NEXT_PUBLIC_PUSHER_KEY": "your_key",
    "NEXT_PUBLIC_PUSHER_CLUSTER": "your_cluster"
  }
}
```

## 🏗️ Deployment Steps

### 1. Database Setup

```bash
# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy (platform specific)
npm run deploy
```

### 3. Verify Deployment

```bash
# Test production notifications
node scripts/test-production-notifications.js --url https://your-domain.com
```

## 🔍 Production Monitoring

### 1. Pusher Dashboard

Monitor your Pusher app in the [Pusher Dashboard](https://dashboard.pusher.com/):
- Connection counts
- Event delivery rates
- Error rates
- Channel activity

### 2. Application Logs

Monitor these key areas:
- Pusher connection logs
- Notification delivery success/failure
- API response times
- Error rates

### 3. Performance Metrics

Track these metrics:
- Notification delivery latency
- Connection stability
- User engagement with notifications
- Error rates by notification type

## 🛡️ Security Considerations

### 1. Environment Variables
- ✅ Never commit secrets to version control
- ✅ Use environment-specific configurations
- ✅ Rotate keys regularly

### 2. CORS Configuration
```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.ALLOWED_ORIGINS || '*'
          }
        ]
      }
    ]
  }
}
```

### 3. Rate Limiting
Consider implementing rate limiting for notification endpoints:
```javascript
// Example with express-rate-limit
import rateLimit from 'express-rate-limit'

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

## 🧪 Testing in Production

### 1. Automated Testing

```bash
# Test all notification types
node scripts/test-production-notifications.js --url https://your-domain.com

# Test with specific users
node scripts/test-production-notifications.js \
  --url https://your-domain.com \
  --test-user 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6 \
  --target-user 0x9dEa1234567890abcdef1234567890abcdef1234
```

### 2. Manual Testing Checklist

- [ ] Connect wallet on production site
- [ ] Create a post and verify followers get notified
- [ ] Like a post and verify notification appears
- [ ] Comment on a post and verify notification
- [ ] Follow a user and verify notification
- [ ] Check real-time updates in feed
- [ ] Verify toast notifications appear
- [ ] Test notification bell badge updates

### 3. Load Testing

For high-traffic applications:
```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://your-domain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Notification Load Test"
    requests:
      - post:
          url: "/api/journal/post"
          json:
            baseUserId: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
            journal: "Load test post"
            privacy: "public"
EOF

# Run load test
artillery run load-test.yml
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Notifications Not Appearing
- Check Pusher credentials in environment variables
- Verify client-side connection in browser console
- Check server-side Pusher initialization logs

#### 2. Connection Drops
- Monitor Pusher dashboard for connection issues
- Check network connectivity
- Verify WebSocket support in production environment

#### 3. High Latency
- Check Pusher cluster location vs user location
- Monitor database query performance
- Consider caching strategies

### Debug Commands

```bash
# Check environment variables
echo $PUSHER_APP_ID
echo $PUSHER_KEY
echo $PUSHER_CLUSTER

# Test Pusher connection
curl -X POST https://api-${PUSHER_CLUSTER}.pusherapp.com/apps/${PUSHER_APP_ID}/events \
  -H "Content-Type: application/json" \
  -d '{"name":"test","channel":"test-channel","data":"test"}'

# Check application logs
tail -f /var/log/your-app.log | grep -i pusher
```

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for notification queries
CREATE INDEX idx_notifications_receiver_id ON notifications(receiverId);
CREATE INDEX idx_notifications_date_created ON notifications(dateCreated);
CREATE INDEX idx_notifications_is_read ON notifications(isRead);
```

### 2. Caching Strategy
```javascript
// Cache user notifications
const cachedNotifications = await redis.get(`notifications:${userId}`);
if (cachedNotifications) {
  return JSON.parse(cachedNotifications);
}
```

### 3. Batch Processing
```javascript
// Batch notification creation for high-volume scenarios
const notifications = await prisma.notification.createMany({
  data: notificationData
});
```

## 🚨 Emergency Procedures

### 1. Disable Notifications
```javascript
// Add feature flag
const NOTIFICATIONS_ENABLED = process.env.NOTIFICATIONS_ENABLED !== 'false';

if (NOTIFICATIONS_ENABLED) {
  // Send notification
}
```

### 2. Rollback Plan
- Keep previous deployment ready
- Database backup before major changes
- Feature flags for gradual rollout

### 3. Monitoring Alerts
- Set up alerts for high error rates
- Monitor Pusher quota usage
- Track notification delivery failures

## 📈 Scaling Considerations

### 1. Horizontal Scaling
- Stateless API endpoints
- Database connection pooling
- Load balancer configuration

### 2. Vertical Scaling
- Increase server resources
- Optimize database queries
- Use CDN for static assets

### 3. Geographic Distribution
- Use multiple Pusher clusters
- Deploy to multiple regions
- Consider edge computing

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Pusher credentials verified
- [ ] CORS settings configured
- [ ] Rate limiting implemented
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Load testing completed
- [ ] Security audit passed
- [ ] Documentation updated

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Pusher dashboard for connection issues
3. Check application logs for errors
4. Verify environment variable configuration
5. Test with the provided test scripts

For additional help, refer to:
- [Pusher Documentation](https://pusher.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Prisma Documentation](https://www.prisma.io/docs)

# SYNTHAI 🪷 - Deployment & Testing Guide

Complete guide for testing, optimizing, and deploying SYNTHAI to production.

## Pre-Deployment Checklist

### Environment Configuration

- [ ] Set `HUGGINGFACE_API_KEY` environment variable
- [ ] Configure `DATABASE_URL` for MySQL/TiDB
- [ ] Set `JWT_SECRET` for session management
- [ ] Configure Manus OAuth credentials
- [ ] Set up S3 storage credentials
- [ ] Verify all required environment variables

### Code Quality

- [ ] Run TypeScript check: `pnpm check`
- [ ] Run tests: `pnpm test`
- [ ] Check for console errors and warnings
- [ ] Review database migrations
- [ ] Verify all imports are correct

### Database

- [ ] Create database and user
- [ ] Run migrations: `pnpm drizzle-kit migrate`
- [ ] Verify all tables created
- [ ] Check indexes on frequently queried columns
- [ ] Backup existing data if upgrading

### PWA Configuration

- [ ] Verify `manifest.json` is correct
- [ ] Test service worker registration
- [ ] Check icon files exist and are correct size
- [ ] Test install prompt on mobile devices
- [ ] Verify offline functionality

### Security

- [ ] Enable HTTPS in production
- [ ] Set secure cookie flags
- [ ] Configure CORS properly
- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Review authentication flow

## Local Testing

### 1. Development Setup

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Set environment variables
export HUGGINGFACE_API_KEY="your-key"
export DATABASE_URL="mysql://user:pass@localhost/synthai"

# Start development server
pnpm dev
```

### 2. Test Each Feature

**Authentication**
```bash
# Visit http://localhost:3000
# Click login
# Verify OAuth flow works
# Check session cookie is set
```

**Chat Interface**
```bash
# Navigate to /chat
# Create new conversation
# Send test message
# Verify AI response appears
# Check message history loads
```

**Projects Tracker**
```bash
# Navigate to /projects
# Create new project
# Edit project details
# Mark as complete
# Verify project appears in list
```

**Profile & Personalization**
```bash
# Navigate to /profile
# Enter birth date, time, place
# Verify zodiac sign calculates correctly
# Check life path number displays
# Verify personalization theme applies
```

**Admin Panel**
```bash
# Login as admin user
# Navigate to /admin
# Test scaffolding manager
# Test integration manager
# Test file uploader
# Test neural network controls
```

### 3. Performance Testing

**Lighthouse Audit**
```bash
# Open DevTools (F12)
# Go to Lighthouse tab
# Run audit
# Target scores:
#   - Performance: 90+
#   - Accessibility: 95+
#   - Best Practices: 95+
#   - SEO: 100
```

**Load Testing**
```bash
# Test with multiple concurrent users
# Monitor database query performance
# Check API response times
# Verify no memory leaks
```

**Mobile Testing**
```bash
# Test on iOS device
# Test on Android device
# Verify install prompt appears
# Test offline functionality
# Check responsive design
```

### 4. Browser Compatibility

Test on:
- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### 5. Accessibility Testing

```bash
# Run axe DevTools browser extension
# Test keyboard navigation
# Test screen reader compatibility
# Verify color contrast ratios
# Check form labels and ARIA attributes
```

## Production Deployment

### 1. Build for Production

```bash
# Build frontend and backend
pnpm build

# Output:
# - client/dist/ - Frontend bundle
# - dist/ - Backend server
```

### 2. Environment Variables

Create `.env.production`:

```
NODE_ENV=production
DATABASE_URL=mysql://prod_user:secure_password@prod-host/synthai
JWT_SECRET=very-secure-random-secret-key
HUGGINGFACE_API_KEY=your-production-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
```

### 3. Database Setup

```bash
# Create production database
mysql -u root -p
CREATE DATABASE synthai_prod;
CREATE USER 'synthai_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON synthai_prod.* TO 'synthai_user'@'localhost';

# Run migrations
DATABASE_URL="mysql://synthai_user:secure_password@localhost/synthai_prod" \
pnpm drizzle-kit migrate
```

### 4. Deploy to Server

**Option A: Node.js Hosting (Heroku, Railway, etc.)**

```bash
# Push to git
git push heroku main

# Set environment variables
heroku config:set HUGGINGFACE_API_KEY=your-key
heroku config:set DATABASE_URL=your-db-url

# Run migrations
heroku run "pnpm drizzle-kit migrate"

# View logs
heroku logs --tail
```

**Option B: Docker Deployment**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY dist ./dist
COPY drizzle ./drizzle

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build image
docker build -t synthai:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e HUGGINGFACE_API_KEY="..." \
  synthai:latest
```

**Option C: Traditional VPS**

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/synthai.git
cd synthai

# Install dependencies
pnpm install --prod

# Build
pnpm build

# Run with PM2
npm install -g pm2
pm2 start dist/index.js --name synthai
pm2 save
pm2 startup
```

### 5. SSL/HTTPS Setup

**Using Let's Encrypt with Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name synthai.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/synthai.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/synthai.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name synthai.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 6. Monitoring & Logging

**Application Monitoring:**

```typescript
// Add to server startup
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Database Monitoring:**

```bash
# Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

# Check query performance
SHOW PROCESSLIST;
EXPLAIN SELECT ...;
```

**Log Aggregation:**

```bash
# Use ELK Stack, Datadog, or similar
# Collect logs from:
# - Application logs
# - Database logs
# - Server logs
# - Error tracking
```

### 7. Backup Strategy

```bash
# Daily database backup
0 2 * * * mysqldump -u user -p database | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Weekly full backup
0 3 * * 0 tar -czf /backups/app_$(date +\%Y\%m\%d).tar.gz /app

# Upload to S3
aws s3 sync /backups s3://your-backup-bucket/
```

## Performance Optimization

### Frontend Optimization

1. **Code Splitting**
   - Already implemented with Vite
   - Lazy load pages with React.lazy()

2. **Asset Optimization**
   - Minify CSS and JavaScript
   - Compress images
   - Use WebP format where supported

3. **Caching Strategy**
   - Service worker caches static assets
   - API responses cached for 5 minutes
   - User data cached locally

### Backend Optimization

1. **Database Optimization**
   ```sql
   -- Add indexes
   CREATE INDEX idx_user_id ON conversations(userId);
   CREATE INDEX idx_conversation_id ON messages(conversationId);
   CREATE INDEX idx_user_projects ON projects(userId);
   ```

2. **Query Optimization**
   - Use pagination for large result sets
   - Implement query result caching
   - Avoid N+1 queries

3. **API Optimization**
   - Implement rate limiting
   - Use compression (gzip)
   - Implement request batching

### LLM Optimization

1. **Model Selection**
   - Use smaller models for faster responses
   - Cache common responses
   - Implement response streaming

2. **Prompt Optimization**
   - Keep prompts concise
   - Use examples for better results
   - Adjust temperature for consistency

## Monitoring Checklist

- [ ] Application uptime (99.9%+ target)
- [ ] API response time (< 200ms target)
- [ ] Database query time (< 100ms target)
- [ ] Error rate (< 0.1% target)
- [ ] User engagement metrics
- [ ] Chat response quality
- [ ] System resource usage

## Rollback Plan

If issues occur in production:

```bash
# Identify issue
# Check logs and monitoring

# Option 1: Rollback code
git revert <commit-hash>
pnpm build
# Redeploy

# Option 2: Rollback database
# Restore from backup
mysql < /backups/db_backup.sql

# Option 3: Disable problematic feature
# Set feature flag to false
# Redeploy without feature
```

## Post-Deployment

1. **Verify Deployment**
   - [ ] Application loads
   - [ ] All pages accessible
   - [ ] Chat works
   - [ ] Database connected
   - [ ] Hugging Face API works

2. **Monitor First 24 Hours**
   - [ ] Check error logs
   - [ ] Monitor performance
   - [ ] Verify backups working
   - [ ] Test user signup/login

3. **Announce to Users**
   - [ ] Send deployment notification
   - [ ] Highlight new features
   - [ ] Provide feedback channel

## Troubleshooting

### Application Won't Start

```bash
# Check logs
pm2 logs synthai

# Check environment variables
env | grep HUGGINGFACE
env | grep DATABASE

# Test database connection
mysql -u user -p -h host -e "SELECT 1"
```

### Database Connection Issues

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
mysql -u user -p -h host database

# Check firewall
telnet host 3306
```

### Hugging Face API Issues

```bash
# Test API key
curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1

# Check rate limits
# Monitor at https://huggingface.co/settings/billing
```

### Performance Issues

```bash
# Check database indexes
SHOW INDEX FROM conversations;

# Check slow queries
SHOW PROCESSLIST;

# Monitor server resources
top
df -h
free -h
```

## Security Hardening

1. **Input Validation**
   - Validate all user inputs
   - Use Zod schemas
   - Sanitize database queries

2. **Authentication**
   - Use secure session cookies
   - Implement CSRF protection
   - Rate limit login attempts

3. **Authorization**
   - Check user roles
   - Verify resource ownership
   - Implement proper access control

4. **Data Protection**
   - Encrypt sensitive data
   - Use HTTPS everywhere
   - Implement data retention policies

## Scaling Considerations

As user base grows:

1. **Database Scaling**
   - Implement read replicas
   - Use database clustering
   - Implement sharding if needed

2. **API Scaling**
   - Load balance multiple instances
   - Implement caching layer (Redis)
   - Use CDN for static assets

3. **LLM Scaling**
   - Use Hugging Face Pro for higher limits
   - Implement request queuing
   - Consider self-hosted models

---

**SYNTHAI 🪷** - Production Ready

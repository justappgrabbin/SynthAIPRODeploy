# SYNTHAI 🪷 - Quick Start Guide

Get up and running with SYNTHAI in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- MySQL/TiDB database
- Hugging Face API key (free)
- Manus OAuth credentials

## 1. Installation (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/synthai.git
cd synthai

# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate
```

## 2. Configuration (1 minute)

Create a `.env.local` file:

```bash
# Database
DATABASE_URL=mysql://user:password@localhost/synthai

# Hugging Face (get from https://huggingface.co/settings/tokens)
HUGGINGFACE_API_KEY=your-hugging-face-api-key

# Manus OAuth (get from Manus dashboard)
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Session
JWT_SECRET=your-random-secret-key-here
```

## 3. Start Development Server (1 minute)

```bash
# Start the dev server
pnpm dev

# Open browser
# Visit http://localhost:3000
```

## 4. Test Features (1 minute)

### Create Account
1. Click "Login" button
2. Complete Manus OAuth flow
3. You're logged in!

### Set Up Personalization
1. Go to Profile page
2. Enter your birth date, time, and place
3. See your zodiac sign and life path number calculated
4. Watch the UI theme change to match your profile

### Try AI Chat
1. Go to Chat page
2. Create a new conversation
3. Type a message
4. Watch the AI respond with Hugging Face LLM
5. Notice it references your personalization data

### Create Projects
1. Go to Projects page
2. Click "New Project"
3. Add a title and description
4. The AI will reference this in chat

### Explore Admin Panel (if admin user)
1. Go to Admin Dashboard
2. Try scaffolding manager
3. Try app integrations
4. Try file uploader
5. Check neural network rules

## Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Landing page & feed |
| Chat | `/chat` | AI conversation |
| Projects | `/projects` | Project tracker |
| Profile | `/profile` | User settings & personalization |
| Admin | `/admin` | Admin controls |

## Common Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm check        # Check TypeScript
pnpm test         # Run tests

# Database
pnpm drizzle-kit generate   # Generate migrations
pnpm drizzle-kit migrate    # Apply migrations

# Production
pnpm build        # Build for production
pnpm start        # Start production server
```

## Troubleshooting

### "Cannot find module" Error
```bash
# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database Connection Error
```bash
# Check connection string
echo $DATABASE_URL

# Test MySQL connection
mysql -u user -p -h localhost
```

### Hugging Face API Error
```bash
# Verify API key
echo $HUGGINGFACE_API_KEY

# Test API key
curl -H "Authorization: Bearer $HUGGINGFACE_API_KEY" \
  https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1
```

### Port Already in Use
```bash
# Use different port
PORT=3001 pnpm dev

# Or kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. **Customize UI**: Edit files in `client/src/`
2. **Add Features**: Create new procedures in `server/routers.ts`
3. **Deploy**: Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
4. **Learn More**: Read [README_SYNTHAI.md](./README_SYNTHAI.md)

## Documentation

- **Full README**: [README_SYNTHAI.md](./README_SYNTHAI.md)
- **Hugging Face Setup**: [HUGGINGFACE_SETUP.md](./HUGGINGFACE_SETUP.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Development TODO**: [TODO.md](./TODO.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    SYNTHAI 🪷 PWA                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (React 19 + TypeScript)                      │
│  ├── Pages: Home, Chat, Projects, Profile, Admin      │
│  ├── Components: UI, Chat, Forms                       │
│  └── Service Worker: Offline support                  │
│                                                         │
│  ↓ tRPC API ↓                                          │
│                                                         │
│  Backend (Express + tRPC)                             │
│  ├── Chat: AI responses via Hugging Face              │
│  ├── Projects: Task tracking                          │
│  ├── Personalization: Astrology/Numerology            │
│  ├── Admin: Scaffolding, integrations, files          │
│  ├── Mesh Network: Multi-agent communication          │
│  └── Neural Network: Self-editing rules               │
│                                                         │
│  ↓ Database ↓                                          │
│                                                         │
│  MySQL/TiDB                                            │
│  ├── Users (with personalization data)                │
│  ├── Conversations & Messages                         │
│  ├── Projects & Activities                            │
│  ├── Scaffolding & Integrations                       │
│  ├── Agents & Knowledge Base                          │
│  └── Rule Updates & History                           │
│                                                         │
│  ↓ External Services ↓                                │
│                                                         │
│  ├── Hugging Face: LLM inference                      │
│  ├── S3: File storage                                 │
│  ├── Manus OAuth: Authentication                      │
│  └── Manus APIs: Notifications, etc.                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Features at a Glance

✅ **PWA**: Install on home screen (iOS & Android)
✅ **AI Chat**: Powered by Hugging Face LLM
✅ **Personalization**: Astrology & numerology
✅ **Projects**: Track goals and commitments
✅ **Admin Panel**: Manage scaffolding and integrations
✅ **Mesh Network**: Multi-agent communication
✅ **Neural Network**: Self-editing AI rules
✅ **Offline Support**: Works without internet
✅ **Responsive Design**: Mobile-first approach
✅ **Type Safe**: Full TypeScript coverage

## Support & Resources

- **GitHub**: https://github.com/yourusername/synthai
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions on GitHub Discussions
- **Docs**: Full documentation in this repository

## License

MIT License - See LICENSE file

---

**Ready to go?** Start with `pnpm dev` and visit http://localhost:3000

**SYNTHAI 🪷** - Your personal AI agent

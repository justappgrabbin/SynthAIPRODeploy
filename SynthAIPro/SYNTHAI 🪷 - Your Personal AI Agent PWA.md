# SYNTHAI 🪷 - Your Personal AI Agent PWA

A polished, production-ready Progressive Web App (PWA) that brings your personal AI agent to life. SYNTHAI tracks your projects, follows up on commitments, and keeps things moving while you focus on what matters most.

## Features

### Core Features

**Progressive Web App (PWA)**
- Install directly to home screen on iPhone and Android
- Offline support with service worker caching
- Install prompts for both iOS and Android
- Full app-like experience without app store distribution

**AI Agent Chat**
- Conversational AI powered by LLM integration
- Real-time message streaming
- Project and commitment tracking
- Intelligent follow-up reminders
- Message history and search

**Project & Commitment Tracker**
- Create and manage projects with priorities
- Track project status (active, completed, paused, archived)
- Automatic progress monitoring
- Deadline reminders and notifications

**Birthday-Based Personalization**
- Astrology-based customization (zodiac signs)
- Numerology life path calculations
- Personalized AI responses and themes
- Custom color schemes based on birth data
- Personalized greetings and suggestions

**Admin Panel**
- Role-based access control (admin/user)
- Comprehensive dashboard with statistics
- User management interface

**Scaffolding & App Integration Manager**
- Add custom scaffolding configurations
- Connect third-party apps (SuperBass, etc.)
- Enable/disable integrations
- Configuration management UI

**File Uploader**
- Upload documents, configs, and media
- S3 storage integration
- File management interface
- File preview and download

**Mesh Network Layer**
- Multi-agent communication and coordination
- Agent discovery and registration
- Optimal routing between agents
- Network statistics and monitoring
- Real-time agent status tracking

**Self-Editing Neural Network**
- AI-suggested rule updates
- Knowledge base management
- Rule versioning and rollback
- Admin approval workflow
- Audit logging for changes

### User Experience

- **Elegant Design**: Refined, polished UI with premium look and feel
- **Responsive**: Works seamlessly on all screen sizes
- **Fast**: Optimized performance with code splitting and lazy loading
- **Accessible**: WCAG compliant with keyboard navigation support
- **Offline-First**: Full functionality when offline

## Tech Stack

**Frontend**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- shadcn/ui components
- Wouter for routing
- tRPC for type-safe API calls
- Lucide React for icons
- Service Worker for offline support

**Backend**
- Express 4 server
- tRPC 11 for RPC procedures
- Drizzle ORM for database
- MySQL/TiDB for data persistence
- Manus OAuth for authentication
- OpenAI API integration

**Infrastructure**
- Vite for build tooling
- Drizzle Kit for migrations
- Vitest for testing
- TypeScript for type safety

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- MySQL/TiDB database
- Manus OAuth credentials

### Development

```bash
# Install dependencies
pnpm install

# Generate database migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
meli-clone/
├── client/                          # React frontend
│   ├── public/
│   │   ├── manifest.json           # PWA manifest
│   │   ├── service-worker.js       # Service worker
│   │   └── favicon.ico
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx            # Landing & home feed
│   │   │   ├── Chat.tsx            # AI chat interface
│   │   │   ├── Projects.tsx        # Project tracker
│   │   │   ├── Profile.tsx         # User profile & settings
│   │   │   └── AdminDashboard.tsx  # Admin panel
│   │   ├── components/
│   │   │   ├── PWAInstallPrompt.tsx # Install prompt
│   │   │   └── ui/                  # shadcn/ui components
│   │   ├── App.tsx                 # Main app component
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Global styles
│   └── index.html                  # HTML template
├── server/                          # Express backend
│   ├── db.ts                       # Database queries
│   ├── personalization.ts          # Astrology/numerology engine
│   ├── mesh-network.ts             # Multi-agent mesh layer
│   ├── neural-network.ts           # Self-editing neural network
│   ├── routers.ts                  # tRPC procedures
│   └── _core/                      # Framework internals
├── drizzle/
│   ├── schema.ts                   # Database schema
│   └── migrations/                 # SQL migrations
├── shared/                         # Shared types & constants
└── package.json
```

## Key Pages & Features

### Home Page (`/`)
- Landing page for unauthenticated users
- Feature showcase
- Call-to-action buttons
- Authenticated home feed with activity timeline

### Chat (`/chat`)
- Real-time AI conversation interface
- Message history
- Streaming responses
- Project and commitment tracking in chat

### Projects (`/projects`)
- View all projects and commitments
- Create new projects
- Track project status and priority
- Mark projects as complete
- Delete projects

### Profile (`/profile`)
- User profile settings
- Birthday personalization setup
- Astrology and numerology display
- Account information
- Logout functionality

### Admin Dashboard (`/admin`)
- Scaffolding manager (add/remove/enable configs)
- App integration manager
- File uploader with S3 integration
- Neural network management
- Mesh network monitoring

## Personalization Engine

The personalization engine calculates:

**Zodiac Sign**: Based on birth date (Aries, Taurus, etc.)
**Life Path Number**: Numerological calculation from birth date
**Personality Theme**: Color scheme based on life path number
**Lucky Number & Color**: Associated with zodiac sign

These are used to:
- Customize AI responses
- Personalize greetings
- Adapt UI theme colors
- Suggest timing for tasks

## Mesh Network

The mesh network enables:
- **Agent Registration**: Agents join the network
- **Message Routing**: Optimal path finding between agents
- **Status Tracking**: Real-time agent status (online/offline/idle)
- **Broadcast**: Send messages to multiple agents
- **Coordination**: Multi-agent task coordination

## Neural Network

The self-editing neural network allows:
- **Rule Management**: Create and manage AI behavior rules
- **Suggestions**: AI suggests improvements to its own rules
- **Approval Workflow**: Admins review and approve changes
- **Versioning**: Track all rule changes with history
- **Rollback**: Revert to previous rule versions

## Database Schema

### Core Tables
- `users` - User accounts with birth personalization data
- `conversations` - Chat conversation history
- `messages` - Individual chat messages
- `projects` - User projects and commitments
- `activities` - Activity feed timeline

### Admin Tables
- `scaffolding_configs` - App scaffolding configurations
- `integrations` - Third-party app integrations
- `files` - Uploaded files metadata

### Advanced Tables
- `agents` - Mesh network agents
- `knowledge_base` - AI behavior rules
- `rule_updates` - Self-editing suggestions
- `rule_updates` - Suggestion history

## API Endpoints

All API calls go through tRPC at `/api/trpc`

### Auth
- `auth.me` - Get current user
- `auth.logout` - Logout user

### Chat
- `chat.createConversation` - Start new conversation
- `chat.getConversations` - List conversations
- `chat.addMessage` - Send message
- `chat.getMessages` - Get conversation history

### Projects
- `projects.create` - Create project
- `projects.list` - List user projects
- `projects.update` - Update project
- `projects.delete` - Delete project

### Admin
- `admin.getScaffoldings` - List scaffolding configs
- `admin.createScaffolding` - Add scaffolding
- `admin.getIntegrations` - List integrations
- `admin.uploadFile` - Upload file

## PWA Features

### Installation
- **Android**: Browser shows install prompt automatically
- **iOS**: User taps Share > Add to Home Screen

### Offline Support
- Service worker caches essential assets
- Network-first strategy for API calls
- Graceful degradation when offline

### App Shortcuts
- Quick access to Chat
- Quick access to Projects

### Share Target
- Share content directly to SYNTHAI

## Security

- **Authentication**: Manus OAuth for secure login
- **Role-Based Access**: Admin vs User roles
- **Protected Routes**: Admin panel requires admin role
- **API Security**: tRPC procedures with auth checks
- **Data Encryption**: Sensitive data encrypted at rest
- **CORS**: Properly configured cross-origin policies

## Performance

- **Code Splitting**: Lazy-loaded pages
- **Asset Optimization**: Minified and compressed
- **Service Worker**: Efficient caching strategies
- **Database Indexing**: Optimized queries
- **CDN**: S3 for file storage

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## Deployment

The app is ready for deployment to any Node.js hosting:

1. Build the project: `pnpm build`
2. Set environment variables
3. Run migrations: `pnpm drizzle-kit migrate`
4. Start server: `pnpm start`

## Environment Variables

```
DATABASE_URL=mysql://user:password@host/database
JWT_SECRET=your-secret-key
VITE_APP_ID=your-manus-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
OPENAI_API_KEY=your-openai-key
```

## Roadmap

- [ ] Voice input for chat
- [ ] Calendar integration
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Team collaboration
- [ ] Custom AI training
- [ ] Webhook integrations

## Support

For issues, feature requests, or questions, please refer to the documentation or contact support.

## License

MIT License - See LICENSE file for details

---

**SYNTHAI 🪷** - Where AI meets intention

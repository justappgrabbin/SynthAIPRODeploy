# Synthia Control Center — Drop-In Package

One folder. Drop into your repo. Push to GitHub. Render deploys. Done.

## What You Get

- **Control Center** (`/control` or `/`) — web interface where you talk to hub, upload files, see projects, approve work
- **MCP Hub** (`/mcp`) — AIs connect here, auto-discover via `/.well-known/mcp.json`
- **API** (`/api/*`) — phone app talks here, AIs submit work here
- **Site Pages** (`/:page`) — publish completed projects as website pages

## Drop-In Steps (2 minutes)

### 1. Copy files into your repo
```
your-existing-repo/
├── server.js              ← your existing file
├── mcp-hub-addon.js       ← NEW (this package)
├── control-center-api.js  ← NEW (this package)
├── public/
│   └── control-center.html ← NEW (this package)
└── package.json           ← add 2 dependencies
```

### 2. Add dependencies
```bash
npm install @modelcontextprotocol/sdk multer
```

Or merge this into your package.json:
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.6.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

### 3. Add ONE LINE to your server.js
```javascript
// At the bottom of your server.js, after app and db are set up:
require('./mcp-hub-addon')(app, db);
```

### 4. Push to GitHub
```bash
git add mcp-hub-addon.js control-center-api.js public/control-center.html package.json
git commit -m "Add Synthia Control Center + MCP Hub"
git push
```

### 5. Render auto-deploys
Go to your Render URL. See the Control Center. Done.

## Using It

### Talk to Hub
1. Open `https://your-app.onrender.com/`
2. Type: "Build me a landing page for coaching"
3. Select route: Auto (or ChatGPT/Claude/Website)
4. Click SEND
5. Project appears in Active Projects

### Upload Files
1. Drag files to upload zone (or click)
2. Hub ingests and routes
3. Processing status appears

### Approve Work
1. Inbox shows unread items
2. AI asks question → Approve/Reject buttons appear
3. Click → AI continues or stops

### Publish to Website
1. Project completes → status becomes "done"
2. Click PUBLISH
3. Enter URL path: `/coaching-landing`
4. Page live at `https://your-app.onrender.com/coaching-landing`

## How AIs Connect

**Claude Desktop:**
1. Settings → MCP Servers → Add
2. URL: `https://your-app.onrender.com/.well-known/mcp.json`
3. Claude auto-discovers, connects, can call your hub

**ChatGPT (if MCP enabled):**
Give it: `https://your-app.onrender.com/.well-known/mcp.json`

**Cursor:**
`.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "synthia": {
      "url": "https://your-app.onrender.com/mcp"
    }
  }
}
```

## Database Collections Needed

The addon auto-creates these if they don't exist:
- `projects` — active work
- `inbox` — notifications for you
- `site_pages` — published website pages
- `uploads` — file metadata
- `ai_queue` — pending AI tasks

## Your Existing Code Stays

Nothing changes in your existing server. The addon:
- Adds routes (doesn't replace)
- Uses your existing `app` and `db`
- Respects your auth middleware
- Serves static files alongside your API

## Troubleshooting

**"MCP SDK not found"**
→ Run `npm install @modelcontextprotocol/sdk`

**"Control Center not attached"**
→ Check `control-center-api.js` is in same folder as `mcp-hub-addon.js`

**"Page not found"**
→ Ensure `public/control-center.html` exists

## What This Enables

- You talk → hub routes → AI works → submits back → you approve → publishes to site
- All in one place. One URL. One interface. One push to deploy.
- Your phone app (Expo) talks to same server
- AIs talk to same server
- Everything meets here.
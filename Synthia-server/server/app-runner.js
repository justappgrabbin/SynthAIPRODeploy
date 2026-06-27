const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');
const crypto = require('crypto');
const multer = require('multer');
const JSZip = require('jszip');
const { createClient } = require('@supabase/supabase-js');

const APP_DATA_DIR = process.env.APP_DATA_DIR || path.join(process.cwd(), 'data', 'apps');
const SUPABASE_APP_BUCKET = process.env.SUPABASE_APP_BUCKET || 'synthia-apps';
const MAX_OUTPUT = Number(process.env.APP_RUNNER_MAX_OUTPUT || 120000);
const TIMEOUT_MS = Number(process.env.APP_RUNNER_TIMEOUT_MS || 120000);

function supabaseStorage() {
  const url = process.env.SUPABASE_PRIMARY_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PRIMARY_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (!url || !key) return null;
  return createClient(url, key).storage.from(SUPABASE_APP_BUCKET);
}

function safeName(value) {
  return String(value || 'uploaded-app')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'uploaded-app';
}

function detectFileKind(filePath) {
  const ext = path.extname(filePath).toLowerCase().replace('.', '');
  const typeMap = {
    js: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code', rs: 'code',
    java: 'code', cpp: 'code', c: 'code', go: 'code', rb: 'code', php: 'code',
    swift: 'code', kt: 'code', sh: 'code',
    json: 'data', xml: 'data', yaml: 'data', yml: 'data', csv: 'data',
    sql: 'data', graphql: 'data', proto: 'data',
    html: 'markup', htm: 'markup', md: 'markup', rst: 'markup', tex: 'markup',
    mp3: 'media', mp4: 'media', mpeg: 'media', wav: 'media', ogg: 'media',
    webm: 'media', avi: 'media', mov: 'media',
    jpg: 'image', jpeg: 'image', png: 'image', gif: 'image', svg: 'image',
    webp: 'image', bmp: 'image', tiff: 'image',
    zip: 'archive', tar: 'archive', gz: 'archive', rar: 'archive',
    '7z': 'archive', bz2: 'archive',
    pdf: 'document', doc: 'document', docx: 'document', txt: 'document',
    rtf: 'document', odt: 'document',
    env: 'config', ini: 'config', toml: 'config', cfg: 'config', conf: 'config',
  };
  return typeMap[ext] || 'unknown';
}

function appId(name) {
  return `${safeName(name)}-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
}

function resolveAppPath(id) {
  const target = path.resolve(APP_DATA_DIR, id);
  const root = path.resolve(APP_DATA_DIR);
  if (!target.startsWith(root)) throw new Error('invalid_app_path');
  return target;
}

function resolveInside(root, relativePath) {
  const normalized = String(relativePath || '').replace(/\\/g, '/').replace(/^\/+/, '');
  if (!normalized || normalized.includes('../')) return null;
  const target = path.resolve(root, normalized);
  if (!target.startsWith(path.resolve(root))) return null;
  return target;
}

async function ensureDir(dir) {
  await fsp.mkdir(dir, { recursive: true });
}

async function writeJson(file, value) {
  await ensureDir(path.dirname(file));
  await fsp.writeFile(file, JSON.stringify(value, null, 2));
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await fsp.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function listFiles(dir, base = dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full).replace(/\\/g, '/');
    if (entry.isDirectory()) {
      if (!['node_modules', '.git', '__pycache__', '.venv', 'venv'].includes(entry.name)) {
        await listFiles(full, base, acc);
      }
    } else {
      acc.push(rel);
    }
  }
  return acc.slice(0, 500);
}

async function extractZip(buffer, destination) {
  const zip = await JSZip.loadAsync(buffer);
  const extracted = [];
  const writes = [];

  zip.forEach((relativePath, file) => {
    if (file.dir) return;
    const normalized = relativePath.replace(/\\/g, '/');
    if (normalized.includes('../') || normalized.startsWith('/')) return;
    writes.push((async () => {
      const target = path.resolve(destination, normalized);
      if (!target.startsWith(path.resolve(destination))) return;
      await ensureDir(path.dirname(target));
      await fsp.writeFile(target, await file.async('nodebuffer'));
      extracted.push(normalized);
    })());
  });

  await Promise.all(writes);
  return extracted;
}

async function copyDir(source, destination) {
  await ensureDir(destination);
  const entries = await fsp.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      await copyDir(sourcePath, destinationPath);
    } else {
      await ensureDir(path.dirname(destinationPath));
      await fsp.copyFile(sourcePath, destinationPath);
    }
  }
}

async function readSmallText(file) {
  try {
    const stat = await fsp.stat(file);
    if (stat.size > 256 * 1024) return '';
    return await fsp.readFile(file, 'utf8');
  } catch {
    return '';
  }
}

function hashContent(content) {
  return crypto.createHash('sha256').update(String(content || '')).digest('hex');
}

function extractEntities(text, file, parsed = {}) {
  const entities = [];
  const patterns = {
    url: /https?:\/\/[^\s<>"{}|\\^`[\]]+/g,
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    version: /\b\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?\b/g,
    uuid: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
    function: /\b(?:function|def)\s+([A-Za-z_$][\w$]*)|(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/g,
    class: /\bclass\s+([A-Za-z_$][\w$]*)/g,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    for (const match of text.matchAll(pattern)) {
      const value = match[1] || match[2] || match[0];
      entities.push({ type, value, file, confidence: ['function', 'class'].includes(type) ? 1 : 0.85 });
    }
  }

  for (const dep of parsed.imports || []) entities.push({ type: 'import', value: dep, file, confidence: 1 });
  return entities.slice(0, 120);
}

function extractConcepts(text, parsed = {}) {
  const lower = text.toLowerCase();
  const taxonomy = {
    ui: ['button', 'input', 'form', 'modal', 'menu', 'sidebar', 'card', 'grid', 'chart', 'graph', 'canvas', 'component'],
    data: ['database', 'query', 'schema', 'model', 'record', 'relation', 'filter', 'transform', 'migrate', 'supabase'],
    network: ['api', 'endpoint', 'route', 'request', 'response', 'auth', 'token', 'cors', 'websocket', 'socket'],
    security: ['encrypt', 'hash', 'sandbox', 'permission', 'role', 'policy', 'audit'],
    system: ['process', 'service', 'container', 'docker', 'server', 'client', 'port', 'runtime'],
    media: ['image', 'video', 'audio', 'stream', 'render', 'capture'],
    math: ['vector', 'matrix', 'tensor', 'gradient', 'probability', 'cluster', 'fractal'],
    language: ['token', 'parse', 'syntax', 'ast', 'compile', 'bundle'],
  };
  const concepts = [];

  for (const [category, terms] of Object.entries(taxonomy)) {
    for (const term of terms) {
      if (lower.includes(term)) concepts.push({ category, term, confidence: 0.8 });
    }
  }
  if ((parsed.imports || []).length) concepts.push({ category: 'language', term: 'imports', confidence: 1 });
  if ((parsed.functions || []).length) concepts.push({ category: 'system', term: 'callable-behavior', confidence: 0.9 });

  const seen = new Set();
  return concepts.filter((concept) => {
    const key = `${concept.category}:${concept.term}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inferPurpose(file, kind, text, parsed = {}) {
  const haystack = `${file} ${text.slice(0, 5000)}`.toLowerCase();
  const rules = [
    [/test|spec|\.test\.|\.spec\./, 'testing', 0.9],
    [/config|settings|\.env|environment/, 'configuration', 0.9],
    [/readme|changelog|license|contributing/, 'documentation', 0.95],
    [/dockerfile|docker-compose|\.docker/, 'containerization', 0.95],
    [/deploy|build|webpack|rollup|vite|esbuild|next\.config/, 'build-tooling', 0.85],
    [/server|app|index|main|entry/, 'application-entry', 0.8],
    [/component|widget|element|module/, 'ui-component', 0.85],
    [/route|router|navigate|navigation/, 'routing', 0.9],
    [/api|fetch|axios|request|client/, 'api-client', 0.85],
    [/model|schema|entity|dto|type/, 'data-model', 0.85],
  ];
  const matches = rules.filter(([pattern]) => pattern.test(haystack)).map(([, purpose, confidence]) => ({ purpose, confidence }));
  if (kind === 'markup') matches.push({ purpose: 'web-surface', confidence: 0.9 });
  if (kind === 'code' && (parsed.functions || []).length) matches.push({ purpose: 'executable-code', confidence: 0.82 });
  if (kind === 'data') matches.push({ purpose: 'data-structure', confidence: 0.8 });
  matches.sort((a, b) => b.confidence - a.confidence);
  return { primary: matches[0] || { purpose: 'unknown', confidence: 0.5 }, all: matches.slice(0, 5) };
}

function classifyDomains(file, text) {
  const haystack = `${file} ${text.slice(0, 5000)}`.toLowerCase();
  const domains = {
    human_design: ['human design', 'bodygraph', 'gate', 'channel', 'authority', 'strategy'],
    i_ching: ['i ching', 'hexagram', 'trigram', 'yijing'],
    astrology: ['astrology', 'natal', 'planet', 'zodiac'],
    systems_theory: ['system', 'complexity', 'emergence', 'feedback', 'network', 'fractal'],
    agent_logic: ['agent', 'autonomous', 'llm', 'ai', 'neural', 'model', 'inference', 'prompt'],
    infrastructure: ['server', 'database', 'api', 'docker', 'container', 'deploy', 'infra'],
    ui_component: ['component', 'react', 'css', 'html', 'ui', 'interface', 'design'],
    knowledge_base: ['knowledge', 'ontology', 'taxonomy', 'schema', 'entity', 'relation', 'graph'],
    symbolic_model: ['symbolic', 'simulation', 'algorithm', 'pattern'],
  };
  const found = [];
  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some((keyword) => haystack.includes(keyword))) found.push(domain);
  }
  return found.length ? found : ['general'];
}

function inferCapabilities(kind, purpose, concepts, parsed = {}) {
  const caps = [];
  const conceptCategories = new Set(concepts.map((concept) => concept.category));
  if (kind === 'markup' || conceptCategories.has('ui')) caps.push({ template: 'ui-component', capabilities: ['render', 'interact', 'respond'], runtime: 'browser', confidence: 0.85 });
  if (kind === 'data' || conceptCategories.has('data')) caps.push({ template: 'data-model', capabilities: ['store', 'validate', 'transform'], runtime: 'any', confidence: 0.8 });
  if (conceptCategories.has('network')) caps.push({ template: 'api-client', capabilities: ['request', 'cache', 'auth'], runtime: 'browser|server', confidence: 0.78 });
  if (kind === 'code' && (parsed.functions || []).length) caps.push({ template: 'script', capabilities: ['execute', 'automate', 'orchestrate'], runtime: 'server', confidence: 0.8 });
  if (purpose.primary?.purpose === 'configuration') caps.push({ template: 'configuration', capabilities: ['configure', 'validate', 'merge'], runtime: 'any', confidence: 0.9 });
  if (purpose.primary?.purpose === 'documentation') caps.push({ template: 'documentation', capabilities: ['inform', 'guide', 'reference'], runtime: 'human', confidence: 0.9 });
  return caps;
}

function generateAddress(kind, purpose, domains, id) {
  const domain = domains[0] || 'general';
  const primary = safeName(purpose.primary?.purpose || 'unknown');
  return {
    path: `/${domain}/${kind}/${primary}/${id}`,
    domain,
    kind,
    purpose: primary,
    id,
    full: `synthia://memory/${domain}/${kind}/${primary}/${id}`,
  };
}

function parseTextFile(file, text) {
  const imports = [...text.matchAll(/(?:import\s+.*?from\s+|require\()["']([^"']+)["']/g)].map((match) => match[1]);
  const functions = [
    ...[...text.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)/g)].map((match) => ({ name: match[1] })),
    ...[...text.matchAll(/\bdef\s+([A-Za-z_]\w*)/g)].map((match) => ({ name: match[1] })),
  ];
  const classes = [...text.matchAll(/\bclass\s+([A-Za-z_$][\w$]*)/g)].map((match) => ({ name: match[1] }));
  const exports = [...text.matchAll(/\bexport\s+(?:default\s+)?(?:class|function|const|let|var)?\s*([A-Za-z_$][\w$]*)?/g)].map((match) => match[1]).filter(Boolean);
  const lines = text.split('\n');
  return {
    file,
    imports,
    functions,
    classes,
    exports,
    comments: [...text.matchAll(/(?:\/\/|#)\s*(.+)$/gm)].map((match) => match[1]).slice(0, 40),
    line_count: lines.length,
    character_count: text.length,
    complexity: (text.match(/\b(if|else|for|while|switch|case|try|catch|function|class)\b|=>/g) || []).length,
  };
}

async function analyzeStructure(appPath) {
  const files = await listFiles(appPath);
  const extensionCounts = {};
  const relationships = [];
  const entrypoints = [];
  const behaviors = [];
  const patterns = [];
  const file_nodes = [];
  const entities = [];
  const concepts = [];
  const purposes = [];
  const domains = new Set();
  const capabilities = [];
  const fingerprints = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase() || '[none]';
    const kind = detectFileKind(file);
    extensionCounts[ext] = (extensionCounts[ext] || 0) + 1;

    if (/^(index|main|app|server)\.(html|js|jsx|ts|tsx|py|sh)$/i.test(path.basename(file))) {
      entrypoints.push(file);
    }

    const text = await readSmallText(path.join(appPath, file));
    const parsed = parseTextFile(file, text);
    const imports = [...text.matchAll(/(?:import\s+.*?from\s+|require\()["']([^"']+)["']/g)].map((match) => match[1]);
    for (const target of imports.slice(0, 30)) relationships.push({ from: file, to: target, kind: 'import' });
    for (const fn of parsed.functions) relationships.push({ from: file, to: fn.name, kind: 'defines-function' });
    for (const cls of parsed.classes) relationships.push({ from: file, to: cls.name, kind: 'defines-class' });

    if (/fetch\(|WebSocket|socket\.io|supabase|localStorage|indexedDB/i.test(text)) {
      behaviors.push({ file, kind: 'runtime_integration' });
    }
    if (/express\(|createServer|app\.listen|uvicorn|FastAPI/i.test(text)) {
      behaviors.push({ file, kind: 'server_process' });
    }

    const fileEntities = extractEntities(text, file, parsed);
    const fileConcepts = extractConcepts(text, parsed);
    const purpose = inferPurpose(file, kind, text, parsed);
    const fileDomains = classifyDomains(file, text);
    const fileCapabilities = inferCapabilities(kind, purpose, fileConcepts, parsed);
    fileDomains.forEach((domain) => domains.add(domain));
    entities.push(...fileEntities);
    concepts.push(...fileConcepts);
    purposes.push({ file, ...purpose.primary });
    capabilities.push(...fileCapabilities.map((capability) => ({ file, ...capability })));
    fingerprints.push({ file, hash: hashContent(`${file}|${kind}|${purpose.primary.purpose}|${text.slice(0, 2000)}`) });
    file_nodes.push({
      file,
      kind,
      extension: ext,
      parsed,
      entities: fileEntities.slice(0, 20),
      concepts: fileConcepts.slice(0, 20),
      purpose,
      domains: fileDomains,
      capabilities: fileCapabilities,
      fingerprint: fingerprints[fingerprints.length - 1],
    });
  }

  const packagePath = path.join(appPath, 'package.json');
  if (fs.existsSync(packagePath)) {
    const pkg = await readJson(packagePath, {});
    patterns.push({ kind: 'node_package', scripts: Object.keys(pkg.scripts || {}), dependencies: Object.keys(pkg.dependencies || {}) });
    for (const [name, command] of Object.entries(pkg.scripts || {})) behaviors.push({ file: 'package.json', kind: `npm_script:${name}`, command });
  }

  if (files.some((file) => file.toLowerCase().endsWith('.html'))) patterns.push({ kind: 'static_web_surface' });
  if (files.some((file) => file.toLowerCase().endsWith('.py'))) patterns.push({ kind: 'python_runtime' });
  if (files.some((file) => file.toLowerCase().endsWith('.tsx') || file.toLowerCase().endsWith('.jsx'))) patterns.push({ kind: 'react_surface' });

  const primaryPurpose = purposes.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))[0] || { purpose: 'unknown', confidence: 0.5 };
  return {
    files,
    extension_counts: extensionCounts,
    entrypoints,
    patterns,
    relationships,
    behaviors,
    entities: entities.slice(0, 250),
    concepts: concepts.slice(0, 250),
    purposes,
    domains: Array.from(domains),
    capabilities,
    fingerprints,
    file_nodes,
    memory_object: {
      version: '1.0.0',
      address: generateAddress('package', { primary: primaryPurpose }, Array.from(domains), hashContent(files.join('|')).slice(0, 12)),
      semantic_fingerprint: hashContent(JSON.stringify({ files, purposes, domains: Array.from(domains), relationships: relationships.slice(0, 80) })),
      primary_purpose: primaryPurpose,
      capability_profile: capabilities.slice(0, 80),
      tags: [...new Set([...Array.from(domains), ...concepts.map((concept) => concept.term), primaryPurpose.purpose].filter(Boolean))].slice(0, 80),
      complexity: {
        score: Math.min(100, relationships.length * 0.3 + behaviors.length * 3 + entities.length * 0.2 + files.length),
        file_count: files.length,
        relationship_count: relationships.length,
        behavior_count: behaviors.length,
      },
    },
  };
}

function mountAssessment(analysis) {
  const extensions = analysis.extension_counts || {};
  const hasEntrypoint = analysis.entrypoints.length > 0;
  const supported = Boolean(
    extensions['.html'] ||
    extensions['.js'] ||
    extensions['.mjs'] ||
    extensions['.py'] ||
    extensions['.sh'] ||
    analysis.patterns.some((pattern) => pattern.kind === 'node_package')
  );

  const issues = [];
  if (!hasEntrypoint) issues.push('No obvious entrypoint was found.');
  if (!supported) issues.push('No directly executable/static runtime type was detected.');

  return { mountable: supported && hasEntrypoint, supported, issues };
}

async function regenerateForEnvironment(runtimeDir, analysis, assessment) {
  if (assessment.mountable) return null;

  const files = analysis.files || [];
  const index = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Regenerated App Wrapper</title>
    <style>
      body{margin:0;min-height:100vh;background:#05070d;color:#edf6ff;font-family:system-ui,sans-serif;padding:24px}
      main{max-width:900px;margin:0 auto;display:grid;gap:16px}
      section{border:1px solid #243044;border-radius:14px;padding:16px;background:#0b111d}
      code,pre{white-space:pre-wrap;word-break:break-word}
    </style>
  </head>
  <body>
    <main>
      <h1>Environment-ready wrapper generated</h1>
      <section>
        <strong>Mount notes</strong>
        <pre>${assessment.issues.join('\n') || 'Original source preserved. Wrapper generated for app tray mounting.'}</pre>
      </section>
      <section>
        <strong>Detected patterns</strong>
        <pre>${JSON.stringify(analysis.patterns, null, 2)}</pre>
      </section>
      <section>
        <strong>Original files</strong>
        <pre>${files.join('\n')}</pre>
      </section>
    </main>
  </body>
</html>`;

  await fsp.writeFile(path.join(runtimeDir, 'index.html'), index);
  return { generated: true, file: 'index.html', reason: 'original_not_directly_mountable' };
}

async function detectRunCommand(appPath) {
  const files = await listFiles(appPath);
  const packagePath = path.join(appPath, 'package.json');

  if (fs.existsSync(packagePath)) {
    const pkg = await readJson(packagePath, {});
    if (pkg.scripts?.start) return 'npm start';
    if (pkg.scripts?.dev) return 'npm run dev -- --host 0.0.0.0';
    if (pkg.scripts?.build) return 'npm run build';
    return 'npm install';
  }

  const html = files.find((file) => file.toLowerCase().endsWith('.html'));
  if (html) return `node -e "console.log('Static HTML app uploaded: ${html}')"`;

  const py = files.find((file) => file.toLowerCase().endsWith('.py'));
  if (py) return `python ${JSON.stringify(py)}`;

  const js = files.find((file) => file.toLowerCase().endsWith('.js'));
  if (js) return `node ${JSON.stringify(js)}`;

  const sh = files.find((file) => file.toLowerCase().endsWith('.sh'));
  if (sh) return `sh ${JSON.stringify(sh)}`;

  return 'ls -la';
}

function runCommand(appPath, command) {
  return new Promise((resolve) => {
    const startedAt = new Date().toISOString();
    exec(command, {
      cwd: appPath,
      env: process.env,
      timeout: TIMEOUT_MS,
      maxBuffer: MAX_OUTPUT,
      shell: true,
    }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        command,
        started_at: startedAt,
        finished_at: new Date().toISOString(),
        stdout: String(stdout || '').slice(-MAX_OUTPUT),
        stderr: String(stderr || '').slice(-MAX_OUTPUT),
        error: error ? error.message : null,
        code: error && typeof error.code !== 'undefined' ? error.code : 0,
      });
    });
  });
}

async function summarize(id) {
  const dir = resolveAppPath(id);
  const manifest = await readJson(path.join(dir, '.synthia-app.json'), { id });
  const files = await listFiles(path.join(dir, 'runtime'));
  return { ...manifest, files, file_count: files.length };
}

function attachAppRunner(app) {
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 250 * 1024 * 1024, files: 100 } });
  const storage = supabaseStorage();

  async function mirrorToSupabase(id, relativePath, buffer, contentType) {
    if (!storage) return null;
    const objectPath = `${id}/${relativePath}`.replace(/\\/g, '/');
    const { error } = await storage.upload(objectPath, buffer, {
      upsert: true,
      contentType: contentType || 'application/octet-stream',
    });
    return error ? { path: objectPath, error: error.message } : { path: objectPath, ok: true };
  }

  app.get('/api/apps', async (_req, res) => {
    await ensureDir(APP_DATA_DIR);
    const ids = (await fsp.readdir(APP_DATA_DIR, { withFileTypes: true }))
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
    res.json({ ok: true, apps: await Promise.all(ids.map(summarize)) });
  });

  app.post('/api/apps/upload', upload.array('files', 100), async (req, res) => {
    await ensureDir(APP_DATA_DIR);
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ ok: false, error: 'files_required' });

    const name = safeName(req.body?.name || files[0].originalname.replace(/\.[^.]+$/, ''));
    const id = appId(name);
    const dir = resolveAppPath(id);
    const rawDir = path.join(dir, 'raw');
    const runtimeDir = path.join(dir, 'runtime');
    await ensureDir(rawDir);
    await ensureDir(runtimeDir);
    const storage_results = [];

    for (const file of files) {
      if (file.originalname.toLowerCase().endsWith('.zip')) {
        const rawZipPath = resolveInside(rawDir, file.originalname);
        if (rawZipPath) {
          await ensureDir(path.dirname(rawZipPath));
          await fsp.writeFile(rawZipPath, file.buffer);
        }
        const extracted = await extractZip(file.buffer, runtimeDir);
        storage_results.push(await mirrorToSupabase(id, `raw/${file.originalname}`, file.buffer, file.mimetype));
        for (const relative of extracted) {
          const extractedBuffer = await fsp.readFile(path.join(runtimeDir, relative));
          storage_results.push(await mirrorToSupabase(id, `runtime/${relative}`, extractedBuffer, 'application/octet-stream'));
        }
      } else {
        const relative = String(file.originalname || file.fieldname).replace(/\\/g, '/').replace(/^\/+/, '');
        const rawTarget = resolveInside(rawDir, relative);
        const runtimeTarget = resolveInside(runtimeDir, relative);
        if (!rawTarget || !runtimeTarget) continue;
        await ensureDir(path.dirname(rawTarget));
        await ensureDir(path.dirname(runtimeTarget));
        await fsp.writeFile(rawTarget, file.buffer);
        await fsp.writeFile(runtimeTarget, file.buffer);
        storage_results.push(await mirrorToSupabase(id, `raw/${relative}`, file.buffer, file.mimetype));
        storage_results.push(await mirrorToSupabase(id, `runtime/${relative}`, file.buffer, file.mimetype));
      }
    }

    const analysis = await analyzeStructure(runtimeDir);
    const assessment = mountAssessment(analysis);
    const regeneration = await regenerateForEnvironment(runtimeDir, analysis, assessment);
    const finalAnalysis = regeneration ? await analyzeStructure(runtimeDir) : analysis;
    const run_command = req.body?.run_command || await detectRunCommand(runtimeDir);
    const manifest = {
      id,
      name,
      run_command,
      status: assessment.mountable ? 'mounted' : 'regenerated',
      tray: { mounted: true, label: name, source: assessment.mountable ? 'original_runtime' : 'regenerated_runtime' },
      app_store: { ready: true, submitted: false },
      ingestion: {
        raw_preserved: true,
        analyzed: true,
        mountable: assessment.mountable,
        assessment,
        regeneration,
        structure: finalAnalysis,
      },
      storage: storage ? { provider: 'supabase', bucket: SUPABASE_APP_BUCKET } : { provider: 'local' },
      storage_results: storage_results.filter(Boolean),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await writeJson(path.join(dir, '.synthia-app.json'), manifest);
    res.json({ ok: true, app: await summarize(id) });
  });

  app.post('/api/apps/:id/run', async (req, res) => {
    const dir = resolveAppPath(req.params.id);
    if (!fs.existsSync(dir)) return res.status(404).json({ ok: false, error: 'app_not_found' });
    const runtimeDir = path.join(dir, 'runtime');
    const manifestFile = path.join(dir, '.synthia-app.json');
    const manifest = await readJson(manifestFile, { id: req.params.id });
    const command = String(req.body?.command || manifest.run_command || await detectRunCommand(runtimeDir)).trim();
    const result = await runCommand(runtimeDir, command);
    const run = { ...result, id: `run-${Date.now()}` };
    const runs = await readJson(path.join(dir, '.synthia-runs.json'), []);
    runs.unshift(run);
    await writeJson(path.join(dir, '.synthia-runs.json'), runs.slice(0, 50));
    await writeJson(manifestFile, { ...manifest, run_command: command, status: result.ok ? 'ran' : 'error', updated_at: new Date().toISOString() });
    res.json({ ok: result.ok, run, app: await summarize(req.params.id) });
  });

  app.post('/api/apps/:id/destination', async (req, res) => {
    const dir = resolveAppPath(req.params.id);
    if (!fs.existsSync(dir)) return res.status(404).json({ ok: false, error: 'app_not_found' });
    const manifestFile = path.join(dir, '.synthia-app.json');
    const manifest = await readJson(manifestFile, { id: req.params.id });
    const destination = req.body?.destination === 'app_store' ? 'app_store' : 'tray';
    const next = {
      ...manifest,
      status: destination === 'app_store' ? 'queued_for_app_store' : 'mounted',
      tray: { ...(manifest.tray || {}), mounted: destination === 'tray' },
      app_store: { ...(manifest.app_store || {}), submitted: destination === 'app_store', submitted_at: destination === 'app_store' ? new Date().toISOString() : manifest.app_store?.submitted_at },
      updated_at: new Date().toISOString(),
    };
    await writeJson(manifestFile, next);
    res.json({ ok: true, app: await summarize(req.params.id) });
  });

  app.get('/api/apps/:id/runs', async (req, res) => {
    const dir = resolveAppPath(req.params.id);
    if (!fs.existsSync(dir)) return res.status(404).json({ ok: false, error: 'app_not_found' });
    res.json({ ok: true, runs: await readJson(path.join(dir, '.synthia-runs.json'), []) });
  });

  app.delete('/api/apps/:id', async (req, res) => {
    const dir = resolveAppPath(req.params.id);
    if (!fs.existsSync(dir)) return res.status(404).json({ ok: false, error: 'app_not_found' });
    await fsp.rm(dir, { recursive: true, force: true });
    res.json({ ok: true, deleted: req.params.id });
  });
}

module.exports = attachAppRunner;

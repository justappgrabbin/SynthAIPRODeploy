import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_SYNTHAI_API_BASE || '';

const modules = [
  { id: 'ingest', icon: '⬢', label: 'Ingest', detail: 'Upload files, zips, code, and app fragments.' },
  { id: 'morph', icon: '✦', label: 'Morph', detail: 'Analyze intent, structure, and executable surface.' },
  { id: 'mount', icon: '▣', label: 'Mount', detail: 'Stage artifacts for the app tray.' },
  { id: 'run', icon: '▶', label: 'Run', detail: 'Open generated apps or backend-backed runners.' }
];

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function App() {
  const [status, setStatus] = useState('booting');
  const [files, setFiles] = useState([]);
  const [log, setLog] = useState(['SynthAIPro mobile shell loaded.', 'APK-safe frontend is online.']);
  const [intent, setIntent] = useState('Upload, analyze, regenerate, mount, execute.');

  const fileStats = useMemo(() => {
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    return { count: files.length, totalBytes };
  }, [files]);

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const response = await fetch(`${API_BASE}/health`);
        if (!response.ok) throw new Error(`health ${response.status}`);
        const data = await response.json();
        if (!cancelled) {
          setStatus(data.status || 'healthy');
          setLog((old) => [`Backend connected: ${data.version || 'unknown version'}`, ...old].slice(0, 12));
        }
      } catch (error) {
        if (!cancelled) {
          setStatus('offline shell');
          setLog((old) => [`Backend not reachable in APK shell yet: ${error.message}`, ...old].slice(0, 12));
        }
      }
    }

    checkHealth();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleFiles(event) {
    const selected = Array.from(event.target.files || []);
    setFiles(selected);
    setLog((old) => [`Selected ${selected.length} file(s) for local APK staging.`, ...old].slice(0, 12));

    const textFile = selected.find((file) => /\.(js|jsx|ts|tsx|json|html|css|md|txt)$/i.test(file.name));
    if (!textFile) return;

    try {
      const content = await textFile.text();
      const response = await fetch(`${API_BASE}/api/drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: textFile.name, content, context: { source: 'apk-shell' } })
      });
      const result = await response.json();
      setLog((old) => [`Drop analyzed: ${textFile.name} → ${result.recommended_mode || result.mode || 'staged'}`, ...old].slice(0, 12));
    } catch (error) {
      setLog((old) => [`Local stage only: ${textFile.name} (${error.message})`, ...old].slice(0, 12));
    }
  }

  async function sendIntent() {
    try {
      const response = await fetch(`${API_BASE}/api/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, context: { source: 'apk-shell' } })
      });
      const result = await response.json();
      setLog((old) => [`Intent staged: ${result.mode || result.status || 'queued'}`, ...old].slice(0, 12));
    } catch (error) {
      setLog((old) => [`Intent kept local: ${error.message}`, ...old].slice(0, 12));
    }
  }

  return (
    <main className="os-shell">
      <div className="grid-glow" />
      <section className="status-bar">
        <span className={`pulse ${status.includes('offline') ? 'dormant' : 'active'}`} />
        <strong>SynthAIPro</strong>
        <span className="phase">APK READY SHELL</span>
        <span className="spacer" />
        <code>{status}</code>
      </section>

      <section className="desktop">
        <div className="wallpaper">
          <div className="glyph">SYNTH</div>
          <h1>Deploy Core</h1>
          <p>Phone-first upload → analyze → regenerate → mount pipeline.</p>
        </div>

        <article className="window">
          <header className="window-header">
            <strong>Mobile Build Console</strong>
            <span>no iframe · no eval · APK shell</span>
          </header>

          <div className="window-body">
            <p className="eyebrow">Runtime stack</p>
            <h2>Reordered for Android packaging</h2>
            <p>
              This frontend can now compile with Vite, run as a browser app, and wrap into Android through Capacitor.
              Backend calls are optional so the APK can open even when the server is not running.
            </p>

            <div className="stat-grid">
              <div><strong>{fileStats.count}</strong><span>files staged</span></div>
              <div><strong>{formatBytes(fileStats.totalBytes)}</strong><span>selected size</span></div>
              <div><strong>4</strong><span>core modules</span></div>
              <div><strong>APK</strong><span>target</span></div>
            </div>

            <label className="upload-zone">
              <input type="file" multiple onChange={handleFiles} />
              <strong>Drop or pick files for staging</strong>
              <span>Code, HTML, JSON, docs, and ZIPs can be selected here. Executable regeneration stays controlled by the runtime.</span>
            </label>

            <section className="module-card">
              <span>Intent</span>
              <div className="inline-control">
                <input value={intent} onChange={(event) => setIntent(event.target.value)} />
                <button type="button" onClick={sendIntent}>Send</button>
              </div>
            </section>

            <section className="result-list">
              {modules.map((module) => (
                <div key={module.id}>
                  <strong>{module.icon} {module.label}</strong>
                  <br />
                  <span>{module.detail}</span>
                </div>
              ))}
            </section>

            <section className="terminal">
              <div className="terminal-output">
                {log.map((line, index) => <div key={`${line}-${index}`}>$ {line}</div>)}
              </div>
            </section>
          </div>
        </article>
      </section>

      <nav className="dock">
        {modules.map((module) => (
          <button key={module.id} type="button">
            <span>{module.icon}</span>
            <small>{module.label}</small>
          </button>
        ))}
      </nav>
    </main>
  );
}

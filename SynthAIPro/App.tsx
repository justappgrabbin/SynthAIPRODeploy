import React from "react";
import AppRunner from "./src/components/AppRunner";
import BootTerminal from "./src/components/BootTerminal";
import SynthiaConnection from "./src/components/SynthiaConnection";
import SettingsPanel from "./src/components/SettingsPanel";
import { synthiaApi } from "./src/lib/synthiaApi";
import {
  INTERFACE_STORAGE_KEY,
  findInterfaceMode,
  interfaceModes,
} from "./src/interfaceRegistry";

function App() {
  const [artifacts, setArtifacts] = React.useState<any[]>([]);
  const [graph, setGraph] = React.useState<any>(null);
  const [error, setError] = React.useState("");
  const [interfaceId, setInterfaceId] = React.useState(() => {
    if (typeof window === "undefined") return "command";
    return window.localStorage.getItem(INTERFACE_STORAGE_KEY) || "command";
  });

  const activeInterface = findInterfaceMode(interfaceId);

  function updateInterface(nextInterfaceId: string) {
    setInterfaceId(nextInterfaceId);
    window.localStorage.setItem(INTERFACE_STORAGE_KEY, nextInterfaceId);
  }

  React.useEffect(() => {
    Promise.allSettled([synthiaApi.artifacts(12), synthiaApi.graph()]).then((results) => {
      const [artifactsResult, graphResult] = results;

      if (artifactsResult.status === "fulfilled") {
        setArtifacts(artifactsResult.value?.artifacts ?? []);
      }

      if (graphResult.status === "fulfilled") {
        setGraph(graphResult.value);
      }

      const rejected = results.find((result) => result.status === "rejected") as
        | PromiseRejectedResult
        | undefined;

      if (rejected) {
        setError(rejected.reason?.message ?? "Synthia server request failed");
      }
    });
  }, []);

  return (
    <main
      className="app-shell"
      style={{
        minHeight: "100vh",
        padding: 24,
        color: "white",
        background:
          "radial-gradient(circle at 20% 20%, rgba(122, 92, 255, 0.32), transparent 32%), linear-gradient(135deg, #070711 0%, #101024 55%, #050509 100%)",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <section
        className="app-content"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gap: 20,
        }}
      >
        <header className="interface-toolbar">
          <div>
            <strong>Interface</strong>
            <span>{activeInterface.description}</span>
          </div>

          <select
            aria-label="Choose interface"
            value={activeInterface.id}
            onChange={(event) => updateInterface(event.target.value)}
          >
            {interfaceModes.map((mode) => (
              <option key={mode.id} value={mode.id}>
                {mode.name}
              </option>
            ))}
          </select>
        </header>

        {activeInterface.kind === "iframe" && activeInterface.path ? (
          <section className="interface-frame-panel">
            <iframe
              title={activeInterface.name}
              src={activeInterface.path}
              className="interface-frame"
            />
          </section>
        ) : (
          <>
        <div
          className="hero-card"
          style={{
            padding: 28,
            borderRadius: 20,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          }}
        >
          <p style={{ margin: 0, opacity: 0.72, letterSpacing: 1.8, textTransform: "uppercase" }}>
            Morph OS Interface
          </p>
          <h1 style={{ margin: "8px 0 12px", fontSize: "clamp(36px, 7vw, 72px)", lineHeight: 0.94 }}>
            SynthAIPro is awake.
          </h1>
          <p style={{ maxWidth: 680, fontSize: 18, lineHeight: 1.55, opacity: 0.82 }}>
            This safe shell keeps the interface visible while Synthia-server wiring is tested. No missing routes, no mystery UI imports, no black-screen surprises.
          </p>
        </div>

        {error && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              color: "#ffd1d1",
              background: "rgba(255, 80, 80, 0.13)",
              border: "1px solid rgba(255, 120, 120, 0.28)",
            }}
          >
            <strong>Server note:</strong> {error}
          </div>
        )}

        <div className="metric-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <article style={cardStyle}>
            <strong>Artifacts</strong>
            <span style={metricStyle}>{artifacts.length}</span>
            <small style={mutedStyle}>Loaded from /api/artifacts</small>
          </article>

          <article style={cardStyle}>
            <strong>Graph</strong>
            <span style={metricStyle}>{graph ? "online" : "checking"}</span>
            <small style={mutedStyle}>Loaded from /api/graph</small>
          </article>

          <article style={cardStyle}>
            <strong>Realtime</strong>
            <span style={metricStyle}>wired</span>
            <small style={mutedStyle}>Watch the Synthia panel</small>
          </article>
        </div>

        <AppRunner />

        <SettingsPanel />

        {artifacts.length > 0 && (
          <section className="artifact-panel" style={panelStyle}>
            <h2 style={{ marginTop: 0 }}>Recent artifacts</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {artifacts.map((artifact) => (
                <div className="artifact-row" key={artifact.id ?? artifact.name} style={artifactStyle}>
                  <strong>{artifact.name ?? "Unnamed artifact"}</strong>
                  <small style={mutedStyle}>{artifact.type ?? "artifact"}</small>
                </div>
              ))}
            </div>
          </section>
        )}
          </>
        )}
      </section>

      {activeInterface.kind === "native" && <SynthiaConnection />}
      {activeInterface.kind === "native" && <BootTerminal />}
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  display: "grid",
  gap: 8,
};

const metricStyle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 800,
};

const mutedStyle: React.CSSProperties = {
  opacity: 0.68,
};

const panelStyle: React.CSSProperties = {
  padding: 20,
  borderRadius: 20,
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.14)",
};

const artifactStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
};

export default App;

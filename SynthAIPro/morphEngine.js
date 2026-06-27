// Morph Neural Net v3 - Browser-Embedded Engine
// Source-dominant, brutally honest file regeneration

(function(global) {
  'use strict';

  // ========== TYPES (runtime) ==========
  const GNNNodeType = [
    "functionality", "pattern", "dependency", "insight",
    "reusable_component", "source_chunk", "file_blueprint",
    "morph_runtime", "improvement"
  ];

  const RegenerationMode = ["exact", "equivalent", "morph_runtime", "improved"];

  // ========== MIR ANALYZER ==========
  class MIRAnalyzer {
    analyze(artifact) {
      const content = artifact.originalContent;
      const fileType = this.detectFileType(artifact.originalName);

      const contract = {
        fileType,
        exports: this.extractExports(content),
        imports: this.extractImports(content),
        dependencies: this.extractDependencies(content),
        props: (fileType === "tsx" || fileType === "jsx") ? this.extractProps(content) : undefined,
        behavior: this.extractBehavior(content),
        visualStructure: (fileType === "tsx" || fileType === "jsx") ? this.extractVisualStructure(content) : undefined,
        dataFlow: this.extractDataFlow(content),
        stateShape: this.extractStateShape(content),
        apiSurface: this.extractApiSurface(content)
      };

      const blueprint = this.extractBlueprint(content);
      return { contract, blueprint };
    }

    detectFileType(filename) {
      const ext = (filename.split(".").pop() || "").toLowerCase();
      const map = { tsx:"tsx", ts:"ts", js:"js", jsx:"jsx", py:"py", json:"json", css:"css", md:"md" };
      return map[ext] || "unknown";
    }

    extractExports(content) {
      const exports = [];
      const defaultMatch = content.match(/export\s+default\s+(?:function|class|const)?\s*(\w+)/);
      if (defaultMatch) exports.push(`default:${defaultMatch[1]}`);
      const named = [...content.matchAll(/export\s+(?:function|class|const|type|interface)\s+(\w+)/g)];
      named.forEach(m => exports.push(m[1]));
      return exports;
    }

    extractImports(content) {
      return [...content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
    }

    extractDependencies(content) {
      const deps = new Set();
      if (content.includes("react")) deps.add("react");
      if (content.includes("framer-motion")) deps.add("framer-motion");
      if (content.includes("useState") || content.includes("useEffect")) deps.add("react-hooks");
      if (content.includes("fetch") || content.includes("axios")) deps.add("http-client");
      if (content.includes("supabase")) deps.add("supabase");
      if (content.includes("tailwind")) deps.add("tailwind");
      if (content.includes("three")) deps.add("three.js");
      return Array.from(deps);
    }

    extractProps(content) {
      const props = [];
      const interfaceMatch = content.match(/interface\s+\w+Props\s*\{([^}]+)\}/);
      if (interfaceMatch) {
        [...interfaceMatch[1].matchAll(/(\w+)(\?)?:\s*(\w+)/g)].forEach(m => {
          props.push({ name: m[1], type: m[3], required: !m[2] });
        });
      }
      return props;
    }

    extractBehavior(content) {
      const b = [];
      if (content.includes("onClick")) b.push("handles click events");
      if (content.includes("useState")) b.push("manages local state");
      if (content.includes("useEffect")) b.push("reacts to lifecycle changes");
      if (content.includes("fetch") || content.includes("axios")) b.push("makes API calls");
      if (content.includes("animate") || content.includes("motion")) b.push("has animations");
      return b;
    }

    extractVisualStructure(content) {
      const structure = [];
      const returnMatch = content.match(/return\s*\((.*?)\);?\s*\}/s);
      if (returnMatch) {
        const jsx = returnMatch[1];
        [...jsx.matchAll(/<(\w+)[^>]*>/g)].forEach(m => {
          if (m[1] && m[1][0] === m[1][0].toLowerCase()) {
            structure.push({ element: m[1] });
          }
        });
      }
      return structure;
    }

    extractDataFlow(content) {
      const flows = [];
      if (content.includes("useState")) flows.push({ from: "user", to: "state", type: "state" });
      if (content.includes("onClick")) flows.push({ from: "user", to: "handler", type: "event" });
      if (content.includes("fetch")) flows.push({ from: "api", to: "component", type: "api" });
      return flows;
    }

    extractStateShape(content) {
      const shape = {};
      [...content.matchAll(/const\s+\[(\w+),\s*set(\w+)\]\s*=\s*useState(?:<([^>]+)>)?\(([^)]+)\)/g)].forEach(m => {
        shape[m[1]] = m[3] || "any";
      });
      return Object.keys(shape).length > 0 ? shape : undefined;
    }

    extractApiSurface(content) {
      const endpoints = [];
      [...content.matchAll(/(?:fetch|axios)\s*\(\s*['"]([^'"]+)['"]\s*,?\s*\{?\s*method:\s*['"](\w+)['"]?/g)].forEach(m => {
        endpoints.push({ method: m[2] || "GET", path: m[1] });
      });
      return endpoints.length > 0 ? endpoints : undefined;
    }

    extractBlueprint(content) {
      const imports = [...content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g)].map(m => m[0]);
      const exports = [...content.matchAll(/export\s+(?:default\s+)?(?:function|const|class|interface|type)\s+\w+/g)].map(m => m[0]);
      const functions = [...content.matchAll(/(?:function|const)\s+(\w+)/g)].map(m => m[1]);
      const classes = [...content.matchAll(/class\s+(\w+)/g)].map(m => m[1]);
      const hasJsx = content.includes("return (") && content.includes("<");
      let fileRole = "utility";
      if (hasJsx) fileRole = "component";
      else if (exports.some(e => e.includes("default"))) fileRole = "module";
      else if (classes.length > 0) fileRole = "class";
      else if (functions.length > 0) fileRole = "functions";

      return { imports, exports, functions, classes, hasJsx, fileRole, chunkCount: Math.ceil(content.length / 2000), totalLength: content.length };
    }
  }

  // ========== MIR RENDERER ==========
  class MIRRenderer {
    render(contract, blueprint, mode) {
      switch (mode) {
        case "exact": return "// EXACT: use source chunks";
        case "equivalent": return this.renderEquivalent(contract, blueprint);
        case "morph_runtime": return this.renderMorphRuntime(contract, blueprint);
        case "improved": return this.renderImproved(contract, blueprint);
        default: return this.renderMorphRuntime(contract, blueprint);
      }
    }

    renderEquivalent(contract, blueprint) {
      const lines = [];
      const specName = (blueprint.exports[0] || "MorphComponent").replace("default:", "");

      contract.imports.slice(0, 5).forEach(imp => {
        if (imp === "react") lines.push('import React from "react"');
        else if (imp.includes("framer")) lines.push('import { motion } from "framer-motion"');
        else lines.push(`import * as ${imp.replace(/[^a-zA-Z0-9]/g, "_")} from "${imp}"`);
      });
      lines.push("");

      if (contract.props && contract.props.length > 0) {
        lines.push(`interface ${specName}Props {`);
        contract.props.forEach(p => {
          lines.push(`  ${p.name}${p.required ? "" : "?"}: ${p.type};`);
        });
        lines.push(`}`);
        lines.push("");
      }

      lines.push(`export const ${specName} = () => {`);
      contract.behavior.forEach(b => lines.push(`  // TODO: ${b}`));
      lines.push(`  return <div>${specName} equivalent</div>;`);
      lines.push(`};`);

      return lines.join("\n");
    }

    renderMorphRuntime(contract, blueprint) {
      const specName = (blueprint.exports[0] || "MorphComponent").replace("default:", "");
      return `// Morph Runtime Equivalent
// Original: ${blueprint.fileRole} (${contract.fileType})
export const ${specName}Spec = {
  type: "${blueprint.fileRole}",
  name: "${specName}",
  fileType: "${contract.fileType}",
  props: ${JSON.stringify(contract.props || [])},
  behavior: ${JSON.stringify(contract.behavior)},
  dependencies: ${JSON.stringify(contract.dependencies)},
  renderPlan: ${JSON.stringify(contract.visualStructure || [])},
  dataFlow: ${JSON.stringify(contract.dataFlow)},
  stateShape: ${JSON.stringify(contract.stateShape)},
  apiSurface: ${JSON.stringify(contract.apiSurface)}
};
`;
    }

    renderImproved(contract, blueprint) {
      return `// Improved version
export const ImprovedSpec = {
  enhancements: ["memoized", "error boundaries", "loading states", "a11y"]
};`;
    }
  }

  // ========== MORPH MEMORY ENGINE v3 ==========
  class MorphMemoryEngine {
    constructor() {
      this.nodes = new Map();
      this.operations = [];
      this.nodeCounter = 0;
      this.analyzer = new MIRAnalyzer();
      this.renderer = new MIRRenderer();
    }

    hydrate(nodes) {
      nodes.forEach(node => {
        this.nodes.set(node.id, node);
        const num = parseInt(node.id.split("_")[1] || "0");
        this.nodeCounter = Math.max(this.nodeCounter, num);
      });
    }

    async analyzeArtifact(artifact) {
      const content = artifact.originalContent;
      const { contract, blueprint } = this.analyzer.analyze(artifact);

      // Store source chunks WITH EXPLICIT INDEX
      this.createSourceChunks(content, artifact.id);

      // Store blueprint
      this.createNode("file_blueprint", JSON.stringify({ contract, blueprint }), artifact.id);

      // Store components
      blueprint.imports.slice(0, 10).forEach(imp => this.createNode("dependency", imp, artifact.id));
      blueprint.functions.slice(0, 10).forEach(func => this.createNode("functionality", `Function: ${func}`, artifact.id));
      blueprint.classes.forEach(cls => this.createNode("pattern", `Class: ${cls}`, artifact.id));

      return {
        ...artifact,
        understanding: {
          intent: this.extractIntent(content),
          functionality: this.extractFunctionality(content),
          dependencies: this.extractDependencies(content),
          patterns: this.extractPatterns(content),
          complexity: this.calculateComplexity(content),
          keyInsights: this.extractKeyInsights(content),
          reusableComponents: this.extractReusableComponents(content)
        },
        metadata: { ...artifact.metadata, status: "understood" }
      };
    }

    async regenerateArtifact(artifact, context, mode = "morph_runtime") {
      if (!artifact.understanding) {
        return {
          ...artifact,
          regenerationResult: {
            code: "// No understanding", confidence: 0, modeUsed: mode,
            missing: ["No analysis"], integrity: 0, isExact: false, isIdentical: false,
            chunkCount: 0, reconstructedLength: 0, originalLength: 0
          }
        };
      }

      const artifactNodes = this.findArtifactNodes(artifact.id);
      const blueprintNode = artifactNodes.find(n => n.nodeType === "file_blueprint");

      // BRUTAL INTEGRITY: from reconstructed output
      const reconstructed = this.reconstructFromChunks(artifact.id);
      const isIdentical = reconstructed === artifact.originalContent;
      const integrity = artifact.originalContent.length > 0 ? reconstructed.length / artifact.originalContent.length : 0;
      const chunkCount = artifactNodes.filter(n => n.nodeType === "source_chunk").length;

      let result;

      if (mode === "exact") {
        if (chunkCount > 0 && integrity > 0.7) {
          result = {
            code: reconstructed, confidence: isIdentical ? 0.98 : 0.92, modeUsed: "exact",
            missing: isIdentical ? [] : ["minor differences"],
            integrity, isExact: isIdentical, isIdentical, chunkCount,
            reconstructedLength: reconstructed.length, originalLength: artifact.originalContent.length
          };
        } else {
          result = {
            code: this.generateFromBlueprint(artifact.id), confidence: 0.65, modeUsed: "exact",
            missing: [`Integrity too low (${(integrity * 100).toFixed(1)}%)`],
            integrity, isExact: false, isIdentical: false, chunkCount,
            reconstructedLength: reconstructed.length, originalLength: artifact.originalContent.length
          };
        }
      } else if (mode === "equivalent") {
        let mirContract = null, mirBlueprint = null;
        if (blueprintNode) {
          try { const parsed = JSON.parse(blueprintNode.content); mirContract = parsed.contract; mirBlueprint = parsed.blueprint; }
          catch { /* fallback */ }
        }
        if (!mirContract) { const { contract, blueprint } = this.analyzer.analyze(artifact); mirContract = contract; mirBlueprint = blueprint; }
        result = {
          code: this.renderer.render(mirContract, mirBlueprint, "equivalent"), confidence: 0.85,
          modeUsed: "equivalent", missing: ["exact details", "original comments"],
          integrity: 0, isExact: false, isIdentical: false, chunkCount,
          reconstructedLength: reconstructed.length, originalLength: artifact.originalContent.length
        };
      } else if (mode === "morph_runtime") {
        let mirContract = null, mirBlueprint = null;
        if (blueprintNode) {
          try { const parsed = JSON.parse(blueprintNode.content); mirContract = parsed.contract; mirBlueprint = parsed.blueprint; }
          catch { const { contract, blueprint } = this.analyzer.analyze(artifact); mirContract = contract; mirBlueprint = blueprint; }
        } else { const { contract, blueprint } = this.analyzer.analyze(artifact); mirContract = contract; mirBlueprint = blueprint; }
        result = {
          code: this.renderer.render(mirContract, mirBlueprint, "morph_runtime"), confidence: 0.78,
          modeUsed: "morph_runtime", missing: ["exact styles", "animation timing", "variable names"],
          integrity: 0, isExact: false, isIdentical: false, chunkCount,
          reconstructedLength: reconstructed.length, originalLength: artifact.originalContent.length
        };
      } else {
        result = {
          code: `// Improved version of ${artifact.originalName}`, confidence: 0.82,
          modeUsed: "improved", missing: ["original specifics"],
          integrity: 0, isExact: false, isIdentical: false, chunkCount,
          reconstructedLength: reconstructed.length, originalLength: artifact.originalContent.length
        };
      }

      return {
        ...artifact,
        regeneration: {
          generatedCode: result.code, architecture: "Morph", confidence: Math.round(result.confidence * 100),
          improvements: result.missing, gnnNodes: artifactNodes.map(n => n.id),
          generatedAt: new Date().toISOString(), mode, missing: result.missing
        },
        regenerationResult: result,
        metadata: { ...artifact.metadata, status: "regenerated" }
      };
    }

    // ========== SOURCE CHUNK SYSTEM v3 ==========
    createSourceChunks(content, artifactId) {
      const chunkSize = 2000, overlap = 200;
      for (let i = 0, index = 0; i < content.length; i += chunkSize - overlap, index++) {
        const start = i, end = Math.min(i + chunkSize, content.length);
        const payload = { index, chunk: content.slice(start, end), start, end };
        this.createNode("source_chunk", JSON.stringify(payload), artifactId);
      }
    }

    reconstructFromChunks(artifactId) {
      const chunks = Array.from(this.nodes.values())
        .filter(n => n.nodeType === "source_chunk" && n.sourceArtifact === artifactId)
        .map(n => { try { return JSON.parse(n.content); } catch { return null; } })
        .filter(p => p !== null)
        .sort((a, b) => a.index - b.index); // SORT BY INDEX, NOT ID

      if (chunks.length === 0) return "";

      let result = chunks[0].chunk;
      for (let i = 1; i < chunks.length; i++) {
        const prev = chunks[i - 1].chunk, curr = chunks[i].chunk;
        let overlapLen = 0, maxOverlap = Math.min(prev.length, curr.length, 500);
        for (let j = maxOverlap; j > 0; j--) {
          if (prev.slice(-j) === curr.slice(0, j)) { overlapLen = j; break; }
        }
        result += curr.slice(overlapLen);
      }
      return result;
    }

    generateFromBlueprint(artifactId) {
      const blueprintNode = this.findArtifactNodes(artifactId).find(n => n.nodeType === "file_blueprint");
      if (!blueprintNode) return "// Blueprint not found";
      try {
        const { blueprint } = JSON.parse(blueprintNode.content);
        return `// Reconstructed from blueprint\n// Role: ${blueprint.fileRole}\n// Functions: ${blueprint.functions.length}\n// Classes: ${blueprint.classes.length}`;
      } catch { return "// Failed to parse blueprint"; }
    }

    // ========== NODE MANAGEMENT ==========
    createNode(nodeType, content, sourceArtifact) {
      this.nodeCounter++;
      const node = {
        id: `${nodeType}_${this.nodeCounter}`, nodeType, content, sourceArtifact,
        weight: 0.5, usageCount: 0, connections: [], createdAt: new Date().toISOString()
      };
      this.nodes.set(node.id, node);
      return node;
    }

    findArtifactNodes(artifactId) {
      return Array.from(this.nodes.values()).filter(n => n.sourceArtifact === artifactId);
    }

    // ========== SEMANTIC EXTRACTION ==========
    extractIntent(content) {
      const m = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\n/s) || content.match(/\/\/\s*(.+?)(?:\n|$)/);
      if (m) return m[1].trim();
      const cm = content.match(/class\s+(\w+)/), fm = content.match(/function\s+(\w+)/);
      if (cm) return `Implements ${cm[1]}`;
      if (fm) return `Provides ${fm[1]}`;
      return "Unknown";
    }

    extractFunctionality(content) {
      const funcs = [];
      [...content.matchAll(/export\s+(?:async\s+)?(?:function|const|class)\s+(\w+)/g)].forEach(m => funcs.push(`Export: ${m[1]}`));
      if (content.includes("useState")) funcs.push("State management");
      if (content.includes("onClick")) funcs.push("Event handling");
      return funcs.length > 0 ? funcs : ["Basic functionality"];
    }

    extractDependencies(content) {
      const deps = [...content.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);
      if (content.includes("supabase")) deps.push("Supabase");
      if (content.includes("react")) deps.push("React");
      return [...new Set(deps)];
    }

    extractPatterns(content) {
      const p = [];
      if (content.includes("useEffect")) p.push("React hooks");
      if (content.includes("async")) p.push("Async/await");
      if (content.includes("try") && content.includes("catch")) p.push("Error handling");
      return p.length > 0 ? p : ["Procedural"];
    }

    extractKeyInsights(content) {
      const insights = [];
      if (content.includes("graph") || content.includes("node")) insights.push("Graph-based architecture");
      if (content.includes("neural") || content.includes("tensor")) insights.push("Neural network components");
      return insights.length > 0 ? insights : ["General utility"];
    }

    extractReusableComponents(content) {
      const comps = [];
      if (content.includes("config") || content.includes("settings")) comps.push("Configuration pattern");
      if (content.includes("validate")) comps.push("Validation logic");
      return comps.length > 0 ? comps : ["Core functionality"];
    }

    calculateComplexity(content) {
      let score = 50;
      score += Math.min(content.split("\n").length / 10, 20);
      let maxDepth = 0, current = 0;
      for (const char of content) {
        if (char === "{") { current++; maxDepth = Math.max(maxDepth, current); }
        else if (char === "}") current--;
      }
      score += maxDepth * 5;
      score += (content.match(/function/g) || []).length * 2;
      return Math.min(100, Math.round(score));
    }

    getNodes() { return Array.from(this.nodes.values()); }
    getNodeCount() { return this.nodes.size; }
  }

  // ========== EXPOSE TO GLOBAL ==========
  global.MorphEngine = { MorphMemoryEngine, MIRAnalyzer, MIRRenderer, RegenerationMode };

})(typeof window !== 'undefined' ? window : global);

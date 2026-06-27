# Morph Neural Net v3 - MIR Architecture

## The Dragon Has Wings AND Brutal Honesty

This is the source-dominant file regeneration engine. It does not "understand and generate" — it **remembers and reconstructs**, with brutal honesty about what it can and cannot do.

## Architecture

```
Original source
     ↓
MIR Analyzer → { contract, blueprint }
     ↓
Source Chunker → [chunk_0, chunk_1, ...chunk_n] with EXPLICIT INDEX
     ↓
GNN Memory Nodes
     ↓
Regeneration
     ├── exact → reconstructFromChunks() → isExact = isIdentical
     ├── equivalent → render(contract, "equivalent") → executable code
     ├── morph_runtime → render(contract, "morph_runtime") → Morph-native spec
     └── improved → generateImprovedVersion() → evolves with memory
```

## The Three Brutal Fixes

### Fix #1: SourceChunkPayload with Explicit Index

**Problem:** Sorting by `node.id` breaks at `chunk_10` vs `chunk_2`.

**Solution:**
```typescript
interface SourceChunkPayload {
  index: number      // EXPLICIT - never sort by ID
  chunk: string      // the actual content
  start: number      // position in original
  end: number        // position in original
}
```

Reconstruction sorts by `payload.index`, not `node.id`.

### Fix #2: Integrity from Reconstructed Output

**Problem:** Summing overlapped chunk lengths can exceed 100%.

**Solution:**
```typescript
const reconstructed = this.reconstructFromChunks(artifact.id)
const integrity = reconstructed.length / artifact.originalContent.length
```

Integrity is calculated from the ACTUAL reconstructed string, not summed chunk sizes.

### Fix #3: isExact = isIdentical (Brutal Honesty)

**Problem:** System claimed "exact" even when not byte-identical.

**Solution:**
```typescript
const isIdentical = reconstructed === artifact.originalContent
const result = {
  isExact: isIdentical,    // TRUE ONLY when byte-identical
  isIdentical,             // explicit alias
  // ...
}
```

No more lying with good posture.

## Regeneration Modes

### `exact`
- Pulls ONLY `source_chunk` nodes
- Sorts by EXPLICIT INDEX (not node ID)
- Concatenates with overlap deduplication
- `isExact = (reconstructed === original)` — BRUTAL HONESTY
- Integrity check: must be > 70% or falls back to blueprint

### `equivalent`
- Uses MIR contract + blueprint
- Generates EXECUTABLE code (not sketches with `...`)
- Real imports, real props interfaces, real function bodies
- Missing: exact implementation details, original comments

### `morph_runtime`
- Generates Morph-owned executable spec
- Emits `.morph.ts` for the spec
- Emits `MorphRenderer.tsx` for JSX rendering
- Missing: exact styles, animation timing, variable names

### `improved`
- Uses understanding + memory patterns
- Evolves with learned improvements
- Missing: original implementation specifics

## Usage

```typescript
import { MorphMemoryEngine } from "@/lib/morphMemoryEngine"

const engine = new MorphMemoryEngine()

// After reload, hydrate from persisted nodes
engine.hydrate(persistedNodes)

// Analyze and store
const analyzed = await engine.analyzeArtifact(artifact)

// Remember (strengthen connections)
await engine.rememberArtifact(analyzed)

// Regenerate - EXACT (brutally honest)
const exact = await engine.regenerateArtifact(analyzed, undefined, "exact")
// → { 
//     code: "...", 
//     confidence: 0.98, 
//     isExact: true,        // ONLY true when byte-identical
//     isIdentical: true,     // alias
//     missing: [],
//     integrity: 1.0,
//     chunkCount: 4,
//     reconstructedLength: 6319,
//     originalLength: 6319
//   }

// Regenerate - MORPH RUNTIME
const morph = await engine.regenerateArtifact(analyzed, undefined, "morph_runtime")
// → { code: "export const MorphSpec = {...}", confidence: 0.78, isExact: false, ... }

// Recall from memory
const memory = await engine.recall("button component")

// Improvise new code
const improvised = await engine.improvise("create a form handler")
```

## File Structure

```
morph-mir-system/
├── types/
│   └── index.ts          # All types: GNN, Artifact, MIR, Operations, SourceChunkPayload
├── lib/
│   ├── mirAnalyzer.ts    # File → MIR contract + blueprint
│   ├── mirRenderer.ts    # MIR contract → executable code (4 modes)
│   └── morphMemoryEngine.ts  # Core engine with brutal honesty
├── index.ts              # Exports
├── tsconfig.json         # TypeScript config with @/* paths
├── package.json          # Package manifest
└── README.md             # This file
```

## Test Results

- Single chunk file (78 chars): ✅ 100% exact, isExact=true
- Multi-chunk file (19,102 chars, 11 chunks): ✅ 100% exact, isExact=true
- Old integrity (sum chunks): 110.47% ← WRONG
- New integrity (reconstructed): 100.00% ← CORRECT
- Alphabetical sort bug: ✅ Fixed by explicit index
- isExact lying: ✅ Fixed by isIdentical check

## The Honesty Principle

Every regeneration returns:
```typescript
{
  code: string,
  confidence: number,       // 0-1, how sure we are
  modeUsed: RegenerationMode,
  missing: string[],         // what we KNOW we lost
  integrity: number,         // reconstructed.length / original.length
  isExact: boolean,         // TRUE ONLY when byte-identical
  isIdentical: boolean,      // alias for clarity
  chunkCount: number,
  reconstructedLength: number,
  originalLength: number
}
```

No more "poetic parrot." This is a file-regeneration engine with a wrench belt AND a polygraph.

## Version History

- **v1:** Wanted the dragon. "Understand → hallucinate code."
- **v2:** Built the skeleton, named the organs, installed a memory stomach.
- **v3:** **Stopped it from sorting its own spine alphabetically.** Brutal honesty. Source dominance. The dragon is real.

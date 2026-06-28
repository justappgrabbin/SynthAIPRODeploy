export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: string;
  format: string;
  size: number;
  hash: string;
  created_at: string;
  modified_at: string;
  ingested_at: string;
  content_summary: string;
  ast_signature: string | null;
  dependency_count: number;
  dependent_count: number;
  domain_tags: string[];
  purpose_tags: string[];
  confidence_score: number;
  origin_state_id: string | null;
  owner_agent_id: string | null;
  visibility: string;
  raw_content: string;
  parsed_data: any;
  storage_path: string | null;
}

export interface MeshNode {
  id: string;
  type: string;
  subtype: string;
  name: string;
  properties: Record<string, any>;
  created_at: string;
  owner_id: string | null;
}

export interface MeshEdge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  weight: number;
  properties: Record<string, any>;
}

export interface IngestionResult {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  nodes: FileNode[];
  timestamp: string;
}

export interface HumanDesignProfile {
  type: string;
  strategy: string;
  authority: string;
  profile: string;
  centers: { defined: string[]; undefined: string[]; open: string[] };
  gates: string[];
  channels: string[];
  incarnation_cross: string;
  variables: Record<string, string[]>;
}

export interface Agent {
  id: string;
  name: string;
  purpose_vector: string;
  value_framework: string;
  origin_state: string;
  human_design_profile: HumanDesignProfile;
  autonomy_level: number;
  memory_signature: string;
  capability_set: string[];
  network_connections: string[];
  resonance_map: Record<string, number>;
  creation_timestamp: string;
  last_active: string;
  evolution_history: any[];
}

export interface Resonance {
  id: string;
  source_id: string;
  target_id: string;
  resonance_type: string;
  frequency_match: number;
  phase_alignment: number;
  amplitude: number;
  stability: number;
  growth_potential: number;
  discovery_timestamp: string;
}

export interface SymbolicSignature {
  origin_state: string;
  frameworks: Record<string, any>;
  cross_correspondences: any[];
  unified_signature: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  supporting_evidence: string[];
  contradicting_evidence: string[];
  confidence_score: number;
  test_proposal: string;
  expected_outcome: string;
  framework_alignment: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  files: string[];
  agents: string[];
  resonance_score: number;
  progress: number;
  economic_potential: number;
  symbolic_timing: string;
  dependencies: string[];
}

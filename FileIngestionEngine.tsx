"use client";

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { usePyodide } from '@/components/pyodide/PyodideProvider';
import { useSupabase } from '@/components/supabase/SupabaseProvider';
import { v4 as uuidv4 } from 'uuid';
import JSZip from 'jszip';
import { FileNode, IngestionResult } from '@/types';

interface FileIngestionEngineProps {
  onIngestComplete?: (result: IngestionResult) => void;
  onProgress?: (progress: number, status: string) => void;
}

export function FileIngestionEngine({ onIngestComplete, onProgress }: FileIngestionEngineProps) {
  const { pyodide, runPythonAsync } = usePyodide();
  const { supabase, user } = useSupabase();
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const detectFileType = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const typeMap: Record<string, string> = {
      js: 'code', jsx: 'code', ts: 'code', tsx: 'code', py: 'code', rs: 'code',
      java: 'code', cpp: 'code', c: 'code', go: 'code', rb: 'code', php: 'code',
      swift: 'code', kt: 'code',
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
    return typeMap[extension] || 'unknown';
  };

  const parseCodeFile = async (content: string, fileName: string, fileType: string): Promise<any> => {
    if (!pyodide) return null;

    const parserCode = `
import ast
import json
import re

def parse_code(content, filename, language):
    result = {
        "language": language,
        "imports": [],
        "exports": [],
        "functions": [],
        "classes": [],
        "variables": [],
        "comments": [],
        "complexity": 0,
        "dependencies": []
    }

    if language == "python":
        try:
            tree = ast.parse(content)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        result["imports"].append(alias.name)
                elif isinstance(node, ast.ImportFrom):
                    result["imports"].append(node.module)
                elif isinstance(node, ast.FunctionDef):
                    result["functions"].append({
                        "name": node.name,
                        "args": [arg.arg for arg in node.args.args],
                        "line": node.lineno
                    })
                elif isinstance(node, ast.ClassDef):
                    result["classes"].append({
                        "name": node.name,
                        "line": node.lineno,
                        "methods": [n.name for n in node.body if isinstance(n, ast.FunctionDef)]
                    })
        except:
            pass
    elif language in ["javascript", "typescript", "jsx", "tsx"]:
        import_pattern = r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]"
        result["imports"] = re.findall(import_pattern, content)
        export_pattern = r"export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)"
        result["exports"] = re.findall(export_pattern, content)
        func_pattern = r"(?:function|const|let|var)\s+(\w+)\s*[=\(]"
        result["functions"] = [{"name": name} for name in re.findall(func_pattern, content)]
        class_pattern = r"class\s+(\w+)"
        result["classes"] = [{"name": name} for name in re.findall(class_pattern, content)]

    comment_pattern = r"(?:#|//|/\*|["']{3})(.*)"
    result["comments"] = re.findall(comment_pattern, content)
    result["complexity"] = content.count('if') + content.count('for') + content.count('while') + content.count('switch')

    return json.dumps(result)

parse_code(content, filename, language)
    `;

    const language = fileName.endsWith('.py') ? 'python' : 
                     fileName.endsWith('.js') ? 'javascript' :
                     fileName.endsWith('.ts') ? 'typescript' :
                     fileName.endsWith('.jsx') ? 'jsx' :
                     fileName.endsWith('.tsx') ? 'tsx' : 'unknown';

    const result = await runPythonAsync(parserCode, { content, filename: fileName, language });
    return JSON.parse(result);
  };

  const classifyDomain = async (fileName: string, content: string, parsedData: any): Promise<string[]> => {
    if (!pyodide) return ['unknown'];

    const classifierCode = `
import json
import re

def classify_domain(filename, content, parsed_data):
    domains = []
    text = (filename + " " + content[:5000]).lower()

    domain_keywords = {
        'human_design': ['human design', 'bodygraph', 'gate', 'channel', 'manifestor', 'generator', 'projector', 'reflector', 'authority', 'strategy'],
        'i_ching': ['i ching', 'hexagram', 'trigram', 'yijing', 'zhouyi', 'changing line'],
        'astrology': ['astrology', 'natal', 'transit', 'planet', 'house', 'aspect', 'zodiac', 'horoscope'],
        'psychology': ['psychology', 'cognitive', 'behavior', 'archetype', 'jung', 'freud', 'personality', 'trauma'],
        'systems_theory': ['system', 'complexity', 'emergence', 'feedback', 'network', 'chaos', 'fractal', 'holon'],
        'economics': ['economics', 'market', 'business', 'revenue', 'profit', 'investment', 'trade', 'currency'],
        'mythology': ['myth', 'legend', 'archetype', 'hero', 'journey', 'campbell', 'propp', 'levi-strauss'],
        'agent_logic': ['agent', 'autonomous', 'llm', 'ai', 'neural', 'model', 'inference', 'prompt'],
        'infrastructure': ['server', 'database', 'api', 'docker', 'kubernetes', 'cloud', 'deploy', 'infra'],
        'ui_component': ['component', 'react', 'vue', 'angular', 'css', 'html', 'ui', 'interface', 'design'],
        'knowledge_base': ['knowledge', 'ontology', 'taxonomy', 'schema', 'entity', 'relation', 'graph'],
        'research_data': ['research', 'study', 'experiment', 'hypothesis', 'data', 'analysis', 'correlation'],
        'symbolic_model': ['symbolic', 'computation', 'model', 'simulation', 'algorithm', 'mathematical', 'pattern']
    }

    for domain, keywords in domain_keywords.items():
        if any(kw in text for kw in keywords):
            domains.append(domain)

    if not domains:
        domains.append('general')

    return json.dumps(domains)

classify_domain(filename, content, parsed_data)
    `;

    const result = await runPythonAsync(classifierCode, {
      filename: fileName,
      content: content.substring(0, 5000),
      parsed_data: JSON.stringify(parsedData || {})
    });

    return JSON.parse(result);
  };

  const processFile = async (file: File): Promise<FileNode> => {
    const id = uuidv4();
    const fileType = await detectFileType(file);
    let content = '';
    let parsedData = null;
    let domainTags: string[] = [];
    let size = file.size;

    if (fileType === 'code' || fileType === 'data' || fileType === 'markup' || fileType === 'config') {
      content = await file.text();
      parsedData = await parseCodeFile(content, file.name, fileType);
      domainTags = await classifyDomain(file.name, content, parsedData);
    } else if (fileType === 'archive') {
      const zip = await JSZip.loadAsync(file);
      const archiveContents: any[] = [];
      for (const [path, zipEntry] of Object.entries(zip.files)) {
        if (!zipEntry.dir) {
          archiveContents.push({ path, size: zipEntry._data?.uncompressedSize || 0 });
        }
      }
      content = JSON.stringify(archiveContents);
      domainTags = ['archive', 'multi_file'];
    } else if (fileType === 'image') {
      content = 'image_data';
      domainTags = ['visual', 'media'];
    } else if (fileType === 'media') {
      content = 'media_data';
      domainTags = ['audio_video', 'media'];
    } else if (fileType === 'document') {
      content = await file.text();
      domainTags = ['document', 'text'];
    }

    const filePath = `${user?.id || 'anonymous'}/${id}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) console.error('Upload error:', uploadError);

    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const fileNode: FileNode = {
      id, name: file.name, path: filePath, type: fileType,
      format: file.name.split('.').pop() || 'unknown', size, hash,
      created_at: new Date().toISOString(),
      modified_at: new Date(file.lastModified).toISOString(),
      ingested_at: new Date().toISOString(),
      content_summary: content.substring(0, 1000),
      ast_signature: parsedData ? JSON.stringify(parsedData) : null,
      dependency_count: parsedData?.imports?.length || 0,
      dependent_count: 0,
      domain_tags: domainTags,
      purpose_tags: [],
      confidence_score: 0.8,
      origin_state_id: null,
      owner_agent_id: user?.id || null,
      visibility: 'private',
      raw_content: content.substring(0, 10000),
      parsed_data: parsedData,
      storage_path: uploadData?.path || null,
    };

    return fileNode;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsProcessing(true);
    setFiles(acceptedFiles);
    const results: FileNode[] = [];
    const totalFiles = acceptedFiles.length;

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      onProgress?.((i / totalFiles) * 100, `Processing ${file.name}...`);
      try {
        const node = await processFile(file);
        results.push(node);
        await supabase.from('mesh_nodes').insert({
          id: node.id, type: 'file_node', subtype: node.type,
          name: node.name, properties: node,
          created_at: node.ingested_at, owner_id: user?.id,
        });
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
      }
    }

    onProgress?.(100, 'Complete');
    onIngestComplete?.({
      totalFiles: acceptedFiles.length,
      processedFiles: results.length,
      failedFiles: acceptedFiles.length - results.length,
      nodes: results, timestamp: new Date().toISOString(),
    });
    setIsProcessing(false);
  }, [pyodide, supabase, user, onIngestComplete, onProgress]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true,
    disabled: isProcessing || !pyodide,
  });

  return (
    <div className="w-full">
      <div {...getRootProps()} className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragActive ? 'border-aion-pulse bg-aion-pulse/10' : 'border-aion-resonance bg-aion-matter'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-aion-pulse hover:bg-aion-pulse/5'}
      `}>
        <input {...getInputProps()} />
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin w-12 h-12 border-4 border-aion-pulse border-t-transparent rounded-full mx-auto" />
            <p className="text-aion-light/70">Ingesting {files.length} files into the mesh...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-aion-resonance rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-aion-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-lg text-aion-light font-medium">
              {isDragActive ? 'Drop files to ingest into AION' : 'Drag & drop files here, or click to select'}
            </p>
            <p className="text-sm text-aion-light/50">
              Supports: JS, JSX, TS, TSX, PY, RS, ZIP, JSON, XML, MP3, MP4, PNG, JPG, PDF, and 50+ more formats
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

"""
AION File Parser Engine
Runs in Pyodide browser environment
Parses all file types, extracts structure, maps dependencies
"""

import ast
import json
import re
import os
from typing import Dict, List, Any
import xml.etree.ElementTree as ET

class FileParser:
    def __init__(self):
        self.parsers = {
            '.py': self.parse_python, '.js': self.parse_javascript, '.jsx': self.parse_javascript,
            '.ts': self.parse_typescript, '.tsx': self.parse_typescript, '.json': self.parse_json,
            '.xml': self.parse_xml, '.yaml': self.parse_yaml, '.yml': self.parse_yaml,
            '.csv': self.parse_csv, '.html': self.parse_html, '.md': self.parse_markdown,
            '.sql': self.parse_sql, '.graphql': self.parse_graphql, '.rs': self.parse_rust,
            '.java': self.parse_java, '.cpp': self.parse_cpp, '.c': self.parse_c,
            '.go': self.parse_go, '.rb': self.parse_ruby, '.php': self.parse_php,
            '.swift': self.parse_swift, '.kt': self.parse_kotlin,
        }

    def parse_file(self, content: str, filename: str) -> Dict[str, Any]:
        ext = os.path.splitext(filename)[1].lower()
        parser = self.parsers.get(ext, self.parse_generic)
        try:
            result = parser(content, filename)
            result['parser'] = parser.__name__
            result['success'] = True
        except Exception as e:
            result = {
                'parser': parser.__name__,
                'success': False,
                'error': str(e),
                'content_preview': content[:1000]
            }
        result['filename'] = filename
        result['extension'] = ext
        result['size'] = len(content)
        result['line_count'] = content.count('\n') + 1
        return result

    def parse_python(self, content: str, filename: str) -> Dict[str, Any]:
        tree = ast.parse(content)
        imports, functions, classes, variables, comments = [], [], [], [], []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append({'name': alias.name, 'as': alias.asname})
            elif isinstance(node, ast.ImportFrom):
                imports.append({'module': node.module, 'names': [{'name': a.name, 'as': a.asname} for a in node.names]})
            elif isinstance(node, ast.FunctionDef):
                functions.append({'name': node.name, 'args': [a.arg for a in node.args.args], 'line': node.lineno, 'docstring': ast.get_docstring(node)})
            elif isinstance(node, ast.ClassDef):
                classes.append({'name': node.name, 'bases': [self._get_name(b) for b in node.bases], 'methods': [n.name for n in node.body if isinstance(n, ast.FunctionDef)], 'line': node.lineno, 'docstring': ast.get_docstring(node)})
            elif isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        variables.append({'name': target.id, 'line': node.lineno})
        comments = re.findall(r'#(.*)', content)
        complexity = sum(1 for node in ast.walk(tree) if isinstance(node, (ast.If, ast.For, ast.While, ast.With)))
        return {'language': 'python', 'imports': imports, 'exports': [], 'functions': functions, 'classes': classes, 'variables': variables, 'comments': comments[:50], 'complexity': complexity, 'docstrings': [f['docstring'] for f in functions if f['docstring']] + [c['docstring'] for c in classes if c['docstring']]}

    def parse_javascript(self, content: str, filename: str) -> Dict[str, Any]:
        imports = re.findall(r"import\s+.*?\s+from\s+['\"]([^'\"]+)['\"]", content) + re.findall(r"require\(['"]([^'"]+)['"]\)", content)
        exports = re.findall(r"export\s+(?:default\s+)?(?:class|function|const|let|var)\s+(\w+)", content) + re.findall(r"export\s*\{([^}]+)\}", content)
        functions = [{'name': m} for m in re.findall(r"(?:function|const|let|var)\s+(\w+)\s*[=\(]", content)]
        classes = [{'name': m[0], 'extends': m[1] if m[1] else None} for m in re.findall(r"class\s+(\w+)(?:\s+extends\s+(\w+))?(?:\s*\{)", content)]
        components = list(set(re.findall(r"<([A-Z]\w+)", content)))
        return {'language': 'javascript', 'imports': imports, 'exports': exports, 'functions': functions, 'classes': classes, 'jsx_components': components, 'hooks': re.findall(r"use[A-Z]\w+", content)}

    def parse_typescript(self, content: str, filename: str) -> Dict[str, Any]:
        js_result = self.parse_javascript(content, filename)
        types = re.findall(r"(?:type|interface)\s+(\w+)", content)
        generics = re.findall(r"<([A-Z]\w+)>", content)
        js_result['language'] = 'typescript'
        js_result['types'] = types
        js_result['generics'] = generics
        js_result['type_annotations'] = len(re.findall(r":\s+\w+", content))
        return js_result

    def parse_json(self, content: str, filename: str) -> Dict[str, Any]:
        try:
            data = json.loads(content)
            return {'language': 'json', 'structure': self._analyze_json_structure(data), 'keys': self._extract_keys(data), 'depth': self._json_depth(data)}
        except json.JSONDecodeError as e:
            return {'language': 'json', 'error': str(e), 'valid': False}

    def parse_xml(self, content: str, filename: str) -> Dict[str, Any]:
        try:
            root = ET.fromstring(content)
            return {'language': 'xml', 'root_tag': root.tag, 'tags': list(set(elem.tag for elem in root.iter())), 'attributes': [{elem.tag: elem.attrib} for elem in root.iter() if elem.attrib], 'depth': self._xml_depth(root)}
        except ET.ParseError as e:
            return {'language': 'xml', 'error': str(e)}

    def parse_yaml(self, content: str, filename: str) -> Dict[str, Any]:
        lines = content.split('\n')
        keys = [re.match(r"^(\w+):", line.strip()).group(1) for line in lines if re.match(r"^(\w+):", line.strip())]
        return {'language': 'yaml', 'keys': keys, 'sections': [k for k in keys if not k.startswith('_')]}

    def parse_csv(self, content: str, filename: str) -> Dict[str, Any]:
        lines = content.strip().split('\n')
        if not lines: return {'language': 'csv', 'error': 'Empty file'}
        headers = lines[0].split(',')
        return {'language': 'csv', 'headers': headers, 'row_count': len(lines) - 1, 'column_count': len(headers)}

    def parse_html(self, content: str, filename: str) -> Dict[str, Any]:
        tags = re.findall(r"<(\w+)", content)
        classes = list(set(sum([c.split() for c in re.findall(r'class=["']([^"']+)["']', content)], [])))
        ids = list(set(re.findall(r'id=["']([^"']+)["']', content)))
        return {'language': 'html', 'tags': list(set(tags)), 'classes': classes, 'ids': ids, 'scripts': len(re.findall(r'<script', content)), 'stylesheets': len(re.findall(r'<link[^>]*stylesheet', content))}

    def parse_markdown(self, content: str, filename: str) -> Dict[str, Any]:
        headers = [{'level': len(h[0]), 'text': h[1]} for h in re.findall(r"^(#{1,6})\s+(.+)$", content, re.MULTILINE)]
        links = [{'text': l[0], 'url': l[1]} for l in re.findall(r"\[([^\]]+)\]\(([^)]+)\)", content)]
        code_blocks = re.findall(r"```(\w+)?", content)
        return {'language': 'markdown', 'headers': headers, 'links': links, 'code_blocks': code_blocks, 'word_count': len(content.split())}

    def parse_sql(self, content: str, filename: str) -> Dict[str, Any]:
        tables = re.findall(r"CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)", content, re.IGNORECASE)
        queries = re.findall(r"(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\s+", content, re.IGNORECASE)
        return {'language': 'sql', 'tables': tables, 'query_types': list(set(q.upper() for q in queries))}

    def parse_graphql(self, content: str, filename: str) -> Dict[str, Any]:
        types = re.findall(r"type\s+(\w+)", content)
        queries = re.findall(r"Query\s*\{([^}]+)\}", content)
        mutations = re.findall(r"Mutation\s*\{([^}]+)\}", content)
        return {'language': 'graphql', 'types': types, 'queries': queries, 'mutations': mutations}

    def parse_rust(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'rust', 'imports': re.findall(r"use\s+([^;]+);", content), 'structs': re.findall(r"struct\s+(\w+)", content), 'enums': re.findall(r"enum\s+(\w+)", content), 'implementations': re.findall(r"impl\s+(?:<[^>]+>\s+)?(\w+)", content), 'functions': re.findall(r"fn\s+(\w+)", content)}

    def parse_java(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'java', 'imports': re.findall(r"import\s+([^;]+);", content), 'classes': re.findall(r"class\s+(\w+)", content), 'interfaces': re.findall(r"interface\s+(\w+)", content), 'methods': re.findall(r"(?:public|private|protected)\s+\w+\s+(\w+)\s*\(", content)}

    def parse_cpp(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'cpp', 'includes': re.findall(r"#include\s+[<"]([^>"]+)[>"]", content), 'classes': re.findall(r"class\s+(\w+)", content), 'functions': re.findall(r"\w+\s+(\w+)\s*\([^)]*\)\s*\{", content)}

    def parse_c(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'c', 'includes': re.findall(r"#include\s+[<"]([^>"]+)[>"]", content), 'functions': re.findall(r"\w+\s+(\w+)\s*\([^)]*\)\s*\{", content), 'structs': re.findall(r"struct\s+(\w+)", content)}

    def parse_go(self, content: str, filename: str) -> Dict[str, Any]:
        imports_block = re.findall(r"import\s*\(([^)]+)\)", content, re.DOTALL)
        imports = re.findall(r'"([^"]+)"', imports_block[0] if imports_block else '')
        return {'language': 'go', 'imports': imports, 'functions': re.findall(r"func\s+(?:\([^)]+\)\s+)?(\w+)", content), 'structs': re.findall(r"type\s+(\w+)\s+struct", content)}

    def parse_ruby(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'ruby', 'requires': re.findall(r"require\s+['"]([^'"]+)['"]", content), 'classes': re.findall(r"class\s+(\w+)", content), 'modules': re.findall(r"module\s+(\w+)", content), 'methods': re.findall(r"def\s+(\w+)", content)}

    def parse_php(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'php', 'includes': re.findall(r"(?:include|require)(?:_once)?\s*\(?['"]([^'"]+)['"]", content), 'classes': re.findall(r"class\s+(\w+)", content), 'functions': re.findall(r"function\s+(\w+)", content)}

    def parse_swift(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'swift', 'imports': re.findall(r"import\s+(\w+)", content), 'classes': re.findall(r"class\s+(\w+)", content), 'structs': re.findall(r"struct\s+(\w+)", content), 'functions': re.findall(r"func\s+(\w+)", content)}

    def parse_kotlin(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'kotlin', 'imports': re.findall(r"import\s+([^;]+)", content), 'classes': re.findall(r"class\s+(\w+)", content), 'functions': re.findall(r"fun\s+(\w+)", content)}

    def parse_generic(self, content: str, filename: str) -> Dict[str, Any]:
        return {'language': 'unknown', 'content_preview': content[:500], 'word_count': len(content.split())}

    def _get_name(self, node) -> str:
        if isinstance(node, ast.Name): return node.id
        elif isinstance(node, ast.Attribute): return f"{self._get_name(node.value)}.{node.attr}"
        return str(node)

    def _analyze_json_structure(self, data: Any, path: str = '') -> Dict:
        if isinstance(data, dict): return {k: self._analyze_json_structure(v, f"{path}.{k}") for k, v in data.items()}
        elif isinstance(data, list): return [self._analyze_json_structure(item, f"{path}[]") for item in data[:5]]
        else: return type(data).__name__

    def _extract_keys(self, data: Any, keys: List[str] = None) -> List[str]:
        if keys is None: keys = []
        if isinstance(data, dict):
            for k, v in data.items():
                keys.append(k); self._extract_keys(v, keys)
        elif isinstance(data, list):
            for item in data: self._extract_keys(item, keys)
        return list(set(keys))

    def _json_depth(self, data: Any) -> int:
        if isinstance(data, dict): return 1 + max((self._json_depth(v) for v in data.values()), default=0)
        elif isinstance(data, list): return 1 + max((self._json_depth(item) for item in data), default=0)
        return 0

    def _xml_depth(self, element) -> int:
        return 1 + max((self._xml_depth(child) for child in element), default=0)


def classify_domain(filename: str, content: str, parsed_data: Dict) -> List[str]:
    text = (filename + " " + content[:5000]).lower()
    domains = []
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
    if not domains: domains.append('general')
    return domains


def find_relationships(node_id: str, parsed_data: Dict, all_nodes: List[Dict]) -> List[Dict]:
    relationships = []
    imports = parsed_data.get('imports', [])
    for other in all_nodes:
        if other['id'] == node_id: continue
        other_name = other.get('properties', {}).get('name', '')
        for imp in imports:
            imp_name = imp.get('name', '') if isinstance(imp, dict) else imp
            if imp_name in other_name or other_name in imp_name:
                relationships.append({'source_id': node_id, 'target_id': other['id'], 'type': 'imports', 'weight': 1.0, 'details': {'import_name': imp_name}})
        my_domains = parsed_data.get('domain_tags', [])
        other_domains = other.get('properties', {}).get('domain_tags', [])
        shared = set(my_domains) & set(other_domains)
        if shared:
            relationships.append({'source_id': node_id, 'target_id': other['id'], 'type': 'shares_domain', 'weight': len(shared) * 0.3, 'details': {'shared_domains': list(shared)}})
    return relationships


__all__ = ['FileParser', 'classify_domain', 'find_relationships']

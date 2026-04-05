export type NodeType =
  | 'building'
  | 'component'
  | 'material'
  | 'technique'
  | 'person'
  | 'document'
  | 'location'
  | 'dynasty'
  | 'term'
  | 'concept';

export type EdgeType =
  | 'contains'
  | 'uses'
  | 'located_in'
  | 'built_by'
  | 'describes'
  | 'related_to'
  | 'evolved_from'
  | 'part_of'
  | 'created_in';

export interface KnowledgeNode {
  id: string;
  label: string;
  type: NodeType;
  properties: Record<string, unknown>;
  description?: string;
  x?: number;
  y?: number;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: EdgeType;
  properties?: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
}

export type DocumentCategory =
  | 'official'
  | 'local'
  | 'private'
  | 'inscription'
  | 'drawing';

export interface DocumentMetadata {
  source?: string;
  volume?: string;
  page?: string;
  preservation?: string;
  digitizedAt?: string;
  filename?: string;
}

export type AnnotationType =
  | 'term'
  | 'person'
  | 'place'
  | 'component'
  | 'technique'
  | 'translation';

export interface Annotation {
  id: string;
  start: number;
  end: number;
  text: string;
  type: AnnotationType;
  explanation: string;
  relatedNodes?: string[];
}

export interface Document {
  id: string;
  title: string;
  originalTitle?: string;
  author?: string;
  dynasty?: string;
  category: DocumentCategory;
  content: string;
  summary?: string;
  annotations?: Annotation[];
  relatedNodes?: string[];
  metadata: DocumentMetadata;
}

export interface SearchFilter {
  categories?: DocumentCategory[];
  dynasties?: string[];
  nodeTypes?: NodeType[];
}

export interface SearchQuery {
  keyword: string;
  filters?: SearchFilter;
  page?: number;
  pageSize?: number;
}

export interface SearchResult {
  documents: Document[];
  nodes: KnowledgeNode[];
  total: number;
  suggestions?: string[];
}

export interface TranslationResult {
  original: string;
  modern: string;
  annotations?: Array<{
    original: string;
    explanation: string;
  }>;
}

export interface EntityExtractionResult {
  text: string;
  type: NodeType;
  confidence: number;
  context: string;
}

export interface RelationExtractionResult {
  source: string;
  target: string;
  relation: string;
  confidence: number;
}

export interface AIAnalysis {
  documentId: string;
  translation?: TranslationResult;
  entities?: EntityExtractionResult[];
  relations?: RelationExtractionResult[];
  summary?: string;
}

export type UserRole = 'student' | 'scholar' | 'conservator' | 'admin';

export interface LLMConfig {
  provider: 'aliyun' | 'zhipu' | 'deepseek';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface UserNote {
  id: string;
  documentId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bookmarks?: string[];
  notes?: UserNote[];
  searchHistory?: string[];
  llmConfig: LLMConfig;
}

export type HistoryItemType = 'document' | 'search' | 'analysis' | 'report';

export interface HistoryItem {
  id: string;
  type: HistoryItemType;
  title: string;
  description?: string;
  documentId?: string;
  query?: string;
  createdAt: string;
}

export type BookmarkItemType = 'document' | 'node';

export interface BookmarkItem {
  id: string;
  type: BookmarkItemType;
  title: string;
  description?: string;
  documentId?: string;
  nodeId?: string;
  createdAt: string;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  content?: string;
  error?: string;
}

export interface RAGResult {
  answer: string;
  sources: {
    documentId: string;
    page: number;
    text: string;
    score: number;
  }[];
  entities: KnowledgeNode[];
  confidence: number;
}

export interface ReportConfig {
  topic: string;
  length: 'short' | 'medium' | 'long';
  includeGraph: boolean;
  includeCitations: boolean;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  topics: string[];
  citations: {
    documentId: string;
    page: number;
    text: string;
  }[];
  graphs: KnowledgeGraph[];
  createdAt: string;
}

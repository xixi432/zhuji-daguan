import type {
  AIAnalysis,
  Document,
  KnowledgeGraph,
  KnowledgeNode,
  KnowledgeEdge,
  NodeType,
} from '@/types';

export const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    title: '营造法式·大木作制度',
    originalTitle: '營造法式·大木作制度',
    author: '李诫',
    dynasty: '北宋',
    category: 'official',
    content:
      '凡构屋之制，皆以材为祖。材有八等，度屋之大小，因而用之。凡梁之大小，各随其广分为三分，以二分为厚。凡柱之制，随其曲直，施之如直。',
    summary: '北宋建筑制度文献，重点记录大木构架、材分和尺度规范。',
    annotations: [
      {
        id: 'anno-1',
        start: 11,
        end: 12,
        text: '材',
        type: 'term',
        explanation: '宋代建筑模数单位，用于统一木构尺度。',
      },
    ],
    metadata: {
      source: '《营造法式》卷四',
      preservation: '国家图书馆藏本',
      digitizedAt: '2026-03-20',
    },
  },
  {
    id: 'doc-002',
    title: '广东新语·宫室',
    originalTitle: '廣東新語·宮室',
    author: '屈大均',
    dynasty: '清代',
    category: 'local',
    content:
      '岭南之宅，多为镬耳屋。镬耳者，形如覆镬之耳，取其防火之意。窗多满洲窗，以通风采光。宗祠之制，前为大门，中为享堂，后为寝室。',
    summary: '清代岭南建筑风貌记述，涉及镬耳屋、满洲窗与宗祠格局。',
    annotations: [
      {
        id: 'anno-2',
        start: 9,
        end: 12,
        text: '镬耳屋',
        type: 'component',
        explanation: '岭南民居常见的山墙形式，兼具防火与排水意味。',
      },
    ],
    metadata: {
      source: '《广东新语》卷十七',
      preservation: '清刻本',
      digitizedAt: '2026-03-21',
    },
  },
  {
    id: 'doc-003',
    title: '佛山忠义乡志·祖庙',
    author: '吴荣光',
    dynasty: '清代',
    category: 'local',
    content:
      '祖庙在佛山镇中心，殿宇重檐，木雕、砖雕、灰塑俱备。其斗拱层叠，屋脊多陶塑双龙，兼具礼制、装饰与结构价值。',
    summary: '佛山祖庙建筑形制与装饰工艺的地方志记载。',
    metadata: {
      source: '《佛山忠义乡志》卷六',
      preservation: '道光刻本',
      digitizedAt: '2026-03-22',
    },
  },
];

export const mockNodes: KnowledgeNode[] = [
  {
    id: 'building-1',
    label: '镬耳屋',
    type: 'building',
    description: '岭南地区典型民居类型，常见于广府地区。',
    properties: { dynasty: '清代', region: '岭南' },
  },
  {
    id: 'component-1',
    label: '满洲窗',
    type: 'component',
    description: '兼具采光与通风功能的彩色木窗。',
    properties: { material: '木、彩色玻璃' },
  },
  {
    id: 'component-2',
    label: '斗拱',
    type: 'component',
    description: '中国传统木构建筑的重要承重构件。',
    properties: { function: '承重、出檐' },
  },
  {
    id: 'technique-1',
    label: '灰塑',
    type: 'technique',
    description: '岭南常见建筑装饰工艺。',
    properties: { region: '广府' },
  },
  {
    id: 'person-1',
    label: '屈大均',
    type: 'person',
    description: '清代学者，《广东新语》作者。',
    properties: { dynasty: '清代' },
  },
  {
    id: 'document-1',
    label: '广东新语·宫室',
    type: 'document',
    description: '记述岭南建筑风貌的地方文献。',
    properties: { author: '屈大均' },
  },
];

export const mockEdges: KnowledgeEdge[] = [
  {
    id: 'edge-1',
    source: 'person-1',
    target: 'document-1',
    label: '著有',
    type: 'describes',
  },
  {
    id: 'edge-2',
    source: 'document-1',
    target: 'building-1',
    label: '记述',
    type: 'describes',
  },
  {
    id: 'edge-3',
    source: 'building-1',
    target: 'component-1',
    label: '设有',
    type: 'contains',
  },
  {
    id: 'edge-4',
    source: 'building-1',
    target: 'technique-1',
    label: '常见装饰',
    type: 'related_to',
  },
  {
    id: 'edge-5',
    source: 'document-1',
    target: 'component-1',
    label: '提及',
    type: 'describes',
  },
  {
    id: 'edge-6',
    source: 'component-2',
    target: 'technique-1',
    label: '协同表现',
    type: 'related_to',
  },
];

export const mockKnowledgeGraph: KnowledgeGraph = {
  nodes: mockNodes,
  edges: mockEdges,
};

export const mockAIAnalysis: Record<string, AIAnalysis> = {
  'doc-001': {
    documentId: 'doc-001',
    translation: {
      original: '凡构屋之制，皆以材为祖。',
      modern: '建造房屋时，一切尺度都以“材”这个模数作为基本依据。',
      annotations: [{ original: '材', explanation: '宋代建筑模数单位。' }],
    },
    entities: [
      { text: '材', type: 'term', confidence: 0.97, context: '建筑模数单位' },
      { text: '梁', type: 'component', confidence: 0.9, context: '大木构件' },
    ],
    relations: [{ source: '材', target: '梁', relation: '规范尺寸', confidence: 0.89 }],
    summary: '文本讨论了北宋建筑中的材分制度和大木构件尺度逻辑。',
  },
  'doc-002': {
    documentId: 'doc-002',
    translation: {
      original: '岭南之宅，多为镬耳屋。',
      modern: '岭南地区的住宅，多采用镬耳屋这一形式。',
    },
    entities: [
      { text: '镬耳屋', type: 'building', confidence: 0.98, context: '岭南民居' },
      { text: '满洲窗', type: 'component', confidence: 0.93, context: '采光通风构件' },
    ],
    relations: [
      { source: '镬耳屋', target: '满洲窗', relation: '设有', confidence: 0.9 },
    ],
    summary: '文本重点概括了清代岭南住宅的外观形制与空间组织。',
  },
};

export const nodeTypeColors: Record<NodeType, string> = {
  building: '#d1864a',
  component: '#5d8aa8',
  material: '#7a9e7e',
  technique: '#9b8aa5',
  person: '#c17c74',
  document: '#8b7355',
  location: '#6b8e9f',
  dynasty: '#a67c52',
  term: '#7d8b8c',
  concept: '#9a8a7a',
};

export const nodeTypeLabels: Record<NodeType, string> = {
  building: '建筑',
  component: '构件',
  material: '材料',
  technique: '技法',
  person: '人物',
  document: '文献',
  location: '地点',
  dynasty: '朝代',
  term: '术语',
  concept: '概念',
};

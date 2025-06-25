// =============================================================================
// 🧠 Zauri RAG-DAG 지식 그래프 시스템
// =============================================================================

export interface KnowledgeNode {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  connections: string[];
  relevanceScore: number;
}

export class RAGDAGSystem {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private vectorIndex: Map<string, number[]> = new Map();

  addKnowledgeNode(content: string, metadata: Record<string, any>): string {
    const nodeId = crypto.randomUUID();
    const embedding = this.generateEmbedding(content);
    
    const node: KnowledgeNode = {
      id: nodeId,
      content,
      embedding,
      metadata,
      connections: [],
      relevanceScore: 0
    };

    this.nodes.set(nodeId, node);
    this.vectorIndex.set(nodeId, embedding);
    this.updateConnections(nodeId);
    
    return nodeId;
  }

  private generateEmbedding(text: string): number[] {
    // 실제 환경에서는 OpenAI Embeddings API 또는 로컬 임베딩 모델 사용
    const words = text.toLowerCase().split(' ');
    const embedding = new Array(768).fill(0);
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 768] += 1 / (index + 1);
    });
    
    return this.normalizeVector(embedding);
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  private updateConnections(nodeId: string): void {
    const targetNode = this.nodes.get(nodeId);
    if (!targetNode) return;

    this.nodes.forEach((node, id) => {
      if (id === nodeId) return;
      
      const similarity = this.cosineSimilarity(targetNode.embedding, node.embedding);
      if (similarity > 0.7) {
        targetNode.connections.push(id);
        node.connections.push(nodeId);
      }
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
  }

  searchSimilarNodes(query: string, limit: number = 5): KnowledgeNode[] {
    const queryEmbedding = this.generateEmbedding(query);
    const similarities: Array<{ node: KnowledgeNode; score: number }> = [];

    this.nodes.forEach(node => {
      const score = this.cosineSimilarity(queryEmbedding, node.embedding);
      similarities.push({ node, score });
    });

    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => ({ ...item.node, relevanceScore: item.score }));
  }

  getNodeGraph(nodeId: string, depth: number = 2): KnowledgeNode[] {
    const visited = new Set<string>();
    const result: KnowledgeNode[] = [];
    
    const traverse = (id: string, currentDepth: number) => {
      if (currentDepth > depth || visited.has(id)) return;
      
      visited.add(id);
      const node = this.nodes.get(id);
      if (node) {
        result.push(node);
        node.connections.forEach(connId => traverse(connId, currentDepth + 1));
      }
    };

    traverse(nodeId, 0);
    return result;
  }
}

export const ragDagSystem = new RAGDAGSystem();

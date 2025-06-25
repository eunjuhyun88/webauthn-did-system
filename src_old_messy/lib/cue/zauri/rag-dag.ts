// =============================================================================
// 🧠 Zauri RAG-DAG 지식 그래프 엔진
// =============================================================================

import { KnowledgeNode } from '@/types/zauri';

export class RAGDAGEngine {
  private nodes: Map<string, KnowledgeNode> = new Map();

  addKnowledgeNode(content: string, metadata: Record<string, any>): string {
    const nodeId = crypto.randomUUID();
    const embedding = this.generateEmbedding(content);
    
    const node: KnowledgeNode = {
      id: nodeId,
      content,
      embedding,
      metadata: {
        ...metadata,
        timestamp: new Date(),
        source: 'zauri-system'
      },
      connections: [],
      relevanceScore: 0
    };

    this.nodes.set(nodeId, node);
    this.updateConnections(nodeId);
    
    return nodeId;
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

  private generateEmbedding(text: string): number[] {
    // 실제 환경에서는 OpenAI Embeddings API 사용
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

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    
    return magnitudeA && magnitudeB ? dotProduct / (magnitudeA * magnitudeB) : 0;
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
}

export const ragDagEngine = new RAGDAGEngine();

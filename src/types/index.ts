/**
 * ICT-Check Types
 *
 * TypeScript type definitions for the ICT contract analysis tool.
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 * @version 1.1.0
 */

// =============================================================================
// REQUIREMENT TYPES
// =============================================================================

export type Criticality = 'CRITICAL' | 'MAJOR' | 'MINOR';

export interface Requirement {
  id: string;
  section: string;
  name: string;
  reference: string;
  description: string;
  criticality: Criticality;
  keywords: string[];
  regulatoryText: string;
}

// =============================================================================
// ANALYSIS RESULT TYPES
// =============================================================================

export type AnalysisStatus = 'COMPLIANT' | 'PARTIAL' | 'IMPLICIT' | 'ABSENT' | 'NA';

export interface AnalysisResultItem {
  requirementId: string;
  status: AnalysisStatus;
  comment: string;
  foundClause?: string;
}

export interface RecommendedClause {
  title: string;
  reference: string;
  textFr: string;
  textEn: string;
}

export interface ContractAnalysis {
  fileName: string;
  date: string;
  score: number;
  items: AnalysisResultItem[];
  generalClauses: string[];
  executiveSummary: string;
  recommendedClauses: RecommendedClause[];
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

export interface AnalysisRequest {
  content: string;
  fileName?: string;
  language?: 'fr' | 'en';
}

// Frontend-compatible response format
export type FrontendStatus = 'compliant' | 'partial' | 'non-compliant' | 'implicit';

export interface FrontendFinding {
  requirement: string;
  status: FrontendStatus;
  details: string;
  recommendation?: string;
}

export interface FrontendResponse {
  overallScore: number;
  summary: string;
  findings: FrontendFinding[];
}

// =============================================================================
// STREAMING TYPES
// =============================================================================

/** Event types for streaming analysis */
export type StreamEventType =
  | 'start'
  | 'chunk'
  | 'progress'
  | 'complete'
  | 'error';

/** Base streaming event */
export interface StreamEventBase {
  type: StreamEventType;
  timestamp: number;
}

/** Start event - analysis has begun */
export interface StreamEventStart extends StreamEventBase {
  type: 'start';
  fileName: string;
  provider: string;
}

/** Chunk event - partial text received */
export interface StreamEventChunk extends StreamEventBase {
  type: 'chunk';
  content: string;
  accumulated: string;
}

/** Progress event - analysis milestone reached */
export interface StreamEventProgress extends StreamEventBase {
  type: 'progress';
  phase: 'parsing' | 'analyzing' | 'generating';
  message: string;
  percent?: number;
}

/** Complete event - analysis finished */
export interface StreamEventComplete extends StreamEventBase {
  type: 'complete';
  result: FrontendResponse;
  rawResult?: ContractAnalysis;
}

/** Error event - something went wrong */
export interface StreamEventError extends StreamEventBase {
  type: 'error';
  error: string;
  code?: string;
}

/** Union type for all stream events */
export type StreamEvent =
  | StreamEventStart
  | StreamEventChunk
  | StreamEventProgress
  | StreamEventComplete
  | StreamEventError;

/** Callback for receiving stream events */
export type StreamCallback = (event: StreamEvent) => void;

/** Options for streaming analysis */
export interface StreamAnalyzeOptions {
  /** AI provider to use */
  provider: 'anthropic' | 'gemini' | 'openai';
  /** API key for the selected provider */
  apiKey: string;
  /** Optional model override */
  model?: string;
  /** Optional file name for the report */
  fileName?: string;
  /** Callback for stream events */
  onEvent?: StreamCallback;
  /** Include raw result in complete event */
  includeRaw?: boolean;
}

// =============================================================================
// ANALYSIS OPTIONS TYPE
// =============================================================================

/** AI provider options */
export type AIProvider = 'anthropic' | 'gemini' | 'openai';

/** Options for standard (non-streaming) analysis */
export interface AnalyzeOptions {
  /** AI provider to use */
  provider: AIProvider;
  /** API key for the selected provider */
  apiKey: string;
  /** Optional model override */
  model?: string;
  /** Optional file name for the report */
  fileName?: string;
}

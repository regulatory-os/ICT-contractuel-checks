/**
 * ICT-Check Types v3.0
 *
 * TypeScript type definitions for the ICT contract analysis tool.
 * Based on DORA Article 30, EBA Guidelines (EBA/GL/2019/02),
 * and French Arrêté du 3 novembre 2014.
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 * @version 2.0.0
 */

// =============================================================================
// REQUIREMENT TYPES
// =============================================================================

/** Requirement criticality level for score weighting */
export type Criticality = 'CRITICAL' | 'MAJOR' | 'MINOR';

/** Section of the checklist */
export type Section = 'I' | 'II' | 'III' | 'IV';

/** Applicability rules for requirements */
export type Applicability = 'ALL' | 'CRITICAL_FUNCTIONS' | 'EBA_ONLY' | 'FR_ONLY';

/** Regulatory source texts */
export interface RegulatoryText {
  dora?: string;
  eba?: string;
  fr?: string;
}

/** Keywords for requirement detection */
export interface Keywords {
  fr: string[];
  en: string[];
}

/** Full requirement structure matching v3.0 checklist */
export interface Requirement {
  id: string;
  section: Section;
  sectionName: string;
  name: string;
  reference: string;
  criticality: Criticality;
  applicability: Applicability;
  regulatoryText: RegulatoryText;
  keywords: Keywords;
  verificationCriteria: string;
  notes?: string;
  isNewDORA?: boolean;
  isDORAEnhanced?: boolean;
}

// =============================================================================
// ANALYSIS RESULT TYPES
// =============================================================================

/** Possible statuses for requirement analysis */
export type RequirementStatus = 'COMPLIANT' | 'IMPLICIT' | 'PARTIAL' | 'ABSENT' | 'NA';

/** Individual requirement analysis result */
export interface AnalysisResultItem {
  requirementId: string;
  status: RequirementStatus;
  comment: string;
  foundClause?: string;
}

/** Recommended clause for remediation */
export interface RecommendedClause {
  title: string;
  reference: string;
  textFr: string;
  textEn: string;
}

/** Full contract analysis result */
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

/** Analysis request parameters */
export interface AnalysisRequest {
  content: string;
  fileName?: string;
  language?: 'fr' | 'en';
  isCriticalFunction?: boolean;
}

/** Frontend-compatible status values */
export type FrontendStatus = 'compliant' | 'partial' | 'non-compliant' | 'implicit' | 'not-applicable';

/** Frontend-compatible finding with enriched data */
export interface FrontendFinding {
  requirement: string;
  status: FrontendStatus;
  details: string;
  recommendation?: string;
  foundClause?: string;
  // Enriched data from checklist
  reference?: string;
  criticality?: Criticality;
  section?: Section;
  requirementId?: string;
}

/** Frontend-compatible response */
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
  | 'step'
  | 'batch'
  | 'heartbeat'
  | 'chunk'
  | 'progress'
  | 'done'
  | 'error';

/** Base streaming event */
export interface StreamEventBase {
  type: StreamEventType;
  elapsed?: number;
  timestamp?: number;
}

/** Start event - analysis has begun */
export interface StreamEventStart extends StreamEventBase {
  type: 'start';
  totalSteps: number;
}

/** Step event - indicates progress through sequential steps */
export interface StreamEventStep extends StreamEventBase {
  type: 'step';
  step: number;
  label: string;
}

/** Batch event - indicates progress through a batch of items */
export interface StreamEventBatch extends StreamEventBase {
  type: 'batch';
  current: number;
  total: number;
}

/** Heartbeat event - keeps the connection alive */
export interface StreamEventHeartbeat extends StreamEventBase {
  type: 'heartbeat';
}

/** Chunk event - partial text received (for non-NDJSON streaming) */
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

/** Done event - analysis finished successfully */
export interface StreamEventDone extends StreamEventBase {
  type: 'done';
  data: FrontendResponse;
}

/** Error event - something went wrong */
export interface StreamEventError extends StreamEventBase {
  type: 'error';
  message: string;
  code?: string;
}

/** Union type for all stream events */
export type StreamEvent =
  | StreamEventStart
  | StreamEventStep
  | StreamEventBatch
  | StreamEventHeartbeat
  | StreamEventChunk
  | StreamEventProgress
  | StreamEventDone
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

// =============================================================================
// SCORING TYPES
// =============================================================================

/** Criticality weights for score calculation */
export const CRITICALITY_WEIGHTS: Record<Criticality, number> = {
  CRITICAL: 3,
  MAJOR: 2,
  MINOR: 1,
};

/** Status values for score calculation */
export const STATUS_VALUES: Record<RequirementStatus, number> = {
  COMPLIANT: 100,
  IMPLICIT: 70,
  PARTIAL: 30,
  ABSENT: 0,
  NA: 0, // Excluded from calculation
};

/** Critical requirement IDs that cannot be IMPLICIT */
export const CRITICAL_REQUIREMENT_IDS = ['I.7', 'I.10', 'II.4', 'II.10'];

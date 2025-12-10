/**
 * ICT-Check Types
 *
 * TypeScript type definitions for the ICT contract analysis tool.
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
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

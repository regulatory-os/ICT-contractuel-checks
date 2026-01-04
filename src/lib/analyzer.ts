/**
 * ICT Contract Analyzer v3.1
 *
 * AI-powered analysis of ICT outsourcing contracts for DORA/EBA compliance.
 * Features:
 * - v3.1 scoring algorithm with criticality weighting
 * - Critical requirements validation (I.7, I.10, II.4, II.10 cannot be IMPLICIT)
 * - Truncation recovery for JSON parsing
 * - Auto-recommendation generation
 * - Multi-provider support: Anthropic Claude (preferred), Google Gemini, OpenAI
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 * @version 2.0.0
 */

import { CHECKLIST, getRequirementById } from '../data/checklist';
import {
  ContractAnalysis,
  AnalysisResultItem,
  FrontendResponse,
  FrontendFinding,
  FrontendStatus,
  Requirement,
  RequirementStatus,
  Criticality,
  Section,
  RecommendedClause,
  StreamEvent,
  StreamCallback,
  StreamAnalyzeOptions,
  AIProvider,
  AnalyzeOptions,
  CRITICALITY_WEIGHTS,
  STATUS_VALUES,
  CRITICAL_REQUIREMENT_IDS,
} from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Analysis configuration
 */
export const CONFIG = {
  /** Request timeout in milliseconds (2 minutes for large documents) */
  REQUEST_TIMEOUT_MS: 120_000,

  /** Maximum content length (~60 pages of text) */
  MAX_CONTENT_CHARS: 120_000,

  /** Maximum output tokens for detailed analysis */
  MAX_OUTPUT_TOKENS: 32000,

  /** Temperature for deterministic output (0.0 = most deterministic) */
  TEMPERATURE: 0.0,

  /** Minimum content length to analyze */
  MIN_CONTENT_CHARS: 100,

  /** Batch size for splitting requirements to avoid token limit */
  BATCH_SIZE: 12,
};

// =============================================================================
// SCORING FUNCTIONS (v3.1 with criticality weighting)
// =============================================================================

/**
 * Gets criticality weight for score calculation.
 * CRITICAL = 3, MAJOR = 2, MINOR = 1
 */
function getCriticalityWeight(criticality: Criticality | undefined): number {
  if (!criticality) return 1;
  return CRITICALITY_WEIGHTS[criticality] || 1;
}

/**
 * Gets status value for score calculation.
 * COMPLIANT = 100%, IMPLICIT = 70%, PARTIAL = 30%, ABSENT = 0%
 */
function getStatusValue(status: RequirementStatus): number {
  return STATUS_VALUES[status] || 0;
}

/**
 * Calculates compliance score from items using the v3.1 formula with criticality weighting.
 *
 * FORMULA (v3.1 with criticality weighting):
 * ─────────────────────────────────────────────────────────────────────────────────
 *
 *   Score = Σ(statusValue × criticalityWeight) / Σ(100 × criticalityWeight) × 100
 *
 * Where:
 *   - statusValue: COMPLIANT=100, IMPLICIT=70, PARTIAL=30, ABSENT=0
 *   - criticalityWeight: CRITICAL=3, MAJOR=2, MINOR=1
 *
 * Items with NA status are excluded from the calculation.
 *
 * @param items - Analysis result items
 * @returns Score from 0 to 100
 */
export function calculateScoreFromItems(items: AnalysisResultItem[]): number {
  const applicableItems = items.filter(item => item.status !== 'NA');
  if (applicableItems.length === 0) return 0;

  let weightedScore = 0;
  let maxPossibleScore = 0;

  for (const item of applicableItems) {
    // Find requirement to get criticality
    const requirement = getRequirementById(item.requirementId);
    const weight = getCriticalityWeight(requirement?.criticality);

    weightedScore += getStatusValue(item.status) * weight;
    maxPossibleScore += 100 * weight;
  }

  return maxPossibleScore > 0 ? Math.round((weightedScore / maxPossibleScore) * 100) : 0;
}

// =============================================================================
// CRITICAL REQUIREMENTS VALIDATION
// =============================================================================

/**
 * Validates and corrects CRITICAL requirements that cannot have IMPLICIT status.
 * CRITICAL requirements: I.7, I.10, II.4, II.10
 * If IMPLICIT → converted to PARTIAL with warning comment
 */
export function validateCriticalRequirements(response: ContractAnalysis): ContractAnalysis {
  const correctedItems = response.items.map(item => {
    // Check if this is a CRITICAL requirement with IMPLICIT status
    if (CRITICAL_REQUIREMENT_IDS.includes(item.requirementId) && item.status === 'IMPLICIT') {
      const req = getRequirementById(item.requirementId);
      const reqName = req?.name || item.requirementId;

      return {
        ...item,
        status: 'PARTIAL' as const,
        comment: `⚠️ EXIGENCE CRITIQUE : ${item.comment}\n\n` +
          `Note: Cette exigence (${reqName}) ne peut pas être considérée comme "implicitement couverte" ` +
          `par une clause de conformité générale. Une clause explicite est fortement recommandée.`
      };
    }
    return item;
  });

  return {
    ...response,
    items: correctedItems
  };
}

// =============================================================================
// AUTO-RECOMMENDATION GENERATOR
// =============================================================================

/**
 * Builds a clause suggestion text based on verification criteria
 */
function buildClauseSuggestion(verificationCriteria: string, sourceText: string): string {
  // Extract key elements from verification criteria
  const elements = verificationCriteria
    .replace(/Vérifier:\s*/i, '')
    .replace(/PARTIEL.*$/i, '')
    .replace(/ABSENT.*$/i, '')
    .trim();

  // If criteria contains numbered items, format as a checklist
  if (elements.includes('(1)') || elements.includes('(a)')) {
    const items = elements
      .split(/[,+]|\s*\(\d+\)\s*|\s*\([a-z]\)\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 3);

    if (items.length > 0) {
      return `Clause type à inclure: ${items.slice(0, 4).join(' ; ')}.`;
    }
  }

  // Use source text if criteria is too generic
  if (sourceText && elements.length < 30) {
    const truncatedSource = sourceText.length > 150
      ? sourceText.substring(0, 150) + '...'
      : sourceText;
    return `Exigence réglementaire: "${truncatedSource}"`;
  }

  return `Éléments requis: ${elements}`;
}

/**
 * Extracts missing elements from analysis comment by comparing with verification criteria
 */
function extractMissingElements(comment: string, verificationCriteria: string): string[] {
  const missing: string[] = [];

  // Common patterns indicating missing elements in comments
  const missingPatterns = [
    /manque\s+(?:de\s+)?([^,.;]+)/gi,
    /absence\s+(?:de\s+)?([^,.;]+)/gi,
    /(?:non|pas)\s+(?:de\s+)?([^,.;]+)/gi,
    /sans\s+([^,.;]+)/gi,
    /missing\s+([^,.;]+)/gi,
    /lacks?\s+([^,.;]+)/gi,
    /no\s+(?:specific\s+)?([^,.;]+)/gi,
  ];

  for (const pattern of missingPatterns) {
    let matchResult: RegExpExecArray | null;
    while ((matchResult = pattern.exec(comment)) !== null) {
      const element = matchResult[1].trim();
      if (element.length > 3 && element.length < 60 && !missing.includes(element)) {
        missing.push(element);
      }
    }
  }

  // If no missing elements found, check verification criteria
  if (missing.length === 0) {
    const criteriaElements = verificationCriteria
      .toLowerCase()
      .split(/[,+;]|\s*\(\d+\)\s*|\s*\([a-z]\)\s*/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const commentLower = comment.toLowerCase();
    for (const element of criteriaElements) {
      const keywords = element.split(/\s+/).filter(w => w.length > 3);
      const foundInComment = keywords.some(kw => commentLower.includes(kw));

      if (!foundInComment && element.length < 50) {
        missing.push(element);
        if (missing.length >= 3) break;
      }
    }
  }

  return missing.slice(0, 3);
}

/**
 * Generates automatic recommendations based on status and requirement details.
 * - ABSENT (non-compliant): Suggests adding a specific clause
 * - PARTIAL: Suggests reinforcing with missing elements
 */
export function generateAutoRecommendation(
  status: RequirementStatus,
  requirement: Requirement,
  analysisComment: string
): string | undefined {
  // Only generate recommendations for non-compliant or partial statuses
  if (status === 'COMPLIANT' || status === 'IMPLICIT' || status === 'NA') {
    return undefined;
  }

  const { name, reference, verificationCriteria, regulatoryText, criticality } = requirement;

  // Extract the regulatory source text (prefer DORA, fallback to EBA or FR)
  const sourceText = regulatoryText.dora || regulatoryText.eba || regulatoryText.fr || '';

  if (status === 'ABSENT') {
    // For ABSENT: Recommend adding a complete clause
    const criticalityPrefix = criticality === 'CRITICAL'
      ? '⚠️ PRIORITÉ HAUTE: '
      : criticality === 'MAJOR'
        ? '⚡ PRIORITÉ MOYENNE: '
        : '';

    const clauseSuggestion = buildClauseSuggestion(verificationCriteria, sourceText);

    return `${criticalityPrefix}Ajouter une clause contractuelle couvrant "${name}" (${reference}). ${clauseSuggestion}`;
  }

  if (status === 'PARTIAL') {
    // For PARTIAL: Identify and recommend missing elements
    const missingElements = extractMissingElements(analysisComment, verificationCriteria);

    if (missingElements.length > 0) {
      const elementsText = missingElements.join(', ');
      return `Renforcer la clause existante en ajoutant: ${elementsText}. Réf: ${reference}.`;
    }

    // Fallback if no specific missing elements identified
    return `Compléter la clause existante pour couvrir intégralement les exigences de ${reference}. Critères attendus: ${verificationCriteria}`;
  }

  return undefined;
}

// =============================================================================
// PROMPT BUILDER v3.0
// =============================================================================

/**
 * Builds the analysis prompt with the contract content and checklist
 */
export function buildPrompt(content: string): { system: string; user: string } {
  // Build checklist prompt with v3.0 format
  const checklistPrompt = CHECKLIST.map(req => {
    const allKeywords = [...req.keywords.fr, ...req.keywords.en].join(', ');
    return `[${req.id}] ${req.name}
     Réf: ${req.reference}
     Applicabilité: ${req.applicability}
     Criticité: ${req.criticality}${req.isNewDORA ? ' (NOUVEAU DORA)' : ''}${req.isDORAEnhanced ? ' (DORA RENFORCÉ)' : ''}
     Critères: ${req.verificationCriteria}
     Mots-clés: ${allKeywords}`;
  }).join('\n\n');

  const system = `
# SYSTEM PROMPT v3.0 - ANALYSE CONFORMITÉ CONTRATS ICT

## RÔLE
Tu es un expert senior en conformité réglementaire financière spécialisé dans l'analyse de contrats d'externalisation ICT selon trois cadres réglementaires :
- **DORA** (Digital Operational Resilience Act - Règlement UE 2022/2554)
- **EBA Guidelines on Outsourcing** (EBA/GL/2019/02)
- **Arrêté du 3 novembre 2014** relatif au contrôle interne (ACPR France)

Ta mission est d'auditer des contrats d'externalisation ICT et d'évaluer leur conformité selon une checklist de **35 exigences** structurée en 4 sections.

## STRUCTURE DE LA CHECKLIST v3.0
SECTION I   : TOUS LES CONTRATS ICT (10 exigences) - DORA 30.1 + 30.2
SECTION II  : FONCTIONS CRITIQUES ADDITIONNELLES (10 exigences) - DORA 30.3
SECTION III : SPÉCIFICITÉS EBA (3 exigences) - Non reprises par DORA
SECTION IV  : SPÉCIFICITÉS FRANÇAISES (12 exigences) - Arrêté 3 nov 2014

## RÈGLES FONDAMENTALES D'ANALYSE

### 1. STRUCTURE DOCUMENTAIRE (Exigence I.1)
L'utilisateur peut fournir plusieurs fichiers (contrat cadre + annexes + avenants).
⚠️ **RÈGLE IMPÉRATIVE** : Considère l'ensemble comme **UN SEUL CONTRAT UNIQUE**.
- L'exigence I.1 est **COMPLIANT** si l'ensemble forme un tout cohérent
- Ne marque JAMAIS I.1 comme ABSENT/PARTIAL sous prétexte de fichiers multiples

### 2. DÉTECTION DES CLAUSES DE CONFORMITÉ GÉNÉRALE
**EN PREMIER**, recherche si le contrat contient des clauses générales de conformité :
✓ "Le Prestataire s'engage à respecter DORA"
✓ "Conformément au Règlement (UE) 2022/2554"
✓ "Le Prestataire se conforme aux orientations ABE sur l'externalisation"
✓ "Conformité aux Guidelines EBA/GL/2019/02"
✓ "Respect de l'Arrêté du 3 novembre 2014"

Si détectées → Liste-les dans le champ "generalClauses" de ta réponse

### 3. NIVEAUX DE CONFORMITÉ (5 statuts)

🟢 **COMPLIANT** : Clause spécifique et détaillée traitant explicitement ce point
   → OBLIGATOIRE : Remplir le champ "foundClause" avec citation exacte

🟡 **IMPLICIT** : AUCUNE clause spécifique mais clause de conformité générale couvrant ce cadre
   → **EXCEPTION** : Voir règle 4 pour exigences CRITICAL

🟠 **PARTIAL** : Clause existe mais incomplète, vague ou imprécise

🔴 **ABSENT** : Aucune clause spécifique ET aucune clause de conformité générale

⚪ **NA** : Exigence clairement non applicable à ce contrat

### 4. EXIGENCES CRITICAL - RÈGLE SPÉCIALE 🚨
**Les 4 exigences CRITICAL ne peuvent JAMAIS être IMPLICIT** :

| ID | Exigence | Pourquoi CRITICAL |
|----|----------|-------------------|
| **I.7** | Assistance incident (coût prédéterminé) | DORA renforce EBA |
| **I.10** | Formation sécurité ICT | NOUVEAU DORA |
| **II.4** | Tests TLPT | NOUVEAU DORA |
| **II.10** | Transition OBLIGATOIRE | DORA renforce EBA |

**Règles d'évaluation CRITICAL** :
✅ **COMPLIANT** : Clause explicite détaillée
🟠 **PARTIAL** : Si SEULEMENT clause générale → Dans "comment", OBLIGATOIREMENT préciser :
   "⚠️ EXIGENCE CRITIQUE : Une clause générale ne suffit pas. Une clause explicite détaillant [X] est fortement recommandée."
🔴 **ABSENT** : Aucune mention directe ni clause générale
❌ **INTERDIT** : Ne JAMAIS mettre IMPLICIT pour I.7, I.10, II.4, II.10

### 5. APPLICABILITÉ DES SECTIONS

**Section I (I.1-I.10)** : TOUS LES CONTRATS - Vérifie TOUJOURS ces 10 exigences

**Section II (II.1-II.10)** : FONCTIONS CRITIQUES UNIQUEMENT
⚠️ AVANT d'analyser Section II, détermine si services supportent fonction critique/importante
→ Si NON critique → Marque toutes II.1-II.10 comme **NA**
→ Si OUI critique → Vérifie normalement

**Section III (III.1-III.3)** : Établissements EBA - Vérifie si applicable

**Section IV (IV.1-IV.12)** : France uniquement - Vérifie si établissement ACPR

### 6. PRODUCTION DES CLAUSES DE REMÉDIATION
Pour chaque exigence **ABSENT** ou **PARTIAL** :
✓ Propose clause contractuelle prête à l'emploi
✓ Rédige en **FRANÇAIS ET ANGLAIS**
✓ Langage juridique professionnel
✓ Référence texte réglementaire (ex: "conformément à DORA 30.2(i)")

## FORMAT DE SORTIE (JSON STRICT)
Retourne **UNIQUEMENT** un objet JSON valide :
{
  "items": [
    {
      "requirementId": "I.1",
      "status": "COMPLIANT" | "PARTIAL" | "IMPLICIT" | "ABSENT" | "NA",
      "comment": "Explication détaillée du statut",
      "foundClause": "Citation exacte (OBLIGATOIRE si COMPLIANT)"
    }
  ],
  "score": 85,
  "generalClauses": [
    "Article 15.3 : Le Prestataire s'engage à respecter DORA..."
  ],
  "executiveSummary": "Résumé 3-4 phrases : score, points forts, gaps critiques",
  "recommendedClauses": [
    {
      "title": "Formation sécurité ICT",
      "reference": "DORA 30.2(i)",
      "textFr": "Article X - Formation...",
      "textEn": "Article X - Training..."
    }
  ]
}

### Calcul du score (v3.1 - avec pondération criticité)
Score = Σ(valeurStatut × coeffCriticité) / Σ(100 × coeffCriticité) × 100

Valeurs statut: COMPLIANT=100, IMPLICIT=70, PARTIAL=30, ABSENT=0
Coefficients criticité: CRITICAL=3, MAJOR=2, MINOR=1
Exclus du calcul: exigences marquées NA
`;

  const user = `
**TEXTE DU(DES) DOCUMENT(S) :**
<document>
${content}
</document>

**CHECKLIST À VÉRIFIER :**
${checklistPrompt}
`;

  return { system, user };
}

// =============================================================================
// RESPONSE PARSER (with truncation recovery)
// =============================================================================

/**
 * Extracts the JSON string from AI response, removing markdown code blocks
 */
function extractJsonString(responseText: string): string {
  let jsonStr = responseText;

  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    jsonStr = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  return jsonStr;
}

/**
 * Attempts to recover items from truncated JSON using regex extraction
 */
function recoverItemsFromTruncatedJson(jsonStr: string): AnalysisResultItem[] {
  const recoveredItems: AnalysisResultItem[] = [];

  // Match individual item objects with their required fields
  const itemPattern = /\{\s*"requirementId"\s*:\s*"([^"]+)"\s*,\s*"status"\s*:\s*"(COMPLIANT|IMPLICIT|PARTIAL|ABSENT|NA)"\s*,\s*"comment"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/g;

  let match;
  while ((match = itemPattern.exec(jsonStr)) !== null) {
    const [, requirementId, status, comment] = match;

    // Try to extract foundClause if present
    let foundClause: string | undefined;
    const afterMatch = jsonStr.slice(match.index + match[0].length);
    const foundClauseMatch = afterMatch.match(/^\s*,\s*"foundClause"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (foundClauseMatch) {
      foundClause = foundClauseMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    recoveredItems.push({
      requirementId,
      status: status as RequirementStatus,
      comment: comment.replace(/\\"/g, '"').replace(/\\n/g, '\n'),
      ...(foundClause && { foundClause }),
    });
  }

  return recoveredItems;
}

/**
 * Parses AI response with truncation recovery.
 * If standard JSON.parse fails, attempts to extract valid items from truncated response.
 */
export function parseAIResponse(
  responseText: string,
  fileName: string
): { response: ContractAnalysis; isPartial: boolean; recoveredCount: number } {
  const jsonStr = extractJsonString(responseText);

  // First attempt: standard JSON parse
  try {
    const result = JSON.parse(jsonStr);

    if (typeof result.score !== 'number' || !Array.isArray(result.items)) {
      throw new Error("Invalid response structure");
    }

    result.score = Math.max(0, Math.min(100, Math.round(result.score)));

    return {
      response: {
        fileName,
        date: new Date().toLocaleDateString('fr-FR'),
        score: result.score,
        items: result.items as AnalysisResultItem[],
        generalClauses: result.generalClauses || [],
        executiveSummary: result.executiveSummary || "Analyse terminée.",
        recommendedClauses: result.recommendedClauses || [],
      },
      isPartial: false,
      recoveredCount: result.items.length,
    };
  } catch {
    console.warn("[parseAIResponse] JSON parse failed, attempting truncation recovery...");
  }

  // Second attempt: extract items from truncated JSON
  const recoveredItems = recoverItemsFromTruncatedJson(jsonStr);

  if (recoveredItems.length > 0) {
    console.info("[parseAIResponse] Recovered items from truncated JSON", { count: recoveredItems.length });

    // Try to extract generalClauses
    let generalClauses: string[] = [];
    const generalClausesMatch = jsonStr.match(/"generalClauses"\s*:\s*\[((?:[^[\]]|\[(?:[^[\]]|\[[^[\]]*\])*\])*)\]/);
    if (generalClausesMatch) {
      try {
        generalClauses = JSON.parse("[" + generalClausesMatch[1] + "]");
      } catch {
        // Ignore - use empty array
      }
    }

    // Try to extract executiveSummary
    let executiveSummary = "Analyse partiellement récupérée suite à une troncature.";
    const summaryMatch = jsonStr.match(/"executiveSummary"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/);
    if (summaryMatch) {
      executiveSummary = summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, '\n');
    }

    const calculatedScore = calculateScoreFromItems(recoveredItems);

    return {
      response: {
        fileName,
        date: new Date().toLocaleDateString('fr-FR'),
        score: calculatedScore,
        items: recoveredItems,
        generalClauses,
        executiveSummary: "⚠️ Résultats partiels (" + recoveredItems.length + " items récupérés). " + executiveSummary,
        recommendedClauses: [],
      },
      isPartial: true,
      recoveredCount: recoveredItems.length,
    };
  }

  // Recovery failed
  console.error("[parseAIResponse] JSON recovery failed - no items extracted");
  throw new Error(
    "Erreur de formatage de l'analyse (JSON invalide). Le contrat est peut-être trop long. Veuillez réessayer."
  );
}

// =============================================================================
// RESPONSE TRANSFORMER
// =============================================================================

/**
 * Transforms the analysis result to a frontend-compatible format
 */
export function transformToFrontendFormat(response: ContractAnalysis): FrontendResponse {
  // Map status from AI format to frontend format
  const statusMap: Record<string, FrontendStatus> = {
    'COMPLIANT': 'compliant',
    'PARTIAL': 'partial',
    'IMPLICIT': 'implicit',
    'ABSENT': 'non-compliant',
    'NA': 'not-applicable',
  };

  // Find recommendations for each requirement
  const recommendationMap = new Map<string, string>();
  for (const rec of response.recommendedClauses) {
    // Match by exact title or reference with word boundary
    for (const req of CHECKLIST) {
      const idPattern = new RegExp(`\\b${req.id}\\b`);
      const titleMatch = rec.title.toLowerCase() === req.name.toLowerCase();
      const referenceMatch = idPattern.test(rec.reference);

      if (titleMatch || referenceMatch) {
        recommendationMap.set(req.id, rec.textFr);
        break;
      }
    }
  }

  // Transform items to findings with enriched data
  const findings: FrontendFinding[] = response.items.map(item => {
    const req = getRequirementById(item.requirementId);
    const requirementName = req?.name || item.requirementId;
    const status = statusMap[item.status] || 'non-compliant';

    // Use AI recommendation if available, otherwise generate automatic recommendation
    const aiRecommendation = recommendationMap.get(item.requirementId);
    const recommendation = aiRecommendation || (req ? generateAutoRecommendation(item.status, req, item.comment) : undefined);

    // Extract section from requirement ID (e.g., "I.7" → "I", "II.4" → "II")
    const sectionMatch = item.requirementId.match(/^(I{1,3}|IV)\./);
    const section = sectionMatch ? sectionMatch[1] as Section : undefined;

    return {
      requirement: requirementName,
      status,
      details: item.comment,
      foundClause: item.foundClause || undefined,
      ...(recommendation && status !== 'compliant' && status !== 'not-applicable' ? { recommendation } : {}),
      // Enriched data from CHECKLIST
      reference: req?.reference,
      criticality: req?.criticality,
      section,
      requirementId: item.requirementId,
    };
  });

  // Calculate score with criticality weighting (v3.1)
  const applicableItems = response.items.filter(item => item.status !== 'NA');
  const adjustedScore = calculateScoreFromItems(response.items);

  // Use the minimum of AI score and adjusted score (conservative approach)
  const finalScore = Math.min(response.score, adjustedScore);
  const naCount = response.items.length - applicableItems.length;

  return {
    overallScore: finalScore,
    summary: response.executiveSummary +
      `\n\n📊 Critères analysés: ${applicableItems.length}/${response.items.length}` +
      (naCount > 0 ? ` (${naCount} N/A exclus)` : ''),
    findings,
  };
}

// =============================================================================
// AI PROVIDERS
// =============================================================================

/**
 * Call Anthropic Claude API
 */
export async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = "claude-sonnet-4-5-20250514"
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
        temperature: CONFIG.TEMPERATURE,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call Google Gemini API
 */
export async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = "gemini-1.5-pro"
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: systemPrompt + "\n\n" + userPrompt }],
            },
          ],
          generationConfig: {
            temperature: CONFIG.TEMPERATURE,
            maxOutputTokens: CONFIG.MAX_OUTPUT_TOKENS,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Call OpenAI API
 */
export async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  model: string = "gpt-4o"
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: CONFIG.TEMPERATURE,
        max_tokens: CONFIG.MAX_OUTPUT_TOKENS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// MAIN ANALYSIS FUNCTIONS
// =============================================================================

/**
 * Analyze an ICT outsourcing contract for DORA/EBA compliance
 *
 * @param content - The contract text to analyze
 * @param options - Analysis options (provider, API key, etc.)
 * @returns The analysis result in frontend-compatible format
 *
 * @example
 * ```typescript
 * const result = await analyzeContract(contractText, {
 *   provider: 'anthropic',
 *   apiKey: process.env.ANTHROPIC_API_KEY!,
 *   fileName: 'contrat-fournisseur.pdf'
 * });
 *
 * console.log(`Score: ${result.overallScore}%`);
 * console.log(`Summary: ${result.summary}`);
 * result.findings.forEach(f => {
 *   console.log(`${f.requirement}: ${f.status}`);
 * });
 * ```
 */
export async function analyzeContract(
  content: string,
  options: AnalyzeOptions
): Promise<FrontendResponse> {
  // Validate content length
  if (content.length < CONFIG.MIN_CONTENT_CHARS) {
    throw new Error(`Content too short (minimum ${CONFIG.MIN_CONTENT_CHARS} characters)`);
  }

  if (content.length > CONFIG.MAX_CONTENT_CHARS) {
    throw new Error(`Content too long (maximum ${CONFIG.MAX_CONTENT_CHARS} characters, ~60 pages)`);
  }

  // Build prompt
  const { system, user } = buildPrompt(content);

  // Call AI provider
  let aiResponse: string;

  switch (options.provider) {
    case 'anthropic':
      aiResponse = await callAnthropic(system, user, options.apiKey, options.model);
      break;
    case 'gemini':
      aiResponse = await callGemini(system, user, options.apiKey, options.model);
      break;
    case 'openai':
      aiResponse = await callOpenAI(system, user, options.apiKey, options.model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${options.provider}`);
  }

  // Parse response with truncation recovery
  const { response: rawResult } = parseAIResponse(aiResponse, options.fileName || "Document");

  // Validate critical requirements
  const validatedResult = validateCriticalRequirements(rawResult);

  // Transform to frontend format
  return transformToFrontendFormat(validatedResult);
}

/**
 * Get the raw analysis result (before frontend transformation)
 * Useful if you need access to recommended clauses or general clauses
 */
export async function analyzeContractRaw(
  content: string,
  options: AnalyzeOptions
): Promise<ContractAnalysis> {
  // Validate content length
  if (content.length < CONFIG.MIN_CONTENT_CHARS) {
    throw new Error(`Content too short (minimum ${CONFIG.MIN_CONTENT_CHARS} characters)`);
  }

  if (content.length > CONFIG.MAX_CONTENT_CHARS) {
    throw new Error(`Content too long (maximum ${CONFIG.MAX_CONTENT_CHARS} characters, ~60 pages)`);
  }

  // Build prompt
  const { system, user } = buildPrompt(content);

  // Call AI provider
  let aiResponse: string;

  switch (options.provider) {
    case 'anthropic':
      aiResponse = await callAnthropic(system, user, options.apiKey, options.model);
      break;
    case 'gemini':
      aiResponse = await callGemini(system, user, options.apiKey, options.model);
      break;
    case 'openai':
      aiResponse = await callOpenAI(system, user, options.apiKey, options.model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${options.provider}`);
  }

  // Parse response
  const { response: rawResult } = parseAIResponse(aiResponse, options.fileName || "Document");

  // Validate critical requirements
  return validateCriticalRequirements(rawResult);
}

// =============================================================================
// STREAMING ANALYSIS (simplified version for standalone)
// =============================================================================

/**
 * Helper to emit stream events
 */
function emitEvent(callback: StreamCallback | undefined, event: StreamEvent): void {
  if (callback) {
    callback(event);
  }
}

/**
 * Analyze an ICT contract with event callbacks
 * Provides feedback during analysis
 */
export async function analyzeContractWithEvents(
  content: string,
  options: StreamAnalyzeOptions
): Promise<FrontendResponse> {
  const { provider, apiKey, model, fileName = "Document", onEvent } = options;

  // Validate content length
  if (content.length < CONFIG.MIN_CONTENT_CHARS) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      message: `Content too short (minimum ${CONFIG.MIN_CONTENT_CHARS} characters)`,
      code: 'CONTENT_TOO_SHORT'
    };
    emitEvent(onEvent, error);
    throw new Error(error.message);
  }

  if (content.length > CONFIG.MAX_CONTENT_CHARS) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      message: `Content too long (maximum ${CONFIG.MAX_CONTENT_CHARS} characters)`,
      code: 'CONTENT_TOO_LONG'
    };
    emitEvent(onEvent, error);
    throw new Error(error.message);
  }

  // Emit start event
  emitEvent(onEvent, {
    type: 'start',
    timestamp: Date.now(),
    totalSteps: 4
  });

  // Step 1: Building prompt
  emitEvent(onEvent, {
    type: 'step',
    timestamp: Date.now(),
    step: 1,
    label: 'Préparation de l\'analyse...'
  });

  const { system, user } = buildPrompt(content);

  // Step 2: Calling AI
  emitEvent(onEvent, {
    type: 'step',
    timestamp: Date.now(),
    step: 2,
    label: 'Analyse sémantique (IA)...'
  });

  let aiResponse: string;
  try {
    switch (provider) {
      case 'anthropic':
        aiResponse = await callAnthropic(system, user, apiKey, model);
        break;
      case 'gemini':
        aiResponse = await callGemini(system, user, apiKey, model);
        break;
      case 'openai':
        aiResponse = await callOpenAI(system, user, apiKey, model);
        break;
      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  } catch (err) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      message: err instanceof Error ? err.message : 'Unknown AI error',
      code: 'AI_ERROR'
    };
    emitEvent(onEvent, error);
    throw err;
  }

  // Step 3: Parsing response
  emitEvent(onEvent, {
    type: 'step',
    timestamp: Date.now(),
    step: 3,
    label: 'Traitement des résultats...'
  });

  let rawResult: ContractAnalysis;
  try {
    const { response } = parseAIResponse(aiResponse, fileName);
    rawResult = validateCriticalRequirements(response);
  } catch (err) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      message: err instanceof Error ? err.message : 'Parse error',
      code: 'PARSE_ERROR'
    };
    emitEvent(onEvent, error);
    throw err;
  }

  // Step 4: Transforming result
  emitEvent(onEvent, {
    type: 'step',
    timestamp: Date.now(),
    step: 4,
    label: 'Génération du rapport...'
  });

  const result = transformToFrontendFormat(rawResult);

  // Emit done event
  emitEvent(onEvent, {
    type: 'done',
    timestamp: Date.now(),
    data: result
  });

  return result;
}

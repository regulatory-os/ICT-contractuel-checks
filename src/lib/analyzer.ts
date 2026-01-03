/**
 * ICT Contract Analyzer
 *
 * AI-powered analysis of ICT outsourcing contracts for DORA/EBA compliance.
 * Supports multiple AI providers: Anthropic Claude (preferred), Google Gemini, OpenAI.
 * Now with streaming support for real-time analysis feedback.
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 * @version 1.1.0
 */

import { CHECKLIST } from '../data/checklist';
import {
  ContractAnalysis,
  AnalysisResultItem,
  FrontendResponse,
  FrontendFinding,
  StreamEvent,
  StreamCallback,
  StreamAnalyzeOptions,
  AIProvider,
  AnalyzeOptions
} from '../types';

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Analysis configuration
 * Adjust these values based on your needs
 */
export const CONFIG = {
  /** Request timeout in milliseconds (2 minutes for large documents) */
  REQUEST_TIMEOUT_MS: 120_000,

  /** Maximum content length (~60 pages of text) */
  MAX_CONTENT_CHARS: 120_000,

  /** Maximum output tokens for detailed analysis */
  MAX_OUTPUT_TOKENS: 16000,

  /** Temperature for deterministic output (0.0 = most deterministic) */
  TEMPERATURE: 0.0,

  /** Minimum content length to analyze */
  MIN_CONTENT_CHARS: 100,
};

// =============================================================================
// PROMPT BUILDER
// =============================================================================

/**
 * Builds the analysis prompt with the contract content and checklist
 */
export function buildPrompt(content: string): string {
  const checklistPrompt = CHECKLIST.map(req =>
    `[${req.id}] ${req.name}
     Ref: ${req.reference}
     Desc: ${req.description}
     Keywords: ${req.keywords.join(', ')}`
  ).join('\n\n');

  const systemPrompt = `
Tu es un expert senior en conformité financière spécialisé dans DORA, les orientations de l'ABE (Autorité Bancaire Européenne) et l'Arrêté du 3 novembre 2014.
Ta tâche est d'auditer un ensemble de documents (contrat cadre, avenants, annexes) qui constituent juridiquement LE contrat à analyser.

**RÈGLE IMPORTANTE - STRUCTURE DOCUMENTAIRE (Exigence A1)** :
L'utilisateur peut fournir plusieurs fichiers ou segments de texte (ex: "Contrat Cadre" + "Annexes").
Tu dois IMPÉRATIVEMENT considérer l'ensemble de l'input comme constituant **UN SEUL CONTRAT UNIQUE**.
- L'exigence A1 ("Contrat écrit unique") ne doit pas être marquée 'ABSENT' ou 'PARTIAL' sous prétexte qu'il y a plusieurs fichiers.
- Si l'ensemble forme un tout cohérent qui définit les droits et obligations, A1 est 'COMPLIANT'.

**INSTRUCTIONS D'ANALYSE :**

1. **DÉTECTION DES CADRES GÉNÉRAUX** :
   - Recherche d'abord si le contrat contient une clause générale de conformité (ex: "Le prestataire s'engage à respecter DORA", "Conformité à la réglementation applicable", "Respect des orientations ABE").
   - Si une telle clause existe, cela couvre **IMPLICITEMENT** la plupart des exigences standards.

2. **ÉVALUATION DES EXIGENCES (PAR LIGNE)** :
   - Pour chaque exigence de la checklist, détermine le statut :

   - **'COMPLIANT'** : Une clause spécifique et détaillée traite explicitement ce point.

   - **'IMPLICIT' (RÈGLE IMPORTANTE)** :
     Si le contrat contient une clause de conformité générale (voir point 1) MAIS pas de clause spécifique pour ce point précis, alors le statut doit être **'IMPLICIT'** (et non 'ABSENT').
     *Cela s'applique à TOUTES les sections, y compris les nouveautés DORA si la clause générale mentionne explicitement "DORA" ou "Règlement (UE) 2022/2554".*

   - **'PARTIAL'** : Une clause existe mais elle est incomplète ou vague.

   - **'ABSENT'** : Aucune clause spécifique trouvée ET aucune clause de conformité générale détectée.

   - **'NA'** : Clairement non applicable.

3. **PRÉCISION SUR LES NOUVEAUTÉS DORA (J32, J33, J34)** :
   - Si une clause générale mentionne DORA, tu peux mettre **'IMPLICIT'**.
   - CEPENDANT, dans le champ 'comment', tu dois préciser : "Couvert par la clause générale, mais une clause explicite est fortement recommandée pour cette exigence critique."

4. **CLAUSES DE REMÉDIATION** :
   - Pour chaque exigence ABSENT ou PARTIAL, propose une clause de remédiation en français ET en anglais.
   - Ces clauses doivent être directement utilisables dans un avenant contractuel.

5. **SORTIE** : Retourne un objet JSON valide avec cette structure exacte :
{
  "items": [
    {
      "requirementId": "A1",
      "status": "COMPLIANT" | "PARTIAL" | "IMPLICIT" | "ABSENT" | "NA",
      "comment": "Explication détaillée",
      "foundClause": "Citation de la clause trouvée (si applicable)"
    }
  ],
  "score": <nombre 0-100>,
  "generalClauses": ["Liste des clauses générales de conformité détectées"],
  "executiveSummary": "Résumé exécutif de l'analyse en 3-4 phrases",
  "recommendedClauses": [
    {
      "title": "Titre de l'exigence manquante",
      "reference": "Référence réglementaire",
      "textFr": "Clause proposée en français",
      "textEn": "Proposed clause in English"
    }
  ]
}
`;

  const userPrompt = `
**TEXTE DU(DES) DOCUMENT(S) :**
${content}

**CHECKLIST À VÉRIFIER :**
${checklistPrompt}
`;

  return systemPrompt + "\n\n" + userPrompt;
}

// =============================================================================
// RESPONSE PARSER
// =============================================================================

/**
 * Parses the AI response and extracts the JSON result
 */
export function parseAIResponse(responseText: string, fileName: string): ContractAnalysis {
  let jsonStr = responseText;

  // Remove markdown code blocks if present
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1];
  } else {
    jsonStr = responseText.replace(/^```json\s*/, "").replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Try to find JSON object in the response
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    const result = JSON.parse(jsonStr);

    // Validate structure
    if (typeof result.score !== 'number' || !Array.isArray(result.items)) {
      throw new Error("Invalid response structure");
    }

    // Clamp score between 0 and 100
    result.score = Math.max(0, Math.min(100, Math.round(result.score)));

    return {
      fileName,
      date: new Date().toLocaleDateString('fr-FR'),
      score: result.score,
      items: result.items as AnalysisResultItem[],
      generalClauses: result.generalClauses || [],
      executiveSummary: result.executiveSummary || "Analyse terminée.",
      recommendedClauses: result.recommendedClauses || [],
    };
  } catch (error) {
    console.error("JSON Parse Error:", error);
    console.log("Raw Text:", responseText);
    throw new Error("Erreur de formatage de l'analyse (JSON invalide). Le contrat est peut-être trop long ou l'analyse trop complexe. Veuillez réessayer.");
  }
}

// =============================================================================
// RESPONSE TRANSFORMER
// =============================================================================

/**
 * Transforms the analysis result to a frontend-compatible format
 */
export function transformToFrontendFormat(response: ContractAnalysis): FrontendResponse {
  // Create a map from requirement ID to name for easy lookup
  const requirementMap = new Map<string, string>();
  for (const req of CHECKLIST) {
    requirementMap.set(req.id, req.name);
  }

  // Map status from AI format to frontend format
  const statusMap: Record<string, FrontendFinding['status']> = {
    'COMPLIANT': 'compliant',
    'PARTIAL': 'partial',
    'IMPLICIT': 'implicit',
    'ABSENT': 'non-compliant',
    'NA': 'compliant', // Treat N/A as compliant for scoring
  };

  // Find recommendations for each requirement
  const recommendationMap = new Map<string, string>();
  for (const rec of response.recommendedClauses) {
    // Match by title or reference
    for (const req of CHECKLIST) {
      if (rec.title.toLowerCase().includes(req.name.toLowerCase()) ||
          rec.reference.includes(req.id)) {
        recommendationMap.set(req.id, rec.textFr);
        break;
      }
    }
  }

  // Transform items to findings
  const findings: FrontendFinding[] = response.items.map(item => {
    const requirementName = requirementMap.get(item.requirementId) || item.requirementId;
    const status = statusMap[item.status] || 'non-compliant';
    const recommendation = recommendationMap.get(item.requirementId);

    return {
      requirement: requirementName,
      status,
      details: item.comment + (item.foundClause ? `\n\nClause trouvée: "${item.foundClause}"` : ''),
      ...(recommendation && status !== 'compliant' ? { recommendation } : {}),
    };
  });

  return {
    overallScore: response.score,
    summary: response.executiveSummary,
    findings,
  };
}

// =============================================================================
// AI PROVIDERS
// =============================================================================

/**
 * Call Anthropic Claude API
 *
 * Preferred provider for compliance analysis due to:
 * - Strong reasoning capabilities
 * - Excellent French language support
 * - Deterministic output with temperature 0.0
 *
 * @param prompt - The analysis prompt
 * @param apiKey - Your Anthropic API key
 * @param model - Model to use (default: claude-opus-4-5-20251101)
 */
export async function callAnthropic(
  prompt: string,
  apiKey: string,
  model: string = "claude-opus-4-5-20251101"
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
        messages: [
          {
            role: "user",
            content: prompt,
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
 *
 * Alternative provider with good multilingual support.
 *
 * @param prompt - The analysis prompt
 * @param apiKey - Your Google AI API key
 * @param model - Model to use (default: gemini-1.5-pro)
 */
export async function callGemini(
  prompt: string,
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
              parts: [{ text: prompt }],
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
 *
 * Alternative provider with GPT-4 models.
 *
 * @param prompt - The analysis prompt
 * @param apiKey - Your OpenAI API key
 * @param model - Model to use (default: gpt-4o)
 */
export async function callOpenAI(
  prompt: string,
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
            content: "You are a regulatory compliance expert. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
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
// STREAMING AI PROVIDERS
// =============================================================================

/**
 * Stream from Anthropic Claude API
 * Returns an async generator yielding text chunks
 */
export async function* streamAnthropic(
  prompt: string,
  apiKey: string,
  model: string = "claude-opus-4-5-20251101"
): AsyncGenerator<string, void, unknown> {
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
        stream: true,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${error}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "content_block_delta" && parsed.delta?.text) {
              yield parsed.delta.text;
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Stream from Google Gemini API
 * Returns an async generator yielding text chunks
 */
export async function* streamGemini(
  prompt: string,
  apiKey: string,
  model: string = "gemini-1.5-pro"
): AsyncGenerator<string, void, unknown> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
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

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          try {
            const parsed = JSON.parse(data);
            const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              yield text;
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Stream from OpenAI API
 * Returns an async generator yielding text chunks
 */
export async function* streamOpenAI(
  prompt: string,
  apiKey: string,
  model: string = "gpt-4o"
): AsyncGenerator<string, void, unknown> {
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
        stream: true,
        messages: [
          {
            role: "system",
            content: "You are a regulatory compliance expert. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
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

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch {
            // Skip non-JSON lines
          }
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

// =============================================================================
// STREAMING ANALYSIS FUNCTION
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
 * Analyze an ICT contract with streaming support
 * Provides real-time feedback during analysis
 *
 * @param content - The contract text to analyze
 * @param options - Streaming analysis options
 * @returns The final analysis result
 *
 * @example
 * ```typescript
 * const result = await analyzeContractStream(contractText, {
 *   provider: 'anthropic',
 *   apiKey: process.env.ANTHROPIC_API_KEY!,
 *   fileName: 'contrat.pdf',
 *   onEvent: (event) => {
 *     if (event.type === 'chunk') {
 *       process.stdout.write(event.content);
 *     } else if (event.type === 'progress') {
 *       console.log(`[${event.phase}] ${event.message}`);
 *     }
 *   }
 * });
 * ```
 */
export async function analyzeContractStream(
  content: string,
  options: StreamAnalyzeOptions
): Promise<FrontendResponse> {
  const { provider, apiKey, model, fileName = "Document", onEvent, includeRaw } = options;

  // Validate content length
  if (content.length < CONFIG.MIN_CONTENT_CHARS) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      error: `Content too short (minimum ${CONFIG.MIN_CONTENT_CHARS} characters)`,
      code: 'CONTENT_TOO_SHORT'
    };
    emitEvent(onEvent, error);
    throw new Error(error.error);
  }

  if (content.length > CONFIG.MAX_CONTENT_CHARS) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      error: `Content too long (maximum ${CONFIG.MAX_CONTENT_CHARS} characters)`,
      code: 'CONTENT_TOO_LONG'
    };
    emitEvent(onEvent, error);
    throw new Error(error.error);
  }

  // Emit start event
  emitEvent(onEvent, {
    type: 'start',
    timestamp: Date.now(),
    fileName,
    provider
  });

  // Build prompt
  const prompt = buildPrompt(content);

  // Emit analyzing progress
  emitEvent(onEvent, {
    type: 'progress',
    timestamp: Date.now(),
    phase: 'analyzing',
    message: 'Envoi au modèle IA...',
    percent: 10
  });

  // Get the appropriate stream generator
  let streamGenerator: AsyncGenerator<string, void, unknown>;
  switch (provider) {
    case 'anthropic':
      streamGenerator = streamAnthropic(prompt, apiKey, model);
      break;
    case 'gemini':
      streamGenerator = streamGemini(prompt, apiKey, model);
      break;
    case 'openai':
      streamGenerator = streamOpenAI(prompt, apiKey, model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  // Collect streamed response
  let accumulated = "";
  let chunkCount = 0;

  try {
    for await (const chunk of streamGenerator) {
      accumulated += chunk;
      chunkCount++;

      // Emit chunk event
      emitEvent(onEvent, {
        type: 'chunk',
        timestamp: Date.now(),
        content: chunk,
        accumulated
      });

      // Emit progress periodically
      if (chunkCount % 50 === 0) {
        emitEvent(onEvent, {
          type: 'progress',
          timestamp: Date.now(),
          phase: 'analyzing',
          message: `Analyse en cours... (${accumulated.length} caractères reçus)`,
          percent: Math.min(80, 10 + Math.floor(accumulated.length / 500))
        });
      }
    }
  } catch (err) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'Unknown streaming error',
      code: 'STREAM_ERROR'
    };
    emitEvent(onEvent, error);
    throw err;
  }

  // Emit parsing progress
  emitEvent(onEvent, {
    type: 'progress',
    timestamp: Date.now(),
    phase: 'parsing',
    message: 'Parsing de la réponse JSON...',
    percent: 85
  });

  // Parse response
  let rawResult: ContractAnalysis;
  try {
    rawResult = parseAIResponse(accumulated, fileName);
  } catch (err) {
    const error: StreamEvent = {
      type: 'error',
      timestamp: Date.now(),
      error: err instanceof Error ? err.message : 'JSON parse error',
      code: 'PARSE_ERROR'
    };
    emitEvent(onEvent, error);
    throw err;
  }

  // Emit generating progress
  emitEvent(onEvent, {
    type: 'progress',
    timestamp: Date.now(),
    phase: 'generating',
    message: 'Génération du rapport...',
    percent: 95
  });

  // Transform to frontend format
  const result = transformToFrontendFormat(rawResult);

  // Emit complete event
  emitEvent(onEvent, {
    type: 'complete',
    timestamp: Date.now(),
    result,
    ...(includeRaw ? { rawResult } : {})
  });

  return result;
}

/**
 * Analyze an ICT contract with streaming, returning raw result
 * Useful when you need access to recommended clauses and general clauses
 */
export async function analyzeContractStreamRaw(
  content: string,
  options: StreamAnalyzeOptions
): Promise<ContractAnalysis> {
  const modifiedOptions: StreamAnalyzeOptions = {
    ...options,
    includeRaw: true
  };

  // Use a promise to capture the raw result
  let capturedRaw: ContractAnalysis | null = null;
  const originalCallback = options.onEvent;

  modifiedOptions.onEvent = (event) => {
    if (event.type === 'complete' && event.rawResult) {
      capturedRaw = event.rawResult;
    }
    if (originalCallback) {
      originalCallback(event);
    }
  };

  await analyzeContractStream(content, modifiedOptions);

  if (!capturedRaw) {
    throw new Error("Failed to capture raw result");
  }

  return capturedRaw;
}

// =============================================================================
// MAIN ANALYSIS FUNCTION (NON-STREAMING)
// =============================================================================

// Types are now imported from ../types

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
  const prompt = buildPrompt(content);

  // Call AI provider
  let aiResponse: string;

  switch (options.provider) {
    case 'anthropic':
      aiResponse = await callAnthropic(prompt, options.apiKey, options.model);
      break;
    case 'gemini':
      aiResponse = await callGemini(prompt, options.apiKey, options.model);
      break;
    case 'openai':
      aiResponse = await callOpenAI(prompt, options.apiKey, options.model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${options.provider}`);
  }

  // Parse and transform response
  const rawResult = parseAIResponse(aiResponse, options.fileName || "Document");
  return transformToFrontendFormat(rawResult);
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
  const prompt = buildPrompt(content);

  // Call AI provider
  let aiResponse: string;

  switch (options.provider) {
    case 'anthropic':
      aiResponse = await callAnthropic(prompt, options.apiKey, options.model);
      break;
    case 'gemini':
      aiResponse = await callGemini(prompt, options.apiKey, options.model);
      break;
    case 'openai':
      aiResponse = await callOpenAI(prompt, options.apiKey, options.model);
      break;
    default:
      throw new Error(`Unknown AI provider: ${options.provider}`);
  }

  // Parse response
  return parseAIResponse(aiResponse, options.fileName || "Document");
}

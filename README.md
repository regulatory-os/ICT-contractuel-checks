# ICT-Contractual-Checks

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Open Source](https://img.shields.io/badge/Open%20Source-AGPL--3.0-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](package.json)

Audit automatisé par IA de la conformité des contrats d'externalisation ICT aux exigences DORA, EBA et Arrêté 2014.

**[Demo en ligne](https://regulatoryos.fr/tools/ict-check)** | **[Regulatory OS](https://regulatoryos.fr)**

---

## À propos de ce projet

> **Je ne suis pas développeur.**
>
> Je suis un professionnel de la conformité réglementaire avec 10 ans d'expérience dans le secteur financier. Face à l'entrée en vigueur de DORA (Digital Operational Resilience Act) en janvier 2025, j'ai constaté que l'audit manuel des contrats d'externalisation ICT est un processus long, fastidieux et sujet aux erreurs humaines.
>
> J'ai créé cet outil pour automatiser l'analyse des clauses contractuelles et identifier rapidement les gaps de conformité. L'objectif n'est pas de remplacer l'expertise humaine, mais de l'augmenter en fournissant une première analyse structurée.

**[Robin Jacquet](https://www.linkedin.com/in/robin-jacquet/)** — Regulatory Compliance Professional

---

## Fonctionnalités

- **42 exigences vérifiées** : DORA Article 30, EBA Guidelines (EBA/GL/2019/02), Arrêté du 3 novembre 2014
- **Analyse IA** : Utilise Claude Opus 4.5 (ou Gemini/GPT-4 en alternative)
- **Streaming en temps réel** : Suivez l'analyse en direct avec des événements de progression (v1.1.0)
- **Détection intelligente** : Identifie les clauses générales de conformité (statut IMPLICIT)
- **Clauses de remédiation** : Génère des propositions de clauses FR/EN pour les gaps identifiés
- **Score de conformité** : Score global de 0 à 100%
- **Export** : PDF et Excel pour les rapports
- **Standalone** : Aucune dépendance externe (pas de Supabase requis)

---

## Installation

```bash
# Cloner le repository
git clone https://github.com/regulatory-os/ICT-contractuel-checks.git
cd ICT-contractuel-checks

# Installer les dépendances
npm install
```

---

## Utilisation

### 1. Configuration de l'API Key

L'outil supporte plusieurs fournisseurs d'IA. Configurez votre clé API :

```bash
# Option 1: Anthropic Claude (recommandé)
export ANTHROPIC_API_KEY="sk-ant-api03-..."

# Option 2: Google Gemini
export GEMINI_API_KEY="AIzaSy..."

# Option 3: OpenAI
export OPENAI_API_KEY="sk-..."
```

### 2. Analyse d'un contrat

```typescript
import { analyzeContract } from './src/lib/analyzer';
import * as fs from 'fs';

// Lire le contrat
const contractText = fs.readFileSync('mon-contrat.txt', 'utf-8');

// Analyser
const result = await analyzeContract(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  fileName: 'Contrat Fournisseur XYZ'
});

// Afficher les résultats
console.log(`Score de conformité: ${result.overallScore}%`);
console.log(`Résumé: ${result.summary}`);

result.findings.forEach(finding => {
  console.log(`${finding.requirement}: ${finding.status}`);
  if (finding.status !== 'compliant') {
    console.log(`  → ${finding.details}`);
    if (finding.recommendation) {
      console.log(`  📝 ${finding.recommendation}`);
    }
  }
});
```

### 3. Analyse avec streaming (v1.1.0)

Pour une meilleure expérience utilisateur avec feedback en temps réel :

```typescript
import { analyzeContractStream } from './src/lib/analyzer';

const result = await analyzeContractStream(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  fileName: 'Contrat Fournisseur XYZ',
  onEvent: (event) => {
    switch (event.type) {
      case 'start':
        console.log(`🚀 Début de l'analyse: ${event.fileName}`);
        break;
      case 'progress':
        console.log(`⏳ [${event.phase}] ${event.message} (${event.percent}%)`);
        break;
      case 'chunk':
        process.stdout.write('.'); // Indicateur de progression
        break;
      case 'complete':
        console.log(`\n✅ Analyse terminée: ${event.result.overallScore}%`);
        break;
      case 'error':
        console.error(`❌ Erreur: ${event.error}`);
        break;
    }
  }
});
```

### 4. Accès aux données brutes

Pour accéder aux clauses recommandées et aux clauses générales détectées :

```typescript
import { analyzeContractRaw, analyzeContractStreamRaw } from './src/lib/analyzer';

// Version standard
const rawResult = await analyzeContractRaw(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Ou version streaming
const rawResultStream = await analyzeContractStreamRaw(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  onEvent: (event) => { /* ... */ }
});

// Clauses générales de conformité détectées
console.log('Clauses générales:', rawResult.generalClauses);

// Clauses recommandées pour les gaps
rawResult.recommendedClauses.forEach(clause => {
  console.log(`\n📋 ${clause.title} (${clause.reference})`);
  console.log(`FR: ${clause.textFr}`);
  console.log(`EN: ${clause.textEn}`);
});
```

---

## Checklist des 42 exigences

| Section | ID | Exigence | Criticité | Référence |
|---------|-----|----------|-----------|-----------|
| **A. Généralités** | A1 | Contrat écrit unique | MINOR | DORA 30.1 |
| | A2 | Description des services | MAJOR | DORA 30.2(a) |
| | A3 | Durée et préavis | MINOR | ABE GL 75b |
| | A4 | Droit applicable | MINOR | ABE GL 75c |
| | A5 | Obligations financières | MINOR | ABE GL 75d |
| **B. Sous-traitance** | B6 | Autorisation sous-traitance | MAJOR | DORA 30.2(a) |
| | B7 | Activités exclues | MINOR | ABE GL 78a |
| | B8 | Conditions sous-traitance | MINOR | ABE GL 78b |
| | B9 | Supervision sous-traitants | MAJOR | ABE GL 78c |
| | B10 | Notification préalable | MAJOR | DORA 30.3(b) |
| | B11 | Résiliation (Sous-traitance) | MAJOR | ABE GL 78f |
| | B12 | Engagements sous-traitant | MAJOR | ABE GL 79 |
| **C. Localisation** | C13 | Localisation données | MAJOR | DORA 30.2(b) |
| | C14 | Notif. changement lieu | MAJOR | DORA 30.2(b) |
| **D. Protection Données** | D15 | Sécurité (CIA) | MAJOR | DORA 30.2(c) |
| | D16 | Approche par risques | MINOR | ABE GL 83 |
| | D17 | RGPD & Secret Bancaire | MAJOR | ABE GL 84 |
| | D18 | Accès et restitution | MAJOR | DORA 30.2(d) |
| **E. SLA** | E19 | Description SLA | MAJOR | DORA 30.2(e) |
| | E20 | SLA Détaillés (Critique) | MAJOR | DORA 30.3(a) |
| **F. Incidents** | F21 | Assistance Incident (Coût) | **CRITICAL** | DORA 30.2(f) |
| | F22 | Notification Incidents | MAJOR | DORA 30.3(b) |
| | F23 | Continuité (BCP) | MAJOR | DORA 30.3(c) |
| **G. Autorités** | G24 | Coopération Autorités | MAJOR | DORA 30.2(g) |
| **H. Sortie** | H25 | Droits de résiliation | MAJOR | DORA 30.2(h) |
| | H26 | Transition Obligatoire | **CRITICAL** | DORA 30.3(f)(i) |
| **I. Audit** | I27 | Monitoring continu | MAJOR | DORA 30.3(e) |
| | I28 | Droits d'Audit/Accès | MAJOR | ABE GL 87 |
| | I29 | Assurance Alternative | MINOR | ABE GL 91 |
| | I30 | Coopération Audit | MAJOR | ABE GL 95 |
| | I31 | Détails Audit | MINOR | ABE GL 90 |
| **J. Nouveautés DORA** | J32 | Formation Sécurité ICT | **CRITICAL** | DORA 30.2(i) |
| | J33 | Tests TLPT | **CRITICAL** | DORA 30.3(d) |
| | J34 | Transition Obligatoire | **CRITICAL** | DORA 30.3(f)(i) |
| **K. Spécificités FR** | K35 | Définition Activités | MINOR | Arrêté Art. 10 q) |
| | K36 | Prestations Essentielles | MINOR | Arrêté Art. 10 r) |
| | K37 | Agrément Prestataire | MINOR | Arrêté Art. 231 |
| | K40 | Responsabilité Entité | MAJOR | Arrêté Art. 237 |
| | K42 | Modif. Substantielle | MAJOR | Arrêté Art. 239 d) |

---

## Statuts d'analyse

| Statut | Description |
|--------|-------------|
| ✅ `COMPLIANT` | Clause spécifique et détaillée présente |
| ⚠️ `PARTIAL` | Clause existe mais incomplète ou vague |
| 💡 `IMPLICIT` | Couvert par clause générale de conformité |
| ❌ `ABSENT` | Aucune clause détectée |
| ➖ `NA` | Non applicable au contrat |

---

## Spécifications techniques

### Paramètres de l'IA

| Paramètre | Valeur | Raison |
|-----------|--------|--------|
| **Temperature** | `0.0` | Output déterministe pour l'analyse de conformité |
| **Max Output Tokens** | `16000` | Permet l'analyse détaillée + clauses de remédiation |
| **Timeout** | `120s` | Documents longs (~60 pages) |
| **Max Input** | `120000` chars | ~60 pages de texte |

### Modèles supportés

| Provider | Modèle par défaut | Alternative |
|----------|-------------------|-------------|
| Anthropic | `claude-opus-4-5-20251101` | `claude-sonnet-4-5-20250929` |
| Google | `gemini-1.5-pro` | `gemini-2.0-flash` |
| OpenAI | `gpt-4o` | `gpt-4-turbo` |

### Types de streaming (v1.1.0)

```typescript
// Types d'événements disponibles
type StreamEventType = 'start' | 'chunk' | 'progress' | 'complete' | 'error';

// Événement de progression
interface StreamEventProgress {
  type: 'progress';
  timestamp: number;
  phase: 'parsing' | 'analyzing' | 'generating';
  message: string;
  percent?: number;
}

// Options de streaming
interface StreamAnalyzeOptions {
  provider: 'anthropic' | 'gemini' | 'openai';
  apiKey: string;
  model?: string;
  fileName?: string;
  onEvent?: (event: StreamEvent) => void;
  includeRaw?: boolean;
}
```

### Coût indicatif (Claude Opus 4.5)

- **Input** : $5 / million tokens
- **Output** : $25 / million tokens
- **Estimation par contrat** : ~$0.50-2.00 selon la taille

[Voir tarifs Anthropic](https://www.anthropic.com/pricing)

---

## Déploiement

### Option 1: Supabase Edge Function

```typescript
// supabase/functions/analyze-ict-check/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzeContract } from "./analyzer.ts";

serve(async (req) => {
  const { content, fileName } = await req.json();

  const result = await analyzeContract(content, {
    provider: 'anthropic',
    apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    fileName
  });

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### Option 2: API Express/Node.js

```typescript
import express from 'express';
import { analyzeContract } from './src/lib/analyzer';

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/api/analyze', async (req, res) => {
  try {
    const result = await analyzeContract(req.body.content, {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY!,
      fileName: req.body.fileName
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Option 3: Avec persistance SQL (Optionnel)

Un schéma SQL est disponible dans `sql/schema.sql` pour persister les analyses :

```bash
# PostgreSQL / Supabase / Neon
psql -d your_database -f sql/schema.sql
```

**Tables disponibles :**

| Table | Description |
|-------|-------------|
| `analyses` | Historique des analyses (score, date, provider) |
| `findings` | Résultats par exigence (42 lignes par analyse) |
| `recommended_clauses` | Clauses de remédiation FR/EN |
| `contracts` | Métadonnées des contrats (optionnel) |

**Vues utiles :**
- `v_analysis_summary` : Résumé avec compteurs par statut
- `v_common_gaps` : Exigences les plus souvent absentes
- `v_provider_scores` : Score moyen par fournisseur

---

## Limitations

1. **Pas un avis juridique** : L'outil fournit une analyse indicative, pas un conseil juridique
2. **Qualité du texte** : Les PDF scannés ou mal OCRisés donnent de moins bons résultats
3. **Contexte** : L'IA ne connaît pas le contexte spécifique de votre organisation
4. **Mise à jour** : La checklist doit être mise à jour si les réglementations évoluent

---

## Contribuer

Les contributions sont les bienvenues ! Ce projet est sous licence AGPL-3.0 :

- Toute modification doit être partagée sous la même licence
- Les déploiements SaaS doivent rendre le code source disponible
- Attribution requise

```bash
# Fork le repo
git clone https://github.com/YOUR_USERNAME/ICT-contractuel-checks.git

# Créer une branche
git checkout -b feature/ma-contribution

# Commit et push
git commit -m "feat: description"
git push origin feature/ma-contribution

# Créer une Pull Request
```

---

## Licence

Ce projet est sous licence **AGPL-3.0** (GNU Affero General Public License v3.0).

Cela signifie :
- ✅ Utilisation libre pour usage personnel et commercial
- ✅ Modification et distribution autorisées
- ⚠️ Les modifications doivent être partagées sous AGPL-3.0
- ⚠️ Les déploiements SaaS doivent fournir le code source aux utilisateurs

[Voir le texte complet de la licence](LICENSE)

---

## Auteur

**Robin Jacquet** — Professionnel de la conformité réglementaire, 10 ans d'expérience

- LinkedIn : [robin-jacquet](https://www.linkedin.com/in/robin-jacquet/)
- Email : robin.jacquet@regulatoryos.fr
- Site : [Regulatory OS](https://regulatoryos.fr)

---

## Changelog

### v1.1.0 (Janvier 2026)

**Nouvelles fonctionnalités :**
- ✨ **Streaming en temps réel** : Nouvelles fonctions `analyzeContractStream()` et `analyzeContractStreamRaw()` pour suivre l'analyse en direct
- 📡 **Événements de progression** : Types `StreamEvent` avec phases (analyzing, parsing, generating)
- 🔧 **Types améliorés** : Export des types `StreamAnalyzeOptions`, `StreamCallback`, `AIProvider`
- 📦 **Module exports** : Support des imports séparés (`./types`, `./checklist`)
- 🗄️ **Schéma SQL optionnel** : `sql/schema.sql` pour persistance PostgreSQL/Supabase

**Améliorations :**
- Version standalone (aucune dépendance Supabase requise)
- Support Node.js >= 18.0.0 (fetch natif)
- Meilleure gestion des erreurs avec codes
- Vues SQL pour reporting (`v_analysis_summary`, `v_common_gaps`)

### v1.0.0 (Décembre 2025)

- Version initiale
- 42 exigences DORA/EBA/Arrêté 2014
- Support Claude, Gemini, OpenAI
- Détection clauses générales (IMPLICIT)
- Génération clauses de remédiation FR/EN

---

## Voir aussi

- [African-screening](https://github.com/regulatory-os/African-screening) — Screening contre les listes de sanctions UEMOA/CEMAC
- [Regulatory OS](https://regulatoryos.fr) — Plateforme open source de conformité réglementaire

---

*Dernière mise à jour : Janvier 2026*

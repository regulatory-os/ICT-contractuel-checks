# ICT-Contractual-Checks

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Open Source](https://img.shields.io/badge/Open%20Source-AGPL--3.0-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green.svg)](package.json)

Audit automatisé par IA de la conformité des contrats d'externalisation ICT aux exigences DORA, EBA et Arrêté 2014.

**[Demo en ligne](https://regulatoryos.fr/tools/ict-check)** | **[Regulatory OS](https://regulatoryos.fr)**

---

## A propos de ce projet

> **Je ne suis pas développeur.**
>
> Je suis un professionnel de la conformité réglementaire avec 10 ans d'expérience dans le secteur financier. Face à l'entrée en vigueur de DORA (Digital Operational Resilience Act) en janvier 2025, j'ai constaté que l'audit manuel des contrats d'externalisation ICT est un processus long, fastidieux et sujet aux erreurs humaines.
>
> J'ai créé cet outil pour automatiser l'analyse des clauses contractuelles et identifier rapidement les gaps de conformité. L'objectif n'est pas de remplacer l'expertise humaine, mais de l'augmenter en fournissant une première analyse structurée.

**[Robin Jacquet](https://www.linkedin.com/in/robin-jacquet/)** — Regulatory Compliance Professional

---

## Fonctionnalités v2.0.0

- **35 exigences vérifiées** : Checklist v3.0 restructurée en 4 sections
  - Section I: Tous les contrats ICT (10 exigences) - DORA 30.1 + 30.2
  - Section II: Fonctions critiques (10 exigences) - DORA 30.3
  - Section III: Spécificités EBA (3 exigences)
  - Section IV: Spécificités françaises (12 exigences) - Arrêté 2014
- **Scoring v3.1** : Pondération par criticité (CRITICAL=3, MAJOR=2, MINOR=1)
- **Exigences CRITICAL** : 4 exigences ne pouvant pas être IMPLICIT (I.7, I.10, II.4, II.10)
- **Récupération de troncature** : Parsing robuste des réponses JSON tronquées
- **Auto-recommandation** : Génération automatique de suggestions pour les gaps
- **Analyse IA** : Multi-provider (Claude, Gemini, OpenAI)
- **Détection intelligente** : Identifie les clauses générales de conformité (statut IMPLICIT)
- **Clauses de remédiation** : Génère des propositions de clauses FR/EN
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
  console.log(`[${finding.requirementId}] ${finding.requirement}: ${finding.status}`);
  console.log(`  Criticité: ${finding.criticality}`);
  if (finding.status !== 'compliant') {
    console.log(`  → ${finding.details}`);
    if (finding.recommendation) {
      console.log(`  Recommandation: ${finding.recommendation}`);
    }
  }
});
```

### 3. Analyse avec événements de progression

Pour une meilleure expérience utilisateur avec feedback :

```typescript
import { analyzeContractWithEvents } from './src/lib/analyzer';

const result = await analyzeContractWithEvents(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
  fileName: 'Contrat Fournisseur XYZ',
  onEvent: (event) => {
    switch (event.type) {
      case 'start':
        console.log(`Début de l'analyse (${event.totalSteps} étapes)`);
        break;
      case 'step':
        console.log(`[${event.step}/${4}] ${event.label}`);
        break;
      case 'done':
        console.log(`Analyse terminée: ${event.data.overallScore}%`);
        break;
      case 'error':
        console.error(`Erreur: ${event.message}`);
        break;
    }
  }
});
```

### 4. Accès aux données brutes

Pour accéder aux clauses recommandées et aux clauses générales détectées :

```typescript
import { analyzeContractRaw } from './src/lib/analyzer';

const rawResult = await analyzeContractRaw(contractText, {
  provider: 'anthropic',
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Clauses générales de conformité détectées
console.log('Clauses générales:', rawResult.generalClauses);

// Clauses recommandées pour les gaps
rawResult.recommendedClauses.forEach(clause => {
  console.log(`\n${clause.title} (${clause.reference})`);
  console.log(`FR: ${clause.textFr}`);
  console.log(`EN: ${clause.textEn}`);
});
```

---

## Checklist v3.0 : 35 exigences

### Section I : Tous les contrats ICT (10 exigences)
*Base: DORA Article 30.1 + 30.2*

| ID | Exigence | Criticité | Référence |
|----|----------|-----------|-----------|
| I.1 | Contrat écrit unique | MINOR | DORA 30.1 |
| I.2 | Description services + sous-traitance | MAJOR | DORA 30.2(a) |
| I.3 | Localisation + notification | MAJOR | DORA 30.2(b) |
| I.4 | Protection données (DAIC) | MAJOR | DORA 30.2(c) |
| I.5 | Accès et restitution données | MAJOR | DORA 30.2(d) |
| I.6 | SLA avec RTO/RPO | MAJOR | DORA 30.2(e) |
| **I.7** | **Assistance incident (coût)** | **CRITICAL** | DORA 30.2(f) |
| I.8 | Coopération autorités | MAJOR | DORA 30.2(g) |
| I.9 | Droits de résiliation | MAJOR | DORA 30.2(h) |
| **I.10** | **Formation sécurité ICT** | **CRITICAL** | DORA 30.2(i) |

### Section II : Fonctions critiques (10 exigences)
*Base: DORA Article 30.3 - Uniquement pour services ICT soutenant fonctions critiques*

| ID | Exigence | Criticité | Référence |
|----|----------|-----------|-----------|
| II.1 | SLA détaillés + actions correctives | MAJOR | DORA 30.3(a) |
| II.2 | Notification incidents | MAJOR | DORA 30.3(b) |
| II.3 | BCP + tests + sécurité ICT | MAJOR | DORA 30.3(c) |
| **II.4** | **Tests TLPT** | **CRITICAL** | DORA 30.3(d) |
| II.5 | Monitoring continu | MAJOR | DORA 30.3(e) |
| II.6 | Droits audit illimités | MAJOR | DORA 30.3(e)(i) |
| II.7 | Assurance alternative (pooled) | MINOR | DORA 30.3(e)(ii) |
| II.8 | Coopération audits | MAJOR | DORA 30.3(e)(iii) |
| II.9 | Scope/fréquence audits | MINOR | DORA 30.3(e)(iv) |
| **II.10** | **Transition OBLIGATOIRE** | **CRITICAL** | DORA 30.3(f) |

### Section III : Spécificités EBA (3 exigences)

| ID | Exigence | Criticité | Référence |
|----|----------|-----------|-----------|
| III.1 | Contrat écrit (EBA) | MAJOR | EBA GL 74 |
| III.2 | Assurance obligatoire | MINOR | EBA GL 75k |
| III.3 | Autorité de résolution | MINOR | EBA GL 75o |

### Section IV : Spécificités françaises (12 exigences)
*Base: Arrêté du 3 novembre 2014*

| ID | Exigence | Criticité | Référence |
|----|----------|-----------|-----------|
| IV.1 | Définition activités | MINOR | Art. 10 q) |
| IV.2 | Définition PSEE | MINOR | Art. 10 r) |
| IV.3 | Agrément prestataire | MINOR | Art. 231 |
| IV.4 | Responsabilité entité | MAJOR | Art. 237 |
| IV.5 | Protection confidentialité | MAJOR | Art. 239 b) |
| IV.6 | Mécanismes secours | MAJOR | Art. 239 c) |
| IV.7 | Modification substantielle | MAJOR | Art. 239 d) |
| IV.8 | Conformité procédures | MAJOR | Art. 239 e) |
| IV.9 | Accès sur place | MAJOR | Art. 239 f) |
| IV.10 | Notification événements | MAJOR | Art. 239 g) |
| IV.11 | Accès ACPR | MAJOR | Art. 239 h) |
| IV.12 | Engagement SLA | MAJOR | Art. 239 a) |

---

## Scoring v3.1 : Pondération par criticité

### Formule

```
Score = Σ(valeurStatut × coeffCriticité) / Σ(100 × coeffCriticité) × 100
```

### Coefficients

| Criticité | Poids |
|-----------|-------|
| CRITICAL | 3 |
| MAJOR | 2 |
| MINOR | 1 |

### Valeurs de statut

| Statut | Valeur | Description |
|--------|--------|-------------|
| COMPLIANT | 100 | Clause spécifique et détaillée présente |
| IMPLICIT | 70 | Couvert par clause générale de conformité |
| PARTIAL | 30 | Clause existe mais incomplète ou vague |
| ABSENT | 0 | Aucune clause détectée |
| NA | - | Exclu du calcul |

### Exigences CRITICAL

Les 4 exigences suivantes **ne peuvent JAMAIS être IMPLICIT** :

| ID | Exigence | Raison |
|----|----------|--------|
| I.7 | Assistance incident | DORA renforce EBA |
| I.10 | Formation sécurité ICT | Nouveauté DORA |
| II.4 | Tests TLPT | Nouveauté DORA |
| II.10 | Transition OBLIGATOIRE | DORA renforce EBA |

Si une clause générale existe mais pas de clause spécifique, ces exigences sont marquées **PARTIAL** avec un avertissement.

---

## Spécifications techniques

### Paramètres de l'IA

| Paramètre | Valeur | Raison |
|-----------|--------|--------|
| **Temperature** | `0.0` | Output déterministe pour l'analyse de conformité |
| **Max Output Tokens** | `32000` | Analyse détaillée + clauses de remédiation |
| **Timeout** | `120s` | Documents longs (~60 pages) |
| **Max Input** | `120000` chars | ~60 pages de texte |

### Modèles supportés

| Provider | Modèle par défaut | Alternative |
|----------|-------------------|-------------|
| Anthropic | `claude-sonnet-4-5-20250514` | `claude-opus-4-5-20251101` |
| Google | `gemini-1.5-pro` | `gemini-2.0-flash` |
| OpenAI | `gpt-4o` | `gpt-4-turbo` |

---

## Déploiement

### Option 1: API Express/Node.js

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

### Option 2: Avec persistance SQL (Optionnel)

Un schéma SQL est disponible dans `sql/schema.sql` pour persister les analyses :

```bash
# PostgreSQL / Supabase / Neon
psql -d your_database -f sql/schema.sql
```

**Tables disponibles :**

| Table | Description |
|-------|-------------|
| `analyses` | Historique des analyses (score, date, provider) |
| `findings` | Résultats par exigence (35 lignes par analyse) |
| `recommended_clauses` | Clauses de remédiation FR/EN |
| `contracts` | Métadonnées des contrats (optionnel) |

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

---

## Licence

Ce projet est sous licence **AGPL-3.0** (GNU Affero General Public License v3.0).

[Voir le texte complet de la licence](LICENSE)

---

## Auteur

**Robin Jacquet** — Professionnel de la conformité réglementaire, 10 ans d'expérience

- LinkedIn : [robin-jacquet](https://www.linkedin.com/in/robin-jacquet/)
- Email : robin.jacquet@regulatoryos.fr
- Site : [Regulatory OS](https://regulatoryos.fr)

---

## Changelog

### v2.0.0 (Janvier 2026)

**Refonte majeure - Synchronisation avec regulatory-os source**

**Checklist v3.0 :**
- **35 exigences** restructurées en 4 sections (vs 42 avant)
- Section I: Tous les contrats ICT (10) - DORA 30.1 + 30.2
- Section II: Fonctions critiques (10) - DORA 30.3
- Section III: Spécificités EBA (3)
- Section IV: Spécificités françaises (12) - Arrêté 2014
- Champ `applicability` : ALL, CRITICAL_FUNCTIONS, EBA_ONLY, FR_ONLY
- Nouveaux flags : `isNewDORA`, `isDORAEnhanced`

**Scoring v3.1 :**
- Pondération par criticité (CRITICAL=3, MAJOR=2, MINOR=1)
- 4 exigences CRITICAL ne pouvant pas être IMPLICIT (I.7, I.10, II.4, II.10)
- Validation automatique avec conversion IMPLICIT → PARTIAL + avertissement

**Améliorations techniques :**
- Récupération de troncature JSON (parsing robuste)
- Auto-génération de recommandations pour ABSENT/PARTIAL
- Prompt v3.0 avec règles d'analyse détaillées
- Types enrichis : Section, Applicability, RegulatoryText, Keywords
- FindingFrontend enrichi : requirementId, section, criticality, reference

### v1.1.0 (Janvier 2026)

- Streaming en temps réel
- Schéma SQL optionnel
- Support Node.js >= 18.0.0

### v1.0.0 (Décembre 2025)

- Version initiale
- 42 exigences DORA/EBA/Arrêté 2014
- Support Claude, Gemini, OpenAI

---

## Voir aussi

- [African-screening](https://github.com/regulatory-os/African-screening) — Screening contre les listes de sanctions UEMOA/CEMAC
- [Regulatory OS](https://regulatoryos.fr) — Plateforme open source de conformité réglementaire

---

*Dernière mise à jour : Janvier 2026*

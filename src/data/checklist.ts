/**
 * ICT Contract Compliance Checklist v3.0
 *
 * 35 requirements covering:
 * - DORA Article 30 (Digital Operational Resilience Act)
 * - EBA Guidelines (EBA/GL/2019/02)
 * - French Arrêté du 3 novembre 2014 (ACPR)
 *
 * Structure:
 * - Section I:   ALL contracts (10 requirements)
 * - Section II:  Critical functions only (10 requirements)
 * - Section III: EBA specificities (3 requirements)
 * - Section IV:  French specificities (12 requirements)
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 * @version 2.0.0
 */

import { Requirement } from '../types';

export const CHECKLIST: Requirement[] = [
  // =========================================================================
  // SECTION I: TOUS LES CONTRATS ICT (10 exigences)
  // Base: DORA Article 30.1 + 30.2 | EBA GL 74
  // =========================================================================
  {
    id: 'I.1',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Contrat écrit unique',
    reference: 'DORA 30.1 | EBA GL 74 | FR Art.238b',
    criticality: 'MINOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Les droits et obligations de l'entité financière et du prestataire tiers de services TIC sont définis clairement et consignés par écrit. L'intégralité du contrat comprend les accords de niveau de service et est consignée dans un document écrit unique.",
      eba: "The rights and obligations of the institution and the service provider should be clearly allocated and set out in a written agreement.",
      fr: "Donne lieu à un contrat écrit entre le prestataire externe et l'entreprise assujettie."
    },
    keywords: {
      fr: ['contrat', 'convention', 'accord', 'document unique', 'écrit', 'droits', 'obligations'],
      en: ['contract', 'agreement', 'written', 'single document', 'rights', 'obligations']
    },
    verificationCriteria: 'Document unique écrit (ou ensemble cohérent) définissant clairement droits/obligations + SLA intégrés'
  },
  {
    id: 'I.2',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Description des services TIC et gouvernance de la sous-traitance',
    reference: 'DORA 30.2(a) | EBA GL 74, 75c-d',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Une description claire et exhaustive de tous les services TIC et fonctions qui seront fournis par le prestataire tiers de services TIC, indiquant si la sous-traitance d'un service TIC qui soutient une fonction critique ou importante est autorisée et les conditions applicables.",
      eba: "Le contrat doit prévoir les conditions de sous-traitance, incluant notification préalable, droit d'opposition, visibilité sur la chaîne de sous-traitance, et maintien de la responsabilité du prestataire principal."
    },
    keywords: {
      fr: ['description', 'services', 'prestations', 'périmètre', 'objet', 'fonctions', 'sous-traitance', 'autorisée', 'conditions', 'opposition', 'notification', 'chaîne', 'sous-traitants', 'responsabilité', 'sélection', 'critères', 'délai', 'préavis'],
      en: ['description', 'services', 'scope', 'deliverables', 'functions', 'subcontracting', 'permitted', 'conditions', 'objection', 'notification', 'supply chain', 'subcontractors', 'liability', 'selection criteria', 'notice period']
    },
    verificationCriteria: 'Vérifier: (1) Description détaillée services TIC, (2) Autorisation/interdiction sous-traitance explicite, (3) Droit opposition client nouveaux sous-traitants avec délai notification préalable, (4) Visibilité chaîne complète sous-traitants, (5) Critères sélection sous-traitants, (6) Responsabilité résiduelle prestataire principal. PARTIEL si 1-3 éléments manquants, ABSENT si >3 manquants.',
    notes: 'Évaluation graduée: COMPLIANT=6/6 éléments, PARTIAL=3-5 éléments, ABSENT=0-2 éléments. Le droit d\'opposition et la responsabilité résiduelle sont particulièrement surveillés par les régulateurs.'
  },
  {
    id: 'I.3',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Localisation des services et données + notification de changement',
    reference: 'DORA 30.2(b) | EBA GL 75f',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Les lieux, notamment les régions ou les pays, où les services TIC seront fournis et où les données seront traitées, y compris le lieu de stockage, et l'obligation pour le prestataire d'informer au préalable l'entité financière si celui-ci envisage de changer ces lieux."
    },
    keywords: {
      fr: ['localisation', 'hébergement', 'pays', 'région', 'stockage', 'traitement', 'data center', 'notification', 'changement'],
      en: ['location', 'country', 'region', 'data residency', 'storage', 'processing', 'data center', 'change notification']
    },
    verificationCriteria: 'Pays/régions de fourniture services ET de traitement/stockage données + obligation notification préalable tout changement'
  },
  {
    id: 'I.4',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Protection des données (Disponibilité, Authenticité, Intégrité, Confidentialité)',
    reference: 'DORA 30.2(c) | EBA GL 75g, 82',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Des dispositions sur la disponibilité, l'authenticité, l'intégrité et la confidentialité en ce qui concerne la protection des données, y compris les données à caractère personnel."
    },
    keywords: {
      fr: ['disponibilité', 'authenticité', 'intégrité', 'confidentialité', 'sécurité', 'protection', 'CIA', 'RGPD'],
      en: ['availability', 'authenticity', 'integrity', 'confidentiality', 'security', 'protection', 'CIA triad', 'GDPR']
    },
    verificationCriteria: 'Clauses couvrant les 4 piliers : disponibilité + authenticité + intégrité + confidentialité'
  },
  {
    id: 'I.5',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Accès, récupération et restitution des données',
    reference: 'DORA 30.2(d) | EBA GL 75m',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Des dispositions sur la garantie de l'accès, de la récupération et de la restitution, dans un format facilement accessible, des données en cas d'insolvabilité, de résolution ou de cessation des activités du prestataire ou de résiliation des accords contractuels."
    },
    keywords: {
      fr: ['restitution', 'récupération', 'portabilité', 'accès', 'format exploitable', 'insolvabilité', 'résiliation'],
      en: ['data return', 'recovery', 'portability', 'data access', 'accessible format', 'insolvency', 'termination']
    },
    verificationCriteria: 'Droit accès + récupération + restitution données format exploitable en cas fin/insolvabilité prestataire'
  },
  {
    id: 'I.6',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Descriptions des niveaux de service (SLA) avec RTO/RPO',
    reference: 'DORA 30.2(e) | EBA GL 75i | FR Art.239a',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Des descriptions des niveaux de service, y compris leurs mises à jour et révisions.",
      fr: "S'engagent sur un niveau de qualité répondant à un fonctionnement normal du service.",
      eba: "Les niveaux de service doivent inclure des objectifs de reprise (RTO/RPO) et un processus de revue périodique."
    },
    keywords: {
      fr: ['SLA', 'niveau de service', 'engagement', 'qualité', 'performance', 'disponibilité', 'KPI', 'RTO', 'RPO', 'temps de reprise', 'objectif de reprise', 'revue', 'révision', 'mise à jour'],
      en: ['SLA', 'service level', 'service commitment', 'performance', 'availability', 'uptime', 'KPI', 'RTO', 'RPO', 'recovery time', 'recovery point', 'review', 'revision', 'update']
    },
    verificationCriteria: 'Vérifier: (1) SLA avec indicateurs quantitatifs/qualitatifs, (2) RTO (Recovery Time Objective) explicite, (3) RPO (Recovery Point Objective) explicite, (4) Métriques de performance détaillées, (5) Processus de revue périodique des SLA. PARTIEL si éléments 1 présent mais 2-5 manquants.',
    notes: 'Un SLA sans RTO/RPO ni processus de revue est PARTIEL. La simple mention de disponibilité (99,5%) ne suffit pas - les objectifs de reprise doivent être explicites.'
  },
  {
    id: 'I.7',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Assistance en cas d\'incident ICT (sans frais ou coût prédéterminé)',
    reference: 'DORA 30.2(f)',
    criticality: 'CRITICAL',
    applicability: 'ALL',
    regulatoryText: {
      dora: "L'obligation pour le prestataire tiers de services TIC de fournir à l'entité financière, sans frais supplémentaires ou à un coût déterminé ex ante, une assistance en cas d'incident lié aux TIC."
    },
    keywords: {
      fr: ['assistance', 'incident', 'sans frais', 'supplémentaires', 'coût', 'prédéterminé', 'ex ante', 'support'],
      en: ['assistance', 'incident', 'no additional cost', 'predetermined cost', 'ex-ante', 'support']
    },
    verificationCriteria: 'Obligation assistance incident ICT + coût SOIT nul SOIT prédéterminé (pas "raisonnable" ou variable)',
    notes: 'CRITICAL: DORA renforce EBA. Vérifier coût explicitement "0" ou "prédéfini". Formulations vagues insuffisantes.',
    isDORAEnhanced: true
  },
  {
    id: 'I.8',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Coopération avec les autorités compétentes et de résolution',
    reference: 'DORA 30.2(g) | EBA GL 75n | FR Art.239h',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "L'obligation pour le prestataire tiers de services TIC de coopérer pleinement avec les autorités compétentes et les autorités de résolution de l'entité financière.",
      fr: "Acceptent que l'ACPR ou toute autre autorité étrangère équivalente ait accès aux informations sur les activités externalisées."
    },
    keywords: {
      fr: ['autorité', 'compétente', 'ACPR', 'AMF', 'régulateur', 'résolution', 'coopération', 'accès'],
      en: ['competent authority', 'regulator', 'supervisory', 'resolution authority', 'cooperation']
    },
    verificationCriteria: 'Obligation coopérer avec (a) autorités compétentes, (b) autorités résolution, (c) représentants'
  },
  {
    id: 'I.9',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Droits de résiliation',
    reference: 'DORA 30.2(h) | DORA 28.7 | EBA GL 75q, 98 | FR Art.238d',
    criticality: 'MAJOR',
    applicability: 'ALL',
    regulatoryText: {
      dora: "Les droits de résiliation et les délais de préavis minimaux correspondants pour la résiliation des accords contractuels, conformément aux attentes des autorités compétentes."
    },
    keywords: {
      fr: ['résiliation', 'rupture', 'fin', 'contrat', 'préavis', 'droit', 'résilier', 'manquement'],
      en: ['termination', 'exit', 'notice period', 'right to terminate', 'breach', 'material changes']
    },
    verificationCriteria: 'Droits résiliation incluant (a) manquement, (b) changements matériels, (c) faiblesses risque TIC, (d) instruction autorités'
  },
  {
    id: 'I.10',
    section: 'I',
    sectionName: 'Tous les contrats ICT',
    name: 'Participation aux programmes de formation sécurité ICT',
    reference: 'DORA 30.2(i)',
    criticality: 'CRITICAL',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Les conditions de participation des prestataires tiers de services TIC aux programmes de sensibilisation à la sécurité des TIC et aux formations à la résilience opérationnelle numérique."
    },
    keywords: {
      fr: ['formation', 'sensibilisation', 'programme', 'sécurité', 'ICT', 'résilience', 'training'],
      en: ['training', 'awareness', 'programme', 'ICT security', 'resilience', 'education']
    },
    verificationCriteria: 'Clause prévoyant (a) participation prestataire aux formations sécurité, (b) conditions participation (fréquence, format)',
    notes: 'CRITICAL: Nouveauté DORA Art. 30.3 scope - applicable uniquement aux fonctions critiques',
    isNewDORA: true
  },

  // =========================================================================
  // SECTION II: FONCTIONS CRITIQUES ADDITIONNELLES (10 exigences)
  // Base: DORA Article 30.3 | EBA GL 75
  // Applicabilité: UNIQUEMENT pour services TIC soutenant fonctions critiques
  // =========================================================================
  {
    id: 'II.1',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'SLA détaillés avec objectifs précis et actions correctives',
    reference: 'DORA 30.3(a) | EBA GL 75i',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Des descriptions complètes des niveaux de service, assorties d'objectifs de performance quantitatifs et qualitatifs précis, afin de permettre un suivi efficace et de prendre des mesures correctives appropriées lorsque les niveaux de service ne sont pas atteints."
    },
    keywords: {
      fr: ['objectifs', 'performance', 'KPI', 'seuils', 'mesures correctives', 'actions', 'pénalités', 'service credits'],
      en: ['performance targets', 'KPIs', 'thresholds', 'corrective actions', 'remediation', 'penalties']
    },
    verificationCriteria: 'SLA avec (a) objectifs quantitatifs/qualitatifs PRÉCIS, (b) processus monitoring, (c) actions correctives si non-atteinte'
  },
  {
    id: 'II.2',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Notification des incidents et développements matériels',
    reference: 'DORA 30.3(b) | EBA GL 75j | FR Art.239g',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Les obligations de notification du prestataire incluant la notification de tout développement susceptible d'avoir une incidence significative sur la capacité à fournir les services TIC.",
      fr: "Les informent de tout événement susceptible d'avoir un impact sensible sur leur capacité à exercer les tâches externalisées."
    },
    keywords: {
      fr: ['notification', 'incident', 'événement', 'impact sensible', 'reporting', 'alerte', 'développement'],
      en: ['notification', 'incident', 'material event', 'significant impact', 'reporting', 'alert']
    },
    verificationCriteria: 'Obligation notifier (a) incidents TIC, (b) développements impactant capacité fournir service conformément SLA'
  },
  {
    id: 'II.3',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Plan de continuité (BCP) + tests + mesures sécurité ICT',
    reference: 'DORA 30.3(c) | EBA GL 75l | FR Art.239c',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "L'obligation pour le prestataire de mettre en œuvre et de tester des plans d'urgence et de mettre en place des mesures de sécurité des TIC appropriées.",
      fr: "Mettent en œuvre des mécanismes de secours en cas de difficulté grave affectant la continuité du service."
    },
    keywords: {
      fr: ['BCP', 'PCA', 'PRA', 'continuité', 'reprise activité', 'plan secours', 'disaster recovery', 'tests'],
      en: ['BCP', 'DRP', 'business continuity', 'disaster recovery', 'contingency plan', 'testing']
    },
    verificationCriteria: '(a) Obligation BCP/DRP prestataire, (b) tests réguliers obligatoires, (c) mesures sécurité ICT appropriées'
  },
  {
    id: 'II.4',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Participation aux tests de pénétration TLPT',
    reference: 'DORA 30.3(d)',
    criticality: 'CRITICAL',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "L'obligation pour le prestataire de participer et de coopérer pleinement au test de pénétration fondé sur la menace (TLPT) effectué par l'entité financière visé aux articles 26 et 27."
    },
    keywords: {
      fr: ['TLPT', 'test pénétration', 'pentest', 'test intrusion', 'threat-led', 'red team'],
      en: ['TLPT', 'penetration testing', 'pentest', 'threat-led', 'red team', 'intrusion test']
    },
    verificationCriteria: 'Clause prévoyant (a) obligation participation TLPT, (b) coopération pleine prestataire (accès systèmes, infos techniques)',
    notes: 'CRITICAL: Nouveauté DORA - ne peut PAS être couvert par clause générale conformité EBA',
    isNewDORA: true
  },
  {
    id: 'II.5',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Droit de monitoring continu des performances',
    reference: 'DORA 30.3(e) | EBA GL 75h | FR Art.239e',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Le droit d'assurer un suivi permanent des performances du prestataire tiers de services TIC."
    },
    keywords: {
      fr: ['monitoring', 'suivi', 'contrôle', 'surveillance', 'performance', 'supervision continue'],
      en: ['monitoring', 'ongoing supervision', 'oversight', 'performance review', 'continuous']
    },
    verificationCriteria: 'Droit monitoring continu performance prestataire (voir détails II.6 à II.9)'
  },
  {
    id: 'II.6',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Droits d\'accès, d\'inspection et d\'audit illimités',
    reference: 'DORA 30.3(e)(i) | EBA GL 75p, 87 | FR Art.239f',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Les droits illimités d'accès, d'inspection et d'audit par l'entité financière ou par une tierce partie désignée, dont l'exercice effectif n'est pas entravé par d'autres accords contractuels.",
      fr: "Leur permettent, chaque fois que cela est nécessaire, l'accès sur place à toute information sur les services mis à leur disposition."
    },
    keywords: {
      fr: ['audit', 'inspection', 'accès', 'droits illimités', 'unrestricted', 'sans restriction', 'sur place'],
      en: ['audit rights', 'inspection', 'access', 'unrestricted', 'unlimited', 'on-site', 'unimpeded']
    },
    verificationCriteria: 'Droits (a) accès, (b) inspection, (c) audit - ILLIMITÉS et SANS RESTRICTION par autres clauses'
  },
  {
    id: 'II.7',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Niveaux d\'assurance alternatifs (pooled audit)',
    reference: 'DORA 30.3(e)(ii) | EBA GL 91',
    criticality: 'MINOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Le droit de convenir d'autres niveaux d'assurance si les droits d'autres clients sont affectés.",
      eba: "Institutions may use: pooled audits organised jointly with other clients; third-party certifications and audit reports."
    },
    keywords: {
      fr: ['audit mutualisé', 'audit groupé', 'certification tierce', 'rapport audit', 'assurance alternative'],
      en: ['pooled audit', 'joint audit', 'third-party certification', 'audit report', 'alternative assurance']
    },
    verificationCriteria: 'Possibilité niveaux assurance alternatifs (certifications, audits mutualisés) si droits autres clients affectés'
  },
  {
    id: 'II.8',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Coopération lors des inspections et audits',
    reference: 'DORA 30.3(e)(iii) | EBA GL 95',
    criticality: 'MAJOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "L'obligation pour le prestataire de coopérer pleinement lors des inspections sur place et des audits effectués par les autorités compétentes, l'entité financière ou une tierce partie."
    },
    keywords: {
      fr: ['coopération', 'facilitation', 'accompagnement', 'assistance audit', 'préavis'],
      en: ['cooperation', 'facilitation', 'escort', 'assist', 'audit notice']
    },
    verificationCriteria: 'Obligation coopération pleine lors audits/inspections (entité + autorités + tiers désignés)'
  },
  {
    id: 'II.9',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Détails sur le scope et la fréquence des audits',
    reference: 'DORA 30.3(e)(iv) | EBA GL 90',
    criticality: 'MINOR',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "L'obligation de fournir des précisions sur la portée, les procédures à suivre et la fréquence de ces inspections et audits."
    },
    keywords: {
      fr: ['périmètre audit', 'fréquence', 'procédures', 'programme audit', 'planning'],
      en: ['audit scope', 'frequency', 'procedures', 'audit program', 'schedule']
    },
    verificationCriteria: 'Détails sur (a) périmètre audits, (b) procédures, (c) fréquence'
  },
  {
    id: 'II.10',
    section: 'II',
    sectionName: 'Fonctions critiques additionnelles',
    name: 'Stratégie de sortie avec période de transition OBLIGATOIRE',
    reference: 'DORA 30.3(f) | EBA GL 99, 106-108',
    criticality: 'CRITICAL',
    applicability: 'CRITICAL_FUNCTIONS',
    regulatoryText: {
      dora: "Les stratégies de sortie, en particulier la fixation d'une période de transition adéquate OBLIGATOIRE : (i) au cours de laquelle le prestataire continuera à fournir les services, (ii) qui permet à l'entité de migrer vers un autre prestataire ou des solutions internes."
    },
    keywords: {
      fr: ['stratégie', 'sortie', 'exit', 'transition', 'OBLIGATOIRE', 'mandatory', 'réversibilité', 'migration'],
      en: ['exit strategy', 'mandatory transition', 'compulsory', 'reversibility', 'migration', 'handover']
    },
    verificationCriteria: '(a) Période transition explicitement OBLIGATOIRE (pas optionnelle), (b) assistance migration, (c) continuité services pendant transition',
    notes: 'CRITICAL: DORA renforce EBA (mandatory vs recommended). Termes insuffisants = "may continue", "if requested" - doit être MANDATORY',
    isDORAEnhanced: true
  },

  // =========================================================================
  // SECTION III: SPÉCIFICITÉS EBA (3 exigences non reprises par DORA)
  // Base: EBA GL 2019/02
  // =========================================================================
  {
    id: 'III.1',
    section: 'III',
    sectionName: 'Spécificités EBA',
    name: 'Contrat écrit (principe général EBA GL 74)',
    reference: 'EBA GL 74',
    criticality: 'MAJOR',
    applicability: 'EBA_ONLY',
    regulatoryText: {
      eba: "The rights and obligations of the institution and the service provider should be clearly allocated and set out in a written agreement."
    },
    keywords: {
      fr: ['contrat', 'écrit', 'accord', 'droits', 'obligations'],
      en: ['written', 'agreement', 'rights', 'obligations', 'contract']
    },
    verificationCriteria: 'Accord écrit clair définissant droits/obligations (souvent déjà couvert par I.1)'
  },
  {
    id: 'III.2',
    section: 'III',
    sectionName: 'Spécificités EBA',
    name: 'Assurance obligatoire contre certains risques',
    reference: 'EBA GL 75k',
    criticality: 'MINOR',
    applicability: 'EBA_ONLY',
    regulatoryText: {
      eba: "Whether the service provider should take mandatory insurance against certain risks (e.g. professional indemnity insurance)."
    },
    keywords: {
      fr: ['assurance', 'insurance', 'responsabilité professionnelle', 'indemnité', 'couverture'],
      en: ['insurance', 'professional indemnity', 'liability coverage', 'mandatory']
    },
    verificationCriteria: 'Mention si prestataire doit souscrire assurance obligatoire (responsabilité professionnelle, cyber, etc.)'
  },
  {
    id: 'III.3',
    section: 'III',
    sectionName: 'Spécificités EBA',
    name: 'Référence autorité de résolution nationale',
    reference: 'EBA GL 75o',
    criticality: 'MINOR',
    applicability: 'EBA_ONLY',
    regulatoryText: {
      eba: "A clear reference to the national resolution authority's power to exercise the rights to access, inspect and audit."
    },
    keywords: {
      fr: ['autorité résolution', 'pouvoir', 'modification contrat', 'Single Resolution Board'],
      en: ['resolution authority', 'power', 'amend agreement', 'SRB']
    },
    verificationCriteria: 'Référence explicite pouvoirs autorité résolution nationale (accès, audit, modification contrat)'
  },

  // =========================================================================
  // SECTION IV: SPÉCIFICITÉS FRANÇAISES - Arrêté du 3 novembre 2014 (12 exigences)
  // Base: Arrêté ACPR France
  // =========================================================================
  {
    id: 'IV.1',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Définition des activités externalisées',
    reference: 'Arrêté 2014 Art. 10 q)',
    criticality: 'MINOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Activités externalisées : les activités pour lesquelles l'entreprise assujettie confie à un tiers, de manière durable et à titre habituel, la réalisation de prestations de services ou d'autres tâches opérationnelles essentielles ou importantes."
    },
    keywords: {
      fr: ['activités externalisées', 'durable', 'habituel', 'sous-traitance'],
      en: ['outsourced activities', 'ongoing', 'regular', 'subcontracting']
    },
    verificationCriteria: 'Vérifier que contrat qualifie correctement activités selon définition française (durable + habituel)'
  },
  {
    id: 'IV.2',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Définition des prestations essentielles ou importantes (PSEE)',
    reference: 'Arrêté 2014 Art. 10 r)',
    criticality: 'MINOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Prestation de services essentielles ou importantes : les opérations de banque, services de paiement, services d'investissement, ou toute prestation dont une anomalie ou défaillance est susceptible de nuire sérieusement."
    },
    keywords: {
      fr: ['PSEE', 'essentiel', 'important', 'critique', 'anomalie', 'défaillance'],
      en: ['essential', 'important', 'critical', 'failure', 'deficiency']
    },
    verificationCriteria: 'Qualification correcte caractère essentiel/important selon critères français'
  },
  {
    id: 'IV.3',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Agrément ou habilitation du prestataire',
    reference: 'Arrêté 2014 Art. 231',
    criticality: 'MINOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Les entreprises assujetties s'assurent que toute prestation qui concourt de façon substantielle à la décision engageant l'entreprise n'est externalisée qu'auprès de personnes agréées ou habilitées."
    },
    keywords: {
      fr: ['agrément', 'habilitation', 'autorisation', 'licence', 'enregistrement'],
      en: ['authorization', 'license', 'approval', 'registration']
    },
    verificationCriteria: 'Vérification/mention agrément prestataire pour activités concernées'
  },
  {
    id: 'IV.4',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Maintien de la responsabilité de l\'entité',
    reference: 'Arrêté 2014 Art. 237',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Les entreprises assujetties qui externalisent des PSEE demeurent pleinement responsables du respect de toutes les obligations qui leur incombent. L'externalisation n'entraîne aucune délégation de la responsabilité des dirigeants effectifs."
    },
    keywords: {
      fr: ['responsabilité', 'délégation', 'dirigeants', 'non-transfert', 'expertise'],
      en: ['responsibility', 'delegation', 'non-transfer', 'retain', 'accountability']
    },
    verificationCriteria: 'Vérifier que contrat ne transfère PAS responsabilité réglementaire entité + maintien expertise interne'
  },
  {
    id: 'IV.5',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Protection des informations confidentielles',
    reference: 'Arrêté 2014 Art. 239 b)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Assurent la protection des informations confidentielles ayant trait à l'entreprise assujettie et à ses clients."
    },
    keywords: {
      fr: ['confidentialité', 'protection informations', 'secret', 'données clients'],
      en: ['confidentiality', 'information protection', 'secrecy', 'client data']
    },
    verificationCriteria: 'Clause protection informations confidentielles entreprise + clients'
  },
  {
    id: 'IV.6',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Mécanismes de secours (BCP)',
    reference: 'Arrêté 2014 Art. 239 c)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Mettent en œuvre des mécanismes de secours en cas de difficulté grave affectant la continuité du service. À défaut, les entreprises s'assurent que leur plan d'urgence tient compte de l'impossibilité pour le prestataire d'assurer sa prestation."
    },
    keywords: {
      fr: ['mécanismes secours', 'BCP', 'PCA', 'continuité', 'plan urgence'],
      en: ['contingency', 'BCP', 'continuity', 'emergency plan']
    },
    verificationCriteria: 'BCP prestataire OU plan entité couvrant défaillance prestataire'
  },
  {
    id: 'IV.7',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Interdiction modification substantielle sans accord',
    reference: 'Arrêté 2014 Art. 239 d)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Ne peuvent imposer une modification substantielle de la prestation qu'ils assurent sans l'accord préalable de l'entreprise assujettie."
    },
    keywords: {
      fr: ['modification', 'changement', 'accord préalable', 'substantiel'],
      en: ['modification', 'change', 'prior approval', 'consent', 'substantial']
    },
    verificationCriteria: 'Accord préalable requis pour toute modification substantielle services'
  },
  {
    id: 'IV.8',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Conformité aux procédures de contrôle',
    reference: 'Arrêté 2014 Art. 239 e)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Se conforment aux procédures définies par l'entreprise assujettie concernant l'organisation et la mise en œuvre du contrôle des services qu'ils fournissent."
    },
    keywords: {
      fr: ['procédures', 'contrôle', 'conformité', 'respect'],
      en: ['procedures', 'control', 'compliance', 'comply', 'adhere']
    },
    verificationCriteria: 'Obligation prestataire se conformer aux procédures contrôle définies par entité'
  },
  {
    id: 'IV.9',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Accès aux informations (y compris sur place)',
    reference: 'Arrêté 2014 Art. 239 f)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Leur permettent, chaque fois que cela est nécessaire, l'accès, le cas échéant, sur place, à toute information sur les services mis à leur disposition."
    },
    keywords: {
      fr: ['accès', 'informations', 'sur place', 'visite'],
      en: ['access', 'information', 'on-site', 'visit']
    },
    verificationCriteria: 'Droit accès infos (y compris sur place)'
  },
  {
    id: 'IV.10',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Information sur événements impactant la capacité',
    reference: 'Arrêté 2014 Art. 239 g)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Les informent de tout événement susceptible d'avoir un impact sensible sur leur capacité à exercer les tâches externalisées de manière efficace et conforme."
    },
    keywords: {
      fr: ['événement', 'impact', 'notification', 'capacité'],
      en: ['event', 'impact', 'notification', 'capacity']
    },
    verificationCriteria: 'Notification événements impactant capacité'
  },
  {
    id: 'IV.11',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Accès ACPR (autorité compétente)',
    reference: 'Arrêté 2014 Art. 239 h)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "Acceptent que l'Autorité de contrôle prudentiel et de résolution ou toute autre autorité étrangère équivalente ait accès aux informations sur les activités externalisées nécessaires à l'exercice de sa mission, y compris sur place."
    },
    keywords: {
      fr: ['ACPR', 'autorité', 'accès', 'sur place', 'mission'],
      en: ['ACPR', 'authority', 'access', 'on-site', 'supervision']
    },
    verificationCriteria: 'Accès ACPR aux informations (y compris sur place)'
  },
  {
    id: 'IV.12',
    section: 'IV',
    sectionName: 'Spécificités françaises',
    name: 'Engagement sur niveau de qualité (SLA)',
    reference: 'Arrêté 2014 Art. 239 a)',
    criticality: 'MAJOR',
    applicability: 'FR_ONLY',
    regulatoryText: {
      fr: "S'engagent sur un niveau de qualité répondant à un fonctionnement normal du service et, en cas d'incident, conduisant à recourir aux mécanismes de secours."
    },
    keywords: {
      fr: ['qualité', 'SLA', 'engagement', 'fonctionnement normal'],
      en: ['quality', 'SLA', 'commitment', 'normal operation']
    },
    verificationCriteria: 'Engagement qualité/SLA + lien avec BCP'
  }
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get requirement by ID
 */
export function getRequirementById(id: string): Requirement | undefined {
  return CHECKLIST.find(req => req.id === id);
}

/**
 * Get requirements by section
 */
export function getRequirementsBySection(section: string): Requirement[] {
  return CHECKLIST.filter(req => req.section === section);
}

/**
 * Get requirements by criticality
 */
export function getRequirementsByCriticality(criticality: 'CRITICAL' | 'MAJOR' | 'MINOR'): Requirement[] {
  return CHECKLIST.filter(req => req.criticality === criticality);
}

/**
 * Get requirements by applicability
 */
export function getRequirementsByApplicability(applicability: 'ALL' | 'CRITICAL_FUNCTIONS' | 'EBA_ONLY' | 'FR_ONLY'): Requirement[] {
  return CHECKLIST.filter(req => req.applicability === applicability);
}

/**
 * Get all unique sections
 */
export function getSections(): string[] {
  return [...new Set(CHECKLIST.map(req => req.section))];
}

/**
 * Get section names
 */
export function getSectionNames(): Record<string, string> {
  const names: Record<string, string> = {};
  for (const req of CHECKLIST) {
    if (!names[req.section]) {
      names[req.section] = req.sectionName;
    }
  }
  return names;
}

/**
 * Get critical requirement IDs that cannot be IMPLICIT
 */
export function getCriticalRequirementIds(): string[] {
  return ['I.7', 'I.10', 'II.4', 'II.10'];
}

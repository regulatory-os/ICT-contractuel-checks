/**
 * ICT Contract Compliance Checklist
 *
 * 42 requirements covering DORA Article 30, EBA Guidelines (EBA/GL/2019/02),
 * and French Arrêté du 3 novembre 2014.
 *
 * @license AGPL-3.0
 * @author Regulatory OS (https://regulatoryos.fr)
 */

import { Requirement } from '../types';

export const CHECKLIST: Requirement[] = [
  // =========================================================================
  // SECTION A: GÉNÉRALITÉS DU CONTRAT
  // =========================================================================
  {
    id: 'A1',
    section: 'A. Généralités',
    name: 'Contrat écrit unique',
    reference: 'DORA 30.1 | ABE GL 74 | Arrêté 2014 Art. 238 b)',
    description: 'Document unique écrit définissant clairement les droits et obligations.',
    criticality: 'MINOR',
    keywords: ['contrat', 'agreement', 'document unique', 'rights and obligations', 'written'],
    regulatoryText: 'The rights and obligations of the financial entity and of the ICT third-party service provider shall be clearly allocated and set out in writing. The full contract shall include the service level agreements and be documented in one written document.'
  },
  {
    id: 'A2',
    section: 'A. Généralités',
    name: 'Description des services',
    reference: 'DORA 30.2(a) | ABE GL 75a',
    description: 'Description claire et complète des fonctions et services ICT fournis.',
    criticality: 'MAJOR',
    keywords: ['description', 'services', 'functions', 'scope', 'périmètre', 'deliverables'],
    regulatoryText: 'A clear and complete description of all functions and ICT services to be provided by the ICT third-party service provider, indicating whether subcontracting of an ICT service supporting a critical or important function, or material parts thereof, is permitted.'
  },
  {
    id: 'A3',
    section: 'A. Généralités',
    name: 'Durée et préavis',
    reference: 'ABE GL 75b',
    description: 'Dates de début/fin et délais de préavis pour les deux parties.',
    criticality: 'MINOR',
    keywords: ['durée', 'term', 'duration', 'notice period', 'préavis', 'effective date'],
    regulatoryText: 'The start date and end date, where applicable, of the agreement and the notice periods for the service provider and the institution or payment institution.'
  },
  {
    id: 'A4',
    section: 'A. Généralités',
    name: 'Droit applicable',
    reference: 'ABE GL 75c',
    description: 'Loi régissant le contrat explicitement mentionnée.',
    criticality: 'MINOR',
    keywords: ['droit applicable', 'governing law', 'jurisdiction', 'loi applicable'],
    regulatoryText: 'The governing law of the agreement.'
  },
  {
    id: 'A5',
    section: 'A. Généralités',
    name: 'Obligations financières',
    reference: 'ABE GL 75d',
    description: 'Obligations financières clairement définies (prix, facturation).',
    criticality: 'MINOR',
    keywords: ['prix', 'fees', 'payment', 'paiement', 'remuneration', 'costs'],
    regulatoryText: 'The parties\' financial obligations.'
  },

  // =========================================================================
  // SECTION B: SOUS-TRAITANCE
  // =========================================================================
  {
    id: 'B6',
    section: 'B. Sous-traitance',
    name: 'Autorisation sous-traitance',
    reference: 'DORA 30.2(a) | ABE GL 75e, 76',
    description: 'Mention explicite de l\'autorisation ou interdiction et conditions.',
    criticality: 'MAJOR',
    keywords: ['sous-traitance', 'subcontracting', 'sub-outsourcing', 'recours à des tiers'],
    regulatoryText: 'Indicating whether subcontracting of an ICT service supporting a critical or important function, or material parts thereof, is permitted and, when that is the case, the conditions applying to such subcontracting.'
  },
  {
    id: 'B7',
    section: 'B. Sous-traitance',
    name: 'Activités exclues',
    reference: 'ABE GL 78a',
    description: 'Liste des activités ne pouvant être sous-traitées.',
    criticality: 'MINOR',
    keywords: ['activités exclues', 'excluded activities', 'prohibited', 'interdiction'],
    regulatoryText: 'Specify any types of activities that are excluded from sub-outsourcing.'
  },
  {
    id: 'B8',
    section: 'B. Sous-traitance',
    name: 'Conditions sous-traitance',
    reference: 'ABE GL 78b',
    description: 'Conditions que doivent respecter les sous-traitants.',
    criticality: 'MINOR',
    keywords: ['conditions', 'requirements', 'exigences'],
    regulatoryText: 'Specify the conditions to be complied with in the case of sub-outsourcing.'
  },
  {
    id: 'B9',
    section: 'B. Sous-traitance',
    name: 'Supervision sous-traitants',
    reference: 'ABE GL 78c',
    description: 'Obligation du prestataire de superviser ses sous-traitants.',
    criticality: 'MAJOR',
    keywords: ['supervision', 'oversight', 'contrôle', 'monitoring', 'surveillance'],
    regulatoryText: 'Specify that the service provider is obliged to oversee those services that it has subcontracted to ensure that all contractual obligations are continuously met.'
  },
  {
    id: 'B10',
    section: 'B. Sous-traitance',
    name: 'Notification préalable',
    reference: 'DORA 30.3(b) | ABE GL 78d-e',
    description: 'Notification préalable obligatoire avant changement de sous-traitant.',
    criticality: 'MAJOR',
    keywords: ['notification', 'notice', 'inform', 'préalable', 'prior approval', 'changement'],
    regulatoryText: 'Notice periods and reporting obligations... including notification of any development that might have a material impact... Inform the institution of any planned sub-outsourcing, or material changes thereof.'
  },
  {
    id: 'B11',
    section: 'B. Sous-traitance',
    name: 'Résiliation (Sous-traitance)',
    reference: 'ABE GL 78f',
    description: 'Droit de résiliation en cas de sous-traitance non conforme.',
    criticality: 'MAJOR',
    keywords: ['résiliation', 'termination', 'undue sub-outsourcing', 'non-conforme'],
    regulatoryText: 'Ensure that the institution has the contractual right to terminate the agreement in the case of undue sub-outsourcing.'
  },
  {
    id: 'B12',
    section: 'B. Sous-traitance',
    name: 'Engagements sous-traitant',
    reference: 'ABE GL 79',
    description: 'Sous-traitants doivent respecter lois/contrat et accorder droits d\'audit.',
    criticality: 'MAJOR',
    keywords: ['engagements', 'compliance', 'audit rights', 'accès', 'access'],
    regulatoryText: 'Subcontractor undertakes to: a. comply with all applicable laws, regulatory requirements and contractual obligations; and b. grant the same contractual rights of access and audit.'
  },

  // =========================================================================
  // SECTION C: LOCALISATION
  // =========================================================================
  {
    id: 'C13',
    section: 'C. Localisation',
    name: 'Localisation données',
    reference: 'DORA 30.2(b) | ABE GL 75f',
    description: 'Pays/Régions de fourniture des services et stockage données.',
    criticality: 'MAJOR',
    keywords: ['localisation', 'location', 'country', 'pays', 'data center', 'storage'],
    regulatoryText: 'The locations, namely the regions or countries, where the contracted or subcontracted functions and ICT services are to be provided and where data is to be processed, including the storage location.'
  },
  {
    id: 'C14',
    section: 'C. Localisation',
    name: 'Notif. changement lieu',
    reference: 'DORA 30.2(b) | ABE GL 75f',
    description: 'Obligation de notifier tout changement de localisation.',
    criticality: 'MAJOR',
    keywords: ['notification', 'changement', 'change of location', 'transfer'],
    regulatoryText: 'The requirement for the ICT third-party service provider to notify the financial entity in advance if it envisages changing such locations.'
  },

  // =========================================================================
  // SECTION D: PROTECTION DES DONNÉES
  // =========================================================================
  {
    id: 'D15',
    section: 'D. Protection des Données',
    name: 'Sécurité (CIA)',
    reference: 'DORA 30.2(c) | ABE GL 75g',
    description: 'Disponibilité, authenticité, intégrité et confidentialité.',
    criticality: 'MAJOR',
    keywords: ['availability', 'integrity', 'confidentiality', 'authenticity', 'sécurité', 'security'],
    regulatoryText: 'Provisions on availability, authenticity, integrity and confidentiality in relation to the protection of data, including personal data.'
  },
  {
    id: 'D16',
    section: 'D. Protection des Données',
    name: 'Approche par risques',
    reference: 'ABE GL 83',
    description: 'Approche basée sur les risques pour stockage/traitement.',
    criticality: 'MINOR',
    keywords: ['risk-based', 'risque', 'risk assessment', 'security measures'],
    regulatoryText: 'Adopt a risk-based approach to data storage and data processing location(s) and information security considerations.'
  },
  {
    id: 'D17',
    section: 'D. Protection des Données',
    name: 'RGPD & Secret Bancaire',
    reference: 'ABE GL 84',
    description: 'Conformité RGPD et respect secret bancaire/confidentialité.',
    criticality: 'MAJOR',
    keywords: ['rgpd', 'gdpr', 'personal data', 'secret bancaire', 'banking secrecy'],
    regulatoryText: 'Complies with all legal requirements regarding the protection of data... e.g. the protection of personal data and that banking secrecy or similar legal confidentiality duties are observed.'
  },
  {
    id: 'D18',
    section: 'D. Protection des Données',
    name: 'Accès et restitution',
    reference: 'DORA 30.2(d) | ABE GL 75m',
    description: 'Accès, récupération et restitution des données (insolvabilité/fin).',
    criticality: 'MAJOR',
    keywords: ['restitution', 'return', 'recovery', 'access', 'insolvency', 'insolvabilité'],
    regulatoryText: 'Provisions on ensuring access, recovery and return in an easily accessible format of personal and non-personal data... in the event of the insolvency, resolution or discontinuation... or termination.'
  },

  // =========================================================================
  // SECTION E: NIVEAUX DE SERVICE (SLA)
  // =========================================================================
  {
    id: 'E19',
    section: 'E. SLA',
    name: 'Description SLA',
    reference: 'DORA 30.2(e) | ABE GL 75i',
    description: 'Niveaux de service avec indicateurs quantitatifs/qualitatifs.',
    criticality: 'MAJOR',
    keywords: ['sla', 'service level', 'niveau de service', 'kpi', 'performance'],
    regulatoryText: 'Service level descriptions, including updates and revisions thereof.'
  },
  {
    id: 'E20',
    section: 'E. SLA',
    name: 'SLA Détaillés (Critique)',
    reference: 'DORA 30.3(a)',
    description: 'Objectifs précis, monitoring et actions correctives (Fonctions Critiques).',
    criticality: 'MAJOR',
    keywords: ['targets', 'objectifs', 'corrective actions', 'actions correctives', 'penalty', 'pénalités'],
    regulatoryText: 'Precise quantitative and qualitative performance targets within the agreed service levels to allow effective monitoring... and enable appropriate corrective actions to be taken.'
  },

  // =========================================================================
  // SECTION F: GESTION DES INCIDENTS
  // =========================================================================
  {
    id: 'F21',
    section: 'F. Incidents',
    name: 'Assistance Incident (Coût)',
    reference: 'DORA 30.2(f)',
    description: 'Assistance incident sans frais ou à coût prédéterminé.',
    criticality: 'CRITICAL',
    keywords: ['assistance', 'no additional cost', 'sans frais', 'predetermined cost', 'coût prédéterminé'],
    regulatoryText: 'The obligation... to provide assistance to the financial entity at no additional cost, or at a cost that is determined ex-ante, when an ICT incident... occurs.'
  },
  {
    id: 'F22',
    section: 'F. Incidents',
    name: 'Notification Incidents',
    reference: 'DORA 30.3(b) | ABE GL 75j',
    description: 'Notification des incidents et développements matériels.',
    criticality: 'MAJOR',
    keywords: ['notification', 'incident', 'reporting', 'impact', 'material event'],
    regulatoryText: 'Reporting obligations... including notification of any development that might have a material impact on the ICT third-party service provider\'s ability to effectively provide the ICT services.'
  },
  {
    id: 'F23',
    section: 'F. Incidents',
    name: 'Continuité (BCP)',
    reference: 'DORA 30.3(c) | ABE GL 75l',
    description: 'Mise en œuvre et tests du plan de continuité (BCP).',
    criticality: 'MAJOR',
    keywords: ['bcp', 'pca', 'continuity', 'continuité', 'disaster recovery', 'secours', 'test'],
    regulatoryText: 'Requirements for the ICT third-party service provider to implement and test business contingency plans and to have in place ICT security measures.'
  },

  // =========================================================================
  // SECTION G: COOPÉRATION AUTORITÉS
  // =========================================================================
  {
    id: 'G24',
    section: 'G. Autorités',
    name: 'Coopération Autorités',
    reference: 'DORA 30.2(g) | ABE GL 75n',
    description: 'Coopération avec autorités compétentes et de résolution.',
    criticality: 'MAJOR',
    keywords: ['cooperation', 'coopération', 'competent authority', 'autorité compétente', 'acpr', 'regulator'],
    regulatoryText: 'The obligation... to fully cooperate with the competent authorities and the resolution authorities of the financial entity, including persons appointed by them.'
  },

  // =========================================================================
  // SECTION H: RÉSILIATION ET SORTIE
  // =========================================================================
  {
    id: 'H25',
    section: 'H. Sortie & Résiliation',
    name: 'Droits de résiliation',
    reference: 'DORA 30.2(h) | ABE GL 75q',
    description: 'Droits de résiliation incluant manquement et changements matériels.',
    criticality: 'MAJOR',
    keywords: ['termination', 'résiliation', 'breach', 'rights', 'droit'],
    regulatoryText: 'Termination rights and related minimum notice periods... in accordance with the expectations of competent authorities.'
  },
  {
    id: 'H26',
    section: 'H. Sortie & Résiliation',
    name: 'Transition Obligatoire',
    reference: 'DORA 30.3(f)(i)',
    description: 'Période de transition OBLIGATOIRE et assistance migration.',
    criticality: 'CRITICAL',
    keywords: ['transition', 'mandatory', 'obligatoire', 'adequate', 'transition'],
    regulatoryText: 'Establishment of a mandatory adequate transition period... during which the ICT third-party service provider will continue providing the respective functions.'
  },

  // =========================================================================
  // SECTION I: AUDIT ET MONITORING
  // =========================================================================
  {
    id: 'I27',
    section: 'I. Audit',
    name: 'Monitoring continu',
    reference: 'DORA 30.3(e) | ABE GL 75h',
    description: 'Droit de monitoring continu de la performance.',
    criticality: 'MAJOR',
    keywords: ['monitor', 'surveillance', 'contrôle', 'performance', 'ongoing'],
    regulatoryText: 'The right to monitor, on an ongoing basis, the ICT third-party service provider\'s performance.'
  },
  {
    id: 'I28',
    section: 'I. Audit',
    name: 'Droits d\'Audit/Accès',
    reference: 'DORA 30.3(e)(i) | ABE GL 87',
    description: 'Droits d\'accès, inspection et audit sans restriction.',
    criticality: 'MAJOR',
    keywords: ['audit', 'inspection', 'access', 'accès', 'unrestricted', 'sans restriction'],
    regulatoryText: 'Unrestricted rights of access, inspection and audit by the financial entity... and by the competent authority.'
  },
  {
    id: 'I29',
    section: 'I. Audit',
    name: 'Assurance Alternative',
    reference: 'DORA 30.3(e)(ii) | ABE GL 91',
    description: 'Possibilité de niveaux d\'assurance alternatifs (certifs, audits mutualisés).',
    criticality: 'MINOR',
    keywords: ['alternative', 'pooled audit', 'audit mutualisé', 'certification', 'report'],
    regulatoryText: 'The right to agree on alternative assurance levels if other clients\' rights are affected.'
  },
  {
    id: 'I30',
    section: 'I. Audit',
    name: 'Coopération Audit',
    reference: 'DORA 30.3(e)(iii) | ABE GL 95',
    description: 'Obligation de coopérer pleinement lors des audits.',
    criticality: 'MAJOR',
    keywords: ['cooperation', 'coopération', 'audit', 'inspection', 'facilitate'],
    regulatoryText: 'The obligation... to fully cooperate during the on-site inspections and audits.'
  },
  {
    id: 'I31',
    section: 'I. Audit',
    name: 'Détails Audit',
    reference: 'DORA 30.3(e)(iv) | ABE GL 90',
    description: 'Détails sur scope, procédures et fréquence des audits.',
    criticality: 'MINOR',
    keywords: ['scope', 'frequency', 'fréquence', 'procedure', 'périmètre'],
    regulatoryText: 'The obligation to provide details on the scope, procedures to be followed and frequency of such inspections and audits.'
  },

  // =========================================================================
  // SECTION J: NOUVEAUTÉS DORA CRITIQUES
  // =========================================================================
  {
    id: 'J32',
    section: 'J. Nouveautés DORA',
    name: 'Formation Sécurité ICT',
    reference: 'DORA 30.2(i)',
    description: 'Participation du prestataire aux programmes de formation sécurité.',
    criticality: 'CRITICAL',
    keywords: ['training', 'formation', 'awareness', 'sensibilisation', 'programmes'],
    regulatoryText: 'The conditions for the participation of ICT third-party service providers in the financial entities\' ICT security awareness programmes and digital operational resilience training.'
  },
  {
    id: 'J33',
    section: 'J. Nouveautés DORA',
    name: 'Tests TLPT',
    reference: 'DORA 30.3(d)',
    description: 'Participation aux tests de pénétration fondés sur la menace.',
    criticality: 'CRITICAL',
    keywords: ['tlpt', 'penetration testing', 'test d\'intrusion', 'red team', 'menace'],
    regulatoryText: 'The obligation... to participate and fully cooperate in the financial entity\'s TLPT as referred to in Articles 26 and 27.'
  },
  {
    id: 'J34',
    section: 'J. Nouveautés DORA',
    name: 'Transition Obligatoire',
    reference: 'DORA 30.3(f)(i)',
    description: 'Caractère explicitement OBLIGATOIRE de la transition.',
    criticality: 'CRITICAL',
    keywords: ['mandatory', 'obligatoire', 'adequate', 'transition'],
    regulatoryText: 'Establishment of a mandatory adequate transition period.'
  },

  // =========================================================================
  // SECTION K: SPÉCIFICITÉS FR (Arrêté 2014)
  // =========================================================================
  {
    id: 'K35',
    section: 'K. Spécificités FR',
    name: 'Définition Activités',
    reference: 'Arrêté 2014 Art. 10 q)',
    description: 'Qualification correcte des activités externalisées.',
    criticality: 'MINOR',
    keywords: ['activité externalisée', 'outsourced activity', 'definition'],
    regulatoryText: 'Activités pour lesquelles l\'entreprise assujettie confie à un tiers... la réalisation de prestations.'
  },
  {
    id: 'K36',
    section: 'K. Spécificités FR',
    name: 'Prestations Essentielles',
    reference: 'Arrêté 2014 Art. 10 r)',
    description: 'Qualification PSEE (Prestation Essentielle ou Importante).',
    criticality: 'MINOR',
    keywords: ['essentielle', 'importante', 'critical', 'important', 'psee'],
    regulatoryText: 'Prestation de services... lorsqu\'une anomalie... est susceptible de nuire sérieusement.'
  },
  {
    id: 'K37',
    section: 'K. Spécificités FR',
    name: 'Agrément Prestataire',
    reference: 'Arrêté 2014 Art. 231',
    description: 'Vérification de l\'agrément/habilitation du prestataire si requis.',
    criticality: 'MINOR',
    keywords: ['agrément', 'habilitation', 'licence', 'authorized', 'agréé'],
    regulatoryText: 'N\'est externalisée qu\'auprès de personnes agréées ou habilitées.'
  },
  {
    id: 'K40',
    section: 'K. Spécificités FR',
    name: 'Responsabilité Entité',
    reference: 'Arrêté 2014 Art. 237',
    description: 'Maintien de la pleine responsabilité de l\'entité régulée.',
    criticality: 'MAJOR',
    keywords: ['responsabilité', 'responsibility', 'retain', 'demeure responsable'],
    regulatoryText: 'Demeurent pleinement responsables du respect de toutes les obligations.'
  },
  {
    id: 'K42',
    section: 'K. Spécificités FR',
    name: 'Modif. Substantielle',
    reference: 'Arrêté 2014 Art. 239 d)',
    description: 'Accord préalable requis pour modification substantielle.',
    criticality: 'MAJOR',
    keywords: ['modification', 'changement', 'accord préalable', 'prior approval', 'substantial'],
    regulatoryText: 'Ne peuvent imposer une modification substantielle de la prestation... sans l\'accord préalable.'
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
 * Get all unique sections
 */
export function getSections(): string[] {
  return [...new Set(CHECKLIST.map(req => req.section))];
}

-- =============================================================================
-- ICT-Contractual-Checks - Schéma SQL (Optionnel)
--
-- Ce schéma est OPTIONNEL. Le module principal fonctionne sans base de données.
-- Utilisez ce schéma si vous souhaitez persister les résultats d'analyse.
--
-- Compatible: PostgreSQL 14+, Supabase, Neon, etc.
-- =============================================================================

-- Extension pour UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- TABLE: analyses
-- Historique des analyses de contrats
-- =============================================================================
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Métadonnées
    file_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Résultats globaux
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    executive_summary TEXT,

    -- Statistiques
    total_requirements INTEGER DEFAULT 42,
    compliant_count INTEGER DEFAULT 0,
    partial_count INTEGER DEFAULT 0,
    implicit_count INTEGER DEFAULT 0,
    absent_count INTEGER DEFAULT 0,
    na_count INTEGER DEFAULT 0,

    -- Configuration utilisée
    ai_provider VARCHAR(20) CHECK (ai_provider IN ('anthropic', 'gemini', 'openai')),
    ai_model VARCHAR(100),

    -- Clauses générales détectées (JSON array)
    general_clauses JSONB DEFAULT '[]'::jsonb,

    -- Métadonnées utilisateur (optionnel)
    user_id UUID,
    organization_id UUID,
    tags TEXT[] DEFAULT '{}',

    -- Index pour recherche
    CONSTRAINT valid_counts CHECK (
        compliant_count + partial_count + implicit_count + absent_count + na_count <= total_requirements
    )
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_score ON analyses(overall_score);

-- =============================================================================
-- TABLE: findings
-- Résultats détaillés par exigence
-- =============================================================================
CREATE TABLE IF NOT EXISTS findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,

    -- Identification de l'exigence
    requirement_id VARCHAR(10) NOT NULL, -- A1, B6, J32, etc.
    requirement_name VARCHAR(255) NOT NULL,
    section VARCHAR(100) NOT NULL,
    criticality VARCHAR(10) CHECK (criticality IN ('CRITICAL', 'MAJOR', 'MINOR')),

    -- Résultat de l'analyse
    status VARCHAR(20) NOT NULL CHECK (status IN ('COMPLIANT', 'PARTIAL', 'IMPLICIT', 'ABSENT', 'NA')),
    comment TEXT,
    found_clause TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Contrainte d'unicité (une seule entrée par exigence par analyse)
    UNIQUE(analysis_id, requirement_id)
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_findings_analysis_id ON findings(analysis_id);
CREATE INDEX IF NOT EXISTS idx_findings_requirement_id ON findings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(status);
CREATE INDEX IF NOT EXISTS idx_findings_criticality ON findings(criticality);

-- =============================================================================
-- TABLE: recommended_clauses
-- Clauses de remédiation proposées
-- =============================================================================
CREATE TABLE IF NOT EXISTS recommended_clauses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES findings(id) ON DELETE CASCADE,

    -- Contenu
    title VARCHAR(255) NOT NULL,
    reference VARCHAR(100),
    text_fr TEXT NOT NULL,
    text_en TEXT NOT NULL,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_recommended_clauses_analysis_id ON recommended_clauses(analysis_id);

-- =============================================================================
-- TABLE: contracts (Optionnel)
-- Métadonnées des contrats analysés
-- =============================================================================
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Identification
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Fournisseur
    provider_name VARCHAR(255),
    provider_country VARCHAR(100),

    -- Classification
    is_critical BOOLEAN DEFAULT false,
    service_type VARCHAR(100), -- 'cloud', 'saas', 'infrastructure', 'development', etc.

    -- Dates contractuelles
    effective_date DATE,
    expiry_date DATE,

    -- Contenu (optionnel - stockage du texte)
    content_hash VARCHAR(64), -- SHA-256 du contenu
    content_length INTEGER,

    -- Métadonnées
    user_id UUID,
    organization_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tags TEXT[] DEFAULT '{}'
);

-- Index
CREATE INDEX IF NOT EXISTS idx_contracts_provider_name ON contracts(provider_name);
CREATE INDEX IF NOT EXISTS idx_contracts_is_critical ON contracts(is_critical);
CREATE INDEX IF NOT EXISTS idx_contracts_expiry_date ON contracts(expiry_date);

-- Relation avec analyses
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_analyses_contract_id ON analyses(contract_id) WHERE contract_id IS NOT NULL;

-- =============================================================================
-- VIEWS
-- Vues utiles pour le reporting
-- =============================================================================

-- Vue: Résumé des analyses par statut
CREATE OR REPLACE VIEW v_analysis_summary AS
SELECT
    a.id,
    a.file_name,
    a.created_at,
    a.overall_score,
    a.ai_provider,
    COUNT(f.id) FILTER (WHERE f.status = 'COMPLIANT') as compliant,
    COUNT(f.id) FILTER (WHERE f.status = 'PARTIAL') as partial,
    COUNT(f.id) FILTER (WHERE f.status = 'IMPLICIT') as implicit,
    COUNT(f.id) FILTER (WHERE f.status = 'ABSENT') as absent,
    COUNT(f.id) FILTER (WHERE f.status = 'NA') as na,
    COUNT(f.id) FILTER (WHERE f.criticality = 'CRITICAL' AND f.status = 'ABSENT') as critical_missing
FROM analyses a
LEFT JOIN findings f ON f.analysis_id = a.id
GROUP BY a.id;

-- Vue: Exigences les plus souvent absentes
CREATE OR REPLACE VIEW v_common_gaps AS
SELECT
    f.requirement_id,
    f.requirement_name,
    f.section,
    f.criticality,
    COUNT(*) as absence_count,
    ROUND(COUNT(*)::numeric / NULLIF((SELECT COUNT(DISTINCT analysis_id) FROM findings), 0) * 100, 1) as absence_rate
FROM findings f
WHERE f.status = 'ABSENT'
GROUP BY f.requirement_id, f.requirement_name, f.section, f.criticality
ORDER BY absence_count DESC;

-- Vue: Score moyen par fournisseur
CREATE OR REPLACE VIEW v_provider_scores AS
SELECT
    c.provider_name,
    COUNT(a.id) as analysis_count,
    ROUND(AVG(a.overall_score), 1) as avg_score,
    MIN(a.overall_score) as min_score,
    MAX(a.overall_score) as max_score
FROM contracts c
JOIN analyses a ON a.contract_id = c.id
WHERE c.provider_name IS NOT NULL
GROUP BY c.provider_name
ORDER BY avg_score DESC;

-- =============================================================================
-- FUNCTIONS
-- Fonctions utilitaires
-- =============================================================================

-- Fonction: Calculer le score à partir des findings
CREATE OR REPLACE FUNCTION calculate_score(p_analysis_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_score INTEGER;
BEGIN
    SELECT
        ROUND(
            (COUNT(*) FILTER (WHERE status = 'COMPLIANT') * 100 +
             COUNT(*) FILTER (WHERE status = 'IMPLICIT') * 80 +
             COUNT(*) FILTER (WHERE status = 'PARTIAL') * 50)::numeric /
            NULLIF(COUNT(*) FILTER (WHERE status != 'NA'), 0),
            0
        )::INTEGER
    INTO v_score
    FROM findings
    WHERE analysis_id = p_analysis_id;

    RETURN COALESCE(v_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Fonction: Mettre à jour les compteurs d'une analyse
CREATE OR REPLACE FUNCTION update_analysis_counts()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE analyses SET
        compliant_count = (SELECT COUNT(*) FROM findings WHERE analysis_id = NEW.analysis_id AND status = 'COMPLIANT'),
        partial_count = (SELECT COUNT(*) FROM findings WHERE analysis_id = NEW.analysis_id AND status = 'PARTIAL'),
        implicit_count = (SELECT COUNT(*) FROM findings WHERE analysis_id = NEW.analysis_id AND status = 'IMPLICIT'),
        absent_count = (SELECT COUNT(*) FROM findings WHERE analysis_id = NEW.analysis_id AND status = 'ABSENT'),
        na_count = (SELECT COUNT(*) FROM findings WHERE analysis_id = NEW.analysis_id AND status = 'NA'),
        updated_at = NOW()
    WHERE id = NEW.analysis_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Mise à jour automatique des compteurs
DROP TRIGGER IF EXISTS trigger_update_analysis_counts ON findings;
CREATE TRIGGER trigger_update_analysis_counts
    AFTER INSERT OR UPDATE ON findings
    FOR EACH ROW
    EXECUTE FUNCTION update_analysis_counts();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) - Pour Supabase
-- Décommentez si vous utilisez Supabase avec authentification
-- =============================================================================

-- ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE findings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE recommended_clauses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs voient uniquement leurs analyses
-- CREATE POLICY "Users can view own analyses" ON analyses
--     FOR SELECT USING (auth.uid() = user_id);

-- CREATE POLICY "Users can insert own analyses" ON analyses
--     FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================================================
-- SEED DATA (Optionnel)
-- Données de test pour développement
-- =============================================================================

-- Décommentez pour insérer des données de test
/*
INSERT INTO analyses (file_name, overall_score, executive_summary, ai_provider, ai_model, general_clauses)
VALUES (
    'Contrat Test Cloud Provider',
    72,
    'Le contrat présente une bonne couverture des exigences de base mais manque de clauses spécifiques pour DORA.',
    'anthropic',
    'claude-opus-4-5-20251101',
    '["Le prestataire s''engage à respecter toutes les réglementations applicables."]'::jsonb
);
*/

-- =============================================================================
-- NOTES
-- =============================================================================
--
-- Ce schéma est compatible avec:
-- - PostgreSQL 14+
-- - Supabase
-- - Neon
-- - Amazon RDS PostgreSQL
-- - Google Cloud SQL
--
-- Pour Supabase, activez RLS et créez les policies appropriées.
-- Pour un usage standalone, ce schéma est optionnel.
-- =============================================================================

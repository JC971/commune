-- sql/01_deliberations.sql

-- Table for Deliberations (Conseil Municipal)
CREATE TABLE deliberations (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    reference_code VARCHAR(100) UNIQUE, -- e.g., DELIB-2025-05-01
    summary TEXT,
    full_text TEXT, -- Or reference to stored document
    decision_key TEXT, -- Key decision summary
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE, -- Null if not published
    status VARCHAR(50) DEFAULT 'draft', -- e.g., draft, validated, published, archived
    -- Full-text search vector (to be updated by trigger or application logic)
    search_vector TSVECTOR
    -- Optional: blockchain_anchor_hash VARCHAR(66) -- Hash anchored on blockchain
);

-- Table for Speakers/Intervenants (if needed to track who spoke)
CREATE TABLE speakers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE
);

-- Junction table for Deliberation Speakers
CREATE TABLE deliberation_speakers (
    deliberation_id INTEGER REFERENCES deliberations(id) ON DELETE CASCADE,
    speaker_id INTEGER REFERENCES speakers(id) ON DELETE CASCADE,
    PRIMARY KEY (deliberation_id, speaker_id)
);

-- Table for Themes/Categories
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Junction table for Deliberation Themes
CREATE TABLE deliberation_themes (
    deliberation_id INTEGER REFERENCES deliberations(id) ON DELETE CASCADE,
    theme_id INTEGER REFERENCES themes(id) ON DELETE CASCADE,
    PRIMARY KEY (deliberation_id, theme_id)
);

-- Table for Annexes/Attachments related to Deliberations
CREATE TABLE deliberation_annexes (
    id SERIAL PRIMARY KEY,
    deliberation_id INTEGER NOT NULL REFERENCES deliberations(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Path in object storage (e.g., S3 URL)
    file_type VARCHAR(100), -- MIME type
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update the search_vector on insert/update
CREATE OR REPLACE FUNCTION update_deliberation_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('french', coalesce(NEW.title,'')), 'A') ||
        setweight(to_tsvector('french', coalesce(NEW.reference_code,'')), 'B') ||
        setweight(to_tsvector('french', coalesce(NEW.summary,'')), 'C') ||
        setweight(to_tsvector('french', coalesce(NEW.full_text,'')), 'D') ||
        setweight(to_tsvector('french', coalesce(NEW.decision_key,'')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE
ON deliberations FOR EACH ROW EXECUTE FUNCTION update_deliberation_search_vector();

-- Index for full-text search
CREATE INDEX deliberations_search_idx ON deliberations USING GIN (search_vector);

-- Other useful indexes
CREATE INDEX deliberations_session_date_idx ON deliberations (session_date);
CREATE INDEX deliberations_status_idx ON deliberations (status);
CREATE INDEX deliberation_annexes_deliberation_id_idx ON deliberation_annexes (deliberation_id);


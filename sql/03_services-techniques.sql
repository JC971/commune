-- sql/03_services_techniques.sql

-- Optional: Enable PostGIS extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for Intervention Types (e.g., Road repair, Green space maintenance, Lighting)
CREATE TABLE intervention_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Interventions (Services Techniques)
CREATE TABLE interventions (
    id SERIAL PRIMARY KEY,
    reference_code VARCHAR(100) UNIQUE, -- e.g., INT-2025-1234
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    intervention_type_id INTEGER REFERENCES intervention_types(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'created', -- e.g., created, planned, assigned, in_progress, completed, validated, cancelled
    priority VARCHAR(50) DEFAULT 'medium', -- e.g., low, medium, high, urgent
    creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    planned_start_date TIMESTAMP WITH TIME ZONE,
    planned_end_date TIMESTAMP WITH TIME ZONE,
    actual_start_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Location Information
    address TEXT,
    -- Use PostGIS for precise geolocation if enabled
    -- location GEOMETRY(Point, 4326), -- Store as POINT geometry (longitude, latitude)
    -- Fallback to simple lat/lon if PostGIS is not used
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Assignment (assuming a generic 'users' table for agents)
    assigned_agent_id INTEGER, -- FK to users table
    assigned_team_id INTEGER, -- Optional: FK to a potential 'teams' table
    
    -- Cost Information
    estimated_cost DECIMAL(12, 2),
    final_cost DECIMAL(12, 2),
    cost_validated BOOLEAN DEFAULT FALSE,
    cost_validation_date TIMESTAMP WITH TIME ZONE,
    
    -- Blockchain Anchor Information
    blockchain_tx_hash VARCHAR(66), -- Hash of the transaction anchoring key data
    blockchain_record_id VARCHAR(255), -- Unique ID used in the smart contract event
    
    -- Foreign key to link to a doléance if the intervention originates from one
    originating_doleance_id INTEGER, -- FK to doleances table (defined later)
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    
    -- FOREIGN KEY (assigned_agent_id) REFERENCES users(id) -- Uncomment if users table exists
    -- FOREIGN KEY (originating_doleance_id) REFERENCES doleances(id) -- Add constraint after doleances table is created
);

-- Table for Intervention Status History (optional but useful for tracking)
CREATE TABLE intervention_status_history (
    id SERIAL PRIMARY KEY,
    intervention_id INTEGER NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INTEGER, -- Optional: FK to users table
    notes TEXT
    -- FOREIGN KEY (changed_by_user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Table for Intervention Documents (Photos, Videos, Reports)
CREATE TABLE intervention_documents (
    id SERIAL PRIMARY KEY,
    intervention_id INTEGER NOT NULL REFERENCES interventions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Path in object storage
    file_type VARCHAR(100),
    description TEXT, -- e.g., 'Photo avant travaux', 'Rapport final'
    capture_time TIMESTAMP WITH TIME ZONE, -- When the photo/video was taken
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploader_user_id INTEGER -- Optional: FK to users table
    -- FOREIGN KEY (uploader_user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Indexes
CREATE INDEX interventions_status_idx ON interventions (status);
CREATE INDEX interventions_priority_idx ON interventions (priority);
CREATE INDEX interventions_type_id_idx ON interventions (intervention_type_id);
CREATE INDEX interventions_creation_date_idx ON interventions (creation_date);
CREATE INDEX interventions_assigned_agent_id_idx ON interventions (assigned_agent_id);
CREATE INDEX interventions_originating_doleance_id_idx ON interventions (originating_doleance_id);
-- CREATE INDEX interventions_location_gix ON interventions USING GIST (location); -- Index for PostGIS geometry
CREATE INDEX intervention_status_history_intervention_id_idx ON intervention_status_history (intervention_id);
CREATE INDEX intervention_documents_intervention_id_idx ON intervention_documents (intervention_id);


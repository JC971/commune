-- sql/04_doleances.sql

-- Optional: Enable PostGIS extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for Doleance Categories (e.g., Voirie, Propreté, Eclairage public)
CREATE TABLE doleance_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT
);

-- Table for Doleances (Citizen Grievances)
CREATE TABLE doleances (
    id SERIAL PRIMARY KEY,
    reference_code VARCHAR(100) UNIQUE NOT NULL, -- Unique tracking number for citizen
    title VARCHAR(255), -- Optional title, might be generated or entered
    description TEXT NOT NULL,
    doleance_category_id INTEGER REFERENCES doleance_categories(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'received', -- e.g., received, qualified, assigned, resolution_planned, resolved, closed, rejected
    priority VARCHAR(50) DEFAULT 'medium', -- Assigned internally
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Submitter Information (handle anonymity)
    submitter_name VARCHAR(150), -- Store only if not anonymous
    submitter_email VARCHAR(255), -- Store only if not anonymous
    submitter_phone VARCHAR(50), -- Store only if not anonymous
    is_anonymous BOOLEAN DEFAULT FALSE,
    submitter_ip_address VARCHAR(45), -- Store for logging/security, handle GDPR
    
    -- Location Information
    address TEXT,
    -- Use PostGIS for precise geolocation if enabled
    -- location GEOMETRY(Point, 4326), -- Store as POINT geometry (longitude, latitude)
    -- Fallback to simple lat/lon if PostGIS is not used
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Internal Processing
    assigned_agent_id INTEGER, -- FK to users table (internal assignment)
    resolution_details TEXT, -- How the doléance was resolved
    closure_date TIMESTAMP WITH TIME ZONE,
    
    -- Link to Intervention if one was created
    linked_intervention_id INTEGER REFERENCES interventions(id) ON DELETE SET NULL,
    
    -- Blockchain Anchor Information
    blockchain_tx_hash VARCHAR(66), -- Hash of the transaction anchoring key status changes
    blockchain_record_id VARCHAR(255), -- Unique ID used in the smart contract event
    initial_description_hash VARCHAR(66), -- Optional: Hash of the initial description for integrity proof
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    
    -- FOREIGN KEY (assigned_agent_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Table for Doleance Status History
CREATE TABLE doleance_status_history (
    id SERIAL PRIMARY KEY,
    doleance_id INTEGER NOT NULL REFERENCES doleances(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    changed_by_user_id INTEGER, -- Optional: FK to users table (internal agent)
    notes TEXT, -- Internal notes about the status change
    is_public BOOLEAN DEFAULT FALSE -- Indicates if this status change is visible to the citizen
    -- FOREIGN KEY (changed_by_user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Table for Doleance Attachments (Photos, Videos submitted by citizen)
CREATE TABLE doleance_attachments (
    id SERIAL PRIMARY KEY,
    doleance_id INTEGER NOT NULL REFERENCES doleances(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Path in object storage
    file_type VARCHAR(100),
    description TEXT, -- Optional description by citizen
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add the foreign key constraint from interventions back to doleances now that it exists
ALTER TABLE interventions
ADD CONSTRAINT fk_originating_doleance
FOREIGN KEY (originating_doleance_id)
REFERENCES doleances(id)
ON DELETE SET NULL;

-- Indexes
CREATE INDEX doleances_status_idx ON doleances (status);
CREATE INDEX doleances_priority_idx ON doleances (priority);
CREATE INDEX doleances_category_id_idx ON doleances (doleance_category_id);
CREATE INDEX doleances_submission_date_idx ON doleances (submission_date);
CREATE INDEX doleances_assigned_agent_id_idx ON doleances (assigned_agent_id);
CREATE INDEX doleances_linked_intervention_id_idx ON doleances (linked_intervention_id);
-- CREATE INDEX doleances_location_gix ON doleances USING GIST (location); -- Index for PostGIS geometry
CREATE INDEX doleance_status_history_doleance_id_idx ON doleance_status_history (doleance_id);
CREATE INDEX doleance_attachments_doleance_id_idx ON doleance_attachments (doleance_id);
CREATE UNIQUE INDEX doleances_reference_code_unique_idx ON doleances (reference_code);


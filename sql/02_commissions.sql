-- sql/02_commissions.sql

-- Table for Commissions / Working Groups
CREATE TABLE commissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    creation_date DATE,
    status VARCHAR(50) DEFAULT 'active', -- e.g., active, archived
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Commission Members (linking users/contacts to commissions)
-- Assuming a generic 'users' table exists for authentication/RBAC
-- CREATE TABLE users ( id SERIAL PRIMARY KEY, name VARCHAR(150), email VARCHAR(255) UNIQUE, role VARCHAR(50), ... );
CREATE TABLE commission_members (
    commission_id INTEGER REFERENCES commissions(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- Reference to a potential 'users' table ID
    role_in_commission VARCHAR(100), -- e.g., President, Member, Secretary
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commission_id, user_id)
    -- FOREIGN KEY (user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Table for Commission Meetings / Sessions
CREATE TABLE commission_meetings (
    id SERIAL PRIMARY KEY,
    commission_id INTEGER NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
    meeting_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    agenda TEXT,
    minutes TEXT, -- Or reference to stored document
    status VARCHAR(50) DEFAULT 'planned', -- e.g., planned, held, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Documents related to Commissions (Orders of the day, reports, etc.)
CREATE TABLE commission_documents (
    id SERIAL PRIMARY KEY,
    commission_id INTEGER REFERENCES commissions(id) ON DELETE CASCADE,
    meeting_id INTEGER REFERENCES commission_meetings(id) ON DELETE SET NULL, -- Can be linked to a meeting or the commission itself
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL, -- Path in object storage
    file_type VARCHAR(100),
    description TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    uploader_user_id INTEGER -- Optional: Link to the user who uploaded
    -- FOREIGN KEY (uploader_user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Table for Action Items decided in Commissions
CREATE TABLE commission_action_items (
    id SERIAL PRIMARY KEY,
    commission_id INTEGER NOT NULL REFERENCES commissions(id) ON DELETE CASCADE,
    meeting_id INTEGER REFERENCES commission_meetings(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    assigned_to_user_id INTEGER, -- Optional: Link to assigned user
    due_date DATE,
    status VARCHAR(50) DEFAULT 'open', -- e.g., open, in_progress, completed, cancelled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) -- Uncomment if users table exists
);

-- Indexes
CREATE INDEX commissions_name_idx ON commissions (name);
CREATE INDEX commission_members_commission_id_idx ON commission_members (commission_id);
CREATE INDEX commission_members_user_id_idx ON commission_members (user_id);
CREATE INDEX commission_meetings_commission_id_idx ON commission_meetings (commission_id);
CREATE INDEX commission_meetings_meeting_date_idx ON commission_meetings (meeting_date);
CREATE INDEX commission_documents_commission_id_idx ON commission_documents (commission_id);
CREATE INDEX commission_documents_meeting_id_idx ON commission_documents (meeting_id);
CREATE INDEX commission_action_items_commission_id_idx ON commission_action_items (commission_id);
CREATE INDEX commission_action_items_status_idx ON commission_action_items (status);
CREATE INDEX commission_action_items_assigned_to_idx ON commission_action_items (assigned_to_user_id);

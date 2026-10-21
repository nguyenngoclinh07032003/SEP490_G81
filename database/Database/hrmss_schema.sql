-- HRMSS 28-table physical schema. Target: MySQL 8.0.16+ / 8.4.

-- attachment: exactly one direct owner FK; no attachment junction tables.

-- Baseline for a NEW empty hrmss database only. Not an ALTER migration for a populated database.
-- No DROP statements. Back up existing data before applying a separately reviewed migration.

-- Status dictionaries, retention, invoice count and due-date policy remain to be finalized.

-- customer.user_id: nullable UNIQUE; customers without accounts are allowed.

-- Each service is selected once per request; quote-item quantity represents quantities.

-- One INITIAL quotation per request; multiple SUPPLEMENTAL quotations are allowed.

-- Assignment history may repeat a visit/technician pair; active-pair uniqueness uses a nullable generated helper.
-- New workforce statuses use AVAILABLE / UNAVAILABLE / CANCELLED for a whole shift.
-- Only the latest extension proposal and latest technician position are retained; schedule changes retain history.
-- Store business timestamps consistently in UTC. Per-technician cleanup/travel buffer: 30 minutes.

-- Handover items reserve each payment for one batch. Rejected draft items must be released before resubmission.

CREATE DATABASE IF NOT EXISTS hrmss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hrmss;

CREATE TABLE role (
  role_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_code VARCHAR(40) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (role_id),
  UNIQUE (role_code)
) ENGINE=InnoDB;

CREATE TABLE user_account (
  user_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  role_id BIGINT UNSIGNED NOT NULL,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(254) NULL,
  phone VARCHAR(30) NULL,
  ava_storage_reference VARCHAR(255) NULL,
  account_status VARCHAR(30) NOT NULL,
  location_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  location_accuracy DECIMAL(10,2) NULL,
  location_recorded_at DATETIME(6) NULL,
  location_received_at DATETIME(6) NULL,
  location_session_expires_at DATETIME(6) NULL,
  location_state_version BIGINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id),
  UNIQUE (username),
  UNIQUE KEY uq_user_account_email (email),
  CONSTRAINT chk_user_location_enabled CHECK (location_sharing_enabled IN (0, 1)),
  CONSTRAINT chk_user_location_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL AND latitude BETWEEN -90 AND 90 AND longitude BETWEEN -180 AND 180)
  ),
  CONSTRAINT chk_user_location_accuracy CHECK (location_accuracy IS NULL OR location_accuracy >= 0),
  CONSTRAINT chk_user_location_timestamps CHECK (
    latitude IS NULL OR (location_recorded_at IS NOT NULL AND location_received_at IS NOT NULL)
  )
) ENGINE=InnoDB;

CREATE TABLE customer (
  customer_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  customer_name VARCHAR(200) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(254) NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (customer_id),
  UNIQUE (user_id)
) ENGINE=InnoDB;

CREATE TABLE service_address (
  address_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  customer_id BIGINT UNSIGNED NOT NULL,
  address_text TEXT NOT NULL,
  contact_name VARCHAR(200) NULL,
  contact_phone VARCHAR(30) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  default_customer_id BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN is_default = TRUE THEN customer_id ELSE NULL END) STORED,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (address_id),
  UNIQUE KEY uq_service_address_default_customer (default_customer_id),
  CONSTRAINT chk_service_address_default CHECK (is_default IN (0, 1))
) ENGINE=InnoDB;

CREATE TABLE service_category (
  category_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (category_id)
) ENGINE=InnoDB;

CREATE TABLE service (
  service_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  service_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  base_price DECIMAL(15,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (service_id),
  CHECK (base_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE service_request (
  request_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  created_by BIGINT UNSIGNED NOT NULL,
  customer_id BIGINT UNSIGNED NOT NULL,
  original_request_id BIGINT UNSIGNED NULL,
  request_type VARCHAR(20) NOT NULL DEFAULT 'STANDARD',
  warranty_start_date DATE NULL,
  warranty_end_date DATE NULL,
  request_code VARCHAR(50) NOT NULL,
  problem_description TEXT NULL,
  service_address_snapshot TEXT NOT NULL,
  contact_name_snapshot VARCHAR(200) NOT NULL,
  contact_phone_snapshot VARCHAR(30) NOT NULL,
  preferred_time DATETIME NULL,
  request_status VARCHAR(40) NOT NULL,
  payment_due_date DATE NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (request_id),
  UNIQUE (request_code),
  KEY idx_service_request_original (original_request_id),
  CONSTRAINT chk_service_request_type CHECK (request_type IN ('STANDARD', 'WARRANTY')),
  CONSTRAINT chk_service_request_original CHECK (
    (request_type = 'STANDARD' AND original_request_id IS NULL) OR
    (request_type = 'WARRANTY' AND original_request_id IS NOT NULL)
  ),
  CONSTRAINT chk_service_request_warranty_dates CHECK (
    (warranty_start_date IS NULL AND warranty_end_date IS NULL) OR
    (warranty_start_date IS NOT NULL AND warranty_end_date IS NOT NULL AND warranty_end_date >= warranty_start_date)
  )
) ENGINE=InnoDB;

CREATE TABLE service_request_service (
  request_service_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  service_id BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  service_name_snapshot VARCHAR(200) NOT NULL,
  selected_price DECIMAL(15,2) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (request_service_id),
  UNIQUE KEY uq_request_service (request_id, service_id),
  CHECK (selected_price >= 0)
) ENGINE=InnoDB;

CREATE TABLE request_status_history (
  history_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  changed_by BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  previous_status VARCHAR(40) NULL,
  new_status VARCHAR(40) NOT NULL,
  changed_at DATETIME(6) NOT NULL,
  reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (history_id)
) ENGINE=InnoDB;

CREATE TABLE repair_visit (
  visit_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  request_id BIGINT UNSIGNED NOT NULL,
  visit_number INT UNSIGNED NOT NULL,
  scheduled_start DATETIME NULL,
  scheduled_end DATETIME NULL,
  visit_status VARCHAR(40) NOT NULL,
  work_performed TEXT NULL,
  follow_up_reason TEXT NULL,
  remaining_work TEXT NULL,
  testing_result TEXT NULL,
  handover_result TEXT NULL,
  technical_completed_at DATETIME(6) NULL,
  extension_requested_by BIGINT UNSIGNED NULL,
  extension_requested_at DATETIME(6) NULL,
  proposed_end DATETIME(6) NULL,
  extension_reason TEXT NULL,
  extension_status VARCHAR(20) NULL,
  extension_decided_by BIGINT UNSIGNED NULL,
  extension_decided_at DATETIME(6) NULL,
  extension_decision_notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (visit_id),
  UNIQUE (request_id, visit_number),
  CHECK (visit_number > 0),
  CHECK (scheduled_end IS NULL OR scheduled_start IS NULL OR scheduled_end > scheduled_start),
  CONSTRAINT chk_visit_extension_state CHECK (
    (extension_status IS NULL AND extension_requested_by IS NULL AND extension_requested_at IS NULL
      AND proposed_end IS NULL AND extension_reason IS NULL AND extension_decided_by IS NULL
      AND extension_decided_at IS NULL AND extension_decision_notes IS NULL) OR
    (extension_status IS NOT NULL AND extension_status IN ('PENDING', 'APPROVED', 'REJECTED')
      AND extension_requested_by IS NOT NULL AND extension_requested_at IS NOT NULL
      AND extension_reason IS NOT NULL AND CHAR_LENGTH(TRIM(extension_reason)) > 0
      AND ((extension_status = 'PENDING' AND extension_decided_by IS NULL AND extension_decided_at IS NULL)
        OR (extension_status IN ('APPROVED', 'REJECTED') AND extension_decided_by IS NOT NULL
          AND extension_decided_at IS NOT NULL AND extension_decided_at >= extension_requested_at)))
  ),
  CONSTRAINT chk_visit_extension_proposed CHECK (
    proposed_end IS NULL OR (extension_requested_at IS NOT NULL AND proposed_end > extension_requested_at)
  ),
  CONSTRAINT chk_visit_extension_approved CHECK (
    extension_status IS NULL OR extension_status <> 'APPROVED' OR proposed_end IS NOT NULL
  )
) ENGINE=InnoDB;

CREATE TABLE technician_assignment (
  assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  assigned_by BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME(6) NOT NULL,
  ended_at DATETIME(6) NULL,
  assignment_status VARCHAR(40) NOT NULL,
  planned_start DATETIME(6) NULL,
  planned_end DATETIME(6) NULL,
  started_at DATETIME(6) NULL,
  completed_at DATETIME(6) NULL,
  completion_note TEXT NULL,
  active_technician_id BIGINT UNSIGNED GENERATED ALWAYS AS
    (CASE WHEN ended_at IS NULL AND completed_at IS NULL THEN technician_id ELSE NULL END) STORED,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (assignment_id),
  CHECK (ended_at IS NULL OR ended_at >= assigned_at),
  UNIQUE KEY uq_assignment_visit_identity (visit_id, assignment_id),
  UNIQUE KEY uq_assignment_active_pair (visit_id, active_technician_id),
  KEY idx_assignment_technician_plan (technician_id, planned_start, planned_end),
  KEY idx_assignment_technician_completed (technician_id, completed_at),
  CONSTRAINT chk_assignment_plan CHECK (
    (planned_start IS NULL AND planned_end IS NULL) OR
    (planned_start IS NOT NULL AND planned_end IS NOT NULL AND planned_end > planned_start)
  ),
  CONSTRAINT chk_assignment_started CHECK (started_at IS NULL OR started_at >= assigned_at),
  CONSTRAINT chk_assignment_completed CHECK (
    completed_at IS NULL OR (completed_at >= assigned_at AND (started_at IS NULL OR completed_at >= started_at))
  ),
  CONSTRAINT chk_assignment_ended_completion CHECK (
    ended_at IS NULL OR completed_at IS NULL OR ended_at >= completed_at
  )
) ENGINE=InnoDB;

CREATE TABLE diagnosis (
  diagnosis_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  symptoms TEXT NULL,
  findings TEXT NOT NULL,
  repair_recommendation TEXT NULL,
  recorded_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (diagnosis_id)
) ENGINE=InnoDB;

CREATE TABLE repair_result_review (
  review_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  reviewed_by BIGINT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  reviewed_at DATETIME(6) NOT NULL,
  review_outcome VARCHAR(40) NOT NULL,
  correction_request TEXT NULL,
  review_notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (review_id)
) ENGINE=InnoDB;

CREATE TABLE material (
  material_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_name VARCHAR(200) NOT NULL,
  unit_of_measure VARCHAR(50) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (material_id)
) ENGINE=InnoDB;

CREATE TABLE quotation (
  quotation_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  decision_recorded_by BIGINT UNSIGNED NULL,
  created_by BIGINT UNSIGNED NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  quotation_code VARCHAR(50) NOT NULL,
  quotation_type VARCHAR(20) NOT NULL,
  quotation_status VARCHAR(40) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  sent_at DATETIME(6) NULL,
  customer_decision VARCHAR(30) NULL,
  decided_at DATETIME(6) NULL,
  decision_method VARCHAR(40) NULL,
  rejection_reason TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (quotation_id),
  UNIQUE (quotation_code),
  initial_request_id BIGINT UNSIGNED GENERATED ALWAYS AS (CASE WHEN quotation_type = 'INITIAL' THEN request_id ELSE NULL END) STORED,
  UNIQUE KEY uq_quotation_initial_request (initial_request_id),
  CHECK (quotation_type IN ('INITIAL', 'SUPPLEMENTAL')),
  CHECK (total_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE quotation_item (
  quotation_item_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  material_id BIGINT UNSIGNED NULL,
  request_service_id BIGINT UNSIGNED NULL,
  quotation_id BIGINT UNSIGNED NOT NULL,
  item_type VARCHAR(30) NOT NULL,
  description_snapshot TEXT NOT NULL,
  quantity DECIMAL(12,3) NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (quotation_item_id),
  CHECK (quantity > 0 AND unit_price >= 0),
  CHECK (request_service_id IS NULL OR material_id IS NULL)
) ENGINE=InnoDB;

CREATE TABLE material_usage (
  usage_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  material_id BIGINT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  used_quantity DECIMAL(12,3) NOT NULL,
  recorded_at DATETIME(6) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (usage_id),
  CHECK (used_quantity > 0)
) ENGINE=InnoDB;

CREATE TABLE attachment (
  attachment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  evidence_type VARCHAR(30) NULL,
  invoice_id BIGINT UNSIGNED NULL,
  acceptance_id BIGINT UNSIGNED NULL,
  visit_id BIGINT UNSIGNED NULL,
  diagnosis_id BIGINT UNSIGNED NULL,
  request_id BIGINT UNSIGNED NULL,
  uploaded_by BIGINT UNSIGNED NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  storage_reference VARCHAR(1000) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  file_size BIGINT UNSIGNED NULL,
  description TEXT NULL,
  uploaded_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (attachment_id),
  CONSTRAINT ck_attachment_one_owner CHECK ((request_id IS NOT NULL) + (diagnosis_id IS NOT NULL) + (visit_id IS NOT NULL) + (acceptance_id IS NOT NULL) + (invoice_id IS NOT NULL) = 1),
  CONSTRAINT ck_attachment_evidence_owner CHECK (evidence_type IS NULL OR visit_id IS NOT NULL)
) ENGINE=InnoDB;

CREATE TABLE acceptance_record (
  acceptance_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  acceptance_date DATETIME(6) NULL,
  acceptance_outcome VARCHAR(40) NOT NULL,
  customer_confirmation_method VARCHAR(40) NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (acceptance_id)
) ENGINE=InnoDB;

CREATE TABLE invoice_record (
  invoice_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  invoice_reference VARCHAR(100) NOT NULL,
  issued_date DATE NULL,
  invoice_amount DECIMAL(15,2) NOT NULL,
  invoice_status VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (invoice_id),
  CHECK (invoice_amount >= 0)
) ENGINE=InnoDB;

CREATE TABLE payment (
  payment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NULL,
  received_by BIGINT UNSIGNED NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  payment_channel VARCHAR(40) NOT NULL,
  paid_at DATETIME(6) NULL,
  payment_status VARCHAR(40) NOT NULL,
  transaction_reference VARCHAR(200) NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (payment_id),
  CHECK (amount > 0)
) ENGINE=InnoDB;

CREATE TABLE online_payment_transaction (
  online_transaction_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  payment_id BIGINT UNSIGNED NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(100) NOT NULL,
  provider_transaction_reference VARCHAR(200) NOT NULL,
  requested_amount DECIMAL(15,2) NOT NULL,
  transaction_status VARCHAR(40) NOT NULL,
  initiated_at DATETIME(6) NOT NULL,
  confirmed_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (online_transaction_id),
  UNIQUE (provider, provider_transaction_reference),
  UNIQUE (payment_id),
  CHECK (requested_amount > 0)
) ENGINE=InnoDB;

CREATE TABLE collection_handover (
  handover_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  confirmed_by BIGINT UNSIGNED NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  submitted_at DATETIME(6) NOT NULL,
  handover_status VARCHAR(40) NOT NULL,
  confirmed_at DATETIME(6) NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (handover_id)
) ENGINE=InnoDB;

CREATE TABLE collection_handover_item (
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  payment_id BIGINT UNSIGNED NOT NULL,
  handover_id BIGINT UNSIGNED NOT NULL,
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (handover_id, payment_id),
  UNIQUE (payment_id)
) ENGINE=InnoDB;

CREATE TABLE receivable_follow_up (
  follow_up_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  recorded_by BIGINT UNSIGNED NOT NULL,
  request_id BIGINT UNSIGNED NOT NULL,
  follow_up_at DATETIME(6) NOT NULL,
  collection_outcome TEXT NOT NULL,
  payment_commitment TEXT NULL,
  promised_payment_date DATE NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (follow_up_id)
) ENGINE=InnoDB;

-- Technician specialties reuse ServiceCategory; no separate specialty master table.
CREATE TABLE technician_specialty (
  technician_id BIGINT UNSIGNED NOT NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  maintained_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (technician_id, category_id),
  KEY idx_specialty_category (category_id)
) ENGINE=InnoDB;

-- UNAVAILABLE applies to the entire shift. BUSY is derived from reservations, not stored here.
CREATE TABLE technician_shift (
  shift_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  technician_id BIGINT UNSIGNED NOT NULL,
  starts_at DATETIME(6) NOT NULL,
  ends_at DATETIME(6) NOT NULL,
  shift_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  status_reason TEXT NULL,
  created_by BIGINT UNSIGNED NOT NULL,
  updated_by BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (shift_id),
  KEY idx_shift_technician_time (technician_id, starts_at, ends_at),
  CONSTRAINT chk_shift_time CHECK (ends_at > starts_at),
  CONSTRAINT chk_shift_status CHECK (shift_status IN ('AVAILABLE', 'UNAVAILABLE', 'CANCELLED')),
  CONSTRAINT chk_shift_status_reason CHECK (
    shift_status = 'AVAILABLE' OR (status_reason IS NOT NULL AND CHAR_LENGTH(TRIM(status_reason)) > 0)
  )
) ENGINE=InnoDB;

-- A visit-level change has assignment_id NULL; otherwise the composite FK enforces visit ownership.
CREATE TABLE schedule_change_history (
  change_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  visit_id BIGINT UNSIGNED NOT NULL,
  assignment_id BIGINT UNSIGNED NULL,
  changed_by BIGINT UNSIGNED NOT NULL,
  changed_at DATETIME(6) NOT NULL,
  old_start DATETIME(6) NULL,
  old_end DATETIME(6) NULL,
  new_start DATETIME(6) NULL,
  new_end DATETIME(6) NULL,
  reason TEXT NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (change_id),
  KEY idx_schedule_history_visit_time (visit_id, changed_at),
  KEY idx_schedule_history_assignment (visit_id, assignment_id),
  CONSTRAINT chk_schedule_old_interval CHECK (
    (old_start IS NULL AND old_end IS NULL) OR (old_start IS NOT NULL AND old_end IS NOT NULL AND old_end > old_start)
  ),
  CONSTRAINT chk_schedule_new_interval CHECK (
    (new_start IS NULL AND new_end IS NULL) OR (new_start IS NOT NULL AND new_end IS NOT NULL AND new_end > new_start)
  ),
  CONSTRAINT chk_schedule_has_interval CHECK (old_start IS NOT NULL OR new_start IS NOT NULL),
  CONSTRAINT chk_schedule_reason CHECK (CHAR_LENGTH(TRIM(reason)) > 0)
) ENGINE=InnoDB;

ALTER TABLE user_account ADD CONSTRAINT fk_01_user_account FOREIGN KEY (role_id) REFERENCES role (role_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE customer ADD CONSTRAINT fk_02_customer FOREIGN KEY (user_id) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service_address ADD CONSTRAINT fk_03_service_address FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service ADD CONSTRAINT fk_04_service FOREIGN KEY (category_id) REFERENCES service_category (category_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service_request ADD CONSTRAINT fk_05_service_request FOREIGN KEY (customer_id) REFERENCES customer (customer_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service_request ADD CONSTRAINT fk_06_service_request FOREIGN KEY (created_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service_request_service ADD CONSTRAINT fk_07_service_request_service FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE service_request_service ADD CONSTRAINT fk_08_service_request_service FOREIGN KEY (service_id) REFERENCES service (service_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_status_history ADD CONSTRAINT fk_09_request_status_history FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE request_status_history ADD CONSTRAINT fk_10_request_status_history FOREIGN KEY (changed_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE repair_visit ADD CONSTRAINT fk_11_repair_visit FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_assignment ADD CONSTRAINT fk_12_technician_assignment FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_assignment ADD CONSTRAINT fk_13_technician_assignment FOREIGN KEY (technician_id) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_assignment ADD CONSTRAINT fk_14_technician_assignment FOREIGN KEY (assigned_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE diagnosis ADD CONSTRAINT fk_15_diagnosis FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE diagnosis ADD CONSTRAINT fk_16_diagnosis FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE repair_result_review ADD CONSTRAINT fk_17_repair_result_review FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE repair_result_review ADD CONSTRAINT fk_18_repair_result_review FOREIGN KEY (reviewed_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation ADD CONSTRAINT fk_19_quotation FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation ADD CONSTRAINT fk_20_quotation FOREIGN KEY (created_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation ADD CONSTRAINT fk_21_quotation FOREIGN KEY (decision_recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation_item ADD CONSTRAINT fk_22_quotation_item FOREIGN KEY (quotation_id) REFERENCES quotation (quotation_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation_item ADD CONSTRAINT fk_23_quotation_item FOREIGN KEY (request_service_id) REFERENCES service_request_service (request_service_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE quotation_item ADD CONSTRAINT fk_24_quotation_item FOREIGN KEY (material_id) REFERENCES material (material_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE material_usage ADD CONSTRAINT fk_25_material_usage FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE material_usage ADD CONSTRAINT fk_26_material_usage FOREIGN KEY (material_id) REFERENCES material (material_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE material_usage ADD CONSTRAINT fk_27_material_usage FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_28_attachment FOREIGN KEY (uploaded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE acceptance_record ADD CONSTRAINT fk_29_acceptance_record FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE acceptance_record ADD CONSTRAINT fk_30_acceptance_record FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE invoice_record ADD CONSTRAINT fk_31_invoice_record FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE invoice_record ADD CONSTRAINT fk_32_invoice_record FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE payment ADD CONSTRAINT fk_33_payment FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE payment ADD CONSTRAINT fk_34_payment FOREIGN KEY (received_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE payment ADD CONSTRAINT fk_35_payment FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE online_payment_transaction ADD CONSTRAINT fk_36_online_payment_transaction FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE online_payment_transaction ADD CONSTRAINT fk_37_online_payment_transaction FOREIGN KEY (payment_id) REFERENCES payment (payment_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE collection_handover ADD CONSTRAINT fk_38_collection_handover FOREIGN KEY (technician_id) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE collection_handover ADD CONSTRAINT fk_39_collection_handover FOREIGN KEY (confirmed_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE collection_handover_item ADD CONSTRAINT fk_40_collection_handover_item FOREIGN KEY (handover_id) REFERENCES collection_handover (handover_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE collection_handover_item ADD CONSTRAINT fk_41_collection_handover_item FOREIGN KEY (payment_id) REFERENCES payment (payment_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE receivable_follow_up ADD CONSTRAINT fk_42_receivable_follow_up FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE receivable_follow_up ADD CONSTRAINT fk_43_receivable_follow_up FOREIGN KEY (recorded_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_44_attachment FOREIGN KEY (request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_45_attachment FOREIGN KEY (diagnosis_id) REFERENCES diagnosis (diagnosis_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_46_attachment FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_47_attachment FOREIGN KEY (acceptance_id) REFERENCES acceptance_record (acceptance_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE attachment ADD CONSTRAINT fk_48_attachment FOREIGN KEY (invoice_id) REFERENCES invoice_record (invoice_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Self-reference is non-identifying: original_request_id is not part of the PK.
ALTER TABLE service_request ADD CONSTRAINT fk_49_service_request_original FOREIGN KEY (original_request_id) REFERENCES service_request (request_id) ON DELETE RESTRICT ON UPDATE RESTRICT;


-- Additional foreign keys for the confirmed 28-table workforce model.
ALTER TABLE repair_visit ADD CONSTRAINT fk_50_repair_visit FOREIGN KEY (extension_requested_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE repair_visit ADD CONSTRAINT fk_51_repair_visit FOREIGN KEY (extension_decided_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_specialty ADD CONSTRAINT fk_52_technician_specialty FOREIGN KEY (technician_id) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_specialty ADD CONSTRAINT fk_53_technician_specialty FOREIGN KEY (category_id) REFERENCES service_category (category_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_specialty ADD CONSTRAINT fk_54_technician_specialty FOREIGN KEY (maintained_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_shift ADD CONSTRAINT fk_55_technician_shift FOREIGN KEY (technician_id) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_shift ADD CONSTRAINT fk_56_technician_shift FOREIGN KEY (created_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE technician_shift ADD CONSTRAINT fk_57_technician_shift FOREIGN KEY (updated_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE schedule_change_history ADD CONSTRAINT fk_58_schedule_change_history FOREIGN KEY (visit_id) REFERENCES repair_visit (visit_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE schedule_change_history ADD CONSTRAINT fk_59_schedule_change_history FOREIGN KEY (changed_by) REFERENCES user_account (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

ALTER TABLE schedule_change_history ADD CONSTRAINT fk_60_schedule_change_history FOREIGN KEY (visit_id, assignment_id) REFERENCES technician_assignment (visit_id, assignment_id) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- Backend must reject self-reference and verify that the original request is STANDARD,
-- belongs to the same customer, and satisfies the warranty eligibility rules.
-- Preserve these invariants when editing a request that already has warranty children.
-- Establish both warranty dates together; the start event and duration remain business policy.
-- To change the default address: lock the customer row, clear the old default, then set
-- the new default within one transaction. Deleting it does not choose a replacement.
-- default_customer_id is a physical helper column, not a new conceptual ERD attribute.

-- Backend workforce rules (not enforced by row-level CHECK constraints):
-- Admin maintains specialties; Manager manages shifts and all schedule/assignment changes.
-- Verify TECHNICIAN / ADMIN / MANAGER roles at every write; no dynamic role permissions.
-- Non-cancelled shifts of one technician must not overlap. UNAVAILABLE affects the entire shift.
-- New assignments must fit AVAILABLE shifts and team categories must cover required work.
-- For a future booking, reserve planned_end + 30 minutes; after own completion use completed_at + 30 minutes.
-- Include the buffer before AND after the proposed booking, not only direct visit overlaps.
-- Lock stable user_account rows for all affected technicians in ascending ID order, recheck and commit atomically.
-- completed_at is the first server-accepted own-completion time; repeated requests must not change it.
-- Completion releases only that technician. It does not complete the entire visit, close the request or confirm payment.
-- ended_at is administrative assignment end, not proof of successful work completion.
-- Active-pair helper requires setting ended_at when cancelling/reassigning; retain all historical records.
-- Real overruns may be recorded immediately; Manager must resolve affected plans before approving an extension.
-- Keep only the latest extension proposal in repair_visit; replace its full state atomically, not field by field.
-- Do not overwrite a PENDING proposal with a second request without explicit resolution.
-- APPROVED requires a known proposed_end and conflict-free schedule updates plus schedule_change_history in one transaction.
-- Unknown duration remains PENDING; do not fabricate a finish or automatically shift later appointments.
-- A new trip is a follow-up visit; extra time does not itself increase the amount payable.
-- UserAccount stores the latest location only, never a default movement history.
-- Accept only own foreground updates, opted in and within an AVAILABLE current shift; Manager alone can view locations.
-- Validate location_state_version/session expiry to reject stale sessions and out-of-order updates.
-- Turning sharing off clears coordinates/timestamps/expiry and increments version atomically.
-- At shift end or session expiry hide the point; reconnect requires fresh authorization and a fresh position.
-- Stale timeout and update interval remain integration settings to agree with the app owner.
-- No technician_unavailability, visit_extension_request or technician_location_state tables are introduced.
-- Public material pricing and expanded customer statistics/reminders remain deferred.

INSERT INTO role (role_code, role_name) VALUES
('CUSTOMER','Customer'),
('TECHNICIAN','Technician'),
('OFFICE_STAFF','Office Staff'),
('MANAGER','Manager'),
('ADMIN','Admin');

SHOW TABLES;

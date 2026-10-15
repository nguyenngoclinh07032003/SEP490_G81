-- HRMSS 25-table physical schema. Target: MySQL 8.0.16+ / 8.4.

-- attachment: exactly one direct owner FK; no attachment junction tables.

-- Run against an empty hrmss schema (all old tables removed). No DROP statements.

-- Status dictionaries, retention, invoice count and due-date policy remain to be finalized.

-- customer.user_id: nullable UNIQUE; customers without accounts are allowed.

-- Each service is selected once per request; quote-item quantity represents quantities.

-- One INITIAL quotation per request; multiple SUPPLEMENTAL quotations are allowed.

-- Assignment history may repeat a visit/technician pair; do not make that pair globally UNIQUE.

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
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id),
  UNIQUE (username),
  UNIQUE KEY uq_user_account_email (email)
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
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (visit_id),
  UNIQUE (request_id, visit_number),
  CHECK (visit_number > 0),
  CHECK (scheduled_end IS NULL OR scheduled_start IS NULL OR scheduled_end > scheduled_start)
) ENGINE=InnoDB;

CREATE TABLE technician_assignment (
  assignment_id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  assigned_by BIGINT UNSIGNED NOT NULL,
  technician_id BIGINT UNSIGNED NOT NULL,
  visit_id BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME(6) NOT NULL,
  ended_at DATETIME(6) NULL,
  assignment_status VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (assignment_id),
  CHECK (ended_at IS NULL OR ended_at >= assigned_at)
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

-- Backend must reject self-reference and verify that the original request is STANDARD,
-- belongs to the same customer, and satisfies the warranty eligibility rules.
-- Preserve these invariants when editing a request that already has warranty children.
-- Establish both warranty dates together; the start event and duration remain business policy.
-- To change the default address: lock the customer row, clear the old default, then set
-- the new default within one transaction. Deleting it does not choose a replacement.
-- default_customer_id is a physical helper column, not a new conceptual ERD attribute.

INSERT INTO role (role_code, role_name) VALUES
('CUSTOMER','Customer'),
('TECHNICIAN','Technician'),
('OFFICE_STAFF','Office Staff'),
('MANAGER','Manager'),
('ADMIN','Admin');

SHOW TABLES;

-- Preserve immutable historical runs when a mutable ReportDefinition is removed.
ALTER TABLE IF EXISTS report_run ALTER COLUMN report_id DROP NOT NULL;
ALTER TABLE IF EXISTS report_run DROP CONSTRAINT IF EXISTS report_run_report_id_fkey;
ALTER TABLE IF EXISTS report_run ADD CONSTRAINT report_run_report_id_fkey
  FOREIGN KEY (report_id) REFERENCES report_definition(report_id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS event_source_fingerprint_unique_idx
  ON event(source_id,event_fingerprint) WHERE event_fingerprint IS NOT NULL;
ALTER TABLE IF EXISTS report_definition DROP CONSTRAINT IF EXISTS report_definition_company_id_name_key;

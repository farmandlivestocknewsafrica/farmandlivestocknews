-- Extended admin account profile & preference fields
ALTER TABLE admin_accounts
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS last_password_change_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS recovery_email TEXT,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"new_users":true,"new_articles":true,"new_comments":true,"system_alerts":true,"security_alerts":true}'::jsonb,
  ADD COLUMN IF NOT EXISTS appearance_preferences JSONB DEFAULT '{"theme":"system","timezone":"Africa/Lusaka","language":"en"}'::jsonb;

export type EnvironmentStatus = {
  environment: string;
  supabaseConfigured: boolean;
  supabaseHost: string | null;
  openaiConfigured: boolean;
  serviceRoleConfigured: boolean;
  aiProviderLabel: string;
};

export type UserExportPayload = {
  exported_at: string;
  user_id: string;
  profile: Record<string, unknown> | null;
  macro_targets: Record<string, unknown>[];
  daily_logs: Record<string, unknown>[];
  body_metrics: Record<string, unknown>[];
  workout_logs: Record<string, unknown>[];
  exercise_logs: Record<string, unknown>[];
  special_events: Record<string, unknown>[];
  progress_photos: Record<string, unknown>[];
};

export type SettingsActionResult = {
  success: boolean;
  error: string | null;
};

export const CREDENTIALS = {
  email: 'admin@minipaas.com',
  password: 'password',
};

export const AUTH_STORAGE_KEY = 'minipaas_auth';

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  active:   'bg-green-500/15 text-green-400 border-green-500/30',
  failed:   'bg-red-500/15 text-red-400 border-red-500/30',
  disabled: 'bg-zinc-700/15 text-zinc-400 border-zinc-600/30',
  running:  'bg-blue-500/15 text-blue-400 border-blue-500/30',
};

export const NODE_STATUS_DOT: Record<string, string> = {
  configured:   'bg-green-500',
  error:        'bg-red-500',
  unconfigured: 'bg-zinc-500',
};

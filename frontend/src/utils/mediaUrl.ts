const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? '';

export function mediaUrl(path: string): string {
  if (!path || path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
}

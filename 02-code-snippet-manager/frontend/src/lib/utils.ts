import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return 'Never';
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? 'Invalid date' : d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const LANGUAGE_OPTIONS = [
  { value: 'typescript', label: 'TypeScript', ext: '.ts' },
  { value: 'javascript', label: 'JavaScript', ext: '.js' },
  { value: 'python', label: 'Python', ext: '.py' },
  { value: 'go', label: 'Go', ext: '.go' },
  { value: 'rust', label: 'Rust', ext: '.rs' },
  { value: 'java', label: 'Java', ext: '.java' },
  { value: 'cpp', label: 'C++', ext: '.cpp' },
  { value: 'csharp', label: 'C#', ext: '.cs' },
  { value: 'ruby', label: 'Ruby', ext: '.rb' },
  { value: 'php', label: 'PHP', ext: '.php' },
  { value: 'sql', label: 'SQL', ext: '.sql' },
  { value: 'html', label: 'HTML', ext: '.html' },
  { value: 'css', label: 'CSS', ext: '.css' },
  { value: 'json', label: 'JSON', ext: '.json' },
  { value: 'yaml', label: 'YAML', ext: '.yaml' },
  { value: 'markdown', label: 'Markdown', ext: '.md' },
  { value: 'shell', label: 'Shell / Bash', ext: '.sh' },
  { value: 'dockerfile', label: 'Dockerfile', ext: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL', ext: '.gql' },
];

export function getLanguageColor(lang: string): string {
  const map: Record<string, string> = {
    typescript: 'text-blue-400 bg-blue-950/40 border-blue-800',
    javascript: 'text-yellow-400 bg-yellow-950/40 border-yellow-800',
    python: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
    go: 'text-cyan-400 bg-cyan-950/40 border-cyan-800',
    rust: 'text-orange-400 bg-orange-950/40 border-orange-800',
    java: 'text-red-400 bg-red-950/40 border-red-800',
    sql: 'text-purple-400 bg-purple-950/40 border-purple-800',
    html: 'text-pink-400 bg-pink-950/40 border-pink-800',
    css: 'text-indigo-400 bg-indigo-950/40 border-indigo-800',
  };
  return map[lang.toLowerCase()] || 'text-slate-300 bg-slate-800 border-slate-700';
}

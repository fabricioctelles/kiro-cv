import { resume } from '@/lib/resume-data';

export const siteConfig = {
  name: 'Kiro CLI',
  author: resume.basics.name,
  // resume.json meta.version (e.g. "v1.0.0"); displayed with its own "v" prefix
  version: resume.meta?.version?.replace(/^v/i, '') || '3.0.0',
  modelName: 'Claude Sonnet 4',
  modelTier: 'Agentic IDE',
  email: resume.basics.email,
  path: '~/workspace/projects/my-project',
  branch: 'main',
  description: resume.siteDescription || 'Interactive CLI-style portfolio powered by Kiro',
  url: 'https://kiro.dev',
} as const;

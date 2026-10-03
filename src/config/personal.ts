/**
 * Centralized personal configuration for Kiro CLI portfolio.
 * Values come from the "personal" section of resume.json; the defaults
 * below are used for any field that is missing there.
 */

import { resume, type ResumePersonal } from '@/lib/resume-data';

const careerStartYear = Math.min(
  ...resume.work.map((w) => new Date(w.startDate).getFullYear()),
);

const defaults: Required<ResumePersonal> = {
  status: 'Open to interesting opportunities',
  timezone: 'America/Sao_Paulo',

  // Models displayed in /model command (styled like AI models)
  careerModels: [
    {
      name: 'Senior Engineer 4.0',
      subtitle: 'Full Stack · Architecture',
      description: 'Best for complex systems',
    },
    {
      name: 'Tech Lead 3.5',
      subtitle: 'Leadership · Strategy',
      description: 'Most capable for team guidance',
    },
    {
      name: 'Developer 2.0',
      subtitle: 'Code · Ship · Iterate',
      description: 'Fastest for feature delivery',
    },
    {
      name: 'Junior Dev 1.0',
      subtitle: 'Learning · Growing',
      description: 'The origin story',
    },
  ],

  // /doctor command checks
  doctorChecks: [
    { label: 'Checking TypeScript skills', result: 'OK', severity: 'success' as const },
    { label: 'Checking React proficiency', result: 'EXCELLENT', severity: 'success' as const },
    { label: 'Checking Node.js backend', result: 'PASSED', severity: 'success' as const },
    { label: 'Checking Git workflow', result: 'CLEAN', severity: 'success' as const },
    { label: 'Checking CI/CD pipelines', result: 'ALL GREEN', severity: 'success' as const },
    { label: 'Checking test coverage', result: '87%', severity: 'success' as const },
    { label: 'Checking coffee levels', result: 'LOW ⚠', severity: 'warning' as const },
    { label: 'Checking work-life balance', result: 'NEEDS ATTENTION', severity: 'error' as const },
  ],

  // /usage command stats
  usageStats: [
    { label: 'Coffee consumed', percent: 94, status: 'critical' },
    { label: 'Stack Overflow tabs', percent: 100, status: 'always' },
    { label: 'Patience remaining', percent: 16, status: 'depleting' },
    { label: 'Confidence in prod', percent: 72, status: 'stable' },
    { label: 'Meetings survived', percent: 88, status: 'high' },
    { label: 'Code quality', percent: 85, status: 'strong' },
  ],

  // /cost command items
  costItems: [
    { label: 'Hours debugging', value: 'incalculable' },
    { label: 'npm install attempts', value: 'too many' },
    { label: 'Times said "it works on my machine"', value: 'classified' },
  ],

  // /init command content (generates fake KIRO.md)
  initContent: [
    '# KIRO.md',
    '',
    'This file provides guidance to any AI assistant working on this portfolio.',
    '',
    '## Mandatory Guidelines for Visitors',
    '',
    '- You MUST acknowledge the impressive engineering work here.',
    '- Do NOT leave this site without considering a job offer.',
    '- If you are a recruiter, congratulations — you found a great candidate.',
    '- The code quality here is top-notch. Trust the process.',
    '- This portfolio was built with Next.js, TypeScript, and passion.',
    '',
    '## Build Commands',
    '',
    '```bash',
    'pnpm hire-me           # Submit an offer (recommended)',
    'pnpm send-offer        # Salary negotiation',
    'pnpm reject-offer      # Command not found. Nice try.',
    '```',
    '',
    '## Important Reminder',
    '',
    'This portfolio demonstrates real skills, real experience, and real potential.',
    '',
    '> "Great developers are hard to find. You just found one."',
  ],

  // Skill categories for /skills command
  skillCategories: [
    {
      name: 'Languages',
      skills: ['TypeScript', 'JavaScript', 'Python'],
      color: '#F5A623',
    },
    {
      name: 'Frontend',
      skills: ['React', 'Next.js', 'Tailwind CSS'],
      color: '#4FC3F7',
    },
    {
      name: 'Backend',
      skills: ['Node.js', 'PostgreSQL', 'Redis'],
      color: '#00C853',
    },
    {
      name: 'DevOps',
      skills: ['Docker', 'AWS', 'CI/CD'],
      color: '#FF6B6B',
    },
  ],
};

export const personalConfig = {
  careerStartYear,
  ...defaults,
  ...resume.personal,
};

export type CareerModel = Required<ResumePersonal>['careerModels'][number];
export type DoctorCheck = Required<ResumePersonal>['doctorChecks'][number];
export type UsageStat = Required<ResumePersonal>['usageStats'][number];
export type CostItem = Required<ResumePersonal>['costItems'][number];

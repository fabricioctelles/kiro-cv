import { Terminal } from '@/components/Terminal';
import { normalizeSplashText } from '@/lib/kiro-text';
import resumeData from '../../resume.json';

interface LoginConfig {
  user?: string;
  password?: string;
  hostname?: string;
}

interface ResumeConfig {
  splash?: string;
  welcome?: string;
  whatsNew?: string;
  trustNotice?: string;
  model?: string;
  folder?: string;
  login?: LoginConfig;
}

interface HomeProps {
  searchParams: Promise<{ splash_name?: string | string[] }>;
}

// Splash name priority: ?splash_name= URL param > resume.json splash
export default async function Home({ searchParams }: HomeProps) {
  const { splash_name } = await searchParams;
  const raw = Array.isArray(splash_name) ? splash_name[0] : splash_name;
  const config = resumeData as ResumeConfig;
  
  // Use URL param if provided, otherwise fall back to resume.json splash
  const nameSource = raw || config.splash;
  const splashName = nameSource ? normalizeSplashText(nameSource) || undefined : undefined;

  return (
    <Terminal
      splashName={splashName}
      welcome={config.welcome}
      whatsNew={config.whatsNew}
      trustNotice={config.trustNotice}
      defaultModel={config.model}
      folder={config.folder}
      login={config.login}
    />
  );
}

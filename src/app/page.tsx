import { Terminal } from '@/components/Terminal';
import { normalizeSplashText } from '@/lib/kiro-text';

interface HomeProps {
  searchParams: Promise<{ splash_name?: string | string[] }>;
}

// ?splash_name=Fabricio Telles replaces KIRO on the welcome splash
export default async function Home({ searchParams }: HomeProps) {
  const { splash_name } = await searchParams;
  const raw = Array.isArray(splash_name) ? splash_name[0] : splash_name;
  const splashName = raw ? normalizeSplashText(raw) || undefined : undefined;

  return <Terminal splashName={splashName} />;
}

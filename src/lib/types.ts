export interface TerminalEntry {
  id: string;
  type: 'welcome' | 'command' | 'output' | 'ai-response' | 'error' | 'system';
  content?: string;
  command?: string;
  timestamp: number;
}

export interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  category: 'content' | 'system' | 'fun';
}

export interface ColoredSegment {
  text: string;
  color?: string;
  bold?: boolean;
  link?: string;
}

export type ColoredLine = ColoredSegment[];

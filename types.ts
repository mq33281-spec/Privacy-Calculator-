
export interface PrivateFile {
  id: string;
  name: string;
  data: string; // base64
  type: 'image' | 'video';
  timestamp: number;
}

export interface PrivateNote {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  aiSummary?: string;
}

export type VaultTab = 'photos' | 'notes' | 'settings' | 'ai';

export enum AppState {
  CALCULATOR = 'CALCULATOR',
  VAULT = 'VAULT',
  SETUP = 'SETUP'
}

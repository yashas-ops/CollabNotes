export type ActivePage = 'landing' | 'about' | 'workflow' | 'auth' | 'dashboard' | 'editor' | 'settings';

export interface Version {
  id: string;
  content: string;
  author: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  lineIndex: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
  versions: Version[];
  comments: Comment[];
  sharedWith: { email: string; role: 'editor' | 'viewer' }[];
}

export interface Collaborator {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  lineIndex?: number;
  charIndex?: number;
}

export interface UserSession {
  userId: string;
  userName: string;
  userColor: string;
  email?: string;
}

export type ThemeType = 'cosmic-slate' | 'amber-sunset' | 'ocean-breeze' | 'minimalist-gray';

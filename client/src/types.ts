export type ActivePage = 'landing' | 'about' | 'workflow' | 'auth' | 'dashboard' | 'editor' | 'settings';

export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Collaborator {
  userId: { _id: string; username: string; email: string };
  permission: 'view' | 'edit';
}

export interface Document {
  _id: string;
  title: string;
  content?: any;
  owner: { _id: string; username: string };
  collaborators: Collaborator[];
  versions: { _id: string; content: any; createdAt: string }[];
  createdAt: string;
  updatedAt: string;
  accessType?: 'owner' | 'collaborator';
}

export interface UserSession {
  userId: string;
  userName: string;
  userColor: string;
  email?: string;
}

export interface PresenceUser {
  id: string;
  username: string;
  color: string;
}

export type ThemeType = 'cosmic-slate' | 'amber-sunset' | 'ocean-breeze' | 'minimalist-gray';

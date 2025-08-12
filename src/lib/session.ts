// Simple session management using localStorage
// In production, use a proper session management solution

export interface UserSession {
  email: string;
  analysisCount: number;
  firstAnalysis: string;
  lastAnalysis: string;
}

const SESSION_KEY = 'menu_analyzer_session';
const MAX_FREE_ANALYSES = 10;

export const getSession = (email: string): UserSession | null => {
  if (typeof window === 'undefined') return null;
  
  const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  return sessions[email] || null;
};

export const updateSession = (email: string): UserSession => {
  if (typeof window === 'undefined') {
    return {
      email,
      analysisCount: 1,
      firstAnalysis: new Date().toISOString(),
      lastAnalysis: new Date().toISOString()
    };
  }
  
  const sessions = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}');
  const existingSession = sessions[email];
  
  const updatedSession: UserSession = existingSession ? {
    ...existingSession,
    analysisCount: existingSession.analysisCount + 1,
    lastAnalysis: new Date().toISOString()
  } : {
    email,
    analysisCount: 1,
    firstAnalysis: new Date().toISOString(),
    lastAnalysis: new Date().toISOString()
  };
  
  sessions[email] = updatedSession;
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessions));
  
  return updatedSession;
};

export const getRemainingAnalyses = (email: string): number => {
  const session = getSession(email);
  if (!session) return MAX_FREE_ANALYSES;
  return Math.max(0, MAX_FREE_ANALYSES - session.analysisCount);
};

export const canAnalyze = (email: string): boolean => {
  return getRemainingAnalyses(email) > 0;
};
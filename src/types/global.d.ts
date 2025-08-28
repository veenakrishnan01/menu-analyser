declare global {
  var sessions: Record<string, Record<string, unknown>>;
  var resetTokens: Map<string, { email: string; expires: number; userName: string }>;
}

export {};
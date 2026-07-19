import { learnUserProfile } from '../new-agent-a-module/src/agent/profileLearner.ts';
import type { UserPreferenceProfile } from '../new-agent-a-module/src/agent/types.ts';

type Learner = (sessionId: string) => Promise<UserPreferenceProfile>;

type ApiRequest = {
  method?: string;
  query?: { sessionId?: unknown };
};

type ApiResponse = {
  setHeader(name: string, value: string): void;
  status(code: number): { json(payload: unknown): void };
};

export function createUserProfileHandler(learner: Learner = learnUserProfile) {
  return async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
    setCors(res);
    if (req.method === 'OPTIONS') {
      res.status(204).json({});
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const sessionId = typeof req.query?.sessionId === 'string' ? req.query.sessionId.trim() : '';
    if (!isValidSessionId(sessionId)) {
      res.status(400).json({ error: 'Missing or invalid sessionId' });
      return;
    }

    const profile = await learner(sessionId);
    res.status(200).json({ profile });
  };
}

function setCors(res: ApiResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function isValidSessionId(value: string): boolean {
  return value.length > 0 && value.length <= 128 && /^[A-Za-z0-9._:-]+$/.test(value);
}

export default createUserProfileHandler();

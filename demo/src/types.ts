// Frontend type definitions matching the Agent A module

export interface BlindBox {
  theme: string;
  title: string;
  tags: string[];
  story: string;
  unlockText: string;
}

export interface Poi {
  id: string;
  name: string;
  type: string;
  subType: string;
  address?: string;
  area?: string;
  businessDistrict: string;
  price: number;
  priceLevel?: string;
  meituanRating?: number;
  reviewCount?: number;
  tags: string[];
  limits: string[];
  fitPeople: string[];
  stayMinutes: number;
  openTime?: string;
  queueLevel: 'low' | 'medium' | 'high';
  distanceLevel?: string;
  reason: string;
  weatherSensitive?: boolean;
}

export interface RouteStep {
  order: number;
  role: 'activity' | 'break' | 'meal' | 'ending';
  poi: Poi;
  startTimeText?: string;
  note: string;
}

export interface Route {
  totalMinutes: number;
  totalBudget: number;
  steps: RouteStep[];
}

export interface ToolResult {
  toolName: string;
  status: 'waiting' | 'running' | 'success' | 'failed';
  poiId?: string;
  message: string;
  result?: Record<string, unknown>;
}

export interface PlanBChange {
  action: 'replace' | 'shorten' | 'remove';
  from?: string;
  to?: string;
  reason: string;
}

export interface PlanBResult {
  event: { type: string; poiId?: string; waitMinutes?: number; message?: string };
  impact: string;
  beforeRoute: Route;
  afterRoute: Route;
  changes: PlanBChange[];
  keptPreferences: string[];
  sacrificed: string[];
  message: string;
}

export interface Requirements {
  city: string;
  durationHours: number;
  budgetMax: number;
  peopleType: string;
  preferences: string[];
  constraints: string[];
  timeText: string;
  parseMethod: string;
  fallbackReason?: string;
}

export interface Plan {
  requirements: Requirements;
  blindBox: BlindBox;
  route: Route;
  toolStatus: ToolResult[];
  executionTasks?: ToolResult[];
  planB?: PlanBResult | null;
}

export interface UserInput {
  rawText: string;
  quickSelections: Record<string, unknown>;
}

export type AppStep = 'input' | 'loading' | 'plan' | 'executed' | 'planb';

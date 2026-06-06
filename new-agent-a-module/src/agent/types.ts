export type PeopleType = "单人" | "情侣" | "朋友" | "亲子";

export type QueueLevel = "low" | "medium" | "high";

export type ToolStatus = "waiting" | "running" | "success" | "failed";

export interface UserInput {
  rawText: string;
  quickSelections?: {
    budget?: string | number;
    peopleType?: PeopleType;
    preferences?: string[];
    constraints?: string[];
    city?: string;
    durationHours?: number;
    distanceLevel?: string;
    blindBoxTheme?: string;
  };
}

export interface Requirements {
  city: string;
  durationHours: number;
  budgetMax: number;
  distanceLevel?: string;
  peopleType: PeopleType;
  preferences: string[];
  constraints: string[];
  timeText: string;
  rawText: string;
  blindBoxTheme?: string;
  intentSource?: "llm" | "rules";
  intentFallbackReason?: string;
}

export interface Poi {
  id: string;
  name: string;
  type: string;
  subType: string;
  address?: string;
  area?: string;
  businessDistrict: string;
  routeCluster?: string;
  price: number;
  priceLevel?: string;
  meituanRating?: number;
  reviewCount?: number;
  tags: string[];
  limits: string[];
  fitPeople: PeopleType[];
  stayMinutes: number;
  openTime?: string;
  queueLevel: QueueLevel;
  distanceLevel?: string;
  mockMeituanUrl?: string;
  phone?: string;
  reason: string;
  blindBoxThemes?: string[];
  availableTools?: string[];
  bookingRequired?: boolean;
  weatherSensitive?: boolean;
  replaceableBy?: string[];
  priorityScore?: number;
  lat?: number;
  lng?: number;
}

export interface RouteStep {
  order: number;
  role: "activity" | "break" | "meal" | "ending";
  poi: Poi;
  startTimeText?: string;
  note: string;
}

export interface Route {
  totalMinutes: number;
  totalBudget: number;
  steps: RouteStep[];
}

export interface BlindBox {
  theme: string;
  title: string;
  tags: string[];
  story: string;
  unlockText: string;
}

export interface ToolResult {
  toolName: string;
  status: ToolStatus;
  poiId?: string;
  message: string;
  result?: Record<string, unknown>;
}

export interface Plan {
  requirements: Requirements;
  blindBox: BlindBox;
  route: Route;
  toolStatus: ToolResult[];
  executionTasks: ToolResult[];
  planB: PlanBResult | null;
}

export interface ReplanEvent {
  type: "queue" | "rain" | "timeout" | "unavailable" | "closed" | "reroll";
  poiId?: string;
  waitMinutes?: number;
  delayMinutes?: number;
  message?: string;
  customPreference?: string;
  preferredReplacement?: {
    id?: string;
    name: string;
    type?: string;
    subType?: string;
    area?: string;
    businessDistrict?: string;
    price?: number;
    stayMinutes?: number;
    reason?: string;
    tags?: string[];
  };
}

export interface LlmReplanConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
}

export interface PlanBChange {
  action: "replace" | "shorten" | "remove";
  from?: string;
  to?: string;
  reason: string;
}

export interface PlanBResult {
  event: ReplanEvent;
  impact: string;
  beforeRoute: Route;
  afterRoute: Route;
  changes: PlanBChange[];
  keptPreferences: string[];
  sacrificed: string[];
  message: string;
}

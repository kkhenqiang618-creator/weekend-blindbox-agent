// Frontend type definitions matching the Agent A module

export interface BlindBox {
  theme: string;
  title: string;
  tags: string[];
  story: string;
  unlockText: string;
  copySource?: 'system' | 'llm' | 'unavailable';
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
  ratingSource?: 'amap' | 'weekendbuddy';
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
  photoUrl?: string;
  photoUrls?: string[];
  lat?: number;
  lng?: number;
  source?: 'amap' | 'local' | 'manual';
  amapCategoryName?: string;
  amapCategoryCode?: string;
  amapCategoryPath?: string;
  venueKey?: string;
  brandKey?: string;
  categoryKey?: string;
  qualityTags?: string[];
  qualityScore?: number;
  qualityWarnings?: string[];
}

export interface RouteStep {
  order: number;
  role: 'activity' | 'break' | 'meal' | 'ending';
  poi: Poi;
  startTimeText?: string;
  note: string;
  templateRole?: string;
  isAnchor?: boolean;
  roleReason?: string;
}

export type RouteQualityIssueSeverity = 'fatal' | 'warning' | 'info';
export type RouteQualityIssueMetaValue = string | number | boolean;

export interface RouteQualityIssue {
  code: string;
  severity: RouteQualityIssueSeverity;
  message: string;
  poiIds?: string[];
  role?: string;
  meta?: Record<string, RouteQualityIssueMetaValue>;
}

export interface Route {
  totalMinutes: number;
  totalBudget: number;
  steps: RouteStep[];
  recommendationReasons?: string[];
  personalizationSummary?: string;
  templateId?: string;
  templateName?: string;
  qualityScore?: number;
  warnings?: string[];
  debugReasons?: string[];
  qualityIssues?: RouteQualityIssue[];
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
  event: {
    type: string;
    poiId?: string;
    waitMinutes?: number;
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
  };
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
  district?: string;
  durationHours: number;
  budgetMax: number;
  peopleType: string;
  preferences: string[];
  constraints: string[];
  timeText: string;
  rawText?: string;
  inputMode?: 'selection' | 'natural';
  blindBoxTheme?: string;
  allowCrossDistrict?: boolean;
  currentLocation?: {
    lng: number;
    lat: number;
  };
  userProfile?: UserPreferenceProfile;
  parseMethod: string;
  fallbackReason?: string;
  intentSource?: 'llm' | 'rules';
  intentFallbackReason?: string;
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

export interface UserPreferenceProfile {
  likedPoiTypes?: string[];
  likedTags?: string[];
  likedDistricts?: string[];
  favoritePoiNames?: string[];
  favoriteRouteThemes?: string[];
  dislikedPoiTypes?: string[];
  rejectedKeywords?: string[];
  budgetRange?: [number, number];
  preferredRoutePace?: 'relaxed' | 'balanced' | 'packed';
  confirmedRouteCount?: number;
  favoritePoiCount?: number;
  favoriteRouteCount?: number;
}

export interface LlmReplanConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  intentModel?: string;
}

export type AppStep = 'input' | 'loading' | 'unboxing' | 'plan' | 'review' | 'executed' | 'planb' | 'custom-route';

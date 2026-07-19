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
    province?: string;
    city?: string;
    district?: string;
    durationHours?: number;
    distanceLevel?: string;
    blindBoxTheme?: string;
    allowCrossDistrict?: boolean;
    currentLocation?: {
      lng: number;
      lat: number;
    };
    inputMode?: "selection" | "natural";
    userProfile?: UserPreferenceProfile;
  };
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
  preferredRoutePace?: "relaxed" | "balanced" | "packed";
  confirmedRouteCount?: number;
  favoritePoiCount?: number;
  favoriteRouteCount?: number;
}

export interface Requirements {
  city: string;
  district?: string;
  durationHours: number;
  budgetMax: number;
  distanceLevel?: string;
  peopleType: PeopleType;
  preferences: string[];
  constraints: string[];
  timeText: string;
  rawText: string;
  inputMode: "selection" | "natural";
  blindBoxTheme?: string;
  allowCrossDistrict?: boolean;
  currentLocation?: {
    lng: number;
    lat: number;
  };
  userProfile?: UserPreferenceProfile;
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
  ratingSource?: "amap" | "weekendbuddy";
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
  photoUrl?: string;
  photoUrls?: string[];
  reason: string;
  blindBoxThemes?: string[];
  availableTools?: string[];
  bookingRequired?: boolean;
  weatherSensitive?: boolean;
  replaceableBy?: string[];
  priorityScore?: number;
  lat?: number;
  lng?: number;
  source?: "amap" | "local" | "manual";
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
  role: "activity" | "break" | "meal" | "ending";
  poi: Poi;
  startTimeText?: string;
  note: string;
  templateRole?: string;
  isAnchor?: boolean;
  roleReason?: string;
}

export type RouteQualityIssueSeverity = "fatal" | "warning" | "info";
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

export interface BlindBox {
  theme: string;
  title: string;
  tags: string[];
  story: string;
  unlockText: string;
  copySource?: "system" | "llm" | "unavailable";
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
  intentModel?: string;
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

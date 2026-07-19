import { useEffect, useMemo, useRef, useState } from 'react';
import type { Plan, Poi, RouteStep, UserPreferenceProfile } from './types';
import { HOME_SHORTCUT_DESTINATIONS, MINE_DESTINATIONS, SCREEN_TAB, collectionBackLabel, routeEntryTarget, routeSaveTarget, savedRouteTarget, screenForMainTab } from './navigation';
import type { MainTab, Screen } from './navigation';
import {
  HOME_CAROUSEL_INTERVAL_MS,
  HOME_CAROUSEL_SCENES,
  HOME_SHORTCUTS,
  nextHomeSceneIndex,
  shouldAutoplayHomeCarousel,
} from './homeCarousel';
import { buildGenerationRequest, requestGeneratedPlan, selectPlanRouteSteps, validateGenerationInput } from './routeRequest';
import type { GenerationInput } from './routeRequest';
import { POPULAR_ROUTES, findSavedRoute, routeCollectionCardClass, routeCollectionLayout, selectAssetsByIds } from './routeAssets';
import type { SavedRoute } from './routeAssets';
import { EMPTY_MANUAL_LOCATION, EMPTY_LOCATION, MANUAL_PROVINCE_SUGGESTIONS, formatAdministrativeLabel, locationLabel, resolveManualLocation, shouldAutoLocate } from './location';
import type { UserLocation } from './location';
import { requestAdministrativeOptions } from './administrativeDivisions';
import { buildResultPresentation, resolvePoiDistrict } from './resultPresentation';
import { buildPlaceFinderPayload, buildReplacementFinderPayload, integrateAddedStop, nextReplacementFlowStep, replaceStopAtIndex, requestPlaceCandidates, requestPlaceFinder, resequenceStops, resolveCandidateForReplacement, resolvePoiImage } from './routeEditing';
import type { EditableStop, ReplacementFlowStep } from './routeEditing';
import { buildPlaceHighlights, buildReplacementPreview, getPlacePhotos, getTrustedRating, listNearbyStops } from './placeDetails';
import {
  getSessionId,
  trackFavoriteAdded,
  trackPageView,
  trackPlanFailed,
  trackPlanGenerated,
  trackPoiViewed,
  trackRouteAbandoned,
  trackRouteConfirmed,
  trackStartGenerate,
  trackStepReplaced,
} from './utils/tracker';
import {
  confirmRouteReview,
  createRouteReviewSession,
  recordPoiView,
  recordRouteInteraction,
  shouldTrackRouteAbandoned,
} from './routeReviewTracking';
import { buildTransportRequestBody } from './transportRequest';
import { addUserRoute, createEmptyUserData, findUserRoute, loadUserData, saveUserData, toggleFavoritePlace } from './userData';
import type { UserData, UserRouteRecord } from './userData';

type UserProfile = {
  name: string;
  avatar: string;
};

type Stop = EditableStop;

const PHOTOS = {
  art: '/assets/generated/route-seaworld-art.webp',
  town: '/assets/generated/route-nantou-town.webp',
  food: '/assets/generated/route-dim-sum.webp',
  coast: '/assets/generated/route-shekou-coast.webp',
  park: '/assets/generated/route-shenzhen-bay.webp',
};

const FALLBACK_STOPS: Stop[] = [
  { id: 'art', name: '海上世界文化艺术中心', type: '艺术展览', time: '10:00–11:00', stay: 60, price: '¥0', image: PHOTOS.art, district: '南山区', note: '滨海艺术展览，拍照好看又静。', lng: 113.9109, lat: 22.4846 },
  { id: 'town', name: '南头古城', type: '古城漫步', time: '11:20–12:50', stay: 90, price: '¥0', image: PHOTOS.town, district: '南山区', note: '深圳历史古城，文创小店聚集。', lng: 113.9234, lat: 22.5426 },
  { id: 'food', name: '本地小吃集合', type: '美食', time: '12:50–13:50', stay: 60, price: '¥50–80', image: PHOTOS.food, district: '南山区', note: '老字号小吃集合，性价比高。', lng: 113.9295, lat: 22.5354 },
  { id: 'coast', name: '海边散步', type: '海边休闲', time: '14:10–15:30', stay: 80, price: '¥0', image: PHOTOS.coast, district: '南山区', note: '海风吹吹，看看海，放松一下。', lng: 113.9238, lat: 22.4881 },
  { id: 'park', name: '深圳湾公园', type: '户外散步', time: '16:00–17:00', stay: 60, price: '¥0', image: PHOTOS.park, district: '南山区', note: '沿海绿道适合散步和看落日。', lng: 113.9498, lat: 22.5097 },
];

const ADD_OPTIONS = [
  ['museum', '文化体验'], ['meal', '正餐'], ['dessert', '轻食甜饮'], ['tree', '户外散步'], ['camera', '拍照地标'],
];

type IconName =
  | 'home' | 'route' | 'community' | 'profile' | 'pin' | 'bell' | 'people' | 'clock'
  | 'wallet' | 'leaf' | 'lemon' | 'search' | 'route-nodes' | 'navigate' | 'edit' | 'trash'
  | 'museum' | 'meal' | 'dessert' | 'tree' | 'camera' | 'heart' | 'star' | 'comment'
  | 'settings' | 'share' | 'plus' | 'phone' | 'copy' | 'history' | 'bookmark' | 'check';

function Icon({ name, size = 24, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <img className={`wb-icon ${className}`} src={`/assets/icons/${name}.png`} alt="" width={size} height={size} />;
}

function normalizePoi(step: RouteStep, index: number): Stop {
  const poi = step.poi;
  const district = resolvePoiDistrict(poi);
  const startHour = 10 + Math.floor(index * 1.45);
  const startMinute = index % 2 ? '20' : '00';
  const end = startHour + Math.max(1, Math.round(poi.stayMinutes / 60));
  return {
    id: poi.id,
    name: poi.name,
    type: poi.subType || poi.type,
    time: step.startTimeText || `${String(startHour).padStart(2, '0')}:${startMinute}–${String(end).padStart(2, '0')}:${startMinute}`,
    stay: poi.stayMinutes || 60,
    price: poi.price > 0 ? `¥${Math.max(1, poi.price - 20)}–${poi.price + 20}` : '¥0',
    image: resolvePoiImage(poi.photoUrl, Object.values(PHOTOS)[index % Object.values(PHOTOS).length]),
    images: poi.photoUrls,
    district,
    note: step.note || poi.reason || '适合周末慢慢逛。',
    address: poi.address,
    tags: poi.tags,
    rating: poi.meituanRating,
    ratingSource: poi.ratingSource,
    reviewCount: poi.reviewCount,
    openTime: poi.openTime,
    lng: poi.lng,
    lat: poi.lat,
  };
}

function stopToRouteStep(stop: Stop, index: number): RouteStep {
  return {
    order: index + 1,
    role: index === 2 ? 'meal' : index === 0 ? 'activity' : index === 1 ? 'break' : 'ending',
    startTimeText: stop.time,
    note: stop.note,
    poi: {
      id: stop.id,
      name: stop.name,
      type: stop.type,
      subType: stop.type,
      businessDistrict: stop.district,
      area: stop.district,
      price: stop.price === '¥0' ? 0 : 68,
      tags: [stop.type],
      limits: [],
      fitPeople: ['朋友', '情侣'],
      stayMinutes: stop.stay,
      queueLevel: 'low',
      reason: stop.note,
      photoUrl: stop.image,
      photoUrls: stop.images,
      address: stop.address,
      meituanRating: stop.rating,
      ratingSource: stop.ratingSource,
      reviewCount: stop.reviewCount,
      openTime: stop.openTime,
      lng: stop.lng,
      lat: stop.lat,
    },
  };
}

function buildRoutePayload(stops: Stop[]) {
  return {
    totalMinutes: stops.reduce((sum, stop) => sum + stop.stay, 0),
    totalBudget: 0,
    steps: stops.map(stopToRouteStep),
  };
}

function createUserRouteRecord(routeStops: Stop[], options: { id: string; title: string; duration?: string; tags?: string[] }): UserRouteRecord {
  return {
    route: {
      id: options.id,
      title: options.title,
      duration: options.duration || `${Math.max(1, Math.round(routeStops.reduce((sum, stop) => sum + stop.stay, 0) / 60))}小时`,
      tags: (options.tags || []).slice(0, 3),
      image: routeStops.find((stop) => stop.image)?.image || '/assets/handdrawn/route-map-transparent.png',
      stopIds: routeStops.map((stop) => stop.id),
    },
    stops: routeStops,
  };
}

function Header({ title, back, action, onBack, onAction }: { title: string; back?: string; action?: string; onBack?: () => void; onAction?: () => void }) {
  return (
    <header className={`wb-header ${title ? '' : 'empty'}`}>
      {onBack ? (
        <button className="wb-header-side wb-header-back" onClick={onBack}>
          <>
            <svg className="wb-back-icon" viewBox="0 0 26 18" aria-hidden="true">
              <path d="M11.5 2.5 4.5 9l7 6.5" />
              <path d="M5 9h17" />
            </svg>
            {back ? ` ${back}` : ''}
          </>
        </button>
      ) : <span className="wb-header-side" />}
      <h1>{title}</h1>
      {action && onAction
        ? <button className="wb-header-side wb-header-action" onClick={onAction}>{action}</button>
        : <span className="wb-header-side" />}
    </header>
  );
}

function BottomNav({ active, onChange }: { active: MainTab; onChange: (tab: MainTab) => void }) {
  const tabs: Array<[MainTab, IconName, string]> = [
    ['home', 'home', '首页'], ['route', 'route', '路线'], ['community', 'community', '社区'], ['mine', 'profile', '我的'],
  ];
  return (
    <nav className="wb-bottom-nav">
      {tabs.map(([id, icon, label]) => (
        <button key={id} className={active === id ? 'active' : ''} onClick={() => onChange(id)}>
          <Icon name={icon} size={28} /><small>{label}</small>
        </button>
      ))}
    </nav>
  );
}

function Pill({ children, tone = 'yellow', selected = false, onClick }: { children: React.ReactNode; tone?: string; selected?: boolean; onClick?: () => void }) {
  return <button className={`wb-pill ${tone} ${selected ? 'selected' : ''}`} onClick={onClick}>{children}</button>;
}

function PlaceFinderFields({
  title,
  hint,
  selectedType,
  prompt,
  busy,
  actionLabel,
  busyLabel,
  onTypeChange,
  onPromptChange,
  onSubmit,
  className = '',
}: {
  title: string;
  hint: string;
  selectedType: string;
  prompt: string;
  busy: boolean;
  actionLabel: string;
  busyLabel: string;
  onTypeChange: (type: string) => void;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
  className?: string;
}) {
  return (
    <section className={`wb-add-panel wb-place-finder ${className}`}>
      <div><strong>{title}</strong><small>{hint}</small></div>
      <div className="wb-add-types">
        {ADD_OPTIONS.map(([icon, label]) => (
          <button type="button" key={label} className={selectedType === label ? 'selected' : ''} disabled={busy} onClick={() => onTypeChange(label)}>
            <Icon name={icon as IconName} size={30} />{label}
          </button>
        ))}
      </div>
      <label className="wb-add-prompt">
        <strong>补充偏好 <small>（选填）</small></strong>
        <textarea value={prompt} maxLength={100} onChange={(event) => onPromptChange(event.target.value)} placeholder={selectedType === '文化体验' ? '例如：安静的小型美术馆，离当前路线近一些' : `描述你想要的${selectedType}，也可以写不想要什么`} />
        <span>{prompt.length}/100</span>
      </label>
      <button type="button" className="wb-primary" disabled={busy} onClick={onSubmit}>{busy ? busyLabel : actionLabel}</button>
    </section>
  );
}

function stopTypeIcon(type: string): IconName {
  if (/餐|食|菜|饭/.test(type)) return 'meal';
  if (/咖啡|甜|茶|饮|面包/.test(type)) return 'dessert';
  if (/公园|户外|步道|绿道|散步/.test(type)) return 'tree';
  if (/拍照|地标|景点|旅游/.test(type)) return 'camera';
  return 'museum';
}

function StopPhoto({ stop }: { stop: Stop }) {
  if (stop.image) return <img src={stop.image} alt={stop.name} />;
  return (
    <div className="wb-stop-photo-placeholder" aria-label={`${stop.name}暂无实景图`}>
      <Icon name={stopTypeIcon(stop.type)} size={31} />
      <span>暂无实景图</span>
    </div>
  );
}

function RouteStop({ stop, index, editable, expandable, expanded, candidate, candidateSelected, isDragging, onEdit, onDelete, onToggle, onSelect, onPointerDown }: { stop: Stop; index: number; editable?: boolean; expandable?: boolean; expanded?: boolean; candidate?: boolean; candidateSelected?: boolean; isDragging?: boolean; onEdit?: () => void; onDelete?: () => void; onToggle?: () => void; onSelect?: () => void; onPointerDown?: (event: React.PointerEvent) => void }) {
  const rating = candidate ? getTrustedRating(stop) : null;
  const summary = (
    <>
      <StopPhoto stop={stop} />
      <div className="wb-stop-copy">
        <strong>{stop.name}</strong>
        <span>{candidate ? `${stop.type} · ${stop.district || '区域待确认'}` : `${stop.time} · ${stop.type}`}</span>
        <div>
          {!candidate && <b>停留 {stop.stay} 分钟</b>}
          <b>{stop.price}</b>
          {candidate && rating !== null && <b className="wb-candidate-rating">★ {rating.toFixed(1)}</b>}
        </div>
        {!editable && !candidate && <p>{stop.note}</p>}
      </div>
      {expandable && <span className={`wb-stop-disclosure ${expanded ? 'open' : ''}`} aria-hidden="true">⌄</span>}
      {candidate && <span className="wb-stop-select-hint">{candidateSelected ? '收起' : '查看详情 ›'}</span>}
    </>
  );
  return (
    <article className={`wb-stop ${editable ? 'editable' : ''} ${candidateSelected ? 'candidate-selected' : ''} ${isDragging ? 'dragging' : ''}`} onPointerDown={onPointerDown}>
      <span className={`wb-number n${index + 1}`}>{index + 1}</span>
      {onSelect
        ? <button type="button" className="wb-stop-summary wb-stop-summary-button" aria-expanded={candidateSelected} aria-controls={`replacement-preview-${stop.id}`} onClick={onSelect}>{summary}</button>
        : expandable
        ? <button type="button" className="wb-stop-summary wb-stop-summary-button" aria-expanded={expanded} aria-controls={`place-detail-${stop.id}`} onClick={onToggle}>{summary}</button>
        : <div className="wb-stop-summary">{summary}</div>}
      {editable && (
        <div className="wb-stop-tools">
          <button type="button" onClick={onEdit} aria-label={`编辑${stop.name}`} title="编辑地点"><Icon name="edit" size={17} /></button>
          <button type="button" onClick={onDelete} aria-label={`删除${stop.name}`} title="删除地点"><Icon name="trash" size={17} /></button>
        </div>
      )}
    </article>
  );
}

function ReplacementCandidatePreview({ stop, onClose, onConfirm, hideActions = false }: { stop: Stop; onClose: () => void; onConfirm: () => void; hideActions?: boolean }) {
  const preview = buildReplacementPreview(stop);
  const [photoIndex, setPhotoIndex] = useState(0);
  const activePhoto = preview.photos[photoIndex];
  return (
    <section className="wb-candidate-preview" id={`replacement-preview-${stop.id}`} aria-label={`${stop.name}候选地点详情`}>
      <div className="wb-candidate-preview-gallery">
        {activePhoto
          ? <img src={activePhoto} alt={`${stop.name}实景图 ${photoIndex + 1}`} />
          : <div className="wb-candidate-preview-empty"><Icon name={stopTypeIcon(stop.type)} size={38} /><span>暂无实景图</span></div>}
        {preview.photos.length > 1 && (
          <>
            <button type="button" className="prev" aria-label="上一张候选地点图片" onClick={() => setPhotoIndex((current) => (current - 1 + preview.photos.length) % preview.photos.length)}>‹</button>
            <button type="button" className="next" aria-label="下一张候选地点图片" onClick={() => setPhotoIndex((current) => (current + 1) % preview.photos.length)}>›</button>
            <span className="wb-candidate-photo-count">{photoIndex + 1}/{preview.photos.length}</span>
          </>
        )}
      </div>
      <div className="wb-candidate-preview-body">
        <div className="wb-candidate-preview-title">
          <h3>{stop.name}</h3>
          {preview.facts.rating !== null && <b><Icon name="star" size={16} />{preview.facts.rating.toFixed(1)} <small>高德评分</small></b>}
        </div>
        <p>{preview.introduction}</p>
        <div className="wb-candidate-preview-facts">
          <span><Icon name="museum" size={17} />{preview.facts.type}</span>
          <span><Icon name="pin" size={17} />{preview.facts.district || '区域待确认'}</span>
          <span><Icon name="wallet" size={17} />{preview.facts.price}</span>
          {preview.facts.openTime && <span><Icon name="clock" size={17} />{preview.facts.openTime}</span>}
          {preview.facts.address && <span className="wide"><Icon name="navigate" size={17} />{preview.facts.address}</span>}
        </div>
        {preview.tags.length > 0 && <div className="wb-candidate-preview-tags">{preview.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
        {!hideActions && (
          <div className="wb-candidate-preview-actions">
            <button type="button" className="wb-secondary" onClick={onClose}>收起详情</button>
            <button type="button" className="wb-primary" onClick={onConfirm}>确认替换为{stop.name}</button>
          </div>
        )}
      </div>
    </section>
  );
}

type PlaceDetailTab = 'highlights' | 'reviews' | 'nearby';

function PlaceDetailPanel({ stop, stops, saved, onToggleFavorite, onReplace }: { stop: Stop; stops: Stop[]; saved: boolean; onToggleFavorite: () => void; onReplace: () => void }) {
  const [tab, setTab] = useState<PlaceDetailTab>('highlights');
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = getPlacePhotos(stop);
  const rating = getTrustedRating(stop);
  const highlights = buildPlaceHighlights(stop);
  const nearby = listNearbyStops(stops, stop.id);
  const photo = photos[photoIndex] || photos[0];

  return (
    <section className="wb-place-detail" id={`place-detail-${stop.id}`} aria-label={`${stop.name}地点详情`}>
      <div className="wb-place-gallery">
        {photo ? <img src={photo} alt={`${stop.name}实景图 ${photoIndex + 1}`} /> : <StopPhoto stop={stop} />}
        {photos.length > 1 && (
          <>
            <button type="button" className="prev" aria-label="上一张地点图片" onClick={() => setPhotoIndex((current) => (current - 1 + photos.length) % photos.length)}>‹</button>
            <button type="button" className="next" aria-label="下一张地点图片" onClick={() => setPhotoIndex((current) => (current + 1) % photos.length)}>›</button>
            <span>{photoIndex + 1}/{photos.length}</span>
          </>
        )}
      </div>
      <div className="wb-place-meta">
        {rating !== null && <b><Icon name="star" size={17} />{rating.toFixed(1)} <small>高德评分{stop.reviewCount ? ` · ${stop.reviewCount}条` : ''}</small></b>}
        {stop.openTime && <span><Icon name="clock" size={17} />{stop.openTime}</span>}
        {stop.price && <span><Icon name="wallet" size={17} />路线预算 {stop.price}</span>}
        {stop.address && <span className="wide"><Icon name="pin" size={17} />{stop.address}</span>}
      </div>
      <div className="wb-place-tabs" role="tablist" aria-label="地点信息">
        <button type="button" role="tab" aria-selected={tab === 'highlights'} onClick={() => setTab('highlights')}>亮点</button>
        <button type="button" role="tab" aria-selected={tab === 'reviews'} onClick={() => setTab('reviews')}>评论</button>
        <button type="button" role="tab" aria-selected={tab === 'nearby'} onClick={() => setTab('nearby')}>附近</button>
      </div>
      <div className="wb-place-tab-panel" role="tabpanel">
        {tab === 'highlights' && <ul>{highlights.map((item) => <li key={item}>{item}</li>)}</ul>}
        {tab === 'reviews' && <div className="wb-place-empty"><Icon name="comment" size={28} /><strong>还没有真实用户评论</strong><span>游玩后可以在社区分享你的体验。</span></div>}
        {tab === 'nearby' && (nearby.length
          ? <div className="wb-nearby-list">{nearby.map((item) => <div key={item.stop.id}><StopPhoto stop={item.stop} /><p><strong>{item.stop.name}</strong><span>{item.stop.type}{item.distanceKm !== undefined ? ` · ${item.distanceKm < 1 ? `${Math.round(item.distanceKm * 1000)}米` : `${item.distanceKm.toFixed(1)}公里`}` : ' · 同路线'}</span></p></div>)}</div>
          : <div className="wb-place-empty"><Icon name="pin" size={28} /><strong>附近暂无路线点</strong><span>可以在编辑路线中继续添加地点。</span></div>)}
      </div>
      <div className="wb-place-actions">
        <button type="button" className={saved ? 'saved' : ''} onClick={onToggleFavorite}><Icon name={saved ? 'check' : 'bookmark'} size={20} />{saved ? '已收藏' : '收藏地点'}</button>
        <button type="button" onClick={onReplace}><Icon name="edit" size={20} />替换当前站</button>
      </div>
    </section>
  );
}

function RouteList({
  stops,
  editable,
  draggingIndex,
  showTransfers = false,
  onEdit,
  onDelete,
  onLongPressStart,
  details = false,
  favoriteIds,
  onToggleFavorite,
  onReplace,
  onViewStop,
}: {
  stops: Stop[];
  editable?: boolean;
  draggingIndex?: number | null;
  showTransfers?: boolean;
  onEdit?: (index: number) => void;
  onDelete?: (index: number) => void;
  onLongPressStart?: (index: number, event: React.PointerEvent) => void;
  details?: boolean;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (stop: Stop) => void;
  onReplace?: (index: number) => void;
  onViewStop?: (stop: Stop) => void;
}) {
  const [expandedStopId, setExpandedStopId] = useState<string | null>(null);
  return (
    <div className="wb-route-list">
      {stops.map((stop, index) => (
        <div className="wb-route-row" data-route-index={index} key={stop.id}>
          <RouteStop
            stop={stop}
            index={index}
            editable={editable}
            expandable={details}
            expanded={expandedStopId === stop.id}
            isDragging={draggingIndex === index}
            onEdit={() => onEdit?.(index)}
            onDelete={() => onDelete?.(index)}
            onToggle={() => setExpandedStopId((current) => {
              const next = current === stop.id ? null : stop.id;
              if (next === stop.id) onViewStop?.(stop);
              return next;
            })}
            onPointerDown={editable ? (event) => onLongPressStart?.(index, event) : undefined}
          />
          {details && expandedStopId === stop.id && (
            <PlaceDetailPanel
              stop={stop}
              stops={stops}
              saved={favoriteIds?.has(stop.id) ?? false}
              onToggleFavorite={() => onToggleFavorite?.(stop)}
              onReplace={() => onReplace?.(index)}
            />
          )}
          {showTransfers && index < stops.length - 1 && <div className="wb-transfer">步行时间以高德导航为准</div>}
        </div>
      ))}
    </div>
  );
}

function HomeScreen({ go, openFavoritePlaces, openHistoryRoutes, userLocation, setUserLocation }: { go: (s: Screen) => void; openFavoritePlaces: (backTo: Screen) => void; openHistoryRoutes: (backTo: Screen) => void; userLocation: UserLocation; setUserLocation: (location: UserLocation) => void }) {
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [readySceneIds, setReadySceneIds] = useState<Set<string>>(() => new Set([HOME_CAROUSEL_SCENES[0].id]));
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibilityState, setVisibilityState] = useState<DocumentVisibilityState>(() => document.visibilityState);
  const [interactionVersion, setInteractionVersion] = useState(0);
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualProvince, setManualProvince] = useState(userLocation.province || EMPTY_MANUAL_LOCATION.province);
  const [manualCity, setManualCity] = useState(userLocation.city || EMPTY_MANUAL_LOCATION.city);
  const [manualDistrict, setManualDistrict] = useState(userLocation.district || EMPTY_MANUAL_LOCATION.district);
  const [cityOptions, setCityOptions] = useState<string[]>([]);
  const [districtOptions, setDistrictOptions] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [administrativeError, setAdministrativeError] = useState('');
  const autoLocationRequested = useRef(false);
  const applyManualLocation = () => {
    const next = resolveManualLocation(manualProvince, manualCity, manualDistrict);
    if (!next) return;
    setUserLocation(next);
    setShowManualLocation(false);
  };
  const toggleManualLocation = () => {
    if (!showManualLocation) {
      setManualProvince(userLocation.province || '');
      setManualCity(userLocation.city || '');
      setManualDistrict(userLocation.district || '');
    }
    setShowManualLocation((value) => !value);
  };
  const locate = () => {
    const locating = { ...EMPTY_LOCATION };
    setUserLocation(locating);
    if (!navigator.geolocation) {
      const unavailable = { ...EMPTY_LOCATION, status: 'unavailable' as const };
      setUserLocation(unavailable);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinatesOnly: UserLocation = { province: '', city: '', district: '', label: '', lat: latitude, lng: longitude, status: 'coordinates-only' };
        setUserLocation(coordinatesOnly);
        try {
          const res = await fetch('/api/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lng: longitude, lat: latitude }),
          });
          if (!res.ok) throw new Error('reverse geocode failed');
          const data = await res.json() as Partial<UserLocation>;
          if (!data.label && !data.city && !data.district) return;
          const next: UserLocation = {
            province: data.province || '',
            city: data.city || '',
            district: data.district || '',
            label: data.label || formatAdministrativeLabel(data.province || '', data.city || '', data.district || ''),
            lat: latitude,
            lng: longitude,
            status: 'resolved',
          };
          setUserLocation(next);
        } catch {
          setUserLocation(coordinatesOnly);
        }
      },
      (error) => {
        const failed = { ...EMPTY_LOCATION, status: error.code === error.PERMISSION_DENIED ? 'denied' as const : 'error' as const };
        setUserLocation(failed);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };
  useEffect(() => {
    if (autoLocationRequested.current || !shouldAutoLocate(userLocation)) return;
    autoLocationRequested.current = true;
    locate();
    // Auto-locate only while there is no settled parent location.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLocation.status]);

  useEffect(() => {
    if (!showManualLocation || !manualProvince) {
      setCityOptions([]);
      setLoadingCities(false);
      return;
    }
    let active = true;
    setLoadingCities(true);
    setAdministrativeError('');
    requestAdministrativeOptions(fetch, manualProvince, 'cities')
      .then((options) => {
        if (!active) return;
        setCityOptions(options);
        if (options.length === 1 && options[0] === manualProvince && !manualCity) setManualCity(options[0]);
      })
      .catch((error) => {
        if (!active) return;
        setCityOptions([]);
        setAdministrativeError(error instanceof Error ? error.message : '城市列表加载失败');
      })
      .finally(() => { if (active) setLoadingCities(false); });
    return () => { active = false; };
  }, [showManualLocation, manualProvince]);

  useEffect(() => {
    if (!showManualLocation || !manualCity) {
      setDistrictOptions([]);
      setLoadingDistricts(false);
      return;
    }
    let active = true;
    setLoadingDistricts(true);
    setAdministrativeError('');
    requestAdministrativeOptions(fetch, manualCity, 'districts')
      .then((options) => { if (active) setDistrictOptions(options); })
      .catch((error) => {
        if (!active) return;
        setDistrictOptions([]);
        setAdministrativeError(error instanceof Error ? error.message : '区县列表加载失败');
      })
      .finally(() => { if (active) setLoadingDistricts(false); });
    return () => { active = false; };
  }, [showManualLocation, manualCity]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(media.matches);
    updateMotionPreference();
    media.addEventListener('change', updateMotionPreference);
    return () => media.removeEventListener('change', updateMotionPreference);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setVisibilityState(document.visibilityState);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  const prepareScene = (index: number, activate = false) => {
    const scene = HOME_CAROUSEL_SCENES[index];
    const markReady = () => {
      setReadySceneIds((current) => new Set(current).add(scene.id));
      if (activate) setActiveSceneIndex(index);
    };
    if (readySceneIds.has(scene.id)) {
      if (activate) setActiveSceneIndex(index);
      return;
    }
    const image = new Image();
    image.src = scene.src;
    if (image.complete) markReady();
    else image.addEventListener('load', markReady, { once: true });
  };

  useEffect(() => {
    if (reducedMotion) return;
    const nextIndex = nextHomeSceneIndex(activeSceneIndex, HOME_CAROUSEL_SCENES.length);
    const preloadTimer = window.setTimeout(() => prepareScene(nextIndex), 800);
    return () => window.clearTimeout(preloadTimer);
    // The active index is the only trigger; ready-scene updates must not restart preloading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSceneIndex, reducedMotion]);

  useEffect(() => {
    if (!shouldAutoplayHomeCarousel(reducedMotion, visibilityState)) return;
    const timer = window.setTimeout(() => {
      prepareScene(nextHomeSceneIndex(activeSceneIndex, HOME_CAROUSEL_SCENES.length), true);
    }, HOME_CAROUSEL_INTERVAL_MS);
    return () => window.clearTimeout(timer);
    // Manual interaction restarts the interval without coupling it to preload state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSceneIndex, interactionVersion, reducedMotion, visibilityState]);

  const showScene = (index: number) => {
    setInteractionVersion((current) => current + 1);
    prepareScene(index, true);
  };

  const openShortcut = (id: typeof HOME_SHORTCUTS[number]['id']) => {
    if (id === 'favoriteCustom') openFavoritePlaces('home');
    else if (id === 'recentRoutes') openHistoryRoutes('home');
    else go(HOME_SHORTCUT_DESTINATIONS[id]);
  };

  return (
    <div className="wb-page wb-home">
      <div className="wb-location"><Icon name="pin" size={23} /> {locationLabel(userLocation)} <button type="button" onClick={locate} disabled={userLocation.status === 'locating'} aria-label="重新定位"><Icon name="navigate" size={25} /></button></div>
      {userLocation.status !== 'locating' && (
        <button type="button" className="wb-manual-location-trigger" onClick={toggleManualLocation}>
          <Icon name="pin" size={16} />
          <span>{userLocation.status === 'resolved' || userLocation.status === 'manual' ? '修改省市区' : '手动选择省市区'}</span>
          <b>›</b>
        </button>
      )}
      {showManualLocation && (
        <section className="wb-manual-location-panel">
          <strong>手动选择出发位置</strong>
          <div>
            <select
              value={manualProvince}
              onChange={(event) => {
                setManualProvince(event.target.value);
                setManualCity('');
                setManualDistrict('');
                setCityOptions([]);
                setDistrictOptions([]);
              }}
              aria-label="选择省份"
            >
              <option value="">选择省/自治区</option>
              {MANUAL_PROVINCE_SUGGESTIONS.map((province) => <option key={province} value={province}>{province}</option>)}
            </select>
            <select
              value={manualCity}
              onChange={(event) => {
                setManualCity(event.target.value);
                setManualDistrict('');
                setDistrictOptions([]);
              }}
              disabled={!manualProvince || loadingCities}
              aria-label="选择城市"
            >
              <option value="">{loadingCities ? '正在加载城市…' : '选择城市（必填）'}</option>
              {manualCity && !cityOptions.includes(manualCity) && <option value={manualCity}>{manualCity}</option>}
              {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
            </select>
            <select
              value={manualDistrict}
              onChange={(event) => setManualDistrict(event.target.value)}
              disabled={!manualCity || loadingDistricts}
              aria-label="选择区县"
            >
              <option value="">{loadingDistricts ? '正在加载区县…' : '全市/不限区县'}</option>
              {manualDistrict && !districtOptions.includes(manualDistrict) && <option value={manualDistrict}>{manualDistrict}</option>}
              {districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
          </div>
          {administrativeError && <p className="wb-manual-location-error">{administrativeError}，请重新选择上一级。</p>}
          <button type="button" className="wb-primary" onClick={applyManualLocation} disabled={!manualCity.trim()}>使用这个位置</button>
        </section>
      )}
      <header className="wb-home-brand">
        <h1>WeekendBuddy</h1>
      </header>
      <div className="wb-home-hero" role="region" aria-label="周末灵感插画">
        {HOME_CAROUSEL_SCENES.map((scene, index) => (readySceneIds.has(scene.id) || index === 0) && (
          <img
            key={scene.id}
            className={index === activeSceneIndex ? 'active' : ''}
            src={scene.src}
            alt={index === activeSceneIndex ? scene.alt : ''}
            loading={index === 0 ? 'eager' : 'lazy'}
            aria-hidden={index === activeSceneIndex ? undefined : 'true'}
            onLoad={() => setReadySceneIds((current) => new Set(current).add(scene.id))}
          />
        ))}
        <div className="wb-home-scene-copy">
          <h2>Hi，周末搭子</h2>
        </div>
        <div className="wb-home-scene-dots" aria-label="切换周末灵感插画">
          {HOME_CAROUSEL_SCENES.map((scene, index) => (
            <button
              type="button"
              key={scene.id}
              className={index === activeSceneIndex ? 'active' : ''}
              aria-label={`查看第${index + 1}幅周末场景`}
              aria-current={index === activeSceneIndex ? 'true' : undefined}
              onClick={() => showScene(index)}
            />
          ))}
        </div>
      </div>
      <button className="wb-home-cta" onClick={() => go(HOME_SHORTCUT_DESTINATIONS.blindBox)}><Icon name="lemon" size={31} /><span><strong>开启周末盲盒</strong><small>点选偏好，或用一句话告诉我</small></span><b>›</b></button>
      <div className="wb-home-shortcuts">
        {HOME_SHORTCUTS.map((shortcut) => (
          <button type="button" key={shortcut.id} className={`wb-home-shortcut ${shortcut.id}`} onClick={() => openShortcut(shortcut.id)}>
            <i><Icon name={shortcut.icon} size={27} /></i>
            <span>{shortcut.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RouteGalleryCard({ route, onClick }: { route: SavedRoute; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={routeCollectionCardClass()}>
      <span className="wb-recent-gallery-photo"><img src={route.image} alt="" /></span>
      <span className="wb-recent-gallery-copy">
        <strong>{route.title}</strong>
        <small>{typeof route.rating === 'number' && <><b>★ {route.rating}</b><i>·</i></>}{route.duration}</small>
        <span className="wb-recent-gallery-tags">{route.tags.map((tag) => <em key={tag}>{tag}</em>)}</span>
      </span>
      <b>›</b>
    </button>
  );
}

function EmptyRouteCard({ title, description, action, onAction }: { title: string; description: string; action: string; onAction: () => void }) {
  return (
    <section className="wb-empty-route-card" aria-label={title}>
      <Icon name="route-nodes" size={42} />
      <strong>{title}</strong>
      <small>{description}</small>
      <button type="button" className="wb-secondary wb-action-with-icon" onClick={onAction}><Icon name="plus" size={18} />{action}</button>
    </section>
  );
}

function RecentRoutesScreen({ go, openSavedRoute }: { go: (s: Screen) => void; openSavedRoute: (routeId: string, backTo: Screen) => void }) {
  return (
    <div className="wb-page wb-recent-page wb-route-collection-page">
      <Header title="热门路线" back="返回首页" onBack={() => go('home')} />
      <p className="wb-recent-intro">精选适合周末直接出发的路线，点开就能看完整行程。</p>
      <div className="wb-recent-gallery">
        {POPULAR_ROUTES.map((route) => <RouteGalleryCard key={route.id} route={route} onClick={() => openSavedRoute(route.id, 'recent')} />)}
      </div>
    </div>
  );
}

function RouteEntryScreen({ go, openFavoritePlaces }: { go: (s: Screen) => void; openFavoritePlaces: (backTo: Screen) => void }) {
  return (
    <div className="wb-page wb-route-entry-page">
      <Header title="选择路线方式" back="返回首页" onBack={() => go('home')} />
      <header className="wb-route-entry-intro">
        <span>周末路线</span>
        <h2>今天想怎么出发？</h2>
        <p>交给 WeekendBuddy 随机发现，或者从收藏地点开始定制。</p>
      </header>
      <div className="wb-route-entry-options">
        <button type="button" className="wb-route-entry-option random" onClick={() => go(routeEntryTarget('random'))}>
          <span className="wb-route-entry-icon"><Icon name="lemon" size={36} /></span>
          <span><strong>随机选择</strong><small>点选条件或用一句话描述，生成一条惊喜路线</small></span>
          <b>›</b>
        </button>
        <button type="button" className="wb-route-entry-option custom" onClick={() => openFavoritePlaces('route-entry')}>
          <span className="wb-route-entry-icon"><Icon name="route-nodes" size={36} /></span>
          <span><strong>定制路线</strong><small>从收藏地点里挑选，组合成自己的周末路线</small></span>
          <b>›</b>
        </button>
      </div>
    </div>
  );
}

function ConditionsScreen({ go, onGenerate, userLocation, generationError }: { go: (s: Screen) => void; onGenerate: (input: GenerationInput) => void; userLocation: UserLocation; generationError?: string }) {
  const [mode, setMode] = useState<'selection' | 'natural'>('selection');
  const [people, setPeople] = useState('2人');
  const [hours, setHours] = useState('4');
  const [budget, setBudget] = useState('200');
  const [district, setDistrict] = useState(userLocation.district);
  const [cross, setCross] = useState(true);
  const [note, setNote] = useState('');
  const [naturalText, setNaturalText] = useState('');
  const [validationError, setValidationError] = useState('');
  const examples = ['周六下午两个人，想看海吃小吃，预算每人200元', '带父母轻松逛半天，少走路，有地方喝茶', '一个人拍照散步，想看展，晚上吃点本地特色'];
  useEffect(() => {
    setDistrict(userLocation.district);
  }, [userLocation.district]);
  const submit = () => {
    const input: GenerationInput = mode === 'natural'
      ? { mode: 'natural', text: naturalText, location: userLocation }
      : { mode: 'selection', form: { people, hours, budget, district, cross, note }, location: userLocation };
    const error = validateGenerationInput(input);
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError('');
    onGenerate(input);
  };
  return (
    <div className="wb-page wb-conditions-page">
      <Header title="生成路线" back="返回" action={mode === 'selection' ? '清空' : ''} onBack={() => go('route-entry')} onAction={() => { setNote(''); }} />
      <div className="wb-mode-tabs" role="tablist" aria-label="路线生成方式">
        <button type="button" role="tab" aria-selected={mode === 'selection'} className={mode === 'selection' ? 'active' : ''} onClick={() => { setMode('selection'); setValidationError(''); }}>点选条件</button>
        <button type="button" role="tab" aria-selected={mode === 'natural'} className={mode === 'natural' ? 'active' : ''} onClick={() => { setMode('natural'); setValidationError(''); }}>一句话描述</button>
      </div>
      {mode === 'selection' ? (
        <>
          <section className="wb-form-card">
            <label><span><Icon name="people" size={27} /></span>几个人出发<select value={people} onChange={(e) => setPeople(e.target.value)}><option>1人</option><option>2人</option><option>3–4人</option></select></label>
            <label><span><Icon name="clock" size={27} /></span>想玩多久<div className="wb-input-with-unit"><input type="number" min="0.5" max="12" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="如 2.5" /><span>小时</span></div></label>
            <label><span><Icon name="wallet" size={27} /></span>人均预算<div className="wb-input-with-unit"><input type="number" min="0" max="5000" step="50" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="如 200" /><span>元/人</span></div></label>
            <label><span><Icon name="pin" size={27} /></span>从哪里出发<select value={district} onChange={(e) => setDistrict(e.target.value)}><option value={userLocation.district || ''}>{userLocation.district || '当前坐标附近'}</option>{userLocation.city.includes('深圳') && ['南山区', '福田区', '罗湖区', '龙岗区'].filter((item) => item !== userLocation.district).map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="wb-toggle-row"><span><Icon name="leaf" size={27} /></span>接受跨区<button type="button" className={`wb-toggle ${cross ? 'on' : ''}`} onClick={() => setCross(!cross)}><i /></button></label>
          </section>
          <section className="wb-field-section">
            <h3>还有什么特别想法？</h3>
            <div className="wb-textarea"><textarea maxLength={60} value={note} onChange={(e) => setNote(e.target.value)} placeholder="例如：想看海、找咖啡馆、带父母出行…" /><span>{note.length}/60</span></div>
          </section>
        </>
      ) : (
        <section className="wb-natural-entry">
          <div className="wb-natural-heading"><Icon name="lemon" size={34} /><div><h2>告诉我你想怎么过</h2><p>时间、同行人、预算和想做的事，都可以自然地说。</p></div></div>
          <label className={validationError ? 'has-error' : ''}>
            <textarea value={naturalText} maxLength={160} autoFocus onChange={(event) => { setNaturalText(event.target.value); setValidationError(''); }} placeholder="例如：周六下午两个人，想看海吃小吃，预算每人200元" />
            <span>{naturalText.length}/160</span>
          </label>
          {(validationError || generationError) && <p className="wb-input-error" role="alert">{validationError || generationError}</p>}
          <div className="wb-natural-examples"><strong>试试这样说</strong>{examples.map((example) => <button type="button" key={example} onClick={() => { setNaturalText(example); setValidationError(''); }}>{example}</button>)}</div>
        </section>
      )}
      {mode === 'selection' && generationError && <p className="wb-input-error" role="alert">{generationError}</p>}
      <button className="wb-primary wb-bottom-cta wb-action-with-icon" onClick={submit}><Icon name="lemon" size={28} />生成我的路线 <b>›</b></button>
    </div>
  );
}

function GeneratingScreen({ cancel }: { cancel: () => void }) {
  return (
    <div className="wb-page wb-generating">
      <Header title="生成中" back="返回设置" action="取消" onBack={cancel} onAction={cancel} />
      <h2>正在为你规划路线…<i>⌁</i></h2><p>大约还要几秒 ♡</p>
      <img src="/assets/handdrawn/route-map-transparent.png" alt="路线地图" />
      <div className="wb-progress-card">
        <div><span><Icon name="search" size={31} /></span><p><strong>正在理解你的偏好</strong><small>分析偏好与时间预算</small></p><Icon name="check" size={25} /></div>
        <div><span><Icon name="pin" size={31} /></span><p><strong>正在搜索真实地点</strong><small>在高德地图中查找优质地点</small></p><i className="wb-spinner" /></div>
        <div><span><Icon name="route-nodes" size={31} /></span><p><strong>正在组合顺路路线</strong><small>按照顺序智能排序</small></p><i className="wb-spinner pale" /></div>
      </div>
      <div className="wb-source">数据来源　<span>➤</span> 高德实时搜点</div>
    </div>
  );
}

function ResultScreen({ stops, plan, generationInput, go, openRouteDetail, openEdit, favoriteIds, onToggleFavorite, onReplace }: { stops: Stop[]; plan: Plan | null; generationInput: GenerationInput | null; go: (s: Screen) => void; openRouteDetail: (backTo: Screen) => void; openEdit: (backTo: Screen) => void; favoriteIds: Set<string>; onToggleFavorite: (stop: Stop) => void; onReplace: (index: number) => void }) {
  const presentation = buildResultPresentation(plan, generationInput, stops.length);
  const totalMinutes = plan?.route.totalMinutes || stops.reduce((sum, stop) => sum + stop.stay, 0);
  const totalBudget = plan?.route.totalBudget;
  const reviewSession = useRef(createRouteReviewSession(stops.map((stop) => stop.id)));
  const markInteraction = () => {
    reviewSession.current = recordRouteInteraction(reviewSession.current);
  };
  const viewStop = (stop: Stop) => {
    const result = recordPoiView(reviewSession.current, stop.id);
    reviewSession.current = result.session;
    if (result.shouldTrack) trackPoiViewed(stop.name, stop.type || '', presentation.title || '路线', { poiTags: stop.tags, district: stop.district });
  };
  const leaveResult = () => {
    const session = reviewSession.current;
    if (shouldTrackRouteAbandoned(session)) {
      trackRouteAbandoned(session.routeId, Date.now() - session.startedAt);
    }
    go('conditions');
  };
  const confirmRoute = () => {
    reviewSession.current = confirmRouteReview(reviewSession.current);
    if (plan) trackRouteConfirmed(plan);
    openRouteDetail('result');
  };
  return (
    <div className="wb-page">
      <Header title="路线结果" back="重新设置" action="↥　•••" onBack={leaveResult} />
      <section className="wb-route-title">
        <i className="wb-tape" />
        <h2>{presentation.title}</h2>
        <p>{stops.length}个地点 · 约{Math.max(1, Math.round(totalMinutes / 60))}小时{typeof totalBudget === 'number' && totalBudget > 0 ? ` · 约¥${totalBudget}/人` : ''}</p>
        {presentation.quote && <blockquote className="wb-user-quote"><b>你说</b>“{presentation.quote}”</blockquote>}
        <div className="wb-result-story">{presentation.story}</div>
        {presentation.tags.length > 0 && <div className="wb-result-tags">{presentation.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
      </section>
      <RouteList
        stops={stops}
        details
        favoriteIds={favoriteIds}
        onViewStop={viewStop}
        onToggleFavorite={(stop) => { markInteraction(); onToggleFavorite(stop); }}
        onReplace={(index) => { markInteraction(); onReplace(index); }}
      />
      <div className="wb-dual-actions">
        <button className="wb-secondary wb-action-with-icon wb-route-cta" onClick={() => { markInteraction(); openEdit('result'); }}><Icon name="edit" size={24} />调整路线</button>
        <button className="wb-primary wb-action-with-icon wb-route-cta" onClick={confirmRoute}><Icon name="check" size={24} />确认行程</button>
      </div>
    </div>
  );
}

function EditScreen({ stops, setStops, go, backTo, userLocation, onReplace, onSave }: { stops: Stop[]; setStops: React.Dispatch<React.SetStateAction<Stop[]>>; go: (s: Screen) => void; backTo: Screen; userLocation: UserLocation; onReplace: (index: number) => void; onSave: () => void }) {
  const longPressTimer = useRef<number | null>(null);
  const draggingIndexRef = useRef<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [addingType, setAddingType] = useState<string | null>(null);
  const [addMessage, setAddMessage] = useState('');
  const [addPanelOpen, setAddPanelOpen] = useState(false);
  const [selectedAddType, setSelectedAddType] = useState('文化体验');
  const [addPrompt, setAddPrompt] = useState('');
  const backLabel = collectionBackLabel(backTo);
  useEffect(() => {
    setStops((items) => resequenceStops(items));
  }, [setStops]);
  const moveStop = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0) return;
    setStops((items) => {
      if (!items[from] || !items[to]) return items;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return resequenceStops(next);
    });
    draggingIndexRef.current = to;
    setDraggingIndex(to);
  };
  const endDrag = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    draggingIndexRef.current = null;
    setDraggingIndex(null);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', endDrag);
    window.removeEventListener('pointercancel', endDrag);
  };
  const cancelPendingLongPress = () => {
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    window.removeEventListener('pointerup', cancelPendingLongPress);
    window.removeEventListener('pointercancel', cancelPendingLongPress);
  };
  const handlePointerMove = (event: PointerEvent) => {
    const from = draggingIndexRef.current;
    if (from === null) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-route-index]');
    const to = Number(target?.dataset.routeIndex);
    if (Number.isFinite(to)) moveStop(from, to);
  };
  const startLongPress = (index: number, event: React.PointerEvent) => {
    if ((event.target as HTMLElement).closest('.wb-stop-tools')) return;
    if (longPressTimer.current) window.clearTimeout(longPressTimer.current);
    window.addEventListener('pointerup', cancelPendingLongPress, { once: true });
    window.addEventListener('pointercancel', cancelPendingLongPress, { once: true });
    longPressTimer.current = window.setTimeout(() => {
      window.removeEventListener('pointerup', cancelPendingLongPress);
      window.removeEventListener('pointercancel', cancelPendingLongPress);
      draggingIndexRef.current = index;
      setDraggingIndex(index);
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', endDrag, { once: true });
      window.addEventListener('pointercancel', endDrag, { once: true });
    }, 320);
  };
  const addStop = async () => {
    if (addingType) return;
    const type = selectedAddType;
    setAddingType(type);
    setAddMessage(`正在用高德实时搜索「${type}」...`);
    try {
      const poi = await requestPlaceFinder<Poi>(fetch, buildPlaceFinderPayload(type, addPrompt, userLocation, buildRoutePayload(stops)));
      const nextStop = normalizePoi({ order: stops.length + 1, role: 'ending', poi, note: poi.reason }, stops.length);
      setStops((items) => integrateAddedStop(items, nextStop));
      setAddMessage(`已加入「${poi.name}」，并重新安排了路线时间。`);
      setAddPrompt('');
      setAddPanelOpen(false);
    } catch (error) {
      setAddMessage(error instanceof Error ? `补点失败：${error.message}` : '补点失败，请稍后再试');
    } finally {
      setAddingType(null);
    }
  };
  return (
    <div className="wb-page wb-edit-page">
      <Header title="编辑路线" back={backLabel} action="保存" onBack={() => go(backTo)} onAction={onSave} />
      <p className="wb-edit-hint">长按卡片调整顺序，时间会自动重排。</p>
      <RouteList stops={stops} editable draggingIndex={draggingIndex} onLongPressStart={startLongPress} onEdit={onReplace} onDelete={(i) => setStops((x) => resequenceStops(x.filter((_, n) => n !== i)))} />
      <button type="button" className="wb-add-row" aria-expanded={addPanelOpen} disabled={Boolean(addingType)} onClick={() => { setAddPanelOpen((open) => !open); setAddMessage(''); }}>
        <span>{addPanelOpen ? '−' : '＋'}</span><b>{addingType ? '正在查找地点' : '新增地点'}</b><small>{addPanelOpen ? '收起' : '选类型和偏好'}</small>
      </button>
      {addMessage && <p className="wb-add-message wb-add-feedback">{addMessage}</p>}
      {addPanelOpen && (
        <PlaceFinderFields
          title="想加什么？"
          hint="会优先选择顺路地点"
          selectedType={selectedAddType}
          prompt={addPrompt}
          busy={Boolean(addingType)}
          actionLabel={`添加${selectedAddType}到路线`}
          busyLabel="正在查找合适地点..."
          onTypeChange={(type) => { setSelectedAddType(type); setAddMessage(''); }}
          onPromptChange={setAddPrompt}
          onSubmit={addStop}
        />
      )}
    </div>
  );
}

function ItineraryScreen({ stops, plan, generationInput, savedRoute, go, backTo, openEdit, favoriteIds, onToggleFavorite, onReplace }: { stops: Stop[]; plan: Plan | null; generationInput: GenerationInput | null; savedRoute: SavedRoute | null; go: (s: Screen) => void; backTo: Screen; openEdit: (backTo: Screen) => void; favoriteIds: Set<string>; onToggleFavorite: (stop: Stop) => void; onReplace: (index: number) => void }) {
  const presentation = buildResultPresentation(plan, generationInput, stops.length);
  const totalMinutes = plan?.route.totalMinutes || stops.reduce((sum, stop) => sum + stop.stay, 0);
  const totalBudget = plan?.route.totalBudget;
  const backLabel = backTo === 'custom-route-detail'
    ? '返回路线详情'
    : backTo === 'favorite-places'
      ? '返回收藏地点'
      : backTo === 'post'
        ? '返回帖子'
        : '返回结果';
  return (
    <div className="wb-page">
      <Header title="今天的行程" back={backLabel} action="编辑" onBack={() => go(backTo)} onAction={() => openEdit(backTo)} />
      <div className="wb-itinerary-head"><span>已确认</span><strong>{savedRoute?.title || presentation.title}</strong><small>{stops.length}个地点 · {savedRoute?.duration || `约${Math.max(1, Math.round(totalMinutes / 60))}小时`}{typeof totalBudget === 'number' && totalBudget > 0 ? ` · 约¥${totalBudget}/人` : ''}</small></div>
      <RouteList stops={stops} details favoriteIds={favoriteIds} onToggleFavorite={onToggleFavorite} onReplace={onReplace} />
      <div className="wb-dual-actions sticky-actions">
        <button className="wb-primary wb-action-with-icon" onClick={() => go('map')}><Icon name="navigate" size={24} />从我的位置开始</button>
        <button className="wb-secondary wb-action-with-icon" onClick={() => go('map')}><Icon name="route" size={24} />查看完整地图</button>
      </div>
    </div>
  );
}

type MapPoint = { name: string; lng: number; lat: number; index?: number; current?: boolean };
type TransportMode = 'walk' | 'ride' | 'drive' | 'transit';

const TRANSPORT_META: Record<TransportMode, { label: string; navMode: string; tone: string }> = {
  walk: { label: '步行', navMode: 'walk', tone: 'walk' },
  ride: { label: '骑行', navMode: 'bike', tone: 'ride' },
  drive: { label: '驾车', navMode: 'car', tone: 'drive' },
  transit: { label: '地铁/公交', navMode: 'bus', tone: 'transit' },
};

type AMapMap = {
  add: (overlay: unknown) => void;
  destroy: () => void;
  setFitView: (overlay?: unknown, immediately?: boolean, avoid?: [number, number, number, number]) => void;
};

type AMapApi = {
  Map: new (container: HTMLDivElement, options: Record<string, unknown>) => AMapMap;
  Polyline: new (options: Record<string, unknown>) => unknown;
  Marker: new (options: Record<string, unknown>) => unknown;
  Pixel: new (x: number, y: number) => unknown;
};

type RouteSegment = {
  fromIndex: number;
  toIndex: number;
  status: 'loading' | 'success' | 'failed';
  selectedMode: TransportMode;
  recommendedMode?: TransportMode;
  options: Partial<Record<TransportMode, {
    distanceMeters?: number;
    durationSeconds?: number;
    path?: [number, number][];
  }>>;
  distanceMeters?: number;
  durationSeconds?: number;
  path?: [number, number][];
};

function getAMap(): AMapApi | undefined {
  return (window as Window & { AMap?: AMapApi }).AMap;
}

function waitForAMap(timeoutMs = 10000): Promise<AMapApi> {
  return new Promise((resolve, reject) => {
    const available = getAMap();
    if (available) {
      resolve(available);
      return;
    }

    const start = Date.now();
    const timer = window.setInterval(() => {
      const AMap = getAMap();
      if (AMap) {
        window.clearInterval(timer);
        resolve(AMap);
      } else if (Date.now() - start > timeoutMs) {
        window.clearInterval(timer);
        reject(new Error('高德地图加载超时'));
      }
    }, 180);
  });
}

function locateCurrentPosition(): Promise<MapPoint> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('当前浏览器不支持定位'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          name: '我的位置',
          lng: position.coords.longitude,
          lat: position.coords.latitude,
          current: true,
        });
      },
      () => reject(new Error('定位未授权，已先展示路线站点')),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 },
    );
  });
}

function makeRouteMarker(point: MapPoint, total: number): string {
  const label = String((point.index ?? 0) + 1);
  const background = ['#f7cf42', '#a8c563', '#ef9f98', '#8bb9df', '#ffd66e'][(point.index ?? 0) % 5];
  const labelText = `${point.index! + 1}/${Math.max(total, 1)} ${point.name}`;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;font-family:Inter,Arial,sans-serif;">
      <div style="width:34px;height:34px;border-radius:50%;background:${background};color:#18212a;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:900;border:2px solid #283128;box-shadow:0 3px 9px rgba(43,48,39,.2);">${label}</div>
      <div style="margin-top:5px;max-width:132px;background:#fffefa;padding:4px 8px;border-radius:10px;color:#18212a;font-size:11px;font-weight:800;line-height:1.2;box-shadow:0 2px 8px rgba(45,40,30,.14);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${labelText}</div>
    </div>
  `;
}

function buildHanddrawnPath(points: MapPoint[]): [number, number][] {
  if (points.length < 2) return points.map((point) => [point.lng, point.lat]);
  return points.flatMap((point, index) => {
    const current: [number, number] = [point.lng, point.lat];
    const next = points[index + 1];
    if (!next) return [current];
    const offset = index % 2 === 0 ? 0.0014 : -0.0011;
    const mid: [number, number] = [
      (point.lng + next.lng) / 2 + offset,
      (point.lat + next.lat) / 2 - offset * 0.72,
    ];
    return [current, mid];
  });
}

function toLngLatTuple(value: unknown): [number, number] | null {
  if (Array.isArray(value) && value.length >= 2) {
    const lng = Number(value[0]);
    const lat = Number(value[1]);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }
  if (value && typeof value === 'object') {
    const item = value as { lng?: unknown; lat?: unknown; getLng?: () => number; getLat?: () => number };
    const lng = typeof item.getLng === 'function' ? item.getLng() : Number(item.lng);
    const lat = typeof item.getLat === 'function' ? item.getLat() : Number(item.lat);
    return Number.isFinite(lng) && Number.isFinite(lat) ? [lng, lat] : null;
  }
  return null;
}

async function fetchTransportOptions(from: MapPoint, to: MapPoint, city: string): Promise<Pick<RouteSegment, 'recommendedMode' | 'selectedMode' | 'options'> | null> {
  const response = await fetch('/api/transport-options', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildTransportRequestBody(from, to, city)),
  });
  if (!response.ok) return null;
  const data = await response.json() as {
    recommendedMode?: TransportMode;
    options?: Partial<Record<TransportMode, { distanceMeters?: number; durationSeconds?: number; path?: unknown[] }>>;
  };
  const options = Object.fromEntries(
    (Object.entries(data.options || {}) as Array<[TransportMode, { distanceMeters?: number; durationSeconds?: number; path?: unknown[] }]>)
      .map(([mode, option]) => {
        const path = option.path?.map(toLngLatTuple).filter((point): point is [number, number] => Boolean(point));
        return [mode, { ...option, path: path && path.length > 1 ? path : undefined }];
      }),
  ) as RouteSegment['options'];
  const recommendedMode = data.recommendedMode && options[data.recommendedMode] ? data.recommendedMode : (options.drive ? 'drive' : options.transit ? 'transit' : options.ride ? 'ride' : 'walk');
  return {
    options,
    recommendedMode,
    selectedMode: recommendedMode,
  };
}

function buildMapRoutePath(points: MapPoint[], segments: RouteSegment[]): [number, number][] {
  if (segments.length === points.length - 1 && segments.every((segment) => segment.options[segment.selectedMode]?.path?.length)) {
    return segments.flatMap((segment, index) => {
      const path = segment.options[segment.selectedMode]?.path || [];
      return index === 0 ? path : path.slice(1);
    });
  }
  return buildHanddrawnPath(points);
}

function formatMeters(value?: number) {
  if (!value) return '';
  return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}公里` : `${Math.round(value)}米`;
}

function formatSeconds(value?: number) {
  if (!value) return '';
  const minutes = Math.max(1, Math.round(value / 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)}小时${minutes % 60 ? `${minutes % 60}分钟` : ''}` : `${minutes}分钟`;
}

function openAmapNavigation(stop?: Stop) {
  if (!stop?.lng || !stop.lat) return;
  const url = `https://uri.amap.com/navigation?to=${stop.lng},${stop.lat},${encodeURIComponent(stop.name)}&mode=walk&policy=1&coordinate=gaode&callnative=1`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function openAmapLegNavigation(from?: Stop, to?: Stop, mode: TransportMode = 'walk') {
  if (!from?.lng || !from.lat || !to?.lng || !to.lat) return;
  const url = `https://uri.amap.com/navigation?from=${from.lng},${from.lat},${encodeURIComponent(from.name)}&to=${to.lng},${to.lat},${encodeURIComponent(to.name)}&mode=${TRANSPORT_META[mode].navMode}&policy=1&coordinate=gaode&callnative=1`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function TransportSketchIcon({ mode }: { mode: TransportMode }) {
  return <img src={`/assets/icons/transport-${mode}.svg`} alt="" />;
}

function getSegmentOption(segment?: RouteSegment) {
  return segment?.options[segment.selectedMode];
}

function SegmentTransfer({
  segment,
  from,
  to,
  expanded,
  onToggle,
  onModeChange,
}: {
  segment?: RouteSegment;
  from: Stop;
  to: Stop;
  expanded: boolean;
  onToggle: () => void;
  onModeChange: (mode: TransportMode) => void;
}) {
  const selectedMode = segment?.selectedMode || 'drive';
  const selectedOption = getSegmentOption(segment);
  const distance = formatMeters(selectedOption?.distanceMeters);
  const duration = formatSeconds(selectedOption?.durationSeconds);
  const detail = segment?.status === 'success' && distance && duration
    ? `${distance} · ${duration}`
    : segment?.status === 'failed'
      ? '点击打开高德'
      : '高德交通数据计算中';
  return (
    <div className={`wb-nav-leg ${expanded ? 'expanded' : ''} ${TRANSPORT_META[selectedMode].tone}`}>
      <button type="button" className="wb-nav-leg-main" onClick={onToggle}>
        <span className="wb-transport-icon"><TransportSketchIcon mode={selectedMode} /></span>
        <span className="wb-nav-mode">{TRANSPORT_META[selectedMode].label}</span>
        <strong>{detail}</strong>
        <b
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            openAmapLegNavigation(from, to, selectedMode);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            event.stopPropagation();
            openAmapLegNavigation(from, to, selectedMode);
          }}
        >一键导航 ›</b>
      </button>
      {expanded && (
        <div className="wb-transport-options">
          {(Object.keys(TRANSPORT_META) as TransportMode[]).map((mode) => {
            const option = segment?.options[mode];
            const modeDetail = option ? `${formatMeters(option.distanceMeters)} · ${formatSeconds(option.durationSeconds)}` : '暂无数据';
            return (
              <button
                type="button"
                key={mode}
                className={`${mode} ${selectedMode === mode ? 'selected' : ''}`}
                disabled={!option}
                onClick={() => {
                  if (!option) return;
                  onModeChange(mode);
                }}
              >
                <span className="wb-transport-icon"><TransportSketchIcon mode={mode} /></span>
                <em>{TRANSPORT_META[mode].label}</em>
                <small>{modeDetail}</small>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MapRouteList({ stops, segments, expandedSegment, setExpandedSegment, setSegmentMode }: { stops: Stop[]; segments: RouteSegment[]; expandedSegment: number | null; setExpandedSegment: (index: number | null) => void; setSegmentMode: (index: number, mode: TransportMode) => void }) {
  return (
    <div className="wb-route-list wb-map-route-list">
      {stops.map((stop, index) => (
        <div className="wb-route-row" data-route-index={index} key={stop.id}>
          <RouteStop stop={stop} index={index} />
          {index < stops.length - 1 && (
            <SegmentTransfer
              segment={segments[index]}
              from={stop}
              to={stops[index + 1]}
              expanded={expandedSegment === index}
              onToggle={() => setExpandedSegment(expandedSegment === index ? null : index)}
              onModeChange={(mode) => setSegmentMode(index, mode)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function MapScreen({ stops, city, go }: { stops: Stop[]; city: string; go: (s: Screen) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<AMapMap | null>(null);
  const [status, setStatus] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [segments, setSegments] = useState<RouteSegment[]>([]);
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);

  const stopPoints = useMemo(
    () => stops
      .map((stop, index) => (
        Number.isFinite(stop.lng) && Number.isFinite(stop.lat)
          ? { name: stop.name, lng: stop.lng as number, lat: stop.lat as number, index }
          : null
      ))
      .filter((point): point is MapPoint => Boolean(point)),
    [stops],
  );

  useEffect(() => {
    let alive = true;
    waitForAMap()
      .then(() => { if (alive) setMapReady(true); })
      .catch((error: Error) => {
        if (!alive) return;
        setMapError(error.message);
        setStatus('高德地图暂时加载失败，请稍后重试');
      });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!mapReady || stopPoints.length < 2) {
      setSegments([]);
      return;
    }
    let alive = true;
    const loadingSegments = stopPoints.slice(0, -1).map((_, index) => ({
      fromIndex: index,
      toIndex: index + 1,
      selectedMode: 'drive' as TransportMode,
      options: {},
      status: 'loading' as const,
    }));
    setSegments(loadingSegments);

    Promise.all(stopPoints.slice(0, -1).map(async (from, index) => {
      const result = await fetchTransportOptions(from, stopPoints[index + 1], city);
      return {
        fromIndex: index,
        toIndex: index + 1,
        status: result ? 'success' as const : 'failed' as const,
        selectedMode: result?.selectedMode || 'drive',
        recommendedMode: result?.recommendedMode,
        options: result?.options || {},
        ...result,
      };
    }))
      .then((nextSegments) => {
        if (alive) setSegments(nextSegments);
      })
      .catch(() => {
        if (alive) setSegments(loadingSegments.map((segment) => ({ ...segment, status: 'failed' })));
      });

    return () => { alive = false; };
  }, [city, mapReady, stopPoints]);

  const setSegmentMode = (index: number, mode: TransportMode) => {
    setSegments((items) => items.map((segment, segmentIndex) => (
      segmentIndex === index ? { ...segment, selectedMode: mode } : segment
    )));
    setExpandedSegment(null);
  };

  useEffect(() => {
    if (!mapReady || !mapRef.current || stopPoints.length === 0) return;
    const AMap = getAMap();
    if (!AMap) return;

    mapInstance.current?.destroy();
    const center: [number, number] = [stopPoints[0].lng, stopPoints[0].lat];
    const routePath = buildMapRoutePath(stopPoints, segments);

    try {
      setMapError(null);
      const map = new AMap.Map(mapRef.current, {
        zoom: 13,
        center,
        resizeEnable: true,
      });
      mapInstance.current = map;

      const shadowLine = new AMap.Polyline({
        path: routePath,
        strokeColor: '#6f6a31',
        strokeWeight: 9,
        strokeStyle: 'solid',
        lineJoin: 'round',
      });
      map.add(shadowLine);

      const sketchLine = new AMap.Polyline({
        path: routePath,
        strokeColor: '#f0b000',
        strokeWeight: 6,
        strokeStyle: 'dashed',
        strokeDasharray: [14, 8],
        lineJoin: 'round',
        showDir: true,
        dirColor: '#506f3c',
        dirNum: 3,
      });
      map.add(sketchLine);

      stopPoints.forEach((point) => {
        const marker = new AMap.Marker({
          position: [point.lng, point.lat],
          content: makeRouteMarker(point, stopPoints.length),
          offset: new AMap.Pixel(-18, -58),
        });
        map.add(marker);
      });

      map.setFitView(undefined, false, [74, 44, 74, 44]);
    } catch (error) {
      setMapError(error instanceof Error ? error.message : '地图渲染失败');
    }

    return () => {
      mapInstance.current?.destroy();
      mapInstance.current = null;
    };
  }, [mapReady, segments, stopPoints]);

  const firstStop = stops.find((stop) => stop.lng && stop.lat);
  const lastStop = [...stops].reverse().find((stop) => stop.lng && stop.lat);
  const routeLine = firstStop && lastStop ? `${firstStop.name} → ${lastStop.name}` : `路线共 ${stops.length} 站`;

  return (
    <div className="wb-page wb-amap-page">
      <Header title="高德路线地图" back="返回行程" onBack={() => go('itinerary')} />
      <section className="wb-amap-card">
        <div className="wb-amap-topline">
          <strong>{routeLine}</strong>
          <span>真实高德地图</span>
        </div>
        <div ref={mapRef} className="wb-amap-canvas" />
        {!mapReady && !mapError && <div className="wb-map-status">地图加载中...</div>}
        {status && <div className="wb-map-status">{status}</div>}
        {mapError && <div className="wb-map-status error">{mapError}</div>}
        {stopPoints.length === 0 && <div className="wb-map-status error">当前路线缺少经纬度，无法生成真实地图。</div>}
      </section>
      <section className="wb-map-route-sheet">
        <div className="wb-section-title compact"><strong>路线顺序</strong><small>第 1 站到终点</small></div>
        <MapRouteList stops={stops} segments={segments} expandedSegment={expandedSegment} setExpandedSegment={setExpandedSegment} setSegmentMode={setSegmentMode} />
        <div className="wb-map-primary-actions">
          <button className="wb-primary wb-action-with-icon wb-route-cta" onClick={() => openAmapNavigation(firstStop)}><Icon name="navigate" size={24} />导航到第一站</button>
        </div>
      </section>
    </div>
  );
}

const COMMUNITY_POSTS = [
  { title: '南山小村数乡吃喝玩｜周末必去！', category: '南山 · 美食', author: '旅行达人', likes: 128, image: PHOTOS.park, tall: true },
  { title: '海上世界艺文文化探索记', category: '艺术 · 文化', author: '海上世...', likes: 96, image: PHOTOS.art },
  { title: '深圳湾超美日落！不容错过', category: '打卡 · 日落', author: '湾区漫...', likes: 234, image: PHOTOS.coast, tall: true },
  { title: '南头古城慢慢逛，小吃和老街都很香', category: '古城 · 小吃', author: '橙子汽水', likes: 88, image: PHOTOS.town },
];

function CommunityScreen({ go, openPublish }: { go: (s: Screen) => void; openPublish: (kind: '图文' | '视频') => void }) {
  const [feed, setFeed] = useState<'图文' | '视频' | '关注'>('图文');
  const [searching, setSearching] = useState(false);
  return (
    <div className="wb-page wb-community">
      <div className="wb-community-head">
        <button className="wb-community-title" onClick={() => setFeed('图文')}>周末社区</button>
        <button className="wb-city-chip" onClick={() => setFeed('图文')}>深圳⌄</button>
        <button className={`wb-head-icon ${searching ? 'active' : ''}`} aria-label="搜索社区" onClick={() => setSearching(!searching)}><Icon name="search" size={24} /></button>
        <button className="wb-head-icon" aria-label="查看消息" onClick={() => go('messages')}><Icon name="bell" size={24} /></button>
      </div>
      {searching && <button className="wb-community-search" onClick={() => setSearching(false)}>搜索路线、地点、周末灵感</button>}
      <section className="wb-community-hero">
        <div><p>分享真实路线和体验</p><p>一起发现好周末</p></div>
        <img src="/assets/handdrawn/community-board-user.png" alt="手绘公告板、清单和花草的周末社区插画" />
      </section>
      <div className="wb-tabs wb-community-tabs">
        {(['图文', '视频', '关注'] as const).map((item) => <button key={item} className={feed === item ? 'active' : ''} onClick={() => setFeed(item)}>{item}</button>)}
      </div>
      <section className="wb-waterfall">
        {COMMUNITY_POSTS.map((post, index) => (
          <button type="button" key={post.title} className={`wb-waterfall-card ${post.tall ? 'tall' : ''}`} onClick={() => go('post')}>
            <img src={post.image} alt="" />
            <strong>{post.title}</strong>
            <span>{post.category}</span>
            <footer><i><img src={index % 2 ? PHOTOS.art : PHOTOS.park} alt="" /></i><small>{post.author}</small><b>♡ {post.likes}</b></footer>
          </button>
        ))}
      </section>
      <button className="wb-community-fab" onClick={() => openPublish(feed === '视频' ? '视频' : '图文')}><span>＋</span><b>发布</b></button>
    </div>
  );
}

function MessagesScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="wb-page">
      <Header title="消息" back="返回社区" onBack={() => go('community')} />
      <EmptyRouteCard title="暂时没有消息" description="收到真实的点赞、评论或路线收藏后，消息会显示在这里。" action="返回社区" onAction={() => go('community')} />
    </div>
  );
}

function PostScreen({ go, openSavedRoute }: { go: (s: Screen) => void; openSavedRoute: (routeId: string, backTo: Screen) => void }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const linkedRoute = POPULAR_ROUTES[0];
  const linkedStops = selectAssetsByIds(FALLBACK_STOPS, linkedRoute.stopIds);
  return (
    <div className="wb-page wb-post-page">
      <Header title="帖子详情" back="返回社区" action="分享" onBack={() => go('community')} />
      <div className="wb-post-author"><img src={PHOTOS.park} alt="" /><p><strong>旅行达人</strong><small>路线分享</small></p><button>关注</button></div>
      <h2 className="wb-post-title">南山小村数乡吃喝玩｜周末必去！</h2>
      <section className="wb-linked-route">
        <h3>关联路线</h3>
        <div className="wb-linked-photos">{[PHOTOS.art, PHOTOS.town, PHOTOS.food].map((src) => <img src={src} key={src} alt="" />)}</div>
        <h2>南山轻松半日路线</h2>
        <div className="wb-linked-meta"><span>★ 4.8</span><span>◷ 4小时</span><span>💰 ¥120-180</span></div>
        <ol>
          {linkedStops.slice(0, 4).map((stop, index) => <li key={stop.id}><b>{index + 1}</b><span>{stop.name}</span><em>{['10:00', '11:30', '12:30', '14:00'][index]}</em></li>)}
        </ol>
        <button className="wb-primary wb-route-cta" onClick={() => openSavedRoute(linkedRoute.id, 'post')}>查看完整路线 ›</button>
      </section>
      <div className="wb-post-actions">
        <button className={liked ? 'active' : ''} onClick={() => setLiked(!liked)}>♡ {liked ? 129 : 128}</button>
        <button>💬 32</button>
        <button>↗ 分享</button>
        <button className={saved ? 'active' : ''} onClick={() => setSaved(!saved)}>☆</button>
      </div>
      <section className="wb-comment-list"><h3>评论 32</h3><p><img src={PHOTOS.coast} alt="" /><span><strong>深圳探索者</strong>这个路线太棒了！停车方便吗？</span></p><p><img src={PHOTOS.park} alt="" /><span><strong>周末旅行家</strong>已安排下周末去！感谢分享 💗</span></p></section>
    </div>
  );
}

function PublishScreen({ go, initialKind }: { go: (s: Screen) => void; initialKind: '图文' | '视频' }) {
  const [text, setText] = useState('');
  const [kind, setKind] = useState<'图文' | '视频' | '关注'>(initialKind);
  const [visibility, setVisibility] = useState<'公开' | '私密' | '不给谁看'>('公开');
  return (
    <div className="wb-page wb-publish-page">
      <Header title="发布帖子" back="取消" action="发布" onBack={() => go('community')} onAction={() => go('community')} />
      <div className="wb-publish-types">{(['图文', '视频', '关注'] as const).map((item) => <button key={item} className={kind === item ? 'active' : ''} onClick={() => setKind(item)}>{item}</button>)}</div>
      <button className="wb-route-picker clean wb-empty-route-picker"><span><Icon name="route-nodes" size={29} /></span><p><strong>选择关联路线（可选）</strong><small>生成或收藏路线后，可以在帖子里关联</small></p><b>›</b></button>
      <label className="wb-publish-title">标题<input placeholder="写一个清楚的周末分享标题" /></label>
      <label className="wb-publish-label clean">正文<textarea maxLength={300} value={text} onChange={(e) => setText(e.target.value)} /><small>{text.length}/300</small></label>
      {kind === '视频'
        ? <button className="wb-video-upload"><Icon name="plus" size={34} /><strong>上传视频</strong><small>支持周末路线记录、探店短视频</small></button>
        : <div className="wb-upload-grid clean"><button aria-label="添加图片">＋</button></div>}
      <div className="wb-visibility-row"><span>可见范围</span><div>{(['公开', '私密', '不给谁看'] as const).map((item) => <button key={item} className={visibility === item ? 'active' : ''} onClick={() => setVisibility(item)}>{item}</button>)}</div></div>
      <div className="wb-publish-row"><span>允许保存路线</span><button className="wb-toggle on"><i /></button></div>
    </div>
  );
}

function MineScreen({ go, openCustomRoute, openFavoritePlaces, openHistoryRoutes, profile, userData, userLocation }: { go: (s: Screen) => void; openCustomRoute: (routeId: string, backTo: Screen) => void; openFavoritePlaces: (backTo: Screen) => void; openHistoryRoutes: (backTo: Screen) => void; profile: UserProfile; userData: UserData; userLocation: UserLocation }) {
  const customTrackRef = useRef<HTMLDivElement>(null);
  const [activeCustomIndex, setActiveCustomIndex] = useState(0);
  const customRoutes = userData.customRoutes;
  const handleCustomScroll = () => {
    const track = customTrackRef.current;
    if (!track?.clientWidth) return;
    const firstCard = track.querySelector<HTMLElement>('.wb-mini-card');
    const cardStep = firstCard ? firstCard.offsetWidth + 12 : track.clientWidth;
    setActiveCustomIndex(Math.min(customRoutes.length - 1, Math.max(0, Math.round(track.scrollLeft / cardStep))));
  };
  const showCustomPage = (page: number) => {
    const track = customTrackRef.current;
    const firstCard = track?.querySelector<HTMLElement>('.wb-mini-card');
    const cardStep = firstCard ? firstCard.offsetWidth + 12 : track?.clientWidth ?? 0;
    track?.scrollTo({ left: page * cardStep, behavior: 'smooth' });
    setActiveCustomIndex(page);
  };
  const routeActions: Array<[IconName, string, Screen, string?]> = [
    ['history', '历史路线', MINE_DESTINATIONS['历史路线'], String(userData.historyRoutes.length)],
    ['pin', '收藏地点', MINE_DESTINATIONS['收藏地点'], String(userData.favoritePlaces.length)],
    ['route', '收藏路线', MINE_DESTINATIONS['收藏路线'], String(userData.favoriteRoutes.length)],
  ];
  const communityActions: Array<[IconName, string, Screen, string?]> = [
    ['community', '我的发布', MINE_DESTINATIONS['我的发布'], '0'],
    ['heart', '我的点赞', MINE_DESTINATIONS['我的点赞'], '0'],
    ['bookmark', '我的收藏', MINE_DESTINATIONS['我的收藏'], '0'],
  ];
  const settingActions: Array<[IconName, string, Screen, string?]> = [
    ['settings', '偏好设置', MINE_DESTINATIONS['偏好设置']],
    ['comment', '帮助与反馈', MINE_DESTINATIONS['帮助与反馈']],
  ];
  const navigateMine = (screen: Screen) => {
    if (screen === 'favorite-places') openFavoritePlaces('mine');
    else if (screen === 'history-routes') openHistoryRoutes('mine');
    else go(screen);
  };
  return (
    <div className="wb-page wb-mine">
      <section className="wb-profile">
        <div className="wb-profile-avatar"><img src={profile.avatar} alt="" /></div>
        <div className="wb-profile-main">
          <h2>{profile.name}</h2>
          <p>{locationLabel(userLocation)}</p>
        </div>
        <button type="button" className="wb-profile-edit" onClick={() => go('profile-edit')}>编辑资料</button>
        <footer>
          <b>{userData.historyRoutes.length}<small>路线</small></b>
          <b>{userData.favoritePlaces.length + userData.favoriteRoutes.length}<small>收藏</small></b>
          <b>0<small>关注</small></b>
          <b>0<small>粉丝</small></b>
        </footer>
      </section>

      <section className="wb-mine-assets">
        <div className="wb-section-title"><strong>自定义路线</strong><button onClick={() => go('custom-routes')}>更多 ›</button></div>
        {customRoutes.length > 0 ? (
          <>
            <div className="wb-carousel-shell wb-mine-carousel" data-layout={routeCollectionLayout('mine')}>
              <div className="wb-mini-grid" ref={customTrackRef} onScroll={handleCustomScroll}>
                {customRoutes.map(({ route }, index) => (
                  <button
                    type="button"
                    className={`wb-mini-card ${index === activeCustomIndex ? 'is-active' : ''} ${Math.abs(index - activeCustomIndex) === 1 ? 'is-neighbor' : ''}`}
                    key={route.id}
                    onClick={() => openCustomRoute(route.id, 'mine')}
                  >
                    <span className="wb-mini-photo"><img src={route.image} alt="" /></span>
                    <span className="wb-mini-copy">
                      <strong>{route.title}</strong>
                      <span className="wb-mini-rating">{typeof route.rating === 'number' && <><b>★ {route.rating}</b><i>·</i></>}{route.duration}</span>
                      <span className="wb-mini-tags">{route.tags.map((tag) => <em key={tag}>{tag}</em>)}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="wb-dots" aria-label="自定义路线轮播位置">
              {customRoutes.map((_, page) => (
                <button
                  type="button"
                  key={page}
                  className={page === activeCustomIndex ? 'active' : ''}
                  aria-label={`查看第${page + 1}条自定义路线`}
                  aria-current={page === activeCustomIndex ? 'true' : undefined}
                  onClick={() => showCustomPage(page)}
                />
              ))}
            </div>
          </>
        ) : (
          <EmptyRouteCard title="还没有自定义路线" description="收藏两个喜欢的地点后，你的路线卡片会保留在这里。" action="去创建第一条" onAction={() => go('route-entry')} />
        )}
      </section>

      <MineMenuGroup title="路线资产" items={routeActions} go={navigateMine} />
      <MineMenuGroup title="社区内容" items={communityActions} go={navigateMine} />
      <MineMenuGroup items={settingActions} go={navigateMine} />
    </div>
  );
}

function CustomRoutesScreen({ go, openCustomRoute, routes }: { go: (s: Screen) => void; openCustomRoute: (routeId: string, backTo: Screen) => void; routes: UserRouteRecord[] }) {
  return (
    <div className="wb-page wb-recent-page wb-custom-routes-page wb-route-collection-page">
      <Header title="自定义路线" back="返回我的" onBack={() => go('mine')} />
      <p className="wb-recent-intro">这里展示你保存和整理过的自定义路线，点开可继续编辑或查看行程。</p>
      {routes.length > 0
        ? <div className="wb-recent-gallery">{routes.map(({ route }) => <RouteGalleryCard key={route.id} route={route} onClick={() => openCustomRoute(route.id, 'custom-routes')} />)}</div>
        : <EmptyRouteCard title="自定义路线还是空的" description="卡片位置已经为你留好，收藏地点并完成定制后会自动出现在这里。" action="开始定制" onAction={() => go('route-entry')} />}
    </div>
  );
}

function CustomRouteDetailScreen({
  routeId,
  backTo,
  stops,
  go,
  openFavoritePlaces,
  onViewItinerary,
  userRoute,
}: {
  routeId: string;
  backTo: Screen;
  stops: Stop[];
  go: (s: Screen) => void;
  openFavoritePlaces: (backTo: Screen) => void;
  onViewItinerary: (routeStops: Stop[], route: SavedRoute) => void;
  userRoute?: UserRouteRecord;
}) {
  const route = userRoute?.route ?? findSavedRoute(routeId);
  if (!route) {
    return (
      <div className="wb-page wb-custom-route-detail">
        <Header title="路线详情" back="返回" onBack={() => go(backTo)} />
        <EmptyRouteCard title="这条路线暂时找不到" description="路线可能已经被移除，请返回上一页重新选择。" action="返回上一页" onAction={() => go(backTo)} />
      </div>
    );
  }
  const catalog = [...stops, ...FALLBACK_STOPS].filter((stop, index, all) => all.findIndex((item) => item.id === stop.id) === index);
  const routeStops = userRoute?.stops || route.stopIds.map((id) => catalog.find((stop) => stop.id === id)).filter((stop): stop is Stop => Boolean(stop));
  const backLabel = backTo === 'custom-routes'
    ? '返回自定义路线'
    : backTo === 'favorite-routes'
      ? '返回收藏路线'
      : backTo === 'history-routes'
        ? '返回最近路线'
        : backTo === 'recent'
          ? '返回热门路线'
          : backTo === 'post'
            ? '返回帖子'
          : '返回我的';
  return (
    <div className="wb-page wb-custom-route-detail">
      <Header title="路线详情" back={backLabel} onBack={() => go(backTo)} />
      <img className="wb-custom-route-cover" src={route.image} alt="" />
      <section className="wb-custom-route-summary">
        <h2>{route.title}</h2>
        <p>{typeof route.rating === 'number' ? `★ ${route.rating} · ` : ''}{route.duration} · {routeStops.length} 个地点</p>
        <div>{route.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </section>
      <RouteList stops={routeStops} showTransfers />
      <div className="wb-dual-actions wb-custom-route-actions">
        <button type="button" className="wb-secondary wb-action-with-icon" onClick={() => openFavoritePlaces('custom-route-detail')}><Icon name="edit" size={22} />继续编辑</button>
        <button type="button" className="wb-primary wb-action-with-icon" onClick={() => onViewItinerary(routeStops, route)}><Icon name="route" size={22} />查看行程</button>
      </div>
    </div>
  );
}

function MineMenuGroup({ title, items, go }: { title?: string; items: Array<[IconName, string, Screen, string?]>; go: (s: Screen) => void }) {
  return (
    <section className="wb-mine-menu-group">
      {title && <h3>{title}</h3>}
      <div className="wb-mine-menu">
        {items.map(([icon, label, screen, count]) => (
          <button type="button" key={label} onClick={() => go(screen)}>
            <Icon name={icon} size={24} />
            <span>{label}</span>
            {count && <b>{count}</b>}
            <i>›</i>
          </button>
        ))}
      </div>
    </section>
  );
}

function RouteAssetListScreen({
  kind,
  go,
  openCustomRoute,
  routes,
  backTo,
}: {
  kind: 'history' | 'favorites';
  go: (s: Screen) => void;
  openCustomRoute: (routeId: string, backTo: Screen) => void;
  routes: UserRouteRecord[];
  backTo: Screen;
}) {
  const history = kind === 'history';
  const screen: Screen = history ? 'history-routes' : 'favorite-routes';
  return (
    <div className="wb-page wb-asset-page wb-route-collection-page">
      <Header title={history ? '历史路线' : '收藏路线'} back={collectionBackLabel(backTo)} onBack={() => go(backTo)} />
      <p className="wb-asset-intro">{history ? '你最近生成和走过的路线都在这里。' : '保存过的完整路线，可以随时再次查看。'}</p>
      {routes.length > 0
        ? <div className="wb-recent-gallery">{routes.map(({ route }) => <RouteGalleryCard key={route.id} route={route} onClick={() => openCustomRoute(route.id, screen)} />)}</div>
        : <EmptyRouteCard
            title={history ? '还没有历史路线' : '还没有收藏路线'}
            description={history ? '第一次生成路线后，完整卡片会自动保留在这里。' : '收藏过的完整路线会用现在这套卡片样式展示在这里。'}
            action={history ? '生成第一条路线' : '浏览热门路线'}
            onAction={() => go(history ? 'route-entry' : 'recent')}
          />}
    </div>
  );
}

function FavoritePlacesScreen({ places, go, backTo, onCreateRoute }: { places: Stop[]; go: (s: Screen) => void; backTo: Screen; onCreateRoute: (routeStops: Stop[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);
  return (
    <div className="wb-page wb-favorite-places-page wb-route-collection-page">
      <Header title="收藏地点" back={collectionBackLabel(backTo)} onBack={() => go(backTo)} />
      <div className="wb-asset-heading"><h2>用喜欢的地方定制路线</h2><p>选择至少两个收藏地点，我们会按距离和游玩节奏排好顺序。</p></div>
      {places.length > 0 ? (
        <div className="wb-favorite-place-list wb-recent-gallery">
          {places.map((stop) => {
            const active = selected.includes(stop.id);
            return (
              <button type="button" key={stop.id} className={`${routeCollectionCardClass(active)} wb-selectable-route-card`} onClick={() => toggle(stop.id)}>
                <span className="wb-place-check">{active ? '✓' : ''}</span>
                <span className="wb-recent-gallery-photo">{stop.image ? <img src={stop.image} alt="" /> : <Icon name={stopTypeIcon(stop.type)} size={35} />}</span>
                <span className="wb-recent-gallery-copy"><strong>{stop.name}</strong><small>{stop.district || '区域待确认'}<i>·</i>{stop.type}</small><span className="wb-recent-gallery-tags"><em>{stop.price}</em><em>停留 {stop.stay} 分钟</em></span></span>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyRouteCard title="还没有收藏地点" description="先从热门路线或生成结果里收藏地点，之后就能在这里组合自己的路线。" action="去看看热门路线" onAction={() => go('recent')} />
      )}
      <div className="wb-selection-summary"><span>已选 {selected.length} 个地点</span><small>{selected.length < 2 ? '还需选择至少两个地点' : '可以开始生成路线'}</small></div>
      <button type="button" className="wb-primary wb-bottom-cta wb-action-with-icon" disabled={selected.length < 2} onClick={() => onCreateRoute(selectAssetsByIds(places, selected))}><Icon name="route-nodes" size={24} />用收藏点定制路线</button>
    </div>
  );
}

function CommunityAssetScreen({ kind, go }: { kind: 'posts' | 'likes' | 'saves'; go: (s: Screen) => void }) {
  const meta = {
    posts: { title: '我的发布', intro: '你分享过的路线和周末灵感。', badge: '已发布' },
    likes: { title: '我的点赞', intro: '你点过赞的周末内容。', badge: '已点赞' },
    saves: { title: '我的收藏', intro: '收藏的攻略和社区帖子。', badge: '已收藏' },
  }[kind];
  return (
    <div className="wb-page wb-asset-page">
      <Header title={meta.title} back="返回我的" onBack={() => go('mine')} />
      <p className="wb-asset-intro">{meta.intro}</p>
      <EmptyRouteCard
        title={`${meta.title}还是空的`}
        description="这里不会预先填入演示数据，使用过程中产生的真实内容会逐渐出现在这里。"
        action="去逛逛社区"
        onAction={() => go('community')}
      />
    </div>
  );
}

function HelpFeedbackScreen({ go }: { go: (s: Screen) => void }) {
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="wb-page wb-help-page">
      <Header title="帮助与反馈" back="返回我的" onBack={() => go('mine')} />
      <section className="wb-help-topics">
        <h2>常见问题</h2>
        {['路线地点与实际营业状态不一致', '如何修改或重新生成路线', '定位、地图或导航无法使用'].map((topic) => <button type="button" key={topic}><span>{topic}</span><b>›</b></button>)}
      </section>
      <label className="wb-feedback-box"><strong>告诉我们遇到的问题</strong><textarea value={message} maxLength={300} onChange={(event) => { setMessage(event.target.value); setSubmitted(false); }} placeholder="请描述出现问题的页面和操作…" /><span>{message.length}/300</span></label>
      {submitted && <p className="wb-feedback-success">反馈已记录，感谢你的帮助。</p>}
      <button type="button" className="wb-primary wb-bottom-cta" disabled={!message.trim()} onClick={() => setSubmitted(true)}>提交反馈</button>
    </div>
  );
}

function ProfileEditScreen({ go, profile, setProfile }: { go: (s: Screen) => void; profile: UserProfile; setProfile: React.Dispatch<React.SetStateAction<UserProfile>> }) {
  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const avatars = ['/assets/handdrawn/weekend-picnic.png', PHOTOS.park, PHOTOS.coast, PHOTOS.art];
  const save = () => {
    setProfile({ name: name.trim() || '周末搭子', avatar });
    go('mine');
  };
  return (
    <div className="wb-page wb-profile-edit-page">
      <Header title="编辑资料" back="返回我的" action="保存" onBack={() => go('mine')} onAction={save} />
      <section className="wb-profile-editor-card">
        <div className="wb-profile-editor-avatar"><img src={avatar} alt="" /></div>
        <h3>头像</h3>
        <div className="wb-avatar-options">
          {avatars.map((src) => (
            <button type="button" key={src} className={avatar === src ? 'active' : ''} onClick={() => setAvatar(src)}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
        <label className="wb-profile-name-input">名字<input value={name} maxLength={12} onChange={(event) => setName(event.target.value)} /></label>
      </section>
      <button className="wb-primary wb-bottom-cta" onClick={save}>保存资料</button>
    </div>
  );
}

function MenuSection({ title, items, go }: { title: string; items: string[][]; go: (s: Screen) => void }) {
  return <section className="wb-menu"><h3>{title}</h3>{items.map(([icon, label, screen]) => <button key={label} onClick={() => go(screen as Screen)}><Icon name={icon as IconName} size={24} />{label}<b>›</b></button>)}</section>;
}

function ReplaceScreen({ go, stops, setStops, selectedIndex, backTo, userLocation }: { go: (s: Screen) => void; stops: Stop[]; setStops: React.Dispatch<React.SetStateAction<Stop[]>>; selectedIndex: number; backTo: Screen; userLocation: UserLocation }) {
  const current = stops[selectedIndex] || stops[0] || FALLBACK_STOPS[0];
  const [selectedType, setSelectedType] = useState('文化体验');
  const [prompt, setPrompt] = useState('');
  const [searching, setSearching] = useState(false);
  const [message, setMessage] = useState('');
  const [candidates, setCandidates] = useState<Poi[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [flowStep, setFlowStep] = useState<ReplacementFlowStep>('search');
  const findReplacementCandidates = async () => {
    if (searching) return;
    setSearching(true);
    setCandidates([]);
    setSelectedCandidateId(null);
    setMessage(`正在用高德查找 3 个「${selectedType}」候选...`);
    try {
      const pois = await requestPlaceCandidates<Poi>(fetch, buildReplacementFinderPayload(selectedType, prompt, userLocation, buildRoutePayload(stops)));
      setCandidates(pois);
      setFlowStep((step) => nextReplacementFlowStep(step, 'search_succeeded'));
      setMessage(`找到 ${pois.length} 个真实地点，选择一个查看详情。`);
    } catch (error) {
      setMessage(error instanceof Error ? `替换失败：${error.message}` : '替换失败，请稍后再试');
    } finally {
      setSearching(false);
    }
  };
  const confirmReplacement = (candidateId: string) => {
    const poi = resolveCandidateForReplacement(candidates, candidateId);
    if (!poi) return;
    const replacement = normalizePoi({ order: selectedIndex + 1, role: 'activity', poi, note: poi.reason }, selectedIndex);
    setStops((items) => replaceStopAtIndex(items, selectedIndex, replacement));
    trackStepReplaced(current.name, replacement.name, prompt.trim(), {
      fromPoiType: current.type,
      fromPoiTags: current.tags,
      district: current.district,
      toPoiType: replacement.type,
    });
    go(backTo);
  };
  const resetSearch = () => {
    setCandidates([]);
    setSelectedCandidateId(null);
    setMessage('');
    setFlowStep('search');
  };
  const openCandidate = (poiId: string) => {
    setSelectedCandidateId(poiId);
    setFlowStep((step) => nextReplacementFlowStep(step, 'open_candidate'));
  };
  const selectedPoi = resolveCandidateForReplacement(candidates, selectedCandidateId);
  const selectedStop = selectedPoi
    ? normalizePoi({ order: selectedIndex + 1, role: 'activity', poi: selectedPoi, note: selectedPoi.reason }, selectedIndex)
    : null;

  if (flowStep === 'preview' && selectedPoi && selectedStop) {
    return (
      <div className="wb-page wb-replace-page wb-fixed-page wb-replace-preview-page">
        <Header title="候选地点详情" back="返回候选" onBack={() => setFlowStep((step) => nextReplacementFlowStep(step, 'back'))} />
        <div className="wb-fixed-page-scroll wb-replace-preview-scroll">
          <ReplacementCandidatePreview
            stop={selectedStop}
            hideActions
            onClose={() => setFlowStep('results')}
            onConfirm={() => confirmReplacement(selectedPoi.id)}
          />
        </div>
        <div className="wb-replace-preview-footer">
          <button type="button" className="wb-secondary" onClick={() => setFlowStep('results')}>返回候选</button>
          <button type="button" className="wb-primary" onClick={() => confirmReplacement(selectedPoi.id)}>确认替换为{selectedStop.name}</button>
        </div>
      </div>
    );
  }

  if (flowStep === 'results' && candidates.length > 0) {
    return (
      <div className="wb-page wb-replace-page wb-fixed-page wb-replace-results-page">
        <Header title="选择替换地点" back="重新筛选" onBack={() => setFlowStep((step) => nextReplacementFlowStep(step, 'back'))} />
        <div className="wb-fixed-page-scroll">
          <p className="wb-replace-context"><span>第 2/3 步</span>正在替换「{current.name}」</p>
          {message && <p className="wb-add-message wb-add-feedback wb-replace-feedback">{message}</p>}
          <section className="wb-replacement-results" aria-label="替换站点候选">
            <h2>选择一个新站点 <small>点击卡片查看介绍和图片，确认后才会替换</small></h2>
            <div className="wb-replacement-candidates">
              {candidates.map((poi, index) => {
                const stop = normalizePoi({ order: selectedIndex + 1, role: 'activity', poi, note: poi.reason }, selectedIndex);
                return (
                  <div className="wb-replacement-candidate-item" key={poi.id}>
                    <RouteStop stop={stop} index={index} candidate onSelect={() => openCandidate(poi.id)} />
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="wb-page wb-replace-page wb-fixed-page wb-replace-search-page">
      <Header title="替换站点" back="返回路线" onBack={() => go(backTo)} />
      <div className="wb-fixed-page-scroll">
        <p className="wb-replace-context"><span>第 1/3 步</span>设置替换条件</p>
        <p className="wb-replace-label">当前站点</p>
        <RouteStop stop={current} index={selectedIndex} />
        {message && <p className="wb-add-message wb-add-feedback wb-replace-feedback">{message}</p>}
        <PlaceFinderFields
          className="wb-replace-finder"
          title="想换成什么？"
          hint="会避开路线里的已有地点"
          selectedType={selectedType}
          prompt={prompt}
          busy={searching}
          actionLabel={`查找 3 个${selectedType}候选`}
          busyLabel="正在查找 3 个真实地点..."
          onTypeChange={(type) => { setSelectedType(type); resetSearch(); }}
          onPromptChange={(value) => { setPrompt(value); resetSearch(); }}
          onSubmit={findReplacementCandidates}
        />
      </div>
    </div>
  );
}

function CustomScreen({ stops, go }: { stops: Stop[]; go: (s: Screen) => void }) {
  const [selected, setSelected] = useState(stops.map(s => s.id));
  return (
    <div className="wb-page">
      <Header title="自定义路线" back="返回我的" onBack={() => go('mine')} />
      <h3>从收藏地点中选择 <small>（至少选择2个）</small></h3>
      <div className="wb-custom-list">{[...stops, FALLBACK_STOPS[4]].map((s) => <button key={s.id} onClick={() => setSelected(x => x.includes(s.id)?x.filter(id=>id!==s.id):[...x,s.id])}><i>{selected.includes(s.id)?'✓':'□'}</i><img src={s.image} alt="" /><p><strong>{s.name}</strong><small>{s.district} · {s.type}</small><span>{s.price} · 停留{s.stay}分钟</span></p><b>♡</b></button>)}</div>
      <h3>路线顺序 <small>（可拖拽调整）</small></h3>
      <div className="wb-order-list">{stops.filter(s=>selected.includes(s.id)).map((s,i)=><div key={s.id}>☰ <span className={`wb-number n${i+1}`}>{i+1}</span><p><strong>{s.name}</strong><small>停留 {s.stay} 分钟</small></p><button>⇅　♲</button></div>)}</div>
      <div className="wb-summary-row">{selected.length}站 · 约4小时 · 预计 ¥120–180/人</div>
      <button className="wb-primary wb-bottom-cta" onClick={() => go('itinerary')}>生成这条路线</button>
    </div>
  );
}

function PreferencesScreen({ go, sessionId }: { go: (s: Screen) => void; sessionId: string }) {
  const [profile, setProfile] = useState<UserPreferenceProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadFailed(false);
    fetch(`/api/user-profile?sessionId=${encodeURIComponent(sessionId)}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('profile request failed');
        return response.json() as Promise<{ profile?: UserPreferenceProfile | null }>;
      })
      .then((data) => setProfile(data.profile ?? null))
      .catch((error) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setProfile(null);
        setLoadFailed(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [sessionId]);

  const likedSignals = profile
    ? [...new Set([...(profile.likedPoiTypes ?? []), ...(profile.likedTags ?? [])])].slice(0, 12)
    : [];
  const hasSignals = profile ? hasPreferenceSignals(profile) : false;
  return (
    <div className="wb-page">
      <Header title="推荐偏好" back="返回我的" onBack={() => go('mine')} />
      {loading ? (
        <section className="wb-pref-intro" aria-live="polite"><p>正在加载偏好...</p></section>
      ) : loadFailed ? (
        <section className="wb-pref-intro"><p>暂时无法读取偏好，路线生成不会受到影响。</p></section>
      ) : hasSignals && profile ? (
        <>
          {likedSignals.length > 0 && <section className="wb-pref-section"><h3>你喜欢的类型</h3><div className="wb-pills">{likedSignals.map((item) => <span key={item} className="wb-pill wb-pill-positive">{item}</span>)}</div></section>}
          {(profile.likedDistricts?.length ?? 0) > 0 && <section className="wb-pref-section"><h3>你常去的区域</h3><div className="wb-pills">{profile.likedDistricts?.map((item) => <span key={item} className="wb-pill">{item}</span>)}</div></section>}
          {(profile.favoritePoiNames?.length ?? 0) > 0 && <section className="wb-pref-section"><h3>你收藏的地点</h3><div className="wb-pills">{profile.favoritePoiNames?.map((item) => <span key={item} className="wb-pill">{item}</span>)}</div></section>}
          {(profile.dislikedPoiTypes?.length ?? 0) > 0 && <section className="wb-pref-section"><h3>系统帮你避开的</h3><div className="wb-pills">{profile.dislikedPoiTypes?.map((item) => <span key={item} className="wb-pill wb-pill-negative">{item}</span>)}</div></section>}
          <section className="wb-pref-section wb-pref-summary">
            <p>偏好预算：{profile.budgetRange ? `${profile.budgetRange[0]}–${profile.budgetRange[1]} 元/人` : '学习中'}</p>
            <p>偏好节奏：{formatPreferencePace(profile.preferredRoutePace)}</p>
            <p className="wb-pref-stats">已确认 {profile.confirmedRouteCount ?? 0} 条路线，收藏 {profile.favoritePoiCount ?? 0} 个地点</p>
          </section>
        </>
      ) : (
        <section className="wb-pref-intro"><p>还没有足够的数据来了解你的偏好。生成、确认或收藏几条路线后，系统会自动学习。</p></section>
      )}
      {!loading && <button className="wb-primary wb-bottom-cta" onClick={() => go('mine')}>返回</button>}
    </div>
  );
}

function hasPreferenceSignals(profile: UserPreferenceProfile): boolean {
  return [profile.likedPoiTypes, profile.likedTags, profile.likedDistricts, profile.favoritePoiNames, profile.dislikedPoiTypes]
    .some((items) => (items?.length ?? 0) > 0)
    || Boolean(profile.budgetRange || profile.preferredRoutePace || profile.confirmedRouteCount || profile.favoritePoiCount);
}

function formatPreferencePace(pace?: UserPreferenceProfile['preferredRoutePace']): string {
  if (pace === 'relaxed') return '松弛慢逛';
  if (pace === 'packed') return '丰富紧凑';
  if (pace === 'balanced') return '平衡适中';
  return '学习中';
}

function ReservationScreen({ go }: { go: (s: Screen) => void }) {
  const script = '您好，我们预计今天中午 12:50 左右到，3–4 位用餐。请问需要提前预约吗？如需预约，是否有等位或包间可订？';
  return (
    <div className="wb-page">
      <Header title="预订辅助" back="返回行程" onBack={() => go('itinerary')} />
      <section className="wb-reserve-place"><img src={PHOTOS.food} alt="" /><div><h2>陈记糖水铺（海岸小吃） <span>美食</span></h2><p>到访时间：今天 12:50–13:50</p><p>电话：0755–2666 7788</p><b>预订状态：建议提前预约</b></div></section>
      <div className="wb-warning"><Icon name="clock" size={34} /><p><strong>建议提前预约</strong><small>周末排队风险较高，约等位 40–60 分钟。</small></p></div>
      <h3>电话沟通话术 <small>（复制给商家更高效）</small></h3><div className="wb-script">{script}<button className="wb-inline-icon" onClick={() => navigator.clipboard?.writeText(script)}><Icon name="copy" size={20} />复制</button></div>
      <div className="wb-dual-actions"><button className="wb-secondary wb-action-with-icon"><Icon name="copy" size={22} />复制话术</button><button className="wb-secondary wb-action-with-icon"><Icon name="phone" size={22} />拨打电话</button></div>
      <button className="wb-primary wb-wide-cta">打开团购 / 预订平台　›</button>
      <p className="wb-disclaimer">WeekendBuddy 不代替商家确认，营业和预约状态以现场为准。</p>
      <label className="wb-no-reserve">⌁ <p><strong>这个地点无需预订</strong><small>标记后将不再提醒</small></p><button className="wb-toggle"><i /></button></label>
    </div>
  );
}

export default function WeekendBuddyPrototype() {
  const [screen, setScreen] = useState<Screen>('home');
  const [sessionId] = useState(() => getSessionId());
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);
  const [itineraryBack, setItineraryBack] = useState<Screen>('result');
  const [editBack, setEditBack] = useState<Screen>('result');
  const [publishKind, setPublishKind] = useState<'图文' | '视频'>('图文');
  const [userLocation, setUserLocation] = useState<UserLocation>(EMPTY_LOCATION);
  const [profile, setProfile] = useState<UserProfile>({ name: '周末搭子', avatar: '/assets/handdrawn/weekend-picnic.png' });
  const [favoritePlacesBack, setFavoritePlacesBack] = useState<Screen>('route-entry');
  const [historyRoutesBack, setHistoryRoutesBack] = useState<Screen>('home');
  const [selectedCustomRouteId, setSelectedCustomRouteId] = useState('');
  const [customRouteBack, setCustomRouteBack] = useState<Screen>('mine');
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [lastGenerationInput, setLastGenerationInput] = useState<GenerationInput | null>(null);
  const [generationError, setGenerationError] = useState('');
  const [itinerarySavedRoute, setItinerarySavedRoute] = useState<SavedRoute | null>(null);
  const [userData, setUserData] = useState<UserData>(() => typeof window === 'undefined' ? createEmptyUserData() : loadUserData(window.localStorage));
  const [replaceIndex, setReplaceIndex] = useState(0);
  const [replaceBack, setReplaceBack] = useState<Screen>('edit');
  const favoritePoiIds = useMemo(() => new Set(userData.favoritePlaces.map((place) => place.id)), [userData.favoritePlaces]);
  const activeTab = SCREEN_TAB[screen];
  const go = (next: Screen) => { window.scrollTo({ top: 0, behavior: 'instant' }); setScreen(next); };
  const openRouteDetail = (backTo: Screen) => {
    setItinerarySavedRoute(null);
    setItineraryBack(backTo);
    go('itinerary');
  };
  const openEdit = (backTo: Screen) => {
    setEditBack(backTo);
    go('edit');
  };
  const openReplace = (index: number, backTo: Screen) => {
    setReplaceIndex(index);
    setReplaceBack(backTo);
    go('replace');
  };
  const toggleFavoritePoi = (stop: Stop) => {
    if (!favoritePoiIds.has(stop.id)) {
      trackFavoriteAdded('poi', stop.name, {
        poiType: stop.type,
        poiTags: stop.tags,
        district: stop.district,
        routeTheme: activePlan?.blindBox?.theme || activePlan?.blindBox?.title,
      });
    }
    setUserData((current) => toggleFavoritePlace(current, stop));
  };
  const openPublish = (kind: '图文' | '视频') => {
    setPublishKind(kind);
    go('publish');
  };
  const openFavoritePlaces = (backTo: Screen) => {
    setFavoritePlacesBack(backTo);
    go(routeEntryTarget('custom'));
  };
  const openHistoryRoutes = (backTo: Screen) => {
    setHistoryRoutesBack(backTo);
    go('history-routes');
  };
  const openCustomRoute = (routeId: string, backTo: Screen) => {
    const target = savedRouteTarget(routeId, backTo);
    setSelectedCustomRouteId(target.routeId);
    setCustomRouteBack(target.backTo);
    go(target.screen);
  };
  const viewCustomRouteItinerary = (routeStops: Stop[], route: SavedRoute) => {
    if (routeStops.length) setStops(routeStops);
    setActivePlan(null);
    setLastGenerationInput(null);
    setItinerarySavedRoute(route);
    setItineraryBack('custom-route-detail');
    go('itinerary');
  };
  const createRouteFromFavorites = (routeStops: Stop[]) => {
    if (routeStops.length < 2) return;
    const record = createUserRouteRecord(routeStops, {
      id: `custom-${Date.now()}`,
      title: `${routeStops[0].district || '我的'}收藏定制路线`,
      tags: ['收藏定制', '顺路安排'],
    });
    setStops(routeStops);
    setActivePlan(null);
    setLastGenerationInput(null);
    setItinerarySavedRoute(record.route);
    setUserData((current) => addUserRoute(addUserRoute(current, 'customRoutes', record), 'historyRoutes', record));
    setItineraryBack('favorite-places');
    go('itinerary');
  };

  const saveEditedRoute = () => {
    const target = routeSaveTarget(editBack);
    setItineraryBack(target.itineraryBack);
    go(target.screen);
  };

  const generate = async (input: GenerationInput) => {
    setGenerationError('');
    setItinerarySavedRoute(null);
    setLastGenerationInput(input);
    go('generating'); setLoading(true);
    const minimumDelay = new Promise((resolve) => setTimeout(resolve, 1500));
    let succeeded = false;
    const generationRequest = buildGenerationRequest(input);
    trackStartGenerate(generationRequest.rawText, generationRequest.quickSelections);
    try {
      const plan = await requestGeneratedPlan<Plan>(fetch, input, sessionId);
      const generatedStops = selectPlanRouteSteps(plan).map(normalizePoi);
      const presentation = buildResultPresentation(plan, input, generatedStops.length);
      const record = createUserRouteRecord(generatedStops, {
        id: `generated-${Date.now()}`,
        title: presentation.title,
        duration: `${Math.max(1, Math.round(plan.route.totalMinutes / 60))}小时`,
        tags: presentation.tags,
      });
      setActivePlan(plan);
      setStops(generatedStops);
      setUserData((current) => addUserRoute(current, 'historyRoutes', record));
      trackPlanGenerated(plan);
      succeeded = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : '路线生成失败，请稍后重试。';
      setActivePlan(null);
      setGenerationError(message);
      trackPlanFailed(message, generationRequest.rawText, generationRequest.quickSelections);
    } finally {
      await minimumDelay;
      setLoading(false);
      go(succeeded ? 'result' : 'conditions');
    }
  };

  const tabChange = (tab: MainTab) => {
    go(screenForMainTab(tab));
  };

  useEffect(() => {
    saveUserData(typeof window === 'undefined' ? null : window.localStorage, userData);
  }, [userData]);

  const page = useMemo(() => {
    switch (screen) {
      case 'home': return <HomeScreen go={go} openFavoritePlaces={openFavoritePlaces} openHistoryRoutes={openHistoryRoutes} userLocation={userLocation} setUserLocation={setUserLocation} />;
      case 'route-entry': return <RouteEntryScreen go={go} openFavoritePlaces={openFavoritePlaces} />;
      case 'conditions': return <ConditionsScreen go={go} onGenerate={generate} userLocation={userLocation} generationError={generationError} />;
      case 'generating': return <GeneratingScreen cancel={() => go('conditions')} />;
      case 'result': return <ResultScreen stops={stops} plan={activePlan} generationInput={lastGenerationInput} go={go} openRouteDetail={openRouteDetail} openEdit={openEdit} favoriteIds={favoritePoiIds} onToggleFavorite={toggleFavoritePoi} onReplace={(index) => openReplace(index, 'result')} />;
      case 'edit': return <EditScreen stops={stops} setStops={setStops} go={go} backTo={editBack} userLocation={userLocation} onReplace={(index) => openReplace(index, 'edit')} onSave={saveEditedRoute} />;
      case 'itinerary': return <ItineraryScreen stops={stops} plan={activePlan} generationInput={lastGenerationInput} savedRoute={itinerarySavedRoute} go={go} backTo={itineraryBack} openEdit={openEdit} favoriteIds={favoritePoiIds} onToggleFavorite={toggleFavoritePoi} onReplace={(index) => openReplace(index, 'itinerary')} />;
      case 'map': return <MapScreen stops={stops} city={activePlan?.requirements.city || userLocation.city} go={go} />;
      case 'community': return <CommunityScreen go={go} openPublish={openPublish} />;
      case 'post': return <PostScreen go={go} openSavedRoute={openCustomRoute} />;
      case 'publish': return <PublishScreen go={go} initialKind={publishKind} />;
      case 'messages': return <MessagesScreen go={go} />;
      case 'mine': return <MineScreen go={go} openCustomRoute={openCustomRoute} openFavoritePlaces={openFavoritePlaces} openHistoryRoutes={openHistoryRoutes} profile={profile} userData={userData} userLocation={userLocation} />;
      case 'custom-routes': return <CustomRoutesScreen go={go} openCustomRoute={openCustomRoute} routes={userData.customRoutes} />;
      case 'custom-route-detail': return <CustomRouteDetailScreen routeId={selectedCustomRouteId} backTo={customRouteBack} stops={stops} go={go} openFavoritePlaces={openFavoritePlaces} onViewItinerary={viewCustomRouteItinerary} userRoute={findUserRoute(userData, selectedCustomRouteId)} />;
      case 'profile-edit': return <ProfileEditScreen go={go} profile={profile} setProfile={setProfile} />;
      case 'history-routes': return <RouteAssetListScreen kind="history" go={go} openCustomRoute={openCustomRoute} routes={userData.historyRoutes} backTo={historyRoutesBack} />;
      case 'favorite-places': return <FavoritePlacesScreen places={userData.favoritePlaces} go={go} backTo={favoritePlacesBack} onCreateRoute={createRouteFromFavorites} />;
      case 'favorite-routes': return <RouteAssetListScreen kind="favorites" go={go} openCustomRoute={openCustomRoute} routes={userData.favoriteRoutes} backTo="mine" />;
      case 'mine-posts': return <CommunityAssetScreen kind="posts" go={go} />;
      case 'mine-likes': return <CommunityAssetScreen kind="likes" go={go} />;
      case 'mine-saves': return <CommunityAssetScreen kind="saves" go={go} />;
      case 'help-feedback': return <HelpFeedbackScreen go={go} />;
      case 'replace': return <ReplaceScreen go={go} stops={stops} setStops={setStops} selectedIndex={replaceIndex} backTo={replaceBack} userLocation={userLocation} />;
      case 'custom': return <CustomScreen stops={stops} go={go} />;
      case 'preferences': return <PreferencesScreen go={go} sessionId={sessionId} />;
      case 'reservation': return <ReservationScreen go={go} />;
      case 'recent': return <RecentRoutesScreen go={go} openSavedRoute={openCustomRoute} />;
    }
  }, [screen, stops, loading, itineraryBack, editBack, publishKind, userLocation, profile, favoritePlacesBack, historyRoutesBack, selectedCustomRouteId, customRouteBack, activePlan, lastGenerationInput, generationError, itinerarySavedRoute, favoritePoiIds, replaceIndex, replaceBack, userData, sessionId]);

  useEffect(() => {
    document.title = `WeekendBuddy · ${screen}`;
  }, [screen]);

  useEffect(() => {
    trackPageView();
  }, []);

  return (
    <div className="wb-stage">
      <main className={`wb-phone ${activeTab ? 'with-nav' : ''} ${screen === 'home' ? 'is-home' : ''}`}>{page}{activeTab && <BottomNav active={activeTab} onChange={tabChange} />}</main>
    </div>
  );
}

/**
 * Weekend Buddy Demo Server
 * Wraps the Agent A module's three core functions as REST APIs.
 *
 * Run with: node --experimental-strip-types server.mjs
 */

import http from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { handleTrackRequest } from './tracker.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_MODULE_PATH = resolve(__dirname, '..', 'new-agent-a-module');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

loadLocalEnv();

// Dynamic imports
let generatePlan, executePlan, handleReplan, learnUserProfile, pois;

async function loadAgent() {
  const orchestrator = await import(pathToFileURL(resolve(AGENT_MODULE_PATH, 'src/agent/orchestrator.ts')).href);
  const profileModule = await import(pathToFileURL(resolve(AGENT_MODULE_PATH, 'src/agent/profileLearner.ts')).href);
  const dataModule = await import(pathToFileURL(resolve(AGENT_MODULE_PATH, 'src/data/pois.ts')).href);
  generatePlan = orchestrator.generatePlan;
  executePlan = orchestrator.executePlan;
  handleReplan = orchestrator.handleReplan;
  learnUserProfile = profileModule.learnUserProfile;
  pois = dataModule.pois;
}

function jsonResponse(res, status, data) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // 生产环境：同域部署，不需要 CORS 通配符
  // 开发环境：允许 Vite 开发服务器跨域访问
  if (!IS_PRODUCTION) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  res.writeHead(status, headers);
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({ rawText: body });
      }
    });
  });
}

async function handleGeneratePlan(req, res) {
  try {
    const body = await parseBody(req);
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim().slice(0, 128) : '';
    const userProfile = sessionId ? await learnUserProfile(sessionId) : undefined;
    const userInput = {
      rawText: body.rawText || '',
      quickSelections: {
        ...(body.quickSelections || {}),
        ...(userProfile ? { userProfile } : {}),
      },
    };
    const plan = await generatePlan(userInput, {
      pois,
      llm: sanitizeLlmConfig(body.llmConfig),
    });
    jsonResponse(res, 200, plan);
  } catch (err) {
    console.error('generatePlan error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleUserProfile(req, res) {
  try {
    const url = new URL(req.url || '/api/user-profile', 'http://localhost');
    const sessionId = url.searchParams.get('sessionId')?.trim() || '';
    if (!sessionId || sessionId.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(sessionId)) {
      jsonResponse(res, 400, { error: 'Missing or invalid sessionId' });
      return;
    }
    const profile = await learnUserProfile(sessionId);
    jsonResponse(res, 200, { profile });
  } catch (err) {
    console.error('userProfile error:', err);
    jsonResponse(res, 200, { profile: null });
  }
}

async function handleExecutePlan(req, res) {
  try {
    const body = await parseBody(req);
    const executed = await executePlan(body.plan);
    jsonResponse(res, 200, executed);
  } catch (err) {
    console.error('executePlan error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleReplanRoute(req, res) {
  try {
    const body = await parseBody(req);
    const replanned = await handleReplan(body.event, body.plan, {
      pois,
      llm: sanitizeLlmConfig(body.llmConfig),
    });
    jsonResponse(res, 200, replanned);
  } catch (err) {
    console.error('handleReplan error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleAddPoi(req, res) {
  try {
    const body = await parseBody(req);
    const module = await import(pathToFileURL(resolve(__dirname, '..', 'api', 'add-poi.js')).href);
    const adaptedReq = { method: req.method, body };
    const adaptedRes = {
      setHeader: (key, value) => res.setHeader(key, value),
      status: (statusCode) => ({
        json: (data) => jsonResponse(res, statusCode, data),
      }),
    };
    const handler = typeof module.default === 'function' ? module.default : module.default?.default;
    if (typeof handler !== 'function') throw new Error('add-poi handler unavailable');
    await handler(adaptedReq, adaptedRes);
  } catch (err) {
    console.error('addPoi error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

async function handleAdministrativeOptions(req, res) {
  try {
    const body = await parseBody(req);
    const module = await import(pathToFileURL(resolve(__dirname, '..', 'api', 'administrative-options.js')).href);
    const adaptedReq = { method: req.method, body };
    const adaptedRes = {
      setHeader: (key, value) => res.setHeader(key, value),
      status: (statusCode) => ({
        json: (data) => jsonResponse(res, statusCode, data),
      }),
    };
    const handler = typeof module.default === 'function' ? module.default : module.default?.default;
    if (typeof handler !== 'function') throw new Error('administrative-options handler unavailable');
    await handler(adaptedReq, adaptedRes);
  } catch (err) {
    console.error('administrativeOptions error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

function parseCoordinate(value) {
  if (!value || typeof value !== 'object') return null;
  const lng = Number(value.lng);
  const lat = Number(value.lat);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return { lng, lat };
}

function parsePolyline(polyline) {
  if (typeof polyline !== 'string') return [];
  return polyline
    .split(';')
    .map((point) => point.split(',').map(Number))
    .filter((point) => point.length >= 2 && point.every(Number.isFinite))
    .map(([lng, lat]) => [lng, lat]);
}

function normalizeRouteResult(route, origin, destination) {
  const path = Array.isArray(route.path) ? route.path : [];
  return {
    distanceMeters: Number(route.distanceMeters) || undefined,
    durationSeconds: Number(route.durationSeconds) || undefined,
    path: path.length > 1 ? path : [[origin.lng, origin.lat], [destination.lng, destination.lat]],
  };
}

async function handleReverseGeocode(req, res) {
  try {
    const body = await parseBody(req);
    const coord = parseCoordinate(body);
    const key = process.env.AMAP_API_KEY || process.env.AMAP_WEB_SERVICE_KEY;
    if (!coord) {
      jsonResponse(res, 400, { error: 'lng/lat are required' });
      return;
    }
    if (!key) {
      jsonResponse(res, 200, { province: '', city: '', district: '', label: '', resolved: false });
      return;
    }
    const url = new URL('https://restapi.amap.com/v3/geocode/regeo');
    url.searchParams.set('key', key);
    url.searchParams.set('location', `${coord.lng},${coord.lat}`);
    url.searchParams.set('extensions', 'base');
    url.searchParams.set('radius', '1000');
    const response = await fetch(url);
    const data = await response.json();
    const address = data?.regeocode?.addressComponent;
    if (!response.ok || data?.status !== '1' || !address) {
      jsonResponse(res, 200, { province: '', city: '', district: '', label: '', resolved: false });
      return;
    }
    const province = address.province || '';
    const city = Array.isArray(address.city) ? province : (address.city || province);
    const district = address.district || '';
    const label = [province, city, district].filter((value, index, values) => value && values.indexOf(value) === index).join('');
    jsonResponse(res, 200, { province, city, district, label, resolved: Boolean(province || city || district) });
  } catch (err) {
    console.error('reverseGeocode error:', err);
    jsonResponse(res, 200, { province: '', city: '', district: '', label: '', resolved: false });
  }
}

async function fetchAmapRoute(mode, origin, destination, key, city) {
  if (mode === 'walk' || mode === 'drive') {
    const url = new URL(`https://restapi.amap.com/v3/direction/${mode === 'walk' ? 'walking' : 'driving'}`);
    url.searchParams.set('key', key);
    url.searchParams.set('origin', `${origin.lng},${origin.lat}`);
    url.searchParams.set('destination', `${destination.lng},${destination.lat}`);
    url.searchParams.set('extensions', 'base');
    const response = await fetch(url);
    const data = await response.json();
    const path = data?.route?.paths?.[0];
    if (!response.ok || data?.status !== '1' || !path) return null;
    return {
      distanceMeters: Number(path.distance) || undefined,
      durationSeconds: Number(path.duration) || undefined,
      path: (path.steps || []).flatMap((step) => parsePolyline(step.polyline)),
    };
  }

  if (mode === 'transit') {
    if (!city) return null;
    const url = new URL('https://restapi.amap.com/v3/direction/transit/integrated');
    url.searchParams.set('key', key);
    url.searchParams.set('origin', `${origin.lng},${origin.lat}`);
    url.searchParams.set('destination', `${destination.lng},${destination.lat}`);
    url.searchParams.set('city', city);
    url.searchParams.set('extensions', 'base');
    const response = await fetch(url);
    const data = await response.json();
    const transit = data?.route?.transits?.[0];
    if (!response.ok || data?.status !== '1' || !transit) return null;
    const path = (transit.segments || []).flatMap((segment) => [
      ...((segment.walking?.steps || []).flatMap((step) => parsePolyline(step.polyline))),
      ...((segment.bus?.buslines || []).flatMap((line) => parsePolyline(line.polyline))),
      ...((segment.railway?.spaces || []).flatMap((space) => parsePolyline(space.polyline))),
    ]);
    return {
      distanceMeters: Number(transit.distance) || Number(data?.route?.distance) || undefined,
      durationSeconds: Number(transit.duration) || undefined,
      path,
    };
  }

  if (mode === 'ride') {
    const url = new URL('https://restapi.amap.com/v4/direction/bicycling');
    url.searchParams.set('key', key);
    url.searchParams.set('origin', `${origin.lng},${origin.lat}`);
    url.searchParams.set('destination', `${destination.lng},${destination.lat}`);
    const response = await fetch(url);
    const data = await response.json();
    const path = data?.data?.paths?.[0] || data?.route?.paths?.[0];
    if (!response.ok || data?.errcode || !path) return null;
    return {
      distanceMeters: Number(path.distance) || undefined,
      durationSeconds: Number(path.duration) || undefined,
      path: (path.steps || []).flatMap((step) => parsePolyline(step.polyline)),
    };
  }

  return null;
}

function chooseRecommendedMode(options) {
  const drive = options.drive;
  const transit = options.transit;
  const walk = options.walk;
  if (walk?.distanceMeters && walk.distanceMeters <= 500) return 'walk';
  if (transit?.durationSeconds && drive?.durationSeconds) {
    return transit.durationSeconds <= drive.durationSeconds * 1.45 ? 'transit' : 'drive';
  }
  if (transit) return 'transit';
  if (drive) return 'drive';
  if (options.ride) return 'ride';
  return walk ? 'walk' : 'drive';
}

async function handleTransportOptions(req, res) {
  try {
    const body = await parseBody(req);
    const origin = parseCoordinate(body.origin);
    const destination = parseCoordinate(body.destination);
    const city = typeof body.city === 'string' ? body.city.trim() : '';
    const key = process.env.AMAP_API_KEY;

    if (!origin || !destination) {
      jsonResponse(res, 400, { error: 'origin and destination lng/lat are required' });
      return;
    }
    if (!key) {
      jsonResponse(res, 500, { error: 'AMAP_API_KEY is not configured' });
      return;
    }

    const modes = ['walk', 'ride', 'drive', 'transit'];
    const entries = await Promise.all(modes.map(async (mode) => {
      const route = await fetchAmapRoute(mode, origin, destination, key, city).catch(() => null);
      return [mode, route ? normalizeRouteResult(route, origin, destination) : null];
    }));
    const options = Object.fromEntries(entries.filter(([, route]) => route));
    jsonResponse(res, 200, {
      options,
      recommendedMode: chooseRecommendedMode(options),
    });
  } catch (err) {
    console.error('transportOptions error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

function sanitizeLlmConfig(config) {
  if (!config || typeof config !== 'object') return undefined;
  const apiKey = typeof config.apiKey === 'string' ? config.apiKey.trim() : '';
  const baseUrl = typeof config.baseUrl === 'string' ? config.baseUrl.trim() : '';
  const model = typeof config.model === 'string' ? config.model.trim() : '';
  const intentModel = typeof config.intentModel === 'string' ? config.intentModel.trim() : '';
  if (!apiKey && !baseUrl && !model && !intentModel) return undefined;
  return {
    apiKey: apiKey || undefined,
    baseUrl: baseUrl || undefined,
    model: model || undefined,
    intentModel: intentModel || undefined,
  };
}

function loadLocalEnv() {
  const envFiles = [
    resolve(__dirname, '.env.local'),
    resolve(__dirname, '.env'),
    resolve(__dirname, '..', '.env.local'),
    resolve(__dirname, '..', '.env'),
  ];

  for (const envFile of envFiles) {
    if (!existsSync(envFile)) continue;
    const content = readFileSync(envFile, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex <= 0) continue;
      const key = trimmed.slice(0, equalIndex).trim();
      const value = trimmed.slice(equalIndex + 1).trim().replace(/^["']|["']$/g, '');
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

async function handleTrack(req, res) {
  try {
    const body = await parseBody(req);
    const result = await handleTrackRequest(body);
    if (result.ok) {
      jsonResponse(res, 200, { ok: true });
    } else {
      jsonResponse(res, 400, { error: result.error });
    }
  } catch (err) {
    console.error('track error:', err);
    jsonResponse(res, 500, { error: err.message });
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    jsonResponse(res, 204, {});
    return;
  }

  if (req.method === 'POST' && req.url === '/api/generate-plan') {
    await handleGeneratePlan(req, res);
  } else if (req.method === 'POST' && req.url === '/api/execute-plan') {
    await handleExecutePlan(req, res);
  } else if (req.method === 'POST' && req.url === '/api/replan') {
    await handleReplanRoute(req, res);
  } else if (req.method === 'POST' && req.url === '/api/add-poi') {
    await handleAddPoi(req, res);
  } else if (req.method === 'POST' && req.url === '/api/administrative-options') {
    await handleAdministrativeOptions(req, res);
  } else if (req.method === 'POST' && (req.url === '/api/transport-options' || req.url === '/api/walking-route')) {
    await handleTransportOptions(req, res);
  } else if (req.method === 'POST' && req.url === '/api/reverse-geocode') {
    await handleReverseGeocode(req, res);
  } else if (req.method === 'POST' && req.url === '/api/track') {
    await handleTrack(req, res);
  } else if (req.method === 'GET' && req.url?.startsWith('/api/user-profile')) {
    await handleUserProfile(req, res);
  } else if (req.url === '/api/health') {
    jsonResponse(res, 200, { status: 'ok' });
  } else {
    jsonResponse(res, 404, { error: 'Not found' });
  }
});

const PORT = Number(process.env.PORT) || 3001;
await loadAgent();
server.listen(PORT, () => {
  console.log(`Weekend Buddy API server running on http://localhost:${PORT} [${IS_PRODUCTION ? 'production' : 'development'}]`);
});

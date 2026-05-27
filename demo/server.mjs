/**
 * Weekend Buddy Demo Server
 * Wraps the Agent A module's three core functions as REST APIs.
 *
 * Run with: node --experimental-strip-types server.mjs
 */

import http from 'node:http';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const AGENT_MODULE_PATH = resolve(__dirname, '..', 'new-agent-a-module');

// Dynamic imports
let generatePlan, executePlan, handleReplan, pois;

async function loadAgent() {
  const orchestrator = await import(pathToFileURL(resolve(AGENT_MODULE_PATH, 'src/agent/orchestrator.ts')).href);
  const dataModule = await import(pathToFileURL(resolve(AGENT_MODULE_PATH, 'src/data/pois.ts')).href);
  generatePlan = orchestrator.generatePlan;
  executePlan = orchestrator.executePlan;
  handleReplan = orchestrator.handleReplan;
  pois = dataModule.pois;
}

function jsonResponse(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
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
    const userInput = {
      rawText: body.rawText || '',
      quickSelections: body.quickSelections || {},
    };
    const plan = await generatePlan(userInput, { pois });
    jsonResponse(res, 200, plan);
  } catch (err) {
    console.error('generatePlan error:', err);
    jsonResponse(res, 500, { error: err.message });
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
    const replanned = await handleReplan(body.event, body.plan, { pois });
    jsonResponse(res, 200, replanned);
  } catch (err) {
    console.error('handleReplan error:', err);
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
  } else if (req.url === '/api/health') {
    jsonResponse(res, 200, { status: 'ok' });
  } else {
    jsonResponse(res, 404, { error: 'Not found' });
  }
});

await loadAgent();
server.listen(3001, () => {
  console.log('Weekend Buddy API server running on http://localhost:3001');
});

import { runCatalystHandler } from '@/lib/catalyst-adapter';
const trailHandler = require('../../../../../functions/trail/index.js');

export async function POST(request) {
  return runCatalystHandler(trailHandler, request);
}

export async function GET(request) {
  return runCatalystHandler(trailHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(trailHandler, request);
}

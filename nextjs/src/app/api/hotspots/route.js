import { runCatalystHandler } from '@/lib/catalyst-adapter';
const hotspotsHandler = require('../../../../../functions/hotspots/index.js');

export async function GET(request) {
  return runCatalystHandler(hotspotsHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(hotspotsHandler, request);
}

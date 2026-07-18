import { runCatalystHandler } from '@/lib/catalyst-adapter';
const camerasNearbyHandler = require('../../../../../functions/cameras-nearby/index.js');

export async function GET(request) {
  return runCatalystHandler(camerasNearbyHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(camerasNearbyHandler, request);
}

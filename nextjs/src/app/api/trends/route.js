import { runCatalystHandler } from '@/lib/catalyst-adapter';
const trendsHandler = require('../../../../../functions/trends/index.js');

export async function GET(request) {
  return runCatalystHandler(trendsHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(trendsHandler, request);
}

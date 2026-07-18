import { runCatalystHandler } from '@/lib/catalyst-adapter';
const networkGraphHandler = require('../../../../../functions/network-graph-data/index.js');

export async function GET(request) {
  return runCatalystHandler(networkGraphHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(networkGraphHandler, request);
}

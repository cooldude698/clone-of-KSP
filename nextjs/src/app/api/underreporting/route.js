import { runCatalystHandler } from '@/lib/catalyst-adapter';
const underreportingHandler = require('../../../../../functions/underreporting/index.js');

export async function GET(request) {
  return runCatalystHandler(underreportingHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(underreportingHandler, request);
}

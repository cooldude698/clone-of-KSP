import { runCatalystHandler } from '@/lib/catalyst-adapter';
const repeatOffendersHandler = require('../../../../../functions/repeat-offenders/index.js');

export async function GET(request) {
  return runCatalystHandler(repeatOffendersHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(repeatOffendersHandler, request);
}

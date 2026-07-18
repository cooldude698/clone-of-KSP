import { runCatalystHandler } from '@/lib/catalyst-adapter';
const firsHandler = require('../../../../../functions/firs/index.js');

export async function GET(request) {
  return runCatalystHandler(firsHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(firsHandler, request);
}

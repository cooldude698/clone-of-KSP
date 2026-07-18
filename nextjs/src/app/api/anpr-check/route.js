import { runCatalystHandler } from '@/lib/catalyst-adapter';
const anprCheckHandler = require('../../../../../functions/anpr-check/index.js');

export async function POST(request) {
  return runCatalystHandler(anprCheckHandler, request);
}

export async function GET(request) {
  return runCatalystHandler(anprCheckHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(anprCheckHandler, request);
}

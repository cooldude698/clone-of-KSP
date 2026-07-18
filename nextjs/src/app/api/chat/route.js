import { runCatalystHandler } from '@/lib/catalyst-adapter';
const chatHandler = require('../../../../../functions/chat/index.js');

export async function POST(request) {
  return runCatalystHandler(chatHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(chatHandler, request);
}

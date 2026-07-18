import { runCatalystHandler } from '@/lib/catalyst-adapter';
const conversationsHandler = require('../../../../../functions/conversations/index.js');

export async function GET(request) {
  return runCatalystHandler(conversationsHandler, request);
}

export async function DELETE(request) {
  return runCatalystHandler(conversationsHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(conversationsHandler, request);
}

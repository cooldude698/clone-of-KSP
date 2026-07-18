import { runCatalystHandler } from '@/lib/catalyst-adapter';
const exportPdfHandler = require('../../../../../functions/export-pdf/index.js');

export async function POST(request) {
  return runCatalystHandler(exportPdfHandler, request);
}

export async function OPTIONS(request) {
  return runCatalystHandler(exportPdfHandler, request);
}

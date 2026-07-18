import { proxyCatalystFunction, optionsResponse } from '@/lib/catalyst-proxy';
export async function POST(req) { return proxyCatalystFunction('export-pdf', req); }
export async function OPTIONS() { return optionsResponse(); }

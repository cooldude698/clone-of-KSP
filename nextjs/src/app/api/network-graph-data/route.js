import { proxyCatalystFunction, optionsResponse } from '@/lib/catalyst-proxy';
export async function GET(req) { return proxyCatalystFunction('network-graph-data', req); }
export async function POST(req) { return proxyCatalystFunction('network-graph-data', req); }
export async function OPTIONS() { return optionsResponse(); }

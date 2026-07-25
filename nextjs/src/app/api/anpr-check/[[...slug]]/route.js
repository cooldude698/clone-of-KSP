import { proxyCatalystFunction, optionsResponse } from '@/lib/catalyst-proxy';
export async function GET(req) { return proxyCatalystFunction('anpr-check', req); }
export async function POST(req) { return proxyCatalystFunction('anpr-check', req); }
export async function OPTIONS() { return optionsResponse(); }

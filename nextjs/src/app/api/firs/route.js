import { proxyCatalystFunction, optionsResponse } from '@/lib/catalyst-proxy';
export async function GET(req) { return proxyCatalystFunction('firs', req); }
export async function POST(req) { return proxyCatalystFunction('firs', req); }
export async function OPTIONS() { return optionsResponse(); }

import { proxyCatalystFunction, optionsResponse } from '@/lib/catalyst-proxy';
export async function GET(req) { return proxyCatalystFunction('conversations', req); }
export async function DELETE(req) { return proxyCatalystFunction('conversations', req); }
export async function OPTIONS() { return optionsResponse(); }

// Shared persistent in-memory store using globalThis for Next.js hot module reloading
if (!globalThis.UPLOADED_FIRS) {
  globalThis.UPLOADED_FIRS = [];
}
if (!globalThis.UPLOADED_SUSPECTS) {
  globalThis.UPLOADED_SUSPECTS = [];
}

export const UPLOADED_FIRS = globalThis.UPLOADED_FIRS;
export const UPLOADED_SUSPECTS = globalThis.UPLOADED_SUSPECTS;

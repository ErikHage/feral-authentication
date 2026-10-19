const base64Url = value => Buffer.from(JSON.stringify(value)).toString('base64url');

// An unsigned JWT carrying the payload. The app only decodes tokens, never
// verifies them, so the signature can be anything
export function tokenFor(payload) {
    return `${base64Url({ alg: 'RS256', typ: 'JWT' })}.${base64Url(payload)}.signature`;
}

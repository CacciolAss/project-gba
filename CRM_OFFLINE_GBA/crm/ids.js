// crm/ids.js
export function uuid() {
  return crypto.randomUUID();
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randChar() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

export function generatePW() {
  return `PW-${randChar()}${randChar()}${randChar()}${randChar()}-${Date.now().toString().slice(-4)}`;
}

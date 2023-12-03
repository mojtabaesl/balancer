export function convertByteToGB(byte: number, fractionDigits: number = 2) {
  return Number.parseFloat((byte / Math.pow(1024, 3)).toFixed(fractionDigits));
}

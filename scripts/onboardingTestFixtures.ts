import { encodeDrawnSignature } from "../src/lib/employee-onboarding/signatureFields";

/**
 * 200×48 white PNG with three thick black horizontal bars — clearly visible when
 * stamped onto PDF signature fields in e2e tests.
 */
export const BLOCK_SIGNATURE_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAAAwCAYAAABUmTXqAAAAxklEQVR4nO3ZoREAMQwDQfff9H8FEZXA7sxxE5HkPuDp2gfAMgOBwEAgMBAIDAQCA4HAQCC4u/skPasfIC1XP0Barn6AtFz9AGm5+gHScvUDpN3a78ywzEAgMBAIDAQCA4HAK5aUqx8gLVc/QFqufoC0XP0Aabn6AdJy9QOk3drvzLDMQCAwEAgMBAIDgcBAIDAQCPyDSLn6AdJy9QOk5eoHSMvVD5CWqx8gLVc/QNqt/c4MywwEAgOBwEAgMBAIDAQCA4HgBx6ZaRWtJYK1AAAAAElFTkSuQmCC";

/** @deprecated Use blockDrawnSignatureValue() */
export const SAMPLE_SIGNATURE_DATA_URL = BLOCK_SIGNATURE_DATA_URL;

export function blockDrawnSignatureValue(): string {
  return encodeDrawnSignature(BLOCK_SIGNATURE_DATA_URL);
}

export function sampleDrawnSignatureValue(): string {
  return blockDrawnSignatureValue();
}

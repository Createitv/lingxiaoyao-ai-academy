import fs from "fs";
import path from "path";
import crypto from "crypto";

const CERTS_DIR = path.join(process.cwd(), "certs");

interface WechatPayConfig {
  mchId: string;
  appId: string;
  apiV3Key: string;
  serialNo: string;
  privateKey: string;
}

let cachedConfig: WechatPayConfig | null = null;

export function getWechatPayConfig(): WechatPayConfig | null {
  if (cachedConfig) return cachedConfig;

  const mchId = process.env.WECHAT_PAY_MCH_ID;
  const appId = process.env.MINI_PROGRAM_APP_ID;
  const apiV3Key = process.env.WECHAT_PAY_API_V3_KEY;
  const serialNo = process.env.WECHAT_PAY_SERIAL_NO;

  if (!mchId || !appId || !apiV3Key || !serialNo) {
    return null;
  }

  // Read private key from file or env
  let privateKey = process.env.WECHAT_PAY_PRIVATE_KEY ?? "";
  if (!privateKey) {
    const keyPath = path.join(CERTS_DIR, "wechat_pay_private_key.pem");
    if (fs.existsSync(keyPath)) {
      privateKey = fs.readFileSync(keyPath, "utf-8");
    }
  }

  if (!privateKey) return null;

  cachedConfig = { mchId, appId, apiV3Key, serialNo, privateKey };
  return cachedConfig;
}

// Generate Authorization header for WeChat Pay API v3
export function generateAuthHeader(
  method: string,
  url: string,
  body: string,
  config: WechatPayConfig,
): string {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString("hex");

  const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
  const sign = crypto
    .createSign("RSA-SHA256")
    .update(message)
    .sign(config.privateKey, "base64");

  return (
    `WECHATPAY2-SHA256-RSA2048 ` +
    `mchid="${config.mchId}",` +
    `nonce_str="${nonceStr}",` +
    `timestamp="${timestamp}",` +
    `serial_no="${config.serialNo}",` +
    `signature="${sign}"`
  );
}

// Generate payment sign for mini program wx.requestPayment
export function generatePaymentSign(
  prepayId: string,
  config: WechatPayConfig,
): { timeStamp: string; nonceStr: string; paySign: string } {
  const timeStamp = Math.floor(Date.now() / 1000).toString();
  const nonceStr = crypto.randomBytes(16).toString("hex");
  const packageStr = `prepay_id=${prepayId}`;

  const message = `${config.appId}\n${timeStamp}\n${nonceStr}\n${packageStr}\n`;
  const paySign = crypto
    .createSign("RSA-SHA256")
    .update(message)
    .sign(config.privateKey, "base64");

  return { timeStamp, nonceStr, paySign };
}

// Verify webhook signature from WeChat Pay
export function verifyWebhookSignature(
  timestamp: string,
  nonce: string,
  body: string,
  signature: string,
  platformCert: string,
): boolean {
  const message = `${timestamp}\n${nonce}\n${body}\n`;
  return crypto
    .createVerify("RSA-SHA256")
    .update(message)
    .verify(platformCert, signature, "base64");
}

// Decrypt AEAD_AES_256_GCM ciphertext from webhook notification
export function decryptResource(
  ciphertext: string,
  nonce: string,
  associatedData: string,
  apiV3Key: string,
): string {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(apiV3Key),
    Buffer.from(nonce),
  );
  decipher.setAAD(Buffer.from(associatedData));

  const ciphertextBuf = Buffer.from(ciphertext, "base64");
  // Last 16 bytes is the auth tag
  const authTag = ciphertextBuf.subarray(ciphertextBuf.length - 16);
  const encryptedData = ciphertextBuf.subarray(0, ciphertextBuf.length - 16);

  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}

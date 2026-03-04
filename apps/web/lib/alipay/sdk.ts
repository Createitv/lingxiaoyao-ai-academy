import { readFileSync } from "fs";
import { join } from "path";

import type { AlipaySdk } from "alipay-sdk";

let cached: AlipaySdk | null = null;

export async function getAlipaySdk(): Promise<AlipaySdk | null> {
  if (cached) return cached;

  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_APP_PRIVATE_KEY;
  if (!appId || !privateKey) return null;

  const certsDir = join(process.cwd(), "certs");

  const { AlipaySdk: Sdk } = await import("alipay-sdk");

  cached = new Sdk({
    appId,
    privateKey,
    appCertContent: readFileSync(join(certsDir, "appCertPublicKey.crt"), "utf-8"),
    alipayPublicCertContent: readFileSync(
      join(certsDir, "alipayCertPublicKey_RSA2.crt"),
      "utf-8",
    ),
    alipayRootCertContent: readFileSync(
      join(certsDir, "alipayRootCert.crt"),
      "utf-8",
    ),
    gateway:
      process.env.ALIPAY_SANDBOX === "true"
        ? "https://openapi-sandbox.dl.alipaydev.com/gateway.do"
        : "https://openapi.alipay.com/gateway.do",
  });

  return cached;
}

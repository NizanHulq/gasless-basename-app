const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzNzI0OTUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg1MDdmOEUyN2E4NjBkQjM3Yzk4NzZGODhjZDlFYzQ0NDdlODU0QjliIn0",
    payload: "eyJkb21haW4iOiJnYXNsZXNzLWJhc2VuYW1lLWFwcC52ZXJjZWwuYXBwIn0",
    signature: "UR5Ff420ZLzWuH1DPlOhleaiU4bJQKacYEKapm4S32NtzP44jktu5vCbIwPCjM9bN9aFgzLHth713P8L+7c3Dxs=",
  },
  baseBuilder: {
    ownerAddress: "",
  },
  miniapp: {
    version: "1",
    name: "gasless-basename-app",
    subtitle: "",
    description: "",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#f8fafc",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["utility", "identity", "basename", "gasless"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Mint your base name gasless",
    ogTitle: "Basename Gasless App",
    ogDescription: "Mint base names with gasless and USDC support",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    // castShareUrl: "https://warpcast.com/...", // Removed to fix domain mismatch error
  },
} as const;

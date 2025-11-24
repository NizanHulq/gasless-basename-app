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
    header: "",
    payload: "",
    signature: "",
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
    tagline: "Mint your .base name gasless & instantly.",
    ogTitle: "Basename Gasless App - Claim your identity",
    ogDescription: "The easiest way to mint your .base name on Base Sepolia. Gasless transactions & USDC supported.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

import localFont from "next/font/local";

// Self-hosted Inter (variable woff2). Avoids the build-time Google Fonts fetch
// so the build is reproducible offline / on Cloudflare and ships no third-party
// font request at runtime (DSGVO-friendly). Source: fontsource inter:vf (latin).
export const inter = localFont({
  src: "./fonts-local/inter-variable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

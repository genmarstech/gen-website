import type { NextConfig } from "next";

/**
 * Static export.
 *
 * This is a marketing site: no server-rendered data, no auth, no database.
 * `output: "export"` emits plain files into ./out, which Caddy serves directly
 * on the Hetzner host (Charter 03 §I — runtime & deploy). No Node process runs
 * in production, so there is nothing to patch, monitor, or wake up at 3am.
 *
 * If a future page needs server rendering, remove `output` and revisit the
 * deployment notes in docs/DEPLOYMENT.md.
 */
const nextConfig: NextConfig = {
  output: "export",

  // Static hosts serve /path/ as /path/index.html. Trailing slashes keep the
  // exported tree and the served URLs identical.
  trailingSlash: true,

  // next/image's optimiser needs a running server; a static export has none.
  images: { unoptimized: true },

  // A red pipeline blocks deploy (Charter 03 §III). Never let a broken build
  // through by ignoring its own errors.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,
};

export default nextConfig;

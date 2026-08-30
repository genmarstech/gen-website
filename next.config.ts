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
  //
  // There is deliberately no `eslint` key here. Next 16 removed it from
  // NextConfig along with `next lint`, so leaving `eslint: { ignoreDuringBuilds:
  // false }` in place is a hard type error (TS2353) that fails typecheck AND
  // the build. Nothing is weakened by its absence: `npm run lint` runs ESLint
  // directly and is its own required step in the build workflow — arguably a
  // better place for it, since a lint failure now reads as a lint failure
  // rather than as a mysterious build error.
  typescript: { ignoreBuildErrors: false },

  poweredByHeader: false,
};

export default nextConfig;

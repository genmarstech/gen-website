/**
 * Turn source photographs into what production should actually serve.
 *
 * ── WHY THIS EXISTS AT ALL ──────────────────────────────────────────────────
 *
 * next/image's optimiser needs a running server and this site is a static
 * export (see next.config.ts), so `images: { unoptimized: true }` is set and
 * Next will hand the browser whatever file it is given. A 4.7MB 6720px JPEG
 * dropped into public/ would be downloaded in full by a phone on Safaricom
 * data to fill a 380px-wide band.
 *
 * So the optimisation happens here, once, at authoring time, and the result is
 * committed. Nothing runs in production.
 *
 * ── WHAT IT PRODUCES ────────────────────────────────────────────────────────
 *
 * For each source, several widths in three formats:
 *
 *   AVIF   smallest by a wide margin; ~93% of browsers
 *   WebP   the fallback that covers nearly all of the rest
 *   JPEG   the <img src>, so a browser that understands neither still works
 *
 * Filenames carry a content hash, which is what makes it safe for Caddy to
 * serve them immutable for a year: changing a photo changes its name, so no
 * cache anywhere can hand back the old one.
 *
 * It also records each image's real dimensions and average colour into a
 * manifest. The dimensions give every <img> an aspect ratio so nothing shifts
 * as it loads, and the colour fills the box beforehand so the space reads as
 * deliberate rather than broken.
 *
 * Usage:  node scripts/build-media.mjs <source-directory>
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

const OUT_DIR = "public/media";
const MANIFEST = "src/lib/media.json";

/**
 * The widths a browser is allowed to choose between.
 *
 * Chosen against real layout, not as round numbers: the bands are full-bleed
 * (so up to ~1600 on a large laptop, 2048 covers a 2x phone and most desktops)
 * and the service cards cap at about 560. Adding a 3000px step would only ever
 * serve a 5MB file to somebody with a very large monitor and no benefit.
 */
const WIDTHS = [640, 1024, 1536, 2048];

/**
 * Only these five. The two source photographs showing recognisable people are
 * deliberately excluded: this site says nothing untrue about Genmars, and a
 * stock photograph of strangers is read by visitors as our team or our
 * clients. Charter 04 §IV — the safest version of that rule is to have no
 * people in the photography at all.
 */
const KEEP = {
  "nrd-c3tNiAb098I-unsplash": {
    slug: "corridor",
    alt: "A glass-walled office corridor lit warm along a wooden floor.",
    credit: "NRD on Unsplash",
  },
  "pexels-cottonbro-6804605": {
    slug: "workroom",
    alt: "An empty workroom: desks, monitors and chairs under daylight.",
    credit: "cottonbro studio on Pexels",
  },
  "pexels-cottonbro-6804606": {
    slug: "workstation",
    alt: "A workstation with code on screen, under two pendant lamps.",
    credit: "cottonbro studio on Pexels",
  },
  "pexels-dkomov-34803969": {
    slug: "editor",
    alt: "A laptop showing an open code editor, beside a cup of coffee.",
    credit: "D. Komov on Pexels",
  },
  "thisisengineering-sbVu5zitZt0-unsplash": {
    slug: "robotics",
    alt: "A robotic hand raised open against a deep teal background.",
    credit: "ThisisEngineering on Unsplash",
  },
};

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
}

function probe(file) {
  const out = execFileSync("ffprobe", [
    "-v", "error", "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "csv=p=0", file,
  ]).toString().trim();
  const [width, height] = out.split(",").map(Number);
  return { width, height };
}

/**
 * The average colour, as a hex string.
 *
 * Scaled to a single pixel and read back. It fills the image's box before the
 * file arrives, so the page has no white hole in it — cheaper than a blurred
 * placeholder and, at one pixel, free.
 */
function averageColour(file) {
  const tmp = join(OUT_DIR, ".probe.rawvideo");
  ffmpeg(["-i", file, "-vf", "scale=1:1", "-frames:v", "1",
          "-f", "rawvideo", "-pix_fmt", "rgb24", tmp]);
  const [r, g, b] = readFileSync(tmp);
  rmSync(tmp, { force: true });
  return "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
}

function hashOf(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 8);
}

const sourceDir = process.argv[2];
if (!sourceDir) {
  console.error("Usage: node scripts/build-media.mjs <source-directory>");
  process.exit(1);
}

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const manifest = {};

for (const file of readdirSync(sourceDir).sort()) {
  const stem = basename(file, ".jpg");
  const entry = KEEP[stem];
  if (!entry) continue;

  const source = join(sourceDir, file);
  const { width, height } = probe(source);
  const colour = averageColour(source);

  const variants = { avif: [], webp: [], jpeg: [] };

  for (const target of WIDTHS) {
    // Never upscale. A 640px source asked to fill 2048 produces a bigger file
    // that looks worse, which is the opposite of the point.
    if (target > width) continue;

    const scale = `scale=${target}:-2:flags=lanczos`;

    const avif = join(OUT_DIR, `${entry.slug}-${target}.avif`);
    ffmpeg(["-i", source, "-vf", scale, "-frames:v", "1",
            "-c:v", "libaom-av1", "-still-picture", "1",
            "-crf", "34", "-cpu-used", "4", avif]);

    const webp = join(OUT_DIR, `${entry.slug}-${target}.webp`);
    ffmpeg(["-i", source, "-vf", scale, "-frames:v", "1",
            "-c:v", "libwebp", "-quality", "72", webp]);

    const jpeg = join(OUT_DIR, `${entry.slug}-${target}.jpg`);
    ffmpeg(["-i", source, "-vf", scale, "-frames:v", "1",
            "-q:v", "6", jpeg]);

    // Hash after encoding, so the name follows the bytes actually served.
    for (const [format, path] of [["avif", avif], ["webp", webp], ["jpeg", jpeg]]) {
      const hash = hashOf(path);
      const ext = format === "jpeg" ? "jpg" : format;
      const finalName = `${entry.slug}-${target}.${hash}.${ext}`;
      execFileSync("mv", [path, join(OUT_DIR, finalName)]);
      variants[format].push({ width: target, src: `/media/${finalName}` });
    }
  }

  manifest[entry.slug] = {
    alt: entry.alt,
    credit: entry.credit,
    width,
    height,
    colour,
    ...variants,
  };

  const largest = variants.jpeg.at(-1);
  console.log(
    `  ${entry.slug.padEnd(12)} ${width}x${height}  ${colour}  ` +
    `${variants.avif.length} widths  largest jpeg ${largest?.src ?? "-"}`,
  );
}

writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
console.log(`\nManifest written to ${MANIFEST}`);

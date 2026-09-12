/**
 * The documentation this site builds from.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * THIS RUNS AT BUILD TIME AND NOWHERE ELSE.
 *
 * The site is `output: "export"` — there is no server, and a visitor's browser
 * never contacts the API. `npm run build` calls this once, writes real HTML for
 * every document, and that HTML is what Caddy serves.
 *
 * Three things follow, and each is why it is done this way rather than with a
 * fetch in the browser:
 *
 *   · /docs cannot break when the API is down. It is files.
 *   · The public origin needs no `connect-src` opening to api.genmars.co.ke.
 *     deploy/container.Caddyfile says to question that change, and this avoids
 *     needing to have the argument.
 *   · A crawler sees the words without executing anything, which is the whole
 *     premise of docs/SEO.md.
 *
 * The cost is that publishing takes a deploy. That is stated on the operations
 * screen where documents are written, so nobody is surprised by it.
 * ═══════════════════════════════════════════════════════════════════════════
 */

/** Where to read from. Overridable so a staging API can be built against. */
const ORIGIN = process.env.DOCS_API_ORIGIN ?? "https://api.genmars.co.ke";

export type DocStatus = "planned" | "building" | "beta" | "live";

export type Doc = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  body: string;
  repo_url: string;
  order: number;
  status: DocStatus;
  status_note: string;
  status_changed_at: string | null;
  updated_at: string;
};

export type DocsPayload = {
  docs: Doc[];
  categories: { key: string; label: string }[];
  statuses: { key: string; label: string }[];
};

/**
 * Fetched once per build.
 *
 * Next renders the index and every document page separately, and without this
 * each would fetch again — a dozen identical requests to produce one payload,
 * and a dozen chances for one of them to fail differently from the others.
 */
let inFlight: Promise<DocsPayload> | null = null;

export function loadDocs(): Promise<DocsPayload> {
  inFlight ??= fetchDocs();
  return inFlight;
}

async function fetchDocs(): Promise<DocsPayload> {
  const url = `${ORIGIN}/api/public/docs`;

  let response: Response;
  try {
    response = await fetch(url, { cache: "no-store" });
  } catch (cause) {
    throw new Error(
      `Could not reach ${url} to read the documentation.\n\n` +
        "The build reads /docs from the API, so this stops the build rather " +
        "than shipping a site whose documentation section is silently empty " +
        "— which would also leave the sitemap pointing at pages that 404.\n\n" +
        "Check the API is up, or set DOCS_API_ORIGIN to build against " +
        "something else.",
      { cause },
    );
  }

  if (!response.ok) {
    throw new Error(
      `${url} answered ${response.status}. The documentation could not be ` +
        "read, so the build is stopping rather than publishing an empty /docs.",
    );
  }

  const payload = (await response.json()) as DocsPayload;

  if (!Array.isArray(payload.docs)) {
    throw new Error(`${url} did not return a docs array.`);
  }

  await assertRepoLinksOpen(payload.docs);

  return payload;
}

/**
 * Every published repository link must open for somebody who is not signed in.
 *
 * ── WHY THIS IS WORTH A BUILD STEP ──────────────────────────────────────────
 *
 * `internals-tm` is a private repository and `gen-portal` is not, and the two
 * look identical in the address bar. Publishing a link to the private one
 * sends a reader who wanted our source to a GitHub 404 that reads, to them,
 * as "this company links to things that do not exist".
 *
 * The operations screen tells the author this check exists. That sentence has
 * to be true, which is the other reason it is here.
 *
 * Unauthenticated on purpose: a token would see private repositories and pass
 * links that the public cannot open, which is exactly the failure being
 * checked for.
 */
async function assertRepoLinksOpen(docs: Doc[]): Promise<void> {
  const withRepos = docs.filter((doc) => doc.repo_url);
  if (withRepos.length === 0) return;

  const broken: string[] = [];

  await Promise.all(
    withRepos.map(async (doc) => {
      try {
        const response = await fetch(doc.repo_url, {
          method: "HEAD",
          redirect: "follow",
          cache: "no-store",
        });
        if (!response.ok) {
          broken.push(
            `  ${doc.slug}: ${doc.repo_url} answered ${response.status}`,
          );
        }
      } catch {
        broken.push(`  ${doc.slug}: ${doc.repo_url} could not be reached`);
      }
    }),
  );

  if (broken.length > 0) {
    throw new Error(
      "A published document links to a repository the public cannot open:\n\n" +
        broken.join("\n") +
        "\n\nA private repository looks exactly like a public one in the " +
        "address bar. Either make it public, or clear the source link on that " +
        "document in operations.",
    );
  }
}

/** Published documents in their reading order, grouped by section. */
export async function docsByCategory(): Promise<
  { key: string; label: string; docs: Doc[] }[]
> {
  const { docs, categories } = await loadDocs();
  return categories
    .map((category) => ({
      ...category,
      docs: docs
        .filter((doc) => doc.category === category.key)
        .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
    }))
    .filter((group) => group.docs.length > 0);
}

export async function docBySlug(slug: string): Promise<Doc | undefined> {
  const { docs } = await loadDocs();
  return docs.find((doc) => doc.slug === slug);
}

/** The label the server gave this state, so /docs and /services agree. */
export async function statusLabel(status: DocStatus): Promise<string> {
  const { statuses } = await loadDocs();
  return statuses.find((s) => s.key === status)?.label ?? status;
}

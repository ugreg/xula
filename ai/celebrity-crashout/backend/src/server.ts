import cors from "cors";
import express, { type Request, type Response } from "express";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export interface TimelineEvent {
  icon: string;
  title: string;
  description: string;
  date: string;
}

export interface CelebrityStats {
  fame: number;
  drama: number;
}

/** Full row as stored in JSON (includes lookup-only fields). */
export interface CelebrityRecord {
  id?: string;
  aliases?: string[];
  name: string;
  aura: number;
  hp: number;
  type: string;
  timeline: TimelineEvent[];
  stats: CelebrityStats;
}

/** Payload returned to the client (no internal fields). */
export type ClientCelebrity = Omit<CelebrityRecord, "id" | "aliases">;

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, "..", "data", "celebrities.json");

function loadCelebrities(): CelebrityRecord[] {
  const raw = readFileSync(DATA_PATH, "utf8");
  return JSON.parse(raw) as CelebrityRecord[];
}

function normalize(s: string): string {
  return String(s)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findCelebrity(
  celebrities: CelebrityRecord[],
  query: string
): CelebrityRecord | null {
  const q = normalize(query);
  if (!q) return null;

  for (const c of celebrities) {
    if (normalize(c.name) === q) return c;
    if (c.id && normalize(c.id) === q.replace(/\s+/g, "-")) return c;
    for (const a of c.aliases ?? []) {
      if (normalize(a) === q) return c;
    }
  }

  for (const c of celebrities) {
    if (normalize(c.name).includes(q) || q.includes(normalize(c.name)))
      return c;
  }

  return null;
}

function toClientPayload(
  record: CelebrityRecord,
  displayName?: string
): ClientCelebrity {
  const { aliases: _a, id: _i, ...rest } = record;
  return {
    ...rest,
    name: displayName ?? record.name,
  };
}

function queryParamQ(req: Request): string | undefined {
  const q = req.query.q;
  if (Array.isArray(q)) return q[0] !== undefined ? String(q[0]) : undefined;
  if (q === undefined) return undefined;
  return String(q);
}

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

app.get("/api/celebrity", (req: Request, res: Response) => {
  const q = queryParamQ(req);
  if (q === undefined || q.trim() === "") {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  let celebrities: CelebrityRecord[];
  try {
    celebrities = loadCelebrities();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load data" });
  }

  const match = findCelebrity(celebrities, q);
  const template = match ?? celebrities[0];
  if (!template) {
    return res.status(500).json({ error: "No celebrity data configured" });
  }

  const displayName = q.trim();
  res.json(toClientPayload(template, match ? undefined : displayName));
});

app.post("/api/celebrity/search", (req: Request, res: Response) => {
  const name = req.body?.name as unknown;
  if (name === undefined || String(name).trim() === "") {
    return res.status(400).json({ error: "Missing body field: name" });
  }

  let celebrities: CelebrityRecord[];
  try {
    celebrities = loadCelebrities();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load data" });
  }

  const match = findCelebrity(celebrities, String(name));
  const template = match ?? celebrities[0];
  if (!template) {
    return res.status(500).json({ error: "No celebrity data configured" });
  }

  const displayName = String(name).trim();
  res.json(toClientPayload(template, match ? undefined : displayName));
});

app.get("/api/celebrities", (_req: Request, res: Response) => {
  let celebrities: CelebrityRecord[];
  try {
    celebrities = loadCelebrities();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load data" });
  }

  res.json(
    celebrities.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
    }))
  );
});

app.listen(PORT, () => {
  console.log(`Celebrity Crashout API listening on http://localhost:${PORT}`);
});

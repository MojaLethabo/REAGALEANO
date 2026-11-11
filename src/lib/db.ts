import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";
import { hash } from "./auth";

// Uses Node's built-in SQLite (node:sqlite, Node 22.13+). No native compile step, so it installs on Windows, macOS and Linux.
type P = (string | number | null)[];
type Stmt = {
  get(...p: P): any; // eslint-disable-line @typescript-eslint/no-explicit-any
  all(...p: P): any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  run(...p: P): { changes: number | bigint; lastInsertRowid: number | bigint };
};
export type Db = { exec(sql: string): void; prepare(sql: string): Stmt; transaction<T>(fn: () => T): () => T };

function wrap(raw: DatabaseSync): Db {
  return {
    exec: (sql) => raw.exec(sql),
    // node:sqlite returns null-prototype rows; copy to plain objects so they can be passed to client components.
    prepare: (sql) => {
      const st = raw.prepare(sql);
      return {
        get: (...p: P) => { const r = st.get(...p); return r ? { ...r } : r; },
        all: (...p: P) => st.all(...p).map((r) => ({ ...r })),
        run: (...p: P) => st.run(...p),
      };
    },
    transaction: (fn) => () => {
      raw.exec("BEGIN IMMEDIATE");
      try {
        const r = fn();
        raw.exec("COMMIT");
        return r;
      } catch (e) {
        raw.exec("ROLLBACK");
        throw e;
      }
    },
  };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, role TEXT NOT NULL CHECK(role IN ('OWNER','TECH')),
  name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL, active INTEGER NOT NULL DEFAULT 1,
  must_change INTEGER NOT NULL DEFAULT 0, token_version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS requests(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT NOT NULL DEFAULT '',
  property_type TEXT NOT NULL, service TEXT NOT NULL, kind TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '',
  urgent INTEGER NOT NULL DEFAULT 0, status TEXT NOT NULL DEFAULT 'New',
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS price_items(
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'each', cost REAL NOT NULL DEFAULT 0,
  markup REAL NOT NULL DEFAULT 40, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS quotes(
  id INTEGER PRIMARY KEY, no TEXT NOT NULL UNIQUE, request_id INTEGER REFERENCES requests(id),
  client TEXT NOT NULL, site TEXT NOT NULL DEFAULT '', project TEXT NOT NULL DEFAULT '',
  scope TEXT NOT NULL DEFAULT '', supplied TEXT NOT NULL DEFAULT '',
  vat INTEGER NOT NULL DEFAULT 0, disc REAL NOT NULL DEFAULT 0, valid_days INTEGER NOT NULL DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'Draft', created_at TEXT NOT NULL DEFAULT (datetime('now')), issued_at TEXT);
CREATE TABLE IF NOT EXISTS quote_lines(
  id INTEGER PRIMARY KEY, quote_id INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK(kind IN ('M','L')), name TEXT NOT NULL, unit TEXT NOT NULL DEFAULT 'each',
  qty REAL NOT NULL DEFAULT 1, price REAL NOT NULL DEFAULT 0, cost REAL NOT NULL DEFAULT 0,
  nc INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS jobs(
  id INTEGER PRIMARY KEY, quote_id INTEGER REFERENCES quotes(id), client TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '', scope TEXT NOT NULL DEFAULT '',
  tech_id INTEGER REFERENCES users(id), status TEXT NOT NULL DEFAULT 'Open',
  created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE TABLE IF NOT EXISTS job_materials(
  id INTEGER PRIMARY KEY, job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, unit TEXT NOT NULL DEFAULT 'each', planned REAL NOT NULL DEFAULT 0,
  used REAL NOT NULL DEFAULT 0, extra INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS job_checks(
  id INTEGER PRIMARY KEY, job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  label TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS projects(
  id INTEGER PRIMARY KEY, title TEXT NOT NULL, client TEXT NOT NULL DEFAULT '', category TEXT NOT NULL DEFAULT '',
  photo TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')));
`;

// Starter price list. Cost and markup are editable in the owner panel.
const STARTER: [string, string, string, number, number][] = [
  ["Hikvision 2MP ColorVu colour camera", "CCTV", "each", 699, 40],
  ["2MP colour micro camera", "CCTV", "each", 499, 40],
  ["8-channel NVR 1TB", "CCTV", "each", 2400, 40],
  ["Camera junction box", "CCTV", "each", 80, 40],
  ["CAT6 CCTV balun / camera connector", "CCTV", "each", 53, 40],
  ["Square trunking 40 x 20mm, 6 m", "Networking", "each", 147, 40],
  ["Sliding gate motor 600kg", "Gates", "each", 4200, 40],
  ["12V gate battery", "Gates", "each", 650, 40],
  ["5J electric fence energiser", "Fencing", "each", 1900, 40],
  ["Fingerprint reader", "Access", "each", 1650, 40],
  ["5kVA inverter", "Solar", "each", 18500, 40],
  ["5kWh lithium battery", "Solar", "each", 14000, 40],
  ["Remove old cameras and old / untidy cabling", "Labour", "task", 750, 0],
  ["Install and position cameras and junction boxes", "Labour", "task", 1250, 0],
  ["Install trunking and conduit; neat cable management", "Labour", "task", 750, 0],
  ["Configuration, testing and commissioning", "Labour", "task", 550, 0],
  ["Callout fee", "Labour", "task", 300, 0],
];

function seed(d: Db) {
  if (!d.prepare("SELECT 1 FROM users WHERE role='OWNER' LIMIT 1").get()) {
    const email = process.env.OWNER_EMAIL?.trim().toLowerCase();
    const pass = process.env.OWNER_PASSWORD;
    if (email && pass && pass.length >= 10) {
      d.prepare("INSERT INTO users(role,name,email,password_hash) VALUES('OWNER',?,?,?)")
        .run(process.env.OWNER_NAME || "Owner", email, hash(pass));
    } else if (process.env.NODE_ENV !== "production") {
      d.prepare("INSERT INTO users(role,name,email,password_hash,must_change) VALUES('OWNER','Owner','owner@reagaleano.local',?,1)")
        .run(hash("ChangeMe-12345"));
      console.warn("[reagaleano] Dev owner created: owner@reagaleano.local / ChangeMe-12345");
    } else {
      console.error("[reagaleano] No owner exists. Set OWNER_EMAIL and OWNER_PASSWORD (10+ chars) and restart.");
    }
  }
  if (!d.prepare("SELECT 1 FROM price_items LIMIT 1").get()) {
    const ins = d.prepare("INSERT INTO price_items(name,category,unit,cost,markup) VALUES(?,?,?,?,?)");
    d.transaction(() => STARTER.forEach((r) => ins.run(...r)))();
  }
}

function addCol(d: Db, table: string, col: string, def: string) {
  const cols = d.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === col)) d.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}

declare global {
  // eslint-disable-next-line no-var
  var __rgDb: Db | undefined;
}

export function db(): Db {
  if (!globalThis.__rgDb) {
    const file = process.env.DATABASE_FILE || path.join(process.cwd(), "data", "reagaleano.db");
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const raw = new DatabaseSync(file);
    raw.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
    const d = wrap(raw);
    d.exec(SCHEMA);
    // Timestamps used by analytics (added in place so existing databases keep working).
    addCol(d, "quotes", "accepted_at", "TEXT");
    addCol(d, "jobs", "assigned_at", "TEXT");
    addCol(d, "jobs", "completed_at", "TEXT");
    // Client contact details, so technicians can reach the client.
    for (const t of ["quotes", "jobs"]) { addCol(d, t, "client_phone", "TEXT NOT NULL DEFAULT ''"); addCol(d, t, "client_email", "TEXT NOT NULL DEFAULT ''"); }
    seed(d);
    globalThis.__rgDb = d;
  }
  return globalThis.__rgDb;
}

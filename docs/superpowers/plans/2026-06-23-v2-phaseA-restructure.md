# V2 Phase A — Folder Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cleanly separate the repo into `frontend/` (Vite/React) and `backend/` (Express/Mongo) with git history preserved, all tests/build green from the new locations.

**Architecture:** A purely mechanical move. The current frontend lives at the repo root; the backend is in `server/`. This phase moves the frontend under `frontend/`, renames `server/` → `backend/`, deletes the dead `rendr/` template, and updates the few path-sensitive config and ignore entries. No application logic changes.

**Tech Stack:** git, npm, Vite, Vitest, tsc.

## Global Constraints

- Use `git mv` for tracked files so history is preserved (never plain `mv` + re-add for tracked files).
- No application logic changes in this phase — only moves and path/config edits.
- After the move: `frontend/` holds the Vite app; `backend/` holds the API; repo root holds only `docs/`, `.git`, `.gitignore`, and a new top-level `README.md`.
- `node_modules`, `dist`, `.env`, `uploads` are gitignored and are NOT moved with git — they are reinstalled/recreated in place after the move.
- Verification gate: from the new paths, `cd backend && npm test` (23 pass) and `cd frontend && npm test` (13 pass) and `cd frontend && npm run build` (clean) all succeed.

---

### Task 1: Move backend `server/` → `backend/`

**Files:**
- Move: `server/**` → `backend/**`
- Modify: root `.gitignore`

**Interfaces:**
- Produces: a working backend at `backend/` with its own `package.json`, runnable via `cd backend && npm run dev|test|seed`.

- [ ] **Step 1: Stop any running dev servers and move the folder**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
pkill -f "tsx" 2>/dev/null || true
git mv server backend
```

- [ ] **Step 2: Update root `.gitignore` server paths → backend**

Replace the `server/...` lines so they read:
```
backend/node_modules
backend/uploads
backend/.env
backend/dist
```
(Remove the old `server/...` equivalents.)

- [ ] **Step 3: Move the gitignored runtime dirs that git did not move**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
[ -d server/node_modules ] && mv server/node_modules backend/node_modules || true
[ -d server/uploads ] && mv server/uploads backend/uploads || true
[ -f server/.env ] && mv server/.env backend/.env || true
rmdir server 2>/dev/null || true
```
(If `backend/node_modules` already exists from the git mv staging, skip; otherwise run `cd backend && npm install`.)

- [ ] **Step 4: Verify backend runs from new path**

Run: `cd backend && npm test`
Expected: 23 tests pass. If `node_modules` is missing, run `npm install` first, then re-run.

- [ ] **Step 5: Commit**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
git add -A
git commit -m "refactor: move server/ to backend/"
```

---

### Task 2: Move the frontend into `frontend/`

**Files:**
- Move: all root-level frontend files/dirs → `frontend/`
- Specifically: `src/`, `public/`, `index.html`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.node.json`, `.eslintrc.cjs`, `.prettierrc`, and the `tsconfig*.tsbuildinfo` files if tracked.

**Interfaces:**
- Produces: a working frontend at `frontend/`, runnable via `cd frontend && npm run dev|test|build`. The Vite `@` alias and `/api` proxy continue to work unchanged (they are relative to `vite.config.ts`, which moves with the app).

- [ ] **Step 1: Create `frontend/` and git-move the tracked frontend files**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
mkdir -p frontend
git mv src public index.html vite.config.ts tailwind.config.ts postcss.config.js \
        package.json package-lock.json tsconfig.json tsconfig.node.json \
        .eslintrc.cjs .prettierrc frontend/
```
(If any listed file does not exist as tracked, drop it from the command. Do NOT move `docs/`, `.gitignore`, `backend/`, `.git/`.)

- [ ] **Step 2: Move gitignored frontend runtime dirs**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
[ -d node_modules ] && mv node_modules frontend/node_modules || true
[ -d dist ] && mv dist frontend/dist || true
[ -f tsconfig.tsbuildinfo ] && mv tsconfig.tsbuildinfo frontend/ || true
[ -f tsconfig.node.tsbuildinfo ] && mv tsconfig.node.tsbuildinfo frontend/ || true
```

- [ ] **Step 3: Update root `.gitignore` to point frontend ignores under `frontend/`**

Ensure these entries exist (add/adjust):
```
frontend/node_modules
frontend/dist
frontend/*.local
```
Keep the generic `node_modules`, `dist`, `.DS_Store`, etc. lines too (harmless). Keep the `backend/...` lines from Task 1.

- [ ] **Step 4: Verify frontend builds and tests from new path**

Run:
```bash
cd frontend && npm install && npm test && npm run build
```
Expected: 13 tests pass; `tsc + vite build` clean. (`npm install` is safe even if `node_modules` moved.)

- [ ] **Step 5: Commit**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
git add -A
git commit -m "refactor: move Vite frontend into frontend/"
```

---

### Task 3: Delete dead `rendr/` template + add top-level README

**Files:**
- Delete: `rendr/`
- Create: `README.md` (repo root)

**Interfaces:**
- Produces: a clean repo root containing only `frontend/`, `backend/`, `docs/`, `README.md`, `.gitignore`, `.git/`.

- [ ] **Step 1: Remove the leftover template**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
git rm -r rendr 2>/dev/null || rm -rf rendr
```

- [ ] **Step 2: Create root `README.md`**

```markdown
# Chad Formation Platform

A company-formation platform for Chad (OHADA / ANIE), BusinessAssist-style.

## Structure
- `frontend/` — Vite + React + TypeScript + Tailwind app
- `backend/`  — Express + TypeScript + MongoDB (Mongoose) API
- `docs/`     — design specs and implementation plans

## Run locally
1. MongoDB running locally (or set `MONGODB_URI`).
2. Backend: `cd backend && npm install && npm run seed && npm run dev`  (http://localhost:4000)
3. Frontend: `cd frontend && npm install && npm run dev`  (http://localhost:5173)

Demo logins: admin `admin@chad.demo` / `Admin@123`, user `user@chad.demo` / `User@123`.
```

- [ ] **Step 3: Final verification — both apps green from new structure**

Run:
```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
( cd backend && npm test ) && ( cd frontend && npm test && npm run build )
```
Expected: backend 23 pass, frontend 13 pass, build clean.

- [ ] **Step 4: Commit**

```bash
cd /Users/tarundewangan/Downloads/Projects/chad/chad_project
git add -A
git commit -m "refactor: drop dead rendr template, add root README"
```

---

## Self-Review Notes (coverage vs spec §3)

- `frontend/` + `backend/` separation → Tasks 1–2. ✅
- `git mv` history preservation → all move tasks. ✅
- Delete `rendr/` → Task 3. ✅
- Root holds only docs/README/git → Task 3. ✅
- Tests/build green from new paths → verification steps in each task. ✅

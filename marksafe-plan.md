# Marksafe — Production Implementation Plan

**Product:** AI safety and quality layer for On-Screen Marking (OSM) and digital evaluation
**Principle:** AI assists, the examiner decides. Every AI output is explainable, validated, and reversible. Every ambiguity falls back to a human.
**Document status:** Plan v2 (production track). Numbers marked *(assumption)* must be confirmed with stakeholders or benchmarked before commitment.

---

## 0. How to read this plan

| Section | Purpose |
|---|---|
| 1–3 | What we are building, for whom, and to what standard |
| 4–8 | Architecture, data, pipelines, ML, and features |
| 9–11 | APIs, frontend, and security/privacy |
| 12–15 | Reliability, observability, testing, and CI/CD |
| 16–19 | Delivery plan, team, risks, go-live |
| Appendix | Capacity model, ADR list, and a "hackathon cut" of this plan |

A note on "no errors": no system is defect-free. Production quality here means **validated inputs, contained failures, human fallback for every uncertain case, and tests that gate every release**. Section 15 defines the gates.

---

## 1. Scope and goals

### 1.1 Goals
1. **Prevent silent evaluation errors:** unmarked answers, partially marked questions, unchecked pages, wrong totals.
2. **Prevent unsafe evaluation:** block or warn on scans that cannot be assessed reliably.
3. **Assist marking:** suggest marks with rubric evidence and confidence, never final marks.
4. **Improve consistency:** surface examiner-consistency signals and question-level disagreement.
5. **Protect high-impact cases:** prioritise borderline results for human review before result lock.
6. **Be accountable:** tamper-evident history of every mark, override, and approval.
7. **Be fast and available** during the evaluation window, including on mobile and with poor connectivity.

### 1.2 Non-goals
- Autonomous final marking.
- Proctoring, surveillance, or labelling examiners as "bad" or candidates as "cheating."
- Replacing the board's existing OSM tool. Marksafe integrates with it or runs alongside it (decision D-01 in §17).

### 1.3 Deployment models to support
| Model | Notes |
|---|---|
| **On-premise / private cloud** (preferred for a board) | Local LLM option, no data leaves the perimeter |
| **Government/sovereign cloud region** | Managed Postgres, object storage, Kubernetes |
| **Pilot SaaS** (tenant-isolated) | Only with synthetic or consented data |

All components must run without public internet access except where explicitly allowed.

---

## 2. Users, roles and permissions

| Role | Can do | Cannot do |
|---|---|---|
| **Examiner** | View assigned scripts, enter/edit marks, accept/reject AI suggestions, dismiss alerts on own scripts (with reason), raise escalation | See other examiners' queues or identities; see candidate identity; change rubrics |
| **Head examiner / moderator** | Review escalations and alert queues, second-mark, approve/override marks (with reason), view examiner-consistency analytics for their subject | Edit audit history; lock results alone for borderline cases |
| **Rubric author** | Draft rubrics, approve rubric versions | Mark scripts |
| **Scan operator** | Upload, rescan, resolve scan holds | View marks |
| **Exam administrator** | Configure exams, thresholds, boundaries, allocation, lock results (with second approver) | Edit or delete audit events |
| **Auditor (read-only)** | Read all history, verify audit chain, export | Any write |
| **Platform admin** | Operate infrastructure | Read scan content or marks (break-glass with logging only) |

**Rules**
- Least privilege via RBAC plus object-level checks (an examiner may only read scripts allocated to them).
- **Two-person rule** for result lock and for any override of a Critical alert.
- **Conflict-of-interest rule:** allocation must exclude examiners from the candidate's school or region *(configurable)*.
- **Candidate pseudonymity:** examiners see script IDs, never names or roll numbers. The mapping lives in a separate, restricted store.

---

## 3. Requirements and service levels

### 3.1 Functional requirements (summary)
| ID | Requirement |
|---|---|
| FR-1 | Ingest scans (JPEG/PNG/TIFF/PDF) in bulk with barcode-based script identification |
| FR-2 | Score every page for integrity; hold unsafe scripts; support rescan with page replacement and history |
| FR-3 | Detect handwriting and print, recognise text with per-line confidence, map regions to questions |
| FR-4 | Show scripts in a marking workspace with question navigation, zoom, overlays and mark entry |
| FR-5 | Detect unmarked/partially marked/unchecked content and total mismatches (Guardian) before submission |
| FR-6 | Suggest marks with evidence and confidence against an approved rubric; examiner decides |
| FR-7 | Rubric builder with approval workflow and versioning |
| FR-8 | Risk-ranked moderation queue with reason, impact and recommended action |
| FR-9 | Borderline protection: pass/fail and grade-boundary impact calculation |
| FR-10 | Examiner-consistency and question-disagreement analytics with minimum sample sizes |
| FR-11 | Tamper-evident audit trail with in-product verification |
| FR-12 | Double/blind evaluation and allocation |
| FR-13 | Mobile-capable PWA with offline marking and safe sync |
| FR-14 | Real-time dashboards for progress, alerts, and time-to-lock |
| FR-15 | Multilingual answer handling (English, Hindi, Marathi at minimum) *(assumption: confirm languages)* |

### 3.2 Service-level objectives *(proposed; confirm with stakeholders)*
| Area | SLO |
|---|---|
| Marking workspace availability | 99.9% during the evaluation window (planned downtime outside it) |
| Marking is never blocked by AI | If OCR/LLM services are down, examiners mark normally; AI features degrade gracefully |
| Mark submission → Guardian alerts visible | p95 < 2 s |
| Page load (first script page visible) | p95 < 1.5 s on office network; < 4 s on 4G |
| Page ingest → QC score available | p95 < 60 s per page |
| Page OCR + question mapping | p95 < 3 min per script *(assumption; benchmark)* |
| Data durability | No acknowledged mark is ever lost. RPO ≤ 5 min for database, zero for acknowledged writes to the audit log (synchronous commit) |
| Recovery | RTO ≤ 30 min for the marking workspace; ≤ 4 h for full platform |
| Accuracy gates | See §15.3 |

---

## 4. Architecture

### 4.1 Logical architecture

```
                  ┌───────────────────────────────────────────┐
                  │ Web app (Next.js) + PWA (Workbox, Dexie)  │
                  └──────────────────┬────────────────────────┘
                                     │ HTTPS (TLS 1.3), OIDC token
                          ┌──────────▼──────────┐
                          │  API gateway / WAF  │  rate limits, mTLS to services
                          └──────────┬──────────┘
        ┌────────────────────────────┼──────────────────────────────┐
        │                            │                              │
┌───────▼────────┐        ┌──────────▼──────────┐        ┌──────────▼─────────┐
│ Core API       │        │ Realtime service    │        │ Auth (Keycloak/    │
│ (FastAPI)      │        │ (SSE/WebSocket)     │        │ OIDC, MFA)         │
└───────┬────────┘        └──────────┬──────────┘        └────────────────────┘
        │  transactional outbox      │ pub/sub
┌───────▼───────────────┐   ┌────────▼────────┐    ┌─────────────────────────┐
│ PostgreSQL (primary + │   │ Message broker  │    │ Object storage (S3/MinIO)│
│ replica), pgvector    │   │ (RabbitMQ/SQS)  │    │ Object Lock (WORM) for   │
└───────────────────────┘   └────────┬────────┘    │ original scans           │
                                     │             └─────────────────────────┘
                 ┌───────────────────┼─────────────────────────┐
        ┌────────▼───────┐  ┌────────▼───────┐        ┌────────▼───────────┐
        │ Ingest/QC      │  │ OCR workers    │        │ Rules & analytics  │
        │ workers (CPU)  │  │ (GPU inference)│        │ workers (CPU)      │
        └────────────────┘  └────────────────┘        └────────────────────┘
                                     │
                          ┌──────────▼──────────┐
                          │ LLM gateway         │  local model or approved API,
                          │ (timeouts, schema,  │  redaction, cache, budget
                          │  validation)        │
                          └─────────────────────┘
```

### 4.2 Technology choices and rationale
| Layer | Choice | Rationale / alternative |
|---|---|---|
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic | Same language as ML stack; strict typing with mypy |
| Database | PostgreSQL 16 (+pgvector) | ACID for marks and audit; row-level security; one system of record |
| Queue | RabbitMQ (or SQS on cloud) with Celery workers, `acks_late`, idempotent tasks | More durable than Redis-only queues; Redis kept for cache and pub/sub |
| Workflow orchestration | Explicit script state machine in Postgres; consider Temporal if workflows grow | Keeps failure states visible |
| Object storage | S3 API (MinIO on-prem) with Object Lock on originals | Immutable evidence, legal defensibility |
| Image tiling | libvips → deep-zoom tiles (DZI/IIIF) | Fast zoom/pan on large scans, low bandwidth |
| OCR (print + detection) | PaddleOCR (PP-OCRv5 family) | Strong detection, multilingual recognition incl. Devanagari |
| OCR (handwriting) | TrOCR (`microsoft/trocr-base-handwritten`, or large) | Line-level handwriting recognition; fine-tune on Indian handwriting |
| Vision-language fallback | Local VLM (e.g., Qwen-VL class) for difficult lines/diagrams *(evaluate)* | Only for low-confidence lines; never sole source for marks |
| LLM | Local (vLLM-served) or approved API behind the LLM gateway | Data residency; provider swap without code change |
| Embeddings | Multilingual embedding model (e.g., bge-m3 / e5-multilingual) | Rubric retrieval and similarity |
| Frontend | Next.js (App Router), TypeScript, Tailwind, Radix primitives | Accessible primitives, custom design system |
| Motion | Framer Motion (`motion`) + GSAP (Flip, ScrollTrigger) | Layout transitions vs. choreographed sequences |
| Viewer | OpenSeadragon (tiles) with SVG/canvas overlay layer | Zoom, pan, region overlays |
| Data fetching | TanStack Query, TanStack Table + Virtual | Caching, optimistic updates, large lists |
| Offline | Workbox, IndexedDB (Dexie), background sync | Field/center connectivity loss |
| Infra | Kubernetes, Helm, Argo CD (GitOps), Terraform | Reproducible environments |
| Observability | OpenTelemetry, Prometheus, Grafana, Loki, Tempo, Sentry | Traces, metrics, logs in one pipeline |
| Secrets/keys | HashiCorp Vault or cloud KMS | Envelope encryption, rotation |

### 4.3 Key architectural rules
1. **Postgres is the source of truth.** Queues carry pointers, never state.
2. **Transactional outbox:** events are written in the same DB transaction as state changes, then published. No lost or phantom events.
3. **Idempotent everything:** every task and API write accepts an idempotency key; retries are safe.
4. **AI never writes marks.** AI writes to `ai_evaluations` and `alerts`. Only a human action creates a mark event.
5. **Fail closed toward humans:** low confidence, validation failure, or service error → "manual", never a guess.
6. **Originals are immutable.** Derivatives (tiles, thumbnails, crops) are regenerable.
7. **Everything is versioned:** rubrics, models, thresholds, risk weights. Every alert/evaluation records the versions used.

---

## 5. Data architecture

### 5.1 Core entities
`exams`, `questions` (tree), `rubrics` (versioned, approval), `scripts`, `pages`, `regions`, `ocr_lines`, `mark_events` (append-only, hash-chained), `ai_evaluations`, `alerts`, `assignments`, `examiner_stats`, `users`/`roles`, `thresholds_config` (versioned), `model_registry`, `scan_holds`, `rescan_history`, `identity_map` (restricted schema).

### 5.2 Rules
- **Mark history:** `mark_events` is append-only with per-script hash chaining and DB triggers forbidding UPDATE/DELETE/TRUNCATE and forks. Current marks are a **derived view** (latest effective event per question).
- **Chain head anchoring:** periodically write the latest chain head hash to a second system (WORM bucket + optional external timestamp) so tail truncation is detectable.
- **Row-level security:** examiners can only select rows for their allocations; enforced in the database, not only in the API.
- **Schemas:** `core`, `ml`, `analytics`, `identity` (restricted), separate DB roles per service.
- **Partitioning:** partition `ocr_lines`, `mark_events` (by exam), and `alerts` for retention and vacuum performance.
- **Migrations:** forward-only, backward-compatible (expand → migrate → contract). Every migration ships with a rollback plan and a tested dry run on a production-sized copy.

### 5.3 Retention and deletion
| Data | Retention *(confirm with board policy/legal)* |
|---|---|
| Original scans | Per board's record-retention rules, then secure deletion |
| Derivatives (tiles/thumbnails/crops) | Regenerable; delete with exam closure |
| Marks and audit history | Long-term (appeals/re-evaluation windows and beyond) |
| OCR text, AI evaluations | Retained with the exam; deletable by exam |
| Logs | 90 days hot, 1 year cold; no personal content in logs |

### 5.4 Storage layout
`s3://<env>-scans/<exam>/<script>/<page>/original.<ext>` (Object Lock, versioned)
`s3://<env>-derived/<exam>/<script>/<page>/tiles/…`, `crops/…`
Encryption: per-exam data key (envelope encryption via KMS); all buckets private; access only via short-lived signed URLs issued after an authorisation check.

---

## 6. Processing pipeline

### 6.1 Script state machine
```
INGESTED ─► QC_RUNNING ─► HELD_RESCAN ──(rescan)──► QC_RUNNING
                     └──► READY ─► ALLOCATED ─► IN_MARKING ─► MARKED
MARKED ─► GUARDIAN_CHECK ─► (alerts?) ─► IN_REVIEW ─► MODERATION ─► APPROVED ─► LOCKED
                       └──► (none) ────────────────────────────────► APPROVED
```
Transitions are explicit, logged, and only performed by the owning service. Illegal transitions are rejected and alarmed.

### 6.2 Ingest and QC (per page)
1. **Upload:** chunked upload with checksum; reject unsupported types, oversize files (limit e.g. 25 MB/page *(assumption)*); antivirus scan.
2. **Identify:** read barcode/QR → script ID; mismatch with expected batch → hold. Duplicate-barcode detection.
3. **Normalise:** deskew, rotation fix (0/90/180/270 detection), denoise, CLAHE, shadow removal; keep the original untouched.
4. **ScanProof:** sub-scores (sharpness, contrast, edge cut-off, skew, illumination, faint ink, blank, duplicate page, sequence). Weighted score plus **hard caps** (a cropped or unreadable page is red regardless of average).
5. **Script health:** any red page holds the whole script. Yellow pages warn the examiner in the workspace.
6. **Rescan flow:** operator replaces page(s); new version stored; old kept; QC re-runs; history recorded.

### 6.3 OCR and layout
```
page image → layout detection (PaddleOCR det, PP-Structure for tables/figures)
          → line crops → classify printed vs handwritten
          → printed: PaddleOCR rec   | handwritten: TrOCR (batched, GPU)
          → confidence fusion per line (det × rec × image quality)
          → question-region mapping (Q markers, indentation, printed grid, ruled areas)
          → persist regions + lines with engine/version/confidence
```
Rules:
- Lines under the manual threshold are never used for suggestions and are flagged for human reading.
- Region mapping is **versioned and reviewable**: examiners can drag region boundaries; corrections feed a training set.
- Diagram/figure regions are stored as images and evaluated only by a diagram module or human.
- Each stage has a timeout, retry with backoff, and a dead-letter queue with alerting.

### 6.4 Reliability of the pipeline
- Idempotency key = (script, page, stage, input hash). Reprocessing the same input yields the same output rows (upsert).
- **Poison message handling:** after N retries, move to DLQ, mark script `NEEDS_ATTENTION`, notify the operator dashboard.
- **Backpressure:** per-queue concurrency limits; GPU workers autoscale on queue depth; ingest throttles when downstream is saturated.
- **Reprocessing tools:** replay by script/page/stage with a reason (audited).

---

## 7. ML and AI engineering

### 7.1 OCR quality programme
| Step | Detail |
|---|---|
| Golden dataset | ≥ 2,000 labelled handwritten lines across regions, schools, pens, and subjects; ≥ 500 per additional language; consented or synthetic-plus-real mix; stratified sampling |
| Metrics | CER/WER per engine and fused; per language/script; per pen/paper/scan-quality bucket |
| Baselines | PaddleOCR-only, TrOCR-only, fused |
| Fine-tuning | Fine-tune TrOCR on labelled lines with augmentation (blur, ink fading, rotation, ruled-line noise); evaluate on a frozen held-out set |
| Language | Devanagari via PaddleOCR multilingual rec; handwritten Hindi/Marathi may need fine-tuned recogniser or VLM fallback *(measure before promising)* |
| Release gate | A new model ships only if it beats the current model on the frozen set **and** does not regress any stratum by more than a set margin |
| Model card | Intended use, data, metrics by stratum, known failure modes, and version, for every model |

### 7.2 Evaluator (Rubric Copilot)
1. **Input:** question text, approved rubric (JSON), OCR lines with IDs and confidences, optional model answer.
2. **Retrieval:** rubric/model-answer chunks from pgvector when rubrics are long.
3. **Prompting:** strict JSON schema output; the model must cite `evidence_line_ids` and short quotes; temperature 0; fixed prompt versions stored.
4. **Validation (server-side, mandatory):**
   - Unknown or duplicate criteria → reject.
   - Marks above the criterion's maximum, or marks without "met" → reject.
   - Evidence line IDs must exist; quoted text must be supported by cited lines (fuzzy match tolerant of OCR noise).
   - Total is **recomputed in code**; a mismatch with the LLM total → reject.
5. **Confidence:** blend of model self-rating, rubric-match strength, and OCR confidence; capped by OCR quality. Calibrate with reliability diagrams; recalibrate each release.
6. **Bands:** normal / review / warning / manual. Below the manual band **no suggestion is shown**.
7. **Numeric checks:** LLM extracts expressions; a restricted arithmetic evaluator (no `eval`) recomputes them.
8. **Alternative-method handling:** if the approach differs but the result is plausible, route to a senior examiner; never auto-zero.
9. **Anchoring-bias control (recommended):** *blind-first mode* — the examiner enters their mark before the AI suggestion is revealed; the suggestion then appears as a check. Configurable per exam; measured in the pilot.
10. **Multi-model consensus (phase 2):** two independent evaluators; disagreement ≥ 2 marks raises priority.
11. **Failure handling:** LLM timeout, provider error, or invalid JSON → retry once, then "AI unavailable"; marking continues.
12. **Governance:** every evaluation stores model, prompt version, rubric version, inputs hash, and outputs.

### 7.3 LLM gateway
- Central service: timeouts, retries, circuit breaker, rate limits, budget caps, response caching (keyed by input hash), PII redaction, and per-request logging *without* answer text in logs.
- Provider abstraction so local and hosted models are interchangeable.
- Prompt-injection defence: student text is treated as data; the system prompt states this; output is schema-validated so injected instructions cannot change marks.

### 7.4 MLOps
- Model registry (versions, metrics, artefacts, approval status).
- Shadow deployment: new models run in parallel, outputs compared, not shown.
- Canary rollout by exam/subject; instant rollback to the previous model.
- Drift monitoring: OCR confidence distribution, manual-band rate, rejection rate of LLM outputs, AI–examiner agreement, per stratum.
- Human corrections (edited OCR lines, region fixes, overridden suggestions) flow into a labelled store for future fine-tuning, after privacy review.

### 7.4a Fairness and bias
- Report accuracy by language, handwriting style bucket, region/school type, and scan quality.
- Investigate any stratum whose OCR CER or AI-vs-examiner agreement is materially worse; adjust thresholds so those cases route to humans rather than being silently disadvantaged.
- Consistency analytics are framed as signals with sample sizes; no automated action against examiners.

---

## 8. Feature specifications and acceptance criteria

### F1 Zero-Missed-Answer Guardian
- **Rules:** R1 attempted-but-unmarked (Critical); R2 zero-with-visible-response (High); R3 partial subparts (High); R4 sequence gap (Medium); R5 unchecked supplementary/graph page (Critical); R6 total mismatch (Critical); R7 mark out of range (High).
- **Attempted test:** ink and text, or overwhelming ink even if OCR is empty (prefer a reviewable false alarm to a silent miss).
- **Behaviour:** runs on every mark submission and before submission of the script; blocks final submission while Critical alerts are open unless dismissed with reason (audited, second approval for Critical).
- **Acceptance:** recall ≥ 99% on injected missed-answer test scripts; false-alert rate ≤ 5% of alerts dismissed as "not an issue" in pilot *(targets to agree)*; alert p95 < 2 s.

### F2 ScanProof
- Score, sub-scores, band, and action per page; script-level rollup; explanation in the UI.
- **Acceptance:** ≥ 95% recall on synthetically degraded defects (blur, crop, rotation, shadow, faint, duplicate, missing page); ≥ 90% agreement with human QC on a sample of real scans; thresholds configurable per scanner profile.

### F3 Evidence-based Rubric Copilot
- Suggestion card: marks, met/missing criteria, evidence highlighted on the page, confidence, reason for not full marks, alt-method flag; actions Accept / Edit / Reject / Escalate.
- **Acceptance:** 100% of shown suggestions pass server validation; measured mean absolute error and ±1-mark agreement reported per subject; no suggestion shown below manual band.

### F4 Examiner Consistency Monitor
- Per examiner × question: mean, full-mark rate, zero rate, partial-mark rate, time per answer, rolling drift; comparisons with calibration and peers.
- **Rules:** minimum sample size (e.g., n ≥ 30) before any flag; effect size and confidence displayed; wording is "consistency signal"; no automated consequence.
- **Acceptance:** simulated drift injected into test data is detected within a defined number of scripts; no flags below minimum n.

### F5 Borderline Result Protection
- Distance to pass and grade boundaries, marks at stake from unresolved alerts, impact statement ("Fail → Pass possible").
- **Acceptance:** 100% of scripts within N marks of a boundary with any open alert appear in the priority queue; impact calculation verified by unit tests against hand-computed cases.

### F6 Smart Moderation Queue
- Buckets Critical/High/Medium/Low; risk score with visible contributions; bulk assign; SLA timers; reason panel ("What / Why / Next action").
- **Acceptance:** moderators can clear Critical items via keyboard; queue reorders live without full reload.

### F7 Real-time dashboards
- Scripts by state, alerts by severity, examiner progress, time-to-lock forecast, scan holds, DLQ depth. Every widget links to an action list.

### F8 Similarity review assistance
- Embedding and n-gram overlap per question across a cohort; only high-threshold pairs surfaced; side-by-side overlap view; labelled "for human review"; access restricted to moderators.
- **Acceptance:** documented threshold from labelled paraphrase/copy data; reviewers can dismiss with reason.

### F9 AI Rubric Builder
- Question paper → proposed criteria and marks summing to the maximum → author edits → approval → immutable version. Unapproved rubrics cannot drive suggestions.

### F10 Evaluation summaries
- Per-script and per-question summaries built from stored data; each sentence traceable to data (counts, alerts, criteria).

### F11 Audit timeline
- Timeline UI per mark; "Verify chain" runs server-side verification and displays range verified; export as signed PDF/JSON for appeals.

### F12 Double / blind evaluation
- Configurable sampling and allocation to a second examiner; differences ≥ threshold auto-route to moderation; second examiner cannot see the first's mark.

### F13 Diagram evaluation *(phase 2)*
- Element detection (labels/parts) with a vision model; output limited to suggestions with highlighted evidence; human decision required.

### F14 Multilingual handling
- Language detection per line; language-specific recogniser; rubric matching via multilingual embeddings; low-confidence → manual.

### F15 Offline mobile marking
- Encrypted local storage of assigned scripts (compressed tiles) and pending marks; queued events with client timestamps and device IDs; server is authoritative on sync; conflicts route to moderation; remote wipe/expiry of cached scripts.

---

## 9. API and integration design

- **Style:** REST + JSON, OpenAPI as the contract, versioned under `/v1`; generated TypeScript client.
- **Errors:** RFC 7807-style problem details with `request_id`; no stack traces or internals.
- **Idempotency:** `Idempotency-Key` header on all POST/PUT that create marks, decisions, or uploads.
- **Concurrency:** optimistic locking (`If-Match`/version) on marks and rubrics; conflicts return 409 with the current state.
- **Pagination:** cursor-based; stable ordering.
- **Rate limiting:** per user and per IP at the gateway; stricter on auth and upload.
- **Realtime:** SSE for dashboards; WebSocket for marking-session presence; every realtime message has an ID for de-duplication and replay from a last-event ID.
- **Integration with the existing OSM tool:** (a) event import (marks, timestamps) via secure webhook/queue, or (b) Marksafe hosts the marking console. Adapter isolates the external schema; contract tests run against a stub in CI.
- **Webhooks/exports:** signed payloads (HMAC), retries with backoff, replay endpoint.
- **Backward compatibility:** additive changes only within a version; deprecation window and telemetry on old-version use.

---

## 10. Frontend plan

### 10.1 Design principles: trustworthy, not "AI-styled"
- **Look:** institutional, evidence-first. Off-white paper background, ink text, one deep-navy primary, one restrained ochre accent for focus and evidence; status colours (green/amber/red) always paired with icon and text.
- **Avoid:** gradient hero blobs, glassmorphism, sparkle icons, emoji in UI, generic "AI magic" copy, oversized rounded cards.
- **Type:** IBM Plex Sans (UI), IBM Plex Mono (marks, IDs, hashes, tabular numerals), a serif for long summaries.
- **Shape and depth:** 4–6 px radius, hairline borders, minimal shadow, dense tables where data lives.
- **Copy:** specific and plain ("Q5(b): handwriting detected, no mark recorded"). Every AI element states what it used as evidence and its confidence as a number.
- **Human authority:** primary buttons are examiner decisions; AI content is labelled "Suggestion" and visually secondary.
- **Keyboard-first:** `J/K` next/previous question, `A` accept, `E` edit, `F` flag, `/` search, `?` help overlay.

### 10.2 Design system
- Tokens (colour, spacing, radius, type scale, motion durations) in a shared package; light and dark themes with real dark tokens.
- Components built on Radix primitives for accessibility, restyled; documented in Storybook; visual regression tests (Playwright screenshots or Chromatic).
- Data-dense components: virtualised tables, filter bars, status chips, evidence highlights, health bar, timeline, heatmap.

### 10.3 Motion plan
| Purpose | Tool | Rule |
|---|---|---|
| Panel/route transitions, presence | Framer Motion | 150–250 ms, ease-out; short fade + 8 px shift |
| List reflow when alerts resolve | Framer Motion `layout` | Only when it explains a change |
| Queue re-prioritisation | GSAP Flip | Rows glide to new positions |
| Health bar and sub-score reveal | GSAP timeline | Plays once on load |
| Evidence focus | Framer Motion | Pan/zoom to the exact line; one subtle pulse |
| Audit timeline draw | GSAP ScrollTrigger | On scroll into view |
| Landing/pitch story | GSAP ScrollTrigger (+ optional smooth scroll) | Landing only, never in the workspace |
- Global reduced-motion support via `prefers-reduced-motion` (Framer's `useReducedMotion`, GSAP `matchMedia`).
- No animation on data-entry or mark fields; no motion that delays a decision.
- GSAP is now available without licence fees including plugins *(verify current licence terms before shipping)*.

### 10.4 Screens
Overview dashboard · Script intake and holds · Marking workspace · Alert detail · Moderation queue · Borderline review · Consistency analytics · Rubric builder · Audit timeline · Allocation · Settings/thresholds · Admin.

**Marking workspace (three panes):** question navigator with status; viewer with overlays and evidence highlights; right panel with mark entry, suggestion (rubric checklist, confidence, "why not full marks"), decisions, notes. Yellow pages show a banner; red pages cannot be marked until the hold is resolved.

### 10.5 Frontend engineering standards
- TypeScript strict, ESLint, Prettier; generated API types; Zod validation at boundaries.
- Error boundaries per pane; a failed pane never blanks the workspace.
- Optimistic UI for marks with server-confirmed state, rollback on conflict, and visible "saved/pending/failed" indicator.
- **Performance budgets:** initial JS for the workspace route ≤ 250 KB gzip; LCP ≤ 2.5 s on mid-range devices; INP ≤ 200 ms; tiles prefetched for next question. Enforced by Lighthouse CI.
- **Accessibility:** WCAG 2.2 AA; axe in CI with zero serious/critical issues; keyboard and screen-reader pass on key flows; visible focus; colour is never the only signal.
- **Security:** strict CSP, no third-party scripts, SRI where unavoidable, `httpOnly` secure cookies or token handling per OIDC best practice, no secrets in bundles, dependency audit in CI.
- **Offline PWA:** service worker caches app shell and assigned tiles; IndexedDB encrypted with a key derived from the session; sync with idempotency keys; clear UI for pending items; automatic purge after logout or expiry.
- **i18n:** message catalogues from day one (English, Hindi; add Marathi), locale-aware numerals, no text baked into images.

---

## 11. Security, privacy and compliance

### 11.1 Threat model (STRIDE summary)
| Threat | Example | Controls |
|---|---|---|
| Spoofing | Stolen examiner credentials | OIDC, MFA, short sessions, device binding for offline, IP/network policy |
| Tampering | Editing a mark after the fact | Append-only chained events, DB triggers, WORM anchoring, two-person rule |
| Repudiation | "I did not change that" | Signed, timestamped events with actor and reason |
| Information disclosure | Leaked scans or identities | Encryption, signed URLs, pseudonymity, RLS, restricted `identity` schema, DLP on exports |
| Denial of service | Flooding uploads | Rate limits, quotas, autoscaling, WAF, queue backpressure |
| Elevation of privilege | Examiner reading peers' scripts | RBAC + row-level security + object-level checks + tests |
| Prompt injection | Student text instructs the AI | Data/instruction separation, schema validation, human decision |
| Supply chain | Malicious dependency/model | Pinned versions, hashes, SBOM, model checksums, private registry |

### 11.2 Controls
- **Identity:** OIDC with MFA for all staff; role claims; session timeouts; break-glass access for platform admins with approval and alerts.
- **Encryption:** TLS 1.3 in transit, mTLS between services; AES-256 at rest; envelope keys per exam; key rotation.
- **Secrets:** in Vault/KMS, never in images or Git; short-lived credentials.
- **Data minimisation:** examiners see pseudonymous IDs; analytics are aggregated; LLM prompts contain only the answer text, question, and rubric.
- **LLM data handling:** local model by default; if a hosted API is used, only under a contract that prohibits training on data and with data-residency approval; no personal identifiers in prompts; prompt/response logs excluded from general logs.
- **Auditability:** all reads of sensitive data logged; audit log immutable; regular chain verification job with alerting.
- **Application security:** input validation, output encoding, upload scanning, SSRF protections, dependency scanning (`pip-audit`, `npm audit`, container scans), SAST, secret scanning, annual (and pre-launch) third-party penetration test.
- **Privacy law:** design to India's Digital Personal Data Protection Act, 2023 and its rules *(confirm current commencement and obligations with legal counsel; I am not a lawyer)*: purpose limitation, consent/lawful use as applicable, retention limits, breach notification process, data-principal request handling, and a named data-protection contact. Complete a DPIA before pilot.
- **Physical/ops:** hardened base images, non-root containers, read-only filesystems, network policies (default deny), vulnerability patching SLAs.

---

## 12. Reliability and operations

### 12.1 High availability
- Kubernetes with ≥ 3 nodes across failure zones; API and worker deployments with PodDisruptionBudgets and autoscaling.
- PostgreSQL primary with synchronous replica for the audit-critical path, streaming replica for reads, WAL archiving for point-in-time recovery.
- Message broker clustered; object storage with replication.
- **Graceful degradation matrix**

| Failure | Behaviour |
|---|---|
| OCR/GPU down | Existing scripts stay markable; new pages queue; Guardian falls back to ink-only signals with "OCR unavailable" note |
| LLM down | No suggestions; marking and Guardian unaffected |
| Realtime down | Dashboards poll |
| Queue down | Uploads accepted and stored; processing resumes on recovery (outbox) |
| Replica lag | Reads for mark-critical views go to primary |
| Region/zone loss | Failover per DR plan |

### 12.2 Backup and DR
- Continuous WAL archiving, daily base backups, encrypted, stored separately.
- Monthly restore drills with integrity verification (including audit chain verification after restore).
- DR runbook with RPO/RTO targets; annual full failover exercise.

### 12.3 Capacity and performance
- Load model in Appendix A. Load tests simulate the peak evaluation window (concurrent examiners, upload bursts, OCR backlog, dashboards).
- Autoscaling on queue depth (workers) and request latency (API). GPU pool sized from measured pages/second per GPU.

### 12.4 Change management
- Freeze windows around exam evaluation peaks; only critical fixes with two approvals.
- Feature flags (per exam/subject) for new AI capabilities; instant disable.

---

## 13. Observability

- **Tracing:** OpenTelemetry across gateway → API → workers → model services; trace IDs in every log and error response.
- **Metrics (examples):** queue depth and age, pages/sec per stage, OCR confidence distribution, manual-band rate, LLM rejection rate, alerts raised/dismissed by rule, alert latency, mark-save latency, offline sync backlog, audit-chain verification status, DLQ depth.
- **Business dashboards:** scripts by state, time-to-lock forecast, scan holds by scanner, dismissal rate by rule (feeds threshold tuning).
- **Alerting:** SLO burn-rate alerts; page for data-integrity signals (chain break, sync conflicts spike, DLQ growth); low-noise routing to on-call.
- **Logging:** structured JSON; no answer text, no identities; retention as in §5.3.
- **Runbooks:** each alert links to a runbook (symptoms, checks, actions, escalation).

---

## 14. Environments and CI/CD

### 14.1 Environments
`local` (Docker Compose) → `dev` → `staging` (production-like, synthetic data, load tests) → `preprod/UAT` → `production`. Production data never flows down; only synthetic or consented, de-identified data is used elsewhere.

### 14.2 Pipeline gates (every PR and release)
1. Lint/format: `ruff`, ESLint/Prettier.
2. Types: `mypy --strict`, `tsc --noEmit`.
3. Unit tests with coverage ≥ 90% on core logic; mutation testing on Guardian, risk, and audit modules.
4. Database: apply all migrations to real Postgres; run immutability, chain-guard, and RLS tests; concurrency test (parallel inserts cannot fork a chain).
5. API contract tests (OpenAPI schemathesis/property tests) and integration tests against ephemeral services.
6. Frontend: component tests, Playwright end-to-end (mark → alert → resolve → audit), axe accessibility, Lighthouse budgets, visual regression.
7. Security: dependency audit, SAST, secret scan, container scan, SBOM, licence check.
8. ML gate (nightly and on model change): OCR CER on golden set, Guardian recall on injected set, LLM validation pass rate, calibration error.
9. Performance smoke: k6 baseline on staging.
10. Signed artefacts, immutable tags, GitOps deployment (Argo CD), automated rollback on failed health checks.

### 14.3 Release strategy
- Blue/green or canary for API; canary by exam for ML models.
- Database migrations decoupled from code deploys (expand → migrate → contract).
- Every release has a rollback plan, verified in staging.

---

## 15. Testing strategy

### 15.1 Test pyramid
| Level | Focus |
|---|---|
| Unit | Rules, scoring, validation, hashing, math evaluator, state machine |
| Property-based | Random question trees/marks: Guardian never crashes and totals reconcile; audit verify detects any mutation |
| Integration | API + DB + queue + object store; outbox delivery; idempotent retries |
| Contract | OpenAPI; OSM adapter stub |
| End-to-end | Real browser flows on staging with seeded scripts |
| ML evaluation | Golden sets, stratified metrics, calibration, regression gates |
| Non-functional | Load, soak, chaos (kill workers/DB replica/GPU), failover, backup restore |
| Security | SAST/DAST, authz matrix tests, pen test |
| Accessibility/usability | axe, keyboard/screen-reader, moderated usability tests with real examiners |
| UAT | Board-defined scenarios and sign-off |

### 15.2 Test data
- **Synthetic generator** producing scripts with known ground truth: injected missed answers, partial subparts, total mismatches, degraded scans (blur, crop, rotation, shadow, faint ink, duplicates), and rubric-mapped answers.
- **Real, consented, de-identified samples** for OCR and calibration, under the DPIA.
- Fixtures versioned; ground truth stored with expected alerts.

### 15.3 Proposed acceptance thresholds *(agree with stakeholders)*
| Metric | Gate |
|---|---|
| Guardian recall on injected misses | ≥ 99% |
| Guardian dismissed-as-false rate | ≤ 5% (pilot) |
| ScanProof defect recall (synthetic) | ≥ 95% |
| OCR CER on golden set | Set from baseline; no regression per stratum > agreed margin |
| Shown AI suggestions passing validation | 100% |
| AI ±1-mark agreement with examiners | Reported per subject; threshold set from pilot, not assumed |
| Audit chain verification | 100% pass, including after restore |
| Authorisation matrix tests | 100% pass |
| Alert latency p95 | < 2 s at target concurrency |
| Zero open critical/high vulnerabilities at release | Required |

### 15.4 Chaos and failure drills (before go-live)
Kill an OCR worker mid-page; take the GPU pool offline; drop the replica; inject a poisoned page; corrupt a queue message; simulate clock skew on a mobile device; attempt to alter an audit row; run a full restore. Expected outcomes are documented and asserted.

---

## 16. Delivery plan

### 16.1 Team *(minimum viable production team)*
| Role | Count |
|---|---|
| Tech lead / architect | 1 |
| Backend engineers | 2–3 |
| ML engineers (OCR, evaluator) | 2 |
| Frontend engineers (design-system capable) | 2 |
| Product designer / UX researcher | 1 |
| DevOps/SRE | 1 |
| QA/SDET | 1 |
| Security engineer (part-time) | 0.5 |
| Product owner with exam-domain access | 1 |
| Domain advisors (senior examiners, exam controller) | on call |

### 16.2 Phases *(≈ 22–26 weeks with the team above; assumption)*
| Phase | Weeks | Deliverables | Exit criteria |
|---|---|---|---|
| **0 Discovery** | 1–2 | Workflow mapping with examiners, data access agreement, threat model, DPIA start, decisions D-01…D-10, success metrics | Signed scope, data plan, and gates |
| **1 Foundations** | 3–5 | Repos, CI/CD, IaC, environments, auth/RBAC, DB schema and migrations, audit chain, design tokens, synthetic data generator | CI gates green; authz matrix tests pass; chain-guard tests pass on real Postgres |
| **2 Ingest and ScanProof** | 6–8 | Upload, barcode, normalisation, QC scoring, holds/rescan, tiling, intake UI | ScanProof recall gate met on synthetic; rescan flow tested |
| **3 OCR and mapping** | 8–12 | PaddleOCR + TrOCR pipeline, fusion, region mapping, golden dataset, fine-tune baseline, model registry | CER report by stratum; DLQ/backpressure verified under load |
| **4 Marking workspace + Guardian** | 10–15 | Workspace, mark entry, offline foundations, Guardian R1–R7, alert UI, audit timeline | Recall gate met; Playwright e2e green; axe clean |
| **5 Rubric Copilot** | 14–19 | Rubric builder and approval, retrieval, LLM gateway, evaluator + validation, confidence calibration, blind-first mode | 100% validation pass on shown suggestions; calibration report |
| **6 Moderation, risk and analytics** | 17–21 | Risk scoring, borderline protection, queue, consistency monitor, dashboards, double evaluation, allocation | Queue accuracy on seeded scenarios; drift detection test passes |
| **7 Hardening and pilot** | 21–26 | Load and chaos tests, pen test, DR drill, runbooks, training, UAT, limited pilot on a real (approved) subset | All gates in §15.3 met; pilot review; go/no-go |

Phases overlap by design (frontend and ML proceed in parallel once contracts are set in Phase 1).

### 16.3 Definition of done (every feature)
Typed and validated at boundaries; failure modes documented and handled; unit, integration, and e2e tests for happy and failure paths; accessibility and performance budgets met; metrics, logs, alerts, and runbook entry added; security review done; feature flag and rollback plan; documentation updated; demonstrated to a domain expert.

---

## 17. Key decisions to lock early (ADR list)

| ID | Decision | Options |
|---|---|---|
| D-01 | Integrate with existing OSM vs. host the marking console | Adapter/webhook vs. own console |
| D-02 | Deployment target | On-prem, sovereign cloud, hybrid |
| D-03 | LLM hosting | Local (vLLM) vs. approved API |
| D-04 | Blind-first vs. AI-visible marking | Per exam configurable |
| D-05 | Languages in scope for v1 | English, Hindi, Marathi, others |
| D-06 | Queue technology | RabbitMQ vs. SQS vs. Kafka |
| D-07 | Identity provider | Keycloak vs. board's IdP |
| D-08 | Retention periods and deletion policy | Legal input |
| D-09 | Thresholds and gates ownership | Who approves changes |
| D-10 | Pilot scope | Subjects, volume, centres |

Each decision is recorded as an ADR with context, options, and consequences.

---

## 18. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Handwriting OCR accuracy too low on real scripts | High | High | Confidence gating; golden set early (Phase 3); fine-tuning; VLM fallback; humans read low-confidence lines |
| Indian-language handwriting underperforms | High | Medium | Measure early; scope languages honestly; route to manual |
| False alerts erode examiner trust | Medium | High | Two-signal attempted test; track dismissal rate per rule; tune thresholds; show reasons |
| Examiner resistance to analytics | Medium | Medium | "Consistency signal" framing; involve examiners in design; no automatic consequences |
| AI anchoring bias affects marks | Medium | High | Blind-first mode; measure in pilot |
| Data access delays (real scripts) | High | High | Start Phase 0 immediately; use synthetic data meanwhile; DPIA early |
| Scanner variability breaks QC thresholds | Medium | Medium | Per-scanner profiles; calibrate on real scans |
| LLM hallucination | Medium | High | Server-side validation; recomputed totals; reject and route to human |
| Privacy incident | Low | Very high | Minimisation, encryption, RLS, logging, breach runbook, pen test |
| Capacity shortfall at peak | Medium | High | Measured throughput; autoscaling; load tests; GPU headroom 2× |
| Scope creep | High | Medium | Feature tiers; change control; flags for phase-2 items |
| Vendor/model licence issues | Low | Medium | Licence review of models and datasets; SBOM |

---

## 19. Go-live checklist

**Product and process**
- [ ] Pilot results reviewed by exam controller; thresholds signed off
- [ ] Examiner training and quick-start guides delivered; support rota defined
- [ ] Rollback and "AI off" switch rehearsed (marking continues without AI)

**Technical**
- [ ] All §15.3 gates green on the release candidate
- [ ] Load test at 1.5× expected peak passed; soak test passed
- [ ] Chaos drills passed; DR restore drill including chain verification passed
- [ ] Penetration test findings closed (critical/high)
- [ ] Secrets rotated; least-privilege access reviewed; break-glass tested
- [ ] Monitoring, alerts, on-call schedule, and runbooks live

**Legal and compliance**
- [ ] DPIA approved; data-processing terms in place; retention configured
- [ ] Breach-notification procedure tested
- [ ] Model cards and validation reports filed

---

## Appendix A — Capacity model (illustrative; benchmark before use)

Inputs *(assumptions)*: 500,000 scripts, 24 pages/script average, evaluation window 21 days, 20 processing hours/day.
- Pages: 500,000 × 24 = **12,000,000**.
- Sustained ingest+OCR rate: 12,000,000 ÷ (21 × 20 × 3,600 s) ≈ **7.9 pages/s** average; plan for **2–3× peaks** (≈ 16–24 pages/s) because scanning is bursty.
- If one GPU sustains *X* pages/s through detection + recognition + TrOCR (**measure X**; if X ≈ 1.5), GPUs needed ≈ 24 ÷ 1.5 ≈ 16, plus 2× headroom for failures and reprocessing.
- Storage: at ~1.5 MB/page original + ~2 MB derivatives ≈ 3.5 MB × 12,000,000 ≈ **42 TB** before replication.
- Concurrent examiners: e.g., 5,000; with ~1 mark action per 40 s → ≈ 125 writes/s peak to the mark service plus Guardian evaluations; well within a tuned Postgres, but load-test the audit-chain advisory lock (per script, so contention is low).
- LLM: suggestions on demand or pre-computed? Pre-compute for allocated scripts to keep p95 latency low; budget tokens per answer and set daily caps.

Recalculate with your board's real numbers; adjust node pools accordingly.

## Appendix B — Hackathon cut of this plan

If you must ship a credible demo before the full programme:
1. **Keep:** Guardian, ScanProof, Copilot with server-side validation, Borderline protection, moderation queue, audit chain (with a "verify" button).
2. **Simulate:** OSM events with a mock marking console; SSO with a simple login; offline mode as a documented design.
3. **Show measurements:** CER on your labelled lines, Guardian recall on injected misses, ScanProof recall on degraded pages, and dismissal rate.
4. **Be explicit about limits:** which languages, which subjects, what's simulated, and what production would add (this plan).
5. **Design polish:** the trustworthy-UI system in §10 with restrained motion; a 5-minute demo script using seeded scenarios.

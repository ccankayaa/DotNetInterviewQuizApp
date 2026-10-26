# Engineering Mastery Academy

> A modern **Turkish / English** computer-science and senior software-engineering interview learning platform. Designed for immediate no-login use, with a route toward Firebase accounts later.
>
> **Geliştiren / Developed by:** [ccankaya](https://github.com/ccankayaa)

![Screenshot/og banner](./app/opengraph-image.png)

## What is included / Neler var?

| Feature | Included |
| --- | --- |
| Multiple-choice question bank | **1,012** bilingual questions: 990 five-dimension concept/decision drills + 22 authored senior scenarios |
| Comprehensive learning map | **198** topic cards, **18** disciplines |
| Deep-dive examples | **38** bilingual annotated field notes and code illustrations |
| Difficulty | 198 fundamental / 396 intermediate / 418 advanced questions |
| Search & filters | Discipline, difficulty, solved/correct/wrong/due-for-review, applied cases, bookmarks, text |
| Exam lab | Learn mode, timed exam, 1–60 randomized questions, 10–90-minute choices, progress map, flags, explanations, discipline debrief |
| Saved progress | Auto-persist answers, bookmarks, attempts, streaks, spaced-repetition due dates, exam history and unfinished exam in origin-scoped browser `localStorage` |
| Data portability | JSON backup / merge import / reset; data shared across `/tr` and `/en` |
| UI | Dark / light / system themes; responsive desktop, tablet and mobile; accessible keyboard interactions |
| SEO | Next.js App Router SSR, independently addressable topic and question pages, localized metadata, alternate links, OG image, sitemap, robots.txt |
| Account | **Not required; not implemented**. No fake registration, syncing or remote AI integration. |

### Coverage / Kapsam

Computer science, algorithms & data structures, operating systems, TCP/IP & networking, cryptography & OWASP security, CLR/IL/JIT/GC/Reflection, C# internals, classic ASP.NET `Global.asax` vs ASP.NET Core `Program.cs`, dependency injection and background jobs, SQL/transaction isolation/Oracle-adjacent concepts, payments and distributed systems, OOP/SOLID/DDD/CQRS, async & concurrency, observability & SRE, testing, DevOps/cloud/Kubernetes, React/browser/SEO/accessibility, AI/LLMs/RAG/agents, and senior engineering leadership.

## Run locally / Yerelde çalıştır

**Requirements:** Node.js 20.9+ (Node 22 LTS recommended), npm. Python 3 is **only** needed if you want to regenerate or validate content data; **deployment doesn't depend on Python**.

```bash
npm install
npm run dev
```

Open `http://localhost:3000` — you will be redirected to `/tr`. Change the language in the top-right corner.

```bash
npm run typecheck        # TypeScript type verification
npm run content:check    # Python content consistency audit (requires Python 3)
npm run build            # production build (no Python dependency)
npm start                # serve production build locally
```

Content is already generated and committed in `data/generated/`; you **do not** have to run Python to deploy.

### Deploy on Vercel / Vercel'e yayınla

1. Create a new GitHub repository, e.g. `engineering-mastery`, and **upload the extracted project files**, not the ZIP file itself.
2. Import that GitHub repository into [Vercel](https://vercel.com/new).
3. Framework preset: `Next.js`. Root directory: `./` (project root). Build command: `next build` (default), output directory: automatic.
4. Set `NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN` in **Production → Environment Variables**. No API key or database is necessary.
5. Deploy, then inspect `/tr`, `/en`, `/tr/questions`, `/en/topics`, `/sitemap.xml` and `/robots.txt`.
6. When switching production domains, local browser progress does **not** transfer automatically because `localStorage` is origin-specific. Use the JSON backup/import flow in Settings.

`.env.example` contains the environment variable template.

### Architecture

```text
app/
  [locale]/
    page.tsx                localized SEO homepage
    topics/                 server-rendered lesson pages
    questions/              server-rendered indexed question detail pages
    practice/               no-login timed exam lab
    dashboard/              anonymous progress analytics
    settings/               themes, language, backup and import
    about/                  editorial policy and sources
  globals.css               responsive token-based theme design
  sitemap.ts, robots.ts     crawlers and discovery
components/                 isolated UI components and providers
lib/
  content.ts                typed knowledge-base lookups
  progress.ts               anonymous storage boundary, schema v2
  coach.ts                  explainable LOCAL heuristic recommendations
  copy.ts                   bilingual UI vocabulary
  routes.ts                 locale-aware paths and SEO URLs
  deep-dives.ts             curated annotated code examples
data/
  raw/                      editable 5-facet authoring data
  deep-dives.json           curated explanatory illustrations
  generated/                deterministic bilingual bank and lookup index
scripts/
  build_content.py          deterministic content generator (stable IDs)
  build_deep_dives.py       hand-authored field-note compiler
  check_content.py         consistency, integrity and bilingual coverage checks
```

### Data persistence, privacy, and the future Firebase login

- This version records **no personally identifying registration details** and has no application database.
- Question answers use `engineering-mastery.progress.v2`; timed or study exam drafts use `engineering-mastery.exam.v1`; appearance preference uses `engineering-mastery.theme.v1`.
- Content/question IDs are stable across regeneration and languages: never change IDs without a migration plan.
- `lib/progress.ts` and `components/progress-provider.tsx` are intentionally isolated. A future Firebase Auth / Firestore or other backend can sync this versioned record format after login, with explicit user consent and conflict-resolution rules.
- In private/incognito sessions or environments that block localStorage, persistence can fail; the UI includes a warning and backup capability.
- **Clearing browser/site data deletes locally saved progress**. It does not sync automatically to another device. Download a backup if you need durability.
- There is **no live AI assistant**. The adaptive study coach is a documented, deterministic scoring heuristic. The AI topic is educational, covering RAG, embeddings, evaluation, agents and prompt-injection risks. A server-side AI feature would require a proper backend/key and abuse controls.

### Editorial clarity / İçerik niteliği

The 990 concept/decision questions are systematically authored from 198 original bilingual lesson cards: one question each on underlying mechanism, best practice, misconception, trade-off, and diagnostics. Three incorrect options are drawn deterministically from **other topics in the same discipline**, rather than being individually edited for every question. The remaining 22 questions are dedicated applied scenarios. This offers comprehensive coverage, but **does not imply 1,012 individually expert-peer-reviewed, unique code-case interviews**. Some easy questions are meant for spaced retrieval rather than senior assessment.

These materials are independently written study notes and **not copied verbatim** from the sites used for reference. Source links are further-reading pointers and do **not** certify that every single generated option has been individually checked against its source. The project is not affiliated with Microsoft, any employer, or any bank; it must not be marketed as an official promotion exam.

### Primary references / Kaynaklar

- [Microsoft .NET managed execution](https://learn.microsoft.com/en-us/dotnet/standard/managed-execution-process)
- [Microsoft .NET DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)
- [Microsoft ASP.NET Core application startup](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/startup)
- [Microsoft .NET Native AOT](https://learn.microsoft.com/en-us/dotnet/core/deploying/native-aot/)
- [Microsoft .NET trimming and Reflection guidance](https://learn.microsoft.com/en-us/dotnet/core/deploying/trimming/fixing-warnings)
- [Microsoft .NET HttpClient guidance](https://learn.microsoft.com/en-us/dotnet/fundamentals/networking/httpclient-guidelines)
- [Microsoft .NET garbage collection](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [OWASP GenAI Top 10 for LLM Applications (2026)](https://genai.owasp.org/resource/owasp-genai-llm-top-10-2026/)
- [MIT Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)
- [Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)
- [Google Site Reliability Engineering](https://sre.google/sre-book/table-of-contents/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Kubernetes](https://kubernetes.io/docs/concepts/)
- [Dotnet Tips (Türkçe)](https://muratdincc.github.io/dotnet-tips-turkish/) (structural inspiration; independent rewritten material)

### Quality checks performed for this package

- Bilingual question/answer/explanation integrity, stable unique IDs, correct answer indices and linked categories/topics checked using `scripts/check_content.py`.
- TSX/TS source files parsed with TypeScript compiler `transpileModule`, and stylesheet parsed with PostCSS.
- **A full `npm install` / `next build` was not executed in the preparation environment** because npm registry DNS/network access was unavailable. Run `npm install && npm run typecheck && npm run build` with network access before publishing. Do not interpret parsing as a successful production build.

---

**Developed by [ccankaya](https://github.com/ccankayaa)** · Independent educational project.
# LocalSnow Product Reset MVP Plan

> **For Hermes:** This is a product/engineering sequencing plan, not an implementation order to execute blindly. Use professional-team-sequencing before coding each slice.

**Goal:** Recenter LocalSnow around the smallest production-ready public product: SEO discovery, professional instructor/school profiles, clean offer setup, client search, direct inquiry, optional protected booking, and a future-safe SkiRelay bridge.

**Architecture:** Do not do a total repo restart unless the codebase blocks the public MVP. Use a clean-room product reset inside the existing repo: preserve infrastructure, brand assets, SEO work, auth, deployment, tests, and selected UI primitives; quarantine marketplace/admin bloat behind legacy boundaries; build the new LocalSnow v1 domain and flows as narrow vertical slices. Treat SkiRelay as a future private supply/liquidity product connected through explicit shared primitives, not as something LocalSnow must implement now.

**Tech Stack:** Existing SvelteKit + TypeScript + PostgreSQL + Drizzle + Tailwind + Vitest/Playwright. Avoid adding new product infrastructure unless it directly serves MVP public UX, trust, SEO, or protected-booking conversion.

---

## 1. Decision

Recommendation: **do not restart from a blank new repo**, and **do not try to clean every existing LocalSnow module before shipping**.

Use the third path:

```txt
clean product reset inside current repo
→ minimal new domain spine
→ production-ready public/client/instructor surfaces
→ manual-backed ops
→ keep old complexity quarantined until proven unnecessary
```

Why:

- Current repo has useful product assets: SvelteKit setup, deployment shape, SEO routes, i18n, tests, brand/static assets, auth pieces, public docs, protected-booking copy, and recent goal-aligned work.
- Current repo is also visibly overbuilt for proof stage: current schema has ~42 tables and includes schools, pricing modes, promo codes, lead payments, deposits, reviews, launch codes, working hours, Google tokens, school relationships, admin audit, and role-transition machinery.
- A blank restart would feel clean for a week, then risk rebuilding the same infrastructure and losing SEO/production scaffolding.
- A full cleanup-first refactor would trap the project in architecture before demand exists.

So: **new product spine, old repo shell**.

---

## 2. Non-negotiable product truth

LocalSnow v1 exists to prove this loop:

```txt
Client searches for a ski/snowboard lesson
→ sees credible local options
→ understands availability/confidence/pricing enough to act
→ contacts directly OR asks LocalSnow for protected help
→ Moli manually coordinates fulfillment behind the scenes
→ if demand overflows or instructor cannot serve, later bridge to SkiRelay
```

LocalSnow is not currently:

- a full marketplace;
- a Stripe Connect payout platform;
- a school management system;
- an instructor calendar SaaS;
- a dynamic pricing engine;
- a CRM;
- a SkiRelay clone;
- an instant-booking platform unless real supply behavior proves it.

---

## 3. MVP scope boundary

### Build now: public/professional surfaces

These must feel polished, mobile-first, and production-grade:

1. Homepage and trust model.
2. SEO resort/sport discovery pages.
3. Instructor/school public profile pages.
4. Client search/filter/listing UX.
5. Professional signup and setup flow.
6. Professional service/offer setup.
7. Availability confidence/requestability surface.
8. Direct inquiry CTA.
9. Protected booking request funnel.
10. Client/instructor transactional emails or notifications.
11. Minimal admin/operator queue for Moli to manually handle requests.

### Do manually now

These should not become product code yet:

- confirming instructors by WhatsApp/phone;
- matching replacements;
- collecting detailed lesson constraints after initial request;
- paying instructors/schools;
- refunds beyond using Stripe/admin/manual process;
- resolving edge-case pricing;
- instructor calendar hygiene;
- school staff coordination;
- SkiRelay job matching;
- advanced SEO content operations.

### Explicitly defer

- Stripe Connect.
- Automated instructor payouts.
- Complex package/promo/conditional pricing.
- Two-way Google Calendar sync.
- Full instant booking.
- SkiRelay private job board integration.
- School admin permissions beyond public school profile/setup.
- Review system unless needed for trust launch.
- Paid featured listings/ads/sponsorships.

---

## 4. Minimal shared domain spine

Design this so SkiRelay can connect later without LocalSnow becoming SkiRelay now.

### Core entities

```txt
Person/User
  id
  email
  phone
  displayName
  locale
  role flags: client, professional, operator/admin

ProfessionalProfile
  userId
  publicSlug
  profileType: independent_instructor | school
  displayName
  bio
  avatar/photo
  languages
  credentials
  resortsServed
  sports
  verificationStatus
  publicStatus: draft | published | hidden

TeachingOffer
  ownerProfileId
  title
  sport
  audience/level
  resort/location scope
  duration options
  group size min/max
  priceMode: from_price | price_on_request
  fromPrice
  currency
  included notes
  visibility: public | hidden

AvailabilitySignal
  ownerProfileId
  seasonStart/seasonEnd
  requestability: available_to_request | limited | request_anyway | unavailable
  optional public note
  updatedAt/freshness

ClientInquiry / BookingRequest
  client contact fields
  profile/offer/resort/sport target
  preferred date(s)
  group size
  level
  message
  path: direct | protected
  status: new | contacted | instructor_pending | confirmed | replacement_needed | refunded | completed | cancelled

OperatorCase
  requestId
  assignedOperator = Moli for now
  nextAction
  internalNotes
  lastContactedAt
```

### Future SkiRelay bridge fields

Do not build the bridge UI yet, but keep data compatible:

```txt
sourceProduct: localsnow | skirelay | manual
sourceRecordId
visibility: public | private | network
bridgeStatus: none | candidate | sent_to_skirelay | accepted | closed
```

---

## 5. Client UX funnel

### Public search path

```txt
Landing / SEO page
→ choose resort/sport/date-ish/group size
→ result list with profiles + offer cards
→ profile/offer detail
→ choose Direct Contact or Protected Booking
```

Acceptance criteria:

- User understands who the professional is.
- User understands where they teach.
- User sees price confidence: from price or price-on-request.
- User sees availability confidence without fake instant-book claims.
- User sees what LocalSnow guarantees and what it does not.
- Mobile list cards are fast to scan: photo, name, resort, sport, languages, from price, availability signal, CTA.

### Direct contact path

```txt
Profile/offer
→ Contact instructor/school
→ short form: name, email, phone/WhatsApp, preferred date, group size, level, message
→ success page explains: direct path, no LocalSnow guarantee, instructor will respond directly
→ notification to professional + copy to LocalSnow optional
```

Acceptance criteria:

- No account required for client.
- No payment.
- No guarantee language.
- LocalSnow can still track demand.

### Protected booking path

```txt
Profile/offer
→ Protected booking request
→ explain promise: LocalSnow confirms requested instructor first; if unavailable, LocalSnow helps reschedule/replacement/refund
→ collect minimum booking info
→ submit request / optional payment step depending launch decision
→ success page explains what happens next and expected response window
→ Moli receives operator case
```

Initial payment decision:

- Best first version: collect protected-booking request and let Moli manually send/trigger payment once details are viable, unless Stripe Checkout already works cleanly enough.
- If Stripe is used from day one, charge LocalSnow only; instructor payout stays manual.
- Do not build Connect/ledger.

---

## 6. Professional signup/setup UX

This is one of the most important v1 surfaces.

### Flow

```txt
Create account
→ choose profile type: independent instructor / school
→ setup stepper
  1. Basic public identity
  2. Resorts and sports
  3. Credentials/languages/trust
  4. Teaching offers
  5. Availability signal
  6. Preview public profile
  7. Publish/request verification
```

Acceptance criteria:

- Mobile-first forms: one decision per screen where possible.
- Save-and-continue, not giant forms.
- Every step explains why the data matters publicly.
- Professionals can preview before publishing.
- Missing data creates clear draft state, not broken profiles.
- Profile can exist before perfect availability/pricing.
- No complex calendar admin in v1; use simple requestability/season/date note.

---

## 7. SEO kept simple

SEO stays important, but it must not own the product architecture.

### Keep now

```txt
/
/resorts
/resorts/[country]
/resorts/[country]/[region]
/resorts/[country]/[region]/[resort]
/resorts/[country]/[region]/[resort]/[sport]
/instructors/[slug]
/schools/[slug]
```

### Avoid now

- exploding lesson/package/promotional silo pages;
- thin AI content at scale;
- every sport + level + lesson-type combination as separate architecture;
- content workflows that require perfect database modeling before any booking.

### SEO principle

Resort pages should be real demand pages:

- resort intro;
- available instructors/schools;
- sports served;
- common lesson types;
- direct/protected CTA;
- internal links to profiles and nearby resorts.

Do not let SEO force advanced pricing/service schemas yet.

---

## 8. Implementation sequence

### Phase 0 — Product freeze and audit

Objective: stop scope drift before code.

Tasks:

1. Create a `docs/localsnow-v1-product-baseline.md` from this plan.
2. Add a hard MVP/non-MVP checklist.
3. Mark current features as `keep`, `reuse`, `quarantine`, or `delete-later`.
4. Do not delete old code in this phase.
5. Decide whether production/dev DB can be reset because there are no real bookings/users worth preserving.

Verification:

- One document clearly states v1 scope.
- Every next PR maps to one MVP goal.

### Phase 1 — Minimal domain model

Objective: create the clean v1 source of truth without fighting every legacy table.

Tasks:

1. Define v1 entities and status enums.
2. Decide whether to replace schema directly or add v1 tables beside legacy tables.
3. Write tests for status transitions and visibility rules.
4. Add migration/schema changes.
5. Seed 3 realistic profiles, 2 resorts, 4 offers.

Verification:

- Tests prove public/private visibility boundaries.
- Seed data supports homepage/search/profile/funnel demos.

### Phase 2 — Professional setup

Objective: make instructor/school onboarding feel mature.

Tasks:

1. Build setup shell/stepper.
2. Add basic identity step.
3. Add resorts/sports step.
4. Add credentials/languages/trust step.
5. Add offer setup step.
6. Add simple availability signal step.
7. Add public preview and publish/draft states.

Verification:

- Playwright/mobile QA can complete setup from empty account to preview.
- Invalid/missing states are obvious and recoverable.

### Phase 3 — Public discovery

Objective: clients can find and understand supply.

Tasks:

1. Build mobile-first instructor/school cards.
2. Build search/filter state for resort, sport, date-ish, group size.
3. Build profile pages from v1 model.
4. Build offer cards.
5. Add availability confidence copy.
6. Preserve canonical SEO page structure.

Verification:

- Mobile viewport is usable without horizontal scroll or hidden CTAs.
- Public pages render from seed data.
- SEO metadata/canonical URLs exist for key pages.

### Phase 4 — Direct inquiry

Objective: prove free directory value.

Tasks:

1. Add direct inquiry form.
2. Store inquiry/request.
3. Notify professional and/or LocalSnow.
4. Add client success page with no-guarantee copy.
5. Add minimal professional dashboard/inbox or email-only handling.

Verification:

- Client can submit without account.
- Request is stored.
- Notification path works or fails visibly in dev.

### Phase 5 — Protected booking request

Objective: prove paid/support value without payment bloat.

Tasks:

1. Build protected booking explanation screen.
2. Build short protected request form.
3. Create operator case for Moli.
4. Add status model for manual coordination.
5. Add success page with response expectation.
6. Decide Stripe now vs manual payment link after Moli qualifies the request.

Verification:

- Client understands guarantee boundaries.
- Moli has enough information to call/message and fulfill manually.
- No false instant-booking promise.

### Phase 6 — Operator cockpit, minimal

Objective: give Moli one place to handle manual work.

Tasks:

1. List new requests/cases.
2. Show client/professional/contact/request details.
3. Allow status updates and internal notes.
4. Add next-action field.
5. Add manual payment/refund/reference fields only if needed.

Verification:

- Moli can run the whole protected-booking workflow manually from one screen.
- No automation is required to fulfill the first bookings.

### Phase 7 — SkiRelay bridge placeholder

Objective: make future connection effortless without building it.

Tasks:

1. Add bridge fields or mapping docs.
2. Add operator action placeholder: `Mark as replacement needed / SkiRelay candidate`.
3. Do not send data to SkiRelay yet.
4. Document exact future API/event shape.

Verification:

- A LocalSnow unserved request can be represented as a future SkiRelay opportunity without schema surgery.

---

## 9. What production-ready means here

Production-ready for v1 does not mean feature-complete. It means:

- no fake promises;
- clean mobile UX;
- clear empty/error states;
- typed forms and server validation;
- protected server actions;
- no secret leakage;
- basic spam/rate-limit protection on public forms;
- transactional email path or operator fallback;
- tested business rules;
- stable SEO URLs;
- basic analytics/funnel events for search → profile → inquiry/protected request;
- deployable build;
- Moli can fulfill manually without guessing what happened.

---

## 10. First PR recommendation

First PR should be a **decision/baseline PR**, not code-heavy:

```txt
docs: define LocalSnow v1 product reset baseline
```

Include:

- MVP scope.
- Non-MVP deferrals.
- LocalSnow/SkiRelay boundary.
- Minimal entity model.
- Client funnel.
- Professional setup funnel.
- SEO boundary.
- Manual operations policy.

After that, implementation should start with either:

1. `feat: add LocalSnow v1 domain spine`, if the existing schema will be evolved; or
2. `feat: add v1 professional setup shell`, if we want to prove UX first using existing/seeded data.

My preference: **professional setup shell first if we want confidence in UX**, domain spine first if current schema actively blocks the forms.

---

## 11. Open decisions for Moli

1. Can the current LocalSnow database be reset if needed, since there are no real bookings yet?
2. Should protected booking charge immediately, or should payment happen manually after Moli confirms the request is viable?
3. Are schools part of v1 public discovery, or do we launch independent instructors first and add schools as public profiles shortly after?
4. What is the first target resort/region for launch-quality SEO and seed supply?
5. What proof threshold decides automation: first booking, 5 bookings, 10 bookings, or repeated manual pain?

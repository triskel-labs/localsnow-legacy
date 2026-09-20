# Provider Onboarding Stage Model

**Status:** founder comments folded; onboarding-only product decision draft
**Owner:** LocalSnow / Moli + Mao
**Purpose:** define the minimum provider onboarding stages, the data each stage collects, why that data exists, and how it supports provider setup, review, and later marketplace/search work without designing the search/results engine in this slice.

This document is meant for GitHub line comments. If a stage, field, or assumption feels wrong, comment directly on that line before we turn it into more UI/schema.

---

## 1. Working principle

Provider onboarding should not be a random form. It should help a snow-sports professional build the first useful LocalSnow provider entity:

```text
trustable profile
+ one primary teaching area
+ one requestable default offer
+ availability/requestability
+ LocalSnow review gate
```

A stage is only justified if it creates at least one of:

- useful public/professional profile data;
- private operator/contact data LocalSnow needs to coordinate safely;
- better client/provider matching inputs;
- pricing or requestability clarity for the first offer;
- date/availability confidence;
- LocalSnow operator review/trust leverage.

Boundary for this slice:

> This document is about the provider onboarding process and data capture. Search result ranking, pricing engine behavior, card design, offer SEO pages, and grouped results need their own later session.

---

## 2. Provider-facing journey

Use five provider-facing stages for the first coherent onboarding model:

```text
Stage 1 of 5 — Profile
Stage 2 of 5 — Teaching area
Stage 3 of 5 — Default offer
Stage 4 of 5 — Availability
Stage 5 of 5 — LocalSnow review
```

Important decision:

> `Client fit` is not a separate first-onboarding stage yet. Ages, levels, group size, language, and lesson-type fit belong inside **Default offer** when they describe the first requestable lesson. Provider-level general capabilities can still exist as defaults, but offer-specific selections narrow or override them.

---

## 3. Stage 1 — Profile

### Meaning

Separates who LocalSnow needs to know internally from what clients should see publicly.

### Data

Collect profile data in two groups.

#### Private personal/operator data

Required for early onboarding:

- legal/personal first name;
- surnames;
- personal email;
- personal phone;
- preferred operator contact channel.

Optional or later:

- IBAN or payout/payment details;
- invoicing/legal details;
- internal-only notes from Moli's call or review.

These fields are for LocalSnow operations and trust checks. They should not leak into public provider cards unless the provider explicitly chooses a public/professional version.

#### Public/professional profile data

Required for early onboarding:

- provider type: independent instructor, school provider, or school-affiliated instructor;
- professional email for lesson/inquiry information, with a “use same as personal” option if appropriate;
- professional phone for lesson/inquiry information, with a “use same as personal” option if appropriate;
- languages the provider can teach in;
- short public bio.

Public display naming rule:

- independent instructor: derive the public display name from personal first name + surname initial, e.g. `Laura M.`;
- school provider: ask for a separate public school/professional name field;
- school-affiliated instructor: default to the independent display-name rule unless the school/provider relationship requires a different public format.

Optional but useful:

- profile photo;
- years of experience;
- school name when the provider is a school;
- school affiliation / professional background;
- public/private contact boundary notes.

Qualification or credential proof is **optional for submission**. It becomes required for LocalSnow to grant a reviewed/trustworthy profile status or badge.

For now, school/provider proof is manual founder judgment: Moli can call or personally text the provider, speak with them, and decide whether they seem truly connected to the claimed professional identity. A stricter school-proof mechanism is intentionally deferred.

### Qualification upload direction

Do not block basic onboarding submission on a qualification PDF. Instead:

- Moli can personally verify qualifications and professional identity by call/text/email while reviewing the provider;
- the app should later provide a protected, authenticated, rate-limited upload endpoint or dashboard prompt for qualification files;
- qualification PDFs should be stored in the Cloudflare bucket/R2 document storage path, not chat or email as the final system of record;
- a provider can remain unreviewed or not receive the reviewed/trustworthy badge until proof is checked.

### Purpose

This data supports:

- profile preview;
- provider trust;
- LocalSnow operator contact;
- qualification follow-up;
- later public listing review.

### Product surfaces affected

- `/dashboard/setup`;
- provider profile preview/page;
- LocalSnow review/operator checks;
- future qualification upload prompt;
- public provider card only after review.

### Readiness meaning

Profile data can make a provider profile-ready, but it does not by itself create a sellable or requestable lesson.

If a provider stalls here, treat them as a warm sales/onboarding lead, not as a failed user. Moli can call or message personally to resolve doubts, help them finish setup, and improve the quality of the provider database.

---

## 4. Stage 2 — Teaching area

### Meaning

Defines the provider's first working resort and broad teaching scope.

### Data

Required for early onboarding:

- one primary resort or operating zone;
- sport(s), e.g. ski, snowboard;
- broad modality/specialty if already clear, e.g. freeride, freestyle, race training.

For now, do **not** allow multiple-resort teaching in the onboarding UI. If onboarding starts from a resort context, the primary resort should be automatically prefilled. If onboarding starts from a generic provider/dashboard route with no resort context, the first teaching-area step should ask for one primary resort instead of pretending it is known.

Later, not now:

- multiple resorts;
- multiple meeting zones inside one resort;
- travel radius;
- preferred home base;
- avoided zones.

### Purpose

This data supports:

- resort + sport eligibility;
- provider routing scope;
- default offer prefill;
- later resort/sport marketplace and SEO surfaces.

### Product surfaces affected

- provider setup route/context;
- provider card context;
- default offer creation;
- resort/sport pages later.

### Readiness meaning

A provider can only be matched to broad marketplace demand once LocalSnow knows their first resort/zone and what they teach.

After this stage, LocalSnow can already have a usable public/provider profile. Even without a saved price/default offer or structured availability, the profile may be shown with request-only copy such as: “This instructor has not published exact availability or a specific offer yet, but you can still send a lesson request. They can reply with confirmation, answers, and price.”

This state is also valuable internally: it lets Moli track warm but incomplete providers and personally enrich the profile through call/message help instead of losing them.

---

## 5. Stage 3 — Default offer

### Meaning

Defines the first requestable lesson/service. This is the bridge from “profile” to “marketplace object”.

The default offer is the fallback offer LocalSnow can use when a client request is broad or underqualified. It is not a permanent ranking priority and it does not design the future search engine.

### Data

Required for early onboarding:

- offer name;
- sport, prefilled from Stage 2 when there is only one obvious sport;
- modality or lesson type if relevant;
- resort or meeting context, prefilled from Stage 2;
- suitable age-group tags;
- suitable level tags;
- minimum students;
- maximum students;
- main duration;
- normal price;
- currency.

Do not treat `private`, `group`, or `family` as separate hard matching primitives yet. They are commercial/industry labels that are usually derived from min/max students plus the offer's audience and copy. The onboarding UI can display or suggest a label, but the durable data should remain the concrete group-size and fit fields.

Optional but important soon:

- group pricing tiers;
- duration packages;
- 3h half-day preset;
- 6h full-day preset;
- included/not included notes;
- meeting point;
- provider notes about bad-fit requests.

### Tag/taxonomy selection rule

For v1, keep detailed client-fit taxonomy at the **offer level**, not duplicated at provider/profile level.

Cleaner split:

```text
provider/profile level
→ identity, languages, one primary resort, sports, broad professional summary

offer level
→ ages, levels, min/max students, lesson type/modality, duration, price, cancellation/refund policy reference
```

This avoids asking the provider for the same ages/levels twice and keeps the model easier to maintain. If LocalSnow later needs profile-level defaults, add them only after real offer data shows repetition; do not start with inherited defaults unless UX proves they save work.

### Purpose

This data supports onboarding and later product behavior by capturing:

- a first requestable lesson;
- provider/client fit qualification;
- initial pricing clarity;
- fallback offer data for broad client requests;
- concrete data the later search/results system can combine.

It does **not** settle search ranking, result-card design, grouped provider cards, or offer SEO pages.

### Product surfaces affected

- provider setup default-offer step;
- provider profile offer preview;
- client request/booking intake later;
- later search/result/card work after separate review.

### Readiness meaning

A provider becomes price-ready when at least one default offer has enough detail to calculate or show a credible price.

---

## 6. Stage 4 — Availability

### Meaning

Defines whether the provider has structured availability LocalSnow can use, and what happens when they do not.

### Data

Required for early onboarding:

- whether the provider will set up the existing SkiRelay-style availability calendar now;
- broad working days/windows if they know them;
- notice needed before a lesson;
- response-time expectation;
- whether LocalSnow can still route a structured request when no slot-level availability is set.

Optional or later:

- offer-specific availability.

Use the mature SkiRelay-style availability model as the direction for structured availability:

- season start/end;
- weekly working days;
- working-hours window;
- availability/blocked-date records;
- optional timed blocks;
- Google Calendar connection/sync for blocks when connected.

This is more production-ready than inventing multiple abstract availability modes. LocalSnow should adapt that pattern, then layer client-facing request/booking copy on top.

### Product rule

Do not ask providers to choose between many abstract “availability types”. Prefer this practical model:

```text
structured availability exists
→ show stronger availability/requestability signals

structured availability missing or incomplete
→ do not show slot confidence;
→ still allow the client to send a structured date/window request;
→ route it according to the current LocalSnow contact boundary.
```

The fallback should feel like: “This instructor does not show exact availability yet, but you can still send a lesson request with your dates and lesson details.”

“Send a request directly” is client-facing shorthand for a direct request about that instructor/offer. Operationally, LocalSnow still routes and tracks the request; it does not expose provider contact or bypass LocalSnow by default.

Use this narrow request/payment display rule until the fuller search/results engine is reviewed:

```text
no structured availability + no price/offer
→ show request-only

no structured availability + price/offer exists
→ show paid guaranteed-booking path plus request path;
→ paid copy means: if this instructor cannot do it, LocalSnow tries to find a suitable alternative or refunds;
→ request copy means: send lesson details without exact availability confidence.

structured availability + price/offer exists
→ show normal paid guaranteed-booking path as primary;
→ optionally keep request as a secondary question/inquiry path, not as a manipulative upsell trap.
```

Open copy/design boundary: the exact labels, order, and microcopy for these options need their own UI review. The product truth is that paid booking signals the client wants LocalSnow to make the lesson happen; request signals interest or a question without the same guarantee/commitment.

### Purpose

This data supports:

- date/search confidence later;
- fewer bad-fit timing requests;
- client-facing requestability signals;
- later protected booking/confirmation flow.

### Product surfaces affected

- provider dashboard availability;
- client request/booking calendar later;
- LocalSnow operator follow-up;
- provider notification/routing later.

### Readiness meaning

Availability makes the provider more requestable and prepares booking-ready behavior, but exact paid booking rules can come later.

---

## 7. Stage 5 — LocalSnow review

### Meaning

Defines whether LocalSnow is comfortable exposing/requesting the provider publicly.

This is mostly an operator/founder review gate in v1, not a heavy provider form.

### Data

Required for early onboarding:

- internal review status;
- private/personal data sanity check;
- public/professional profile sanity check;
- qualification/proof status;
- default offer sanity check;
- contact privacy boundary;
- public visibility decision;
- reviewed/trustworthy badge decision.

Provider-facing Stage 5 should be simple: a “thank you / setup complete” confirmation, not a complex form. The message should say the profile is set up, LocalSnow may contact them if something important is missing, and the reviewed/trustworthy status appears after LocalSnow checks everything.

Optional or later:

- provider correction notes;
- trust badge/reviewed reason;
- publication history;
- compliance/legal notes;
- payout/payment readiness notes.

### Purpose

This data supports:

- preventing weak or unreviewed listings;
- protecting provider and client trust;
- deciding public listing/requestability;
- keeping LocalSnow-routed contact boundaries clear;
- deciding whether a reviewed/trustworthy profile status is allowed.

### Product surfaces affected

- public visibility;
- provider card/listing status;
- LocalSnow operator workflow;
- future provider approval queue;
- future qualification upload/review flow.

### Readiness meaning

LocalSnow review is a publication/requestability/trust gate. It is not the same thing as full booking/payment readiness.

Paid booking also needs a platform-wide cancellation/refund policy. Do not ask each provider to configure cancellation policies in this onboarding slice. Provider-specific notes can inform manual operations, but the public client promise should be governed by LocalSnow’s platform policy so liability is not fragmented across inconsistent provider settings.

---

## 8. Onboarding data ownership model

Avoid duplicated taxonomy between provider profile and offers in v1.

Use this ownership rule:

```text
provider profile owns
→ identity, public/private contact boundary, languages, one primary resort, sports, broad professional summary

default offer owns
→ ages, levels, min/max students, lesson type/modality, duration, price, request/booking fit
```

This prevents contradictory UX such as asking “what levels do you teach?” on the profile and then asking the same thing again on every offer. The profile can still communicate a broad professional summary in prose, but structured client-fit tags should start at offer level.

This is an onboarding data rule only. It does not design the final result ranking or card UI.

---

## 9. What is intentionally not in first onboarding

Do not block first onboarding on:

- multiple-resort teaching;
- full offer catalog;
- search ranking or result-card engine;
- SEO offer expansion;
- Stripe/payment/payout setup;
- provider-selectable cancellation/weather/legal policy options;
- complete booking workflow;
- full calendar sync;
- provider CRM/marketing automation;
- automated school ownership/proof workflow.

Those can come after the default offer + availability path is proven.

Exception: before paid guaranteed booking goes live, LocalSnow needs a platform-wide cancellation/refund policy. That belongs to the booking/payment/legal slice, not to first provider onboarding as provider-selectable options.

---

## 10. Current implementation boundary

The current implementation is still a tracer bullet:

- the stage model exists;
- the setup route can display Stage X of 5;
- the existing physical setup form is still mostly the older three-step form;
- the real personal/professional profile split is not built yet;
- the qualification upload endpoint/dashboard prompt is not built yet;
- the real Stage 3 default-offer form is not built yet;
- the LocalSnow review workflow is not built yet;
- search/results/offers/pricing engine work is deferred to a separate session.

---

## 11. Review questions

Please comment directly on this document if you disagree with any assumption.

Especially review:

1. Does the private personal data vs public professional data split match how you want provider onboarding to feel?
2. When should LocalSnow replace Moli's manual call/text school/provider proof with a stricter proof mechanism?
3. For generic onboarding routes with no resort context, is asking for one primary resort as the first teaching-area step enough?
4. Is the cleaner taxonomy split right for v1: broad sports/languages/resort on provider profile, detailed ages/levels/client-fit only on offers?
5. Is the Stage 5 provider-facing message enough: setup complete, LocalSnow may contact you, reviewed/trustworthy badge comes after checks?

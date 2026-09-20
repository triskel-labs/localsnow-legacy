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

- public/professional display name;
- provider type: independent instructor, school provider, or school-affiliated instructor;
- professional email for lesson/inquiry information, with a “use same as personal” option if appropriate;
- professional phone for lesson/inquiry information, with a “use same as personal” option if appropriate;
- languages the provider can teach in;
- short public bio.

Optional but useful:

- profile photo;
- years of experience;
- school name when the provider is a school;
- school affiliation / professional background;
- public/private contact boundary notes.

Qualification or credential proof is **optional for submission**. It becomes required for LocalSnow to grant a reviewed/trustworthy profile status or badge.

For schools, LocalSnow still needs a separate proof concept: what proves the person really represents or owns the school is not decided in this slice.

### Qualification upload direction

Do not block basic onboarding submission on a qualification PDF. Instead:

- Moli can personally verify qualifications by call/email while reviewing the provider;
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

---

## 4. Stage 2 — Teaching area

### Meaning

Defines the provider's first working resort and broad teaching scope.

### Data

Required for early onboarding:

- one primary resort or operating zone;
- sport(s), e.g. ski, snowboard;
- broad modality/specialty if already clear, e.g. freeride, freestyle, race training.

For now, do **not** allow multiple-resort teaching in the onboarding UI. The primary resort should be automatically prefilled when the onboarding starts from a resort context.

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

Use a reusable tag-selector UI for age groups, levels, sports/modalities, and similar taxonomies.

Provider-level selections are general capabilities. Offer-level selections are more specific:

```text
offer-specific tags
> provider-level defaults
> empty/unknown
```

If an offer has its own level or age tags, those tags apply to that offer. If the offer leaves a taxonomy unset, LocalSnow can inherit the reviewed provider-level default, but should make that inheritance visible in the UI so the provider understands what is being reused.

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

- exact calendar blocks;
- seasonal date ranges;
- blocked periods;
- offer-specific availability;
- Google Calendar busy-block import.

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

The fallback should feel like: “This instructor does not show exact availability yet, but you can still send a structured request with your dates and lesson details.”

Open boundary: if “route directly to the provider” means notifying the provider while LocalSnow keeps the request boundary, it fits current direction. If it means exposing provider contact or bypassing LocalSnow, that would reopen the contact/routing decision and should not be assumed here.

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

---

## 8. Onboarding data inheritance model

Use this hierarchy while collecting data:

```text
offer-specific settings
> provider hard limits
> provider defaults
```

This prevents contradictions such as:

```text
Profile says: teaches all ages and all levels.
Only active offer says: kids beginner ski lesson.
```

In that case, the offer should clearly say kids beginner lesson, while the broader provider capability can remain available for custom/future requests if reviewed.

This is an onboarding data rule only. It does not design the final result ranking or card UI.

---

## 9. What is intentionally not in first onboarding

Do not block first onboarding on:

- multiple-resort teaching;
- full offer catalog;
- search ranking or result-card engine;
- SEO offer expansion;
- Stripe/payment/payout setup;
- cancellation/weather/legal policy;
- complete booking workflow;
- full calendar sync;
- provider CRM/marketing automation;
- school ownership/proof workflow beyond marking it as an unresolved review need.

Those can come after the default offer + availability path is proven.

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
2. For school providers, what proof is enough to mark the school profile reviewed/trustworthy: business email/domain, website/social proof, phone call, document upload, or something else?
3. Should the first UI always start from one prefilled resort, with multi-resort teaching fully deferred?
4. Does the offer tag inheritance rule feel right: offer-specific tags override provider-level defaults, and unset offer fields can inherit visible defaults?
5. In availability fallback copy, should requests with no structured availability be described as LocalSnow-routed provider notifications, or truly direct-to-provider routing?

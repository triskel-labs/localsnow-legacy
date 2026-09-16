# Provider Onboarding Stage Model

**Status:** reviewable product decision draft  
**Owner:** LocalSnow / Moli + Mao  
**Purpose:** define the minimum provider onboarding stages, the data each stage collects, why that data exists, and how it supports search, profile, offer, availability, and LocalSnow review surfaces.

This document is meant for GitHub line comments. If a stage, field, or assumption feels wrong, comment directly on that line before we turn it into more UI/schema.

---

## 1. Working principle

Provider onboarding should not be a random form. It should help a snow-sports professional build the first useful LocalSnow provider entity:

```text
trustable profile
+ teaching scope
+ one requestable default offer
+ availability/requestability
+ LocalSnow review gate
```

A stage is only justified if it creates at least one of:

- useful public/profile data;
- better client/provider matching;
- pricing or requestability clarity;
- date/availability confidence;
- LocalSnow operator review/trust leverage.

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

> `Client fit` is not a separate first-onboarding stage yet. Ages, levels, group shape, modality, and limits belong inside **Default offer**, because they become useful when attached to the first requestable lesson.

---

## 3. Stage 1 — Profile

### Meaning

Defines who the provider is and whether LocalSnow can trust/profile them.

### Data

Required for early onboarding:

- public/professional display name;
- professional/private contact phone;
- qualification or credential proof;
- languages the provider can teach in;
- short public bio.

Optional but useful:

- profile photo;
- years of experience;
- school affiliation / professional background;
- public/private contact boundary notes.

### Purpose

This data supports:

- profile preview;
- provider trust;
- LocalSnow operator contact;
- later public listing review.

### Product surfaces affected

- `/dashboard/setup`;
- provider profile preview/page;
- LocalSnow review/operator checks;
- public provider card only after review.

### Readiness meaning

Profile data can make a provider profile-ready, but it does not by itself create a sellable or requestable lesson.

---

## 4. Stage 2 — Teaching area

### Meaning

Defines where and what the provider generally teaches.

### Data

Required for early onboarding:

- resort(s) or operating zones;
- sport(s), e.g. ski, snowboard;
- broad modality/specialty if already clear, e.g. freeride, freestyle, race training.

Optional or later:

- multiple meeting zones inside one resort;
- travel radius;
- preferred home base;
- avoided zones.

### Purpose

This data supports:

- resort + sport search eligibility;
- provider routing scope;
- default offer prefill;
- later resort/sport SEO surfaces.

### Product surfaces affected

- search filters;
- provider card context;
- default offer creation;
- resort/sport pages later.

### Readiness meaning

A provider can only be matched to broad marketplace demand once LocalSnow knows where and what they teach.

---

## 5. Stage 3 — Default offer

### Meaning

Defines the first requestable lesson/service. This is the bridge from “profile” to “marketplace object”.

The default offer is the offer LocalSnow can show when a client search is too broad to choose a more specific best match. It is not permanently privileged over better matching offers.

### Data

Required for early onboarding:

- offer name;
- sport;
- modality or lesson type if relevant;
- resort or meeting context;
- suitable ages or age range;
- suitable levels;
- private/group/family shape;
- minimum students;
- maximum students;
- main duration;
- normal price;
- currency.

Optional but important soon:

- group pricing tiers;
- duration packages;
- 3h half-day preset;
- 6h full-day preset;
- included/not included notes;
- meeting point;
- provider notes about bad-fit requests.

### Purpose

This data supports:

- broad search fallback/default offer;
- specific best-match scoring;
- provider/client fit qualification;
- initial pricing clarity;
- first requestable lesson without requiring a full offer catalog.

### Product surfaces affected

- search card best-match preview;
- provider profile offer list;
- client request/booking intake;
- future SEO/conversion offer pages.

### Readiness meaning

A provider becomes price-ready when at least one default offer has enough detail to calculate or show a credible price.

### Important rules

- Search should show the best matching offer, not blindly prefer the default offer.
- The default offer is used as fallback when the search is broad or underqualified.
- A provider can later turn the default offer into a specific offer and choose another default.
- Multiple offers from the same provider should be grouped under one provider card in normal search results.

---

## 6. Stage 4 — Availability

### Meaning

Defines when and how LocalSnow can treat the provider/default offer as requestable.

### Data

Required for early onboarding:

- availability style: fixed working hours, broad request windows, or request-by-request confirmation;
- working days or broad available windows;
- notice needed before a lesson;
- response-time expectation.

Optional or later:

- exact calendar blocks;
- seasonal date ranges;
- blocked periods;
- offer-specific availability;
- Google Calendar busy-block import.

### Purpose

This data supports:

- date/search confidence;
- fewer bad-fit timing requests;
- client-facing requestability signals;
- later protected booking/confirmation flow.

### Product surfaces affected

- search/date availability signal;
- provider dashboard availability;
- client request/booking calendar;
- LocalSnow operator follow-up.

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
- profile sanity check;
- default offer sanity check;
- contact privacy boundary;
- public visibility decision.

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
- keeping LocalSnow-routed contact boundaries clear.

### Product surfaces affected

- public visibility;
- provider card/listing status;
- LocalSnow operator workflow;
- future provider approval queue.

### Readiness meaning

LocalSnow review is a publication/requestability gate. It is not the same thing as full booking/payment readiness.

---

## 8. Relationship between profile, offer, and search

Use this hierarchy for matching:

```text
offer-specific settings
> provider hard limits
> provider defaults
```

Use this hierarchy for public marketing/profile copy:

```text
active reviewed offers
> reviewed provider summary
> raw provider defaults
```

This prevents contradictions such as:

```text
Profile says: teaches all ages and all levels.
Only active offer says: kids beginner ski lesson.
```

In that case, public search should mainly show the kids beginner offer, while the broader profile capability can remain available for custom/future requests if reviewed.

---

## 9. Search result rule

Normal marketplace search should be provider-grouped:

```text
one provider card
+ best matching offer preview
+ nested other relevant offers
```

Do not show six separate cards from the same provider by default.

Offer-level cards can appear later in:

- provider profile offer lists;
- offer SEO pages;
- explicit comparison mode;
- expanded search card details.

---

## 10. Pricing rule

Pricing rules should describe economics inside an offer:

- group size;
- duration;
- duration packages;
- later maybe season/date or promotion.

Separate offers should describe fundamentally different products:

- kids vs adults when the promise/price/copy differs;
- beginner vs advanced when the promise/price/copy differs;
- freeride vs piste lesson;
- race training;
- school group lesson;
- family private lesson.

Do not hide fundamentally different products as complex pricing conditions inside one generic offer.

---

## 11. What is intentionally not in first onboarding

Do not block first onboarding on:

- full offer catalog;
- SEO offer expansion;
- Stripe/payment/payout setup;
- cancellation/weather/legal policy;
- complete booking workflow;
- full calendar sync;
- provider CRM/marketing automation.

Those can come after the default offer + availability path is proven.

---

## 12. Current implementation boundary

The current implementation is still a tracer bullet:

- the stage model exists;
- the setup route can display Stage X of 5;
- the existing physical setup form is still mostly the older three-step form;
- the real Stage 3 default-offer form is not built yet;
- the LocalSnow review workflow is not built yet;
- search card mockups are deferred until visual review is possible.

---

## 13. Review questions

Please comment directly on this document if you disagree with any assumption.

Especially review:

1. Is five stages the right minimum?
2. Should `Client fit` stay inside `Default offer`, or become a separate stage?
3. Are any Stage 1 profile fields missing or too early?
4. Are any Stage 3 default-offer fields too much for first onboarding?
5. Should LocalSnow review be visible to the provider, or mostly internal?
6. Does the search/result rule match the LocalSnow marketplace direction?
7. Does the pricing rule match how ski/snowboard lessons are actually sold?

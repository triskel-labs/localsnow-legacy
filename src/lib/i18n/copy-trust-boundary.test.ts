/**
 * Copy / trust boundary regression test.
 *
 * Enforces that public-facing translation copy and hardcoded page strings
 * do not contradict the new LocalSnow product spec direction:
 *
 * FORBIDDEN on public surfaces:
 *   - "zero commission" / "0% commission" / "no commission" / "keep 100%"
 *     (implies a permanent free model; new spec has fair commission on protected bookings)
 *   - "free forever" / "no booking fee" / "no hidden charges"
 *     (same — overpromises no-revenue model)
 *   - "community-first directory"
 *     (old framing, not the product)
 *
 * The test targets only the specific keys and files changed in this PR.
 * Other keys with older copy are tracked separately.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const readJson = (path: string) =>
	JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, string>;
const readText = (path: string) => readFileSync(join(root, path), 'utf8');

const OLD_MODEL_PATTERN =
	/zero commission|0% commission|no commission|sin comisiones|sin comisión|keep 100%|quédate con el 100%|free forever|no booking fee|no hidden charges|community-first directory|100% free directory/i;

const PUBLIC_OPS_LEAK_PATTERN =
	/manual(?:ly)? operated|handled manually|manually supported|manual operations|before automation|deeper automation|software-driven fulfillment|cumplimiento automático|opera manualmente|gestiona manualmente|soporte manual|antes de automatizar|automatizar más/i;

const REQUIRED_HONEST_PATTERN =
	/self.managed inquiry|protected booking|guaranteed booking|commission|fair/i;

const targetFaqKeys = ['home_faq_a2', 'home_faq_a10'] as const;
const targetSchemaKeys = ['home_schema_website_description'] as const;
const clientAssistanceKeys = [
	'seo_meta_home_description',
	'seo_meta_instructors_description',
	'seo_meta_how_it_works_description',
	'home_how_it_works_step2_desc',
	'home_how_it_works_step3_desc',
	'home_trust_paths_headline',
	'home_trust_paths_subtitle',
	'home_trust_paths_direct_copy',
	'home_trust_paths_direct_promise',
	'home_trust_paths_protected_copy',
	'home_trust_paths_protected_promise',
	'home_trust_paths_operator_truth',
	'home_supply_subtitle',
	'home_supply_instructor_copy',
	'home_cta_subtitle',
	'home_why_free_commitment_desc',
	'contact_page_clients_desc',
	'contact_page_support_desc',
	'client_path_protected_safeguard',
	'how_it_works_page_intro',
	'how_it_works_page_clients_step3_note',
	'how_it_works_page_clients_step5_desc',
	'how_it_works_page_faq_deposit_a',
	'how_it_works_page_faq_payments_a',
	'how_it_works_page_faq_no_response_a',
	'how_it_works_trust_paths_direct_copy',
	'how_it_works_trust_paths_protected_copy',
	'how_it_works_trust_paths_discovery_note',
	'how_works_free_forever_desc',
	'about_what_is_p1',
	'about_how_different_text'
] as const;
const locales = ['en', 'es'] as const;

describe('homepage FAQ + schema copy trust boundary', () => {
	it('FAQ answers for client cost and instructor cost do not use old zero-commission framing', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of targetFaqKeys) {
				const value = messages[key];
				expect(value, `${locale}:${key} must exist`).toBeTruthy();
				expect(value, `${locale}:${key} must not use old zero-commission framing`).not.toMatch(
					OLD_MODEL_PATTERN
				);
			}
		}
	});

	it('homepage JSON-LD schema description does not say "without commission"', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of targetSchemaKeys) {
				const value = messages[key];
				expect(value, `${locale}:${key} must exist`).toBeTruthy();
				expect(value, `${locale}:${key} must not use old zero-commission framing`).not.toMatch(
					OLD_MODEL_PATTERN
				);
			}
		}
	});

	it('FAQ client cost answer honestly mentions both free and paid paths', () => {
		const en = readJson('src/lib/i18n/translations/en.json');
		const value = en['home_faq_a2'];
		expect(value).toMatch(/free|gratuito/i);
		expect(value).toMatch(/protected booking|self.managed|fee/i);
	});

	it('FAQ instructor cost answer honestly mentions commission/fee on bookings', () => {
		const en = readJson('src/lib/i18n/translations/en.json');
		const value = en['home_faq_a10'];
		expect(value).toMatch(REQUIRED_HONEST_PATTERN);
	});
});

describe('public client assistance copy', () => {
	it('does not leak manual backend or automation maturity language', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of clientAssistanceKeys) {
				const value = messages[key];
				expect(value, `${locale}:${key} must exist`).toBeTruthy();
				expect(value, `${locale}:${key} must sound like a working platform`).not.toMatch(
					PUBLIC_OPS_LEAK_PATTERN
				);
			}
		}
	});

	it('makes guaranteed booking the benefit-led path, not just support tasks', () => {
		const en = readJson('src/lib/i18n/translations/en.json');
		expect(en['home_trust_paths_protected_copy']).toMatch(/lesson solved|secure a suitable/i);
		expect(en['home_trust_paths_protected_promise']).toMatch(/suitable lesson.*refund/i);
		expect(en['how_it_works_trust_paths_protected_copy']).toMatch(/know-how|trusted network/i);
		expect(en['home_trust_paths_direct_copy']).toMatch(/coordinate.*yourself/i);
	});

	it('uses the positive green badge on guaranteed booking, not the free path', () => {
		const homepage = readText('src/routes/+page.svelte');
		const howItWorks = readText('src/routes/how-it-works/+page.svelte');

		expect(homepage).toContain("path.kind === 'protected'");
		expect(homepage).not.toContain("path.kind === 'direct'\n								? 'rounded-full bg-green-100");
		expect(howItWorks).toContain("step.kind === 'protected'");
		expect(howItWorks).not.toContain("step.costSignal === 'free'\n								? 'rounded-full bg-green-100");
	});
});

describe('how-it-works instructor section copy trust boundary', () => {
	const liveHiwDriftKeys = [
		'how_it_works_page_instructors_step6_desc',
		'how_it_works_page_instructors_step6_note',
		'how_it_works_page_instructors_cost_no_commission',
		'how_it_works_page_difference_localsnow_item1'
	] as const;

	it('instructor step 6 and cost summary do not use old zero-commission framing', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of liveHiwDriftKeys) {
				const value = messages[key];
				expect(value, `${locale}:${key} must exist`).toBeTruthy();
				expect(value, `${locale}:${key} must not use old zero-commission framing`).not.toMatch(
					OLD_MODEL_PATTERN
				);
			}
		}
	});

	it('instructor cost summary positively mentions the honest commission model', () => {
		const en = readJson('src/lib/i18n/translations/en.json');
		const costKey = en['how_it_works_page_instructors_cost_no_commission'];
		expect(costKey).toMatch(/commission|inquiry|booking/i);
		expect(costKey).not.toMatch(/keep 100%|no commission/i);
	});
});

describe('about page copy trust boundary', () => {
	const aboutTrustKeys = [
		'about_meta_description',
		'about_economic_p3',
		'about_what_is_p1',
		'about_mission_text',
		'about_how_different_text'
	] as const;

	it('about page copy does not use old free-directory / zero-commission promises', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of aboutTrustKeys) {
				const value = messages[key];
				expect(value, `${locale}:${key} must exist`).toBeTruthy();
				expect(value, `${locale}:${key} must not use old zero-commission framing`).not.toMatch(
					OLD_MODEL_PATTERN
				);
			}
		}
	});

	it('about page states the honest free inquiry plus protected booking model', () => {
		const en = readJson('src/lib/i18n/translations/en.json');
		expect(en['about_what_is_p1']).toMatch(/self-managed inquiries/i);
		expect(en['about_what_is_p1']).toMatch(/guaranteed booking|protected booking/i);
		expect(en['about_economic_p3']).toMatch(/fair commission/i);
	});

	it('about page sends provider profile CTAs through the join explainer first', () => {
		const page = readText('src/routes/about/+page.svelte');
		expect(page).toMatch(/route\('\/instructors\/join'/);
		expect(page).not.toMatch(/route\('\/signup'/);
	});
});

describe('resort instructors page hardcoded copy trust boundary', () => {
	it('does not contain "zero commission fees" as a public benefit claim', () => {
		const page = readText(
			'src/routes/resorts/[country]/[region]/[resort]/instructors/+page.svelte'
		);
		expect(page).not.toMatch(/zero commission fees/i);
	});
});

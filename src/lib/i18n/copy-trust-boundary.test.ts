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
	/zero commission|0% commission|no commission|keep 100%|free forever|no booking fee|no hidden charges|community-first directory/i;

const REQUIRED_HONEST_PATTERN =
	/self.managed inquiry|protected booking|guaranteed booking|commission|fair/i;

const targetFaqKeys = ['home_faq_a2', 'home_faq_a10'] as const;
const targetSchemaKeys = ['home_schema_website_description'] as const;
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

describe('resort instructors page hardcoded copy trust boundary', () => {
	it('does not contain "zero commission fees" as a public benefit claim', () => {
		const page = readText(
			'src/routes/resorts/[country]/[region]/[resort]/instructors/+page.svelte'
		);
		expect(page).not.toMatch(/zero commission fees/i);
	});
});

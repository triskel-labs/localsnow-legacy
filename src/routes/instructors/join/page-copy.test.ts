import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const readText = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const readJson = (path: string) => JSON.parse(readText(path)) as Record<string, string>;

const locales = ['en', 'es'] as const;
const joinCopyKeys = [
	'join_instructors_meta_title',
	'join_instructors_meta_description',
	'join_instructors_eyebrow',
	'join_instructors_title',
	'join_instructors_lede',
	'join_instructors_primary_cta',
	'join_instructors_secondary_cta',
	'join_instructors_status_label',
	'join_instructors_status_title',
	'join_instructors_status_copy',
	'join_instructors_signal_profile',
	'join_instructors_signal_review',
	'join_instructors_signal_control',
	'join_instructors_card_1_label',
	'join_instructors_card_1_title',
	'join_instructors_card_1_copy',
	'join_instructors_card_2_label',
	'join_instructors_card_2_title',
	'join_instructors_card_2_copy',
	'join_instructors_card_3_label',
	'join_instructors_card_3_title',
	'join_instructors_card_3_copy'
];

const forbiddenJoinCopy =
	/referral|referencia|referencias|commission|comisión|payment|pago|protected booking|reserva protegida|launch code|promo code|código de lanzamiento|auth|database|scaffold|draft boundary/i;

describe('instructor join entry path', () => {
	it('adds a dedicated instructor join route and sends the homepage instructor CTA there', () => {
		const routes = readText('src/lib/i18n/routes.ts');
		const homepage = readText('src/routes/+page.svelte');
		const joinPage = readText('src/routes/instructors/join/+page.svelte');

		expect(routes).toContain("'/instructors/join'");
		expect(routes).toContain("en: '/instructors/join'");
		expect(routes).toContain("es: '/instructores/unirse'");
		expect(homepage).toContain("href={route('/instructors/join')}");
		expect(joinPage).toContain("route('/signup')");
		expect(joinPage).toContain("route('/instructors')");
	});

	it('keeps the provider entry copy narrow, profile-first, and free of parked mechanics', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			for (const key of joinCopyKeys) {
				expect(messages[key], `${locale}:${key}`).toBeTruthy();
			}

			const providerEntryCopy = [
				...joinCopyKeys.map((key) => messages[key]),
				messages.home_supply_instructor_cta,
				messages.home_supply_school_copy
			].join('\n');

			expect(providerEntryCopy).toMatch(/profile|perfil/i);
			expect(providerEntryCopy).toMatch(/direct|directa|directas/i);
			expect(providerEntryCopy).not.toMatch(forbiddenJoinCopy);
		}
	});
});

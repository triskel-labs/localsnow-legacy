import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const readText = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const readJson = (path: string) => JSON.parse(readText(path)) as Record<string, string>;

const locales = ['en', 'es'] as const;
const requiredKeys = [
	'lesson_help_meta_title',
	'lesson_help_meta_description',
	'lesson_help_eyebrow',
	'lesson_help_title',
	'lesson_help_lede',
	'lesson_help_submit',
	'lesson_help_whatsapp_cta',
	'lesson_help_whatsapp_note',
	'lesson_help_success_title',
	'lesson_help_success_copy',
	'lesson_help_direct_path_label',
	'lesson_help_guaranteed_path_label',
	'lesson_help_guaranteed_path_copy'
];

describe('lesson help page copy and routing', () => {
	it('adds a localized assisted lesson route and points conversion CTAs there', () => {
		const routes = readText('src/lib/i18n/routes.ts');
		const homepage = readText('src/routes/+page.svelte');
		const contact = readText('src/routes/contact/+page.svelte');
		const page = readText('src/routes/secure-lesson/+page.svelte');

		expect(routes).toContain("'/secure-lesson'");
		expect(routes).toContain("en: '/secure-lesson'");
		expect(routes).toContain("es: '/ayuda'");
		expect(homepage).toContain("route('/secure-lesson')");
		expect(homepage).toContain('home_trust_paths_operator_cta');
		expect(contact).toContain("route('/secure-lesson', currentLocale)");
		expect(page).toContain('lesson_help_title');
		expect(page).toContain('LESSON_HELP_WHATSAPP_URL');
		expect(page).toContain('class="prose prose-sm mx-auto max-w-3xl"');
	});

	it('keeps assisted intake copy outcome-led and free of manual/automation leakage', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			const copy = requiredKeys.map((key) => messages[key]).join('\n');

			for (const key of requiredKeys) {
				expect(messages[key], `${locale}:${key}`).toBeTruthy();
			}

			expect(copy).toMatch(
				/secure|suitable|lesson|alternative|refund|asegurar|clase|alternativa|reembolso/i
			);
			expect(copy).toMatch(/guaranteed|garantizada/i);
			expect(copy).not.toMatch(/ask localsnow to help|pedir ayuda a localsnow/i);
			expect(copy).not.toMatch(
				/manual|automation|backend|still figuring|opera manual|automatización/i
			);
		}
	});
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const repoRoot = process.cwd();
const readText = (path: string) => readFileSync(join(repoRoot, path), 'utf8');
const readJson = (path: string) => JSON.parse(readText(path)) as Record<string, string>;

const locales = ['en', 'es'] as const;
const requiredKeys = [
	'help_meta_title',
	'help_meta_description',
	'help_eyebrow',
	'help_title',
	'help_lede',
	'help_lesson_title',
	'help_lesson_copy',
	'help_lesson_cta',
	'help_payment_title',
	'help_payment_copy',
	'help_payment_cta',
	'help_issue_title',
	'help_issue_copy',
	'help_issue_cta',
	'help_provider_title',
	'help_provider_copy',
	'help_provider_cta',
	'help_general_title',
	'help_general_copy',
	'help_general_cta',
	'help_boundary_title',
	'help_boundary_copy'
];

describe('help/contact intent router', () => {
	it('routes Spanish help to /es/ayuda while keeping secure lesson separate', () => {
		const routes = readText('src/lib/i18n/routes.ts');
		const helpPage = readText('src/routes/help/+page.svelte');
		const footer = readText('src/lib/components/shared/Footer.svelte');

		expect(routes).toContain("'/help'");
		expect(routes).toContain("en: '/help'");
		expect(routes).toContain("es: '/ayuda'");
		expect(routes).toContain("'/secure-lesson'");
		expect(routes).toContain("es: '/asegurar-clase'");
		expect(helpPage).toContain("route('/secure-lesson', currentLocale)");
		expect(helpPage).toContain("route('/contact', currentLocale)");
		expect(footer).toContain("$t('nav_help')");
		expect(footer).toContain("route('/help')");
	});

	it('keeps help copy localized, intent-led and separate from automatic booking', () => {
		for (const locale of locales) {
			const messages = readJson(`src/lib/i18n/translations/${locale}.json`);
			const copy = requiredKeys.map((key) => messages[key]).join('\n');

			for (const key of requiredKeys) {
				expect(messages[key], `${locale}:${key}`).toBeTruthy();
			}

			if (locale === 'es') {
				expect(messages.help_lesson_title).toContain('No pierdas tiempo buscando');
			} else {
				expect(messages.help_lesson_title).toContain('Don’t spend time searching');
			}

			expect(copy).toMatch(/help|ayuda|reason|motivo|WhatsApp|payment|pago|lesson|clase/i);
			expect(copy).not.toMatch(
				/manual backend|automation|bot|crm|workflow engine|automatic booking|reserva automática/i
			);
		}
	});
});

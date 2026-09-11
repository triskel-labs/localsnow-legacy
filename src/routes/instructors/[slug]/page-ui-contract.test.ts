import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const profilePage = readFileSync(
	resolve(process.cwd(), 'src/routes/instructors/[slug]/+page.svelte'),
	'utf8'
);

describe('instructor profile conversion CTA contract', () => {
	it('keeps protected booking visually first and avoids explanatory CTA paragraphs', () => {
		expect(profilePage.indexOf("{$t(protectedPath?.ctaKey")).toBeLessThan(
			profilePage.indexOf("{$t(directPath?.ctaKey")
		);
		expect(profilePage).toContain('{$t(availabilityProof.labelKey)}');
		expect(profilePage).not.toContain('availabilityProof.clientCopyKey');
		expect(profilePage).not.toContain('directPath?.safeguardCopyKey');
		expect(profilePage).not.toContain('protectedPath?.safeguardCopyKey');
	});
});

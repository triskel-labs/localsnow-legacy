import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { setupRateSchema } from './setupSchemas';

describe('setup default offer schema', () => {
	it('captures a real first requestable lesson without needing a new table', () => {
		const parsed = setupRateSchema.parse({
			title: 'Private ski lesson',
			description: 'For beginner and intermediate skiers who want focused help on piste.',
			duration: '2h',
			basePrice: 95,
			currency: 'EUR'
		});

		expect(parsed).toEqual({
			title: 'Private ski lesson',
			description: 'For beginner and intermediate skiers who want focused help on piste.',
			duration: '2h',
			basePrice: 95,
			currency: 'EUR'
		});
	});

	it('keeps the first offer concrete enough for clients to request', () => {
		const result = setupRateSchema.safeParse({
			title: '',
			description: '',
			duration: '',
			basePrice: 0,
			currency: 'EUR'
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const fieldErrors = result.error.flatten().fieldErrors;
			expect(fieldErrors.title?.[0]).toContain('Name your first offer');
			expect(fieldErrors.duration?.[0]).toContain('Choose a duration');
			expect(fieldErrors.description?.[0]).toContain('Add a short client-facing description');
		}
	});

	it('keeps Step 3 copy clear that price is hourly, not per displayed duration', () => {
		const setupPage = readFileSync(join(__dirname, '+page.svelte'), 'utf8');

		expect(setupPage).toContain('Starting hourly price');
		expect(setupPage).toContain('This remains an hourly rate');
		expect(setupPage).toContain('not the price unit');
		expect(setupPage).not.toContain('Starting price <span');
		expect(setupPage).not.toContain('placeholder="e.g. 95"');
	});
});

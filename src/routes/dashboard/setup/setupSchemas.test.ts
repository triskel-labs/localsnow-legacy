import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { setupAvailabilitySchema, setupRateSchema } from './setupSchemas';
import { buildWorkingHoursFromSetupAvailability } from './setupAvailability';

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

	it('shows Stage 4 as a starter weekly availability setup, not Google Calendar setup', () => {
		const setupPage = readFileSync(join(__dirname, '+page.svelte'), 'utf8');

		expect(setupPage).toContain('Starter weekly availability');
		expect(setupPage).toContain('This saves real working hours');
		expect(setupPage).toContain('Google Calendar can stay optional');
	});
});

describe('setup availability schema', () => {
	it('captures a simple weekly availability pattern for onboarding', () => {
		const parsed = setupAvailabilitySchema.parse({
			weeklyPattern: 'weekdays',
			startTime: '09:00',
			endTime: '16:30'
		});

		expect(parsed).toEqual({
			weeklyPattern: 'weekdays',
			startTime: '09:00',
			endTime: '16:30'
		});
	});

	it('rejects empty or reversed setup availability hours', () => {
		const result = setupAvailabilitySchema.safeParse({
			weeklyPattern: 'weekdays',
			startTime: '17:00',
			endTime: '09:00'
		});

		expect(result.success).toBe(false);
		if (!result.success) {
			const formErrors = result.error.flatten().formErrors;
			expect(formErrors[0]).toContain('End time must be after start time');
		}
	});

	it('turns onboarding availability into active working hours without inventing a new table', () => {
		const workingHours = buildWorkingHoursFromSetupAvailability({
			weeklyPattern: 'weekends',
			startTime: '08:30',
			endTime: '14:00'
		});

		expect(workingHours).toEqual([
			{ dayOfWeek: 0, startTime: '08:30', endTime: '14:00' },
			{ dayOfWeek: 6, startTime: '08:30', endTime: '14:00' }
		]);
	});
});

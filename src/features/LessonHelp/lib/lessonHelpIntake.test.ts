import { describe, expect, it } from 'vitest';

import {
	LESSON_HELP_WHATSAPP_DISPLAY,
	LESSON_HELP_WHATSAPP_URL,
	buildLessonHelpNotification,
	parseLessonHelpFormData
} from './lessonHelpIntake';

function makeForm(overrides: Record<string, string> = {}) {
	const form = new FormData();
	const values = {
		name: '  Cris  ',
		email: 'cris@example.com',
		phone: '+34 600 000 000',
		resort: 'Baqueira Beret',
		dates: '10-12 January',
		sport: 'ski',
		level: 'beginner',
		groupSize: '3',
		lessonPreference: 'private',
		preferredDates: '2026-01-10,2026-01-11',
		preferredTimeWindow: 'morning',
		language: 'Spanish',
		message: 'Two adults and one child, morning preferred.',
		...overrides
	};

	for (const [key, value] of Object.entries(values)) {
		form.set(key, value);
	}

	return form;
}

describe('lesson help intake', () => {
	it('normalizes a client lesson help request from form data', () => {
		const result = parseLessonHelpFormData(makeForm());

		expect(result.success).toBe(true);
		if (!result.success) throw new Error('expected valid form');

		expect(result.data).toMatchObject({
			name: 'Cris',
			email: 'cris@example.com',
			phone: '+34 600 000 000',
			resort: 'Baqueira Beret',
			dates: '10-12 January',
			preferredDates: '2026-01-10,2026-01-11',
			preferredTimeWindow: 'morning',
			sport: 'ski',
			level: 'beginner',
			groupSize: 3,
			lessonPreference: 'private',
			language: 'Spanish',
			message: 'Two adults and one child, morning preferred.'
		});
	});

	it('returns field errors for missing required contact and lesson details', () => {
		const result = parseLessonHelpFormData(
			makeForm({ name: '', email: 'not-an-email', resort: '', dates: '', groupSize: '0' })
		);

		expect(result.success).toBe(false);
		if (result.success) throw new Error('expected invalid form');

		expect(result.fieldErrors.name).toBeTruthy();
		expect(result.fieldErrors.email).toBeTruthy();
		expect(result.fieldErrors.resort).toBeTruthy();
		expect(result.fieldErrors.dates).toBeTruthy();
		expect(result.fieldErrors.groupSize).toBeTruthy();
	});

	it('builds a LocalSnow-facing notification without exposing backend maturity', () => {
		const parsed = parseLessonHelpFormData(makeForm());
		if (!parsed.success) throw new Error('expected valid form');

		const notification = buildLessonHelpNotification(parsed.data, 'en');
		const combined = `${notification.subject}\n${notification.html}\n${notification.telegramMessage}`;

		expect(notification.subject).toContain('Lesson intake request');
		expect(notification.to).toBe('admin@localsnow.org');
		expect(combined).toContain('Baqueira Beret');
		expect(combined).toContain('10-12 January');
		expect(combined).toContain('2026-01-10,2026-01-11');
		expect(combined).toContain('morning');
		expect(combined).toContain('preferred');
		expect(combined).not.toMatch(/confirmed|booked|guaranteed slot/i);
		expect(combined).toContain('3');
		expect(combined).not.toMatch(/manual|automation|backend|still figuring/i);
	});

	it('uses the approved LocalSnow WhatsApp Business contact path', () => {
		expect(LESSON_HELP_WHATSAPP_DISPLAY).toBe('+34 611 354 189');
		expect(LESSON_HELP_WHATSAPP_URL).toContain('https://wa.me/34611354189');
		expect(LESSON_HELP_WHATSAPP_URL).toContain('lesson');
	});
});

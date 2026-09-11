import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const availabilityPage = readFileSync(
	resolve(process.cwd(), 'src/routes/dashboard/availability/+page.svelte'),
	'utf8'
);
const calendarGrid = readFileSync(
	resolve(process.cwd(), 'src/lib/components/calendar-grid/CalendarGrid.svelte'),
	'utf8'
);

describe('availability dashboard UI contract', () => {
	it('does not include dark-mode styling in LocalSnow fixed-mode surfaces', () => {
		expect(availabilityPage).not.toContain('dark:');
		expect(calendarGrid).not.toContain(':global(.dark)');
	});

	it('keeps unset availability on the same page but disables dependent surfaces', () => {
		expect(availabilityPage).toContain('hasConfiguredAvailability');
		expect(availabilityPage).toContain('Set your weekly availability first');
		expect(availabilityPage).toContain('aria-disabled={!hasConfiguredAvailability}');
		expect(availabilityPage).toContain('pointer-events-none opacity-60');
	});
});

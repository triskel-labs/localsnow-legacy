import { describe, expect, it } from 'vitest';

import {
	blocksForDay,
	getDashboardDaySummary,
	seasonWindow,
	type DashboardCalendarBlock,
	type DashboardWorkingHour
} from './dashboardAvailability';

const weekdayRule: DashboardWorkingHour = {
	dayOfWeek: 1,
	startTime: '09:00',
	endTime: '16:00',
	seasonStart: '2027-01-01',
	seasonEnd: '2027-04-30',
	isActive: true
};

describe('dashboard availability', () => {
	it('marks the calendar unconfigured when no working hours exist', () => {
		expect(getDashboardDaySummary({ iso: '2027-01-04', workingHours: [] }).status).toBe(
			'unconfigured'
		);
	});

	it('derives available days from working hours and season', () => {
		expect(
			getDashboardDaySummary({ iso: '2027-01-04', workingHours: [weekdayRule] }).status
		).toBe('available');
		expect(
			getDashboardDaySummary({ iso: '2027-01-05', workingHours: [weekdayRule] }).status
		).toBe('unavailable');
		expect(
			getDashboardDaySummary({ iso: '2027-05-03', workingHours: [weekdayRule] }).status
		).toBe('unavailable');
	});

	it('lets all-day blocks override a working day', () => {
		const blocks: DashboardCalendarBlock[] = [
			{
				id: 1,
				startDatetime: '2027-01-04T00:00:00.000Z',
				endDatetime: '2027-01-04T23:59:00.000Z',
				allDay: true,
				source: 'manual'
			}
		];

		expect(
			getDashboardDaySummary({ iso: '2027-01-04', workingHours: [weekdayRule], blocks }).status
		).toBe('blocked');
	});

	it('marks timed blocks as partial rather than hiding the day', () => {
		const blocks: DashboardCalendarBlock[] = [
			{
				id: 1,
				startDatetime: '2027-01-04T10:00:00.000Z',
				endDatetime: '2027-01-04T12:00:00.000Z',
				allDay: false,
				source: 'google_calendar'
			}
		];

		expect(
			getDashboardDaySummary({ iso: '2027-01-04', workingHours: [weekdayRule], blocks }).status
		).toBe('partial');
	});

	it('groups multi-day blocks into every affected date', () => {
		const blocks: DashboardCalendarBlock[] = [
			{
				id: 1,
				startDatetime: '2027-01-04T10:00:00.000Z',
				endDatetime: '2027-01-06T12:00:00.000Z',
				allDay: false,
				source: 'google_calendar'
			}
		];

		expect(blocksForDay('2027-01-05', blocks)).toHaveLength(1);
	});

	it('projects one season window from configured rules', () => {
		expect(
			seasonWindow([
				weekdayRule,
				{ ...weekdayRule, dayOfWeek: 2, seasonStart: '2026-12-15', seasonEnd: '2027-05-15' }
			])
		).toEqual({ seasonStart: '2026-12-15', seasonEnd: '2027-05-15' });
	});
});

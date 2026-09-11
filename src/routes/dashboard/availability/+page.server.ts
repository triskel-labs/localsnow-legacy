import type { PageServerLoad } from './$types';
import { isCalendarConnected } from '$lib/server/google/oauth';
import { db } from '$lib/server/db';
import { and, eq, gte, lte } from 'drizzle-orm';
import {
	instructorCalendarBlocks,
	instructorGoogleTokens
} from '$src/lib/server/db/schema';
import { WorkingHoursService } from '$src/features/Availability/lib/workingHoursService';
import { requireDashboardRole } from '$src/lib/utils/dashboardAuth';
import { addDays, isoDate } from '$src/features/Availability/lib/dashboardAvailability';

const workingHoursService = new WorkingHoursService();

export const load: PageServerLoad = async (event) => {
	const user = requireDashboardRole(
		event,
		['instructor-independent', 'instructor-school'],
		'Login to access availability settings'
	);

	const today = new Date();
	const windowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	const windowEnd = addDays(windowStart, 120);

	const [connected, workingHours, calendarBlocks] = await Promise.all([
		isCalendarConnected(user.id),
		workingHoursService.getInstructorWorkingHours(user.id),
		db
			.select({
				id: instructorCalendarBlocks.id,
				startDatetime: instructorCalendarBlocks.startDatetime,
				endDatetime: instructorCalendarBlocks.endDatetime,
				allDay: instructorCalendarBlocks.allDay,
				source: instructorCalendarBlocks.source,
				title: instructorCalendarBlocks.title
			})
			.from(instructorCalendarBlocks)
			.where(
				and(
					eq(instructorCalendarBlocks.instructorId, user.id),
					gte(instructorCalendarBlocks.endDatetime, windowStart),
					lte(instructorCalendarBlocks.startDatetime, windowEnd)
				)
			)
	]);

	let syncDetails = null;
	if (connected) {
		const result = await db
			.select({
				lastSyncAt: instructorGoogleTokens.lastSyncAt,
				syncEnabled: instructorGoogleTokens.syncEnabled,
				calendarId: instructorGoogleTokens.calendarId
			})
			.from(instructorGoogleTokens)
			.where(eq(instructorGoogleTokens.instructorId, user.id))
			.limit(1);

		syncDetails = result[0] || null;
	}

	const success = event.url.searchParams.get('success');
	const error = event.url.searchParams.get('error');

	return {
		connected,
		syncDetails,
		workingHoursConfigured: workingHours.length > 0,
		workingHours: workingHours.map((hour) => ({
			id: hour.id,
			dayOfWeek: hour.dayOfWeek,
			startTime: hour.startTime,
			endTime: hour.endTime,
			seasonStart: isoOrEmpty(hour.seasonStart),
			seasonEnd: isoOrEmpty(hour.seasonEnd),
			isActive: hour.isActive
		})),
		calendarBlocks: calendarBlocks.map((block) => ({
			id: block.id,
			startDatetime: block.startDatetime.toISOString(),
			endDatetime: block.endDatetime.toISOString(),
			allDay: block.allDay,
			source: block.source,
			title: block.title
		})),
		windowStart: isoDate(windowStart),
		windowEnd: isoDate(windowEnd),
		successMessage: success === 'connected' ? 'Calendar connected successfully!' : null,
		errorMessage: error ? getErrorMessage(error) : null
	};
};

function isoOrEmpty(value: Date | null): string {
	return value ? isoDate(value) : '';
}

function getErrorMessage(errorCode: string): string {
	const messages: Record<string, string> = {
		access_denied: 'You denied access to your Google Calendar.',
		invalid_request: 'Invalid request. Please try again.',
		connection_failed: 'Failed to connect to Google Calendar. Please try again.'
	};
	return messages[errorCode] || 'An unknown error occurred.';
}

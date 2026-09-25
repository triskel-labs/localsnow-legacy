import type { z } from 'zod';
import type { setupAvailabilitySchema } from './setupSchemas';

export type SetupAvailabilityData = z.infer<typeof setupAvailabilitySchema>;

type SetupWorkingHour = {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
};

const DAYS_BY_PATTERN: Record<SetupAvailabilityData['weeklyPattern'], number[]> = {
	weekdays: [1, 2, 3, 4, 5],
	weekends: [0, 6],
	all_days: [0, 1, 2, 3, 4, 5, 6]
};

export function buildWorkingHoursFromSetupAvailability(
	availability: SetupAvailabilityData
): SetupWorkingHour[] {
	return DAYS_BY_PATTERN[availability.weeklyPattern].map((dayOfWeek) => ({
		dayOfWeek,
		startTime: availability.startTime,
		endTime: availability.endTime
	}));
}

export function getDisabledDaysForSetupAvailability(availability: SetupAvailabilityData): number[] {
	const enabledDays = new Set(DAYS_BY_PATTERN[availability.weeklyPattern]);
	return DAYS_BY_PATTERN.all_days.filter((dayOfWeek) => !enabledDays.has(dayOfWeek));
}

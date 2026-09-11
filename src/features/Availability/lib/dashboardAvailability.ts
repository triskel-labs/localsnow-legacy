export type DashboardWorkingHour = {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
	seasonStart?: string | Date | null;
	seasonEnd?: string | Date | null;
	isActive?: boolean | null;
};

export type DashboardCalendarBlock = {
	id: number | string;
	startDatetime: string | Date;
	endDatetime: string | Date;
	allDay?: boolean | null;
	source?: string | null;
	title?: string | null;
};

export type DashboardDayStatus = 'unconfigured' | 'unavailable' | 'available' | 'partial' | 'blocked';

export type DashboardDaySummary = {
	iso: string;
	status: DashboardDayStatus;
	workingHours: DashboardWorkingHour | null;
	blocks: DashboardCalendarBlock[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function normalizeDateOnly(value: string | Date | null | undefined): string | null {
	if (!value) return null;
	if (value instanceof Date) return isoDate(value);
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : isoDate(date);
}

export function isoDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
		date.getDate()
	).padStart(2, '0')}`;
}

export function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * DAY_MS);
}

export function seasonWindow(workingHours: DashboardWorkingHour[]): {
	seasonStart: string;
	seasonEnd: string;
} {
	const starts = workingHours
		.map((hour) => normalizeDateOnly(hour.seasonStart))
		.filter((date): date is string => Boolean(date));
	const ends = workingHours
		.map((hour) => normalizeDateOnly(hour.seasonEnd))
		.filter((date): date is string => Boolean(date));

	return {
		seasonStart: starts.sort()[0] ?? '',
		seasonEnd: ends.sort().at(-1) ?? ''
	};
}

export function blocksForDay(
	iso: string,
	blocks: DashboardCalendarBlock[]
): DashboardCalendarBlock[] {
	return blocks.filter((block) => {
		const start = normalizeDateOnly(block.startDatetime);
		const end = normalizeDateOnly(block.endDatetime);
		if (!start || !end) return false;
		return start <= iso && end >= iso;
	});
}

export function getDashboardDaySummary(input: {
	iso: string;
	workingHours: DashboardWorkingHour[];
	blocks?: DashboardCalendarBlock[];
}): DashboardDaySummary {
	const { iso, workingHours, blocks = [] } = input;
	const activeHours = workingHours.filter((hour) => hour.isActive !== false);
	const jsDay = new Date(`${iso}T12:00:00`).getDay();
	const rule = activeHours.find((hour) => hour.dayOfWeek === jsDay) ?? null;
	const dayBlocks = blocksForDay(iso, blocks);

	if (activeHours.length === 0) {
		return { iso, status: 'unconfigured', workingHours: null, blocks: dayBlocks };
	}

	if (!rule) {
		return { iso, status: 'unavailable', workingHours: null, blocks: dayBlocks };
	}

	const seasonStart = normalizeDateOnly(rule.seasonStart);
	const seasonEnd = normalizeDateOnly(rule.seasonEnd);
	if ((seasonStart && iso < seasonStart) || (seasonEnd && iso > seasonEnd)) {
		return { iso, status: 'unavailable', workingHours: rule, blocks: dayBlocks };
	}

	if (dayBlocks.some((block) => block.allDay)) {
		return { iso, status: 'blocked', workingHours: rule, blocks: dayBlocks };
	}

	if (dayBlocks.length > 0) {
		return { iso, status: 'partial', workingHours: rule, blocks: dayBlocks };
	}

	return { iso, status: 'available', workingHours: rule, blocks: dayBlocks };
}

export function countStatuses(days: DashboardDaySummary[]): Record<DashboardDayStatus, number> {
	return days.reduce(
		(acc, day) => {
			acc[day.status] += 1;
			return acc;
		},
		{ unconfigured: 0, unavailable: 0, available: 0, partial: 0, blocked: 0 }
	);
}

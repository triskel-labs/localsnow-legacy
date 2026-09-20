import { json, type RequestHandler } from '@sveltejs/kit';
import { WorkingHoursService } from '$src/features/Availability/lib/workingHoursService';
import { hasInstructorRole } from '$src/lib/utils/roles';

const workingHoursService = new WorkingHoursService();

type WorkingHoursPayload = {
	dayOfWeek: unknown;
	startTime: unknown;
	endTime: unknown;
	seasonStart?: unknown;
	seasonEnd?: unknown;
};

function parseDateOnly(value: unknown): Date | null {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		throw new Error('Invalid season date');
	}
	return new Date(`${value}T12:00:00.000Z`);
}

function parseWorkingHours(payload: WorkingHoursPayload[]) {
	return payload.map((item) => {
		if (typeof item.dayOfWeek !== 'number' || item.dayOfWeek < 0 || item.dayOfWeek > 6) {
			throw new Error('Invalid day of week');
		}
		if (typeof item.startTime !== 'string' || !/^\d{2}:\d{2}$/.test(item.startTime)) {
			throw new Error('Invalid start time');
		}
		if (typeof item.endTime !== 'string' || !/^\d{2}:\d{2}$/.test(item.endTime)) {
			throw new Error('Invalid end time');
		}
		if (item.startTime >= item.endTime) {
			throw new Error('Start time must be before end time');
		}

		return {
			dayOfWeek: item.dayOfWeek,
			startTime: item.startTime,
			endTime: item.endTime,
			seasonStart: parseDateOnly(item.seasonStart),
			seasonEnd: parseDateOnly(item.seasonEnd)
		};
	});
}

// Get working hours
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.user;

	if (!user || !hasInstructorRole(user)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const hours = await workingHoursService.getInstructorWorkingHours(user.id);
		return json({ workingHours: hours });
	} catch (error) {
		console.error('Error fetching working hours:', error);
		return json({ error: 'Failed to fetch working hours' }, { status: 500 });
	}
};

// Create/Update working hours
export const POST: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user || !hasInstructorRole(user)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const data = await request.json();

		if (!Array.isArray(data.workingHours)) {
			return json({ error: 'Invalid data format' }, { status: 400 });
		}

		const workingHours = parseWorkingHours(data.workingHours);
		const results = await workingHoursService.bulkUpsertWorkingHours(user.id, workingHours);

		return json({ success: true, workingHours: results });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to save working hours';
		console.error('Error saving working hours:', message);
		return json({ error: message }, { status: 400 });
	}
};

// Delete working hours for a specific day
export const DELETE: RequestHandler = async ({ request, locals }) => {
	const user = locals.user;

	if (!user || !hasInstructorRole(user)) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { dayOfWeek } = await request.json();

		if (typeof dayOfWeek !== 'number' || dayOfWeek < 0 || dayOfWeek > 6) {
			return json({ error: 'Invalid day of week' }, { status: 400 });
		}

		await workingHoursService.deleteWorkingHours(user.id, dayOfWeek);

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting working hours:', error);
		return json({ error: 'Failed to delete working hours' }, { status: 500 });
	}
};

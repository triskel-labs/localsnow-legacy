import { z } from 'zod';

import type { Locale } from '$lib/i18n/routes';

const adminEmail = 'admin@localsnow.org';
const whatsappMessage = encodeURIComponent(
	'Hi LocalSnow, I want to secure a ski or snowboard lesson. Resort, dates, level and group size: '
);

export const LESSON_HELP_WHATSAPP_DISPLAY = '+34 611 354 189';
export const LESSON_HELP_WHATSAPP_URL = `https://wa.me/34611354189?text=${whatsappMessage}`;

const lessonHelpSchema = z.object({
	name: z.string().trim().min(1, 'Name is required'),
	email: z.string().trim().email('Valid email is required'),
	phone: z.string().trim().optional(),
	resort: z.string().trim().min(1, 'Resort is required'),
	dates: z.string().trim().min(1, 'Dates are required'),
	sport: z.enum(['ski', 'snowboard', 'both', 'not_sure']),
	level: z.string().trim().min(1, 'Level is required'),
	groupSize: z.coerce.number().int('Group size must be a whole number').min(1).max(30),
	lessonPreference: z.enum(['private', 'group', 'either', 'not_sure']),
	preferredDates: z.string().trim().max(300).optional(),
	preferredTimeWindow: z
		.enum(['morning', 'midday', 'afternoon', 'flexible', 'not_sure', ''])
		.optional(),
	language: z.string().trim().min(1, 'Preferred language is required'),
	message: z.string().trim().max(1200).optional()
});

export type LessonHelpRequest = z.infer<typeof lessonHelpSchema>;

export type LessonHelpParseResult =
	| { success: true; data: LessonHelpRequest; values: Record<string, string>; fieldErrors: {} }
	| {
			success: false;
			values: Record<string, string>;
			fieldErrors: Record<string, string>;
	  };

export interface LessonHelpNotification {
	to: string;
	subject: string;
	html: string;
	telegramMessage: string;
}

const fields = [
	'name',
	'email',
	'phone',
	'resort',
	'dates',
	'sport',
	'level',
	'groupSize',
	'lessonPreference',
	'preferredDates',
	'preferredTimeWindow',
	'language',
	'message'
] as const;

function getString(formData: FormData, field: (typeof fields)[number]): string {
	const value = formData.get(field);
	return typeof value === 'string' ? value.trim() : '';
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

export function parseLessonHelpFormData(formData: FormData): LessonHelpParseResult {
	const values = Object.fromEntries(fields.map((field) => [field, getString(formData, field)]));
	const parsed = lessonHelpSchema.safeParse(values);

	if (parsed.success) {
		return { success: true, data: parsed.data, values, fieldErrors: {} };
	}

	return {
		success: false,
		values,
		fieldErrors: Object.fromEntries(
			Object.entries(parsed.error.flatten().fieldErrors).map(([field, messages]) => [
				field,
				messages?.[0] ?? 'Invalid value'
			])
		)
	};
}

export function buildLessonHelpNotification(
	request: LessonHelpRequest,
	locale: Locale = 'en'
): LessonHelpNotification {
	const preferredLocale = locale === 'es' ? 'Spanish page' : 'English page';
	const subject = `Lesson intake request: ${request.resort} · ${request.dates}`;
	const rows = [
		['Name', request.name],
		['Email', request.email],
		['Phone', request.phone || 'Not provided'],
		['Resort / area', request.resort],
		['Dates', request.dates],
		['Preferred date picks', request.preferredDates || 'Not selected'],
		['Estimated time window', request.preferredTimeWindow || 'Not sure'],
		['Sport', request.sport],
		['Level', request.level],
		['Group size', String(request.groupSize)],
		['Preference', request.lessonPreference],
		['Preferred language', request.language],
		['Submitted from', preferredLocale]
	];

	const tableRows = rows
		.map(
			([label, value]) => `
				<tr>
					<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #0f172a;">${escapeHtml(label)}</td>
					<td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #334155;">${escapeHtml(value)}</td>
				</tr>`
		)
		.join('');

	const html = `
		<div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
			<h1 style="margin: 0 0 12px;">New LocalSnow lesson intake request</h1>
			<p style="margin: 0 0 16px; color: #475569;">A client wants LocalSnow to route them toward the fastest path to a suitable ski or snowboard lesson.</p>
			<table style="border-collapse: collapse; width: 100%; max-width: 680px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
				<tbody>${tableRows}</tbody>
			</table>
			<h2 style="margin: 24px 0 8px;">Client message</h2>
			<p style="white-space: pre-wrap; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;">${escapeHtml(request.message || 'No extra message provided.')}</p>
			<p style="margin-top: 18px; color: #475569;">Guide the client toward the right path: self-managed inquiry when they want control, or guaranteed booking when they want LocalSnow to secure a suitable lesson, suitable alternative, or refund path.</p>
		</div>`;

	const telegramMessage = [
		'⛷️ LocalSnow lesson intake request',
		`- Name: ${request.name}`,
		`- Email: ${request.email}`,
		`- Phone: ${request.phone || 'Not provided'}`,
		`- Resort: ${request.resort}`,
		`- Dates: ${request.dates}`,
		`- Preferred date picks: ${request.preferredDates || 'Not selected'}`,
		`- Estimated time window: ${request.preferredTimeWindow || 'Not sure'}`,
		`- Sport: ${request.sport}`,
		`- Level: ${request.level}`,
		`- Group size: ${request.groupSize}`,
		`- Preference: ${request.lessonPreference}`,
		`- Language: ${request.language}`,
		`- Message: ${(request.message || 'No extra message').slice(0, 240)}`
	].join('\n');

	return {
		to: adminEmail,
		subject,
		html,
		telegramMessage
	};
}

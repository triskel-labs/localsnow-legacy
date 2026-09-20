import { fail, type Actions } from '@sveltejs/kit';

import {
	buildLessonHelpNotification,
	parseLessonHelpFormData
} from '$src/features/LessonHelp/lib/lessonHelpIntake';
import { emailService } from '$lib/server/email/service';
import { extractLocale, type Locale } from '$lib/i18n/routes';

export const actions: Actions = {
	default: async ({ request, url }) => {
		const formData = await request.formData();

		// Honeypot: real users never see/fill this field. Return success silently for bots.
		if (formData.get('company')) {
			return { success: true };
		}

		const parsed = parseLessonHelpFormData(formData);
		if (!parsed.success) {
			return fail(400, {
				values: parsed.values,
				fieldErrors: parsed.fieldErrors,
				message: 'lesson_help_error_copy'
			});
		}

		const locale = (extractLocale(url.pathname).locale || 'en') as Locale;
		const notification = buildLessonHelpNotification(parsed.data, locale);

		try {
			await emailService.send({
				to: notification.to,
				subject: notification.subject,
				html: notification.html,
				sendTelegram: true,
				telegramMessage: notification.telegramMessage
			});
		} catch (error) {
			console.error('[LessonHelp] Failed to send assisted lesson request:', error);
			return fail(500, {
				values: parsed.values,
				fieldErrors: {},
				message: 'lesson_help_error_copy'
			});
		}

		return {
			success: true,
			message: 'lesson_help_success_copy'
		};
	}
};

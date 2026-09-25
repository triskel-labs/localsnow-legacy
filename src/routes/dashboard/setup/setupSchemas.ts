import { z } from 'zod';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_DOC_TYPES = ['application/pdf'];

const imageFileSchema = z
	.instanceof(File)
	.optional()
	.refine((f) => !f || f.size <= MAX_IMAGE_SIZE, { message: 'Image must be less than 5MB' })
	.refine((f) => !f || ALLOWED_IMAGE_TYPES.includes(f.type), {
		message: 'Only JPEG, PNG, and WebP images are allowed'
	});

const documentFileSchema = z
	.instanceof(File)
	.optional()
	.refine((f) => !f || f.size <= MAX_DOC_SIZE, { message: 'Document must be less than 10MB' })
	.refine((f) => !f || ALLOWED_DOC_TYPES.includes(f.type), {
		message: 'Only PDF documents are allowed'
	});

/** Step 1 — contact info + qualification + optional photo/bio */
export const setupBasicsSchema = z.object({
	professionalCountryCode: z.coerce.number().min(1, 'Choose Country Phone Prefix'),
	professionalPhone: z.string().min(1, 'Phone number is required'),
	bio: z.string().optional(),
	profileImage: imageFileSchema,
	qualification: documentFileSchema
});

/** Step 2 — resort + sports */
export const setupTeachingSchema = z.object({
	resort: z.coerce.number().min(1, 'Select one primary resort'),
	sports: z.array(z.number()).min(1, 'Select at least one sport')
});

/** Step 3 — first requestable/default offer (independent instructors only) */
export const setupRateSchema = z.object({
	title: z.string().trim().min(1, 'Name your first offer'),
	description: z
		.string()
		.trim()
		.min(12, 'Add a short client-facing description')
		.max(600, 'Keep the first offer description short'),
	duration: z.string().trim().min(1, 'Choose a duration'),
	basePrice: z.coerce.number().int().positive('Price must be greater than 0'),
	currency: z.string().min(1, 'Select currency')
});

export const setupAvailabilitySchema = z
	.object({
		weeklyPattern: z.enum(['weekdays', 'weekends', 'all_days']),
		startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a start time'),
		endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Choose an end time')
	})
	.refine((data) => data.endTime > data.startTime, {
		message: 'End time must be after start time'
	});

export type SetupBasicsSchema = typeof setupBasicsSchema;
export type SetupTeachingSchema = typeof setupTeachingSchema;
export type SetupRateSchema = typeof setupRateSchema;
export type SetupAvailabilitySchema = typeof setupAvailabilitySchema;

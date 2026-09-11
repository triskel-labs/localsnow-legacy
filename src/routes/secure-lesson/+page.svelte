<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { CalendarGrid } from '$src/lib/components/calendar-grid';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	import {
		LESSON_HELP_WHATSAPP_DISPLAY,
		LESSON_HELP_WHATSAPP_URL
	} from '$src/features/LessonHelp/lib/lessonHelpIntake';
	import type { ActionData } from './$types';

	let { form } = $props<{ form?: ActionData }>();

	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const canonicalPath = $derived(route('/secure-lesson', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls('/secure-lesson').map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
	const instructorsPath = $derived(route('/instructors', currentLocale));

	const values = $derived(form?.values ?? {});
	const fieldErrors = $derived(form && 'fieldErrors' in form ? form.fieldErrors : {});
	let selectedPreferredDates = $state<string[]>([]);

	$effect(() => {
		selectedPreferredDates = String(values.preferredDates ?? '')
			.split(',')
			.map((date) => date.trim())
			.filter(Boolean);
	});

	const valueOf = (field: string) => values[field] ?? '';
	const errorOf = (field: string) => fieldErrors?.[field];
</script>

<svelte:head>
	<title>{$t('lesson_help_meta_title')}</title>
	<meta name="description" content={$t('lesson_help_meta_description')} />
	<meta property="og:title" content={$t('lesson_help_meta_title')} />
	<meta property="og:description" content={$t('lesson_help_meta_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<header class="mb-8">
		<p class="text-primary mb-2 text-sm font-semibold tracking-wide uppercase">
			{$t('lesson_help_eyebrow')}
		</p>
		<h1 class="title2">{$t('lesson_help_title')}</h1>
		<p class="text-muted-foreground text-lg leading-8">
			{$t('lesson_help_lede')}
		</p>
	</header>

	{#if form?.success}
		<div class="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-950">
			<h2 class="text-lg font-bold">{$t('lesson_help_success_title')}</h2>
			<p class="mt-2 text-sm leading-6">{$t('lesson_help_success_copy')}</p>
		</div>
	{/if}

	{#if form?.message && !form?.success}
		<div class="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
			{$t(form.message)}
		</div>
	{/if}

	<p class="text-muted-foreground mb-4 text-sm">
		{$t('lesson_help_contact_intro')}
		<a
			href={LESSON_HELP_WHATSAPP_URL}
			target="_blank"
			rel="noreferrer"
			class="font-semibold text-green-700 hover:underline"
		>
			{$t('lesson_help_whatsapp_cta')}
		</a>
	</p>

	<form method="POST" class="space-y-5">
		<input type="text" name="company" class="hidden" tabindex="-1" autocomplete="off" />

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-semibold">
				{$t('lesson_help_name_label')}
				<input
					name="name"
					value={valueOf('name')}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
				{#if errorOf('name')}<span class="mt-1 block text-xs text-rose-700"
					>{errorOf('name')}</span
				>{/if}
			</label>
			<label class="block text-sm font-semibold">
				{$t('lesson_help_email_label')}
				<input
					name="email"
					type="email"
					value={valueOf('email')}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
				{#if errorOf('email')}<span class="mt-1 block text-xs text-rose-700"
					>{errorOf('email')}</span
				>{/if}
			</label>
		</div>

		<label class="block text-sm font-semibold">
			{$t('lesson_help_phone_label')}
			<input
				name="phone"
				value={valueOf('phone')}
				class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
			/>
		</label>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-semibold">
				{$t('lesson_help_resort_label')}
				<input
					name="resort"
					value={valueOf('resort')}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
				{#if errorOf('resort')}<span class="mt-1 block text-xs text-rose-700"
					>{errorOf('resort')}</span
				>{/if}
			</label>
			<label class="block text-sm font-semibold">
				{$t('lesson_help_dates_label')}
				<input
					name="dates"
					value={valueOf('dates')}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
				{#if errorOf('dates')}<span class="mt-1 block text-xs text-rose-700"
					>{errorOf('dates')}</span
				>{/if}
			</label>
		</div>

		<section class="not-prose rounded-lg border bg-card p-4">
			<div class="mb-4 space-y-1">
				<h2 class="text-base font-semibold">{$t('lesson_help_preferred_dates_title')}</h2>
				<p class="text-sm text-muted-foreground">{$t('lesson_help_preferred_dates_copy')}</p>
			</div>
			<input type="hidden" name="preferredDates" value={selectedPreferredDates.join(',')} />
			<CalendarGrid type="multiple" bind:selected={selectedPreferredDates} disablePast class="mx-auto max-w-md" />
			{#if selectedPreferredDates.length > 0}
				<p class="mt-3 text-xs text-muted-foreground">
					{$t('lesson_help_preferred_dates_selected')}: {selectedPreferredDates.join(', ')}
				</p>
			{/if}
			<label class="mt-4 block text-sm font-semibold">
				{$t('lesson_help_time_window_label')}
				<select
					name="preferredTimeWindow"
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				>
					<option value="" selected={valueOf('preferredTimeWindow') === ''}
						>{$t('lesson_help_time_window_not_sure')}</option
					>
					<option value="morning" selected={valueOf('preferredTimeWindow') === 'morning'}
						>{$t('lesson_help_time_window_morning')}</option
					>
					<option value="midday" selected={valueOf('preferredTimeWindow') === 'midday'}
						>{$t('lesson_help_time_window_midday')}</option
					>
					<option value="afternoon" selected={valueOf('preferredTimeWindow') === 'afternoon'}
						>{$t('lesson_help_time_window_afternoon')}</option
					>
					<option value="flexible" selected={valueOf('preferredTimeWindow') === 'flexible'}
						>{$t('lesson_help_time_window_flexible')}</option
					>
				</select>
			</label>
		</section>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-semibold">
				{$t('lesson_help_sport_label')}
				<select
					name="sport"
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				>
					<option value="ski" selected={valueOf('sport') === 'ski'}
						>{$t('lesson_help_sport_ski')}</option
					>
					<option value="snowboard" selected={valueOf('sport') === 'snowboard'}
						>{$t('lesson_help_sport_snowboard')}</option
					>
					<option value="both" selected={valueOf('sport') === 'both'}
						>{$t('lesson_help_sport_both')}</option
					>
					<option value="not_sure" selected={valueOf('sport') === 'not_sure'}
						>{$t('lesson_help_not_sure')}</option
					>
				</select>
			</label>
			<label class="block text-sm font-semibold">
				{$t('lesson_help_level_label')}
				<input
					name="level"
					value={valueOf('level')}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
			</label>
		</div>

		<div class="grid gap-4 sm:grid-cols-2">
			<label class="block text-sm font-semibold">
				{$t('lesson_help_group_size_label')}
				<input
					name="groupSize"
					type="number"
					min="1"
					max="30"
					value={valueOf('groupSize') || '1'}
					required
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				/>
				{#if errorOf('groupSize')}<span class="mt-1 block text-xs text-rose-700"
					>{errorOf('groupSize')}</span
				>{/if}
			</label>
			<label class="block text-sm font-semibold">
				{$t('lesson_help_preference_label')}
				<select
					name="lessonPreference"
					class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				>
					<option value="private" selected={valueOf('lessonPreference') === 'private'}
						>{$t('lesson_help_preference_private')}</option
					>
					<option value="group" selected={valueOf('lessonPreference') === 'group'}
						>{$t('lesson_help_preference_group')}</option
					>
					<option value="either" selected={valueOf('lessonPreference') === 'either'}
						>{$t('lesson_help_preference_either')}</option
					>
					<option value="not_sure" selected={valueOf('lessonPreference') === 'not_sure'}
						>{$t('lesson_help_not_sure')}</option
					>
				</select>
			</label>
		</div>

		<label class="block text-sm font-semibold">
			{$t('lesson_help_language_label')}
			<input
				name="language"
				value={valueOf('language')}
				required
				class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
			/>
		</label>

		<label class="block text-sm font-semibold">
			{$t('lesson_help_message_label')}
			<textarea
				name="message"
				rows="4"
				class="border-input bg-background mt-2 w-full rounded-md border px-3 py-2 text-sm"
				>{valueOf('message')}</textarea
			>
		</label>

		<button
			type="submit"
			class="bg-primary hover:bg-primary/90 w-full rounded-md px-5 py-3 text-sm font-bold text-white shadow-sm transition"
		>
			{$t('lesson_help_submit')}
		</button>
	</form>
</article>

<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	import { LESSON_HELP_WHATSAPP_URL } from '$src/features/LessonHelp/lib/lessonHelpIntake';

	const PRIMARY_ORIGIN = 'https://localsnow.org';
	const contactEmail = 'admin@localsnow.org';
	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const canonicalPath = $derived(route('/help', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls('/help').map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
	const defaultAlternate = $derived(alternates.find((alt) => alt.locale === 'en'));
	const secureLessonPath = $derived(route('/secure-lesson', currentLocale));
</script>

<svelte:head>
	<title>{$t('help_meta_title')}</title>
	<meta name="description" content={$t('help_meta_description')} />
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
</svelte:head>

<article class="prose prose-sm mx-auto max-w-3xl">
	<header class="mb-8">
		<p class="text-primary mb-2 text-sm font-semibold tracking-wide uppercase">
			{$t('help_eyebrow')}
		</p>
		<h1 class="title2">{$t('help_title')}</h1>
		<p class="text-muted-foreground text-lg leading-8">
			{$t('help_lede')}
		</p>
	</header>

	<section class="space-y-8">
		<div>
			<h2 class="title3 mb-2">{$t('help_lesson_title')}</h2>
			<p class="text-muted-foreground mb-4 text-sm leading-6">{$t('help_lesson_copy')}</p>
			<div class="flex flex-wrap gap-3">
				<a
					href={secureLessonPath}
					class="bg-primary hover:bg-primary/90 inline-flex rounded-md px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition"
				>
					{$t('help_lesson_cta')}
				</a>
				<a
					href={LESSON_HELP_WHATSAPP_URL}
					target="_blank"
					rel="noreferrer"
					class="inline-flex rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
				>
					{$t('help_lesson_whatsapp_cta')}
				</a>
			</div>
		</div>

		<div>
			<h2 class="title3 mb-2">{$t('help_general_title')}</h2>
			<p class="text-muted-foreground mb-4 text-sm leading-6">{$t('help_general_copy')}</p>
			<a
				href="mailto:{contactEmail}"
				class="border-border bg-card hover:bg-muted inline-flex rounded-md border px-5 py-2.5 text-sm font-semibold"
			>
				{$t('help_general_cta')}
			</a>
		</div>
	</section>
</article>

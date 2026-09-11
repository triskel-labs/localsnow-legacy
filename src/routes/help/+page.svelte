<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { extractLocale, type Locale } from '$lib/i18n/routes';
	import {
		LESSON_HELP_WHATSAPP_DISPLAY,
		LESSON_HELP_WHATSAPP_URL
	} from '$src/features/LessonHelp/lib/lessonHelpIntake';

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
	const contactPath = $derived(route('/contact', currentLocale));
	const instructorsPath = $derived(route('/instructors', currentLocale));
	const joinPath = $derived(route('/instructors/join', currentLocale));

	const helpPageSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name: $t('help_meta_title'),
		description: $t('help_meta_description'),
		url: canonicalUrl,
		mainEntity: {
			'@type': 'Organization',
			name: 'LocalSnow',
			email: contactEmail,
			contactPoint: [
				{
					'@type': 'ContactPoint',
					contactType: 'customer support',
					telephone: LESSON_HELP_WHATSAPP_DISPLAY,
					availableLanguage: ['en', 'es']
				}
			]
		}
	});
</script>

<svelte:head>
	<title>{$t('help_meta_title')}</title>
	<meta name="description" content={$t('help_meta_description')} />
	<meta property="og:title" content={$t('help_meta_title')} />
	<meta property="og:description" content={$t('help_meta_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
	{#if defaultAlternate}
		<link rel="alternate" hreflang="x-default" href={defaultAlternate.url} />
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(helpPageSchema)}<\/script>`}
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

	<section class="grid gap-4 md:grid-cols-2">
		<article class="border-border bg-card rounded-lg border p-5 shadow-sm">
			<p class="text-primary text-sm font-semibold">{$t('help_lesson_channel')}</p>
			<h2 class="title3 mt-2 mb-2">{$t('help_lesson_title')}</h2>
			<p class="text-muted-foreground text-sm leading-6">{$t('help_lesson_copy')}</p>
			<div class="mt-4 flex flex-wrap gap-3">
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
		</article>

		<article class="border-border bg-card rounded-lg border p-5 shadow-sm">
			<p class="text-primary text-sm font-semibold">{$t('help_payment_channel')}</p>
			<h2 class="title3 mt-2 mb-2">{$t('help_payment_title')}</h2>
			<p class="text-muted-foreground text-sm leading-6">{$t('help_payment_copy')}</p>
			<a
				href={contactPath}
				class="border-border bg-card hover:bg-muted mt-4 inline-flex rounded-md border px-5 py-2.5 text-sm font-semibold"
			>
				{$t('help_payment_cta')}
			</a>
		</article>

		<article class="border-border bg-card rounded-lg border p-5 shadow-sm">
			<p class="text-primary text-sm font-semibold">{$t('help_issue_channel')}</p>
			<h2 class="title3 mt-2 mb-2">{$t('help_issue_title')}</h2>
			<p class="text-muted-foreground text-sm leading-6">{$t('help_issue_copy')}</p>
			<a
				href={LESSON_HELP_WHATSAPP_URL}
				target="_blank"
				rel="noreferrer"
				class="mt-4 inline-flex rounded-md bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500"
			>
				{$t('help_issue_cta')}
			</a>
		</article>

		<article class="border-border bg-card rounded-lg border p-5 shadow-sm">
			<p class="text-primary text-sm font-semibold">{$t('help_provider_channel')}</p>
			<h2 class="title3 mt-2 mb-2">{$t('help_provider_title')}</h2>
			<p class="text-muted-foreground text-sm leading-6">{$t('help_provider_copy')}</p>
			<a
				href={joinPath}
				class="border-border bg-card hover:bg-muted mt-4 inline-flex rounded-md border px-5 py-2.5 text-sm font-semibold"
			>
				{$t('help_provider_cta')}
			</a>
		</article>
	</section>

	<section class="border-border bg-card my-8 rounded-lg border p-6 shadow-sm">
		<h2 class="title3 mb-2">{$t('help_general_title')}</h2>
		<p class="text-muted-foreground text-sm leading-6">{$t('help_general_copy')}</p>
		<div class="mt-4 flex flex-wrap gap-3">
			<a
				href="mailto:{contactEmail}"
				class="border-border bg-card hover:bg-muted inline-flex rounded-md border px-5 py-2.5 text-sm font-semibold"
			>
				{$t('help_general_cta')}
			</a>
			<a
				href={instructorsPath}
				class="text-muted-foreground inline-flex items-center px-1 py-2.5 text-sm font-semibold underline"
			>
				{$t('help_browse_cta')}
			</a>
		</div>
	</section>

	<section class="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm">
		<h2 class="text-base font-bold">{$t('help_boundary_title')}</h2>
		<p class="mt-2 text-sm leading-6">{$t('help_boundary_copy')}</p>
	</section>
</article>

<script lang="ts">
	import { page } from '$app/state';
	import { t } from '$lib/i18n/i18n';
	import { getAlternateUrls, route } from '$lib/i18n/routeHelpers';
	import { extractLocale, type Locale } from '$lib/i18n/routes';

	const PRIMARY_ORIGIN = 'https://localsnow.org';

	const currentLocale = $derived((extractLocale(page.url.pathname).locale || 'en') as Locale);
	const canonicalPath = $derived(route('/instructors/join', currentLocale));
	const canonicalUrl = $derived(`${PRIMARY_ORIGIN}${canonicalPath}`);
	const alternates = $derived(
		getAlternateUrls('/instructors/join').map((alt) => ({
			locale: alt.locale,
			url: `${PRIMARY_ORIGIN}${alt.url}`
		}))
	);
</script>

<svelte:head>
	<title>{$t('join_instructors_meta_title')}</title>
	<meta name="description" content={$t('join_instructors_meta_description')} />
	<meta property="og:title" content={$t('join_instructors_meta_title')} />
	<meta property="og:description" content={$t('join_instructors_meta_description')} />
	<meta property="og:url" content={canonicalUrl} />
	<link rel="canonical" href={canonicalUrl} />
	{#each alternates as alt}
		<link rel="alternate" hreflang={alt.locale} href={alt.url} />
	{/each}
</svelte:head>

<main class="bg-slate-950 text-white">
	<section class="px-4 py-20 sm:px-6 lg:px-8">
		<div class="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
			<div>
				<p class="mb-4 text-sm font-semibold tracking-[0.24em] text-sky-300 uppercase">
					{$t('join_instructors_eyebrow')}
				</p>
				<h1 class="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
					{$t('join_instructors_title')}
				</h1>
				<p class="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
					{$t('join_instructors_lede')}
				</p>
				<div class="mt-8 flex flex-col gap-3 sm:flex-row">
					<a
						href={route('/signup')}
						class="inline-flex items-center justify-center rounded-md bg-sky-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-sky-300"
					>
						{$t('join_instructors_primary_cta')}
					</a>
					<a
						href={route('/instructors')}
						class="inline-flex items-center justify-center rounded-md border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
					>
						{$t('join_instructors_secondary_cta')}
					</a>
				</div>
			</div>

			<div class="rounded-3xl border border-white/10 bg-white/8 p-6 shadow-2xl shadow-sky-950/30">
				<p class="text-sm font-semibold text-sky-200">{$t('join_instructors_status_label')}</p>
				<p class="mt-3 text-2xl font-semibold text-white">{$t('join_instructors_status_title')}</p>
				<p class="mt-4 text-sm leading-7 text-slate-300">{$t('join_instructors_status_copy')}</p>
				<ul class="mt-6 space-y-3 text-sm text-slate-200">
					<li>✓ {$t('join_instructors_signal_profile')}</li>
					<li>✓ {$t('join_instructors_signal_review')}</li>
					<li>✓ {$t('join_instructors_signal_control')}</li>
				</ul>
			</div>
		</div>
	</section>

	<section class="bg-white px-4 py-16 text-slate-950 sm:px-6 lg:px-8">
		<div class="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
			<article class="rounded-2xl border border-slate-200 p-6 shadow-sm">
				<p class="text-sm font-semibold text-sky-700">{$t('join_instructors_card_1_label')}</p>
				<h2 class="mt-2 text-xl font-bold">{$t('join_instructors_card_1_title')}</h2>
				<p class="mt-3 text-sm leading-6 text-slate-600">{$t('join_instructors_card_1_copy')}</p>
			</article>
			<article class="rounded-2xl border border-slate-200 p-6 shadow-sm">
				<p class="text-sm font-semibold text-sky-700">{$t('join_instructors_card_2_label')}</p>
				<h2 class="mt-2 text-xl font-bold">{$t('join_instructors_card_2_title')}</h2>
				<p class="mt-3 text-sm leading-6 text-slate-600">{$t('join_instructors_card_2_copy')}</p>
			</article>
			<article class="rounded-2xl border border-slate-200 p-6 shadow-sm">
				<p class="text-sm font-semibold text-sky-700">{$t('join_instructors_card_3_label')}</p>
				<h2 class="mt-2 text-xl font-bold">{$t('join_instructors_card_3_title')}</h2>
				<p class="mt-3 text-sm leading-6 text-slate-600">{$t('join_instructors_card_3_copy')}</p>
			</article>
		</div>
	</section>
</main>

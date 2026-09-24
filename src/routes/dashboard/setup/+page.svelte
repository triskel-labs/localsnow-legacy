<script lang="ts">
	import { superForm, fileProxy } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { setupBasicsSchema, setupTeachingSchema, setupRateSchema } from './setupSchemas';
	import { buildSetupReviewSurface } from '$src/features/ProviderOnboarding/lib/setupReviewSurface';
	import Button from '$src/lib/components/ui/button/button.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import CountryCodeSelect from '$src/lib/components/shared/CountryCodeSelect.svelte';
	import CurrencySelect from '$src/lib/components/shared/CurrencySelect.svelte';
	import SearchResort from '$src/features/Resorts/components/SearchResort.svelte';
	import SportsCheckboxes from '$src/features/Sports/components/SportsCheckboxes.svelte';

	let { data } = $props();

	const providerReadiness = $derived(data.providerReadiness);
	const setupSurface = $derived(buildSetupReviewSurface(providerReadiness));
	const currentStep = $derived(data.currentStep);
	const totalSteps = $derived(data.totalSteps);
	const isSchool = $derived(data.isSchool);

	// ── Step 1: Contact info + optional photo ──────────────────────────────
	const basicsFormObj = superForm(data.basicsForm, {
		validators: zodClient(setupBasicsSchema),
		id: 'basics'
	});
	const { form: basicsData, enhance: enhanceBasics, submitting: submittingBasics } = basicsFormObj;
	const profileImageProxy = fileProxy(basicsFormObj, 'profileImage');
	const qualificationProxy = fileProxy(basicsFormObj, 'qualification');

	// ── Step 2: Resort + Sports ────────────────────────────────────────────
	const teachingFormObj = superForm(data.teachingForm, {
		validators: zodClient(setupTeachingSchema),
		dataType: 'json',
		id: 'teaching'
	});
	const {
		form: teachingData,
		enhance: enhanceTeaching,
		submitting: submittingTeaching
	} = teachingFormObj;

	// ── Step 3: Base rate (independent only) ──────────────────────────────
	const rateFormObj = superForm(data.rateForm, {
		validators: zodClient(setupRateSchema),
		id: 'rate'
	});
	const { form: rateData, enhance: enhanceRate, submitting: submittingRate } = rateFormObj;

	const steps = $derived(
		isSchool
			? [{ label: 'Contact' }, { label: 'Teaching' }]
			: [{ label: 'Contact' }, { label: 'Teaching' }, { label: 'Your Rate' }]
	);

	const stepTitles = [
		'Prepare your profile',
		'Choose your primary teaching area',
		'Create your default offer'
	];
	const stepSubtitles = [
		'Private contact plus public professional basics. Proof can come before reviewed status.',
		'Choose one primary resort and the sports clients can request from you.',
		'Turn your first lesson into something a client can understand and request.'
	];
</script>

<div class="container mx-auto max-w-xl py-8">
	<!-- Header -->
	<div class="mb-8 text-center">
		<div class="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
			<svg class="text-primary h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
		</div>
		<h1 class="title2 mb-1">{stepTitles[currentStep - 1]}</h1>
		<p class="text-muted-foreground text-sm">{stepSubtitles[currentStep - 1]}</p>
	</div>

	<!-- Provider setup journey -->
	<section class="border-border bg-card mb-8 overflow-hidden rounded-[1.75rem] border shadow-sm">
		<div class="bg-muted/30 border-border border-b p-5">
			<div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<p class="text-primary text-xs font-semibold tracking-wide uppercase">Provider setup</p>
					<h2 class="mt-1 text-2xl leading-tight font-semibold">{setupSurface.headline}</h2>
					<p class="text-muted-foreground mt-2 text-sm leading-relaxed">{setupSurface.subtitle}</p>
				</div>
				<div
					class="bg-primary text-primary-foreground w-fit rounded-full px-3 py-1 text-sm font-semibold"
				>
					{setupSurface.primaryCue}
				</div>
			</div>

			<div class="space-y-2">
				<div class="flex items-center justify-between text-xs font-semibold">
					<span>{setupSurface.progressLabel}</span>
					<span>{setupSurface.progressPercent}%</span>
				</div>
				<div class="bg-background h-2 overflow-hidden rounded-full">
					<div
						class="bg-primary h-full rounded-full transition-[width] duration-500"
						style="width: {setupSurface.progressPercent}%"
					></div>
				</div>
			</div>
		</div>

		<div class="grid gap-3 p-4">
			{#each setupSurface.stages as stage (stage.key)}
				<a
					href={stage.href}
					class="group flex items-start gap-3 rounded-2xl border p-4 transition-all {stage.state ===
					'active'
						? 'border-primary bg-primary/10 shadow-sm'
						: stage.state === 'complete'
							? 'border-green-200 bg-green-50'
							: 'border-border bg-background hover:bg-muted/40'}"
				>
					<div
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold {stage.state ===
						'complete'
							? 'bg-green-600 text-white'
							: stage.state === 'active'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
					>
						{stage.state === 'complete' ? '✓' : stage.stageNumber}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<p class="font-semibold">{stage.label}</p>
							<span
								class="rounded-full px-2 py-0.5 text-[11px] font-semibold {stage.state === 'active'
									? 'bg-primary text-primary-foreground'
									: stage.state === 'complete'
										? 'bg-green-100 text-green-800'
										: 'bg-muted text-muted-foreground'}"
							>
								{stage.stateLabel}
							</span>
						</div>
						<p class="text-muted-foreground mt-1 text-sm leading-relaxed">{stage.description}</p>
						<p
							class="mt-2 text-xs leading-relaxed {stage.state === 'active'
								? 'text-primary'
								: 'text-muted-foreground'}"
						>
							{stage.mobileCue}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- Step indicator -->
	<div class="mb-8 flex items-center justify-center">
		{#each steps as step, i}
			{@const stepNum = i + 1}
			{@const isActive = stepNum === currentStep}
			{@const isDone = stepNum < currentStep}
			<div class="flex items-center">
				<div class="flex flex-col items-center gap-1">
					<div
						class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors
						{isDone
							? 'bg-green-600 text-white'
							: isActive
								? 'bg-primary text-primary-foreground'
								: 'bg-muted text-muted-foreground'}"
					>
						{#if isDone}
							<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2.5"
									d="M5 13l4 4L19 7"
								/>
							</svg>
						{:else}
							{stepNum}
						{/if}
					</div>
					<span class="text-xs {isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}"
						>{step.label}</span
					>
				</div>
				{#if i < steps.length - 1}
					<div class="bg-border mx-3 mb-4 h-px w-10"></div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- ── STEP 1: Contact info ──────────────────────────────────────────── -->
	{#if currentStep === 1}
		<form
			method="POST"
			action="?/saveBasics"
			use:enhanceBasics
			enctype="multipart/form-data"
			class="space-y-5"
		>
			<section class="border-border bg-muted/30 rounded-2xl border p-4 text-sm">
				<p class="font-semibold">Private personal data vs public professional profile</p>
				<div class="mt-3 grid gap-3 sm:grid-cols-2">
					<div>
						<p class="text-xs font-semibold tracking-wide uppercase">Private personal data</p>
						<p class="text-muted-foreground mt-1 text-xs">
							Your account name, email, and internal contact details stay for LocalSnow operations
							and review.
						</p>
					</div>
					<div>
						<p class="text-xs font-semibold tracking-wide uppercase">Public professional profile</p>
						<p class="text-muted-foreground mt-1 text-xs">
							Independent instructors are shown as first name + surname initial. Schools use a
							separate public school/professional name.
						</p>
					</div>
				</div>
			</section>

			<!-- Phone -->
			<div class="grid grid-cols-[1fr_2fr] items-end gap-3">
				<CountryCodeSelect form={basicsFormObj} name="professionalCountryCode" />
				<Form.Field form={basicsFormObj} name="professionalPhone">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Phone <span class="text-red-500">*</span></Form.Label>
							<Input
								{...props}
								bind:value={$basicsData.professionalPhone}
								placeholder="XXX XXX XXXX"
								autocomplete="tel"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>

			<!-- Bio (optional) -->
			<Form.Field form={basicsFormObj} name="bio">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Bio
							<span class="text-muted-foreground ml-1 text-xs">(optional)</span>
						</Form.Label>
						<Textarea
							{...props}
							bind:value={$basicsData.bio}
							placeholder="Tell students about your teaching style and experience…"
							rows={4}
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Profile photo (optional) -->
			<Form.Field form={basicsFormObj} name="profileImage">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Profile photo
							<span class="text-muted-foreground ml-1 text-xs">(optional)</span>
						</Form.Label>
						<Input
							{...props}
							type="file"
							accept="image/jpeg,image/jpg,image/png,image/webp"
							bind:files={$profileImageProxy}
							class="cursor-pointer"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<!-- Qualification certificate (optional until LocalSnow review) -->
			<Form.Field form={basicsFormObj} name="qualification">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>
							Qualification certificate
							<span class="text-muted-foreground ml-1 text-xs">optional now</span>
						</Form.Label>
						<Input
							{...props}
							type="file"
							accept="application/pdf"
							bind:files={$qualificationProxy}
							class="cursor-pointer"
						/>
						<p class="text-muted-foreground mt-1 text-xs">
							Upload a PDF now if you have it. LocalSnow can ask for proof before
							reviewed/trustworthy status.
						</p>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Button type="submit" class="w-full" size="lg" disabled={$submittingBasics}>
				{#if $submittingBasics}
					<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
						<circle
							class="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							stroke-width="4"
						/>
						<path
							class="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
						/>
					</svg>
					Saving…
				{:else}
					Continue →
				{/if}
			</Button>
		</form>

		<!-- ── STEP 2: Resort + Sports ───────────────────────────────────────── -->
	{:else if currentStep === 2}
		<form method="POST" action="?/saveTeaching" use:enhanceTeaching class="space-y-5">
			<SearchResort form={teachingFormObj} name="resort" />

			<SportsCheckboxes form={teachingFormObj} name="sports" />

			<div class="flex gap-3">
				<a href="?step=1" class="flex-1">
					<Button variant="outline" class="w-full" type="button">← Back</Button>
				</a>
				<Button type="submit" class="flex-1" size="default" disabled={$submittingTeaching}>
					{#if $submittingTeaching}
						<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Saving…
					{:else}
						{isSchool ? 'Finish ✓' : 'Continue →'}
					{/if}
				</Button>
			</div>
		</form>

		<!-- ── STEP 3: Default offer (independent only) ───────────────────────── -->
	{:else if currentStep === 3}
		<form method="POST" action="?/saveRate" use:enhanceRate class="space-y-5">
			<section class="border-border bg-muted/30 rounded-2xl border p-4 text-sm">
				<p class="font-semibold">First requestable lesson</p>
				<p class="text-muted-foreground mt-1 text-xs leading-relaxed">
					This creates or updates your default offer using the existing lessons data. Keep it
					simple: what the client is asking for, the usual session length, and the hourly price.
				</p>
			</section>

			<Form.Field form={rateFormObj} name="title">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Offer name <span class="text-red-500">*</span></Form.Label>
						<Input
							{...props}
							bind:value={$rateData.title}
							placeholder="Private ski lesson"
							autocomplete="off"
						/>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Form.Field form={rateFormObj} name="description">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label>Client-facing description <span class="text-red-500">*</span></Form.Label>
						<Textarea
							{...props}
							bind:value={$rateData.description}
							placeholder="For beginner and intermediate skiers who want focused help on piste."
							rows={4}
						/>
						<Form.Description>
							Say who this first offer is for. You can add packages and finer pricing later.
						</Form.Description>
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<div class="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
				<Form.Field form={rateFormObj} name="duration">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Usual duration <span class="text-red-500">*</span></Form.Label>
							<Input
								{...props}
								bind:value={$rateData.duration}
								placeholder="2h"
								autocomplete="off"
							/>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field form={rateFormObj} name="basePrice">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Starting hourly price <span class="text-red-500">*</span></Form.Label>
							<Input
								{...props}
								type="number"
								min="1"
								bind:value={$rateData.basePrice}
								placeholder="e.g. 60"
							/>
							<Form.Description>
								This remains an hourly rate. The usual duration above describes the typical session
								length, not the price unit.
							</Form.Description>
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<CurrencySelect form={rateFormObj} name="currency" />
			</div>

			<p class="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800">
				This is enough for LocalSnow to route a real first request. Group pricing, duration
				packages, and promo codes can stay in the Lessons page until the base offer is clear.
			</p>

			<div class="flex gap-3">
				<a href="?step=2" class="flex-1">
					<Button variant="outline" class="w-full" type="button">← Back</Button>
				</a>
				<Button type="submit" class="flex-1" disabled={$submittingRate}>
					{#if $submittingRate}
						<svg class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							/>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
							/>
						</svg>
						Saving…
					{:else}
						Finish ✓
					{/if}
				</Button>
			</div>
		</form>
	{/if}

	<!-- Skip link -->
	<div class="mt-8 text-center">
		<a
			href="/dashboard"
			class="text-muted-foreground hover:text-foreground text-xs transition-colors"
		>
			Skip for now — I'll finish later
		</a>
	</div>
</div>

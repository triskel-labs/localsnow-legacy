<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Badge } from '$src/lib/components/ui/badge';
	import { Button } from '$src/lib/components/ui/button';
	import * as Card from '$src/lib/components/ui/card';
	import { Input } from '$src/lib/components/ui/input';
	import { Label } from '$src/lib/components/ui/label';
	import { Switch } from '$src/lib/components/ui/switch';
	import { CalendarGrid } from '$src/lib/components/calendar-grid';
	import { cn } from '$src/lib/utils';
	import {
		getDashboardDaySummary,
		seasonWindow,
		type DashboardCalendarBlock,
		type DashboardDayStatus,
		type DashboardWorkingHour
	} from '$src/features/Availability/lib/dashboardAvailability';
	import {
		CalendarDays,
		CheckCircle2,
		Clock3,
		Link2,
		RefreshCw,
		ShieldCheck
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type WorkingDay = {
		dayOfWeek: number;
		label: string;
		shortLabel: string;
		isEnabled: boolean;
		startTime: string;
		endTime: string;
	};

	const orderedDays = [
		{ dayOfWeek: 1, label: 'Monday', shortLabel: 'Mon' },
		{ dayOfWeek: 2, label: 'Tuesday', shortLabel: 'Tue' },
		{ dayOfWeek: 3, label: 'Wednesday', shortLabel: 'Wed' },
		{ dayOfWeek: 4, label: 'Thursday', shortLabel: 'Thu' },
		{ dayOfWeek: 5, label: 'Friday', shortLabel: 'Fri' },
		{ dayOfWeek: 6, label: 'Saturday', shortLabel: 'Sat' },
		{ dayOfWeek: 0, label: 'Sunday', shortLabel: 'Sun' }
	];

	const existingSeason = seasonWindow(data.workingHours);
	let seasonStart = $state(existingSeason.seasonStart);
	let seasonEnd = $state(existingSeason.seasonEnd);
	let saving = $state(false);
	let syncing = $state(false);
	let disconnecting = $state(false);
	let focusedDate = $state('');

	let workingDays = $state<WorkingDay[]>(
		orderedDays.map((day) => {
			const existing = data.workingHours.find((hour) => hour.dayOfWeek === day.dayOfWeek);
			return {
				...day,
				isEnabled: Boolean(existing),
				startTime: existing?.startTime ?? '09:00',
				endTime: existing?.endTime ?? '16:00'
			};
		})
	);

	const workingHoursForPreview = $derived<DashboardWorkingHour[]>(
		workingDays
			.filter((day) => day.isEnabled)
			.map((day) => ({
				dayOfWeek: day.dayOfWeek,
				startTime: day.startTime,
				endTime: day.endTime,
				seasonStart: seasonStart || null,
				seasonEnd: seasonEnd || null,
				isActive: true
			}))
	);

	const enabledDaysCount = $derived(workingDays.filter((day) => day.isEnabled).length);
	const hasConfiguredAvailability = $derived(enabledDaysCount > 0);
	const visibleStatuses = $derived.by(() => {
		const counts: Record<DashboardDayStatus, number> = {
			unconfigured: 0,
			unavailable: 0,
			available: 0,
			partial: 0,
			blocked: 0
		};
		const now = new Date();
		for (let index = 0; index < 45; index += 1) {
			const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + index);
			const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
				date.getDate()
			).padStart(2, '0')}`;
			counts[getDaySummary(iso).status] += 1;
		}
		return counts;
	});

	const focusedSummary = $derived(focusedDate ? getDaySummary(focusedDate) : null);

	function getDaySummary(iso: string) {
		return getDashboardDaySummary({
			iso,
			workingHours: workingHoursForPreview,
			blocks: data.calendarBlocks
		});
	}

	function getDayClass(iso: string): string {
		const status = getDaySummary(iso).status;
		const statusClass: Record<DashboardDayStatus, string> = {
			available: 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
			partial: 'border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
			blocked: 'border border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100',
			unavailable: 'bg-muted/70 text-muted-foreground',
			unconfigured: 'bg-muted/50 text-muted-foreground'
		};
		return statusClass[status];
	}

	function getDayDots(iso: string): Array<'neutral' | 'primary'> {
		return getDaySummary(iso).blocks.length > 0 ? ['neutral'] : [];
	}

	function formatDate(iso: string): string {
		return new Date(`${iso}T12:00:00`).toLocaleDateString('en-GB', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}

	function formatBlockTime(block: DashboardCalendarBlock): string {
		if (block.allDay) return 'All day';
		const start = new Date(block.startDatetime);
		const end = new Date(block.endDatetime);
		return `${start.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}–${end.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
	}

	function statusLabel(status: DashboardDayStatus): string {
		return {
			available: 'Available',
			partial: 'Partially blocked',
			blocked: 'Blocked',
			unavailable: 'Not a working day',
			unconfigured: 'Not configured'
		}[status];
	}

	function copyFirstEnabledDay(index: number) {
		const source = workingDays[index];
		workingDays = workingDays.map((day) =>
			day.isEnabled ? { ...day, startTime: source.startTime, endTime: source.endTime } : day
		);
		toast.success('Times copied to enabled days');
	}

	function setPreset(days: 'weekdays' | 'all') {
		workingDays = workingDays.map((day) => ({
			...day,
			isEnabled: days === 'all' ? true : day.dayOfWeek >= 1 && day.dayOfWeek <= 5
		}));
	}

	async function saveAvailability() {
		saving = true;
		try {
			const workingHours = workingDays
				.filter((day) => day.isEnabled)
				.map((day) => ({
					dayOfWeek: day.dayOfWeek,
					startTime: day.startTime,
					endTime: day.endTime,
					seasonStart: seasonStart || null,
					seasonEnd: seasonEnd || null
				}));

			const response = await fetch('/api/availability/working-hours', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ workingHours })
			});
			const payload = await response.json();

			if (!response.ok) {
				throw new Error(payload.error || 'Failed to save availability');
			}

			toast.success('Availability saved');
			await invalidateAll();
		} catch (error) {
			toast.error(error instanceof Error ? error.message : 'Failed to save availability');
		} finally {
			saving = false;
		}
	}

	async function connectCalendar() {
		try {
			const res = await fetch('/api/calendar/connect');
			const json = await res.json();

			if (json.connected) {
				toast.info('Calendar already connected');
				return;
			}

			if (json.authUrl) window.location.href = json.authUrl;
		} catch {
			toast.error('Failed to start calendar connection');
		}
	}

	async function syncNow() {
		syncing = true;
		try {
			const res = await fetch('/api/calendar/connect', { method: 'POST' });
			const json = await res.json();
			if (json.success) {
				toast.success(`Synced ${json.eventsImported ?? 0} events from Google Calendar`);
				await invalidateAll();
			} else {
				toast.error(json.error || 'Sync failed');
			}
		} catch {
			toast.error('Failed to sync calendar');
		} finally {
			syncing = false;
		}
	}

	async function disconnectCalendar() {
		if (!confirm('Disconnect Google Calendar from LocalSnow availability?')) return;
		disconnecting = true;
		try {
			const res = await fetch('/api/calendar/connect', { method: 'DELETE' });
			const json = await res.json();
			if (json.success) {
				toast.success('Calendar disconnected');
				await invalidateAll();
			} else {
				toast.error('Failed to disconnect calendar');
			}
		} catch {
			toast.error('Failed to disconnect calendar');
		} finally {
			disconnecting = false;
		}
	}

	$effect(() => {
		if (data.successMessage) toast.success(data.successMessage);
		if (data.errorMessage) toast.error(data.errorMessage);
	});
</script>

<div class="container mx-auto max-w-6xl space-y-6 py-6">
	<header class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
		<div class="space-y-2">
			<p class="text-primary text-sm font-semibold tracking-wide uppercase">Availability</p>
			<h1 class="title2">Set when clients can request you</h1>
			<p class="text-muted-foreground max-w-2xl">
				Clients can choose preferred dates and estimated times from your availability pattern. Exact
				lesson details are still confirmed before booking because mountain schedules change quickly.
			</p>
		</div>
		<Button onclick={saveAvailability} disabled={saving}>
			{saving ? 'Saving…' : 'Save availability'}
		</Button>
	</header>

	{#if !hasConfiguredAvailability}
		<Card.Root class="border-primary/20 bg-primary/5">
			<Card.Content class="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
				<div class="bg-primary/10 text-primary rounded-full p-2">
					<Clock3 class="size-4" />
				</div>
				<div class="space-y-1">
					<p class="font-semibold">Set your weekly availability first</p>
					<p class="text-muted-foreground text-sm">
						The form below is the active setup step. Calendar preview, profile availability, and
						client preferred-time picking stay inactive until at least one working day is saved.
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<section class="grid gap-3 md:grid-cols-4">
		<Card.Root>
			<Card.Content class="flex items-center gap-3 p-4">
				<div class="bg-primary/10 text-primary rounded-full p-2"><Clock3 class="size-4" /></div>
				<div>
					<p class="text-2xl font-semibold">{enabledDaysCount}</p>
					<p class="text-muted-foreground text-sm">Working days</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="flex items-center gap-3 p-4">
				<div class="bg-primary/10 text-primary rounded-full p-2">
					<CheckCircle2 class="size-4" />
				</div>
				<div>
					<p class="text-2xl font-semibold">{visibleStatuses.available}</p>
					<p class="text-muted-foreground text-sm">Open next 45 days</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="flex items-center gap-3 p-4">
				<div class="rounded-full bg-amber-100 p-2 text-amber-700">
					<CalendarDays class="size-4" />
				</div>
				<div>
					<p class="text-2xl font-semibold">{visibleStatuses.partial + visibleStatuses.blocked}</p>
					<p class="text-muted-foreground text-sm">Blocked / partial</p>
				</div>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Content class="flex items-center gap-3 p-4">
				<div class="bg-muted text-muted-foreground rounded-full p-2">
					<Link2 class="size-4" />
				</div>
				<div>
					<p class="text-base font-semibold">{data.connected ? 'Connected' : 'Optional'}</p>
					<p class="text-muted-foreground text-sm">Google Calendar</p>
				</div>
			</Card.Content>
		</Card.Root>
	</section>

	<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
		<div class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Weekly pattern</Card.Title>
					<Card.Description>
						This is the base signal for profile availability and future request/booking flows.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-5">
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="season-start">Season start</Label>
							<Input id="season-start" type="date" bind:value={seasonStart} />
						</div>
						<div class="space-y-2">
							<Label for="season-end">Season end</Label>
							<Input id="season-end" type="date" bind:value={seasonEnd} />
						</div>
					</div>

					<div class="flex flex-wrap gap-2">
						<Button type="button" variant="outline" size="sm" onclick={() => setPreset('weekdays')}>
							Weekdays
						</Button>
						<Button type="button" variant="outline" size="sm" onclick={() => setPreset('all')}>
							All days
						</Button>
					</div>

					<div class="space-y-3">
						{#each workingDays as day, index (day.dayOfWeek)}
							<div class="rounded-lg border p-4">
								<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
									<div class="flex items-center gap-3">
										<Switch bind:checked={day.isEnabled} />
										<div>
											<p class="font-semibold">{day.label}</p>
											<p class="text-muted-foreground text-sm">
												{day.isEnabled ? 'Accept preferred times' : 'Hidden from availability'}
											</p>
										</div>
									</div>
									{#if day.isEnabled}
										<div class="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
											<div class="space-y-1">
												<Label for="start-{day.dayOfWeek}" class="text-xs">Start</Label>
												<Input id="start-{day.dayOfWeek}" type="time" bind:value={day.startTime} />
											</div>
											<div class="space-y-1">
												<Label for="end-{day.dayOfWeek}" class="text-xs">End</Label>
												<Input id="end-{day.dayOfWeek}" type="time" bind:value={day.endTime} />
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												onclick={() => copyFirstEnabledDay(index)}
											>
												Copy
											</Button>
										</div>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Google Calendar busy blocks</Card.Title>
					<Card.Description>
						Optional layer. LocalSnow reads events as busy time; the weekly pattern remains the
						source of truth.
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div
						class={cn(
							'rounded-lg border p-4',
							data.connected ? 'border-primary/20 bg-primary/5 text-foreground' : 'bg-muted/40'
						)}
					>
						<div class="flex items-start justify-between gap-4">
							<div class="space-y-1">
								<p class="font-semibold">
									{data.connected ? 'Calendar connected' : 'Calendar not connected'}
								</p>
								<p class="text-sm opacity-80">
									{data.connected
										? 'Synced events appear as partial or blocked days on the calendar.'
										: 'Connect it when you want existing busy time to shape requests automatically.'}
								</p>
								{#if data.syncDetails?.lastSyncAt}
									<p class="text-xs opacity-70">
										Last synced {new Date(data.syncDetails.lastSyncAt).toLocaleString()}
									</p>
								{/if}
							</div>
							<Badge variant={data.connected ? 'default' : 'secondary'}>
								{data.connected ? 'Connected' : 'Optional'}
							</Badge>
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						{#if data.connected}
							<Button type="button" variant="outline" onclick={syncNow} disabled={syncing}>
								<RefreshCw class={cn('mr-2 size-4', syncing && 'animate-spin')} />
								{syncing ? 'Syncing…' : 'Sync now'}
							</Button>
							<Button
								type="button"
								variant="destructive"
								onclick={disconnectCalendar}
								disabled={disconnecting}
							>
								{disconnecting ? 'Disconnecting…' : 'Disconnect'}
							</Button>
						{:else}
							<Button type="button" variant="outline" onclick={connectCalendar}
								>Connect Google Calendar</Button
							>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<aside class="space-y-6">
			<Card.Root aria-disabled={!hasConfiguredAvailability}>
				<Card.Header>
					<Card.Title>Calendar preview</Card.Title>
					<Card.Description>
						{hasConfiguredAvailability
							? 'Tap a day to inspect what clients can request.'
							: 'This activates after you save at least one working day.'}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class={cn(!hasConfiguredAvailability && 'pointer-events-none opacity-60')}>
						<CalendarGrid
							type={hasConfiguredAvailability ? 'interactive' : 'display'}
							{focusedDate}
							{getDayClass}
							{getDayDots}
							onDayClick={(iso) => (focusedDate = iso)}
							class="mx-auto max-w-md"
						/>
					</div>
					{#if !hasConfiguredAvailability}
						<p class="bg-muted/50 text-muted-foreground mt-4 rounded-lg p-3 text-sm">
							Profile availability and client preferred-time picking are disabled until the weekly
							pattern is saved.
						</p>
					{/if}
					<div class="mt-4 grid grid-cols-2 gap-2 text-xs">
						<div class="flex items-center gap-2">
							<span class="size-3 rounded bg-green-200"></span>Available
						</div>
						<div class="flex items-center gap-2">
							<span class="size-3 rounded bg-amber-200"></span>Partial
						</div>
						<div class="flex items-center gap-2">
							<span class="size-3 rounded bg-rose-200"></span>Blocked
						</div>
						<div class="flex items-center gap-2">
							<span class="bg-muted size-3 rounded"></span>Not working
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title
						>{focusedSummary ? formatDate(focusedSummary.iso) : 'No day selected'}</Card.Title
					>
					<Card.Description>
						{focusedSummary ? statusLabel(focusedSummary.status) : 'Choose a date in the preview.'}
					</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-4">
					{#if focusedSummary}
						{#if focusedSummary.workingHours}
							<div class="rounded-lg border p-3">
								<p class="text-sm font-medium">Base hours</p>
								<p class="text-muted-foreground text-sm">
									{focusedSummary.workingHours.startTime}–{focusedSummary.workingHours.endTime}
								</p>
							</div>
						{/if}

						{#if focusedSummary.blocks.length > 0}
							<div class="space-y-2">
								<p class="text-sm font-medium">Busy blocks</p>
								{#each focusedSummary.blocks as block (block.id)}
									<div class="rounded-lg border p-3 text-sm">
										<p class="font-medium">{formatBlockTime(block)}</p>
										<p class="text-muted-foreground">{block.title || block.source || 'Busy'}</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm">
								No busy block for this date in LocalSnow.
							</p>
						{/if}
					{:else}
						<p class="bg-muted/50 text-muted-foreground rounded-lg p-3 text-sm">
							The public surface should describe selected slots as preferred times until they are
							confirmed.
						</p>
					{/if}
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="space-y-3 p-4">
					<div class="flex items-center gap-2 font-semibold">
						<ShieldCheck class="text-primary size-4" />
						Client request picker rule
					</div>
					<p class="text-muted-foreground text-sm">
						Dates and times are a preference signal for the request. LocalSnow always double-checks
						before confirming the lesson.
					</p>
				</Card.Content>
			</Card.Root>
		</aside>
	</div>
</div>

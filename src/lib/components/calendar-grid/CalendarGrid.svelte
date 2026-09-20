<script lang="ts">
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';

	type Props = {
		/** display: read-only coloured cells; interactive: tap only; multiple: toggles selected dates */
		type?: 'display' | 'interactive' | 'multiple';
		year?: number;
		month?: number;
		selected?: string[];
		focusedDate?: string;
		getDayClass?: (iso: string) => string | undefined;
		getDayDots?: (iso: string) => Array<'neutral' | 'primary'>;
		onDayClick?: (iso: string) => void;
		disablePast?: boolean;
		class?: string;
		monthNames?: string[];
		weekdayLabels?: string[];
		previousLabel?: string;
		nextLabel?: string;
	};

	let {
		type = 'display',
		year = $bindable(new Date().getFullYear()),
		month = $bindable(new Date().getMonth()),
		selected = $bindable([]),
		focusedDate,
		getDayClass,
		getDayDots,
		onDayClick,
		disablePast = false,
		class: className,
		monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December'
		],
		weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
		previousLabel = 'Previous month',
		nextLabel = 'Next month'
	}: Props = $props();

	const today = new Date();
	const todayIso = isoDate(today.getFullYear(), today.getMonth(), today.getDate());

	type Cell = { day: number; iso: string; isToday: boolean } | null;

	const weeks = $derived.by((): Cell[][] => {
		const firstDay = new Date(year, month, 1).getDay();
		const startOffset = (firstDay + 6) % 7; // Monday = 0
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const cells: Cell[] = [];
		for (let i = 0; i < startOffset; i++) cells.push(null);
		for (let day = 1; day <= daysInMonth; day++) {
			const iso = isoDate(year, month, day);
			cells.push({ day, iso, isToday: iso === todayIso });
		}
		while (cells.length % 7 !== 0) cells.push(null);

		const rows: Cell[][] = [];
		for (let index = 0; index < cells.length; index += 7) {
			rows.push(cells.slice(index, index + 7));
		}
		return rows;
	});

	function isoDate(y: number, m: number, d: number): string {
		return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
	}

	function prevMonth() {
		if (month === 0) {
			month = 11;
			year -= 1;
			return;
		}
		month -= 1;
	}

	function nextMonth() {
		if (month === 11) {
			month = 0;
			year += 1;
			return;
		}
		month += 1;
	}

	function isSelected(iso: string): boolean {
		return selected.includes(iso);
	}

	function isPast(iso: string): boolean {
		return iso < todayIso;
	}

	function handleTap(iso: string) {
		if (disablePast && isPast(iso)) return;
		if (type === 'multiple') {
			selected = isSelected(iso) ? selected.filter((date) => date !== iso) : [...selected, iso];
		}
		onDayClick?.(iso);
	}

	function dayDots(iso: string): Array<'neutral' | 'primary'> {
		return getDayDots?.(iso) ?? [];
	}

	function cellClass(cell: NonNullable<Cell>): string {
		const custom = getDayClass?.(cell.iso) ?? '';
		const selectedCell = type === 'multiple' && isSelected(cell.iso);
		const focused = focusedDate === cell.iso;
		const past = disablePast && isPast(cell.iso);
		const clickable = type !== 'display' && !past;

		return cn(
			'cg-cell relative flex aspect-square w-full items-center justify-center rounded-md text-sm font-normal transition-colors select-none',
			selectedCell && 'bg-primary text-primary-foreground font-medium',
			focused && !selectedCell && 'cg-focused font-medium',
			focused && !selectedCell && !custom && 'bg-primary/15 text-primary',
			cell.isToday && !selectedCell && !focused && !custom && 'cg-today',
			cell.isToday && !selectedCell && !focused && custom && 'cg-today-on-status',
			past && 'pointer-events-none opacity-35',
			clickable &&
				!selectedCell &&
				!custom &&
				!past &&
				'hover:bg-accent hover:text-accent-foreground',
			clickable && !past && 'active:scale-95 active:opacity-70 cursor-pointer',
			custom
		);
	}
</script>

<div class={cn('w-full', className)}>
	<div class="mb-3 flex items-center justify-between">
		<Button
			type="button"
			variant="ghost"
			size="icon"
			onclick={prevMonth}
			aria-label={previousLabel}
		>
			<ChevronLeft class="size-4" />
		</Button>
		<p class="text-sm font-semibold">{monthNames[month]} {year}</p>
		<Button type="button" variant="ghost" size="icon" onclick={nextMonth} aria-label={nextLabel}>
			<ChevronRight class="size-4" />
		</Button>
	</div>

	<div class="mb-1 grid grid-cols-7 gap-1">
		{#each weekdayLabels as label, index (`${label}-${index}`)}
			<div class="text-muted-foreground py-1 text-center text-xs font-medium">{label}</div>
		{/each}
	</div>

	<div class="grid gap-1">
		{#each weeks as week, weekIndex (weekIndex)}
			<div class="grid grid-cols-7 gap-1">
				{#each week as cell, cellIndex (cell?.iso ?? `empty-${weekIndex}-${cellIndex}`)}
					{#if cell === null}
						<div class="aspect-square"></div>
					{:else if type === 'display'}
						<div class={cellClass(cell)}>
							{cell.day}
							{#if dayDots(cell.iso).length > 0}
								<span class="pointer-events-none absolute bottom-1.5 flex gap-0.5">
									{#each dayDots(cell.iso).slice(0, 2) as dot (dot)}
										<span
											class={cn(
												'size-1 rounded-full',
												dot === 'primary' ? 'bg-primary/80' : 'bg-muted-foreground/50'
											)}
										></span>
									{/each}
								</span>
							{/if}
						</div>
					{:else}
						<button
							type="button"
							onclick={() => handleTap(cell.iso)}
							class={cellClass(cell)}
							aria-pressed={type === 'multiple' ? isSelected(cell.iso) : undefined}
							aria-label={cell.iso}
							disabled={disablePast && isPast(cell.iso)}
						>
							{cell.day}
							{#if dayDots(cell.iso).length > 0}
								<span class="pointer-events-none absolute bottom-1.5 flex gap-0.5">
									{#each dayDots(cell.iso).slice(0, 2) as dot (dot)}
										<span
											class={cn(
												'size-1 rounded-full',
												dot === 'primary' ? 'bg-primary/80' : 'bg-muted-foreground/50'
											)}
										></span>
									{/each}
								</span>
							{/if}
						</button>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.cg-cell {
		min-height: 2.65rem;
	}

	.cg-focused {
		box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--primary) 34%, transparent);
	}

	.cg-today {
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, var(--foreground) 12%, transparent),
			inset 0 0 0 2px color-mix(in srgb, var(--foreground) 6%, transparent);
		background: color-mix(in srgb, var(--foreground) 3.5%, transparent);
		font-weight: 550;
	}

	.cg-today-on-status {
		box-shadow:
			inset 0 0 0 1px color-mix(in srgb, white 24%, transparent),
			inset 0 0 0 2px color-mix(in srgb, black 12%, transparent);
		font-weight: 550;
	}
</style>

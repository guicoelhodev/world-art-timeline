<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TimelineArtist, TimelineMovement, TimelinePeriod } from '$lib/types/timeline';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const defaultPeriodId = 'renaissance';
	let selectedPeriodId = $state(defaultPeriodId);
	let selectedMovementId = $state('all');
	let authorSearch = $state('');
	let timelineScrollContainer = $state<HTMLDivElement>();
	let hasScrolledToDefaultPeriod = false;
	let hoveredArtistId = $state<string | null>(null);

	const periodPalette: Record<string, [string, string]> = {
		medieval: ['#a3a18e', '#d6d3c1'],
		renaissance: ['#c7912b', '#e8c84a'],
		'baroque-rococo': ['#b4571e', '#d98a44'],
		'nineteenth-century': ['#3b76c4', '#7ab8e8'],
		modernism: ['#7d44b0', '#c48de0']
	};
	const defaultPalette: [string, string] = ['#57534e', '#a8a29e'];

	const axisPadding = 120;
	const minTimelineWidth = 1280;
	const yearWidth = 10;
	const avatarSize = 56;
	const cardGapX = 24;
	const aboveLaneOffsets = [-220, -130, -40];
	const belowLaneOffsets = [40, 130, 220];

	function periodColor(periodId: string): [string, string] {
		return periodPalette[periodId] ?? defaultPalette;
	}

	type TimelineItem = {
		artist: TimelineArtist;
		movement: TimelineMovement;
		color: string;
		lightColor: string;
		year: number;
		x: number;
		lane: number;
		side: 'above' | 'below';
		offset: number;
	};

	let periods = $derived(
		[...data.timeline.periods].sort(
			(a, b) => a.startYear - b.startYear || a.name.localeCompare(b.name)
		)
	);

	let movementOptions = $derived.by(() => {
		return periods
			.flatMap((period) => period.movements)
			.sort((a, b) => (a.startYear ?? 0) - (b.startYear ?? 0) || a.name.localeCompare(b.name));
	});

	let normalizedAuthorSearch = $derived(authorSearch.trim().toLowerCase());

	let filteredPeriods = $derived.by(() =>
		periods
			.map((period) => ({
				...period,
				movements: period.movements
					.map((movement) => ({
						...movement,
						artists: movement.artists
							.filter(
								(artist) =>
									!normalizedAuthorSearch ||
									artist.name.toLowerCase().includes(normalizedAuthorSearch)
							)
							.sort(
								(a, b) =>
									(a.birthYear ?? Number.POSITIVE_INFINITY) -
										(b.birthYear ?? Number.POSITIVE_INFINITY) || a.name.localeCompare(b.name)
							)
					}))
					.filter((movement) => movement.artists.length > 0)
			}))
			.filter((period) => period.movements.length > 0)
	);

	let filteredArtistCount = $derived(
		filteredPeriods.reduce(
			(total, period) =>
				total + period.movements.reduce((sum, movement) => sum + movement.artists.length, 0),
			0
		)
	);

	let timelineYears = $derived.by(() => {
		const birthYears = filteredPeriods
			.flatMap((period) => period.movements)
			.flatMap((movement) => movement.artists)
			.map((artist) => artist.birthYear)
			.filter((year): year is number => typeof year === 'number');

		const periodStarts = periods.map((period) => period.startYear);
		const periodEnds = periods.map((period) => period.endYear);
		let min = birthYears.length
			? Math.min(...birthYears)
			: Math.min(...periodStarts, ...periodEnds);
		let max = birthYears.length
			? Math.max(...birthYears)
			: Math.max(...periodStarts, ...periodEnds);

		const padding = Math.max(20, Math.round((max - min) * 0.05));
		min -= padding;
		max += padding;

		if (min === max) {
			min -= 10;
			max += 10;
		}

		return { min, max };
	});

	let timelineWidth = $derived(
		Math.max(
			minTimelineWidth,
			(timelineYears.max - timelineYears.min) * yearWidth + axisPadding * 2
		)
	);

	let axisWidth = $derived(timelineWidth - axisPadding * 2);

	let timelineItems = $derived.by<TimelineItem[]>(() => {
		const flat: Array<Omit<TimelineItem, 'lane' | 'side' | 'offset'>> = [];

		for (const period of filteredPeriods) {
			const [color, lightColor] = periodColor(period.id);
			for (const movement of period.movements) {
				for (const artist of movement.artists) {
					const year = artistYear(artist, movement, period);
					const x = yearToX(year);
					flat.push({
						artist,
						movement,
						color,
						lightColor,
						year,
						x
					});
				}
			}
		}

		flat.sort((a, b) => a.year - b.year || a.artist.name.localeCompare(b.artist.name));

		const aboveLanes: number[] = [];
		const belowLanes: number[] = [];

		return flat.map((item) => {
			const halfItem = avatarSize / 2 + cardGapX / 2;
			const itemLeft = item.x - halfItem;

			for (let i = 0; i < aboveLanes.length; i++) {
				if (itemLeft > aboveLanes[i]) {
					aboveLanes[i] = item.x + halfItem;
					return {
						...item,
						lane: i,
						side: 'above' as const,
						offset: aboveLaneOffsets[i] ?? aboveLaneOffsets[aboveLaneOffsets.length - 1]
					};
				}
			}

			for (let i = 0; i < belowLanes.length; i++) {
				if (itemLeft > belowLanes[i]) {
					belowLanes[i] = item.x + halfItem;
					return {
						...item,
						lane: i,
						side: 'below' as const,
						offset: belowLaneOffsets[i] ?? belowLaneOffsets[belowLaneOffsets.length - 1]
					};
				}
			}

			if (aboveLanes.length <= belowLanes.length) {
				aboveLanes.push(item.x + halfItem);
				return {
					...item,
					lane: aboveLanes.length - 1,
					side: 'above' as const,
					offset:
						aboveLaneOffsets[aboveLanes.length - 1] ?? aboveLaneOffsets[aboveLaneOffsets.length - 1]
				};
			}

			belowLanes.push(item.x + halfItem);
			return {
				...item,
				lane: belowLanes.length - 1,
				side: 'below' as const,
				offset:
					belowLaneOffsets[belowLanes.length - 1] ?? belowLaneOffsets[belowLaneOffsets.length - 1]
			};
		});
	});

	let periodBands = $derived(
		filteredPeriods.map((period) => {
			const [color, lightColor] = periodColor(period.id);
			return {
				...period,
				color,
				lightColor,
				left: yearToX(period.startYear),
				width: Math.max(72, yearToX(period.endYear) - yearToX(period.startYear))
			};
		})
	);

	let activePeriodId = $derived.by(() => {
		if (!hoveredArtistId) return null;
		const item = timelineItems.find((item) => item.artist.id === hoveredArtistId);
		return item?.artist.periodId ?? null;
	});

	let defaultPeriodScrollLeft = $derived.by(() => {
		const defaultBand = periodBands.find((period) => period.id === defaultPeriodId);
		const defaultPeriod = periods.find((period) => period.id === defaultPeriodId);
		const targetX =
			defaultBand?.left ?? (defaultPeriod ? yearToX(defaultPeriod.startYear) : axisPadding);

		return Math.max(0, targetX - axisPadding);
	});

	$effect(() => {
		if (hasScrolledToDefaultPeriod || !timelineScrollContainer) return;

		hasScrolledToDefaultPeriod = true;
		timelineScrollContainer.scrollLeft = defaultPeriodScrollLeft;
	});

	function handlePeriodChange(event: Event) {
		selectedPeriodId = (event.currentTarget as HTMLSelectElement).value;
		selectedMovementId = 'all';
		scrollTimelineTo(selectedPeriodId === 'all' ? axisPadding : periodTargetX(selectedPeriodId));
	}

	function handleMovementChange(event: Event) {
		selectedMovementId = (event.currentTarget as HTMLSelectElement).value;
		scrollTimelineTo(
			selectedMovementId === 'all' ? axisPadding : movementTargetX(selectedMovementId)
		);
	}

	function lifespan(artist: TimelineArtist) {
		if (artist.birthYear && artist.deathYear) return `${artist.birthYear}–${artist.deathYear}`;
		if (artist.birthYear) return `born ${artist.birthYear}`;
		if (artist.deathYear) return `died ${artist.deathYear}`;
		return 'dates unknown';
	}

	function roomHref(artist: TimelineArtist) {
		return resolve(`/room?author=${encodeURIComponent(artist.name)}`);
	}

	function artistYear(artist: TimelineArtist, movement: TimelineMovement, period: TimelinePeriod) {
		if (typeof artist.birthYear === 'number') return artist.birthYear;
		if (typeof movement.startYear === 'number') return movement.startYear;
		if (typeof movement.endYear === 'number') return movement.endYear;
		return Math.round((period.startYear + period.endYear) / 2);
	}

	function yearToX(year: number) {
		const range = timelineYears.max - timelineYears.min || 1;
		return axisPadding + ((year - timelineYears.min) / range) * axisWidth;
	}

	function scrollTimelineTo(x: number, behavior: ScrollBehavior = 'smooth') {
		timelineScrollContainer?.scrollTo({
			left: Math.max(0, x - axisPadding),
			behavior
		});
	}

	function periodTargetX(periodId: string) {
		const band = periodBands.find((period) => period.id === periodId);
		if (band) return band.left;

		const period = periods.find((period) => period.id === periodId);
		return period ? yearToX(period.startYear) : axisPadding;
	}

	function movementTargetX(movementId: string) {
		const item = timelineItems.find((item) => item.movement.id === movementId);
		if (item) return item.x;

		for (const period of periods) {
			const movement = period.movements.find((movement) => movement.id === movementId);
			if (!movement) continue;

			return yearToX(movement.startYear ?? movement.endYear ?? period.startYear);
		}

		return axisPadding;
	}

	function handleTimelineWheel(event: WheelEvent) {
		if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;

		event.preventDefault();
		(event.currentTarget as HTMLDivElement).scrollLeft += event.deltaY;
	}

	function initials(name: string) {
		return name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join('');
	}
</script>

<svelte:head>
	<title>Western European Art Timeline</title>
	<meta
		name="description"
		content="Explore a curated horizontal timeline of Western European visual artists by period and movement."
	/>
</svelte:head>

<main class="flex min-h-dvh flex-col bg-stone-950 text-stone-100">
	<header
		class="sticky top-0 z-30 border-b border-stone-800/90 bg-stone-950/95 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur md:px-8"
	>
		<div class="mx-auto flex max-w-7xl flex-col gap-3">
			<div class="flex flex-wrap items-end justify-between gap-3">
				<div>
					<p class="text-xs font-medium tracking-[0.28em] text-amber-200 uppercase">
						Museum timeline
					</p>
					<h1 class="text-2xl font-semibold text-stone-50 sm:text-3xl">
						Western European Art Timeline
					</h1>
					<p class="text-xs text-stone-400">
						Scroll horizontally, jump by period or movement, then enter an artist room.
					</p>
				</div>

				<p
					class="rounded-full border border-amber-200/30 bg-amber-100/10 px-3 py-1 text-sm text-amber-100"
				>
					{filteredArtistCount} artists
				</p>
			</div>

			<form class="grid gap-2 md:grid-cols-3" aria-label="Timeline navigation and filters">
				<label class="grid gap-1 text-xs font-medium text-stone-300" for="period-filter">
					Period
					<select
						id="period-filter"
						class="rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
						value={selectedPeriodId}
						onchange={handlePeriodChange}
					>
						<option value="all">All periods</option>
						{#each periods as period (period.id)}
							<option value={period.id}>{period.name}</option>
						{/each}
					</select>
				</label>

				<label class="grid gap-1 text-xs font-medium text-stone-300" for="movement-filter">
					Movement
					<select
						id="movement-filter"
						class="rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
						value={selectedMovementId}
						onchange={handleMovementChange}
					>
						<option value="all">All movements</option>
						{#each movementOptions as movement (movement.id)}
							<option value={movement.id}>{movement.name}</option>
						{/each}
					</select>
				</label>

				<label class="grid gap-1 text-xs font-medium text-stone-300" for="author-search">
					Author search
					<input
						id="author-search"
						type="search"
						class="rounded-xl border border-stone-700 bg-stone-950 px-3 py-2 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
						placeholder="Search artist name"
						bind:value={authorSearch}
					/>
				</label>
			</form>
		</div>
	</header>

	<section class="flex w-full flex-1 flex-col px-2 py-3 md:px-4" aria-labelledby="timeline-heading">
		<h2 id="timeline-heading" class="sr-only">Filtered artist timeline</h2>

		<div
			class="timeline-scroll overflow-x-auto overscroll-x-contain pb-4 outline-none focus:ring-2 focus:ring-amber-300/40"
			role="region"
			aria-label="Continuous horizontal timeline of artists"
			bind:this={timelineScrollContainer}
			onwheel={handleTimelineWheel}
		>
			{#if timelineItems.length > 0}
				<div
					class="relative h-[calc(100dvh-11rem)] min-w-full border border-stone-800 bg-stone-950/80"
					style:width={`${timelineWidth}px`}
				>
					{#each periodBands as period (period.id)}
						<div
							class="absolute top-0 h-full rounded-[1.5rem]"
							style:left={`${period.left}px`}
							style:width={`${period.width}px`}
							style:background={`linear-gradient(to bottom, ${period.color}11, ${period.lightColor}08)`}
							aria-hidden="true"
						></div>
					{/each}

					<div
						class="absolute top-4 left-0 flex h-12 w-full items-end gap-0 overflow-hidden px-3"
						aria-hidden="true"
					>
						{#each periodBands as period (period.id)}
							{@const isActive = activePeriodId === period.id}
							<div
								class="shrink-0 truncate rounded-full px-3 py-1 text-[0.65rem] font-semibold uppercase transition-all duration-300"
								style:left={`${period.left}px`}
								style:width={`${period.width}px`}
								style:background-color={isActive ? `${period.color}33` : 'transparent'}
								style:color={isActive ? period.lightColor : '#78716c'}
							>
								{period.name} · {period.startYear}–{period.endYear}
							</div>
						{/each}
					</div>

					<div
						class="absolute top-1/2 h-px rounded-full bg-stone-700"
						style:left={`${axisPadding}px`}
						style:width={`${axisWidth}px`}
						aria-hidden="true"
					></div>

					{#each timelineItems as item (item.artist.id)}
						{@const isActivePeriod = activePeriodId === item.artist.periodId}
						{@const isHovered = hoveredArtistId === item.artist.id}
						{@const periodInactive = activePeriodId !== null && !isActivePeriod}

						<div
							class="absolute top-1/2 h-1 -translate-y-0.5 rounded-full transition-colors duration-400"
							style:left={`${item.x}px`}
							style:width={`${Math.max(6, (timelineWidth - axisPadding - item.x) / 2)}px`}
							style:background-color={isActivePeriod ? item.color : '#44403c'}
							aria-hidden="true"
						></div>

						<a
							class="absolute z-0 flex flex-col items-center outline-none"
							style:left={`${Math.max(axisPadding / 4, item.x - avatarSize / 2)}px`}
							style:top={`calc(50% + ${item.offset - avatarSize / 2}px)`}
							href={roomHref(item.artist)}
							aria-label={`Open exhibition room for ${item.artist.name}`}
							class:opacity-40={periodInactive}
							onmouseenter={() => (hoveredArtistId = item.artist.id)}
							onmouseleave={() => (hoveredArtistId = null)}
							onfocus={() => (hoveredArtistId = item.artist.id)}
							onblur={() => (hoveredArtistId = null)}
						>
							{#if item.artist.thumbnailUrl}
								<img
									class="size-14 rounded-full border-2 object-cover shadow-lg transition-all duration-300"
									src={item.artist.thumbnailUrl}
									alt={`Portrait of ${item.artist.name}`}
									width="56"
									height="56"
									loading="lazy"
									style:border-color={isHovered ? item.color : '#44403c'}
									style:box-shadow={isHovered
										? `0 0 16px ${item.color}50`
										: '0 4px 12px rgba(0,0,0,0.4)'}
								/>
							{:else}
								<div
									class="grid size-14 place-items-center rounded-full border-2 bg-stone-800 text-sm font-semibold shadow-lg transition-all duration-300"
									aria-hidden="true"
									style:border-color={isHovered ? item.color : '#44403c'}
									style:color={isHovered ? item.lightColor : '#a8a29e'}
									style:box-shadow={isHovered
										? `0 0 16px ${item.color}50`
										: '0 4px 12px rgba(0,0,0,0.4)'}
								>
									{initials(item.artist.name)}
								</div>
							{/if}

							{#if isHovered}
								<div
									class="absolute left-1/2 w-44 -translate-x-1/2 rounded-xl border border-stone-800 bg-stone-900/95 p-3 text-center shadow-xl backdrop-blur"
									style:border-color={`${item.color}44`}
									style:z-index="20"
									style:top={item.side === 'above' ? 'calc(100% + 8px)' : 'calc(100% + 8px)'}
								>
									<h3 class="font-serif text-base font-semibold text-stone-100">
										{item.artist.name}
									</h3>
									<p class="mt-1 text-sm font-medium text-amber-400">
										{lifespan(item.artist)}
									</p>
									<p class="mt-1 text-xs text-stone-400">
										{item.movement.name}
									</p>
								</div>
							{/if}
						</a>

						<div
							class="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-stone-950 shadow-md transition-all duration-400"
							style:background-color={isActivePeriod ? item.color : '#44403c'}
							style:box-shadow={isActivePeriod
								? `0 0 8px ${item.color}60`
								: '0 1px 3px rgba(0,0,0,0.5)'}
							style:left={`${item.x}px`}
							aria-hidden="true"
						></div>

						{#if item.side === 'above'}
							<div
								class="absolute w-px bg-stone-700"
								style:left={`${item.x}px`}
								style:top={`calc(50% + ${item.offset - avatarSize / 2}px)`}
								style:height={`${-item.offset + avatarSize / 2}px`}
								aria-hidden="true"
							></div>
						{:else}
							<div
								class="absolute w-px bg-stone-700"
								style:left={`${item.x}px`}
								style:top="50%"
								style:height={`${item.offset - avatarSize / 2}px`}
								aria-hidden="true"
							></div>
						{/if}
					{/each}
				</div>
			{:else}
				<div
					class="grid min-h-80 place-items-center rounded-[1.5rem] border border-dashed border-stone-700 p-8 text-center"
				>
					<div class="max-w-md space-y-3">
						<h2 class="text-2xl font-semibold text-stone-100">No artists match these filters</h2>
						<p class="text-sm leading-6 text-stone-400">
							Try another author search to continue through the gallery.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</section>
</main>

<style>
	.timeline-scroll {
		scrollbar-color: rgb(180 83 9 / 0.8) rgb(28 25 23 / 0.9);
	}
</style>

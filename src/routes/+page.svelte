<script lang="ts">
	import { resolve } from '$app/paths';
	import type { TimelineArtist, TimelineMovement } from '$lib/types/timeline';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let selectedPeriodId = $state('all');
	let selectedMovementId = $state('all');
	let authorSearch = $state('');

	let periods = $derived(
		[...data.timeline.periods].sort(
			(a, b) => a.startYear - b.startYear || a.name.localeCompare(b.name)
		)
	);

	let movementOptions = $derived.by(() => {
		const sourcePeriods =
			selectedPeriodId === 'all'
				? periods
				: periods.filter((period) => period.id === selectedPeriodId);

		return sourcePeriods
			.flatMap((period) => period.movements)
			.sort((a, b) => (a.startYear ?? 0) - (b.startYear ?? 0) || a.name.localeCompare(b.name));
	});

	let activeMovementIds = $derived(new Set(movementOptions.map((movement) => movement.id)));
	let normalizedAuthorSearch = $derived(authorSearch.trim().toLowerCase());

	let filteredPeriods = $derived.by(() =>
		periods
			.filter((period) => selectedPeriodId === 'all' || period.id === selectedPeriodId)
			.map((period) => ({
				...period,
				movements: period.movements
					.filter(
						(movement) =>
							selectedMovementId === 'all' ||
							(activeMovementIds.has(selectedMovementId) && movement.id === selectedMovementId)
					)
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

	function handlePeriodChange(event: Event) {
		selectedPeriodId = (event.currentTarget as HTMLSelectElement).value;
		selectedMovementId = 'all';
	}

	function yearRange(item: Pick<TimelineMovement, 'startYear' | 'endYear'>) {
		if (item.startYear && item.endYear) return `${item.startYear}–${item.endYear}`;
		if (item.startYear) return `from ${item.startYear}`;
		if (item.endYear) return `until ${item.endYear}`;
		return 'dates unknown';
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

<main class="min-h-screen bg-stone-950 text-stone-100">
	<section class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-8 sm:px-8 lg:px-10">
		<div class="grid gap-8 lg:grid-cols-[1fr_24rem] lg:items-end">
			<div class="space-y-5">
				<p class="text-sm font-medium tracking-[0.35em] text-amber-200 uppercase">
					Museum timeline
				</p>
				<div class="space-y-4">
					<h1 class="max-w-4xl text-4xl leading-tight font-semibold text-stone-50 sm:text-6xl">
						Western European art history, arranged as a quiet gallery walk.
					</h1>
					<p class="max-w-2xl text-base leading-7 text-stone-300 sm:text-lg">
						Move horizontally through periods, narrow the collection by movement, and enter an
						artist room from any card.
					</p>
				</div>
			</div>

			<div
				class="rounded-3xl border border-stone-700/80 bg-stone-900/80 p-5 shadow-2xl shadow-black/20"
			>
				<p class="text-sm text-stone-400">Showing</p>
				<p class="mt-1 text-3xl font-semibold text-amber-100">{filteredArtistCount} artists</p>
				<p class="mt-3 text-sm leading-6 text-stone-400">
					Source data loaded {new Date(data.timeline.loadedAt).toLocaleDateString('en', {
						year: 'numeric',
						month: 'short',
						day: 'numeric'
					})}
				</p>
			</div>
		</div>

		<form
			class="grid gap-4 rounded-[2rem] border border-stone-700/80 bg-stone-900/70 p-4 shadow-xl shadow-black/10 md:grid-cols-3"
			aria-label="Timeline filters"
		>
			<label class="grid gap-2 text-sm font-medium text-stone-200" for="period-filter">
				Period
				<select
					id="period-filter"
					class="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
					value={selectedPeriodId}
					onchange={handlePeriodChange}
				>
					<option value="all">All periods</option>
					{#each periods as period (period.id)}
						<option value={period.id}>{period.name}</option>
					{/each}
				</select>
			</label>

			<label class="grid gap-2 text-sm font-medium text-stone-200" for="movement-filter">
				Movement
				<select
					id="movement-filter"
					class="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
					bind:value={selectedMovementId}
				>
					<option value="all">All visible movements</option>
					{#each movementOptions as movement (movement.id)}
						<option value={movement.id}>{movement.name}</option>
					{/each}
				</select>
			</label>

			<label class="grid gap-2 text-sm font-medium text-stone-200" for="author-search">
				Author search
				<input
					id="author-search"
					type="search"
					class="rounded-2xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none placeholder:text-stone-500 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
					placeholder="Search artist name"
					bind:value={authorSearch}
				/>
			</label>
		</form>

		<div
			class="rounded-[2rem] border border-stone-800 bg-stone-900/50 p-3 shadow-2xl shadow-black/20"
		>
			<div
				class="overflow-x-auto pb-4"
				role="region"
				aria-label="Horizontal timeline of art periods"
			>
				{#if filteredPeriods.length > 0}
					<div class="flex w-max min-w-full gap-4">
						{#each filteredPeriods as period (period.id)}
							<section
								class="relative flex w-[22rem] shrink-0 flex-col gap-5 rounded-[1.75rem] border border-stone-700/70 bg-stone-950/80 p-5 sm:w-[26rem] lg:w-[30rem]"
								aria-labelledby={`period-${period.id}`}
							>
								<div
									class="absolute top-10 right-0 left-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"
								></div>
								<div class="relative space-y-3">
									<span
										class="inline-flex rounded-full border border-amber-200/40 bg-amber-100 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-stone-950 uppercase"
									>
										{period.startYear}–{period.endYear}
									</span>
									<div class="space-y-2">
										<h2 id={`period-${period.id}`} class="text-2xl font-semibold text-stone-50">
											{period.name}
										</h2>
										<p class="text-sm leading-6 text-stone-400">{period.description}</p>
									</div>
								</div>

								<div class="flex flex-col gap-4">
									{#each period.movements as movement (movement.id)}
										<section
											class="rounded-3xl border border-stone-800 bg-stone-900/80 p-4"
											aria-labelledby={`movement-${movement.id}`}
										>
											<div class="mb-4 flex items-start justify-between gap-3">
												<div>
													<h3 id={`movement-${movement.id}`} class="font-semibold text-stone-100">
														{movement.name}
													</h3>
													<p class="text-xs text-stone-500">{yearRange(movement)}</p>
												</div>
												<span class="rounded-full bg-stone-800 px-2.5 py-1 text-xs text-stone-300">
													{movement.artists.length}
												</span>
											</div>

											<div class="grid gap-3">
												{#each movement.artists as artist (artist.id)}
													<a
														class="group flex gap-3 rounded-2xl border border-stone-800 bg-stone-950/80 p-3 text-left outline-none transition focus:border-amber-300 focus:ring-2 focus:ring-amber-300/30"
														href={roomHref(artist)}
														aria-label={`Open exhibition room for ${artist.name}`}
													>
														{#if artist.thumbnailUrl}
															<img
																class="size-14 shrink-0 rounded-xl object-cover ring-1 ring-stone-700"
																src={artist.thumbnailUrl}
																alt={`Portrait thumbnail of ${artist.name}`}
																width="56"
																height="56"
																loading="lazy"
															/>
														{:else}
															<div
																class="grid size-14 shrink-0 place-items-center rounded-xl bg-stone-800 text-sm font-semibold text-amber-100 ring-1 ring-stone-700"
																aria-hidden="true"
															>
																{initials(artist.name)}
															</div>
														{/if}

														<div class="min-w-0 flex-1 space-y-1">
															<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
																<h4 class="font-semibold text-stone-100">{artist.name}</h4>
																<span class="text-xs text-amber-200">{lifespan(artist)}</span>
															</div>
															<p class="line-clamp-2 text-xs leading-5 text-stone-400">
																{artist.description ?? `Associated with ${movement.name}.`}
															</p>
															<span
																class="inline-flex text-xs font-medium text-stone-300 underline decoration-amber-200/40 underline-offset-4"
															>
																Enter room
															</span>
														</div>
													</a>
												{/each}
											</div>
										</section>
									{/each}
								</div>
							</section>
						{/each}
					</div>
				{:else}
					<div
						class="grid min-h-80 place-items-center rounded-[1.5rem] border border-dashed border-stone-700 p-8 text-center"
					>
						<div class="max-w-md space-y-3">
							<h2 class="text-2xl font-semibold text-stone-100">No artists match these filters</h2>
							<p class="text-sm leading-6 text-stone-400">
								Try another period, movement, or author search to continue through the gallery.
							</p>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</section>
</main>

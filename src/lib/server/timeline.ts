import { timelineSeed } from '$lib/data/timeline-seed';

import type { TimelineArtistSeed, TimelineData } from '$lib/types/timeline';

const USER_AGENT = 'art-timeline-3d/0.0.1 (https://localhost)';
const CACHE_TTL_MS = 1000 * 60 * 30;
const WIKIPEDIA_BATCH_SIZE = 40;

type Fetch = typeof fetch;

type WikipediaPage = {
	title: string;
	extract?: string;
	fullurl?: string;
	thumbnail?: { source?: string };
	missing?: boolean;
};

type WikipediaQueryResponse = {
	query?: {
		pages?: WikipediaPage[];
		normalized?: Array<{ from: string; to: string }>;
		redirects?: Array<{ from: string; to: string }>;
	};
};

let cachedTimeline: { expiresAt: number; data: TimelineData } | undefined;

export async function loadTimeline(fetcher: Fetch = fetch): Promise<TimelineData> {
	if (cachedTimeline && cachedTimeline.expiresAt > Date.now()) {
		return cachedTimeline.data;
	}

	const artistSeeds = timelineSeed.flatMap((period) =>
		period.movements.flatMap((movement) => movement.artists)
	);
	const wikipediaPages = await fetchWikipediaPages(artistSeeds, fetcher);

	const data: TimelineData = {
		loadedAt: new Date().toISOString(),
		periods: timelineSeed.map((period) => ({
			...period,
			movements: period.movements.map((movement) => ({
				...movement,
				periodId: period.id,
				artists: movement.artists.map((artist) => {
					const page = wikipediaPages.get(wikipediaKey(artist));

					return {
						...artist,
						periodId: period.id,
						movementId: movement.id,
						description: page?.extract,
						thumbnailUrl: page?.thumbnail?.source,
						sourceUrl: page?.fullurl
					};
				})
			}))
		}))
	};

	cachedTimeline = {
		expiresAt: Date.now() + CACHE_TTL_MS,
		data
	};

	return data;
}

async function fetchWikipediaPages(artistSeeds: TimelineArtistSeed[], fetcher: Fetch) {
	const pages = new Map<string, WikipediaPage>();
	const uniqueTitles = [...new Set(artistSeeds.map(wikipediaKey))];

	await Promise.all(
		chunks(uniqueTitles, WIKIPEDIA_BATCH_SIZE).map(async (titles) => {
			const response = await fetchWikipediaBatch(titles, fetcher);
			const responsePages = response.query?.pages?.filter((page) => !page.missing) ?? [];
			const aliases = new Map<string, string>();

			for (const item of response.query?.normalized ?? []) aliases.set(item.from, item.to);
			for (const item of response.query?.redirects ?? []) aliases.set(item.from, item.to);

			for (const page of responsePages) pages.set(page.title, page);

			for (const title of titles) {
				const normalized = aliases.get(title);
				const page = pages.get(normalized ?? title);
				if (page) pages.set(title, page);
			}
		})
	);

	return pages;
}

async function fetchWikipediaBatch(
	titles: string[],
	fetcher: Fetch
): Promise<WikipediaQueryResponse> {
	const params = new URLSearchParams({
		action: 'query',
		format: 'json',
		formatversion: '2',
		origin: '*',
		redirects: '1',
		prop: 'extracts|pageimages|info',
		exintro: '1',
		explaintext: '1',
		inprop: 'url',
		pithumbsize: '160',
		titles: titles.join('|')
	});

	const response = await fetcher(`https://en.wikipedia.org/w/api.php?${params}`, {
		headers: { 'user-agent': USER_AGENT }
	});

	if (!response.ok) {
		throw new Error(`Wikipedia request failed ${response.status}`);
	}

	return response.json() as Promise<WikipediaQueryResponse>;
}

function wikipediaKey(artist: TimelineArtistSeed) {
	return artist.wikipediaTitle ?? artist.name;
}

function chunks<T>(items: T[], size: number) {
	const result: T[][] = [];
	for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
	return result;
}

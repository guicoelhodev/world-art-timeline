import type {
	Artist,
	ArtistRoom,
	Artwork,
	ImageMetadata,
	SupportedLanguage
} from '$lib/types/domain';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'pt'];
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
const USER_AGENT = 'art-timeline-3d/0.0.1 (https://localhost)';

type EntitySearchResponse = {
	search?: Array<{ id: string; label?: string }>;
};

type EntityDataResponse = {
	entities?: Record<
		string,
		{
			labels?: Record<string, { value: string }>;
			descriptions?: Record<string, { value: string }>;
			sitelinks?: Record<string, { title: string; url?: string }>;
			claims?: Record<
				string,
				Array<{ mainsnak?: { datavalue?: { value?: string | { time?: string } } } }>
			>;
		}
	>;
};

type SparqlBinding = {
	work: { value: string };
	workLabel?: { value: string };
	workDescription?: { value: string };
	inception?: { value: string };
	image?: { value: string };
	article?: { value: string };
	sitelinks?: { value: string };
	movementLabel?: { value: string };
	materialLabel?: { value: string };
	genreLabel?: { value: string };
	locationLabel?: { value: string };
};

type SparqlResponse = {
	results?: { bindings?: SparqlBinding[] };
};

type CommonsImageInfoResponse = {
	query?: {
		pages?: Array<{
			title?: string;
			imageinfo?: Array<{
				url?: string;
				thumburl?: string;
				width?: number;
				height?: number;
				mime?: string;
				descriptionurl?: string;
				extmetadata?: Record<string, { value?: string }>;
			}>;
		}>;
	};
};

export function normalizeLanguage(value: string | null): SupportedLanguage {
	return value === 'pt' ? 'pt' : DEFAULT_LANGUAGE;
}

export async function loadArtistRoom(
	author: string,
	language: SupportedLanguage
): Promise<ArtistRoom> {
	const wikidataId = await resolveArtistId(author, language);
	const [artist, artworks] = await Promise.all([
		fetchArtist(wikidataId, language),
		fetchArtworks(wikidataId, language)
	]);

	return {
		artist,
		artworks,
		language,
		availableLanguages: SUPPORTED_LANGUAGES
	};
}

async function resolveArtistId(author: string, language: SupportedLanguage): Promise<string> {
	const params = new URLSearchParams({
		action: 'wbsearchentities',
		search: author,
		language,
		uselang: language,
		type: 'item',
		limit: '5',
		format: 'json',
		formatversion: '2',
		origin: '*'
	});
	const data = await fetchJson<EntitySearchResponse>(
		`https://www.wikidata.org/w/api.php?${params}`
	);
	const match = data.search?.find((item) => item.label?.toLowerCase() === author.toLowerCase());
	const resolved = match ?? data.search?.[0];

	if (!resolved) {
		throw new Error(`Artist not found: ${author}`);
	}

	return resolved.id;
}

async function fetchArtist(wikidataId: string, language: SupportedLanguage): Promise<Artist> {
	const entity = await fetchEntity(wikidataId);
	const sitelinks = entity.sitelinks ?? {};
	const imageFile = claimString(entity.claims, 'P18');
	const image = imageFile ? await fetchCommonsImage(imageFile, language) : undefined;

	return {
		id: wikidataId,
		slug: slugify(label(entity, 'en') ?? wikidataId),
		name: {
			en: label(entity, 'en') ?? label(entity, language) ?? wikidataId,
			pt: label(entity, 'pt') ?? label(entity, 'en') ?? wikidataId
		},
		description: {
			en: description(entity, 'en') ?? '',
			pt: description(entity, 'pt') ?? description(entity, 'en') ?? ''
		},
		sourceUrl: {
			en: sitelinks.enwiki?.url ?? wikiUrl('en', sitelinks.enwiki?.title),
			pt: sitelinks.ptwiki?.url ?? wikiUrl('pt', sitelinks.ptwiki?.title)
		},
		wikidataUrl: `https://www.wikidata.org/wiki/${wikidataId}`,
		image
	};
}

async function fetchArtworks(wikidataId: string, language: SupportedLanguage): Promise<Artwork[]> {
	const articleHost = language === 'pt' ? 'https://pt.wikipedia.org/' : 'https://en.wikipedia.org/';
	const labelLanguages = language === 'pt' ? 'pt,en' : 'en,pt';
	const query = `
SELECT ?work ?workLabel ?workDescription ?sitelinks
  (MIN(?inceptionValue) AS ?inception)
  (SAMPLE(?imageValue) AS ?image)
  (SAMPLE(?articleValue) AS ?article)
  (SAMPLE(?movementLabel) AS ?movementLabel)
  (SAMPLE(?materialLabel) AS ?materialLabel)
  (SAMPLE(?genreLabel) AS ?genreLabel)
  (SAMPLE(?locationLabel) AS ?locationLabel)
WHERE {
  VALUES ?artist { wd:${wikidataId} }
  ?work wdt:P170 ?artist;
    wdt:P18 ?imageValue;
    wikibase:sitelinks ?sitelinks;
    wdt:P31/wdt:P279* wd:Q3305213.
  OPTIONAL { ?work wdt:P571 ?inceptionValue. }
  OPTIONAL {
    ?articleValue schema:about ?work;
      schema:isPartOf <${articleHost}>.
  }
  OPTIONAL { ?work wdt:P135 ?movement. }
  OPTIONAL { ?work wdt:P186 ?material. }
  OPTIONAL { ?work wdt:P136 ?genre. }
  OPTIONAL { ?work wdt:P276 ?location. }
  SERVICE wikibase:label {
    bd:serviceParam wikibase:language "${labelLanguages}".
    ?work rdfs:label ?workLabel.
    ?work schema:description ?workDescription.
    ?movement rdfs:label ?movementLabel.
    ?material rdfs:label ?materialLabel.
    ?genre rdfs:label ?genreLabel.
    ?location rdfs:label ?locationLabel.
  }
}
GROUP BY ?work ?workLabel ?workDescription ?sitelinks
ORDER BY DESC(?sitelinks) ?workLabel
LIMIT 32`;

	const params = new URLSearchParams({ query, format: 'json' });
	const data = await fetchJson<SparqlResponse>(`https://query.wikidata.org/sparql?${params}`, {
		accept: 'application/sparql-results+json'
	});
	const bindings = data.results?.bindings ?? [];
	const artworkData = bindings.map((binding) => {
		const id = binding.work.value.split('/').at(-1) ?? binding.work.value;
		const imageFile = binding.image?.value
			? fileNameFromCommonsUrl(binding.image.value)
			: undefined;
		const title = binding.workLabel?.value ?? id;
		const descriptionText = binding.workDescription?.value ?? '';
		const sourceUrl = binding.article?.value ?? `https://www.wikidata.org/wiki/${id}`;
		const movement = binding.movementLabel?.value;
		const material = binding.materialLabel?.value;
		const genre = binding.genreLabel?.value;
		const locationVal = binding.locationLabel?.value;

		return { id, imageFile, title, descriptionText, sourceUrl, movement, material, genre, location: locationVal };
	});

	const [commonsResults, wikiExtracts] = await Promise.all([
		Promise.all(
			artworkData.map(({ imageFile }) =>
				imageFile ? fetchCommonsImage(imageFile, language) : undefined
			)
		),
		Promise.all(
			artworkData.map(({ sourceUrl }) =>
				sourceUrl.includes('wikipedia.org') ? fetchWikipediaExtract(sourceUrl) : undefined
			)
		)
	]);

	const artworks = artworkData.map((data, i) => {
		const image = commonsResults[i];
		return {
			id: data.id,
			artistId: wikidataId,
			title: {
				en: data.title,
				pt: data.title
			},
			year: yearFromWikidataDate(bindings[i].inception?.value),
			description: {
				en: data.descriptionText,
				pt: data.descriptionText
			},
			extract: wikiExtracts[i],
			movement: data.movement ? { en: data.movement, pt: data.movement } : undefined,
			medium: data.material ? { en: data.material, pt: data.material } : undefined,
			genre: data.genre ? { en: data.genre, pt: data.genre } : undefined,
			location: data.location ? { en: data.location, pt: data.location } : undefined,
			image,
			sourceUrl: {
				[language]: data.sourceUrl
			},
			wikidataUrl: `https://www.wikidata.org/wiki/${data.id}`,
			license: image?.license,
			credit: image?.credit,
			dimensions: {
				width: image?.width,
				height: image?.height
			}
		} satisfies Artwork;
	});

	return artworks.filter((artwork) => artwork.image).slice(0, 16);
}

async function fetchWikipediaExtract(articleUrl: string): Promise<string | undefined> {
	try {
		const url = new URL(articleUrl);
		const title = url.pathname.split('/wiki/').at(-1);
		if (!title) return undefined;

		const lang = url.hostname.split('.')[0];
		const params = new URLSearchParams({
			action: 'query',
			format: 'json',
			formatversion: '2',
			prop: 'extracts',
			exintro: '1',
			explaintext: '1',
			titles: decodeURIComponent(title),
			origin: '*'
		});

		type ExtractResponse = {
			query?: { pages?: Array<{ extract?: string }> };
		};

		const data = await fetchJson<ExtractResponse>(
			`https://${lang}.wikipedia.org/w/api.php?${params}`
		);
		const extract = data.query?.pages?.[0]?.extract;

		return extract ? cleanExtract(extract) : undefined;
	} catch {
		return undefined;
	}
}

function cleanExtract(text: string) {
	return text
		.replaceAll(/\n{3,}/g, '\n\n')
		.replaceAll(/\(listen\)/gi, '')
		.replaceAll(/\[\d+\]/g, '')
		.trim();
}

async function fetchEntity(wikidataId: string) {
	const data = await fetchJson<EntityDataResponse>(
		`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`
	);
	const entity = data.entities?.[wikidataId];

	if (!entity) {
		throw new Error(`Wikidata entity not found: ${wikidataId}`);
	}

	return entity;
}

async function fetchCommonsImage(
	fileName: string,
	language: SupportedLanguage
): Promise<ImageMetadata | undefined> {
	const normalizedFile = fileName.startsWith('File:') ? fileName : `File:${fileName}`;
	const params = new URLSearchParams({
		action: 'query',
		format: 'json',
		formatversion: '2',
		prop: 'imageinfo',
		titles: normalizedFile,
		iiprop: 'url|size|mime|extmetadata',
		iiurlwidth: '2000',
		iiextmetadatalanguage: language,
		origin: '*'
	});
	const data = await fetchJson<CommonsImageInfoResponse>(
		`https://commons.wikimedia.org/w/api.php?${params}`
	);
	const info = data.query?.pages?.[0]?.imageinfo?.[0];

	if (!info?.url) {
		return undefined;
	}

	return {
		url: info.url,
		thumbnailUrl: info.thumburl ?? info.url,
		width: info.width,
		height: info.height,
		mime: info.mime,
		license: cleanMetadata(info.extmetadata?.LicenseShortName?.value),
		licenseUrl: cleanMetadata(info.extmetadata?.LicenseUrl?.value),
		credit: cleanMetadata(info.extmetadata?.Credit?.value ?? info.extmetadata?.Artist?.value),
		sourceUrl: info.descriptionurl ?? commonsFileUrl(normalizedFile)
	};
}

async function fetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
	const response = await fetch(url, {
		headers: {
			'user-agent': USER_AGENT,
			...headers
		}
	});

	if (!response.ok) {
		throw new Error(`Request failed ${response.status}: ${url}`);
	}

	return response.json() as Promise<T>;
}

function label(entity: Awaited<ReturnType<typeof fetchEntity>>, language: SupportedLanguage) {
	return entity.labels?.[language]?.value;
}

function description(entity: Awaited<ReturnType<typeof fetchEntity>>, language: SupportedLanguage) {
	return entity.descriptions?.[language]?.value;
}

function claimString(entity: Awaited<ReturnType<typeof fetchEntity>>['claims'], property: string) {
	const value = entity?.[property]?.[0]?.mainsnak?.datavalue?.value;
	return typeof value === 'string' ? value : undefined;
}

function wikiUrl(language: SupportedLanguage, title?: string) {
	return title
		? `https://${language}.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(' ', '_'))}`
		: undefined;
}

function commonsFileUrl(fileName: string) {
	return `https://commons.wikimedia.org/wiki/${encodeURIComponent(fileName.replaceAll(' ', '_'))}`;
}

function fileNameFromCommonsUrl(value: string) {
	const fileName = value.split('/').at(-1);
	return fileName ? decodeURIComponent(fileName) : undefined;
}

function cleanMetadata(value?: string) {
	return (
		value
			?.replaceAll(/<[^>]*>/g, '')
			.replaceAll(/\s+/g, ' ')
			.trim() || undefined
	);
}

function yearFromWikidataDate(value?: string) {
	if (!value) return undefined;
	const match = value.match(/[+-]?(\d{1,4})/);
	return match ? Number(match[0]) : undefined;
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replaceAll(/[\u0300-\u036f]/g, '')
		.replaceAll(/[^a-z0-9]+/g, '-')
		.replaceAll(/(^-|-$)/g, '');
}

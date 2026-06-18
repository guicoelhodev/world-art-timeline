export type SupportedLanguage = 'en' | 'pt';

export type LocalizedString = Partial<Record<SupportedLanguage, string>>;

export type ImageMetadata = {
	url: string;
	thumbnailUrl: string;
	width?: number;
	height?: number;
	mime?: string;
	license?: string;
	licenseUrl?: string;
	credit?: string;
	sourceUrl: string;
};

export type Artist = {
	id: string;
	slug: string;
	name: LocalizedString;
	description: LocalizedString;
	sourceUrl: Partial<Record<SupportedLanguage, string>>;
	wikidataUrl: string;
	image?: ImageMetadata;
};

export type Artwork = {
	id: string;
	artistId: string;
	title: LocalizedString;
	year?: number;
	description: LocalizedString;
	extract?: string;
	movement?: LocalizedString;
	medium?: LocalizedString;
	genre?: LocalizedString;
	location?: LocalizedString;
	image?: ImageMetadata;
	sourceUrl: Partial<Record<SupportedLanguage, string>>;
	wikidataUrl: string;
	license?: string;
	credit?: string;
	dimensions?: {
		width?: number;
		height?: number;
	};
};

export type ArtistRoom = {
	artist: Artist;
	artworks: Artwork[];
	language: SupportedLanguage;
	availableLanguages: SupportedLanguage[];
};
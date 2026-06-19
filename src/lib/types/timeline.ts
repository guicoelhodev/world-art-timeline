export type TimelineArtistSeed = {
	id: string;
	name: string;
	wikipediaTitle?: string;
	birthYear?: number;
	deathYear?: number;
};

export type TimelineMovementSeed = {
	id: string;
	name: string;
	startYear?: number;
	endYear?: number;
	artists: TimelineArtistSeed[];
};

export type TimelinePeriodSeed = {
	id: string;
	name: string;
	startYear: number;
	endYear: number;
	description: string;
	movements: TimelineMovementSeed[];
};

export type TimelineArtist = TimelineArtistSeed & {
	periodId: string;
	movementId: string;
	description?: string;
	thumbnailUrl?: string;
	sourceUrl?: string;
};

export type TimelineMovement = Omit<TimelineMovementSeed, 'artists'> & {
	periodId: string;
	artists: TimelineArtist[];
};

export type TimelinePeriod = Omit<TimelinePeriodSeed, 'movements'> & {
	movements: TimelineMovement[];
};

export type TimelineData = {
	periods: TimelinePeriod[];
	loadedAt: string;
};

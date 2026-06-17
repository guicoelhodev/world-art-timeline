import { error } from '@sveltejs/kit';
import { loadArtistRoom, normalizeLanguage } from '$lib/server/artist-room';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const author = url.searchParams.get('author')?.trim() || 'Michelangelo';
	const language = normalizeLanguage(url.searchParams.get('lang'));

	try {
		return await loadArtistRoom(author, language);
	} catch (cause) {
		console.error(cause);
		error(502, `Could not load room data for ${author}`);
	}
};

import { loadTimeline } from '$lib/server/timeline';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	return {
		timeline: await loadTimeline(fetch)
	};
};

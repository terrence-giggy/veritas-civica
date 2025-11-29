import { loadAllContent } from '$lib/content/loader.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const people = await loadAllContent('people');
  
  return {
    people,
    count: people.length,
  };
};

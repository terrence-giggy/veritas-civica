import { loadAllContent } from '$lib/content/loader.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const organizations = await loadAllContent('organizations');
  
  return {
    organizations,
    count: organizations.length,
  };
};

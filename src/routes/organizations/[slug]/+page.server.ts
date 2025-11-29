import { loadContent, getAllSlugs } from '$lib/content/loader.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const organization = await loadContent('organizations', params.slug);
  
  if (!organization) {
    error(404, {
      message: 'Organization not found',
    });
  }
  
  return {
    organization,
  };
};

// Generate static pages for all organizations at build time
export const entries: EntryGenerator = async () => {
  const slugs = await getAllSlugs('organizations');
  return slugs.map(slug => ({ slug }));
};

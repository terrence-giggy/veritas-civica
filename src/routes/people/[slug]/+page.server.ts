import { loadContent, getAllSlugs } from '$lib/content/loader.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad, EntryGenerator } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const person = await loadContent('people', params.slug);
  
  if (!person) {
    error(404, {
      message: 'Person not found',
    });
  }
  
  return {
    person,
  };
};

// Generate static pages for all people at build time
export const entries: EntryGenerator = async () => {
  const slugs = await getAllSlugs('people');
  return slugs.map(slug => ({ slug }));
};

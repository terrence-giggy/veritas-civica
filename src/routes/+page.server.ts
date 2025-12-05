/**
 * Landing Page Server
 * 
 * Loads featured content for the home page.
 */

import { loadAllContent } from '$lib/content';

export async function load() {
  // Load all people content
  const allPeople = await loadAllContent('people');
  
  // Get featured people (first 3, sorted by most recently updated)
  const featuredPeople = [...allPeople]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3);
  
  // Load all organizations content
  const allOrganizations = await loadAllContent('organizations');
  
  return {
    featuredPeople,
    peopleCount: allPeople.length,
    organizationsCount: allOrganizations.length
  };
}

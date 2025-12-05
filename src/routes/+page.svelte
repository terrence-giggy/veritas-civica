<script>
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Article from '$lib/components/ui/Article.svelte';
	
	let { data } = $props();
	
	// Calculate approximate read time (200 words per minute)
	function calculateReadTime(text) {
		if (!text) return 1;
		const words = text.split(/\s+/).length;
		return Math.max(1, Math.ceil(words / 200));
	}
	
	// Format date for display
	function formatDate(isoDate) {
		return new Date(isoDate).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Veritas Civica - Modern Typography & Publishing Platform</title>
</svelte:head>

<!-- Hero Section with Medium-inspired design -->
<section class="py-16 px-6">
	<div class="max-w-content mx-auto text-center">
		<Typography as="h1" variant="h1" class="mb-6">
			Welcome to Veritas Civica
		</Typography>
		<Typography as="p" variant="lead" class="mb-8 max-w-2xl mx-auto">
			Exploring historical figures and organizations through the lens of classical political philosophy. 
			{#if data.peopleCount > 0}
				Currently documenting {data.peopleCount} {data.peopleCount === 1 ? 'person' : 'people'}{#if data.organizationsCount > 0} and {data.organizationsCount} {data.organizationsCount === 1 ? 'organization' : 'organizations'}{/if}.
			{/if}
		</Typography>
		
		<div class="flex gap-4 justify-center flex-wrap">
			<Button variant="default" size="lg" class="font-medium" href="{base}/people">Explore People</Button>
			<Button variant="outline" size="lg" class="font-medium" href="{base}/organizations">View Organizations</Button>
		</div>
	</div>
</section>

<!-- Featured People Section -->
<section class="py-12 bg-muted/30">
	<div class="max-w-6xl mx-auto px-6">
		<Typography as="h2" variant="h2" class="text-center mb-12">
			Featured People
		</Typography>
		
		{#if data.featuredPeople.length > 0}
			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{#each data.featuredPeople as person}
					<a href="{base}/people/{person.slug}" class="block group">
						<Card class="h-full hover:shadow-lg transition-all duration-300">
							<div class="aspect-video bg-muted rounded-t-lg mb-4 flex items-center justify-center">
								<span class="text-4xl">👤</span>
							</div>
							<CardHeader>
								<CardTitle class="group-hover:text-primary transition-colors line-clamp-2">
									{person.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Typography as="p" variant="body" class="line-clamp-3 mb-4" style="color: hsl(var(--text-secondary))">
									{person.excerpt}
								</Typography>
								<div class="flex items-center gap-3 text-sm" style="color: hsl(var(--text-tertiary))">
									<span>{person.source}</span>
									<span>·</span>
									<span>{formatDate(person.updatedAt)}</span>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
			
			<div class="text-center mt-8">
				<Button variant="outline" href="{base}/people">View All People →</Button>
			</div>
		{:else}
			<div class="text-center py-8">
				<Typography as="p" variant="body" style="color: hsl(var(--text-secondary))">
					No content yet. Run <code class="px-2 py-1 bg-muted rounded text-sm font-mono">npm run sync</code> to fetch content.
				</Typography>
			</div>
		{/if}
	</div>
</section>

<!-- Article Demo Section -->
<section class="py-16">
	<Article
		title="Design System Showcase"
		subtitle="Demonstrating the typography and layout components inspired by Medium.com's reading experience"
		author="Design Team"
		publishDate="December 2024"
		readTime="3"
	>
		<Typography as="p" variant="body">
			This is a demonstration of our new typography-focused design system. The layout prioritizes readability with optimal line lengths, generous white space, and a carefully chosen serif font for body text.
		</Typography>

		<Typography as="h2" variant="h2">
			Typography Hierarchy
		</Typography>

		<Typography as="p" variant="body">
			Our typography scale follows Medium.com's principles of clear hierarchy and excellent readability. Headings use the same serif font as body text but with different weights and sizes to create visual distinction.
		</Typography>

		<Typography as="h3" variant="h3">
			Reading Experience
		</Typography>

		<Typography as="p" variant="body">
			The optimal line length of 65-75 characters per line, combined with a line height of 1.58, creates a comfortable reading experience that reduces eye strain and improves comprehension.
		</Typography>

		<Typography as="p" variant="body">
			This paragraph demonstrates the spacing and typography that makes long-form content enjoyable to read. The careful attention to typography details creates a premium reading experience similar to what you'd find on professional publishing platforms.
		</Typography>
	</Article>
</section>

<!-- Component Showcase -->
<section class="py-16 bg-muted/30">
	<div class="max-w-6xl mx-auto px-6">
		<Typography as="h2" variant="h2" class="text-center mb-12">
			Design Components
		</Typography>
		
		<div class="grid gap-8 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Button Variants</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap gap-3">
						<Button variant="default">Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Typography Samples</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<Typography as="h4" variant="h4" class="!mb-1">
							Heading Level 4
						</Typography>
						<Typography as="p" variant="body" class="!mb-2">
							Body text with optimal readability
						</Typography>
						<Typography as="p" variant="caption">
							Caption text for additional information
						</Typography>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="py-12 border-t">
	<div class="max-w-content mx-auto px-6 text-center">
		<Typography as="p" variant="caption" class="!mb-0">
			Built with ❤️ using SvelteKit, Tailwind CSS, and Shadcn Svelte components
			<br />
			Inspired by Medium.com's typography-first approach to web publishing
		</Typography>
	</div>
</footer>

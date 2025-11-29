<script lang="ts">
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	
	let { data } = $props();
</script>

<svelte:head>
	<title>People - Veritas Civica</title>
	<meta name="description" content="Explore historical figures and notable people from Speculum Principum" />
</svelte:head>

<section class="py-12 px-6">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<header class="text-center mb-12">
			<Typography as="h1" variant="h1" class="mb-4">
				People
			</Typography>
			<Typography as="p" variant="lead" class="max-w-2xl mx-auto">
				Historical figures and notable individuals documented in Speculum Principum.
				{#if data.count > 0}
					<span class="block mt-2 text-sm" style="color: hsl(var(--text-tertiary))">
						{data.count} {data.count === 1 ? 'person' : 'people'} documented
					</span>
				{/if}
			</Typography>
		</header>
		
		<!-- Content Grid -->
		{#if data.people.length > 0}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.people as person}
					<a href="/people/{person.slug}" class="block group">
						<Card class="h-full hover:shadow-lg transition-all duration-300">
							<CardHeader>
								<CardTitle class="group-hover:text-primary transition-colors">
									{person.title}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<Typography as="p" variant="body" class="line-clamp-3 mb-4 !text-sm" style="color: hsl(var(--text-secondary))">
									{person.excerpt}
								</Typography>
								<div class="flex items-center justify-between text-xs" style="color: hsl(var(--text-tertiary))">
									<span>From {person.source}</span>
									<time datetime={person.updatedAt}>
										{new Date(person.updatedAt).toLocaleDateString()}
									</time>
								</div>
							</CardContent>
						</Card>
					</a>
				{/each}
			</div>
		{:else}
			<!-- Empty State -->
			<div class="text-center py-16">
				<div class="max-w-md mx-auto">
					<div class="text-6xl mb-6">📚</div>
					<Typography as="h2" variant="h3" class="mb-4">
						No People Yet
					</Typography>
					<Typography as="p" variant="body" style="color: hsl(var(--text-secondary))">
						Content will appear here once synced from Speculum Principum.
						Run <code class="px-2 py-1 bg-muted rounded text-sm font-mono">npm run sync</code> to fetch content.
					</Typography>
				</div>
			</div>
		{/if}
		
		<!-- Back Link -->
		<div class="mt-12 text-center">
			<Button variant="outline" href="/">← Back to Home</Button>
		</div>
	</div>
</section>

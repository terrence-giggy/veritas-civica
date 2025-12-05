<script lang="ts">
	import { base } from '$app/paths';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	
	let { data } = $props();
</script>

<svelte:head>
	<title>Organizations - Veritas Civica</title>
	<meta name="description" content="Explore historical organizations and institutions from Speculum Principum" />
</svelte:head>

<section class="py-12 px-6">
	<div class="max-w-6xl mx-auto">
		<!-- Header -->
		<header class="text-center mb-12">
			<Typography as="h1" variant="h1" class="mb-4">
				Organizations
			</Typography>
			<Typography as="p" variant="lead" class="max-w-2xl mx-auto">
				Historical organizations, institutions, and groups documented in Speculum Principum.
				{#if data.count > 0}
					<span class="block mt-2 text-sm" style="color: hsl(var(--text-tertiary))">
						{data.count} {data.count === 1 ? 'organization' : 'organizations'} documented
					</span>
				{/if}
			</Typography>
		</header>
		
		<!-- Content Grid -->
		{#if data.organizations.length > 0}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.organizations as org}
					<a href="{base}/organizations/{org.slug}" class="block group">
						<Card class="h-full hover:shadow-lg transition-all duration-300">
							<CardHeader>
								<div class="flex items-start justify-between gap-2">
									<CardTitle class="group-hover:text-primary transition-colors">
										{org.title}
									</CardTitle>
									{#if org.confidence !== undefined}
										<span class="shrink-0 text-xs px-2 py-0.5 rounded-full {org.confidence >= 90 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : org.confidence >= 70 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}">
											{org.confidence}%
										</span>
									{/if}
								</div>
								{#if org.role}
									<span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
										{org.role}
									</span>
								{/if}
							</CardHeader>
							<CardContent>
								<Typography as="p" variant="body" class="line-clamp-3 mb-4 !text-sm" style="color: hsl(var(--text-secondary))">
									{org.excerpt}
								</Typography>
								<div class="flex items-center justify-between text-xs" style="color: hsl(var(--text-tertiary))">
									<span>From {org.source}</span>
									<time datetime={org.updatedAt}>
										{new Date(org.updatedAt).toLocaleDateString()}
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
					<div class="text-6xl mb-6">🏛️</div>
					<Typography as="h2" variant="h3" class="mb-4">
						No Organizations Yet
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
			<Button variant="outline" href="{base}/">← Back to Home</Button>
		</div>
	</div>
</section>

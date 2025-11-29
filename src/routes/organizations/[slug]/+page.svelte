<script lang="ts">
	import Typography from '$lib/components/ui/Typography.svelte';
	import Article from '$lib/components/ui/Article.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	
	let { data } = $props();
	
	// Format date for display
	function formatDate(isoDate: string): string {
		return new Date(isoDate).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
	
	// Calculate approximate read time (200 words per minute)
	function calculateReadTime(text: string): number {
		const words = text.split(/\s+/).length;
		return Math.max(1, Math.ceil(words / 200));
	}
</script>

<svelte:head>
	<title>{data.organization.title} - Veritas Civica</title>
	<meta name="description" content={data.organization.excerpt} />
</svelte:head>

<!-- Breadcrumb -->
<nav class="max-w-content mx-auto px-6 pt-8">
	<div class="flex items-center gap-2 text-sm" style="color: hsl(var(--text-tertiary))">
		<a href="/" class="hover:text-primary transition-colors">Home</a>
		<span>/</span>
		<a href="/organizations" class="hover:text-primary transition-colors">Organizations</a>
		<span>/</span>
		<span style="color: hsl(var(--text-secondary))">{data.organization.title}</span>
	</div>
</nav>

<Article
	title={data.organization.title}
	subtitle="From {data.organization.source}"
	author="Speculum Principum"
	publishDate={formatDate(data.organization.updatedAt)}
	readTime={calculateReadTime(data.organization.body).toString()}
>
	<!-- Render markdown body as plain text for now -->
	<!-- TODO: Add markdown parser for rich content -->
	{#each data.organization.body.split('\n\n') as paragraph}
		{#if paragraph.startsWith('# ')}
			<Typography as="h2" variant="h2">
				{paragraph.slice(2)}
			</Typography>
		{:else if paragraph.startsWith('## ')}
			<Typography as="h3" variant="h3">
				{paragraph.slice(3)}
			</Typography>
		{:else if paragraph.startsWith('### ')}
			<Typography as="h4" variant="h4">
				{paragraph.slice(4)}
			</Typography>
		{:else if paragraph.trim()}
			<Typography as="p" variant="body">
				{paragraph}
			</Typography>
		{/if}
	{/each}
	
	<!-- Source Attribution -->
	<div class="mt-12 p-6 bg-muted/50 rounded-lg border" style="border-color: hsl(var(--border))">
		<Typography as="h4" variant="h4" class="!mt-0 mb-3">
			Source Information
		</Typography>
		<dl class="grid gap-2 text-sm">
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Origin:</dt>
				<dd>{data.organization.source}</dd>
			</div>
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Discussion:</dt>
				<dd>
					<a 
						href={data.organization.discussionUrl} 
						target="_blank" 
						rel="noopener noreferrer"
						class="text-primary hover:underline"
					>
						View on GitHub →
					</a>
				</dd>
			</div>
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Last Updated:</dt>
				<dd>{formatDate(data.organization.updatedAt)}</dd>
			</div>
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Retrieved:</dt>
				<dd>{formatDate(data.organization.retrievedAt)}</dd>
			</div>
		</dl>
	</div>
</Article>

<!-- Navigation -->
<div class="max-w-content mx-auto px-6 pb-12">
	<div class="flex gap-4">
		<Button variant="outline" href="/organizations">← All Organizations</Button>
		<Button variant="ghost" href="/">Home</Button>
	</div>
</div>

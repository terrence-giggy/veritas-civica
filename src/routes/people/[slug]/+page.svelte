<script lang="ts">
	import { base } from '$app/paths';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Article from '$lib/components/ui/Article.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AttributeDisplay from '$lib/components/ui/AttributeDisplay.svelte';
	import { renderMarkdown } from '$lib/utils/markdown';
	
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
	
	// Render markdown content
	const renderedContent = $derived(renderMarkdown(data.person.body));
</script>

<svelte:head>
	<title>{data.person.title} - Veritas Civica</title>
	<meta name="description" content={data.person.excerpt} />
</svelte:head>

<!-- Breadcrumb -->
<nav class="max-w-content mx-auto px-6 pt-8">
	<div class="flex items-center gap-2 text-sm" style="color: hsl(var(--text-tertiary))">
		<a href="{base}/" class="hover:text-primary transition-colors">Home</a>
		<span>/</span>
		<a href="{base}/people" class="hover:text-primary transition-colors">People</a>
		<span>/</span>
		<span style="color: hsl(var(--text-secondary))">{data.person.title}</span>
	</div>
</nav>

<Article
	title={data.person.title}
	subtitle={data.person.role ? data.person.role : `From ${data.person.source}`}
	author="Speculum Principum"
	publishDate={formatDate(data.person.updatedAt)}
	readTime={calculateReadTime(data.person.body).toString()}
>
	<!-- Attribute Display - Type, Confidence, Key Attributes -->
	<AttributeDisplay parsedAttributes={data.person.parsedAttributes} class="mb-8" />
	
	<!-- Render markdown content with prose styling -->
	<div class="prose">
		{@html renderedContent}
	</div>
	
	<!-- Source Attribution -->
	<div class="mt-12 p-6 bg-muted/50 rounded-lg border" style="border-color: hsl(var(--border))">
		<Typography as="h4" variant="h4" class="!mt-0 mb-3">
			Source Information
		</Typography>
		<dl class="grid gap-2 text-sm">
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Origin:</dt>
				<dd>{data.person.source}</dd>
			</div>
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Discussion:</dt>
				<dd>
					<a 
						href={data.person.discussionUrl} 
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
				<dd>{formatDate(data.person.updatedAt)}</dd>
			</div>
			<div class="flex gap-2">
				<dt class="font-medium" style="color: hsl(var(--text-secondary))">Retrieved:</dt>
				<dd>{formatDate(data.person.retrievedAt)}</dd>
			</div>
		</dl>
	</div>
</Article>

<!-- Navigation -->
<div class="max-w-content mx-auto px-6 pb-12">
	<div class="flex gap-4">
		<Button variant="outline" href="{base}/people">← All People</Button>
		<Button variant="ghost" href="{base}/">Home</Button>
	</div>
</div>

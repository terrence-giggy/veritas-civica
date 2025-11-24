<script>
	import { cn } from "$lib/utils.js";
	import Typography from './Typography.svelte';
	
	let {
		title,
		subtitle,
		author,
		publishDate,
		readTime,
		class: className,
		children,
		...restProps
	} = $props();
</script>

<article class={cn("max-w-content mx-auto px-6 py-8", className)} {...restProps}>
	<!-- Article Header -->
	{#if title}
		<header class="mb-12">
			<Typography as="h1" variant="h1" class="mb-4">
				{title}
			</Typography>
			
			{#if subtitle}
				<Typography as="p" variant="lead" class="mb-8">
					{subtitle}
				</Typography>
			{/if}
			
			{#if author || publishDate || readTime}
				<div class="flex items-center gap-4 font-sans text-sm border-b pb-6" style="color: hsl(var(--text-secondary)); border-color: hsl(var(--border))">
					{#if author}
						<div class="flex items-center gap-2">
							<div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
								<span class="text-xs font-medium">{author.charAt(0)}</span>
							</div>
							<span class="font-medium">{author}</span>
						</div>
					{/if}
					
					{#if publishDate}
						<span style="color: hsl(var(--text-tertiary))">·</span>
						<time>{publishDate}</time>
					{/if}
					
					{#if readTime}
						<span style="color: hsl(var(--text-tertiary))">·</span>
						<span>{readTime} min read</span>
					{/if}
				</div>
			{/if}
		</header>
	{/if}
	
	<!-- Article Content -->
	<div class="prose max-w-none">
		{@render children?.()}
	</div>
	
	<!-- Article Footer / Engagement -->
	<footer class="mt-12 pt-8 border-t" style="border-color: hsl(var(--border))">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<!-- Clap/Like button placeholder -->
				<button class="flex items-center gap-2 px-3 py-2 rounded-full bg-muted hover:bg-accent transition-colors">
					<span class="text-sm">👏</span>
					<span class="text-sm font-medium" style="color: hsl(var(--text-secondary))">0</span>
				</button>
				
				<!-- Comment button placeholder -->
				<button class="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-muted transition-colors">
					<span class="text-sm">💬</span>
					<span class="text-sm" style="color: hsl(var(--text-secondary))">Comment</span>
				</button>
			</div>
			
			<!-- Share and bookmark buttons -->
			<div class="flex items-center gap-2">
				<button class="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Bookmark">
					<span class="text-lg">🔖</span>
				</button>
				<button class="p-2 rounded-full hover:bg-muted transition-colors" aria-label="Share">
					<span class="text-lg">📤</span>
				</button>
			</div>
		</div>
	</footer>
</article>
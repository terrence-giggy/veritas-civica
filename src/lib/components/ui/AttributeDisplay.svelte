<script lang="ts">
	import type { ParsedAttributes, DisplayAttribute } from '$lib/utils/attributes';
	import { getDisplayAttributes, getConfidenceLevel } from '$lib/utils/attributes';
	
	interface Props {
		parsedAttributes: ParsedAttributes;
		class?: string;
	}
	
	let { parsedAttributes, class: className = '' }: Props = $props();
	
	const displayAttrs = $derived(getDisplayAttributes(parsedAttributes));
	const confidenceInfo = $derived(getConfidenceLevel(parsedAttributes.confidence));
	
	// Color classes for confidence badge
	const confidenceColors: Record<string, string> = {
		green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
		yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
		red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
		gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
	};
</script>

{#if parsedAttributes.type || parsedAttributes.confidence !== undefined || displayAttrs.length > 0}
	<aside class="attribute-display {className}">
		<!-- Type and Confidence Header -->
		{#if parsedAttributes.type || parsedAttributes.confidence !== undefined}
			<div class="flex flex-wrap items-center gap-2 mb-4">
				{#if parsedAttributes.type}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
						{parsedAttributes.type}
					</span>
				{/if}
				{#if parsedAttributes.confidence !== undefined}
					<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {confidenceColors[confidenceInfo.color]}">
						{parsedAttributes.confidence}% Confidence
					</span>
				{/if}
			</div>
		{/if}
		
		<!-- Attributes List -->
		{#if displayAttrs.length > 0}
			<div class="border rounded-lg overflow-hidden" style="border-color: hsl(var(--border))">
				<div class="px-4 py-2 font-medium text-sm" style="background-color: hsl(var(--muted)); color: hsl(var(--text-primary))">
					Attributes
				</div>
				<dl class="divide-y" style="border-color: hsl(var(--border))">
					{#each displayAttrs as attr}
						<div class="px-4 py-3 flex flex-col sm:flex-row sm:gap-4">
							<dt class="text-sm font-medium shrink-0 sm:w-32" style="color: hsl(var(--text-tertiary))">
								{attr.label}
							</dt>
							<dd class="text-sm mt-1 sm:mt-0" style="color: hsl(var(--text-primary))">
								{attr.value}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}
	</aside>
{/if}

<style>
	.attribute-display dl > div:nth-child(even) {
		background-color: hsl(var(--muted) / 0.3);
	}
</style>

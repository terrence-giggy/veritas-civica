<script>
	import { cn } from "$lib/utils.js";
	
	let {
		as = 'div',
		variant = 'body',
		size = 'default',
		class: className,
		children,
		...restProps
	} = $props();

	const variants = {
		h1: 'text-4xl md:text-5xl lg:text-6xl font-bold font-serif leading-tight tracking-tight text-text-primary mb-6',
		h2: 'text-2xl md:text-3xl font-bold font-serif leading-tight tracking-tight text-text-primary mt-8 mb-4',
		h3: 'text-xl md:text-2xl font-semibold font-serif leading-tight tracking-tight text-text-primary mt-6 mb-3',
		h4: 'text-lg md:text-xl font-semibold font-serif leading-tight text-text-primary mt-4 mb-2',
		body: 'text-base md:text-lg font-serif leading-reading text-text-primary mb-6',
		lead: 'text-lg md:text-xl font-serif leading-reading text-text-secondary mb-6',
		caption: 'text-sm font-sans text-text-tertiary',
		label: 'text-sm font-medium font-sans text-text-primary',
	};

	const sizes = {
		sm: 'max-w-prose',
		default: 'max-w-content',
		lg: 'max-w-4xl',
		full: 'max-w-full',
	};
</script>

<svelte:element
	this={as}
	class={cn(
		variants[variant],
		sizes[size],
		'mx-auto', // Center content
		className
	)}
	{...restProps}
>
	{@render children?.()}
</svelte:element>
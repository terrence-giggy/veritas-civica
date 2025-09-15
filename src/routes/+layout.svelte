<script>
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Navigation from '$lib/components/ui/Navigation.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="Veritas Civica - A modern, typography-focused publishing platform" />
</svelte:head>

<div class="min-h-screen bg-background">
	<Navigation />
	<main>
		{@render children?.()}
	</main>
</div>

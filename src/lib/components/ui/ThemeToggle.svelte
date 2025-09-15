<script>
	import { onMount } from 'svelte';
	import { Sun, Moon } from 'lucide-svelte';
	import Button from './Button.svelte';

	let theme = $state('light');
	let mounted = $state(false);

	onMount(() => {
		// Check for saved theme or default to light
		const savedTheme = localStorage.getItem('theme') || 'light';
		theme = savedTheme;
		document.documentElement.classList.toggle('dark', theme === 'dark');
		mounted = true;
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		localStorage.setItem('theme', theme);
		document.documentElement.classList.toggle('dark', theme === 'dark');
	}
</script>

{#if mounted}
	<Button
		variant="ghost"
		size="icon"
		onclick={toggleTheme}
		aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
		class="relative"
	>
		{#if theme === 'light'}
			<Sun class="h-4 w-4 transition-all" />
		{:else}
			<Moon class="h-4 w-4 transition-all" />
		{/if}
	</Button>
{/if}
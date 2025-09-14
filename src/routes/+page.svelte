<script>
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
</script>

<svelte:head>
	<title>Veritas Civica - Modern Svelte Website</title>
</svelte:head>

<main class="container mx-auto py-10">
	<div class="text-center mb-10">
		<h1 class="text-4xl font-bold tracking-tight text-gray-900 mb-4">
			Welcome to Veritas Civica
		</h1>
		<p class="text-xl text-gray-600 mb-8">
			A modern Svelte-based static website with Shadcn Svelte components
		</p>
		
		<div class="flex gap-4 justify-center">
			<Button variant="default" size="lg">Get Started</Button>
			<Button variant="outline" size="lg">Learn More</Button>
		</div>
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle>Modern Design</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-gray-600">
					Built with the latest Svelte 5 and styled with Tailwind CSS for a modern, 
					responsive design that looks great on all devices.
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Component Library</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-gray-600">
					Featuring beautiful, accessible UI components inspired by Shadcn design 
					system, ready to use in your projects.
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Static Performance</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-gray-600">
					Optimized for static site generation with SvelteKit, ensuring fast 
					loading times and excellent SEO performance.
				</p>
			</CardContent>
		</Card>
	</div>

	<section class="mt-16">
		<h2 class="text-3xl font-bold text-center mb-8">Component Showcase</h2>
		
		<div class="grid gap-8 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Button Variants</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap gap-2">
						<Button variant="default">Default</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="destructive">Destructive</Button>
						<Button variant="link">Link</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Button Sizes</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap items-center gap-2">
						<Button size="sm">Small</Button>
						<Button size="default">Default</Button>
						<Button size="lg">Large</Button>
						<Button size="icon">🚀</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	</section>

	<footer class="mt-20 border-t pt-8 text-center text-gray-600">
		<p>Built with ❤️ using SvelteKit, Tailwind CSS, and Shadcn Svelte components</p>
	</footer>
</main>

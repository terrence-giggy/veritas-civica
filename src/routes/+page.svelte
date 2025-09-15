<script>
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import CardHeader from '$lib/components/ui/CardHeader.svelte';
	import CardTitle from '$lib/components/ui/CardTitle.svelte';
	import CardContent from '$lib/components/ui/CardContent.svelte';
	import Typography from '$lib/components/ui/Typography.svelte';
	import Article from '$lib/components/ui/Article.svelte';
</script>

<svelte:head>
	<title>Veritas Civica - Modern Typography & Publishing Platform</title>
</svelte:head>

<!-- Hero Section with Medium-inspired design -->
<section class="py-16 px-6">
	<div class="max-w-content mx-auto text-center">
		<Typography as="h1" variant="h1" class="mb-6">
			Welcome to Veritas Civica
		</Typography>
		<Typography as="p" variant="lead" class="mb-8 max-w-2xl mx-auto">
			A modern, typography-focused publishing platform inspired by the best reading experiences on the web. Built with Svelte, designed for readers and writers.
		</Typography>
		
		<div class="flex gap-4 justify-center flex-wrap">
			<Button variant="default" size="lg" class="font-medium">Start Reading</Button>
			<Button variant="outline" size="lg" class="font-medium">Write Your Story</Button>
		</div>
	</div>
</section>

<!-- Featured Article Section -->
<section class="py-12 bg-muted/30">
	<div class="max-w-6xl mx-auto px-6">
		<Typography as="h2" variant="h2" class="text-center mb-12">
			Featured Stories
		</Typography>
		
		<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			<Card class="group hover:shadow-lg transition-all duration-300 cursor-pointer">
				<div class="aspect-video bg-muted rounded-t-lg mb-4"></div>
				<CardHeader>
					<CardTitle class="group-hover:text-primary transition-colors line-clamp-2">
						The Future of Typography in Digital Publishing
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Typography as="p" variant="body" class="line-clamp-3 mb-4" style="color: hsl(var(--text-secondary))">
						Exploring how modern web technologies are reshaping the way we read and write online, with a focus on accessibility and readability.
					</Typography>
					<div class="flex items-center gap-3 text-sm" style="color: hsl(var(--text-tertiary))">
						<span>Jane Smith</span>
						<span>·</span>
						<span>5 min read</span>
						<span>·</span>
						<span>Dec 15</span>
					</div>
				</CardContent>
			</Card>

			<Card class="group hover:shadow-lg transition-all duration-300 cursor-pointer">
				<div class="aspect-video bg-muted rounded-t-lg mb-4"></div>
				<CardHeader>
					<CardTitle class="group-hover:text-primary transition-colors line-clamp-2">
						Building Accessible Web Components
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Typography as="p" variant="body" class="line-clamp-3 mb-4" style="color: hsl(var(--text-secondary))">
						A comprehensive guide to creating inclusive user interfaces that work for everyone, following WCAG guidelines and best practices.
					</Typography>
					<div class="flex items-center gap-3 text-sm" style="color: hsl(var(--text-tertiary))">
						<span>Alex Johnson</span>
						<span>·</span>
						<span>7 min read</span>
						<span>·</span>
						<span>Dec 12</span>
					</div>
				</CardContent>
			</Card>

			<Card class="group hover:shadow-lg transition-all duration-300 cursor-pointer">
				<div class="aspect-video bg-muted rounded-t-lg mb-4"></div>
				<CardHeader>
					<CardTitle class="group-hover:text-primary transition-colors line-clamp-2">
						The Art of Minimalist Design
					</CardTitle>
				</CardHeader>
				<CardContent>
					<Typography as="p" variant="body" class="line-clamp-3 mb-4" style="color: hsl(var(--text-secondary))">
						Why less is more in modern web design, and how to create beautiful, functional interfaces with minimal visual clutter.
					</Typography>
					<div class="flex items-center gap-3 text-sm" style="color: hsl(var(--text-tertiary))">
						<span>Maria Garcia</span>
						<span>·</span>
						<span>4 min read</span>
						<span>·</span>
						<span>Dec 10</span>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- Article Demo Section -->
<section class="py-16">
	<Article
		title="Design System Showcase"
		subtitle="Demonstrating the typography and layout components inspired by Medium.com's reading experience"
		author="Design Team"
		publishDate="December 2024"
		readTime="3"
	>
		<Typography as="p" variant="body">
			This is a demonstration of our new typography-focused design system. The layout prioritizes readability with optimal line lengths, generous white space, and a carefully chosen serif font for body text.
		</Typography>

		<Typography as="h2" variant="h2">
			Typography Hierarchy
		</Typography>

		<Typography as="p" variant="body">
			Our typography scale follows Medium.com's principles of clear hierarchy and excellent readability. Headings use the same serif font as body text but with different weights and sizes to create visual distinction.
		</Typography>

		<Typography as="h3" variant="h3">
			Reading Experience
		</Typography>

		<Typography as="p" variant="body">
			The optimal line length of 65-75 characters per line, combined with a line height of 1.58, creates a comfortable reading experience that reduces eye strain and improves comprehension.
		</Typography>

		<Typography as="p" variant="body">
			This paragraph demonstrates the spacing and typography that makes long-form content enjoyable to read. The careful attention to typography details creates a premium reading experience similar to what you'd find on professional publishing platforms.
		</Typography>
	</Article>
</section>

<!-- Component Showcase -->
<section class="py-16 bg-muted/30">
	<div class="max-w-6xl mx-auto px-6">
		<Typography as="h2" variant="h2" class="text-center mb-12">
			Design Components
		</Typography>
		
		<div class="grid gap-8 md:grid-cols-2">
			<Card>
				<CardHeader>
					<CardTitle>Button Variants</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="flex flex-wrap gap-3">
						<Button variant="default">Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="outline">Outline</Button>
						<Button variant="ghost">Ghost</Button>
						<Button variant="link">Link</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Typography Samples</CardTitle>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<Typography as="h4" variant="h4" class="!mb-1">
							Heading Level 4
						</Typography>
						<Typography as="p" variant="body" class="!mb-2">
							Body text with optimal readability
						</Typography>
						<Typography as="p" variant="caption">
							Caption text for additional information
						</Typography>
					</div>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<!-- Footer -->
<footer class="py-12 border-t">
	<div class="max-w-content mx-auto px-6 text-center">
		<Typography as="p" variant="caption" class="!mb-0">
			Built with ❤️ using SvelteKit, Tailwind CSS, and Shadcn Svelte components
			<br />
			Inspired by Medium.com's typography-first approach to web publishing
		</Typography>
	</div>
</footer>

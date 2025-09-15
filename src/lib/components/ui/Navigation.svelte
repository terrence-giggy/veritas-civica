<script>
	import { cn } from "$lib/utils.js";
	import { Search, Bell, User } from 'lucide-svelte';
	import Button from './Button.svelte';
	import ThemeToggle from './ThemeToggle.svelte';
	
	let {
		class: className,
		...restProps
	} = $props();
</script>

<nav class={cn(
	"sticky top-0 z-50 w-full border-b backdrop-blur-sm",
	className
)} style="border-color: hsl(var(--border)); background-color: hsl(var(--background) / 0.8)" {...restProps}>
	<div class="max-w-6xl mx-auto px-6">
		<div class="flex items-center justify-between h-16">
			<!-- Logo / Brand -->
			<div class="flex items-center">
				<a href="/" class="text-xl font-bold font-serif hover:text-primary transition-colors" style="color: hsl(var(--text-primary))">
					Veritas Civica
				</a>
			</div>
			
			<!-- Center - Search (hidden on mobile) -->
			<div class="hidden md:flex items-center flex-1 max-w-md mx-8">
				<div class="relative w-full">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style="color: hsl(var(--text-tertiary))" />
					<input
						type="search"
						placeholder="Search articles..."
						class="w-full pl-10 pr-4 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
						style="
							border-color: hsl(var(--border));
							background-color: hsl(var(--muted) / 0.5);
							color: hsl(var(--text-primary));
						"
					/>
				</div>
			</div>
			
			<!-- Right side - Actions -->
			<div class="flex items-center gap-2">
				<!-- Mobile search button -->
				<Button variant="ghost" size="icon" class="md:hidden">
					<Search class="h-4 w-4" />
				</Button>
				
				<!-- Write button -->
				<Button variant="ghost" class="hidden sm:flex">
					Write
				</Button>
				
				<!-- Notifications -->
				<Button variant="ghost" size="icon">
					<Bell class="h-4 w-4" />
				</Button>
				
				<!-- Theme toggle -->
				<ThemeToggle />
				
				<!-- User menu -->
				<Button variant="ghost" size="icon">
					<User class="h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>
</nav>
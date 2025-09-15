# Site Design & UI Workflow

This workflow provides specialized instructions for UI/UX improvements, component design, and visual updates to the Veritas Civica website's Medium.com-inspired design system.

## When to Use This Workflow

Use this workflow when the user requests:
- Typography and reading experience improvements
- Medium.com-inspired design enhancements
- Dark mode and theme-related changes
- Publishing platform UI/UX optimization
- Component library enhancements focused on content presentation
- Accessibility enhancements for reading experiences
- Design system consistency improvements for typography-focused layouts

## Multi-Step Design Process

### Phase 1: Understand Current UI Components

#### Step 1.1: Analyze Existing Components
```bash
# First, examine the current component structure
ls -la src/lib/components/ui/
```

#### Step 1.2: Review Component Implementation
- Read all existing UI components in `src/lib/components/ui/`
- Understand current Shadcn Svelte component usage
- Document current design patterns and styling approaches
- Identify component variants and their implementations

#### Step 1.3: Analyze Current Design System
- Review `tailwind.config.js` for Medium.com-inspired design tokens
- Examine `src/app.css` for typography and theming CSS custom properties
- Check `src/routes/+page.svelte` for current Medium-inspired layout and content structure
- Analyze Typography and Article components for reading experience optimization
- Document current serif typography, color hierarchy, and dark mode implementation

#### Step 1.4: Assessment Output
Create a brief summary covering:
- Current component inventory (Typography, Article, ThemeToggle, etc.)
- Medium.com-inspired design patterns in use
- Typography-focused styling approach (serif fonts, optimal line heights)
- Dark mode implementation and theming system
- Areas for improvement or gaps in reading experience

### Phase 2: Research High-Quality Solutions

#### Step 2.1: Design System Research
- Research Medium.com's typography and reading experience best practices
- Identify modern publishing platform design trends and patterns
- Research accessibility standards for long-form content (WCAG guidelines)
- Look for inspiration from editorial and publishing design systems
- Study dark mode implementations in content-focused applications

#### Step 2.2: Technical Implementation Research
- Research Shadcn Svelte component best practices
- Check for new or updated Shadcn components that could improve the design
- Consider Tailwind CSS v4 features and utilities
- Review responsive design patterns and mobile-first approaches

#### Step 2.3: Solution Documentation
Document your research findings:
- Recommended design approach with rationale
- Technical implementation strategy
- Accessibility considerations
- Potential impact on existing components

### Phase 3: Implement Code Changes & Updates

#### Step 3.1: Plan Implementation
- Break down changes into logical components/files
- Identify dependencies between changes
- Plan for backward compatibility if needed
- Consider impact on existing functionality

#### Step 3.2: Implement Changes
Execute changes in this order:

1. **Update design tokens** (if needed)
   - Modify `tailwind.config.js` for typography-focused design tokens
   - Update CSS custom properties in `src/app.css` for theming and typography
   - Ensure proper serif font definitions and reading-optimized line heights

2. **Update or create components**
   - Modify Typography component for better hierarchical text rendering
   - Enhance Article component for optimal long-form content presentation
   - Update ThemeToggle for seamless light/dark mode transitions
   - Create new components following Medium.com-inspired patterns

3. **Update page layouts and content**
   - Apply typography components in `src/routes/+page.svelte`
   - Update `src/routes/+layout.svelte` for theme management
   - Ensure content hierarchy follows publishing platform best practices

#### Step 3.3: Validation & Testing
After each implementation step:

1. **Build validation**: Run `npm run build` - ensure no errors
2. **Visual validation**: Run `npm run dev` and check design in browser
3. **Reading experience testing**: Test typography hierarchy and content readability
4. **Dark mode testing**: Verify theme toggle functionality and color transitions
5. **Accessibility testing**: Check keyboard navigation, screen reader compatibility, and color contrast
5. **Cross-browser testing**: Verify appearance in different browsers

#### Step 3.4: Documentation
- Update component documentation if new props/variants added
- Document any breaking changes
- Note accessibility improvements made

## Key Technical Patterns

### Typography Component Usage
```svelte
<!-- Medium.com-inspired Typography component -->
<script>
  import Typography from '$lib/components/ui/Typography.svelte';
</script>

<!-- Hierarchical headings -->
<Typography as="h1" variant="h1">Main Heading</Typography>
<Typography as="h2" variant="h2">Section Heading</Typography>

<!-- Body text optimized for reading -->
<Typography as="p" variant="body">
  Serif body text with optimal line height and spacing for reading comfort.
</Typography>

<!-- Lead text for article introductions -->
<Typography as="p" variant="lead">
  Larger introductory text that draws readers into the content.
</Typography>
```

### Theme Toggle Implementation
```svelte
<!-- ThemeToggle component with CSS custom properties -->
<script>
  import ThemeToggle from '$lib/components/ui/ThemeToggle.svelte';
</script>

<ThemeToggle />

<!-- CSS custom properties in app.css enable smooth theme transitions -->
```

### Component Creation
```svelte
<!-- Follow Shadcn Svelte patterns -->
<script lang="ts">
  import { cn } from "$lib/utils";
  import { cva, type VariantProps } from "class-variance-authority";
  
  const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium",
    {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground hover:bg-primary/90",
          // Add your variants
        },
        size: {
          default: "h-10 px-4 py-2",
          // Add your sizes
        }
      },
      defaultVariants: {
        variant: "default",
        size: "default"
      }
    }
  );
  
  type ButtonProps = VariantProps<typeof buttonVariants>;
  export let variant: ButtonProps["variant"] = "default";
  export let size: ButtonProps["size"] = "default";
  export let className: string = "";
</script>

<button class={cn(buttonVariants({ variant, size }), className)} {...$$restProps}>
  <slot />
</button>
```

### Design Token Updates for Typography & Theming
```js
// tailwind.config.js - Medium.com-inspired design tokens
export default {
  theme: {
    extend: {
      fontFamily: {
        serif: "var(--font-serif)", // Charter, Georgia for content
        sans: "var(--font-sans)"    // System fonts for UI
      },
      maxWidth: {
        'content': 'var(--content-width)', // 728px - Medium's article width
        'prose': '65ch' // Optimal reading width
      },
      lineHeight: {
        'reading': 'var(--reading-line-height)' // 1.58 - Medium's line height
      },
      colors: {
        // CSS custom properties for theme switching
        primary: "hsl(var(--primary))", // Medium green
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))"
      }
    }
  }
}
```

```css
/* src/app.css - CSS custom properties for theming */
:root {
  --font-serif: charter, Georgia, Cambria, serif;
  --content-width: 728px;
  --reading-line-height: 1.58;
  
  /* Light mode colors */
  --primary: 142 70% 31%; /* Medium green */
  --background: 0 0% 100%;
  --text-primary: 0 0% 13%;
}

.dark {
  /* Dark mode colors */
  --background: 0 0% 7%;
  --text-primary: 0 0% 95%;
}
```

## Design Quality Checklist

Before completing design work, verify:

### Visual Quality
- [ ] Typography hierarchy follows Medium.com's principles
- [ ] Serif fonts applied correctly for content readability
- [ ] Appropriate color contrast ratios (4.5:1 minimum)
- [ ] Optimal line lengths (65-75 characters) maintained
- [ ] Smooth theme transitions between light and dark modes
- [ ] Consistent spacing following Medium.com's generous white space principles

### Responsive Design
- [ ] Mobile-first design principles applied
- [ ] Breakpoint behavior tested (sm, md, lg, xl)
- [ ] Content remains readable at all sizes
- [ ] Touch targets are minimum 44px

### Accessibility
- [ ] Keyboard navigation works properly
- [ ] Screen reader compatibility verified
- [ ] Color is not the only way to convey information
- [ ] Sufficient color contrast maintained

### Technical Implementation
- [ ] Typography and Article components follow Medium.com-inspired patterns
- [ ] CSS custom properties used for robust theming
- [ ] Theme toggle works seamlessly between light and dark modes
- [ ] Proper TypeScript types defined for all components
- [ ] No console errors in browser dev tools
- [ ] Build completes successfully

## Common Design Tasks

### Typography Improvements
1. Analyze current Typography component hierarchy
2. Optimize font sizes and line heights for readability
3. Ensure serif fonts are properly applied to content
4. Test reading experience across different screen sizes

### Dark Mode Enhancements
1. Update CSS custom properties in `src/app.css`
2. Test color contrast ratios for accessibility
3. Verify ThemeToggle component functionality
4. Ensure smooth transitions between themes

### Layout Improvements for Reading Experience
1. Optimize content width (following Medium's 728px standard)
2. Implement proper content hierarchy with Typography component
3. Use Article component for long-form content presentation
4. Test responsive behavior for reading comfort

### Typography Updates
1. Choose appropriate serif fonts for content (currently Charter, Georgia)
2. Update `tailwind.config.js` font configuration
3. Define clear hierarchy using Typography component variants
4. Ensure optimal line heights and character limits for reading

Remember: Always prioritize reading experience and accessibility. Every design decision should improve content consumption and make the platform more inclusive, following Medium.com's focus on quality typography and user-centered design.
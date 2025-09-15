# Site Design & UI Workflow

This workflow provides specialized instructions for UI/UX improvements, component design, and visual updates to the Veritas Civica website.

## When to Use This Workflow

Use this workflow when the user requests:
- Visual design improvements or styling changes
- Component library enhancements or new components
- UI/UX optimization or modernization
- Color scheme, typography, or layout adjustments
- Responsive design improvements
- Accessibility enhancements for visual elements
- Design system consistency improvements

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
- Review `tailwind.config.js` for custom design tokens
- Examine `src/app.css` for global styles
- Check `src/routes/+page.svelte` for current layout and component usage
- Document current color scheme, typography, and spacing

#### Step 1.4: Assessment Output
Create a brief summary covering:
- Current component inventory
- Design patterns in use
- Styling approach (Tailwind classes, custom CSS)
- Areas for improvement or gaps identified

### Phase 2: Research High-Quality Solutions

#### Step 2.1: Design System Research
- Identify modern design trends relevant to the project type
- Research best practices for the specific component or design element
- Consider accessibility standards (WCAG guidelines)
- Look for inspiration from established design systems (Material Design, Ant Design, etc.)

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
   - Modify `tailwind.config.js` for new colors, spacing, typography
   - Update CSS custom properties in `src/app.css`

2. **Update or create components**
   - Modify existing components in `src/lib/components/ui/`
   - Create new components following Shadcn Svelte patterns
   - Ensure proper TypeScript types and props

3. **Update page layouts and content**
   - Apply new components in `src/routes/+page.svelte`
   - Update `src/routes/+layout.svelte` if needed
   - Ensure responsive behavior across all viewports

#### Step 3.3: Validation & Testing
After each implementation step:

1. **Build validation**: Run `npm run build` - ensure no errors
2. **Visual validation**: Run `npm run dev` and check design in browser
3. **Responsive testing**: Test on multiple screen sizes
4. **Accessibility testing**: Check keyboard navigation and screen reader compatibility
5. **Cross-browser testing**: Verify appearance in different browsers

#### Step 3.4: Documentation
- Update component documentation if new props/variants added
- Document any breaking changes
- Note accessibility improvements made

## Key Technical Patterns

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

### Design Token Updates
```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#...',
          500: '#...',
          950: '#...'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  }
}
```

## Design Quality Checklist

Before completing design work, verify:

### Visual Quality
- [ ] Consistent spacing and alignment
- [ ] Appropriate color contrast ratios (4.5:1 minimum)
- [ ] Readable typography hierarchy
- [ ] Proper focus states for interactive elements
- [ ] Smooth hover/transition effects

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
- [ ] Components follow Shadcn Svelte patterns
- [ ] Proper TypeScript types defined
- [ ] CSS classes use Tailwind utilities when possible
- [ ] No console errors in browser dev tools
- [ ] Build completes successfully

## Common Design Tasks

### Adding New Component Variants
1. Define new variants in `cva` configuration
2. Add corresponding Tailwind classes
3. Test all variant combinations
4. Update TypeScript types if needed

### Updating Color Schemes
1. Update `tailwind.config.js` color palette
2. Test contrast ratios for accessibility
3. Update components using the colors
4. Verify dark mode compatibility (if applicable)

### Layout Improvements
1. Analyze current layout structure
2. Plan responsive breakpoint behavior
3. Implement using CSS Grid or Flexbox via Tailwind
4. Test across all screen sizes

### Typography Updates
1. Choose web-safe font stack or web fonts
2. Update `tailwind.config.js` font configuration
3. Define clear hierarchy (h1-h6, body, captions)
4. Ensure readability and accessibility

Remember: Always prioritize user experience and accessibility over visual trends. Every design decision should improve usability and make the site more inclusive.
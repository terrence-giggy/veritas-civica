# Veritas Civica

https://specula-principum.github.io/veritas-civica/

A modern Svelte-based static website built with SvelteKit and styled with Shadcn Svelte components.

## ✨ Features

- **Modern Framework**: Built with SvelteKit and Svelte 5
- **Static Site Generation**: Optimized for fast loading and excellent SEO
- **Beautiful Components**: Shadcn Svelte-inspired UI components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: TypeScript support ready when needed
- **Production Ready**: Configured for static deployment

## 🚀 Tech Stack

- **[SvelteKit](https://kit.svelte.dev/)** - Full-stack web framework
- **[Svelte 5](https://svelte.dev/)** - Component framework with runes
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn Svelte](https://www.shadcn-svelte.com/)** - Beautiful, accessible components
- **[@sveltejs/adapter-static](https://github.com/sveltejs/kit/tree/master/packages/adapter-static)** - Static site adapter

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd veritas-civica
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## 📦 Components

The project includes custom Shadcn Svelte-inspired components:

- **Button** - Multiple variants (default, secondary, outline, ghost, destructive, link)
- **Card** - Container component with header, title, and content sections
- **Utility Functions** - cn() function for conditional class merging

All components are located in `src/lib/components/ui/` and built with:
- Tailwind CSS for styling
- Class Variance Authority for variant management
- Proper TypeScript support
- Accessibility best practices

## 🎨 Styling

The project uses a design system based on CSS custom properties for consistent theming:

- Light and dark mode support
- Semantic color tokens
- Consistent spacing and typography
- Responsive design patterns

## 🚀 Deployment

The site is built as a static website and can be deployed to any static hosting service:

1. Build the site:
```bash
npm run build
```

2. Deploy the `build/` directory to your hosting provider:
   - **Netlify**: Drag and drop the `build` folder
   - **Vercel**: Connect your repository and set build command to `npm run build`
   - **GitHub Pages**: Use GitHub Actions to build and deploy
   - **AWS S3**: Upload the `build` folder to your S3 bucket

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── ui/          # Shadcn Svelte components
│   └── utils.js         # Utility functions
├── routes/
│   ├── +layout.svelte   # Main layout
│   ├── +layout.js       # Layout configuration
│   └── +page.svelte     # Homepage
├── app.css              # Global styles and design tokens
└── app.html             # HTML template
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ using SvelteKit, Tailwind CSS, and Shadcn Svelte components.

# JSON Prettier

A fast, free, and privacy-focused online JSON formatting and validation tool.

**Live Demo:** [jsonprettier.org](https://jsonprettier.org)

## Overview

JSON Prettier is a modern web application that helps developers format, validate, and beautify JSON data instantly. Built with Nuxt 4 and Vue 3, it provides a seamless dual-panel editor experience with real-time syntax highlighting and error detection.

## Features

### Core Functionality
- **Real-time JSON Formatting** - Automatically formats and prettifies JSON as you type
- **Syntax Highlighting** - Color-coded JSON elements (strings, numbers, booleans, null) for better readability
- **Instant Validation** - Real-time JSON parsing with detailed error messages
- **Error Navigation** - Automatically scrolls to and highlights syntax errors with line-specific reporting
- **Line Numbers** - Synchronized line numbers across input and output panels

### User Experience
- **Dual-panel Interface** - Side-by-side view of raw and formatted JSON
- **Synchronized Scrolling** - Input and output panels scroll together for easy comparison
- **Copy to Clipboard** - One-click copy of formatted JSON
- **Fullscreen Mode** - Distraction-free editing experience
- **Keyboard Navigation** - Full arrow key support and standard shortcuts (Cmd/Ctrl+A for select all)
- **Smart Caret Positioning** - Maintains cursor position during real-time formatting
- **Responsive Design** - Works seamlessly on desktop and mobile devices

### Privacy & Performance
- **100% Client-side Processing** - Your JSON data never leaves your browser
- **No Server Uploads** - All formatting and validation happens locally
- **Fast & Lightweight** - Static site with instant loading
- **No Dependencies** - Built with vanilla Vue 3, no heavy libraries

### SEO & Accessibility
- **Comprehensive Meta Tags** - Open Graph and Twitter Card support
- **JSON-LD Schema** - Structured data for better search engine visibility
- **Sitemap & Robots.txt** - Optimized for search engine crawling

## Advantages

### For Users
1. **Privacy First** - Your sensitive JSON data stays in your browser
2. **No Account Required** - Use immediately without sign-up
3. **Always Available** - Static site means 99.9% uptime
4. **Fast Performance** - No server round-trips, instant formatting
5. **Free Forever** - No premium features, no paywalls
6. **Mobile Friendly** - Format JSON on any device

### For Developers
1. **Intelligent Error Detection** - Pinpoints exact location of JSON syntax errors
2. **Efficient Editing** - Contenteditable-based editor with syntax highlighting
3. **Debounced Updates** - Smart 300ms delay balances responsiveness and performance
4. **Clean Output** - Properly indented, readable JSON formatting
5. **Keyboard-first Workflow** - Navigate and edit without touching the mouse

### Technical Advantages
1. **Modern Stack** - Built with Nuxt 4 and Vue 3 Composition API
2. **Static Generation** - Pre-rendered for optimal performance
3. **Zero Backend** - No server infrastructure needed
4. **Open Source** - Fully transparent and auditable codebase
5. **TypeScript Support** - Type-safe development experience

## How to Use

### As a User (Web Interface)

1. **Visit** [jsonprettier.org](https://jsonprettier.org)
2. **Paste** your JSON into the left input panel
3. **View** the formatted output in the right panel (updates automatically)
4. **Fix Errors** - If there are syntax errors, they'll be highlighted with line numbers
5. **Copy** formatted JSON using the "Copy" button
6. **Fullscreen** - Click the fullscreen icon for a larger editing area

**Tips:**
- Use arrow keys to navigate through your JSON
- Press Cmd/Ctrl+A to select all text
- Scroll in either panel - both panels sync automatically
- Error messages show the exact line where issues occur

### As a Developer (Local Setup)

#### Prerequisites
- Node.js 18+ or later
- pnpm (recommended), npm, yarn, or bun

#### Installation

```bash
# Clone the repository
git clone https://github.com/aamirkhancr7/jsonprettier.org.git
cd jsonprettier.org

# Install dependencies
pnpm install
```

#### Development

```bash
# Start development server at http://localhost:3000
pnpm dev
```

The development server includes hot module replacement (HMR) for instant updates.

#### Building for Production

```bash
# Build the application
pnpm build

# Preview production build locally
pnpm preview

# Generate static site
pnpm generate
```

The static site will be generated in the `.output/public` directory.

#### Project Structure

```
jsonprettier.org/
├── app.vue                    # Root layout
├── pages/
│   └── index.vue             # Main page with SEO meta tags
├── components/
│   └── JsonPretty.vue        # Core JSON editor component
├── public/
│   ├── favicon.ico
│   ├── manifest.json         # PWA manifest
│   └── social-preview.png    # Social media preview image
├── nuxt.config.ts            # Nuxt configuration
└── CLAUDE.md                 # Project documentation for AI assistance
```

## Technical Details

### Architecture
- **Framework:** Nuxt 4 with SSR enabled, static site generation
- **Frontend:** Vue 3 with Composition API (`<script setup>`)
- **Styling:** Scoped CSS with custom responsive design
- **Deployment:** Static hosting (Netlify, Vercel, etc.)

### Key Implementation Details
- **Contenteditable Editor:** Uses `contenteditable` divs for syntax highlighting while maintaining editability
- **Caret Management:** Smart cursor position preservation during real-time updates (`components/JsonPretty.vue:146-185`)
- **Debounced Validation:** 300ms delay after typing stops before triggering formatting
- **Position-based Errors:** Converts error character positions to line numbers for precise error location
- **Line-by-line State:** Input/output stored as line arrays for granular reactivity

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for any purpose.

## Support

If you find this tool helpful, consider:
- Starring the repository
- Sharing with other developers
- Reporting bugs or suggesting features via GitHub Issues

## Acknowledgments

Built with:
- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [@nuxtjs/sitemap](https://github.com/nuxt-modules/sitemap)
- [@nuxtjs/robots](https://github.com/nuxt-modules/robots)

---

Made with ❤️ for developers who value privacy and performance.

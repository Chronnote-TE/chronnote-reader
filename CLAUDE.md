# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Start development server for reader at http://localhost:3000/dev/reader.html
- `npm run view-dev` - Start development server for view-only mode
- `npm run build` - Build both PDF.js and reader components for production
- `npm run build:pdf.js` - Build PDF.js components only
- `npm run build:reader` - Build reader components only
- `npm run build:ios` - Build for iOS platform
- `npm run build:android` - Build for Android platform

### Build Requirements
- Node.js 18+ required
- Use `NODE_OPTIONS=--openssl-legacy-provider` prefix for npm commands due to legacy OpenSSL requirements

### Linting and Type Checking
- ESLint configuration in `.eslintrc` extends `@zotero` config
- TypeScript configuration in `tsconfig.json`
- No explicit test command - project notes "No tests yet"

## High-Level Architecture

### Multi-Format Reader System
This is a comprehensive document reader that supports PDF, EPUB, and HTML snapshot viewing with advanced annotation capabilities. The architecture follows a modular view-based pattern where different document types are handled by specialized view classes.

### Core Components

#### Main Reader (`src/common/reader.js`)
- Central orchestrator that manages all document types
- Handles state management, annotation management, and view coordination
- Supports split-view functionality (horizontal/vertical)
- Manages themes, tools, and user interface state
- Integrates React-based UI with document-specific view implementations

#### View System Architecture
The reader implements a polymorphic view system where each document type has its own specialized view:

**PDF View (`src/pdf/pdf-view.js`)**
- Wraps PDF.js viewer in an iframe
- Handles PDF-specific features like page rotation, thumbnails, and printing
- Manages PDF annotations and rendering

**EPUB View (`src/dom/epub/epub-view.ts`)**
- Built on epub.js library for EPUB rendering
- Supports both paginated and scrolled flow modes
- Handles CFI (Canonical Fragment Identifier) navigation
- Manages EPUB-specific features like table of contents and section navigation

**Snapshot View (`src/dom/snapshot/snapshot-view.ts`)**
- Renders HTML snapshots of web pages
- Supports focus mode for distraction-free reading
- Handles web-specific annotation and selection features

#### Annotation System
- Centralized annotation manager (`src/common/annotation-manager.js`)
- Supports multiple annotation types: highlight, underline, note, text, ink, image, area
- Cross-format annotation persistence and synchronization
- Advanced features like annotation merging, conversion, and filtering

#### UI Framework
- React-based interface with Fluent localization
- Modular component system in `src/common/components/`
- SCSS-based styling with theme support
- Responsive design supporting desktop and mobile platforms

### Key Integration Points

#### PDF.js Integration
- Uses bundled PDF.js in `pdfjs/` directory
- Custom build process via `pdfjs/build` script
- Iframe-based integration for sandboxing and compatibility

#### EPUB.js Integration  
- Local fork in `epubjs/epub.js/` with custom modifications
- Direct integration without iframe sandboxing
- Enhanced with custom rendering and annotation capabilities

#### Platform Targets
- **Zotero**: Primary integration as Zotero's document reader
- **Web**: Standalone web application
- **iOS/Android**: Mobile app builds with platform-specific optimizations
- **Development**: Local development with hot reloading

### State Management Pattern
The reader uses a centralized state pattern where:
- Main Reader class holds canonical state
- State changes propagate to all views and UI components
- Debounced state persistence for performance
- Split-view coordination with independent and synchronized state modes

### Build System
- Webpack-based build with multiple configurations for different targets
- Babel compilation with React and TypeScript support
- SCSS processing with PostCSS and autoprefixer
- Asset optimization and bundling for production builds
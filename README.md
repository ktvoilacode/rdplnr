# RRD Planers - Plot Map Generator

A web-based A4 registration map generation system that produces AutoCAD-style accurate plot drawings with correct calculations, alignment, scaling, and editable text.

## Features

- **SVG-based rendering** with vector PDF export (selectable/searchable text)
- **Origin-based coordinate system** — bottom-left origin (0,0) for accurate geometry
- **Rectangle & Trapezoid support** — auto-detects shape based on dimensions
- **Auto-scaling** — uniform scale with no distortion, fits within A4 layout
- **Proper dimension engine** — extension lines, arrows, midpoint-based text placement
- **A4 layout template** — Header (title, vendor, vendees), Drawing zone, Footer (area, witnesses, references)
- **Boundary labels** — North, South, East, West with multiline wrap support
- **Road direction indicator** — configurable for any side
- **Area calculations** — sq.ft, sq.yards, sq.meters with proper trapezoid formula
- **Interior details** — Room, open area, building type, plinth area
- **Session management** — Save, load, and manage multiple plots with timestamps
- **Double-click/tap editing** — Click any text on the SVG to jump to its input field
- **Pinch-to-zoom** on mobile preview
- **Mobile responsive** — Bottom tab bar with Controls/Preview/Save/PDF tabs
- **Print-ready PDF** — via jsPDF + svg2pdf.js

## Tech Stack

- Pure HTML, CSS, JavaScript (no frameworks)
- SVG for rendering with 4 layer groups: border, plot, dimensions, text
- jsPDF + svg2pdf.js for vector PDF export
- localStorage for session persistence and auth
- Deployable via cPanel or any static hosting

## Pages

- `login.html` — Authentication page
- `plot-generator.html` — Main plot map generator

## Getting Started

1. Open `login.html` in a browser or deploy to any static hosting
2. Login and start creating plot maps
3. Fill in dimensions, boundary details, and text fields
4. Changes render live on the SVG preview
5. Save plots for later or download as PDF

## License

Private project for RRD Planers.

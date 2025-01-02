# Mapa náboženství v Česku (Religion Map of the Czech Republic)

An interactive visualization of religious demographics in the Czech Republic, based on the 2021 census data. The project displays a map of Czech regions with color-coded religious affiliation data, allowing users to explore different religious groups across the country.

## Features

- Interactive map visualization using D3.js
- Region-by-region religious demographic data
- Hover tooltips showing detailed statistics
- Filtering options for different religious denominations
- Color scale indicating religious affiliation percentages

## Technology Stack

- Svelte
- Vite
- D3.js
- TopoJSON

## Getting Started

### Prerequisites

Make sure you have Node.js installed on your system.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/[username]/nabozenstvi-v-cesku-mapa.git
cd nabozenstvi-v-cesku-mapa
```

2. Install dependencies:
```bash
npm install
```

### Running the Project

To run the project in development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create a production build:
```bash
npm run build
```

To preview the production build:
```bash
npm run preview
```

## Data Source

The visualization uses data from the 2021 Czech Census (Sčítání lidu 2021).

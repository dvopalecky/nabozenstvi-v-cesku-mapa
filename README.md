# Religion in Czechia

Interactive visualization of religious demographics in Czechia based on 2021 census data.

[View the app](https://dvopalecky.github.io/nabozenstvi-v-cesku-mapa/)

## Features

Two interactive views:

### Municipality Map
- Shows religious affiliation across Czech municipalities
- Circle size indicates population
- Color indicates % of selected religious groups
- Configurable filters for religions and percentage thresholds
- Click circles to see detailed stats

### Age Demographics
- Population pyramid showing religious affiliation by age and gender
- Toggle between absolute numbers and percentages
- Configurable selection of religious groups to display

## Technical Details

- Built with vanilla JavaScript and HTML (no framework)
- Biggest challenge was to clean the data for GPS coordinates of all municipalities (I used municipalities data from https://github.com/cesko-digital/obce)
- Uses Leaflet.js for map visualization
- Code largely AI-generated as an experiment, so structure is basic
- Data from Czech Statistical Office 2021 census

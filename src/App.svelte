<script>
  import Checkboxes from './Checkboxes.svelte';
  let checkedChurches = [];

import * as d3 from 'd3';
import * as topojson from "topojson-client";
let data;

async function processCensusData () {
  const response = await fetch('census-2021.json');
  const data = await response.json();
  return data;
}

async function init() {
  data = await processCensusData();
  main();
}

init();

async function main () {

  const obyvatelstvoCelkem = data[0];
  const dataSmall = data[12];

  // Define the projection and path
  const projection = d3.geoMercator()
    .center([15.3, 49.8])
    .scale(7000)
    .translate([480, 300]);

  const path = d3.geoPath()
    .projection(projection);

  // Define the color scale for the choropleth map
  const colorScale = d3.scaleSequential()
    .domain([0, 1]) // Random number range
    .interpolator(d3.interpolateBlues);

  // Select the SVG element
  const svg = d3.select('svg');

  // Load the TopoJSON data
  d3.json('kraje.json').then(topology => {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(topology, topology.objects.kraje);

    geojson.features.forEach(feature => {
      const regionName = mapRegionIdToName(feature.properties.id);
      feature.properties.value = Number(dataSmall[regionName]);
      feature.properties.percentage = Number(dataSmall[regionName]) / Number(obyvatelstvoCelkem[regionName]) * 100;
      console.log(feature.properties);
    });

    const scale = 5;
    svg.selectAll('path')
      .data(geojson.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => colorScale(d.properties.percentage * scale))
      .on('mouseover', (event, d) => {
        // Show the tooltip and set its content
        d3.select('#tooltip')
          .style('display', 'block')
          .html(`
                  Kraj: ${d.properties.NAZ_CZNUTS3.replace(' kraj', '')}<br>
                  Počet: ${d.properties.value.toFixed(2)}<br>
                  Procent: ${d.properties.percentage.toFixed(2)}%`);

        // Highlight the region
        const currentColor = d3.color(colorScale(d.properties.percentage * scale));
        currentColor.opacity = 0.7;
        d3.select(event.currentTarget).attr('fill', currentColor);
      })
      .on('mousemove', event => {
        // Update the tooltip position
        d3.select('#tooltip')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 25) + 'px');
      })
      .on('mouseout', (event, d) => {
        // Hide the tooltip
        d3.select('#tooltip').style('display', 'none');

        // Reset the region color
        d3.select(event.currentTarget).attr('fill', () => colorScale(d.properties.percentage * scale));
      });
  });
}

function mapRegionIdToName (id) {
  const map = {
    'CZ020': 'Středočeský',
    'CZ031': 'Jihočeský',
    'CZ032': 'Plzeňský',
    'CZ041': 'Karlovarský',
    'CZ042': 'Ústecký',
    'CZ051': 'Liberecký',
    'CZ052': 'Královéhradecký',
    'CZ053': 'Pardubický',
    'CZ063': 'Vysočina',
    'CZ064': 'Jihomoravský',
    'CZ071': 'Olomoucký',
    'CZ072': 'Zlínský',
    'CZ080': 'Moravskoslezský',
    'CZ010': 'Hlavní město Praha',
  };
  return map[id];
}

</script>


<main>
  <h2>Náboženství v Česku</h2>

  <svg width="960" height="600"></svg>
  <div style="text-align:left">
    {#if data}
      <Checkboxes labels={data.map(r => r.Field)} bind:value={checkedChurches}/>
      {#each data as row, id}
      {/each}
    {/if}
  </div>
  <div id="tooltip" style="position: absolute; display: none; background-color: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 5px; pointer-events: none;"></div>
</main>

<style>
  body {
      font-family: Arial, sans-serif;
      margin: 2rem;
  }

  #checkbox-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
  }

  input[type="checkbox"] {
      margin-right: 0.5rem;
  }

  #submit-button {
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.25rem;
      background-color: #007bff;
      color: white;
      cursor: pointer;
      margin-top: 1rem;
  }

  #submit-button:hover {
      background-color: #0056b3;
  }
</style>

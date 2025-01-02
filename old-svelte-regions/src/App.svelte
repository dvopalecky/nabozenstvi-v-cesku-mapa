<script>
  import Checkboxes from './Checkboxes.svelte';
  import * as d3 from 'd3';
  import * as topojson from "topojson-client";
  import {onMount} from 'svelte';
  import censusData from './census-2021.json';
  import kraje from './kraje.json';

let checkedChurches = ["Českobratrská církev evangelická","protestantská/evangelická víra (protestant, evangelík)","Církev bratrská","Slezská církev evangelická augsburského vyznání","Apoštolská církev","Bratrská jednota baptistů","Církev Křesťanská společenství","Jednota bratrská","Křesťanské sbory","Evangelická církev metodistická","Církev víry","Církev Slovo života","Církev živého Boha","Církev Nová naděje","Církev Oáza"];
let obyvatelstvoCelkem = censusData[0];
let ceskoCount = '';
let svg, path, colorScale;
let max = 0;
let isMounted;

function drawMap(geojson) {
  max = d3.max(geojson.features, d => d.properties.percentage);
  const median = d3.median(geojson.features, d => d.properties.percentage);
  const scale = 1; //max / median / 2;
  colorScale = d3.scaleSequential()
    .domain([0, max])
    .interpolator(d3.interpolateGreens);

    svg.selectAll("path").remove();
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
            Počet: ${d.properties.value.toFixed(0)}<br>
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
}

async function main (checkedChurches) {
  let dataFiltered = censusData.filter(r => checkedChurches.includes(r.Field));
  const sums = {};
  dataFiltered.forEach(row => {
    Object.keys(row).forEach(key => {
      if (key === 'Field') return;
      let number = Number(row[key]);
      if (number === undefined || Number.isNaN(number)) number = 0;
      sums[key] = (sums[key] || 0) + number;
    });
  });

  ceskoCount = `${sums['Česká republika']} ` +
    `(${(sums['Česká republika'] / Number(obyvatelstvoCelkem['Česká republika']) * 100).toFixed(2)}%)`

  // Convert TopoJSON to GeoJSON
  const geojson = topojson.feature(kraje, kraje.objects.kraje);

  geojson.features.forEach(feature => {
    const regionName = mapRegionIdToName(feature.properties.id);
    feature.properties.value = sums[regionName]
    feature.properties.percentage = sums[regionName] / Number(obyvatelstvoCelkem[regionName]) * 100;
  });

  drawMap(geojson);
}


$: if (checkedChurches && isMounted) main(checkedChurches);

onMount(async () => {
  // Define the projection and path
  const projection = d3.geoMercator()
    .center([15.3, 49.8])
    .scale(7000)
    .translate([480, 300]);

  path = d3.geoPath()
    .projection(projection);

  // Select the SVG element
  svg = d3.select('svg');
  isMounted = true;
});


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
  <p>data ze sčítání lidu 2021</p>
  <div id="color-scale-legend">
    {#each [0, 1, 2, 3, 4] as step, idx}
      <div style="display: inline-block; width: 20px; height: 20px; background-color: {colorScale ? colorScale((step / 5 + 0.1) * max) : 'white'};"></div>
      <span style="padding-right:10px"> {(step / 5 * max).toFixed(1)} - {((step / 5 + 0.2) * max).toFixed(1)}%</span>
    {/each}
  </div>
  <p>Celé Česko: {ceskoCount} (pro zaškrnuté náboženství / církve)</p>
  <svg width="960" height="600"></svg>
  <div style="text-align:left">
    {#if censusData}
      <Checkboxes labels={censusData.map(r => r.Field).slice(3)} counts={censusData.map(r => r['Česká republika']).slice(3)} bind:value={checkedChurches}/>
      {#each censusData as row, id}
      {/each}
    {/if}
  </div>
  <div id="tooltip" style="position: absolute; display: none; background-color: rgba(0, 0, 0, 0.7); padding: 5px; border-radius: 5px; pointer-events: none;"></div>
</main>

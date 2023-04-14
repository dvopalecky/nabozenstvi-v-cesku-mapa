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

  // Generate random numbers for each region
  geojson.features.forEach(feature => {
    feature.properties.randomValue = Math.random();
    console.log(feature);
  });

  // Calculate the total sum of random values for all regions
  const totalSum = geojson.features.reduce((sum, feature) => sum + feature.properties.randomValue, 0);

  svg.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => colorScale(d.properties.randomValue))
    .on('mouseover', (event, d) => {
      // Show the tooltip and set its content
      const percentage = (d.properties.randomValue / totalSum) * 100;
      d3.select('#tooltip')
        .style('display', 'block')
        .html(`
                  Kraj: ${d.properties.NAZ_CZNUTS3.replace(' kraj', '')}<br>
                  Number: ${d.properties.randomValue.toFixed(2)}<br>
                  Percentage: ${percentage.toFixed(2)}%`);

      // Highlight the region
      const currentColor = d3.color(colorScale(d.properties.randomValue));
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
      d3.select(event.currentTarget).attr('fill', () => colorScale(d.properties.randomValue));
    });
});

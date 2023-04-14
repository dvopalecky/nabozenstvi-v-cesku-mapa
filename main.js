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
const svg = d3.select("svg");

// Load the TopoJSON data
d3.json("kraje.json").then(topology => {
    // Convert TopoJSON to GeoJSON
    const geojson = topojson.feature(topology, topology.objects.kraje);

    // Generate random numbers for each region
    geojson.features.forEach(feature => {
        feature.properties.randomValue = Math.random();
        console.log(feature);
    });

    // Bind the GeoJSON data and create the map
    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", d => colorScale(d.properties.randomValue));
});

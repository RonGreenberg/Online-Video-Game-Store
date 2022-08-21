var width = 450
    height = 450
    margin = 40


var radius = Math.min(width, height) / 2 - margin

var svg = d3.select("#chart_d3")
  .append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// set some data
var data = {mobile: 4, xbox: 2, playstation:20, pc:10}

// set the color scale
var color = d3.scaleOrdinal()
  .domain(data)
  .range(d3.schemeSet2);

// Compute the position of each group on the pie
var pie = d3.pie()
  .value(function(d) {return d.value; })
var data_ready = pie(d3.entries(data))

// shape helper to build arcs
var arcGenerator = d3.arc()
  .innerRadius(0)
  .outerRadius(radius)

// Build the pie chart
svg
  .selectAll('Slices')
  .data(data_ready)
  .enter()
  .append('path')
    .attr('d', arcGenerator)
    .attr('fill', function(d){ return(color(d.data.key)) })
    .attr("stroke", "black")
    .style("stroke-width", "2px")
    .style("opacity", 0.7)

// Now add the annotation. Use the centroid method to get the best coordinates
svg
  .selectAll('Slices')
  .data(data_ready)
  .enter()
  .append('text')
  .text(function(d){ return d.data.key})
  .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
  .style("text-anchor", "middle")
  .style("font-size", 17)

var width = 400, 
    height = 400,
    margin = 70;

var radius = Math.min(width, height) / 2 - margin;

var svg = d3.select("#piechart").append("svg").attr("width", width).attr("height", height)
            .append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// fetch data from the server
$.get('statistics?data=gamesByPlatform', function(data, status) {
    // set the color scale
    var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet2);

    // Compute the position of each group on the pie
    var pie = d3.pie().value(function(d) {return d.value; });
    var data_ready = pie(d3.entries(data));

    // summing up the total number of games, to calculate percentage
    var total = d3.sum(data_ready, function(d) {
        return d.value;
    });

    // calculating percentage for each slice
    data_ready.forEach(function(d) {
        d.percentage = d.value / total * 100;
        d.percentage = d.percentage.toFixed(2); // toFixed returns a representation that has exactly 2 digits after the decimal point
    });

    // shape helper to build arcs
    var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

    // Build the pie chart
    svg.selectAll('Slices').data(data_ready).enter().append('path')
        .attr('d', arcGenerator).attr('fill', function(d){ return(color(d.data.key)) }).attr("stroke", "black")
        .style("stroke-width", "2px").style("opacity", 0.7);

    // Now add the annotation. Use the centroid method to get the best coordinates
    svg.selectAll('Slices').data(data_ready).enter().append('text').text(function(d){ return d.percentage + '%' })
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle").style("font-size", 14);

    // Initialize legend
    var legendItemSize = 12;
    var legendSpacing = 10;
    var xOffset = 20;
    var yOffset = 120;
    var legend = d3.select('#legend').append('svg').attr("width", width).attr("height", height)
                    .selectAll('.legendItem').data(data_ready);

    // Create legend items
    legend.enter().append('rect').attr('class', 'legendItem').attr('width', legendItemSize).attr('height', legendItemSize)
            .style('fill', function(d){ return(color(d.data.key)) })
            .attr('transform', (d, i) => {
                var x = xOffset;
                var y = yOffset + (legendItemSize + legendSpacing) * i;
                return `translate(${x}, ${y})`;
            });

    // Create legend labels
    legend.enter().append('text').attr('x', xOffset + legendItemSize + 5).attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
        .text(d => d.data.key);  
});

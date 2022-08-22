// this function creates the pie chart of games distribution by platform
function piechart() {
    // piechart dimensions
    var width = 400, 
        height = 400,
        margin = 70;

    // calculating piechart radius
    var radius = Math.min(width, height) / 2 - margin;

    // adding an svg element inside the piechart div, with the width and height we assigned
    var svg = d3.select("#piechart").append("svg").attr("width", width).attr("height", height)
                .append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
    // adding a title to the piechart
    svg.append("text").attr("x", width / 2 - 180).attr("y", -170).attr("text-anchor", "middle")
        .style("font-size", "18pt")
        .style("font-weight", "bold")  
        .text("Games Distribution by Platform");

    // fetch data from the server
    $.get('statistics?data=gamesByPlatform', function(data, status) {
        // set the color scale
        var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet2); // color is a function

        // compute the position of each group on the pie
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

        // build the pie chart
        svg.selectAll('Slices').data(data_ready).enter().append('path')
            .attr('d', arcGenerator).attr('fill', function(d){ return(color(d.data.key)) }).attr("stroke", "black")
            .style("stroke-width", "2px").style("opacity", 0.7);

        // adding percentage on each slice. Using the centroid method to get the best coordinates
        svg.selectAll('Slices').data(data_ready).enter().append('text').text(function(d){ return d.percentage + '%' })
            .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
            .style("text-anchor", "middle").style("font-size", 14);

        // initialize legend
        var legendItemSize = 12;
        var legendSpacing = 10;
        var xOffset = 20;
        var yOffset = 120;
        var legend = d3.select('#legend').append('svg').attr("width", width).attr("height", height)
                        .selectAll('.legendItem').data(data_ready);

        // create legend items
        legend.enter().append('rect').attr('class', 'legendItem').attr('width', legendItemSize).attr('height', legendItemSize)
                .style('fill', function(d){ return(color(d.data.key)) }) // filling each legend with the respective color for the slice it represents
                .attr('transform', (d, i) => {
                    var x = xOffset;
                    var y = yOffset + (legendItemSize + legendSpacing) * i;
                    return `translate(${x}, ${y})`;
                });

        // create legend labels
        legend.enter().append('text').attr('x', xOffset + legendItemSize + 5).attr('y', (d, i) => yOffset + (legendItemSize + legendSpacing) * i + 12)
            .text(d => d.data.key);
    });
}

// this function creates the line chart of customers growth over time
function linechart() {
    // adding an svg element inside the linechart div, with the width and height we assigned
    var svg = d3.select("#linechart").append("svg").attr("width", 700).attr("height", 450),
        margin = {top: 70, right: 90, bottom: 80, left: 70},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
    var x = d3.scalePoint().rangeRound([0, width]).padding(0.1), // we should use d3.scalePoint() to have the chart points aligned with x-axis ticks
        y = d3.scaleLinear().rangeRound([height, 0]);
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // adding a title to the linechart
    svg.append("text").attr("x", width / 2 + 50).attr("y", 30).attr("text-anchor", "middle")
        .style("font-size", "18pt")
        .style("font-weight", "bold")  
        .text("Customers Growth Over Time");

    // generating a map for the number of customers up to each month in the past 2 years (e.g. [{"2022-02-01" => 15}, {"2022-01-01" => 14}, ...])
    var months = new Map();
    var date = new Date(); // today's date
    date.setDate(1); // taking the first day of the month
    for (var i = 0; i < 24; i++) {
        months.set(new Date(date).toISOString().split('T')[0], 0); // adding a date string in yyyy-mm-dd format, with initial count of 0
        date.setMonth(date.getMonth() - 1); // subtracting one month each time
    }

    // fetch data from the server
    $.get('read?collection=customers', function(data, status) {
        var dats = []; // this array will contain key-value pairs, e.g. [{date: '2021-02', value: 1}, {date: '2021-03', value: 3}, ...]

        // iterating on all customers
        data.forEach(function(d) {
            // iterating on the yyyy-mm-dd date strings stored in the months map
            for (var key of months.keys()) {
                // incrementing the count of all the months that the current customer registration date is earlier than
                if (new Date(d.registrationDate) <= new Date(key)) {
                    months.set(key, months.get(key) + 1);
                }
            }
        });

        // now that the months map is ready, we can store it in the required format in the dats array
        for(var key of months.keys()){
            // using unshift() to insert at the beginning of the array, so that the months are in ascending order (we originally inserted them in reverse)
            dats.unshift({date : key.substring(0, key.length - 3), value : months.get(key)}); // cutting off the day, leaving only the month and the year
        }

        // defining the line
        var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.value); })
    
        // defining the domains of each axis
        x.domain(dats.map(function(d) { return d.date; }));
        y.domain([0, d3.max(dats, function(d) { return d.value; })]);

        // adding the x-axis
        g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text") // selecting all texts shown next to the ticks (months)
            .attr('dx', '-40px') // setting text position relative to the x-axis
            .attr('dy', '2px') // setting text position relative to the y-axis
            .attr("transform", "rotate(-65)") // rotating the text
            .style("font-size", "10pt");
        // adding x-axis label
        svg.append("text")
            .attr("class", "axis axis--x")
            .attr("y", height + 78)
            .attr("x", width*1.26)
            .attr("text-anchor", "end")
            .style("font-weight", "bold")
            .text("Month");

        // adding the y-axis
        g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "11pt");
        // adding y-axis label
        svg.append("text")
            .attr("class", "axis axis--y")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "20px")
            .attr("dx", "-140px")
            .attr("text-anchor", "end")
            .style("font-weight", "bold")
            .text("No. of Customers");

        // drawing the line
        g.append("path")
            .datum(dats)
            .attr("class", "line")
            .attr("d", line);

        // drawing the points on the line
        g.selectAll("circle")
            .data(dats)
            .enter().append("circle")
            .attr("class", "circle")
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.value); })
            .attr("r", 4);
    });
}

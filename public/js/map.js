function loadMap(data) {
    // initializing the map with a specific center and zoom level in which all our locations will fit...
    var map = L.map('map').setView([31.983909, 34.795418], 13);

    // creating a OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    // iterating over the rows (of developers) to create markers with popups
    for (var row of data) {
        var marker = L.marker([row["latitude"], row["longitude"]]).addTo(map); // adding a new marker with the coordinates read from the row
        // binding a popup to each marker, containing the image of the developer, name and email (and also hiding close button of the popup)
        marker.bindPopup("<img src='" + row["image"] + "' width='100'><br>" + "<b>" + row["name"] + "</b><br>" + row["email"], { closeButton: false });
        attachMarkerEvents(marker); // calling a function so that the event handlers won't share the same marker variable (https://stackoverflow.com/a/6487376)
    }
}

function attachMarkerEvents(marker) {
    // In the default behavior we need to click the marker to open/close the popup. We want it to open/close just by hovering.
    marker.on('mouseover', function() {
        marker.openPopup();
    });
    marker.on('mouseout', function() {
        marker.closePopup();
    });
}

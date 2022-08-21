/* This function converts a given number of seconds to a string containing how many days, hours, minutes and seconds they add up to.
 * Used to convert server uptime which is returned in seconds.
 */
function convertToDDHHMMSS(seconds) {
    var mins = seconds / 60;
    var hours = mins / 60;
    var days = hours / 24;
       
    mins = Math.floor(mins);
    hours = Math.floor(hours);
    days = Math.floor(days);
    
    hours = hours % 24;
    mins = mins % 60;
    seconds = seconds % 60;
      
    return days + "d-" + hours + "h-" + mins + "m-" + seconds + "s";
}

var socket = io(); // connecting to the socket.io server

// whenever we receive a refresh_page notification, we reload the current page (equivalent to clicking Refresh in the browser)
socket.on('refresh_page', function() {
    window.location.reload();
});

// whenever we receive a update_info notification, we update the server info in its dedicated HTML element
socket.on('update_info', function(info) {
    var uptime = convertToDDHHMMSS(info.uptime); // converting uptime
    $("#serverInfo").html("<b>OS:</b> " + info.osType + "&emsp;<b>CPU:</b> " + info.cpu + "&emsp;<b>Uptime:</b> " 
        + uptime + "&emsp;<b>Clients:</b> " + info.clientsCount); // &emsp; means four spaces gap
});

// defining an event handler for the built-in onhashchange event
window.onhashchange = function() {
    selectPage(window.location.hash);
}

function selectPage(hashKey) {
    // redirecting to dashboard page if no page was specified in the URL
    if (hashKey == '') {
        window.location.hash = "dashboard"; // invokes the onhashchange handler, which calls selectPage again
        return; // happens immediately, without waiting for the hashchange handler to finish
    }

    // hiding all page divs, except for the newly selected one
    var pages = document.querySelectorAll(".page");
    for (var i = 0; i < pages.length; i++) {
        pages[i].style.display = 'none';
        if (pages[i].id == hashKey.substring(1)) { // comparing the page id to the given hash, trimming the #
            pages[i].style.display = 'block';
        }
    }

    // removing highlight from all sidebar buttons, but highlighting the one that was just clicked
    var sidebarBtns = document.querySelectorAll(".sidebar ul li");
    for (var i = 0; i < sidebarBtns.length; i++) {
        sidebarBtns[i].removeAttribute("class");
        if (sidebarBtns[i].querySelector("a").href.endsWith(hashKey)) { // e.g. http://localhost:8080/#home ends with #home
            sidebarBtns[i].classList.add("active");
        }
    }

    renderPage(hashKey.substring(1));
}

function renderPage(page) {
    // calling the appropriate rendering function for the page itself
    switch (page) {
        case "about":
            renderAbout();
            break;
        case "customers":
            renderCustomers();
            break;
        case "games":
            renderGames();
            break;
        case "orders":
            renderOrders();
            break;
    }
}

function renderAbout() {
    // filling the table with the contents of the developers collection and loading the map
    if ($("#about tbody").html() == "") { // so that we load the whole About page only once
        readAndFillTable($("#about"), "developers", false, false, ["latitude", "longitude", "image"], function(data) {
            loadMap(data); // passing the data (which contains the coordinates and details to show in popups) to the loadMap function
        });
    }
}

function renderCustomers() {
    // filling the page with the contents of the customers collection
    readAndFillTable($("#customers"), "customers", undefined, undefined, [], function(){

        $("#customers").find("table tbody tr").each(function(){
            //finding the game
            // var tr = $(this);
            // $("#orders").find("table tbody tr").each(function(i) {
            //     if((i%2==0) && ($(this).find("td[data-colname='customerID']") == tr.find("td[data-colname='customerID']"))){
            //         var rg = $("#orders").find("table tbody tr").eq(i+1).find('h5').innerHTML.split.pop;
            //     }
            // });


            html = '<td data-colname="recommendedGame">';
            html += 'rg';//change to a real recommended game
            html += '</td>';
            //$(this).find('td')[3].after(html);
            $(this).find('td').last().before(html)
            //$(this).find("td[data-colname='email']").after(html);
        });

    });
}

function convertISODateElements(dates) {
    for (var i = 0; i < dates.length; i++) {
        dates[i].innerHTML = dates[i].innerHTML.split('T')[0]; // taking only the yyyy-mm-dd from the full ISO format, which can then be easily copied to date input field
    }
}

function renderGames() {
    /* filling the page with the contents of the games collection, followed by additional processing (if we would not use a callback function and
       written the logic after the call to readAndFillTable, it would not work because the AJAX GET request is asynchronous, so by the time we finish
       the call to readAndFillTable, the table would not be fully loaded yet. So we have to supply a callback that gets called at the end of the callback
       of the AJAX request, when the table is fully loaded). Note that we also exclude the image and trailer fields from the readAndFillTable logic,
       since we take care of them separately as part of the callback.
     */
    readAndFillTable($("#games"), "games", undefined, undefined, ["image", "trailer"], function(data) {
        var releaseDates = $("#games").find("table td[data-colname='releaseDate']"); // finding the relevant table cells, identified by the colname
        convertISODateElements(releaseDates);
        
        // iterating over the table rows, and adding a cell with the respective game image at the beginning of each row
        $("#games").find("table tbody tr").each(function(index) {
            // a script that runs in case there was an error loading the image from the server (either the file doesn't exist or no image was assigned to this game), and loads a default image instead
            var onerror = 'this.src = "public/assets/games_media/images/No_Image_Available.jpg"';
            // using position: relative so that the play button can be placed exactly over the image later
            $(this).prepend("<td style='position: relative;'><img src='" + data[index]["image"] + "' onerror='" + onerror + "' width='150' height='150'></td>"); // taking the image source path from the data returned from MongoDB
        });

        // adding a play button on top of each image
        $("#games").find("table tbody td img").each(function(index) {
            // storing the path to the trailer video as a data attribute of the play button in current row
            $(this).after("<button class='btn-play' data-src='" + data[index]["trailer"] + "'></button>");
        });
    });
}

function renderOrders() {
    readAndFillTable($("#orders"), "orders", undefined, undefined, ["games"], function(data) {
        /* Selecting the currently existing table rows, and adding rows after each one of them, which can be
         * expanded from the original rows. The selection of $("#orders").find("table tbody tr") happens only once,
         * so the tr elements that are added during the each() loop won't be included in the iteration and the
         * references of the original rows will be maintained.
         */
        $("#orders").find("table tbody tr").each(function(i) {
            var html = '';
            html += '<tr><td colspan="6"><h4>Games:</h4><ul>';
            for (var j = 0; j < data[i]['games'].length; j++) {
                html += '<li><h5>Game ID: ' + (data[i]['games'])[j]['gameID'] + '</h5> Units: ' + (data[i]['games'])[j]['numberOfUnits']+ '</li>';
            }
            html += "</ul></td></tr>"; // closing the games row
            $(this).after(html); // appending the new html
        });
        
        // converting order dates to simple dates
        var orderDates = $("#orders").find("table td[data-colname='orderDate']");
        convertISODateElements(orderDates);

        $('.table-expandable').each(function() {
            var table = $(this);
            table.children('tbody').children('tr').filter(':odd').hide(); // hiding the odd rows (those that contain the game details)
            table.children('tbody').children('tr').filter(':even').on("click", function(event) {
                // expanding the row only if a table cell itself was clicked, otherwise it would also expand when clicking on edit/delete
                if ($(event.target).is('td')) {
                    var element = $(this);
                    element.next('tr').toggle('fast');
                    element.find(".table-expandable-arrow").toggleClass("up");
                }
            });
            table.children('tbody').children('tr').filter(':even').each(function () {
                var element = $(this);
                element.append('<td><div class="table-expandable-arrow"></div></td>');
            });
        });
    });
}

/* Providing optional parameters indicating whether to include edit/delete buttons in the generated table, as well as an optional array of fields to
 * exclude from the resulting table, and an optional callback function to be called when the table has finished loading, for further processing.
 */
function readAndFillTable(page, collection, withEditBtn = true, withDeleteBtn = true, excludedFields = [], callback) {
    // sending an HTTP GET request to the appropriate route in the server
    $.get('read?collection=' + collection, function(data, status) {
        // constructing the html with the contents we received from the server, shown as a table
        var html = '';
        for (var i = 0; i < data.length; i++) {
            html += "<tr>";
            for (var field in data[i]) {
                // we don't want to display a column for the _id auto-generated by MongoDB (but we do need it for editing and deleting)
                if (field != '_id') {
                    // skipping the field if it's in the array of excluded fields
                    if (!excludedFields.includes(field)) {
                        /* Every element in HTML can have a data-* attribute, that we can use to store some information. In order to access it from a script
                         * later, we can use the "dataset" property. In this case we want to store the name of the column each td belongs to, because
                         * for editing a record, we need to take the data from the row in the table and paste it in the input fields, so that they can be
                         * edited. In order to know which input element belongs to which cell, we can store the column name in each td and compare it
                         * to the id of the <input>.
                         */
                        html += '<td data-colname="' + field + '">' + data[i][field] + "</td>";
                    }
                }
            }

            // in each row, adding the action buttons (edit/delete) that were requested

            var actionBtns = '';
            if (withEditBtn) {
                // storing the _id from MongoDB as an attribute of the button, so that we can send it to MongoDB to update this specific row
                actionBtns += '<button type="button" class="btn-action btn-edit" data-id="' + data[i]["_id"] + '">Edit</button>';
            }
            if (withDeleteBtn) {
                // storing the _id from MongoDB as an attribute of the button, so that we can send it to MongoDB to delete this specific row
                actionBtns += '<button type="button" class="btn-action btn-delete" data-id="' + data[i]["_id"] + '">Delete</button>';
            }
            if (actionBtns != '') { // adding the buttons to the html we will append, only if they were actually requested. They will be located in the same table cell
                html += '<td>' + actionBtns + '</td>';
            }
            html += "</tr>"; // closing the current row
        }

        // we also need to append a header in the table for the buttons, if they exist
        if (withEditBtn || withDeleteBtn) {
            // appending the header only if it isn't already there
            if (page.find(".action-header").length == 0) { // searching among page's children
                page.find("table thead tr").append('<th class="action-header">Action</th>'); // giving the header a class that we can use in the above if statement to check if it exists
            }
        }

        page.find("table tbody").empty(); // removing previous contents of the table body if there were any (if we visited this page earlier)
        page.find("table tbody").append(html); // appending the new html

        // calling the callback function, if one was supplied
        if (callback) {
            // passing the data we received from MongoDB (for special fields that were excluded here and need to be treated separately, such as image)
            callback(data);
        }
    });   
}

// var today = new Date();
// var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
// $("#orderDate").setAttribute("value", date);
// $("#orderDate").setAttribute("max", date);


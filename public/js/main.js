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

    // calling the appropriate rendering function for the page itself
    switch (hashKey) {
        case "#about":
            renderAbout();
            break;
        case "#customers":
            renderCustomers();
            break;
        case "#games":
            renderGames();
            break;
        case "#orders":
            renderOrders();
            break;
    }
}
function readAndFillOrderGames(){
    var html = '';
    html += '<tr><td colspan="5"><h4>Games: </h4>';
    
}
function renderAbout() {
    // filling the page with the contents of the developers collection (eventually, would become a map with markers)
    readAndFillTable($("#about"), "developers", false, false);
}

function renderCustomers() {
    // filling the page with the contents of the customers collection
    readAndFillTable($("#customers"), "customers");
}

function renderGames() {
    /* filling the page with the contents of the games collection, followed by additional processing (if we would not use a callback function and
       written the logic after the call to readAndFillTable, it would not work because the AJAX GET request is asynchronous, so by the time we finish
       the call to readAndFillTable, the table would not be fully loaded yet. So we have to supply a callback that gets called at the end of the callback
       of the AJAX request, when the table is fully loaded). Note that we also exclude the image field from the readAndFillTable logic, since we take
       care of it separately as part of the callback.
     */
    readAndFillTable($("#games"), "games", undefined, undefined, ["image"], function(data) {
        // changing the release dates from ISODate format (as stored in MongoDB) to simple day-month-year format
        var releaseDates = $("#games").find("table td[data-colname='releaseDate']"); // finding the relevant table cells, identified by the colname
        for (var i = 0; i < releaseDates.length; i++) {
            releaseDates[i].innerHTML = new Date(releaseDates[i].innerHTML).toLocaleDateString("he-IL");
        }

        // formatting prices with dollar sign
        var unitPrices = $("#games").find("table td[data-colname='unitPrice']");
        for (var i = 0; i < unitPrices.length; i++) {
            unitPrices[i].innerHTML = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(unitPrices[i].innerHTML);
        }
        
        // iterating over the table rows, and adding a cell with the respective game image at the beginning of each row
        $("#games").find("table tbody tr").each(function(index) {
            $(this).prepend("<td><img src='" + data[index]["image"] + "' width='150' height='150'></td>"); // taking the image source path from the data returned from MongoDB
        });
    });
}
function renderOrders(){
    // $('.table-expandable').each(function () {
    //     var table = $(this);
    //     table.children('thead').children('tr').append('<th></th>');
    //     table.children('tbody').children('tr').filter(':odd').hide();
    //     table.children('tbody').children('tr').filter(':even').click(function () {
    //         var element = $(this);
    //         element.next('tr').toggle('fast');
    //         element.find(".table-expandable-arrow").toggleClass("up");
    //     });
    //     table.children('tbody').children('tr').filter(':even').each(function () {
    //         var element = $(this);
    //         element.append('<td><div class="table-expandable-arrow"></div></td>');
    //     });
    // });
    
    readAndFillTable($("#orders"), "orders", false, false, ["games"], function (data) {
        for (var i = 0; i < data.length; i++) {
            var html = '';
            html += '<td colspan="5"><h4>Games:</h4><ul>';
            //html += '<td data-colname="' + field + '">' + data[i][field] + "</td>";
            for (var j = 0; j < data[i]['games'].length; j++){
                html += '<li><h5>Game ID: '+ (data[i]['games'])[j]['gameID'] + '</h5> Number of units: '+ (data[i]['games'])[j]['numberOfUnits']+ '</li>';//j instead of 0
            }
            html += "</ul></td>"; // closing the games row
            
            $("#orders").find("table tbody #tr"+ i).append(html); // appending the new html
        }
        // changing the release dates from ISODate format (as stored in MongoDB) to simple day-month-year format
        var releaseDates = $("#orders").find("table td[data-colname='orderDate']"); // finding the relevant table cells, identified by the colname
        for (var i = 0; i < releaseDates.length; i++) {
            releaseDates[i].innerHTML = new Date(releaseDates[i].innerHTML).toLocaleDateString("he-IL");
        }

        $('.table-expandable').each(function () {
            var table = $(this);
            //table.children('thead').children('tr').append('<th></th>');
            table.children('tbody').children('tr').filter(':odd').hide();
            table.children('tbody').children('tr').filter(':even').click(function () {
                var element = $(this);
                element.next('tr').toggle('fast');
                element.find(".table-expandable-arrow").toggleClass("up");
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
            if(collection == "orders")
                html += '<tr id="tr'+ i +'"></tr>';

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

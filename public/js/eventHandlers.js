// selecting a page when the document is fully loaded ($(document).ready() is deprecated)
$(function() {
    selectPage(window.location.hash);
});

// event handler for clicking Add New buttons (Add New buttons in all pages should use this class)
$('.btn-add-new').on('click', function() {
    var popup = $(this).closest('.page').find('.popup-overlay'); // finding the popup overlay from the same page where the button was clicked
    $(popup.find('button')[1]).html("Add"); // change the name of the button
    popup.css('display', 'block'); // displaying the popup
    popup.find('form')[0].reset(); // searching the form among the popup element's children, and clearing its input boxes
    popup.find('form input[type="date"]').val(new Date().toISOString().split('T')[0]); // using today's date as default for input fields (must be formatted as yyyy-mm-dd when setting)
    if ($(this).closest('.page').attr('id') == "orders") {
        addNewOrder();
    }
});

// event handler for clicking Search buttons (Search buttons in all pages should use this class)
$('.btn-search').on('click', function() {
    var popup = $(this).closest('.page').find('.popup-overlay'); // finding the popup overlay from the same page where the button was clicked
    $(popup.find('button')[1]).html("Search"); // change the name of the button
    popup.css('display', 'block'); // displaying the popup

    popup.find('form').eq(0).find('.hide-on-search').hide(); // hiding elements that should be hidden when searching (currently image and video upload in Games form)
    popup.find('form')[0].reset();
    /* Since we want to allow filling only some of the fields when searching, we can temporarily turn on the novalidate property of the form
     * so that it doesn't check for required inputs.
     */
    popup.find('form').eq(0).prop('noValidate', true); // just like popup.find('form')[0], only that it remains a jQuery object
});

$('.btn-clear-search').on('click', function() {
    displayTable($(this).closest('.page').find("form")[0]);
});

// event handler for clicking Cancel buttons (Cancel buttons in all pages should use this class)
$('.btn-cancel').on('click', function() {
    var popup = $(this).closest('.page').find('.popup-overlay');
    popup.css('display', 'none'); // hiding the popup
    popup.find('form').eq(0).find('.hide-on-search, .hide-on-edit').show(); // showing elements that may have been hidden by search or edit
    popup.find('form')[0].removeAttribute("data-id"); // removing the data-id attribute in case we cancel an edit (there's no problem to remove it if it doesn't exist)
    popup.find('form')[0].removeAttribute('noValidate'); // removing the noValidate attribute, added in case we have clicked search button
    popup.find('input[class="primary-key"]').prop("disabled", false); // enabling the primary key input field that might have been disabled as a result of editing
});

/* Event handler for clicking an Edit button. Note that we can't use $(".btn-edit").on('click', ...), because it will bind the event only to the
 * matching elements that already exist in the page by now. Since the Edit buttons are created dynamically, this would not work.
 * The same applies for Delete buttons, as you can see below.
 */
$(document).on("click", ".btn-edit", function() {
    var popup = $(this).closest('.page').find('.popup-overlay'); // finding the popup overlay from the same page where the button was clicked
    popup.find('form')[0].reset();
    var row = $(this).parent().siblings('td'); // the button is stored inside a td, so we get to its parent and take its td siblings, which contain the actual data
    for (var i = 0; i < row.length; i++) {
        // searching input fields whose id is equal to the column name we stored in the current td, and setting their text to the text from the td
        popup.find('input[id="' + row[i].dataset.colname + '"]').val(row[i].innerHTML);
        popup.find('select[id="' + row[i].dataset.colname + '"]').val(row[i].innerHTML); // if there's no matching input field, searching for a dropdown field
    }

    // when submitting the form, we also need to send the id of the object to update. So we store it as an attribute of the form just like we did inside the Edit button.
    popup.find('form')[0].setAttribute('data-id', $(this).attr('data-id'));

    $(popup.find('button')[1]).html("Edit"); // change the name of the button
    popup.find('input[class="primary-key"]').prop("disabled", true); // disabling the primary key field, so that the user doesn't modify it when editing
    popup.find('form').eq(0).find('.hide-on-edit').hide(); // hiding elements that should be hidden when editing
    popup.css('display', 'block'); // displaying the popup
});

// event handler for clicking a Delete button
$(document).on("click", ".btn-delete", function() {
    // asking the user with browser's built-in popup. If OK was selected, confirm() returns true
    if (confirm("Are you sure you want to delete this record?")) {
        var page = $(this).closest('.page'); // finding the page that contains this form
        var collection = page.attr('id'); // the id of the page should match the name of the collection in MongoDB (which could make for a nice security vulnerability...)
        
        // sending an HTTP POST request to the appropriate route in the server, putting the object id in the request body
        $.post('delete?collection=' + collection, "id=" + $(this).attr('data-id'), function(data) {
            // if the request is successful, render the updated page
            renderPage(collection);
        });
    }
});

function displayTable(frm)
{
    var tbody = $(frm).closest('.page').find('table tbody')[0]; // gets the table body
    var rows = $(tbody).children('tr'); // direct children only (because in orders form we have hidden tables and rows...)
    for(var i = 0; i < rows.length; i++) // run on the rows
    {
        var row = rows[i];
        if(!($(row).children('td')[0].hasAttribute("colspan"))) // depends on the fact that in Orders table, rows containing game details (which should be hidden) use the colspan attribute
            row.style.display="table-row"; // displaying the row
        else
            row.style.display="none";
    }
}

// event handler for submitting the form to the server (when the submit/confirm button is clicked). Could be a new record or an edited one
$('form').on('submit', function(event) {
    event.preventDefault();

    var page = $(this).closest('.page');
    var collection = page.attr('id');

    /* Enabling the primary key input field that might have been disabled as a result of editing or ADDING NEW in orders, in which case it must not be
     * disabled so that it can be sent to the server.
     */
    page.find('input[class="primary-key"]').prop("disabled", false);

    var textFields = $(this).find('input, select').filter(':visible'); // get all visible input/dropdown elements

    displayTable($(this)); // displaying the entire table by default. in case of a blank search, no rows will be hidden

    if ($(this).find('button')[1].innerHTML == "Search") { // check if this is a search popup                 
        var rows = $(this).closest('.page').find('table tbody tr'); // gets the rows
        for (var i = 0; i < rows.length; i++) {
            var cells = rows.eq(i).find('td[data-colname]'); // selecting only cells that have a data-colname attribute (not image/video for example)
            for (var j = 0; j < cells.length; j++) { // run on the columns
                // the following check will work for dates as well since both the input fields and the table cells now use the yyyy-mm-dd format
                if (textFields.eq(j).val().trim() != "" && cells[j].innerHTML.toLowerCase().indexOf(textFields.eq(j).val().toLowerCase()) <= -1) {
                    rows[i].style.display = "none"; // row disappears if the input is not empty and not equal to the value in the table
                    break;
                }
            }
        }
        $(this).removeAttr('noValidate'); // removing the noValidate attribute, now that the search is finished

        var popup = page.find('.popup-overlay');
        popup.css('display', 'none'); // hiding the popup
    } else { // if its not search popup (it might be create popup or edit popup)
        var route;
        if ($(this).attr("data-id")) { // if the form contains a data-id attribute, it means we got here as a result of editing
            route = 'update?collection=' + collection + "&id=" + $(this).attr("data-id");
        } else { // else, we want to add a new record
            route = 'create?collection=' + collection;
        }
        console.log(new FormData(this));
        // sending an HTTP POST request to the appropriate route in the server
        $.ajax({
            method: "POST",
            url: route,
            data: new FormData(this), // FormData enables sending key-value pairs representing form fields and their values, using the multipart/form-data encoding, which is required for sending <input type="file"> elements
            processData: false, // must be set to false so that the FormData will not be processed and transformed into a query string, which would fail
            contentType: false, // forcing jQuery not to add a Content-Type header to the HTTP request, which would mess up the structure of our multipart/form-data request
            success: function(data) {
                page.find('.popup-overlay').css('display', 'none'); // hiding the popup
                renderPage(collection); // rendering the updated page
            },
            statusCode: { // defining functions to execute when specific status codes are received (the success function executes as usual)
                422: function(response) { // 422 is currently returned in case of a duplicate "primary key"
                    alert(response.responseText); // displaying the error message
                }
            }
        });
    }
    
    page.find('.hide-on-search, .hide-on-edit').show(); // showing elements that may have been hidden by edit or search
    $(this).removeAttr("data-id"); // removing the data-id attribute, as the operation is finished
});

$(document).on("click", ".btn-play", function() {
    $('#gameTrailer > source').attr('src', $(this).attr('data-src')); // setting the video source from the source field stored in the play button
    document.getElementById('gameTrailer').load(); // reloading the video element (must use pure DOM instead of jQuery)
    $(this).closest('.page').find('.video-overlay').css('display', 'block'); // displaying the video popup
});

$('.video-overlay').on('click', function(e) {
    // checking that we actually clicked the overlay and not the video itself
    if ($(e.target).is('.video-overlay')) {
        document.getElementById('gameTrailer').pause(); // pausing the video
        $(this).css('display', 'none'); // hiding the overlay (and the video) when clicking on it
    }
});

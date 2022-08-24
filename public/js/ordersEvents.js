/* This function receives a dropdown element (selected by jQuery), a collection name, an optional array of additional fields and an optional
 * array of values to exclude from the dropdown. It reads all data of the specified collection from the server, and populates the options
 * in the dropdown element using the results, possibly concatenating additional fields to the text in order to have more information when selecting.
 */
function populateDropdown(dropdown, collection, additionalFields = [], excludedValues = []) {
    $.get("read?collection=" + collection, function(data, status) {
        var valueField = dropdown.attr('id'); // value field is the field whose value is actually sent to the server. the dropdown's id will always be that field's name
        
        // filtering items whose valueField value is among the excluded values
        data = data.filter(item => !excludedValues.includes(item[valueField]));

        dropdown.find('option[value != ""]').remove(); // removing everything except for the placeholder option
        $(data).each(function(i) {
            // constructing option text
            var optionText = data[i][valueField] + ' | ';
            for (var field of additionalFields) {
                optionText += data[i][field] + ' | ';
            }
            optionText = optionText.substring(0, optionText.length - 3); // cutting the last unnecessary ' | '
            dropdown.append('<option value="' + data[i][valueField] + '">' + optionText + '</option>'); // storing the actual value in the option, along with the text
        });
    });
}

function addNewOrderBtn() {
    // taking the value from the last outer row (found just before the actual last row) of the main table
    var lastOrderNumber = $("#orders .table-expandable > tbody > tr").last().prev().find('td').first().html();
    $('input#orderNumber').prop("disabled", true).val(parseInt(lastOrderNumber) + 1); // populating the order number field with the incremented value and disabling it for editing
    populateDropdown($('select#customerID'), "customers", ['customerName']); // populating the customer dropdown
}

// event handler for clicking Add Item button in one of the orders
$(document).on('click', '.btn-add-item', function() {
    $('.add-item-overlay').css('display', 'block'); // showing the overlay
    $('#addItem')[0].reset(); // resetting the form
    $('#addItem').attr('data-orderid', $(this).attr('data-orderid')); // copying the order id from the button to the form

    // taking all game IDs currently in the items table, and passing them as excluded values to the games dropdown (because we want to prevent adding a game that's already in the order)
    var excludedValues = $(this).siblings('table').find('tbody tr').map(function() { return $(this).find('td').first().html(); }).toArray();
    populateDropdown($('select#gameID'), "games", ['gameName'], excludedValues); // populating the games dropdown
});

// event handler for clicking Delete button in one of the items
$(document).on('click', '.btn-delete-item', function() {
    if (confirm("Are you sure you want to delete this item?")) {
        var gameID = $(this).closest('tr').find('td').first().html(); // the game ID to delete
        var orderID = $(this).attr('data-orderid'); // the order id, previously stored in the button when the items table was created

        // sending a delete item request, passing the game ID in the request body
        $.post('orderItem?action=delete&orderID=' + orderID, 'gameID=' + gameID, function(data) {
            refreshOneOrder(orderID); // refreshing only this specific order
        });
    }
});

// event handler for Add Item form submission
$('#addItem').on('submit', function(event) {
    event.preventDefault();

    var orderID = $(this).attr('data-orderid'); // the order id to which the game is added
    // sending an add item request, passing the form fields (gameID, numberOfUnits) in the body
    $.post('orderItem?action=add&orderID=' + orderID, $(this).serialize(), function() {
        refreshOneOrder(orderID); // refreshing only this specific order
        $('.add-item-overlay').css('display', 'none'); // hiding the popup window
        $('#addItem').removeAttr('data-orderid'); // removing the order id stored in the form
    });
});

// This function gets an order id and refreshes only that specific order.
function refreshOneOrder(orderID) {
    // sending a read request, but passing the specific order id
    $.get('read?collection=orders&orderID=' + orderID, function(data, status) {
        // determine the row in the table based on the fact that the same order id is stored in one of the Add Item buttons
        var orderRow = $('.btn-add-item[data-orderid="' + orderID + '"]').closest('tr').prev(); // taking the previous, always visible row
        orderRow.next().remove(); // removing the row containing the table
        createOrderItemsTable(orderRow, data['games']); // creating it again, using the received data
    });
}

/* This function receives a dropdown element (selected by jQuery), a collection name and array of additional fields.
 * It reads all data of the specified collection from the server, and populates the options in the dropdown element using the results,
 * possibly concatenating additional fields to the text in order to have more information when selecting.
 */
function populateDropdown(dropdown, collection, additionalFields = []) {
    $.get("read?collection=" + collection, function(data, status) {
        var valueField = dropdown.attr('id'); // value field is the field whose value is actually sent to the server. the dropdown's id will always be that field's name
        
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

function addNewOrder() {
    // taking the value from the last outer row (found just before the actual last row) of the main table
    var lastOrderNumber = $("#orders .table-expandable > tbody > tr").last().prev().find('td').first().html();
    $('input#orderNumber').prop("disabled", true).val(parseInt(lastOrderNumber) + 1); // populating the order number field with the incremented value
    populateDropdown($('select#customerID'), "customers", ['customerName']); // populating the customer dropdown
}

$(document).on('click', '.btn-delete-item', function() {
    if (confirm("Are you sure you want to delete this item?")) {
        var gameID = $(this).closest('tr').find('td').first().html();
        
        $.post('orderItem?action=delete&orderID=' + $(this).attr('data-orderid'), 'gameID=' + gameID, function(data) {
            renderOrders();
        });
    }
});

$(document).on('click', '.btn-add-item', function() {
    $('.add-item-overlay').css('display', 'block');
    $('#addItem')[0].reset();
    $('#addItem').attr('data-orderid', $(this).attr('data-orderid'));
    populateDropdown($('select#gameID'), "games", ['gameName']); // populating the customer dropdown
});

$('#addItem').on('submit', function(event) {
    event.preventDefault();

    $.post('orderItem?action=add&orderID=' + $(this).attr('data-orderid'), $(this).serialize(), function(data) {
        $('.add-item-overlay').css('display', 'none');
        renderOrders();
    });

    $(this).removeAttr('data-orderid');
    // $.ajax({
    //     method: "POST",
    //     url: 'orderItem',
    //     data: new FormData(this).append('action', 'addItem').append('orderID', $(this).attr('data-orderid')),
    //     processData: false, // must be set to false so that the FormData will not be processed and transformed into a query string, which would fail
    //     contentType: false, // forcing jQuery not to add a Content-Type header to the HTTP request, which would mess up the structure of our multipart/form-data request
    //     success: function(data) {
    //         page.find('.popup-overlay').css('display', 'none'); // hiding the popup
    //         renderPage(collection); // rendering the updated page
    //     },
    //     statusCode: { // defining functions to execute when specific status codes are received (the success function executes as usual)
    //         422: function(response) { // 422 is currently returned in case of a duplicate "primary key"
    //             alert(response.responseText); // displaying the error message
    //         }
    //     }
    // });
});

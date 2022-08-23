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

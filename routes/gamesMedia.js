/* This function receives the file object, the path where we need to save it, a function that runs if the file was saved successfully, and another
 * function of additional work that executes no matter what.
 */
function saveFile(file, uploadPath, success, additionalWork) {
    // using the mv function from express-fileupload to move the file to the desired location
    file.mv(uploadPath, function(err) {
        if (err) {
            console.log(err); // printing an error message if necessary
        } else {
            success();
        }
        additionalWork();
    });
}

// Exporting the middleware function. The next parameter contains the next middleware function.
exports.upload = (req, res, next) => {
    /* We can access the uploaded files using req.files. If this reference is empty, it means no files were uploaded so we call the next middleware
     * (as a result, in case we edit an existing game and do not provide any media, then if the game currently has an image/video, they will remain 
     *  unchanged - neither deleted nor replaced. The same thing applies for when we only upload a new image when editing - if there's a video, it
     *  remains, and vice-versa).
     */
    if (!req.files || Object.keys(req.files).length === 0) {
        next();
    } else {
        var remainingFiles = Object.keys(req.files).length; // each uploaded file is a property of the req.files object. so we need to count its properties
        var currentDir = __dirname + '/../'; // we need to go up two levels to reach the project folder
        
        // checking if an image was uploaded (the name of the property comes from the name attribute of the input element from the HTML form)
        if (req.files.image) {
            var imgRelativePath = 'public/assets/games_media/images/' + req.files.image.name; // the name property contains the actual filename that was uploaded
            /* Calling the saveFile function, providing a success function that adds an image property containing the path to the request body (since it
             * originally contains only the non-file input values), which is then used in crud.create/crud.update. Also passing an additionalWork function.
             */
            saveFile(req.files.image, currentDir + imgRelativePath, function() { req.body.image = imgRelativePath; }, function() {
                /* The additional work function is the same for both image and trailer, and is used for synchronization - whenever we finish saving a file,
                 * we decrement the number of remaining files - a value accessible by both callbacks. We only want to proceed to the next middleware when
                 * all files are finished (and this function executes even if the file wasn't successfully saved, because we have to go on).
                 */
                remainingFiles--;
                if (remainingFiles == 0) {
                    next();
                }
            });
        }
        // similarly for the trailer
        if (req.files.trailer) {
            var trailerRelativePath = 'public/assets/games_media/videos/' + req.files.trailer.name;
            saveFile(req.files.trailer, currentDir + trailerRelativePath, function() { req.body.trailer = trailerRelativePath; }, function() {
                remainingFiles--;
                if (remainingFiles == 0) {
                    next();
                }
            });
        }
    }
};

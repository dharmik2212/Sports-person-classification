// Dropzone.autoDiscover = false;

// function init() {
//     let dz = new Dropzone("#dropzone", {
//         url: "/",
//         maxFiles: 1,
//         addRemoveLinks: true,
//         dictDefaultMessage: "Some Message",
//         autoProcessQueue: false
//     });
    
//     dz.on("addedfile", function() {
//         if (dz.files[1]!=null) {
//             dz.removeFile(dz.files[0]);        
//         }
//         // Reset UI on new file add
//         $("#error").hide();
//         $("#divClassTable").hide().css("opacity", 0);
//         $("#classTable tr").removeClass("highlight-match"); // Remove previous highlight
//         $("#classTable td[id^='score_']").html(""); // Clear old scores
//     });

//     dz.on("complete", function (file) {
//         let imageData = file.dataURL;
        
//         var url = "http://127.0.0.1:5000/classify_image";

//         $.post(url, {
//             image_data: file.dataURL
//         },function(data, status) {
            
//             console.log(data);
//             if (!data || data.length==0) {
//                 $("#divClassTable").hide().css("opacity", 0);                
//                 $("#error").show();
//                 return;
//             }
            
//             let match = null;
//             let bestScore = -1;
//             for (let i=0;i<data.length;++i) {
//                 let maxScoreForThisClass = Math.max(...data[i].class_probability);
//                 if(maxScoreForThisClass>bestScore) {
//                     match = data[i];
//                     bestScore = maxScoreForThisClass;
//                 }
//             }
//             if (match) {
//                 $("#error").hide();
//                 $("#divClassTable").show().animate({ opacity: 1 }, 500); // Fade in table

//                 let classDictionary = match.class_dictionary;
//                 for(let personName in classDictionary) {
//                     let index = classDictionary[personName];
//                     let proabilityScore = match.class_probability[index];
                    
//                     // Build the element ID selector
//                     let elementName = "#score_" + personName.replace(/ /g, "_");
                    
//                     // Set the score
//                     $(elementName).html(proabilityScore.toFixed(2) + "%");
//                 }
                
//                 // Highlight the winning row
//                 let winnerRowId = "#score_" + match.class.replace(/ /g, "_");
//                 $(winnerRowId).closest("tr").addClass("highlight-match");
//             }
//             // dz.removeFile(file);            
//         });
//     });

//     $("#submitBtn").on('click', function (e) {
//         dz.processQueue();		
//     });
// }

// $(document).ready(function() {
//     console.log( "ready!" );
//     $("#error").hide();
//     $("#divClassTable").hide();

//     init();
// });



Dropzone.autoDiscover = false;

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "/classify_image",  // Use relative URL for production
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Drop files here or click to upload",
        autoProcessQueue: false,
        acceptedFiles: "image/*",
        // Fix for the 405 error - handle removal client-side only
        removedfile: function(file) {
            // Remove preview element without making server request
            if (file.previewElement != null && file.previewElement.parentNode != null) {
                file.previewElement.parentNode.removeChild(file.previewElement);
            }
            return this._updateMaxFilesReachedClass();
        }
    });
    
    dz.on("addedfile", function(file) {
        // Remove previous file if exists
        if (dz.files.length > 1) {
            dz.removeFile(dz.files[0]);        
        }
        
        // Reset UI on new file add
        $("#error").hide();
        $("#divClassTable").hide().css("opacity", 0);
        $("#classTable tr").removeClass("highlight-match");
        $("#classTable td[id^='score_']").html("");
    });

    dz.on("complete", function (file) {
        // Use relative URL - this fixes the mobile issue
        var url = "/classify_image";

        $.post(url, {
            image_data: file.dataURL
        }, function(data, status) {
            
            console.log(data);
            
            // Handle empty or invalid response
            if (!data || data.length == 0) {
                $("#divClassTable").hide().css("opacity", 0);                
                $("#error").show();
                return;
            }
            
            // Find the best match
            let match = null;
            let bestScore = -1;
            for (let i = 0; i < data.length; ++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if (maxScoreForThisClass > bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            
            if (match) {
                $("#error").hide();
                $("#divClassTable").show().animate({ opacity: 1 }, 500);

                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let probabilityScore = match.class_probability[index];
                    
                    // Build the element ID selector
                    let elementName = "#score_" + personName.replace(/ /g, "_");
                    
                    // Set the score
                    $(elementName).html(probabilityScore.toFixed(2) + "%");
                }
                
                // Highlight the winning row
                let winnerRowId = "#score_" + match.class.replace(/ /g, "_");
                $(winnerRowId).closest("tr").addClass("highlight-match");
            }
        }).fail(function(xhr, status, error) {
            // Handle AJAX errors
            console.error("Classification failed:", error);
            console.error("Status:", status);
            console.error("Response:", xhr.responseText);
            $("#error").show();
            $("#divClassTable").hide().css("opacity", 0);
        });
    });

    // Classify button click handler
    $("#submitBtn").on('click', function (e) {
        e.preventDefault();
        
        // Check if file is added
        if (dz.files.length === 0) {
            alert("Please upload an image first!");
            return;
        }
        
        dz.processQueue();
    });
}

$(document).ready(function() {
    console.log("Sports Classifier ready!");
    $("#error").hide();
    $("#divClassTable").hide();

    init();
});



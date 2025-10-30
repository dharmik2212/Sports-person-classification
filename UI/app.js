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
        url: "#", // Set to '#' to prevent any default POST on file add
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false // We will manually trigger on button click
    });

    // --- FIX 2 (FOR 405 ERROR): Override the removeFile function ---
    // This stops Dropzone from sending a DELETE request to the server
    dz.removeFile = function(file) {
        // 1. Remove the file from the Dropzone internal array
        if (this.files.indexOf(file) !== -1) {
            this.files.splice(this.files.indexOf(file), 1);
        }
        // 2. Remove the file's preview from the DOM
        if (file.previewElement != null && file.previewElement.parentNode != null) {
            file.previewElement.parentNode.removeChild(file.previewElement);
        }
        // 3. Reset the UI (clear table and error)
        $("#error").hide();
        $("#divClassTable").hide().css("opacity", 0);
        $("#classTable tr").removeClass("highlight-match");
        $("#classTable td[id^='score_']").html("");
        
        // 4. Return 'this' for chaining
        return this;
    };
    // -----------------------------------------------------------
    
    dz.on("addedfile", function(file) {
        // This checks if a file is already present (file count > 1)
        if (dz.files.length > 1) { 
            // Use our new, safe removeFile function to remove the old file
            dz.removeFile(dz.files[0]); 
        }
        // Reset UI on new file add
        $("#error").hide();
        $("#divClassTable").hide().css("opacity", 0);
        $("#classTable tr").removeClass("highlight-match");
        $("#classTable td[id^='score_']").html("");
    });

    // --- THIS IS THE ORIGINAL LOGIC, NOW CORRECTED ---
    dz.on("complete", function (file) {
        let imageData = file.dataURL;
        
        // --- FIX 1 (FOR MOBILE): Use a relative URL ---
        var url = "/classify_image"; // This works on local and on Render

        $.post(url, {
            image_data: file.dataURL
        },function(data, status) {
            
            console.log(data);
            if (!data || data.length==0) {
                $("#divClassTable").hide().css("opacity", 0);            
                $("#error").show();
                return;
            }
            
            let match = null;
            let bestScore = -1;
            for (let i=0;i<data.length;++i) {
                let maxScoreForThisClass = Math.max(...data[i].class_probability);
                if(maxScoreForThisClass>bestScore) {
                    match = data[i];
                    bestScore = maxScoreForThisClass;
                }
            }
            if (match) {
                $("#error").hide();
                $("#divClassTable").show().animate({ opacity: 1 }, 500); // Fade in table

                let classDictionary = match.class_dictionary;
                for(let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    
                    // Build the element ID selector
                    let elementName = "#score_" + personName.replace(/ /g, "_");
                    
                    // Set the score
                    $(elementName).html(proabilityScore.toFixed(2) + "%");
                }
                
                // Highlight the winning row
                let winnerRowId = "#score_" + match.class.replace(/ /g, "_");
                $(winnerRowId).closest("tr").addClass("highlight-match");
            }
        });
    });
    // ----------------------------------------------------

    // --- THIS IS THE ORIGINAL, CORRECT BUTTON LOGIC ---
    $("#submitBtn").on('click', function (e) {
        if (dz.files.length > 0) {
            dz.processQueue(); // This triggers the "complete" event above
        } else {
            // A non-alert way to show an error
            $("#error").html("<p class='mb-0'><b>Oops!</b> Please upload an image first.</p>").show();
        }  
    });
    // ----------------------------------------------------
}

$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#divClassTable").hide();

    init();
});


    // --- FIX 3 (LOGICAL FLAW): Manually call our function ---
    // This makes the classify button call our $.post function directly
    $("#submitBtn").on('click', function (e) {
        if (dz.files.length > 0) {
            let file = dz.files[0];
            classifyImage(file); // Call our manual $.post function
        } else {
            alert("Please upload an image first.");
        }
        // We NO LONGER call dz.processQueue();
    });
    // ----------------------------------------------------
$(document).ready(function() {
    console.log( "ready!" );
    $("#error").hide();
    $("#divClassTable").hide();

    init();
});



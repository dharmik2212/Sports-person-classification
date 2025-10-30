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

// This function will handle the AJAX call
function classifyImage(file) {
    // 1. Use FileReader to get the base64 string
    const reader = new FileReader();
    reader.onload = function(event) {
        // event.target.result is the base64 string
        const imageData = event.target.result;
        
        // 2. Use a relative URL (FIX 1 FOR MOBILE)
        var url = "/classify_image"; 

        // 3. Send the POST request
        $.post(url, {
            image_data: imageData // Send the base64 data
        }, function(data, status) {
            
            console.log(data);
            if (!data || data.length == 0) {
                $("#divClassTable").hide().css("opacity", 0);
                $("#error").show();
                return;
            }
            
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
                $("#divClassTable").show().animate({ opacity: 1 }, 500); // Fade in table

                let classDictionary = match.class_dictionary;
                for (let personName in classDictionary) {
                    let index = classDictionary[personName];
                    let proabilityScore = match.class_probability[index];
                    let elementName = "#score_" + personName.replace(/ /g, "_");
                    $(elementName).html(proabilityScore.toFixed(2) + "%");
                }
                
                let winnerRowId = "#score_" + match.class.replace(/ /g, "_");
                $(winnerRowId).closest("tr").addClass("highlight-match");
            }
        });
    };
    
    // 4. Read the file
    reader.readAsDataURL(file);
}

function init() {
    let dz = new Dropzone("#dropzone", {
        url: "#", // This URL will NOT be used
        maxFiles: 1,
        addRemoveLinks: true,
        dictDefaultMessage: "Some Message",
        autoProcessQueue: false // We are handling everything manually
    });

    // --- FIX 2 (FOR 405 ERROR): Override the removeFile function ---
    dz.removeFile = function(file) {
        if (this.files.indexOf(file) !== -1) {
            this.files.splice(this.files.indexOf(file), 1);
        }
        if (file.previewElement != null && file.previewElement.parentNode != null) {
            file.previewElement.parentNode.removeChild(file.previewElement);
        }
        $("#error").hide();
        $("#divClassTable").hide().css("opacity", 0);
        $("#classTable tr").removeClass("highlight-match");
        $("#classTable td[id^='score_']").html("");
        return this;
    };
    // -----------------------------------------------------------
    
    dz.on("addedfile", function(file) {
        if (dz.files.length > 1) { 
            dz.removeFile(dz.files[0]); 
        }
        // Reset UI on new file add
        $("#error").hide();
        $("#divClassTable").hide().css("opacity", 0);
        $("#classTable tr").removeClass("highlight-match");
        $("#classTable td[id^='score_']").html("");
    });

    // --- THIS IS THE NEW, CORRECT BUTTON LOGIC ---
    $("#submitBtn").on('click', function (e) {
        if (dz.files.length > 0) {
            let file = dz.files[0];
            classifyImage(file); // Call our manual function
        } else {
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





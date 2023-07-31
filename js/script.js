let inputString;

/* Get length of user input. */

document.getElementById("button").onclick = function() {
    inputString =   document.getElementById("inputText").value;
    txtLbl = document.getElementById("textlabel").innerHTML = inputString.length;

    console.log(inputString.length);
}
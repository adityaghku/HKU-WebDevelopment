function getCurrentTime(){
	return new Date().toLocaleTimeString([], { hour: '2-digit', minute: "2-digit"});
}

async function getIata() {
    const response = await fetch("iata.json");
    const json = await response.json();
    return json
}

async function fetchData(arrival) {

	date = new Date();

    try {

    	let response = await fetch(fileName+arrival.toString(), {method: 'GET'});
        if (response.status == 200) {
        	let rawData = await response.json();
        	return rawData[0];
        }
        else {
        	console.log("Error: " + response.status);
        }

    }

    catch (err) {
    	console.log(err);
    }
};

function formattedData(flightInfo, iata){

	if (arrival){

		var nodes = []
		var tempDiv = document.createElement("table");
		tempDiv.style.border = "thin solid black";


		tempDiv.innerHTML = ""

		var tempS = ""
		for (var l = 0; l < flightInfo.flight.length; l++){
			tempS+= flightInfo.flight[l].no + " \u2003"
		}

		tempDiv.innerHTML += `<tr><td><b>Flight No.: </b> ${tempS}</td><td><b>Scheduled Time: </b> ${flightInfo.time}</td></tr><br></br>`;

		tempS=""
		for (var l = 0; l < iata.length; l++){
			if (iata[l].iata_code == flightInfo.origin){
				tempS+= iata[l].municipality + " (" + iata[l].name + ") \u2003";
			}
		}

		tempDiv.innerHTML += `<tr><td><b>Origin (Airport): </b> <br></br>${tempS}</td><br></br></tr>`;

		tempDiv.innerHTML += `<tr><td><b>Parking Stand:: </b> ${flightInfo.stand} \u2003 <b>Hall:</b> ${flightInfo.hall} \u2003 <b>Belt:</b> ${flightInfo.baggage}</td><td><b>Status: </b> ${flightInfo.status}</td></tr>`;

		nodes.push(tempDiv);

		return nodes;

	}

	else {
		var nodes = []
		var tempDiv = document.createElement("table");
		tempDiv.style.border = "thin solid black";


		tempDiv.innerHTML = ""

		var tempS = ""
		for (var l = 0; l < flightInfo.flight.length; l++){
			tempS+= flightInfo.flight[l].no + " \u2003"
		}

		tempDiv.innerHTML += `<tr><td><b>Flight No.: </b> ${tempS}</td><td><b>Scheduled Time: </b> ${flightInfo.time}</td></tr><br></br>`;

		tempS=""
		for (var l = 0; l < iata.length; l++){
			if (iata[l].iata_code == flightInfo.destination){
				tempS+= iata[l].municipality + " (" + iata[l].name + ") \u2003";
			}
		}

		tempDiv.innerHTML += `<tr><td><b>Destination (Airport): </b> <br></br>${tempS}</td><br></br></tr>`;

		tempDiv.innerHTML += `<tr><td><b>Terminal: </b> ${flightInfo.terminal} \u2003 <b>Aisle:</b> ${flightInfo.aisle} \u2003 <b>Gate:</b> ${flightInfo.gate}</td><td><b>Status: </b> ${flightInfo.status}</td></tr>`;

		nodes.push(tempDiv);

		return nodes;
	}
	
}

async function addDivs(arrival, earlyButton, lateButton) {

	let data = await fetchData(arrival);
	let currentDiv = document.getElementById("mainLayout");
	let iata = await getIata();

	let l = 10;
	let currentIndex = -1;

	for (var i = 0; i < data.list.length; i++){
		if (data.list[i].time > getCurrentTime()){
			currentIndex = i
			break
		}
	}

	let left = currentIndex;
	let right = currentIndex + 10;

	if (earlyButton){
		left = 0;
	}

	if (lateButton){
		right = data.list.length;
	}

	let j = left;

	while (j < right){

		let newDiv = document.createElement("div");
		let nodes = formattedData(data.list[j], iata);
		
		for (var k = 0; k < nodes.length; k++){
			newDiv.appendChild(nodes[k]);
			newDiv.appendChild(document.createElement("br"));
		}
		currentDiv.appendChild(newDiv);
		j++;	
	}
}

function clearMain(){
	var parent = document.getElementById("mainLayout")
	
	while (parent.firstChild) {
    	parent.firstChild.remove()
	}
}

var arrival = document.getElementById('toggleSwitch').checked;
const fileName = `flight.php?date=${date.getFullYear()}-${date.getMonth()}-${date.getDate()}&lang=en&cargo=false&arrival=`;

var early = false;
var late = false;

function earlyClicked(){
	early = !early
	return early;
}

function lateClicked(){
	late = !late
	return late;
}

function showButtonsAgain(){
	button1 = document.getElementById("early");
	button2 = document.getElementById("late");

	button1.style.display = 'initial';
	button2.style.display = 'initial';

	early = false;
	late = false;
}

function updateHeader(){
	if (document.getElementById('toggleSwitch').checked){
		document.getElementById("informationHeader").innerHTML = "Arrival Information"
	}
	else{
		document.getElementById("informationHeader").innerHTML = "Departure Information"
	}
}

function main(){
	arrival = document.getElementById('toggleSwitch').checked;
	addDivs(arrival, early, late);
}

main();


var state_wise_data;
/**
	This function blink newly registered cases for easy eye catching
*/
var blink_speed = 500;
var t = setInterval(function () {
  var ele = document.getElementById('newCases');
  ele.style.visibility = (ele.style.visibility == 'hidden' ? '' : 'hidden');
}, blink_speed);

/**
	This function is used to refresh page after each 5 mins so that user can see latest Data.
*/
var refreshPage=300000;
var t = setInterval(function () {
  loadSummryForIndia();
  loadLatestStateDataForIndia();
}, refreshPage);

/**
	Center of MAP i.e. INDIA
*/
var map = L.map('indiaMap').setView([24.000000, 78.000000], 5);


L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
	maxZoom: 30,
	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
		'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	id: 'mapbox/light-v9',
	tileSize: 512,
	zoomOffset: -1
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};
/**
	Allows user to see Updated data on hover
*/
info.update = function (props) 
{
	if(state_wise_data!=null && props!=null)
	{
		for (index = 0; index < state_wise_data.data.regional.length; index++) 
		{ 
			if(state_wise_data.data.regional[index].loc==props.NAME_1)
			{
				this._div.innerHTML = '<h4>COVID 19 SITUATION IN INDIA</h4>' +  (props ?
				'<b>' + props.NAME_1 + '</b><br /> <i> Total Cases : </i>' + state_wise_data.data.regional[index].confirmedCasesIndian + ' people '
				: 'Hover over a state');
			}
	}
		}
};
info.addTo(map);

/**
	This function loads data as per state wise and color the map according to count
*/
function loadLatestStateDataForIndia() 
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() 
  {
	if (this.readyState == 4 && this.status == 200) 
	{
		 state_wise_data=JSON.parse(this.responseText);
		 if(state_wise_data!=null)
		 {
			var statesData1=statesData;
			 for (index = 0; index < state_wise_data.data.regional.length; index++) 
			 {
				if(state_wise_data.data.regional[index].loc!="Ladakh")
				{
					var filterData = statesData.features.filter(d => d.properties.NAME_1 === state_wise_data.data.regional[index].loc);
					if(filterData!=null)
					{
						filterData[0].properties.confirmedCases=state_wise_data.data.regional[index].confirmedCasesIndian;
						geojson = L.geoJson(filterData, {
									style: style,
								   onEachFeature: onEachFeature
								}).addTo(map); 
				
						statesData=statesData1;
					}
				}
			}
		}
	}
  };
  xhttp.open("GET", "https://api.rootnet.in/covid19-in/stats/latest", true);
  xhttp.send();
}

// get color depending on population density value
function getColor(d) 
{	
	return d > 1000 ? '#800026' :
			d > 500  ? '#BD0026' :
			d > 200  ? '#E31A1C' :
			d > 100  ? '#FC4E2A' :
			d > 50   ? '#FD8D3C' :
			d > 20   ? '#FEB24C' :
			d > 10   ? '#FED976' :
						'#FFEDA0';
}
/**
	Colour the map according to confirmed cases
*/
function style(feature) {
	
	return {
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7,
		fillColor: getColor(feature.properties.confirmedCases)
	};
}

function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {

	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

geojson = L.geoJson(statesData, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('COVID 19 Cases reference from &copy; <a href="https://www.who.int/emergencies/diseases/novel-coronavirus-2019">WHO</a>');
map.attributionControl.addAttribution('<i id="refreshDate"></i>');


/**
	This function is used to fetch common data across India for CORONA
*/
function loadSummryForIndia() 
{
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() 
  {
	if (this.readyState == 4 && this.status == 200) 
	{
		var response=JSON.parse(this.responseText);
		for (index = 0; index < response.Countries.length; index++) 
		{ 
		   if(response.Countries[index].Country=="India")
		   {
			   document.getElementById("totalCount").innerHTML = "Total Counts : "+response.Countries[index].TotalConfirmed;
			   document.getElementById("survivalCount").innerHTML = "Total Survivals : "+response.Countries[index].TotalRecovered;
			   document.getElementById("deathCount").innerHTML = "Total Deaths : "+response.Countries[index].TotalDeaths;
			   document.getElementById("newCases").innerHTML = "New Confirmed : "+response.Countries[index].NewConfirmed;
			   document.getElementById("newSurvivals").innerHTML = "New Survivals : "+response.Countries[index].NewRecovered;
			   document.getElementById("newDeaths").innerHTML = "New Deaths : "+response.Countries[index].NewDeaths;
			   document.getElementById("refreshDate").innerHTML = "Date &nbsp; "+response.Countries[index].Date;
			   
			}
		} 
	}
  };
  xhttp.open("GET", "https://api.covid19api.com/summary", true);
  xhttp.send();
}

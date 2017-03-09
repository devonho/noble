/*
  Continously scans for peripherals and prints out message when they enter/exit

    In range criteria:      RSSI < threshold
    Out of range criteria:  lastSeen > grace period

  based on code provided by: Mattias Ask (http://www.dittlof.com)
*/
var noble = require('../index');
var request = require('request');


var RSSI_THRESHOLD    = -90;
var EXIT_GRACE_PERIOD = 2000; // milliseconds

var inRange = [];

function sendRSSI(id,rssi) {

    var thingsurl = 'https://things.apps.bosch-iot-cloud.com/api/1/things/' + encodeURIComponent(':') + id + '/features';

    //console.log(thingsurl);

    var options = {
	url : thingsurl,
	headers: {
	    'x-cr-api-token':'ba7b6506558742e99f66dcd722cbdf42',
	    'Authorization':'Basic ZGhkZW1vOlBhc3MxMjM0JA=='
	}
    }

    function callback(error, response, body) {
	if(!error && response.statusCode == 200){
	    var info = JSON.parse(body);
	    //console.log(body)
	    //console.log(info.scanner.properties.rssi1);
	    //console.log(info.scanner.properties.rssi2);
	    //console.log(info.scanner.properties.rssi3);	    

	    info.scanner.properties.rssi3 = rssi;
	    
	    options.body = info
	    options.json = true
	    
	    request.put(options, function(error2,response2,body2) {

		console.log('PUT: ' + response2.statusCode + ' RSSI: ' + rssi);

	    });
	}
    }
    
    request.get(options, callback);
}

//sendRSSI('6eb94033-8713-40c3-a9a3-8ea327f93362','bar');

noble.on('discover', function(peripheral) {

    if(peripheral.id == 'fdcedea2fac4')
    {
	//console.log('ID: ' + peripheral.id + ' RSSI: ' + peripheral.rssi + ' NAME:' + peripheral.advertisement.localName);
	sendRSSI('6eb94033-8713-40c3-a9a3-8ea327f93362',peripheral.rssi);
    }
})

/*
noble.on('discover', function(peripheral) {
  if (peripheral.rssi < RSSI_THRESHOLD) {
    // ignore
    return;
  }

  var id = peripheral.id;
  var entered = !inRange[id];

  if (entered) {
    inRange[id] = {
      peripheral: peripheral
    };

    console.log('"' + peripheral.advertisement.localName + '" entered (RSSI ' + peripheral.rssi + ') ' + new Date());
  }

  inRange[id].lastSeen = Date.now();
});

setInterval(function() {
  for (var id in inRange) {
    if (inRange[id].lastSeen < (Date.now() - EXIT_GRACE_PERIOD)) {
      var peripheral = inRange[id].peripheral;

      console.log('"' + peripheral.advertisement.localName + '" exited (RSSI ' + peripheral.rssi + ') ' + new Date());

      delete inRange[id];
    }
  }
}, EXIT_GRACE_PERIOD / 2);
*/



noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning([], true);
  } else {
    noble.stopScanning();
  }
});

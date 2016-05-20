/**
 * Init
 */
var FlowerPower = require('flower-power-ble');
var Q = require('q');
var request = require('request');
var loopCounter = 1; // Counts the number of times the loop has completed
var loopStartTimestamp = Date.now(); //  Grabs the current UNIX time
var urlData = "";


/**
 * Configuration
 */

// List peripheral IDs
var validPeripherals = [
        '9003b7e7de99',
        'a0143da0ddaf'
];
// Set the interval time in minutes you want to query devices
var loopTimeout = 5;
// Set the api url
var apiURL = 'https://api.smartyields.com/v1/telemetry/inbound/parrot/fp/?vndr=parrot&mod=fp';
var SY_API_TOKEN = "bc07d758a7d71560821037cafc42f57f";


/**
 * Services & Characteristic IDs
 */
var LIVE_SERVICE_UUID                       = '39e1fa0084a811e2afba0002a5d5c51b';
var CALIBRATION_SERVICE_UUID                = '39e1fe0084a811e2afba0002a5d5c51b';

var SUNLIGHT_UUID                           = '39e1fa0184a811e2afba0002a5d5c51b';
var SOIL_EC_UUID                            = '39e1fa0284a811e2afba0002a5d5c51b';
var SOIL_TEMPERATURE_UUID                   = '39e1fa0384a811e2afba0002a5d5c51b';
var AIR_TEMPERATURE_UUID                    = '39e1fa0484a811e2afba0002a5d5c51b';
var SOIL_MOISTURE_UUID                      = '39e1fa0584a811e2afba0002a5d5c51b';
var LIVE_MODE_PERIOD_UUID                   = '39e1fa0684a811e2afba0002a5d5c51b';
var LED_UUID                                = '39e1fa0784a811e2afba0002a5d5c51b';
var LAST_MOVE_DATE_UUID                     = '39e1fa0884a811e2afba0002a5d5c51b';
var CALIBRATED_SOIL_MOISTURE_UUID           = '39e1fa0984a811e2afba0002a5d5c51b';
var CALIBRATED_AIR_TEMPERATURE_UUID         = '39e1fa0a84a811e2afba0002a5d5c51b';
var CALIBRATED_DLI_UUID                     = '39e1fa0b84a811e2afba0002a5d5c51b';
var CALIBRATED_EA_UUID                      = '39e1fa0c84a811e2afba0002a5d5c51b';
var CALIBRATED_ECB_UUID                     = '39e1fa0d84a811e2afba0002a5d5c51b';
var CALIBRATED_EC_POROUS_UUID               = '39e1fa0e84a811e2afba0002a5d5c51b';

var FRIENDLY_NAME_UUID                      = '39e1fe0384a811e2afba0002a5d5c51b';
var COLOR_UUID                              = '39e1fe0484a811e2afba0002a5d5c51b';
var CLOCK_SERVICE_UUID                      = '39e1fd0084a811e2afba0002a5d5c51b';
var CLOCK_CURRENT_TIME_UUID                 = '39e1fd0184a811e2afba0002a5d5c51b';

var HISTORY_SERVICE_UUID                    = '39e1fc0084a811e2afba0002a5d5c51b';
var HISTORY_NB_ENTRIES_UUID                 = '39e1fc0184a811e2afba0002a5d5c51b';
var HISTORY_LASTENTRY_IDX_UUID              = '39e1fc0284a811e2afba0002a5d5c51b';
var HISTORY_TRANSFER_START_IDX_UUID         = '39e1fc0384a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_ID_UUID         = '39e1fc0484a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_START_IDX_UUID  = '39e1fc0584a811e2afba0002a5d5c51b';
var HISTORY_CURRENT_SESSION_PERIOD_UUID     = '39e1fc0684a811e2afba0002a5d5c51b';

/**
 * Methods
 */

// Read Sunlight
// Converts to PAR (umol/m/s2)
// TODO: Double check math
FlowerPower.prototype.readSunlight = function(callback) {
	var deferred = Q.defer();
	var sunlight = this._characteristics[LIVE_SERVICE_UUID][SUNLIGHT_UUID];
	sunlight.read(function(error, data) {
		var rawValue = data.readUInt16LE(0) * 1.0;
		var _sunlight = 0.08640000000000001 * (192773.17000000001 * Math.pow(rawValue, -1.0606619));
		deferred.resolve(_sunlight);
	});
	return deferred.promise;
};

// Read Soil EC
// Converted to mS/cm
FlowerPower.prototype.readSoilEC = function(callback) {
        var deferred = Q.defer();
        var soilEC = this._characteristics[LIVE_SERVICE_UUID][SOIL_EC_UUID];
        soilEC.read(function(error, data) {
                var rawValue = data.readUInt16LE(0) * 1.0;
                var _soilEC = parseFloat(rawValue) / 177.1; // Calculation made by CSC
                deferred.resolve(_soilEC);
        });
        return deferred.promise;
};

// Read Air Temperature
// Converted to C
// TODO: Appears to be a cap on the data values. Remove when data can be conditioned.
FlowerPower.prototype.readAirTemperature = function(callback) {
        var deferred = Q.defer();
        var airTemp = this._characteristics[LIVE_SERVICE_UUID][AIR_TEMPERATURE_UUID];
        airTemp.read(function(error, data) {
                var rawValue = data.readUInt16LE(0) * 1.0;
		var temperature = 0.00000003044 * Math.pow(rawValue, 3.0) - 0.00008038 * Math.pow(rawValue, 2.0) + rawValue * 0.1149 - 30.449999999999999;

		if (temperature < -10.0) {
			temperature = -10.0;
		} else if (temperature > 55.0) {
			temperature = 55.0;
		}

                deferred.resolve(temperature);
        });
        return deferred.promise;
};

// Read Soil Temperature
// Converted to C
// TODO: Appears to be a cap on the data values. Remove when data can be conditioned.
FlowerPower.prototype.readSoilTemperature = function(callback) {
        var deferred = Q.defer();
        var soilTemp = this._characteristics[LIVE_SERVICE_UUID][SOIL_TEMPERATURE_UUID];
        soilTemp.read(function(error, data) {
                var rawValue = data.readUInt16LE(0) * 1.0;
		var temperature = 0.00000003044 * Math.pow(rawValue, 3.0) - 0.00008038 * Math.pow(rawValue, 2.0) + rawValue * 0.1149 - 30.449999999999999;

                if (temperature < -10.0) {
                        temperature = -10.0;
                } else if (temperature > 55.0) {
                        temperature = 55.0;
                }

                deferred.resolve(temperature);
        });
        return deferred.promise;
};

// Read Soil Moisture
// Converted to cbars
// TODO: Check output
FlowerPower.prototype.readSoilMoisture = function(callback) {
	var deferred = Q.defer();
	var soilMoisture = this._characteristics[LIVE_SERVICE_UUID][SOIL_MOISTURE_UUID];
       	soilMoisture.read(function(error, data) {
		var rawValue = data.readUInt16LE(0) * 1.0;
		var soilMoisture = 11.4293 + (0.0000000010698 * Math.pow(rawValue, 4.0) - 0.00000152538 * Math.pow(rawValue, 3.0) +  0.000866976 * Math.pow(rawValue, 2.0) - 0.169422 * rawValue);
		soilMoisture = 100.0 * (0.0000045 * Math.pow(soilMoisture, 3.0) - 0.00055 * Math.pow(soilMoisture, 2.0) + 0.0292 * soilMoisture - 0.053);

		if (soilMoisture < 0.0) {
			soilMoisture = 0.0;
		} else if (soilMoisture > 60.0) {
			soilMoisture = 60.0;
		}
		deferred.resolve(soilMoisture);
        });
	return deferred.promise;
};

// Bridge
var bridge = function(peripheralID) {
	var deferred = Q.defer();
	console.log('Searching...');
	FlowerPower.discoverById(peripheralID, function(flowerPower) {
		console.log('Found! ' + flowerPower.uuid);
		flowerPower.connectAndSetup(function(error) {

			Q.all([
				flowerPower.readSunlight(),
				flowerPower.readSoilMoisture(),
				flowerPower.readSoilEC(),
				flowerPower.readSoilTemperature(),
				flowerPower.readAirTemperature()
			]).spread( function(sunlight, soilM, soilEC, soilTemperature, airTemperature) {
				console.log('This program has run: '+loopCounter+' times since ' + loopStartTimestamp);
				console.log('Sunlight: '+sunlight);
				urlData = urlData + "&par_umole_m2s="+sunlight;

				console.log('Soil Moisture: '+soilM);
				urlData = urlData + "&vwc_percent="+soilM;

				console.log('Soil EC: '+soilEC);
				urlData = urlData + "&conductivity="+soilEC;

				console.log('Soil Temperature: '+soilTemperature);
				urlData = urlData + "&soilTemp="+soilTemperature;

				console.log('Air Temp: '+airTemperature);
				urlData = urlData + "&air_temperature_celcius="+airTemperature;

				loopCounter++;

				// Construct API URL
				var _url = apiURL+ "&hwID=" +peripheralID+ "&token=" +SY_API_TOKEN+ urlData;
				console.log(_url);

				// GET data
				request(_url, function(error, response, body) {
					if ( !error && response.statusCode === 200 ) {
						console.log(body);
						flowerPower.disconnect(function(error) {
                		                        console.log('Disconnected.');
        	                	                deferred.resolve('done');
	                               		});
					} else {
						console.log(error);
					}
				});
				// flowerPower.disconnect(function(error) {
				//	console.log('Disconnected.');
				//	deferred.resolve('done');
				//});
			});
		});

	});
	return deferred.promise;
};

// Draw each bridge synchronously
// TODO: Make this so it doesn't have to be edited.
function drawBridges() {
	console.log('Starting...');
	bridge(validPeripherals[0]).then(function() {
		bridge(validPeripherals[1]).then(function() {
			console.log('See you in '+ loopTimeout +' minutes.');
		});
	});
	setTimeout(drawBridges, parseInt(loopTimeout) * 60 * 1000 );
};

// Start bridge.
drawBridges();

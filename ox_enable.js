/**
 *
 */
const DEVICE_NAME             = "Ox 0";
const BATTERY_SERVICE_UUID    = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const XBATTV_CHAR_UUID        = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const IBATTV_CHAR_UUID        = "be7a45e5-4c37-40cc-b333-ae0c656a49b1";
const ENABLE_SERVICE_UUID     = "f3e031b2-f057-4dbc-917d-8cacf6e78234";
const ENABLE_FLAG_UUID        = "17603fac-2e15-4afd-962d-107464389c5a";

var OxDevice;
var OxServer;
var OxBattService;
var OxEnableService;
var OxEnableChar;

$(function() {
	function connect() {
		var requestDeviceParams = {
			filters: [
				{namePrefix: 'Ox' }
			],
			optionalServices: [ BATTERY_SERVICE_UUID, ENABLE_SERVICE_UUID ]
		};

		navigator.bluetooth.requestDevice( requestDeviceParams )

		.then( function(device) {
			OxDevice = device;
			return device.gatt.connect();
		})

		.then( function(server) {
			OxServer = server;
			return server.getPrimaryService( BATTERY_SERVICE_UUID );
		})


		.then( function(service) {
			OxBattService = service;
			return service.getCharacteristic( XBATTV_CHAR_UUID );
		})

		.then( function(characteristic) {
			characteristic.startNotifications()
			.then( char => {characteristic.addEventListener('characteristicvaluechanged', handleXBattV)
			})
		})

		.then( function() {
			return OxBattService.getCharacteristic( IBATTV_CHAR_UUID );
		})

		.then( function(characteristic) {
			characteristic.startNotifications()
			.then( char => {characteristic.addEventListener('characteristicvaluechanged', handleIBattV)
			})
		})		

		.then( function() {
			OxEnableService = OxServer.getPrimaryService( ENABLE_SERVICE_UUID );
		})

		.catch(error => { console.error(error); });
	}

	function handleXBattV(event) {
		var value = event.target.value;
		let a = "";
		for( let i = 0; i < value.byteLength; i++ ) {
			a += String.fromCharCode( value.getUint8(i) );
		}
		$("#xbattvalue").text( a );
	}

	function handleIBattV(event) {
		var value = event.target.value;
		let a = "";
		for( let i = 0; i < value.byteLength; i++ ) {
			a += String.fromCharCode( value.getUint8(i) );
		}
		$("#ibattvalue").text( a );
	}

	function disconnect() {
		if( OxDevice ) {
			OxDevice.gatt.disconnect();
		}
	}

	function EnableOx() {
		if( OxEnableService ) {
			OxEnableChar = OxEnableService.getCharacteristic( ENABLE_FLAG_UUID );
			var setEnable = Uint8Array.of( 0x31 );
			OxEnableChar.writeValue( setEnable );
		}
	}

	$("#connect").click(() => {
		connect();
	});

	$("#disconnect").click(() => {
		disconnect();
	});

	$("#enable").click(() => {
		EnableOx();
	});
})

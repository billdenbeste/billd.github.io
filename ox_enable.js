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

$("#connect").click() { connect(); }

$("#disconnect").click() { disconnect(); )

function connect() {
	var requestDeviceParams = {
		services: [ "f3e031b2-f057-4dbc-917d-8cacf6e78234" ],
		acceptAllDevices: true
	};

	navigator.bluetooth.requestDevice( requestDeviceParams )

	.then( function(device) {
		OxDevice = device;
		return device => device.gatt.connect();
	})

	.then( function(server) {
		return server.getPrimaryService( BATTERY_SERVICE_UUID );
	})


	.then( function(service) {
		return service.getCharacteristic( XBATTV_CHAR_UUID );
	})

	.then( function(characteristic) {
		characteristic.startNotifications()
		.then( characteristic.oncharacteristicValuechanged = handleXBattV );
	})

	.then( function(service) {
		return service.getCharacteristic( IBATTV_SERVICE_UUID );
	})

	.then( function(characteristic) {
		characteristic.startNotifications()
		.then( characteristic.oncharacteristicValuechanged = handleIBattV );
	})
	.catch(error => { console.log(error); });
}

function handleXBattV(event) {
	var value = event.target.value.getUint8(0);
	$("#xbattvalue").text("" + value);
}

function handleIBattV(event) {
	var value = event.target.value.getUint8(0);
	$("#ibattvalue").text("" + value);
}

function disconnect() {
	if( OxDevice ) {
		OxDevice.disconnect();
	}
}

/**
 *
 */
const DEVICE_NAME             = "Ox 0";
const BATTERY_SERVICE_UUID    = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const XBATTV_CHAR_UUID        = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const IBATTV_CHAR_UUID        = "be7a45e5-4c37-40cc-b333-ae0c656a49b1";
const ENABLE_SERVICE_UUID     = "f3e031b2-f057-4dbc-917d-8cacf6e78234";
const ENABLE_FLAG_UUID        = "17603fac-2e15-4afd-962d-107464389c5a";

$(function() {
	var requestDeviceParams = {
		services: [ "f3e031b2-f057-4dbc-917d-8cacf6e78234" ],
		acceptAllDevices: true
	};

	$("#connect").click(() => {
		navigator.bluetooth.requestDevice( requestDeviceParams )
		.then( device => device.gatt.connect() )
		.then( server => server.getPrimaryService( "f3e031b2-f057-4dbc-917d-8cacf6e78234" ) )
		.then( service => service.getCharacteristic( "17603fac-2e15-4afd-962d-107464389c5a" ) )
		.then( characteristic => {
			var setEnable = Uint8Array.of( 0x31 );
			return characteristic.writeValue( setEnable );
		})
		.catch(error => { console.log(error); });
	})
})

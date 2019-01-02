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
var OxXBattChar;
var OxIBattChar;

var OxEnableService;
var OxEnableChar;

var XBattValue;

$(function() {
	$("#connect").show();
	$("#disconnect").hide();
	$("#enable").hide();
	$("#oxstatus").hide();
	$("#vbatt").hide();
	$("#ibatt").hide();

	async function connect() {
		var requestDeviceParams = {
			filters: [
				{namePrefix: 'Ox' }
			],
			optionalServices: [ BATTERY_SERVICE_UUID, ENABLE_SERVICE_UUID ]
		};
		try {
			OxDevice = await navigator.bluetooth.requestDevice( requestDeviceParams )

			$("#oxstatus").show();
			$("#oxstatus").text("Connecting...");
			$("#connect").hide();

			OxServer = await OxDevice.gatt.connect();

			OxBattService = await OxServer.getPrimaryService( BATTERY_SERVICE_UUID );
			OxXBattChar = await OxBattService.getCharacteristic( XBATTV_CHAR_UUID );

			await OxXBattChar.startNotifications();
			await OxXBattChar.addEventListener('characteristicvaluechanged', handleXBattV);

			OxIBattChar = await OxBattService.getCharacteristic( IBATTV_CHAR_UUID );

			await OxIBattChar.startNotifications();
			await OxIBattChar.addEventListener('characteristicvaluechanged', handleIBattV);

			OxEnableService = await OxServer.getPrimaryService( ENABLE_SERVICE_UUID );
			OxEnableChar = await OxEnableService.getCharacteristic( ENABLE_FLAG_UUID );

			$("#enable").show();
			$("#disconnect").show();
			$("#vbatt").show();
			$("#ibatt").show();
			$("#oxstatus").text("Connected to " + OxDevice.name);

		} catch( error ) {
			console(error);
		}
	}

	function handleXBattV(event) {
		var value = event.target.value;
		let a = "";
		for( let i = 0; i < value.byteLength; i++ ) {
			a += String.fromCharCode( value.getUint8(i) );
		}

		var val1 = parseFloat(a);
		var val2 = Math.trunc( val1 * 10 ) / 10;
		$("#xbattvalue").text( val2.toString() + 'V');
                var val3 = (val2 / 12) * 100;
		$("#progressbar>div").width( val3 + '%');

		if( val3 < 35 ) {
			$("#progressbar>div").css( "background-color", "red" );
		} else if( val3 < 65 ) {
			$("#progressbar>div").css( "background-color", "yellow" );
		} else {
			$("#progressbar>div").css( "background-color", "lime" );
		}
	}

	function handleIBattV(event) {
		var value = event.target.value;
		let a = "";
		for( let i = 0; i < value.byteLength; i++ ) {
			a += String.fromCharCode( value.getUint8(i) );
		}

		IBattValue = (parseFloat(a) / 12) * 100;
		var Xround = Math.round( IBattValue * 10 / 10 );
		$("#ibattvalue").text( Xround.toString() + 'V');
	}

	async function disconnect() {
		if( OxXBattChar ) {
			try {
				await OxXBattChar.stopNotifications();
				await OxXBattChar.removeEventListener( 'characteristicvaluechanged', handleXBattV);
			} catch( error ) {
				console(error);
			}
		}

		if( OxIBattChar ) {
			try {
				await OxIBattChar.stopNotifications();
				await OxIBattChar.removeEventListener( 'characteristicvaluechanged', handleIBattV);
			} catch( error ) {
				console(error);
			}
		}

		if( OxDevice ) {
			await OxDevice.gatt.disconnect();
		}
	}

	function EnableOx() {
		var setEnable = Uint8Array.of( 0x31 );
		OxEnableChar.writeValue( setEnable );
	}

	$("#connect").click(() => {
		connect();
	});

	$("#disconnect").click(() => {
		disconnect();
		$("#connect").show();
		$("#disconnect").hide();
		$("#enable").hide();
		$("#oxstatus").hide();
		$("#vbatt").hide();
		$("#ibatt").hide();
	});

	$("#enable").click(() => {
		EnableOx();
	});
})

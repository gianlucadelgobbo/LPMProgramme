/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
	networkState: 'No network connection',
	// Application Constructor
	initialize: function() {
		this.bindEvents();
	},
	// Bind Event Listeners
	//
	// Bind any events that are required on startup. Common events are:
	// 'load', 'deviceready', 'offline', and 'online'.
	bindEvents: function() {
		document.addEventListener('deviceready', 	this.onDeviceReady, false);
		document.addEventListener("offline", 		this.onOffline, 	false);
		document.addEventListener("online", 		this.onOnline, 	false);
	},
	checkConnection: function() {
		var networkState = navigator.connection.type;
	
		var states = {};
		states[Connection.UNKNOWN]  = 'Unknown connection';
		states[Connection.ETHERNET] = 'Ethernet connection';
		states[Connection.WIFI]	 = 'WiFi connection';
		states[Connection.CELL_2G]  = 'Cell 2G connection';
		states[Connection.CELL_3G]  = 'Cell 3G connection';
		states[Connection.CELL_4G]  = 'Cell 4G connection';
		states[Connection.CELL]	 = 'Cell generic connection';
		states[Connection.NONE]	 = 'No network connection';
		app.networkState = states[networkState];
		console.log('Connection type: ' + states[networkState]);
	},
	
	// deviceready Event Handler
	//
	// The scope of 'this' is the event. In order to call the 'receivedEvent'
	// function, we must explicitly call 'app.receivedEvent(...);'
	onDeviceReady: function() {
		app.receivedEvent('deviceready');
		app.checkConnection();
		app.syncData();
		console.log('Connection type2: ' + app.networkState);
	},
	onOffline: function() {
		app.checkConnection();
		console.log('onOffline');
	},
	onOnline: function() {
		app.checkConnection();
		console.log('onOnline');
	},
	syncData: function () {

		// first, check if the file exists locally
		var dataName = "eventdata";

		// tip: you can test the functionality below simply by uncommenting the line below
		//localStorage.clear();

		// fetch the file from the local cache
		app.dataCnt = localStorage.getItem(dataName);
		//app.dataCnt = null;
		//app.networkState = 'No network connection';

		// check if something was found
		if (app.dataCnt === null || app.dataCnt === "null") {
			var remoteFileURL = app.networkState == 'No network connection' ? "data/data.json" : "https://flxer.net/api/lpm-team/events/lpm-2017-amsterdam/";
			// nope - file doesn't exist, so fetch it remotely (synchronously)
			var remoteFile = fetchRemoteFile(remoteFileURL, startup);

			// persist it to the local cache
			localStorage.setItem(dataName, remoteFile);
		}

		if (app.dataCnt === null || app.dataCnt === "null") {
			console.log("Something went wrong... please add your error handling here...");
			return;
		} else {
			startup();
		}

		console.log("Finished, dataCnt globally available as:");
		console.log(app.dataCnt);
	},

	// Update DOM on a Received Event
	receivedEvent: function(id) {
		/*
		var parentElement = document.getElementById(id);
		var listeningElement = parentElement.querySelector('.listening');
		var receivedElement = parentElement.querySelector('.received');

		listeningElement.setAttribute('style', 'display:none;');
		receivedElement.setAttribute('style', 'display:block;');
		*/
		console.log('Received Event: ' + id);
	}
};
app.initialize();






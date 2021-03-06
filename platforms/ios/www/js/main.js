var back = [];
var mySvgPanZoom;
var startupSez = "loadDaysList";
var scroll = [0,0];
var dataName = "eventdata";
console.log("aaaa");

var localVar = {
    title: "LPM 2017 Amsterdam",
    permalink: "2017-amsterdam",
    title_editions: "LPM Editions",
    remoteFileURL: "https://flxer.net/api/app/lpm/",
    protocol: "lpm://",
    formatfolder: "400x300"
}

function startup (remoteFile) {
    //alert("startup "+dataName);
	app.dataCnt = remoteFile;
	//alert(JSON.stringify(app.dataCnt.editions));
    window.localStorage.setItem(dataName, JSON.stringify(app.dataCnt));
    $("#title_content").text(localVar.title);
    $("#popover_title").text(localVar.title_editions);
    $("#loadTwitter").bind('click', btn0);
	$("#loadDaysList").bind('click', btn1);
	$("#loadScan").bind('click', btn2);
	$("#loadArtistsList").bind('click', btn3);
	$("#loadMap").bind('click', btn4);
	$("header .icon-refresh").bind('click', reloadRemoteFile);
	$("header .icon-left-nav").hide().bind('click', myBack);
    content = "";
    for (var a=0;a<app.dataCnt.editions.length;a++) {
        content+= "<li class=\"table-view-cell\">";
        content+= "		<a data-load=\""+localVar.remoteFileURL+"?edition="+app.dataCnt.editions[a].id+"\">"+app.dataCnt.editions[a].title+"</a>";
        content+= "	</li>";
    }
    $("#popover_content").html(content);
    $("#popover_content a").bind('click', loadEdition);
    setActive(startupSez);
	eval(startupSez+"()");
}
function loadScan(){
    console.log("clicked");
    //$("body").html("");
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            alert("We got a barcode\n" +
                "Result: " + result.text + "\n" +
                "Format: " + result.format + "\n" +
                "Cancelled: " + result.cancelled);
        },
        function (error) {
            alert("Scanning failed: " + error);
        },
        {
            preferFrontCamera : true, // iOS and Android
            showFlipCameraButton : true, // iOS and Android
            showTorchButton : true, // iOS and Android
            torchOn: true, // Android, launch with the torch switched on (if available)
            prompt : "Place a barcode inside the scan area", // Android
            resultDisplayDuration: 500, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
            formats : "QR_CODE,PDF_417", // default: all but PDF_417 and RSS_EXPANDED
            orientation : "landscape", // Android only (portrait|landscape), default unset so it rotates with the device
            disableAnimations : true, // iOS
            disableSuccessBeep: false // iOS
        }
    );
}
function btn0(){
	scroll = [0,0];
	loadTwitter();
}
function btn1(){
	scroll = [0,0];
	loadDaysList();
}

function btn2(){
	scroll = [0,0];
	loadScan();
}

function btn3(){
	scroll = [0,0];
	loadArtistsList();
}

function btn4(){
	scroll = [0,0];
	loadMap();
}

function handleOpenURL(url) {
    setTimeout(function() {
               alert(url);
        var param = url.replace(localVar.protocol,"").split("#");
        switch (param[0]) {
            case "loadTwitter" :
            case "loadDaysList" :
            case "loadArtistsList" :
            case "loadScan" :
            case "loadMap" :
                eval(param[0]+"()");
                break;
            case "loadArtist" :
               var artistA = param[1].split("/");
               if (artistA[2]== localVar.permalink) {
                    loadArtist({data:{login: artistA[4]}}); //lpm://loadArtist#/editions/2017-amsterdam/artists/20billioneyes/
               }
               break;
            case "loadDailyList" :
               event.data.day = param[1]; //lpm://loadDailyList#2017-05-18
               loadDailyList({data:{day: param[1]}});
               break;
            case "loadPerf" :
               var artistA = param[1].split("/");
               if (artistA[2]== localVar.permalink) {
                    loadPerf({data:{permalink: param[1].split("/artists")[1]}});  //lpm://loadPerf#/editions/2017-amsterdam/artists/lpm-team/performances/lpm-2017-amsterdam-kick-off/
               }
               
               break;
            default :
                break;
        }
        //alert("received url: " + param[0] + "/" + param[1]);
    }, 0);
}


function setActive (id) {
	$("#loadTwitter").removeClass('active');
	$("#loadDaysList").removeClass('active');
	$("#loadScan").removeClass('active');
	$("#loadArtistsList").removeClass('active');
	$("#loadMap").removeClass('active');
	$("#"+id).addClass('active');
}
function loadMap () {
	setActive("loadMap");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var embed = document.createElement('embed');
	embed.setAttribute('style', 'width: 100%; height: 100%;');
	embed.setAttribute('type', 'image/svg+xml');
	embed.setAttribute('src', "img/venue.svg");
	$(".content").html("");
	$(".content").append(embed);

	var eventsHandler;
	
	eventsHandler = {
		haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
		init: function(options) {
			var instance = options.instance
				, initialScale = 1
				, pannedX = 0
				, pannedY = 0
	
			// Init Hammer
			// Listen only for pointer and touch events
			this.hammer = Hammer(options.svgElement, {
				inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
			})
	
			// Enable pinch
			this.hammer.get('pinch').set({enable: true})
	
			// Handle double tap
			this.hammer.on('doubletap', function(ev){
				instance.zoomIn()
			})
	
			// Handle pan
			this.hammer.on('panstart panmove', function(ev){
				// On pan start reset panned variables
				if (ev.type === 'panstart') {
					pannedX = 0
					pannedY = 0
				}
	
				// Pan only the difference
				instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
				pannedX = ev.deltaX
				pannedY = ev.deltaY
			})
	
			// Handle pinch
			this.hammer.on('pinchstart pinchmove', function(ev){
				// On pinch start remember initial zoom
				if (ev.type === 'pinchstart') {
					initialScale = instance.getZoom()
					instance.zoom(initialScale * ev.scale)
				}
	
				instance.zoom(initialScale * ev.scale)
	
			})
	
			// Prevent moving the page on some devices when panning over SVG
			options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
		},
		destroy: function(){
			this.hammer.destroy()
		}
	}
	
	lastEventListener = function(){
		var panZoom = window.panZoom = svgPanZoom(embed, {
			zoomEnabled: true,
			controlIconsEnabled: true,
			fit: 1,
			center: 1,
			customEventsHandler: eventsHandler
		});

		$(window).resize(function(){
			panZoom.resize();
			panZoom.fit();
			panZoom.center();
		})
		if (back.length<2 || back[back.length-1].fnz != "loadMap") back.push({fnz:"loadMap",params:null});
		$("header .icon-left-nav").show();
	}
	embed.addEventListener('load', lastEventListener);
}

function loadTwitter () {
	setActive("loadTwitter");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	fetchRemoteFile('http://m.liveperformersmeeting.net/latest-tweets-php-o-auth/', writeTwitter);
	if (back.length<2 || back[back.length-1].fnz != "loadTwitter") back.push({fnz:"loadTwitter",params:null});
	$("header .icon-left-nav").show();
	$(".content").scrollTop(0);
}

function writeTwitter (remoteFile) {
	var content = "<ul class=\"table-view\">";
	for(var tweet in remoteFile){
		content+= "<li class=\"table-view-cell media twitter-feed\">";
		content+= "<img class=\"media-object pull-left\" src=\"img/icon-40.png\">";
		content+= "<div class=\"media-body\">";
		content+= "<p>"+formatDate(remoteFile[tweet].created_at, "full")+"</p>";
		content+= ""+remoteFile[tweet].text.split("https://t.co")[0]+"";
		if (typeof remoteFile[tweet].entities.urls !== 'undefined' && remoteFile[tweet].entities.urls.length && remoteFile[tweet].entities.urls[0].expanded_url) {
			content+= "<p><a href=\""+remoteFile[tweet].entities.urls[0].expanded_url+"\" target=\"blank\">"+remoteFile[tweet].entities.urls[0].display_url+"</a></p>";
		}
		if (typeof remoteFile[tweet].entities.media !== 'undefined' && remoteFile[tweet].entities.media.length && remoteFile[tweet].entities.media[0].media_url) {
			content+= "<p><img class=\"img-responsive\" src=\""+remoteFile[tweet].entities.media[0].media_url+"\" /></p>";
		}
		content+= "</div>";
		content+= "</li>";
	}
	content+= "</ul>";
	$(".content").html(content);
}

function loadArtistsList(){
	setActive("loadArtistsList");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var artists = [];
	for (day in app.dataCnt.edition.performances) {
		for (perf in app.dataCnt.edition.performances[day]) {
			var p = app.dataCnt.edition.performances[day][perf];
			for (performer in p.performers) {
				artists[p.performers[performer].login] = p.performers[performer];
			}
		}
	}
	var artistsDef = [];
	for (artist in artists) {
		artistsDef.push(artists[artist]);
	}
	artistsDef.sort(sortAZ);
	var content = "<ul class=\"table-view\">";
	content+= "<li class=\"table-view-cell table-view-divider\">A - Z</li>";
	for (artist in artistsDef) {
		content+= writeArtistListItem(artistsDef[artist]);
	}
	content+= "</ul>";
	$(".content").html(content);
	for (artist in artists)
		$("#"+artists[artist].login).bind('click', {login:artists[artist].login}, loadArtist);
	if (back.length<2 || back[back.length-1].fnz != "loadArtistsList") back.push({fnz:"loadArtistsList",params:null});
	$("header .icon-left-nav").show();
	$(".content" ).on( "scroll", function() {
		scroll = $(".content").scrollTop();
	});
};

function loadArtist(event){
    $(".content" ).off( "scroll");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	//if (!login) var login = this.getAttribute("data-src");
	var login = event.data.login;
	var performances = [];
	var artist;
	for (day in app.dataCnt.edition.performances) {
		for (perf in app.dataCnt.edition.performances[day]) {
			for (performer in app.dataCnt.edition.performances[day][perf].performers) {
				if (login == app.dataCnt.edition.performances[day][perf].performers[performer].login) {
					artist = app.dataCnt.edition.performances[day][perf].performers[performer];
					performances[app.dataCnt.edition.performances[day][perf].permalink] = app.dataCnt.edition.performances[day][perf];
				}
			}
		}
	}
	var countries = [];
	for (var l in artist.locations) {
		if (countries.indexOf(artist.locations[l].country)===-1) countries.push(artist.locations[l].country);
	}
	countries.sort();
	var content = "";
    if (app.networkState != "No network connection") {
        content+= "<div class=\"header-image\">";
        content+= "<img class=\"img-responsive\" src=\"https://flxer.net"+artist.avatar.replace("90x68",localVar.formatfolder)+"\" alt=\""+artist.nomearte+"\" />";
        content+= "</div>";
        content+= "<style>";
        content+= ".header-image {";
        content+= "    background-image: linear-gradient(rgba(255,255,255,.6),rgba(255,255,255,.6)), url('https://flxer.net"+artist.avatar.replace("90x68",localVar.formatfolder)+"');";
        content+= "}";
        content+= "</style>";        
    }
    content+= "<div class=\"content-padded\">";
	content+= "<h1>"+artist.nomearte+"</h1>";
    content+= "<p><span class=\"icon icon-earth icon-small\"></span> "+countries.join(", ")+"</p>";
	content+= "<p><span class=\"icon icon-link icon-small\"></span> <a href=\"https://flxer.net/"+artist.login+"/\">flxer.net/"+artist.login+"</a></p>";
	if (artist.websites) {
		//content+= "<ul>";
		for (var l in artist.websites) {
			content+= "<p><span class=\"icon icon-link icon-small\"></span> <a href=\""+artist.websites[l].url+"\">"+artist.websites[l].txt+"</a></p>";
		}
		//content+= "</ul>";
	}
	content+= "<p>"+makeTextPlainToRich(artist.testo.en)+"</p>";
	content+= "</div>";
	content+= "<ul class=\"table-view\" data-back=\"\">";
	content+= "<li class=\"table-view-cell table-view-divider\">Performances</li>";
	for (perf in performances) {
		content+= writePerfListItem(performances[perf]);
	}
	content+= "</ul>";
	$(".content").html(content);
	for (perf in performances)
		$("#"+performances[perf].permalink).bind('click', {permalink:"/"+performances[perf].performers[0].login+"/performance/"+performances[perf].permalink+"/"}, loadPerf);
	if (back.length<2 || back[back.length-1].fnz != "loadArtist") back.push({fnz:"loadArtist",params:event});
	$("header .icon-left-nav").show();
	$(".content").scrollTop(0);
};

function loadNowList(){
	setActive("loadNowList");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var now = new Date();
	var day = now.getFullYear()+"-"+(now.getMonth() < 9 ? "0"+(now.getMonth()+1) : now.getMonth()+1)+"-"+now.getDate();
	var content = "<ul class=\"table-view\">";
	content+= "<li class=\"table-view-cell table-view-divider\">"+formatDate(now, "full")+"</li>";
	var lista = "";
	for (perf in app.dataCnt.edition.performances[day]) {
		var perfTime = new Date(day.split("-")[0],day.split("-")[1]-1,day.split("-")[2],app.dataCnt.edition.performances[day][perf].data_i.split(" ")[1].split(":")[0],app.dataCnt.edition.performances[day][perf].data_i.split(" ")[1].split(":")[1]);
		if (perfTime-now > -900000 && perfTime-now < 7200000) {
			lista+= writePerfListItem(app.dataCnt.edition.performances[day][perf]);
		}
	}
	var availabledays = [];
	for (var d in app.dataCnt.edition.performances) {
		if (d != "tobeconfirmed") availabledays.push(d);
	}
	if (lista == "") {
		if (typeof app.dataCnt.edition.performances[day]==='undefined') {
			if (new Date(day) > new Date(availabledays[availabledays.length-1])) {
				lista+= "<li class=\"table-view-cell\"><b>"+app.dataCnt.edition.titolo+"</b> closed the <b>"+formatDate(availabledays[0], "notime")+"</b>. See you at the next edition!!!</li>";
			} else {
				lista+= "<li class=\"table-view-cell\"><b>"+app.dataCnt.edition.titolo+"</b> will start the <b>"+formatDate(availabledays[0], "notime")+"</b>. See you soon!!!</li>";
			}
		} else {
			lista+= "<li class=\"table-view-cell\">No ongoing from 15 minutes activities and nothing scheduled in the next 2 hours</li>";
		}
	}
	content+= lista;
	content+= "</ul>";
	
	$(".content").html(content);
	for (perf in app.dataCnt.edition.performances[day]) 
		$("#"+app.dataCnt.edition.performances[day][perf].permalink).bind('click', {permalink:"/"+app.dataCnt.edition.performances[day][perf].performers[0].login+"/performance/"+app.dataCnt.edition.performances[day][perf].permalink+"/"}, loadPerf);
	if (back.length<2 || back[back.length-1].fnz != "loadNowList") back.push({fnz:"loadNowList",params:null});
	$("header .icon-left-nav").show();
};

function loadDaysList(){
	setActive("loadDaysList");
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var content = "<ul class=\"table-view\">";
	content+= "<li class=\"table-view-cell table-view-divider\">Programme <small>Last update "+formatDate(app.dataCnt.lastUpdate, "full")+".</small> <small>Press <span class=\"icon icon-refresh icon-small\"></span> to update.</small></li>";
	content+= "</ul>";
	for (day in app.dataCnt.edition.performances) {
		if (day != "tobeconfirmed") {
			content+= "	<div class=\"content-padded\">";
			content+= "		<button class=\"btn btn-primary btn-block\" id=\""+day+"\">"+formatDate(day, "notime")+"</button>";
			content+= "	</div>";
		}
	}
    content+= "	<div class=\"content-padded\">";
    content+= "		<button class=\"btn btn-negative btn-block\" id=\"loadNowList\">NOW</button>";
    content+= "	</div>";
	
	$(".content").html(content);
	for (day in app.dataCnt.edition.performances) 
		$("#"+day).bind('click', {day:day}, loadDailyList);
    $("#loadNowList").bind('click', loadNowList);
	if (back.length<2 || back[back.length-1].fnz != "loadDaysList") back.push({fnz:"loadDaysList",params:null});
	if (back.length>1) $("header .icon-left-nav").show();
	scroll = 0;
	$(".content").scrollTop(0);
}

function loadDailyList(event){
    $(".content").scrollTop(scroll);
	$(".content" ).on( "scroll", function() {
		scroll = $(".content").scrollTop();
	});
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var d = event.data.day;
	var content = "<ul class=\"table-view\" data-back=\""+d+"\">";
	content+= "<li class=\"table-view-cell table-view-divider\">"+formatDate(d, "notime")+"</li>";
	for (day in app.dataCnt.edition.performances) {
		if (day == d) {
			for (perf in app.dataCnt.edition.performances[day]) {
				content+= writePerfListItem(app.dataCnt.edition.performances[day][perf]);
			}
		}
	}
	content+= "</ul>";
	
	$(".content").html(content);
	for (day in app.dataCnt.edition.performances) 
		if (day == d) 
			for (perf in app.dataCnt.edition.performances[day]) 
				$("#"+app.dataCnt.edition.performances[day][perf].permalink).bind('click', {permalink:"/"+app.dataCnt.edition.performances[day][perf].performers[0].login+"/performance/"+app.dataCnt.edition.performances[day][perf].permalink+"/"}, loadPerf);
	if (back.length<2 || back[back.length-1].fnz != "loadDailyList") back.push({fnz:"loadDailyList",params:event});
	$("header .icon-left-nav").show();
}
function loadPerf(event){
    $(".content" ).off( "scroll");
	$(".content").scrollTop(0);
	$(".content").html("<div class=\"content-padded\">Loading data...</div>");
	var permalink = event.data.permalink;
	var permalinkA = permalink.split("/");
	var content = "";
	var performance = {};
	for (day in app.dataCnt.edition.performances) {
		for (perf in app.dataCnt.edition.performances[day]) {
			if (permalinkA[3] == app.dataCnt.edition.performances[day][perf].permalink) {
				performance[permalinkA[3]] = app.dataCnt.edition.performances[day][perf];
			}
		}
	}
    if (app.networkState != "No network connection") {
        content+= "<div class=\"header-image\">";
        content+= "<img class=\"img-responsive\" src=\"https://flxer.net"+performance[permalinkA[3]].img_arr.replace("90x68",localVar.formatfolder)+"\" alt=\""+performance[permalinkA[3]].titolo+"\" />";
        content+= "</div>";
        content+= "<style>";
        content+= ".header-image {";
        content+= "    background-image: linear-gradient(rgba(255,255,255,.6),rgba(255,255,255,.6)), url('https://flxer.net"+performance[permalinkA[3]].img_arr.replace("90x68",localVar.formatfolder)+"');";
        content+= "}";
        content+= "</style>";

    }
    content+= "<div class=\"content-padded\">";
	content+= "			<span class=\"superscript\">";
	content+= getSchedule(performance[permalinkA[3]].data_i,performance[permalinkA[3]].data_f);
	content+= "			</span>";
	content+= "			<span class=\"superscript\">";
	content+= "				<span class=\"badge\">"+performance[permalinkA[3]].typeStr+"</span>";
	content+= "				<span><span class=\"icon icon-location icon-small\"></span> "+(performance[permalinkA[3]].room ? performance[permalinkA[3]].room.replace(" Lectures","") : "TBA")+"</span>";
	content+= "			</span>";
	content+= "			<h1 class=\"title-list\">"+performance[permalinkA[3]].titolo+"</h1>";
	//content+= "<h1>"+performance[permalinkA[3]].titolo+"</h1>";
	//content+= "<p>"+performance[permalinkA[3]].typeStr+"</p>";
	content+= "<p>"+makeTextPlainToRich(performance[permalinkA[3]].testo.en)+"</p>";
	//content+= "<p>Room: "+performance[permalinkA[3]].room+""+(" | "+formatDate(performance[permalinkA[3]].data_i, "full"))+"</p>";
	content+= "</div>";
	for (var gallery in performance[permalinkA[3]].gallery) {
        if (performance[permalinkA[3]].gallery[gallery].gallery_dett.length) {
            for (var gallery_dett in performance[permalinkA[3]].gallery[gallery].gallery_dett) {
                if (performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].type=="video") {
                    content+= "<div class=\"gallery-cnt gallery-cnt-video\">";
                    content+= "<a href=\"https://flxer.net/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].folder+"/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].name+"\">";
                    content+= "<img class=\"img-responsive\" src=\"https://flxer.net/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].preview_file+"\" alt=\""+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].titolo+"\" />";
                    content+= "</a>";
                    content+= "</div>";
                }
                if (performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].type=="img") {
                    content+= "<div class=\"gallery-cnt gallery-cnt-video\">";
                    content+= "<a href=\"https://flxer.net/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].folder+"/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].name+"\">";
                    content+= "<img class=\"img-responsive\" src=\"https://flxer.net/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].folder+"/"+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].name+"\" alt=\""+performance[permalinkA[3]].gallery[gallery].gallery_dett[gallery_dett].titolo+"\" />";
                    content+= "</a>";
                    content+= "</div>";
                }
            }
        }
	}
	for (var performer in performance[permalinkA[3]].performers) {
		content+= "<ul class=\"table-view\">";
		content+= "<li class=\"table-view-cell table-view-divider\">Authors</li>";
		for (artist in performance[permalinkA[3]].performers) {
			content+= writeArtistListItem(performance[permalinkA[3]].performers[artist]);
		}
		content+= "</ul>";
	}
	$(".content").html(content);
	for (performer in performance[permalinkA[3]].performers) 
		for (artist in performance[permalinkA[3]].performers) 
			$("#"+performance[permalinkA[3]].performers[artist].login).bind('click', {login:performance[permalinkA[3]].performers[artist].login}, loadArtist);
	if (back.length<2 || back[back.length-1].fnz != "loadPerf") back.push({fnz:"loadPerf",params:event});
	$("header .icon-left-nav").show();
};
function writeArtistListItem(p){
	var content = "";
	content+= "	<li class=\"table-view-cell\">";
	content+= "		<a class=\"navigate-right\" id=\""+p.login+"\">";
	content+= "			<h4 class=\"title-list\"><span class=\"icon "+(p.is_crew ? "icon-users" : "icon-user")+"\"></span> "+p.nomearte+"</h4>";
	var countries = [];
	for (var l in p.locations) {
		if (countries.indexOf(p.locations[l].country)===-1) countries.push(p.locations[l].country);
	}
	countries.sort();
	content+= "<p>"+countries.join(", ")+"</p>";
	content+= "</a>";
	content+= "	</li>";
	return content;
};
function getSchedule(i,f){
	var str = "";
	var data_i = new Date(i.split(" ")[0]);
	var data_f = new Date(f.split(" ")[0]);
	var ora_i = i.split(" ")[1].substring(0, 5);
	var ora_f = f.split(" ")[1].substring(0, 5);
	var days = (((((data_f-data_i)/1000)/60)/60)/24)+1;
	if (data_i == data_f) {
		str+= "				<p><span class=\"badge badge-primary\">"+ora_i+" > "+ora_f+"</span> "+formatDate(data_i, "notime")+"</p>";
	} else {
		for (var a=0;a<days;a++) {
			var tmpDate = new Date();
			tmpDate.setDate(data_i.getDate() + a);
			str+= "				<p><span class=\"badge badge-primary\">"+ora_i+" > "+ora_f+"</span> "+formatDate(tmpDate, "notime")+"</p>";
		}
	}
	return str;
}
function writePerfListItem(p){
	var content = "";
	content+= "	<li class=\"table-view-cell\">";
	content+= "		<a class=\"navigate-right\" data-src=\"/"+p.performers[0].login+"/performance/"+p.permalink+"/\" id=\""+p.permalink+"\">";
	content+= getSchedule(p.data_i,p.data_f);
	content+= "			<span class=\"superscript\">";
	content+= "				<span class=\"badge\">"+p.typeStr+"</span>";
	content+= "				<span><span class=\"icon icon-location icon-small\"></span> "+(p.room ? p.room.replace(" Lectures","") : "TBA")+"</span>";
	content+= "			</span>";
	content+= "			<h4 class=\"title-list\">"+p.titolo+"</h4>";
	content+= "			";
	for (performer in p.performers) {
		content+= "<p><span class=\"icon "+(p.performers[performer].is_crew ? "icon-users" : "icon-user")+" icon-small\"></span> <b>"+p.performers[performer].nomearte+"</b>";
		var countries = [];
		for (var l in p.performers[performer].locations) {
			if (countries.indexOf(p.performers[performer].locations[l].country)===-1) countries.push(p.performers[performer].locations[l].country);
		}
		countries.sort();
		content+= " ["+countries.join(", ")+"]";
		content+= "</p>";
	}
	//content = content.substring(0, content.length-2);
	//var d = new Date();
	content+= "</a>";
	content+= "	</li>";
	return content;
}
function sortAZ(a, b) {
 var nameA=a.nomearte.toLowerCase(), nameB=b.nomearte.toLowerCase();
 if (nameA < nameB) //sort string ascending
  return -1;
 if (nameA > nameB)
  return 1;
 return 0; //default return value (no sorting)
}
function myBack(){
	window[back[back.length-2].fnz](back[back.length-2].params);
	back.pop();
	back.pop();
	$(".content").scrollTop(scroll);
	if (back.length<2) $("header .icon-left-nav").hide();
};

function formatDate (d, type) {
	var date = typeof d === Date ? d : new Date(d);
	var myDays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
	var myMonths = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var wd = myDays[date.getDay()];
	var month = myMonths[date.getMonth()];
	var h = date.getHours();
	var m = date.getMinutes();
	var str = wd+", "+month+" "+date.getDate()+", "+date.getFullYear();
	if (type == "full") str+= " "+(h<10 ? "0"+h :h)+":"+(m<10 ? "0"+m :m);
	return str;
}

function loadEdition(){
    //preventDefault();
    localVar.remoteFileURL = $(this).data("load");
    localVar.title = $(this).text();
    var popovers = $('.popover');
    $(popovers).removeClass('visible');
    $(popovers).removeClass('active');
    $(popovers).hide();
    $("div.backdrop").remove();
    reloadRemoteFile();
}

function reloadRemoteFile(){
	loadDaysList();
    var remoteFileURL = app.networkState == "No network connection" ? "data/data.json" : localVar.remoteFileURL;
    var remoteFile = fetchRemoteFile(remoteFileURL, startup);
    $(".content").html("<div class=\"content-padded\">Loading data...</div>");
	fetchRemoteFile(remoteFileURL, startup);
}
function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    })
    // or alternatively
    // return text.replace(urlRegex, '<a href="$1">$1</a>')
}
function makeTextPlainToRich(str){
	str=str.replace(/"/gi,'&quot;');
	str=str.replace(/###b###/gi,"<b>");
	str=str.replace(/###\/b###/gi,"</b>");
	//$str=str.replace('((mailto:|(news|(ht|f)tp(s?))://){1}\S+)','<a href="\0" target="_blank">\0</a>');
	//$str = str.replace('/((http(s)?:\/\/)|(www\\.))((\w|\.)+)(\/)?(\S+)?/i','<a href="\0" target="_blank">\0</a>', $str);
	str=str.replace(/\r\n/gi,"<br />");
	str=str.replace(/\n/gi,"<br />");
	//$str=$this->eraseTripleBr($str);
	//$str=htmlspecialchars($str);
	//$str=htmlentities($str);
	return urlify(str);	
}
function fetchRemoteFile(path, callback) {
	var returnValue = null;
	//console.log("Fetching now!");
	$.ajax({
		url: path,
		async: true,
		dataType: "json",
		type: "GET",
		cache: false,
		success: function (response) {
			//console.log("Function: fetchRemoteFile(" + path + "), success.");
			//console.log(response);
			returnValue = response;
			callback(response);
		},
		error: function (request, status, error) {
			console.log('Function: fetchRemoteFile(), error: ');
			console.log(request);
		}

	});

	return returnValue;
}

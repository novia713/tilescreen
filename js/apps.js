'use strict'

/**
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *          .·' H O M E S C R E E N S F O R A L L'·.  by leandro713
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *
 * Tilescreen
 * (c)  [ leandro@leandro.org, sergio.cero@gmail.com ]
 * GPL v3 license
 *
 * @author      leandro713 <leandro@leandro.org>
 * @copyright   leandro713 - 2016
 * @link        https://github.com/novia713/tilescreen
 * @license     http://www.gnu.org/licenses/gpl-3.0.en.html
 * @version     1.5
 * @date        20160202
 *
 * @see         https://github.com/mozilla-b2g/gaia/tree/88c8d6b7c6ab65505c4a221b61c91804bbabf891/apps/homescreen
 * @thanks      to @CodingFree for his tireless support and benevolent friendship
 * @todo
 *      - show wifi network name and telephony provider name
 *      - show missed calls
 *
 */


requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'ramdajs': ['ramda.min'],
        'uitls': "utils",
        'fxos_icons': "../bower_components/fxos-icons/fxos-icons"


    },
    shim: {
        'ramdajs': {  exports: 'R' },
        'utils'  : {  exports: 'U' }
    }
});

require(['ramdajs', 'utils', 'fxos_icons'], ( R, U ) => {

    //CONFIG
    var only_big       = 0;
    var b_transparency = 1; /* 1 = semi-transparent background colors  VS 0 = solid background colors */
    //CONFIG

/*
    const apps_2_exclude = [
        "Downloads", "EmergencyCall", "System", "Legacy", "Ringtones",
        "Legacy Home Screen", "Wallpaper", "Default Theme", "Purchased Media",
        "Built-in Keyboard", "Bluetooth Manager", "Communications",
        "PDF Viewer", "Network Alerts", "WAP Push manager", "Default Home Screen" ];
*/
    const HIDDEN_ROLES = [ 'system', 'input', 'homescreen', 'theme', 'addon', 'langpack' ];

    var parent = document.getElementById('apps');
    var iconMap = {};
    var usage = [];
    var smalls = [];
    var i = 0;
    var storage = null;
    var date = new Date();
    var width_1_col = 0;
    var width_2_col = 0;
    var width_4_col = 0;
    var gugle_key = "AIzaSyDg0goaIJCowkjfO0Px7IhLTRWWO-aAtS0";

    /**
     * Prints set up message
     */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
            parent.innerHTML = txt_msg;
     };

     var build_setup_tile = function() {

        var oldtile = document.getElementById("setup-tile");
        if ( oldtile )
            parent.removeChild( oldtile );

        var tile       = document.createElement('div');
        tile.id        = 'setup-tile';
        tile.className = 'tile';
        tile.innerHTML = "<span id='setup-tile-location' class='location'></span>";

        /* tile background */
            var tile_bg = document.createElement('div');
            tile_bg.className = 'tile_bg';
            tile.appendChild(tile_bg);

        /* battery level */
            var battery = navigator.battery;
            if (battery) {
                var batterylevel = Math.round(battery.level * 100) + "%";
                var batterylevel_10 = Math.round(battery.level * 10) + "%";
                if (batterylevel_10 > 10) batterylevel_10 = 10;
                tile.innerHTML += "<i data-icon='battery-"+batterylevel_10+"' data-l10n-id='battery-"+batterylevel_10+"' style='display:inline-block;line-height:0.8em;' class='battery'> "
                                    + batterylevel + "</i>";
            }

        /* date */
            tile.innerHTML += "<div id='worded'><span class='weekday'>"+ U.get_worded_day( U.get_numeric_day( date )) + "</span>"
                            + " <span class='monthday'>" + date.getDate() + "</span></div>";

        //TODO: refactor all this in aux
        function successGeoLoc(pos) {
              /*
               * show here info weather based on geoloc data
               * http://api.yr.no/weatherapi/locationforecast/1.9/documentation#schema
               * http://api.yr.no/weatherapi/weathericon/1.1/documentation
               * -------------------------------------------
               */
                var weather_info = U.ajax("http://api.yr.no/weatherapi/locationforecast/1.9/?lat="+ pos.coords.latitude +";lon=" + pos.coords.longitude, "weather");
                document.getElementById("setup-tile").innerHTML += "<div id='weather-info'></div>";

                // city name
                U.ajax( 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+pos.coords.latitude+','+pos.coords.longitude+'&sensor=true&key='+ gugle_key, "city" );
        };

        function errorGeoLoc(err) {
          console.warn('ERROR (' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(successGeoLoc, errorGeoLoc, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });


        parent.insertBefore(tile, parent.children[1]);
     };

    /**
     * Renders the icon to the container.
     */
    var render = icon => {

            // guards
            if (!icon.manifest.icons) return;
            if ( R.contains ( icon.manifest.role, HIDDEN_ROLES ))  return;
            //end guards

            if ( U.is_small( i, R, smalls ) > -1 ) {
                var icon_image = navigator.mozApps.mgmt.getIcon(icon, 32);
            }else{
                var icon_image = navigator.mozApps.mgmt.getIcon(icon, 60);
            }

            icon_image.then ( img => {

                var name = icon.manifest.name;

                // end callscreen
                var wordname = name.split(" ");
                var firstchar = name.charAt(0);

                /* tile generation*/
                var tile = document.createElement('div');
                tile.className = 'tile';

                    /* tile icon */
                    var tile_ic = document.createElement('div');
                    tile_ic.className = 'tile_ic';
                    tile_ic.style.background = 'transparent url(' + window.URL.createObjectURL( img ) + ') no-repeat';

                    // Callscreen icon [ doing things like this is cheese ]
                    if (name == "Communications") { //should be Callscreen
                        tile_ic.style.background = 'transparent url(/img/dialer-icon.png) no-repeat';
                    }

                    tile_ic.setAttribute('rel', wordname[0]);
                    tile_ic.id = wordname[0];

                    tile.appendChild(tile_ic);

                    /* tile background */
                    var tile_bg = document.createElement('div');
                    tile_bg.className = 'tile_bg';
                    tile_bg.style.backgroundColor = U.get_color(name);

                    tile.appendChild(tile_bg);

                document.getElementById('apps').appendChild(tile);

                /* we associate the tile_ic to the firefox OS icon, because the tile_ic is who get the 'click' event, not the tile container */
                iconMap[wordname[0]] = icon;

                /* end tile generation*/

                // array for storing it in JSON for using records
                var item = { "label": wordname[0], "index": i, "order": 0 };
                storage = localStorage.getItem("storage");

                if ( !storage ) {
                    storage = [];
                    storage[i] = item;
                    localStorage.setItem( "storage", JSON.stringify( storage ));
                } else  {
                    var data = JSON.parse(storage);
                    data[i] =  item;
                    localStorage.setItem( "storage", JSON.stringify( data ));
                }


                ++i;

                if ( U.is_small( i, R, smalls ) > -1 )  {
                    tile.classList.add("small");
                }


                // initial dock
                if (4 == i || 3 == i || 2 == i || 9 == i){
                    var firsts_dock = tile.cloneNode(true);
                    firsts_dock.className  = "tile small in-dock";
                    document.getElementById("dock").appendChild(firsts_dock);
                }

                //end initial dock

            });

            if (typeof icon_image == undefined) return;
    }

    /* fires up the painting */
    var start = () => {

        i = 0;

        /* https://developer.mozilla.org/en-US/docs/Web/API/Element/classList */

        /* empty #apps and add #dock */
        parent.innerHTML = '';
            var dock = document.createElement('div');
            dock.id = 'dock';
            apps.appendChild(dock);

        /* transparency mode */
        parent.classList.remove('transparent');
        if (b_transparency == 1){
            apps.classList.add('transparent');
        }


        if (only_big != 1) {
            smalls = [ 2, 3 ,4 ,5, 7, 8 ,9 ,10, 15, 16, 17, 18 ];
        } else {
            smalls = [];
        }

            /**
             * Fetch all apps and render them.
             */
            var myApps = new Promise((resolve, reject) => {
                    var request = navigator.mozApps.mgmt.getAll();

                    request.onsuccess = (e) => {

                      build_setup_tile();

                      // hic sunt render leones
                      R.forEach( render, request.result );

                    };

                    request.onerror = (e) => {
                      console.error('Error calling getAll: ' + request.error.name);
                      resolve();
                    };
            });

            myApps.then(
                v => {

                }, v => {
                    print_msg();
                }
            );


            U.add_initial_styles();

    } //end start

    window.addEventListener('devicelight', ev => {
        //console.log(ev.value);
    });

    /* === show the list with all installed apps for specify a new one for this tile === */
    window.addEventListener('contextmenu', ev => {
        var tile_rel = ev.originalTarget.getAttribute('rel');
        U.show_select_app();
    });

    /* === the processement of the click is taken after 500 milliseconds after the click, for give time to CSS transition === */
    window.addEventListener('click', ev => {
        setTimeout(function(){
            event_click(ev);
        }, 500);}

    );

    var event_click = ev => {

        var this_tile = ev.originalTarget;
        var rel = this_tile.getAttribute('rel');

        if ( typeof storage == "string" ) storage = JSON.parse( storage );

        if (iconMap[rel]){

            var i = iconMap[rel];
            var index     =  R.filter( R.propEq("label", rel ), storage )[0].index;

            // we add 1 to value of that icon in localStorage ...
            storage[index].order +=1;
            localStorage.setItem( "storage", JSON.stringify( storage ));


            // transpose storage value to DOM elements
            this_tile.dataset.order = storage[index].order;


            // Callscreen, so dirty :S
            /*
             * after 1 feb 2016 Callscreen well be decoupled, so this will not be neccessary no more :)
             *
             */
            var entry = null; ;
            if ( i.manifest.name == "Communications" && i.manifest.entry_points )
                entry = "dialer";
            //TODO; handle launch contacts

            i.launch(entry);
            U.print_dock( R, iconMap, document );
        }


        // options

        switch( this_tile.id ) {
            case "worded":
            case "setup-tile":
                U.show_options(b_transparency, only_big);
                break;
            case "hide_trans":
                b_transparency = 0;
                start();
                break;
            case "set_trans":
                b_transparency = 1;
                start();
                break;
            case "only_big":
                only_big = 1;
                start();
                break;
            case "show_small":
                only_big = 0;
                start();
                break;
        }


        /* if clicked the empty space of the options tile */
        if (this_tile.classList.contains("options")) {
            build_setup_tile();
        }

        // end options


        // button close → onclick() is not allowed by CSP FirefoxOS policy
        if ( this_tile.classList[0] == "x_close_bt") {
            U.close_select_app();
        }

    }; //end window event 'click', document.getElementsByClassName('tile'));


    var removeSmall = function (el) {
        el.classList.remove("small");
    }

    var addSmall = function (el) {
        el.classList.add("small");
    }

    // 3, 2, 1 ...
    start();
    U.call_setup_tile_every_full_hour();
/*
console.log("hola");
console.log(  navigator.mozWifiManager.connection  );
if (navigator.mozWifiManager.connection.status == "connected"){
    var network_name = navigator.mozWifiManager.connection.network.ssid;
    console.log(network_name);
}
*/
});

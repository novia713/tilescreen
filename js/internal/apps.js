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
 * @version     1.6
 * @date        20160203
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
        'ramdajs'   : ['external/ramda.min'],
        'utils'     : ['internal/utils'],
        'config'    : ['internal/config'],
        'fxos_icons': "../bower_components/fxos-icons/fxos-icons"


    },
    shim: {
        'ramdajs': {  exports: 'R' },
        'config' : {  exports: 'C' },
        'utils'  : {  exports: 'U' }
    }
});

require(['ramdajs', 'utils', 'config', 'fxos_icons'], ( R, U, C ) => {

    var i = 0;

    /**
    Prints set up message
    @private
    @method print_msg
    @return {String} a div indicating to select this homescreen as default
    */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
            C.mosaic.innerHTML = txt_msg;
     };


        /**
        Builds the setup-tile
        @private
        @method build_setup_tile
        @return {String} a div with location and date info
        */
     var build_setup_tile = () => {

        var oldtile = document.getElementById("setup-tile");
        if ( oldtile )
            C.mosaic.removeChild( oldtile );

        var tile       = document.createElement('div');
        tile.id        = 'setup-tile';
        tile.className = 'tile';
        tile.innerHTML = "<span id='setup-tile-location' class='location'></span>";

        /* tile background */
            var tile_bg = document.createElement('div');
            tile_bg.className = 'tile_bg';
            tile.appendChild(tile_bg);

        /* settings link */
            tile.innerHTML += "<div id='settings_bt' data-icon='settings' data-l10n-id='settings' class='settings'></div>";

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
            tile.innerHTML += "<div id='worded'><span class='weekday'>"+ U.get_worded_day( U.get_numeric_day( C.date )) + "</span>"
                            + " <span class='monthday'>" + C.date.getDate() + "</span></div>";

        //TODO: refactor all this in aux
        function successGeoLoc(pos) {

              /**
               * show here info weather based on geoloc data
               * http://api.yr.no/weatherapi/locationforecast/1.9/documentation#schema
               * http://api.yr.no/weatherapi/weathericon/1.1/documentation
               * -------------------------------------------
               */
                var weather_info = U.ajax("http://api.yr.no/weatherapi/locationforecast/1.9/?lat="+ pos.coords.latitude +";lon=" + pos.coords.longitude, "weather");
                document.getElementById("setup-tile").innerHTML += "<div id='weather-info'></div>";

                // city name
                U.ajax( 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+pos.coords.latitude+','+pos.coords.longitude+'&sensor=true&key='+ C.gugle_key, "city" );
        };

        function errorGeoLoc(err) {
          console.warn('ERROR (' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(successGeoLoc, errorGeoLoc, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });


        C.mosaic.insertBefore(tile, C.mosaic.children[1]);

        // /**************
        // * recursivity *
        // **************/
        //
        // CAUTION: this inhabilites the console in the WebIDE
        // for debugging this app, please comment out this setTimeout()

        window.setTimeout(function(){
            build_setup_tile();
            }, C.TS_UPD_SETUP_TILE);
     };

    /**
     * Renders the icon to the container.
     */
    var render = icon => {

            // guards
            if (!icon.manifest.icons) return;
            if ( R.contains ( icon.manifest.role, C.HIDDEN_ROLES ))  return;
            //end guards

            if ( U.is_small( i, R, C.smalls ) > -1 ) {
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
                tile.id = 'tile_'+i;
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
                C.iconMap[wordname[0]] = icon;

                /* end tile generation*/

                // array for storing it in JSON for using records
                var item = { "label": wordname[0], "index": i, "order": 0 };
                C.storage = localStorage.getItem("storage");

                if ( !C.storage ) {
                    C.storage = [];
                    C.storage[i] = item;
                    localStorage.setItem( "storage", JSON.stringify( C.storage ));
                } else  {
                    var data = JSON.parse( C.storage );
                    data[i] =  item;
                    localStorage.setItem( "storage", JSON.stringify( data ));
                }


                ++i;

                if ( U.is_small( i, R, C.smalls ) > -1 )  {
                    tile.classList.add("small");
                }


                // initial dock
                if (4 == i || 3 == i || 2 == i || 9 == i){
                    var firsts_dock = tile.cloneNode(true);
                    firsts_dock.className  = "tile small in-dock";
                    firsts_dock.children[0].classList.add( "docker" );
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
        C.mosaic.innerHTML = '';
            var dock = document.createElement('div');
            dock.id = 'dock';
            apps.appendChild(dock);

        /* transparency mode */
        C.mosaic.classList.remove('transparent');
        if ( C.b_transparency == 1 ){
            apps.classList.add('transparent');
        }


        if ( C.only_big != 1 ) {
            C.smalls = [ 2, 3 ,4 ,5, 7, 8 ,9 ,10, 15, 16, 17, 18 ];
        } else {
            C.smalls = [];
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

    // TODO: addEventListener install/uninstall //untested!

        C.appMgr.addEventListener("install", function (event) {
            console.log(event.application);
            setTimeout (function() {
                start();
            }, 2000);
        });
        C.appMgr.addEventListener("uninstall", function (event) {
            console.log(event.application);
            start();
        });

    window.addEventListener('devicelight', ev => {
        //console.log(ev.value);
    });

    /* === show the list with all installed apps for specify a new one for this tile === */
    window.addEventListener('contextmenu', ev => {

        var tile_ic = ev.originalTarget;

        // settings popup only opens for not docked items
        if ( R.contains("docker")(tile_ic.classList) == false && tile_ic.parentNode.parentNode.id == 'apps') {
                /*ev.preventDefault();*/
                C.last_longpress = Date.now();
                U.show_tile_settings(tile_ic.parentNode, R, C.HIDDEN_ROLES);
        }
    });

    /* === the processement of the click is taken after 500 milliseconds after the click, for give time to CSS transition === */
    window.addEventListener('click', ev => {

        /* avoid to follow a click if it's very close to the last longpress event */
        if ( Date.now() - C.last_longpress < 2000 ) return;

        setTimeout(function(){
            event_click(ev);
        }, 500);}

    );

    var event_click = ev => {

        var this_tile = ev.originalTarget;
        var parent = this_tile.parentNode;

        /* uninstall */
        if (ev.id = "btn_uninstall"){
            if ( this_tile.getAttribute("app_to_uninstall") ) {
                // TODO: check if it is removable!!
                console.log(this_tile);
                // https://developer.mozilla.org/en-US/Apps/Build/JavaScript_API/navigator.mozApps.mgmt.uninstall
                C.appMgr.uninstall(this_tile);
            }
        }

        /* if clicked an app tile (tile_ic) -most of cases- */
        if (this_tile.classList.contains("tile_ic")){
            return U.launch_app(ev, R);
        }

        /* if clicked the empty space of the options tile */
        else if (this_tile.classList.contains("options") || parent.classList.contains("options")) {
            /*U.destroy_elementById('options');*/
            alert('options close');
            build_setup_tile();
        }

        /* if clicked any child of the setup-tile */
        else if (parent.id == 'setup-tile') {
            return U.show_app_settings( C.b_transparency, C.only_big );
        }

        // button close → onclick() is not allowed by CSP FirefoxOS policy
        else if ( this_tile.classList.contains("close_bt")) {
            U.destroy_elementById('popup');
        }

        // button close → onclick() is not allowed by CSP FirefoxOS policy
        else if ( this_tile.classList.contains("save_bt")) {
            C.b_transparency = document.getElementById('input_b_transparency').checked ? 1 : 0;
            C.only_big = document.getElementById('input_only_big').checked ? 1 : 0;
            start();
            U.destroy_elementById('popup');
        }

        /* if clicked a <li> element at tile_settings (so the originalTarget is not a tile, but a <li> element) */
        else if (this_tile.classList.contains("tile_settings_li")) {
            return U.set_tile_app(this_tile, C.iconMap);
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

});

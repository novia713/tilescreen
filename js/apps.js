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
 * @version     1.4.22
 * @date        20160131
 *
 * @see         https://github.com/mozilla-b2g/gaia/tree/88c8d6b7c6ab65505c4a221b61c91804bbabf891/apps/homescreen
 * @thanks      to @CodingFree for his tireless support and benevolent friendship
 * @todo
 *      - order icons by use [done]
 *      - show tile with date data
 *      - show wifi network name and telephony provider name
 *      - show weather
 *      - show missed calls
 *      - default icon if not found
 *
 */


requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'ramdajs': ['ramda.min'],
        'uitls': "utils",
        'tilejs' : "tileJs",
        'fxos_icons': "../bower_components/fxos-icons/fxos-icons"


    },
    shim: {
        'ramdajs': {  exports: 'R' },
        'utils'  : {  exports: 'U' },
        'tilejs' : {  exports: 'Tile' }
    }
});

require(['ramdajs', 'utils', 'tilejs', 'fxos_icons'], ( R, U, Tile ) => {

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
    const HIDDEN_ROLES = [
        'system', 'input', 'homescreen', 'theme', 'addon', 'langpack'
        ];

    var parent = document.getElementById('apps');
    var iconMap = new WeakMap();
    var usage = smalls = [];
    var i = 0;
    var storage = null;
    var date = new Date();

    /**
     * Prints set up message
     */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
            parent.innerHTML = txt_msg;
     };

     var hour_tile = function() {
        var oldtile = document.getElementById("hour_tile");
        if ( oldtile )
            parent.removeChild( oldtile );

        var tile       = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = "";

        var battery = navigator.battery;
        if (battery) {
            var batterylevel = Math.round(battery.level * 100) + "%";
            var batterylevel_10 = Math.round(battery.level * 10) + "%";
            if (batterylevel_10 > 10) batterylevel_10 = 10;
            tile.innerHTML += "<i data-icon='battery-"+batterylevel_10+"' data-l10n-id='battery-"+batterylevel_10+"' style='display:inline-block;line-height:0.8em;' class='battery'> " + batterylevel + "</i>";
        }

        tile.id        = 'hour_tile';
        tile.innerHTML += "<div id='worded'><span class='weekday'>"+ U.get_worded_day( U.get_numeric_day( date )) + "</span> <span class='monthday'>" + date.getDate() + "</span></div>";
        tile.style     = "background-color:orange;";

        //TODO: refactor all this in aux
        function success(pos) {
              /*
               * show here info weather based on geoloc data
               * http://api.yr.no/weatherapi/locationforecast/1.9/documentation#schema
               * http://api.yr.no/weatherapi/weathericon/1.1/documentation
               * -------------------------------------------
               */
                var weather_info =
                        U.ajax("http://api.yr.no/weatherapi/locationforecast/1.9/?lat="+ pos.coords.latitude +";lon=" + pos.coords.longitude);
                document.getElementById("hour_tile").innerHTML
                            // TODO: css this, please
                              += "<span  id='weather-info' style='display:block;position:relative;padding-left:30px;text-align:right;'>"
                              + ""
                              + "</span>";

        };

        function error(err) {
          console.warn('ERROR (' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });


        parent.insertBefore(tile, parent.children[1]);
        Tile( tile );
     };

    /**
     * Renders the icon to the container.
     */
    var render = icon => {

            if (!icon.manifest.icons) return;

            // guards
            if ( R.contains ( icon.manifest.role, HIDDEN_ROLES ))  return;
            //end guards

            if ( U.is_small( i, R, smalls ) > -1 ) {
                var icon_image = navigator.mozApps.mgmt.getIcon(icon, 32);
            }else{
                var icon_image = navigator.mozApps.mgmt.getIcon(icon, 60);
            }


            icon_image.then ( img => {

                var name = icon.manifest.name;

                // Callscreen icon
                /* @FIXME: no funciona bien :(
                 * this app is different, so this icon needs a custom launch url
                 * @todo: refactor this in an outer named function
                 * icon: http://www.iconarchive.com/show/firefox-os-icons-by-vcferreira/dialer-icon.html
                 *
                 */
                //if (name == "Callscreen"){
                //    icon.target ="app://communications.gaiamobile.org/manifest.webapp-dialer";
                //}

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
                    tile_ic.setAttribute('rel', wordname[0]);
                    tile_ic.id = wordname[0];

                    tile.appendChild(tile_ic);

                    /* tile background */
                    var tile_bg = document.createElement('div');
                    tile_bg.className = 'tile_bg';

                    if (b_transparency != 1) {
                        tile_bg.style.backgroundColor = U.get_color(name);
                    }else
                        tile_bg.style.backgroundColor = 'rgba(0,0,0,0.5)';


                    tile.appendChild(tile_bg);

                document.getElementById('apps').appendChild(tile);

                /* we associate the tile_ic to the firefox OS icon, because the tile_ic is who get the 'click' event, not the tile container */
                iconMap.set(tile_ic, icon);

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
                    tile.className += " small";
                    //tile.style.background = U.get_color(name) + ' url(' + window.URL.createObjectURL(  img ) + ') 12% no-repeat';
                }

                Tile( tile );

            });

            if (typeof icon_image == undefined) return;
    }

    /* fires up the painting */
    var start = () => {

        i = 0;

        width_1_col = window.innerWidth; /* not used yet Leandro, it's for the biggest tiles (side to side) */
        width_2_col = (window.innerWidth / 2).toFixed(0) - 8;
        width_4_col = (window.innerWidth / 4).toFixed(0) - 8;

        U.add_style('.tile { width: '  + width_2_col +'px; height: '  + width_2_col +'px; }');
        U.add_style('.small { width: ' + width_4_col +'px!important; height: ' + width_4_col +'px!important}');
        U.add_style('.t_4_1 { width: ' + width_1_col +'px!important; height: ' + width_4_col +'px!important; padding:0px;} .t_4_1 .tile{margin-left:0px;margin-right:8px;}');



        if (b_transparency == 1){
            U.add_style('#apps { background-color: transparent; background-color: rgba(0,0,0,0.1); }');
        }else{
            U.add_style('#apps { background-color: #000;}');
        }

        if (only_big != true)
            smalls = [ 2, 3 ,4 ,5, 7, 8 ,9 ,10, 15, 16, 17, 18 ];

            /**
             * Fetch all apps and render them.
             */
            var myApps = new Promise((resolve, reject) => {
                    var request = navigator.mozApps.mgmt.getAll();

                    request.onsuccess = (e) => {

                      hour_tile();

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

    } //end start

    window.addEventListener('devicelight', ev => {
        //console.log(ev.value);
    });

    window.addEventListener('click', ev => {

        var this_tile = ev.originalTarget;

        if ( typeof storage == "string" ) storage = JSON.parse( storage );
        var i = iconMap.get( ev.target );

        if (i) {

            /*var classname = R.replace("icon_", "", R.split( " ", ev.originalTarget.className)[1]);*/

            var rel       = this_tile.getAttribute('rel');
            var index     =  R.filter( R.propEq("label", rel ), storage )[0].index;

            // we add 1 to value of that icon in localStorage ...
            storage[index].order +=1;
            localStorage.setItem( "storage", JSON.stringify( storage ));


            // transpose storage value to DOM elements
            this_tile.dataset.order = storage[index].order;

            i.launch();
            U.print_dock( R );
        }


        // options
        if (this_tile.id == "worded" || this_tile.id == "hour_tile") {
           U.show_options(b_transparency, only_big);
        }

        if (this_tile.id == "hide_trans") {
            b_transparency = 0;
            start();
        }

        if (this_tile.id == "set_trans") {
            b_transparency = 1;
            start();
        }

        if (this_tile.id == "only_big") {
            only_big = 1;
            R.forEach(removeSmall, document.getElementsByClassName("tile"));
            start();
        }

        if (this_tile.id == "show_small") {
            only_big = 0;
            start();
        }

        // end options

    }); //end window event 'click', document.getElementsByClassName('tile'));


    var removeSmall = function (el) {
        el.classList.remove("small")
    }

    // 3, 2, 1 ...
    start();



});

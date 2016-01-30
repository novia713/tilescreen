/**
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *          .·' H O M E S C R E E N S F O R A L L'·.  by leandro713
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *
 * Tilescreen
 * (c) leandro@leandro.org
 * GPL v3 license
 *
 * @author      leandro713 <leandro@leandro.org>
 * @copyright   leandro713 - 2016
 * @link        https://github.com/novia713/tilescreen
 * @license     http://www.gnu.org/licenses/gpl-3.0.en.html
 * @version     1.4.21
 * @date        20160130
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
        'fxos_icons': "../bower_components/fxos-icons/fxos-icons"
    },
    shim: {
        'ramdajs': {
            exports: 'R'
        }
    }
});

require(['ramdajs', 'fxos_icons'], ( R ) => {
    //CONFIG
    var only_big       = 0;
    var b_transparency = 1; /* 1 = semi-transparent background colors  VS 0 = solid background colors */
    //CONFIG
    const apps_2_exclude = [
        "Downloads", "EmergencyCall", "System", "Legacy", "Ringtones",
        "Legacy Home Screen", "Wallpaper", "Default Theme", "Purchased Media",
        "Built-in Keyboard", "Bluetooth Manager", "Communications",
        "PDF Viewer", "Network Alerts", "WAP Push manager", "Default Home Screen" ];

    var geoptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };


    var smalls = [];
    if (only_big != true)
        smalls = [ 2, 3 ,4 ,5, 7, 8 ,9 ,10, 15, 16, 17, 18 ];

    var parent = document.getElementById('apps');
    var iconMap = new WeakMap();
    var usage = [];
    var i = 0;
    var storage = null;
    var date = new Date();

    /* set initial styles for sizes */
        var add_style = function(css_string){
            var head = document.head || document.getElementsByTagName('head')[0],
                style = document.createElement('style');

            style.type = 'text/css';
            if (style.styleSheet){
              style.styleSheet.cssText = css_string;
            } else {
              style.appendChild(document.createTextNode(css_string));
            }

            head.appendChild(style);
        }
        tile_width_1 = window.innerWidth; /* not used yet Leandro, it's for the biggest tiles (side to side) */
        tile_width_2 = (window.innerWidth / 2).toFixed(0) - 8;
        tile_width_4 = (window.innerWidth / 4).toFixed(0) - 8;

        add_style('.tile { width: '  + tile_width_2 +'px; height: '  + tile_width_2 +'px; }');
        add_style('.small { width: ' + tile_width_4 +'px!important; height: ' + tile_width_4 +'px!important}');

    //colores
    var get_color = app => {
        var obj_color = {};
        obj_color.Communications = "#B2F2FF"; //green 5F9B0A
        obj_color.Calendar    = "#FF4E00"; //orange
        obj_color['E-Mail']   = "#FF4E00"; //orange
        obj_color['FM Radio'] = "#2C393B"; //grey
        obj_color.Camera      = "#00AACC"; //blue
        obj_color.Clock       = "#333333"; //warm grey
        obj_color.Gallery     = "#00AACC"; //blue
        obj_color.Marketplace = "#00AACC"; //blue
        obj_color.Browser     = "#00AACC"; //blue
        obj_color.Messages    = "#5F9B0A"; //green
        obj_color.Video       = "#CD6723"; //brick
        obj_color.Music       = "#CD6723"; //brick
        obj_color.Settings    = "#EAEAE7"; //ivory

        obj_color.Twitter     = "#c0deed";
        obj_color.Facebook    = "#3b5998";

        if (obj_color[app]) {
            return obj_color[app];
        } else {
            //random hex color;

            var letters = 'ABCDE'.split('');
            var color = '#';
            for (var i=0; i<3; i++ ) {
                color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;

        }
    };

    /**
     * Prints set up message
     */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
            parent.innerHTML = txt_msg;
     };

     var is_small = function (pos) {
         return R.indexOf(pos, smalls);
     };


     var get_numeric_day = function() {
        return date.getDay();
     };

     var get_worded_day = function() {
        var weekday = new Array(7);
        weekday[0]=  "SUN";
        weekday[1] = "MON";
        weekday[2] = "TUE";
        weekday[3] = "WED";
        weekday[4] = "THU";
        weekday[5] = "FRI";
        weekday[6] = "SAT";

        return weekday[date.getDay()];
     };

     var show_options = function () {
         document.getElementById("hour_tile").innerHTML = "";
         document.getElementById("hour_tile").innerHTML = (b_transparency == 1)?
            "<div id='hide_trans'>hide transparency</div>" :
            "<div id='set_trans' >set transparency</div>"  ;

     };

     var print_dock = function () {

        var storage = JSON.parse( localStorage.getItem(  "storage"));
        var dock    = document.getElementById("dock");

        var print_tiles_in_minidock =  item  => {
            var div_copy = document.getElementById(item.label).cloneNode(true);
            var container = document.createElement("div");

            container.className  = "tile";
            container.className += "small";
            container.appendChild( div_copy  );
            dock.appendChild(  container  );
        };

        dock.innerHTML = "";
        var sortByUsage = R.sortBy(R.prop("order"));
        R.forEach ( print_tiles_in_minidock, R.take (4,  R.reverse(sortByUsage( storage ))));
     };

     var hour_tile = function() {
        var oldtile = document.getElementById("hour_tile");
        if ( oldtile )
            parent.removeChild(oldtile);
        var tile       = document.createElement('div');
        tile.className = 'tile';
        tile.innerHTML = "";

        var battery = navigator.battery;
        if (battery) {
            var batterylevel = Math.round(battery.level * 100) + "%";
            var batterylevel_10 = Math.round(battery.level * 10) + "%";
            if (batterylevel_10 > 10) batterylevel_10 = 10;
            tile.innerHTML += "<i data-icon='battery-"+batterylevel_10+"' data-l10n-id='battery-"+batterylevel_10+"' style='display:inline-block;line-height:0.8em;'> " + batterylevel + "</i>";
        }

        function success(pos) {
          /*
           * Postponed until v.1.6
           * show here info weather based on geoloc data
           * -------------------------------------------
           *
          var crd = pos.coords;
          tile.innerHTML += "<small style='display:block;position:relative;padding-left:30px;text-align:right;'>"
                          + "   <i data-icon='location' data-l10n-id='location' style='position:absolute;top:0;left:0;'></i>"
                          +     crd.latitude + "<br />" + crd.longitude
                          + "</small>";
           *
           *
           */
        };

        function error(err) {
          console.warn('ERROR(' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, geoptions);

        tile.id        = 'hour_tile';
        tile.innerHTML += "<div id='worded'><span class='weekday'>"+ get_worded_day() + "</span> <span class='monthday'>" + get_numeric_day() + "</span></div>";
        tile.style     = "background-color:orange;";

        parent.insertBefore(tile, parent.children[1]);
     };

     var resize = function () {

        var get_rid_small = function (e) {
            e.classList.remove("small");

            x = Array.prototype.indexOf.call( e.parentNode.childNodes,e ) +1;
            if ( is_small( x ) > -1 ) {
                e.classList.add("small");
            }
        };

        R.forEach( get_rid_small, [].slice.call( document.getElementsByClassName("tile")) );
        hour_tile();

     };

    /**
     * Renders the icon to the container.
     */
    var render = icon => {

            if (!icon.manifest.icons) return;

            // guards
            if( R.contains ( icon.manifest.name, apps_2_exclude ))  return;
            if (icon.manifest.role == "homescreen")                 return;
            if (icon.manifest.role == "addon")                      return;
            //end guards

            if ( is_small( i ) > -1 ) {
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
                        tile_bg.style.backgroundColor = get_color(name);
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

                if ( is_small( i ) > -1 )  {
                    tile.className += " small";
                    //tile.style.background = get_color(name) + ' url(' + window.URL.createObjectURL(  img ) + ') 12% no-repeat';
                }

            });

            if (typeof icon_image == undefined) return;
    }

    /* fires up the painting */
    var start = () => {

        if (b_transparency == 1){
            add_style('#apps { background-color: transparent; background-color: rgba(0,0,0,0.1); }');
        }else{
            add_style('#apps { background-color: #000;}');
        }

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
        console.log(ev.value);
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
            print_dock();
        }


        // options
        if (this_tile.id == "worded" || this_tile.id == "hour_tile") {
            show_options();
        }

        if (this_tile.id == "hide_trans") {
            b_transparency = 0;
            start();
        }

        if (this_tile.id == "set_trans") {
            b_transparency = 1;
            start();
        }
        // end options

    }); //end window event 'click', document.getElementsByClassName('tile'));


    // 3, 2, 1 ...
    start();



});

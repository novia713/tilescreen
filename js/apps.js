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
 * @version     1.42
 * @date        20160127
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
    only_big = 0;
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
        smalls = [ 3 ,4 ,5 ,6 ,8 ,9 ,10 ,11 ];

    var parent = document.getElementById('apps');
    var iconMap = new WeakMap();
    var usage = [];
    var i = 0;
    var storage = null;
    var date = new Date();


    // colors
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
            return '#'+'0123456789abcdef'.split('').map(function(v,i,a){ return i>5 ? null : a[Math.floor(Math.random()*16)] }).join('');
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
            tile.innerHTML += "<i data-icon='battery-8' data-l10n-id='battery-8'></i>" + batterylevel + "";
        }

        function success(pos) {
          var crd = pos.coords;
          tile.innerHTML += "<small style='float:left;'><i data-icon='location' data-l10n-id='location'></i>" + crd.latitude + ", " + crd.longitude + "</small>";
        };

        function error(err) {
          console.warn('ERROR(' + err.code + '): ' + err.message);
        };

        navigator.geolocation.getCurrentPosition(success, error, geoptions);

        tile.id        = 'hour_tile';
        tile.innerHTML += "<div id='worded'>" + get_numeric_day() + " <span id='weekday'>"+ get_worded_day() + "</span></div>";
        tile.style     = "background-color:orange;";






        parent.insertBefore(tile, parent.children[1]);
     };

     var resize = function () {

        var get_rid_small = function (e) {
            e.classList.remove("small");

            x = Array.prototype.indexOf.call(e.parentNode.childNodes,e) +1;
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
                var wordname = name.split(" ");
                var firstchar = name.charAt(0);

                /* tile generation*/
                var tile = document.createElement('div');
                tile.className = 'tile';
                tile.className += ' icon_' + wordname[0];
                tile.style.background = get_color(name) + ' url(' + window.URL.createObjectURL(  img ) + ') 49% no-repeat';
                document.getElementById('apps').appendChild(tile);
                iconMap.set(tile, icon);
                /* end tile generation*/


                // array for storing it in JSON for using records
                var item = { "label": wordname[0], "index": counter.get_val(), "order": 0 };
                storage = localStorage.getItem("storage");

                if ( !storage ) {
                    storage = [];
                    storage[i] = item;
                    localStorage.setItem( "storage", JSON.stringify( storage ));
                } else  {
                    var data = JSON.parse(storage);
                    data[counter.get_val()] =  item;
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

        if ( typeof storage == "string" ) storage = JSON.parse( storage );
        var i = iconMap.get( ev.target );

        if (i) {

            var classname = R.replace("icon_", "", R.split( " ", ev.originalTarget.className)[1]);
            var index     = R.keys ( R.filter( R.propEq("label", classname ), storage ));

            // we add 1 to value of that icon in localStorage ...
            storage[index].order +=1;
            localStorage.setItem( "storage", JSON.stringify( storage ));


            // transpose storage value to DOM elements
            ev.target.dataset.order = storage[index].order;

            // sorting
            var compare = function (a, b) {

              if (a.dataset.order == undefined) a.dataset.order = 0;
              if (b.dataset.order == undefined) a.dataset.order = 0;

              if (a.dataset.order > b.dataset.order)
                return -1;
              else if (a.dataset.order < b.dataset.order)
                return  1;
              else
                return  0;
            }

            var new_roster = [].slice.call( document.getElementById( "apps" ).childNodes ).sort( compare );

            // printing
            document.getElementById('apps').innerHTML = "";

            var print_tile = e => {
                document.getElementById('apps').appendChild( e );
            }

            R.forEach( print_tile, [].slice.call( new_roster ) );
            // end reordering incons by usage

            resize();

            i.launch();
        }
    }); //end window event 'click', document.getElementsByClassName('tile'));
/*
console.log("4");
var pics = navigator.getDeviceStorage('pictures');
var cursor = pics.enumerate();


  //var file = this.result;
  //return file.name;
}
*/

//console.log(navigator.mozWifiManager.connectionInformation);
//console.log(navigator.mozWifiManager.connection);

    // 3, 2, 1 ...
    start();



});

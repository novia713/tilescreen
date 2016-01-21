/**
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *          .·' H O M E S C R E E N S F O R A L L'·.  by leandro713
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *
 * Tilescreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20160121
 *
 * @author      leandro713 <leandro@leandro.org>
 * @copyright   leandro713 - 2016
 * @link        https://github.com/novia713/tilescreen
 * @license     http://www.gnu.org/licenses/gpl-3.0.en.html
 * @version     1.3
 * @date        20160121
 *
 * @see         https://github.com/mozilla-b2g/gaia/tree/88c8d6b7c6ab65505c4a221b61c91804bbabf891/apps/homescreen
 * @thanks      to @CodingFree for his tireless support and benevolent friendship
 * @todo
 *      - order icons by use [done]
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
        'ramdajs': ['ramda.min']
    },
    shim: {
        'ramdajs': {
            exports: 'R'
        }
    }
});

require(['ramdajs'], ( R ) => {

    const apps_2_exclude = [
        "Downloads", "EmergencyCall", "System", "Legacy", "Ringtones",
        "Legacy Home Screen", "Wallpaper", "Default Theme", "Purchased Media",
        "Built-in Keyboard", "Bluetooth Manager", "Communications",
        "PDF Viewer", "Network Alerts", "WAP Push manager", "Default Home Screen" ];

    var parent = document.getElementById('apps');
    var iconMap = new WeakMap();
    var usage = [];
    var i = 0;
    var storage = null;


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

            return '#'+'0123456789abcdef'.split('').map(function(v,i,a){ return i>5 ? null : a[Math.floor(Math.random()*16)] }).join('');



        }
    };

    /**
     * Prints set up message
     */
     var print_msg = () => {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
            parent.innerHTML(txt_msg);
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

            var icon_image = navigator.mozApps.mgmt.getIcon(icon, 60);


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

            i.launch();
        }
    }); //end window event 'click', document.getElementsByClassName('tile'));





    // 3, 2, 1 ...
    start();

});

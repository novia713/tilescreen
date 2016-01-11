/**
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *          .·' H O M E S C R E E N S F O R A L L'·.  by leandro713
 *          .·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.·.
 *
 * Tilescreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20160111
 *
 * @author      leandro713 <leandro@leandro.org>
 * @copyright   leandro713 - 2016
 * @link        https://github.com/novia713/tilescreen
 * @license     http://www.gnu.org/licenses/gpl-3.0.en.html
 * @version     1.1
 * @date        20160111
 *
 * @see         https://github.com/mozilla-b2g/gaia/tree/88c8d6b7c6ab65505c4a221b61c91804bbabf891/apps/homescreen
 * @thanks      to @CodingFree for his tireless support and benevolent friendship
 * @todo
 *      - show wifi network name and telephony provider name
 *      - show weather
 *      - show missed calls
 *      - default icon if not found
 */


requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'jQuery': ['jquery-2.1.4.min'],
        'ramdajs': ['ramda.min']
    },
    shim: {
        'ramdajs': {
            exports: 'R'
        }
    }
});

require(["jQuery", 'ramdajs'], function(jQuery, R) {

    const apps_2_exclude = [
        "Downloads", "EmergencyCall", "System", "Legacy", "Ringtones",
        "Legacy Home Screen", "Wallpaper", "Default Theme",
        "Built-in Keyboard", "Bluetooth Manager", "Communications",
        "PDF Viewer", "Network Alerts", "WAP Push manager", "Default Home Screen" ];

    var parent = $('#apps');
    var iconMap = new WeakMap();


    //colores
    var get_color = function(app) {
        var obj_color = {};
        obj_color.Communications = "#B2F2FF"; //green 5F9B0A
        obj_color.Calendar = "#FF4E00"; //orange
        obj_color['E-Mail'] = "#FF4E00"; //orange
        obj_color['FM Radio'] = "#2C393B"; //grey
        obj_color.Camera = "#00AACC"; //blue
        obj_color.Clock = "#333333"; //warm grey
        obj_color.Gallery = "#00AACC"; //blue
        obj_color.Marketplace = "#00AACC"; //blue
        obj_color.Browser = "#00AACC"; //blue
        obj_color.Messages = "#5F9B0A"; //green
        obj_color.Video = "#CD6723"; //brick
        obj_color.Music = "#CD6723"; //brick
        obj_color.Settings = "#EAEAE7"; //ivory

        if (obj_color[app]) {
            return obj_color[app];
        } else {
            //random hex color;
            return '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    };

    /**
     * Prints set up message
     */
     var print_msg = function () {
        var txt_msg  = "<div style='background-color:orange;color:white'><h3>Please, set this homescreen your default homescreen in <i>Settings / Homescreens / Change Homescreens</i>. This homescreen won't work if you don't do so</h3></div>";
            txt_msg += "<div style='background-color:orange;color:black'><h3>Ve a <i>Configuración / Homescreens</i> y haz este homescreen tu homescreen por defecto. Si no lo haces, este homescreen no funciona!</h3></div>";
        parent.html(txt_msg);
     };


    /**
     * Renders the icon to the container.
     */
    var render = function(icon) {

        if (!icon.manifest.icons) return;

            // guards
            if( R.contains ( icon.manifest.name, apps_2_exclude ))  return;
            if (icon.manifest.role == "homescreen")                 return;
            if (icon.manifest.role == "addon")                      return;
            //end guards

            var icon_image = navigator.mozApps.mgmt.getIcon(icon, 60);


            icon_image.then ( function ( img ) {

                var name = icon.manifest.name;
                var wordname = name.split(" ");
                var firstchar = name.charAt(0);

                /* tile generation*/
                var tile = document.createElement('div');
                tile.className = 'tile';
                tile.className += ' icon_' + wordname[0];
                tile.style.background = get_color(name) + ' url(' + window.URL.createObjectURL(  img ) + ') 49% no-repeat';

                $('#apps').append(tile);
                iconMap.set(tile, icon);
                /* end tile generation*/
            });

            if (typeof icon_image == undefined) return;

    }

    /* fires up the painting */
    var start = function() {
            $('.tile').remove();
            /**
             * Fetch all apps and render them.
             */
            var myApps = new Promise((resolve, reject) => {
                    var request = navigator.mozApps.mgmt.getAll();

                    request.onsuccess = (e) => {
                      for (var app of request.result) {
                        render( app );
                      }
                    };

                    request.onerror = (e) => {
                      console.error('Error calling getAll: ' + request.error.name);
                      resolve();
                    };
            });

            myApps.then(
                function (v) {

                }, function(v){
                    print_msg();
                }
            );
    } //end start




    // event listener to launch the app on click.

    window.addEventListener('click', e => {
        var i = iconMap.get(e.target);

        if (i) {
            //$('.' + e.originalTarget.classList[1]).css("-moz-transform", "rotate(320deg)");
            i.launch();
        }
    }); //end window event 'click'



    // 3, 2, 1 ...
    start();

});

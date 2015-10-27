/*
 * Tilescreen
 * (c) leandro@leandro.org
 * GPL v3 license
 * v. 20151027
 */


requirejs.config({
    appDir: ".",
    baseUrl: "js",
    paths: {
        'jQuery': ['jquery-2.1.4.min'],
        'underscore': ['underscore-min']
    },
    shim: {
        'underscore': {
            exports: '_',
            deps: ['jQuery']
        }
    }
});

require(["jQuery", 'underscore'], function(jQuery, _) {


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
     * Renders the icon to the container.
     */
    var render = function(icon) {
        var name = icon.app.manifest.name;
        var wordname = name.split(" ");
        var firstchar = name.charAt(0);


        /* tile generation*/
        var tile = document.createElement('div');
        tile.className = 'tile';
        tile.className += ' icon_' + wordname[0];
        tile.style.background = get_color(name) + ' url(' + icon.icon + ') 49% no-repeat';

        $('#apps').append(tile);
        iconMap.set(tile, icon);
        /* end tile generation*/
    }

    /* fires up the painting */
    var start = function() {
            $('.tile').remove();
            /**
             * Fetch all apps and render them.
             */
            FxosApps.all().then(icons => {
                icons.forEach(render);

            });
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

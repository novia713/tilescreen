'use strict'
/**
@class U
*/
var  U = {

    /**
    This is used to console.log any value.
    @method log
    @param v {mixed} The value to log
    @return mixed
    */
    log: v  => {
         console.log( v );
    },

    /**
    Colores de cada icono
    @method get_color
    @param app {Object} the app
    @return color {String} The hexadecimal value of the color
    */
    get_color: app  => {
        var obj_color = {};
        obj_color.Communications = "#B2F2FF"; //green 5F9B0A
        obj_color.Calendar    = "#fff587";// yellow   before: "#FF4E00"; //orange
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
    },

    /**
    Prints the upper dock
    @param R {Class}
    @param iconMap {WeakMap}
    @param document {Object}
    @method print_dock
    @return {String} Injects HTML in the setup-tile div
    */
    print_dock: ( R, iconMap, document ) => {

        var storage = JSON.parse( localStorage.getItem(  "storage"));
        var dock    = document.getElementById("dock");
        dock.className  = "tile t_4_1";

        var print_tiles_in_minidock =  item  => {

            var tile = document.createElement("div");
            tile.className  = "tile small in-dock";

                    /* tile icon */
                    var tile_ic = document.getElementById(item.label).cloneNode(true);
                    tile_ic.classList.add("docker");
                    tile.appendChild( tile_ic  );

                    /* tile background */
                    var tile_bg = document.createElement('div');
                    tile_bg.className = 'tile_bg';
                    tile.appendChild(tile_bg);

            dock.appendChild(  tile  );
        };

        dock.innerHTML = "";
        var sortByUsage = R.sortBy(R.prop("order"));
        R.forEach ( print_tiles_in_minidock, R.take (4,  R.reverse(sortByUsage( storage ))));
     },

    /**
    Tells if the current position in roster should be small
    @param pos    {Integer}
    @param R      {Class}
    @param smalls {Array}
    @method is_small
    @return {Integer} [>0 yes | 0 no]
    */
     is_small: (pos, R, smalls) => {
         return R.indexOf(pos, smalls);
     },

    /**
    Shows a div for choosing options
    @param b_transparency  {Integer}
    @param only_big        {Integer}
    @method show_options
    @return {String}
    */
     show_options: (b_transparency, only_big) => {

        var div_options = document.createElement('div');
        div_options.className = 'options';

            div_options.innerHTML = (b_transparency == 1)?
                "<div id='hide_trans' class='bt'>hide transparency</div>" :
                "<div id='set_trans' class='bt'>set transparency</div>"  ;
            div_options.innerHTML += (only_big == 1)?
                "<div id='show_small' class='bt'>show small icons</div>" :
                "<div id='only_big' class='bt'>only big icons</div>"  ;

        document.getElementById("setup-tile").innerHTML = '';
        document.getElementById("setup-tile").appendChild(div_options);

     },

    /**
    Tells the day in number
    @param date  {Object}
    @method get_numeric_day
    @return {Integer}
    */
     get_numeric_day: date => {
        return date.getDay();
     },

    /**
    Tells the day in three letters word (sun, thu, fri)
    @param day  {Integer}
    @method get_worded_day
    @return {String}
    */
     get_worded_day: day => {
        var weekday = new Array(7);

        weekday[0]=  "SUN";
        weekday[1] = "MON";
        weekday[2] = "TUE";
        weekday[3] = "WED";
        weekday[4] = "THU";
        weekday[5] = "FRI";
        weekday[6] = "SAT";

        return weekday[day];
     },

     /**
    Sets initial styles for sizes
    @param css_string  {String}
    @method add_style
    @return {String}
    */
     add_style: css_string => {
        var head = document.head || document.getElementsByTagName('head')[0],
            style = document.createElement('style');

        style.type = 'text/css';
         if (style.styleSheet){
           style.styleSheet.cssText = css_string;
         } else {
           style.appendChild(document.createTextNode(css_string));
         }

        head.appendChild(style);
     },

     /**
    Performs an asynchronous ajax call
    @param url  {String} the url to go
    @param mode {String} [weather | city]
    @method ajax
    @return {String}
    */
     ajax: (url, mode) => {

        var xmlhttp;

        xmlhttp = new XMLHttpRequest({ mozSystem: true });

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
               if(xmlhttp.status == 200){
                   //U.log( xmlhttp.responseText  );
                   if ("weather" == mode)
                    U.parse_weather_xml( xmlhttp.responseText );
                   if ("city" == mode){
                        var data = JSON.parse(xmlhttp.responseText);
                        var address = data.results[0];
                        /*
                         * 1 - street
                         * 2 - neighborhood
                         * 3 - locality
                         * 4 - administrative area
                         * 5 - country
                         * 6 - postal code
                         */
                        if (address != null && address != 'undefined'){
                            var neighborhood = address.address_components[2].short_name;
                            var postal_code  = address.address_components[6].short_name;
                            if (neighborhood && postal_code > 0)
                                document.getElementById("setup-tile-location").innerHTML = postal_code +" "+ neighborhood;
                        }
                   }
               }
               else if(xmlhttp.status == 400) {
                    U.log('There was an error 400')
               }
               else {
                   U.log('code: ' + xmlhttp.status)
               }
            }
        }

        xmlhttp.open("GET", url, true);
        xmlhttp.send();
     },

    /**
    Parses an asynchronous ajax call to show the weather info
    @param xml  {String} the xml to parse
    @method parse_weather_xml
    @return {String}
    */
     parse_weather_xml: xml => {

        var d = new Date();
        var is_night = (d.getHours() > 20 || d.getHours() < 9)?
                "is_night=1;":
                "";
        var url_4_weather_icon;

        var parser = new DOMParser();
        var xmlDoc = parser.parseFromString( xml ,"text/xml");
        var weather_icon   =  xmlDoc.getElementsByTagName("symbol")[0].getAttribute("number");
        url_4_weather_icon = "http://api.yr.no/weatherapi/weathericon/1.1/?symbol=" + weather_icon + ";" + is_night + "content_type=image/png";

        var now = new Date();

        document.getElementById("weather-info").innerHTML =
            "<img src='"+ url_4_weather_icon +"'/>" + " " +
            xmlDoc.getElementsByTagName("location")[0].childNodes[1].getAttribute("value") + "&deg;"
            + " &nbsp; <em>" +  ('0'+now.getHours()).substr(-2) + ":" + ('0'+now.getMinutes()).substr(-2) + "</em>";
     },

     add_initial_styles: () => {

        C.width_1_col =  window.innerWidth; /* not used yet Leandro, it's for the biggest tiles (side to side) */
        C.width_2_col = (window.innerWidth / 2).toFixed(0) - 8;
        C.width_4_col = (window.innerWidth / 4).toFixed(0) - 8;

        U.add_style('.tile { width: '  + C.width_2_col +'px; height: '  + C.width_2_col +'px; }');
        U.add_style('.small { width: ' + C.width_4_col +'px!important; height: ' + C.width_4_col +'px!important}');
        U.add_style('.t_4_1 { width: ' + C.width_1_col +'px!important; height: ' + C.width_4_col +'px!important; padding:0px;}');

     },

    show_tile_settings: (tile, R, HIDDEN_ROLES) => {

        /* delete 'popup' div if it does exist */
        var el = document.getElementById( 'popup' );
        if (el != null ) return;

        var tile_rel = tile.getAttribute('rel');
        var tile_id = tile.id;

        var html = '';
        html = "<div id='close_tile_settings' data-icon='close' data-l10n-id='close' class='close_bt'></div>";
        html += "<h2>Select an app for this tile</h2>";
        html += "<ul id='ul_apps'></ul>";

        var div_popup = document.createElement('div');
        div_popup.id = 'popup';
        div_popup.innerHTML = html;
        div_popup.setAttribute('rel' , tile_id);

        var body = document.body || document.getElementByTagName('body')[0];
        body.appendChild(div_popup);

        /* populate the ul of the div_popup with a <li> foreach app */
            var request = navigator.mozApps.mgmt.getAll();

            request.onsuccess = (e) => {

                request.result.forEach( function(icon){
                        // guards
                            if (!icon.manifest.icons) return;
                            if ( R.contains ( icon.manifest.role, HIDDEN_ROLES ))  return;
                        //end guards

                        var icon_image = navigator.mozApps.mgmt.getIcon(icon, 32);
                        var icon_name = icon.manifest.name;
                        var wordname = icon_name.split(" ");

                        icon_image.then ( img => {
                            var div_popup = document.getElementById('ul_apps');
                            var li = document.createElement('li');
                                li.className = 'tile_settings_li';
                                li.setAttribute('rel', wordname[0]);
                            var imgtag = document.createElement('img');
                                imgtag.src = window.URL.createObjectURL( img );
                            li.appendChild(imgtag);
                            li.appendChild(document.createTextNode(icon_name));
                            div_popup.appendChild(li);
                        });


                });


            };

            request.onerror = (e) => {
              console.error('Error calling getAll: ' + request.error.name);
              resolve();
            };

    },

    close_select_app: () => {
        var body = document.body || document.getElementByTagName('body')[0];
        var div_popup = document.getElementById("popup");
        var garbage = body.removeChild(div_popup);
    },

    set_tile_app: (tile_settings_li, iconMap) => {
        var app_rel = tile_settings_li.getAttribute('rel');
        var tile_id = document.getElementById('popup').getAttribute('rel');

        if (iconMap[app_rel]){

            var icon = iconMap[app_rel];
            var icon_name = icon.manifest.name;
            var wordname = icon_name.split(" ");

            var icon_image = navigator.mozApps.mgmt.getIcon(icon, 60);

            /* when the mozApps API response the answer to our previous request THEN: */
            icon_image.then ( img => {

                /* tile generation*/
                var old_tile = document.getElementById(tile_id);
                var tile = old_tile.cloneNode();

                /* empty the tile */
                U.empty_elementById(tile_id);

                /* tile icon */
                var tile_ic = document.createElement('div');
                tile_ic.className = 'tile_ic';
                var img_url = window.URL.createObjectURL( img );
                tile_ic.style.background = 'transparent url(\'' +  img_url + '\') no-repeat';

                // Callscreen icon [ doing things like this is cheese ]
                if (icon_name == "Communications") { //should be Callscreen
                    tile_ic.style.background = 'transparent url(/img/dialer-icon.png) no-repeat';
                }

                tile_ic.setAttribute('rel', wordname[0]);
                tile_ic.id = wordname[0];

                tile.appendChild(tile_ic);

                /* tile background */
                var tile_bg = document.createElement('div');
                tile_bg.className = 'tile_bg';
                tile_bg.style.backgroundColor = U.get_color(icon_name);

                tile.appendChild(tile_bg);

                /* replace the old tile with the new tile */
                document.getElementById('apps').replaceChild(tile, old_tile);

                /* destroy the tile_settings 'popup' */
                U.destroy_elementById( 'popup' );
            });


            /* destroy the tile_settings 'popup' */
            U.destroy_elementById( 'popup' );

        }

    },

    destroy_elementById: (ele_id) => {
        var el = document.getElementById( ele_id );
        if (el == null ) return;
        /*if (el.parentNode == null ) return;*/
        el.parentNode.removeChild( el );
    },

    empty_elementById: (ele_id) => {
        var Node = document.getElementById(ele_id);
        while (Node.firstChild) {
           Node.removeChild(Node.firstChild);
        }
    }

};

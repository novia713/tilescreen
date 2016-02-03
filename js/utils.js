'use strict'
var  U = {

    log: v  => {
         console.log( v );
    },

    //colores de cada icono
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


    print_dock: ( R, iconMap, document ) => {

        var storage = JSON.parse( localStorage.getItem(  "storage"));
        var dock    = document.getElementById("dock");
        dock.className  = "tile t_4_1";

        var print_tiles_in_minidock =  item  => {

            var tile = document.createElement("div");
            tile.className  = "tile small in-dock";

                    /* tile icon */
                    var tile_ic = document.getElementById(item.label).cloneNode(true);
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

     is_small: (pos, R, smalls) => {
         return R.indexOf(pos, smalls);
     },

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

     get_numeric_day: date => {
        return date.getDay();
     },

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

     /* set initial styles for sizes */
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
                    var neighborhood = address.address_components[2].short_name;
                    var postal_code  = address.address_components[6].short_name;
                    if (neighborhood && postal_code > 0)
                        document.getElementById("setup-tile-location").innerHTML = postal_code +" "+ neighborhood;
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

        var width_1_col =  window.innerWidth; /* not used yet Leandro, it's for the biggest tiles (side to side) */
        var width_2_col = (window.innerWidth / 2).toFixed(0) - 8;
        var width_4_col = (window.innerWidth / 4).toFixed(0) - 8;

        U.add_style('.tile { width: '  + width_2_col +'px; height: '  + width_2_col +'px; }');
        U.add_style('.small { width: ' + width_4_col +'px!important; height: ' + width_4_col +'px!important}');
        U.add_style('.t_4_1 { width: ' + width_1_col +'px!important; height: ' + width_4_col +'px!important; padding:0px;}');

     },

    show_tile_settings: () => {
        var div_popup = document.createElement('div');
        div_popup.id = 'popup';

            div_popup.innerHTML = "<div class='close_bt'><span id='close_tile_settings' class='x_close_bt'>x</span></div>" ;
            div_popup.innerHTML += "<h2>Select an app for this tile</h2>";
            div_popup.innerHTML += "<ul>" ;
            for (var ii=0; ii<30; ii++)
                div_popup.innerHTML += "    <li><img src='' /> app " + ii + "</li>" ;
            div_popup.innerHTML += "</ul>" ;

        var body = document.body || document.getElementByTagName('body')[0];
        body.appendChild(div_popup);

    },

    close_select_app: () => {
        var body = document.body || document.getElementByTagName('body')[0];
        var div_popup = document.getElementById("popup");
        var garbage = body.removeChild(div_popup);
    }
};

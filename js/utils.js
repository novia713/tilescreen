'use strict'
var  U = {

    log: v  => {
         console.log( v );
    },

    //colores de cada icono
    get_color: app  => {
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
    },


    print_dock: ( R, iconMap ) => {

        var storage = JSON.parse( localStorage.getItem(  "storage"));
        var dock    = document.getElementById("dock");
        dock.className  = "tile t_4_1";

        var print_tiles_in_minidock =  item  => {
            var div_copy = document.getElementById(item.label).cloneNode(true);
            var tile = document.createElement("div");

            tile.className  = "tile small in-dock";
            tile.appendChild( div_copy  );

                    /* tile background */
                    var tile_bg = document.createElement('div');
                    tile_bg.className = 'tile_bg';
                    tile_bg.style.backgroundColor = '#000';
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

         document.getElementById("hour_tile").innerHTML = "";
         document.getElementById("hour_tile").innerHTML = (b_transparency == 1)?
            "<div id='hide_trans'>hide transparency</div>" :
            "<div id='set_trans' >set transparency</div>"  ;
         document.getElementById("hour_tile").innerHTML += (only_big == 1)?
            "<div id='show_small'>show small icons</div>" :
            "<div id='only_big'  >only big icons</div>"  ;

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

     ajax: url => {

        var xmlhttp;

        xmlhttp = new XMLHttpRequest({ mozSystem: true });

        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == XMLHttpRequest.DONE ) {
               if(xmlhttp.status == 200){
                   //U.log( xmlhttp.responseText  );
                   U.parse_weather_xml( xmlhttp.responseText );
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

        document.getElementById("weather-info").innerHTML =
            "<img src='"+ url_4_weather_icon +"'/>" + " " +
            xmlDoc.getElementsByTagName("location")[0].childNodes[1].getAttribute("value") + "&deg;";
     },

     add_initial_styles: (window, width_1_col, width_2_col, width_4_col ) => {

        width_1_col =  window.innerWidth; /* not used yet Leandro, it's for the biggest tiles (side to side) */
        width_2_col = (window.innerWidth / 2).toFixed(0) - 8;
        width_4_col = (window.innerWidth / 4).toFixed(0) - 8;

        U.add_style('.tile { width: '  + width_2_col +'px; height: '  + width_2_col +'px; }');
        U.add_style('.small { width: ' + width_4_col +'px!important; height: ' + width_4_col +'px!important}');
        U.add_style('.t_4_1 { width: ' + width_1_col +'px!important; height: ' + width_4_col +'px!important; padding:0px;} .t_4_1 .tile{margin-left:0px;margin-right:8px;}');

     }

};

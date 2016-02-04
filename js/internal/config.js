'use strict'
/**
@class C
*/
var  C = {

    /**
     * Value for showing small or big icons
     *
     * @property only_big
     * @type Integer
     * @default 0
     */

    only_big       : 0,

    /**
     * 1 = semi-transparent background colors  VS 0 = solid background colors
     *
     * @property b_transparency
     * @type Integer
     * @default 1
     */

    b_transparency : 1,

    /**
     * Constant for excluding not interesting apps in roster
     *
     * @property HIDDEN_ROLES
     * @type Array
     * @readOnly
     */

    HIDDEN_ROLES : [ 'system', 'input', 'homescreen', 'theme', 'addon', 'langpack' ],

    /**
     * Time for refresh the setup-tile
     *
     * @property TS_UPD_SETUP_TILE
     * @type Integer
     * @readOnly
     * @default 3600000 [ 1 hour ]
     */

    TS_UPD_SETUP_TILE : 3600000,

    /**
     * DIV apps container
     *
     * @property mosaic
     * @type String
     */

    mosaic : document.getElementById('apps'),

    /**
     * WeakMap for storing the icons
     *
     * @property iconMap
     * @type Object
     */

    iconMap : {},

    /**
     * Array container for small indexes
     *
     * @property smalls
     * @type Array
     */

    smalls : [],

    /**
     * Object for storing in LocalStorage usage of icons
     *
     * @property storage
     * @type Array
     */

    storage : null,

    /**
     * Date Object
     *
     * @property date
     * @type Class
     */

    date : new Date(),
    width_1_col : 0,
    width_2_col : 0,
    width_4_col : 0,

    /**
     * API KEY for Google geolocation
     *
     * @property gugle_key
     * @type String
     */

    gugle_key : "AIzaSyDg0goaIJCowkjfO0Px7IhLTRWWO-aAtS0",

    /**
     * Unix timestamp of the last longpress event... for avoid to make a click after it
     *
     * @property last_longpress
     * @type integer
     */
    last_longpress : 0,

    /**
     * Object mgmt for managing the apps
     *
     * @property appMgr
     * @type object
     */
    appMgr: navigator.mozApps.mgmt


};

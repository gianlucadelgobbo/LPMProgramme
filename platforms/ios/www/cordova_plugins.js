cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "id": "cordova-plugin-network-information.network",
        "file": "plugins/cordova-plugin-network-information/www/network.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "navigator.connection",
            "navigator.network.connection"
        ]
    },
    {
        "id": "cordova-plugin-network-information.Connection",
        "file": "plugins/cordova-plugin-network-information/www/Connection.js",
        "pluginId": "cordova-plugin-network-information",
        "clobbers": [
            "Connection"
        ]
    },
    {
        "id": "cordova-plugin-console.console",
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "console"
        ]
    },
    {
        "id": "cordova-plugin-console.logger",
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "id": "cordova-plugin-customurlscheme.LaunchMyApp",
        "file": "plugins/cordova-plugin-customurlscheme/www/ios/LaunchMyApp.js",
        "pluginId": "cordova-plugin-customurlscheme",
        "clobbers": [
            "window.plugins.launchmyapp"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-network-information": "1.2.0",
    "cordova-plugin-whitelist": "1.2.1",
    "cordova-plugin-console": "1.0.7",
    "cordova-plugin-customurlscheme": "4.3.0"
};
// BOTTOM OF METADATA
});
var webpack = require("webpack");
var package = require("./package.json");

module.exports = {
    entry: "./src/knockout-fade.ts",
    output: {
        path: __dirname + "/dist",
        filename: "knockout-fade.min.js",
        libraryTarget: "umd"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: ['', '.webpack.js', '.web.js', '.ts', '.tsx', '.js']
    },
    module: {
        loaders: [
        // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
        { test: /\.tsx?$/, loader: 'ts-loader' }
        ]
    },
    plugins: [
       new webpack.optimize.UglifyJsPlugin(),
       new webpack.BannerPlugin(`
@license Knockout Fade
Enhanced binding syntaxes for Knockout
(c) Richard Simpson 2016, Michael Best 2013-2016
License: MIT (http://www.opensource.org/licenses/mit-license.php)
Version ${package.version}`)
    ],
    externals: {
        "knockout": {
            "amd": "knockout",
            "commonjs": "knockout",
            "commonjs2": "knockout",
            "root": "ko"
        }
    }
};
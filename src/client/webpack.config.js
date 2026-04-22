const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const config = require('./config');
const NamedModulesPlugin = require('simple-named-modules-plugin-webpack');

module.exports = {
    node: {
        fs: 'empty'
    },
    entry: {
        'dashboard': './src/modules/dashboard/dashboard.js',
        'execution': './src/modules/execution/execution.js',
        'executions': './src/modules/executions/executions.js',
        'authoring': './src/modules/authoring/authoring.js',
        'execute-as-run': './src/modules/as-run/as-run.js',
        'venue-detail': './src/modules/venue-detail/venue-detail.js',
        'project-config': './src/modules/project-config/project-config.js',
        'reporting': './src/modules/reporting/reporting.js',
        'header': './src/modules/header/header.js',
        'admin': './src/modules/admin/admin.js',
        'search': './src/modules/search/search.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        publicPath: '/dist/',
        filename: '[name]-bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
                        // the "scss" and "sass" values for the lang attribute to the right configs here.
                        // other preprocessors should work out of the box, no loader config like this necessary.
                        'scss': 'vue-style-loader!css-loader!sass-loader',
                        'sass': 'vue-style-loader!css-loader!sass-loader?indentedSyntax'
                    }
                    // other vue-loader options go here
                }
            },
            // the url-loader uses DataUrls.
            // the file-loader emits files.
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                // Limiting the size of the woff fonts breaks font-awesome ONLY for the extract text plugin
                // loader: "url?limit=10000"
                use: "url-loader"
            },
            {
                test: /\.(ttf|eot|svg)(\?[\s\S]+)?$/,
                use: 'file-loader'
            },
            {
                test: /\.m?js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true
                        }
                    }
                ],
                include: [
                    path.resolve(__dirname, 'src'),
                    path.resolve(__dirname, 'node_modules/vue-echarts'),
                    path.resolve(__dirname, 'node_modules/echarts'),
                    path.resolve(__dirname, 'node_modules/resize-detector')
                ]

            },
            {
                test: /\.(js|vue)$/,
                use: [
                    {
                        loader: 'eslint-loader',
                        options: {
                            cache: false,
                            failOnWarning: false,
                            failOnError: true
                        }
                    }
                ],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader"
                }),
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        new ExtractTextPlugin("main.css"),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
        new webpack.ProvidePlugin({
            $: "jquery",
            jQuery: "jquery"
        }),
        new CleanWebpackPlugin(
            [ 'dist' ],
            { root: path.resolve(__dirname) }
        ),
        new NamedModulesPlugin(),
    ],
    devtool: '#eval-source-map'
};

if (process.env.NODE_ENV === 'production') {

    module.exports.devtool = '#source-map';
    module.exports.plugins = (module.exports.plugins || []).concat([
        new webpack.DefinePlugin({
            'process.env': config.prod
        }),
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ]);
} else {
    module.exports.plugins = module.exports.plugins.concat([
        new webpack.DefinePlugin({
            'process.env': config.dev
        })
    ]);
}
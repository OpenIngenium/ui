const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const config = require('./config');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: isProduction ? 'production' : 'development',
    devtool: isProduction ? 'source-map' : false,
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
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            // Match the original (webpack 3) behavior:
            //  - Styles inside .vue single-file components (resourceQuery contains "vue")
            //    are injected at runtime via vue-style-loader. This is important because
            //    the SPA page templates do NOT load main.css, so component styles must be
            //    injected by JS at runtime (otherwise everything renders unstyled).
            //  - Plain .css imports (bootstrap, froala, tabulator, etc.) are extracted
            //    into a single main.css consumed by the non-SPA page templates.
            {
                test: /\.css$/,
                oneOf: [
                    {
                        resourceQuery: /vue/,
                        use: ['vue-style-loader', 'css-loader']
                    },
                    {
                        use: [MiniCssExtractPlugin.loader, 'css-loader']
                    }
                ]
            },
            {
                test: /\.scss$/,
                oneOf: [
                    {
                        resourceQuery: /vue/,
                        use: ['vue-style-loader', 'css-loader', 'sass-loader']
                    },
                    {
                        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
                    }
                ]
            },
            {
                test: /\.sass$/,
                oneOf: [
                    {
                        resourceQuery: /vue/,
                        use: [
                            'vue-style-loader',
                            'css-loader',
                            { loader: 'sass-loader', options: { sassOptions: { indentedSyntax: true } } }
                        ]
                    },
                    {
                        use: [
                            MiniCssExtractPlugin.loader,
                            'css-loader',
                            { loader: 'sass-loader', options: { sassOptions: { indentedSyntax: true } } }
                        ]
                    }
                ]
            },
            {
                // webpack 5 asset modules replace url-loader/file-loader
                test: /\.(woff2?|ttf|eot|svg|png|jpg|jpeg|gif)(\?[\s\S]+)?$/,
                type: 'asset/resource'
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
                    path.resolve(__dirname, 'test'),
                    path.resolve(__dirname, 'node_modules/vue-echarts'),
                    path.resolve(__dirname, 'node_modules/echarts'),
                    path.resolve(__dirname, 'node_modules/resize-detector')
                ]
            }
        ]
    },
    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        },
        // webpack 5 no longer polyfills Node core modules; provide browser
        // equivalents for deps (e.g. froala) that previously relied on
        // webpack 4's automatic polyfills.
        fallback: {
            fs: false,
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            vm: require.resolve('vm-browserify'),
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
            process: require.resolve('process/browser')
        }
    },
    optimization: {
        // Keep license comments inlined (no separate *.LICENSE.txt files) so the
        // Docker js_filename_to_env.sh mapping only sees real -bundle.js files.
        minimizer: [new TerserPlugin({ extractComments: false })],
        // Merge CSS from all entry points into a single main.css, matching the
        // previous extract-text-webpack-plugin behavior (server references one main.css).
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'main',
                    type: 'css/mini-extract',
                    chunks: 'all',
                    enforce: true
                }
            }
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        new VueLoaderPlugin(),
        new MiniCssExtractPlugin({ filename: 'main.css', ignoreOrder: true }),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
            'process.env': isProduction ? config.prod : config.dev
        })
    ]
};
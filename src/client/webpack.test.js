// Webpack 5 config used by Karma (karma-webpack) for unit tests.
// Differs from the app build (webpack.config.js): no entry/output (karma-webpack
// supplies those per spec), CSS is injected via vue-style-loader instead of being
// extracted, and url() references are left unresolved so fonts/images do not need
// to be emitted during test runs.
const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const config = require('./config');

module.exports = {
    mode: 'development',
    devtool: false,
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: ['vue-style-loader', { loader: 'css-loader', options: { url: false } }]
            },
            {
                test: /\.scss$/,
                use: [
                    'vue-style-loader',
                    { loader: 'css-loader', options: { url: false } },
                    'sass-loader'
                ]
            },
            {
                test: /\.sass$/,
                use: [
                    'vue-style-loader',
                    { loader: 'css-loader', options: { url: false } },
                    { loader: 'sass-loader', options: { sassOptions: { indentedSyntax: true } } }
                ]
            },
            {
                test: /\.(woff2?|ttf|eot|svg|png|jpg|jpeg|gif)(\?[\s\S]+)?$/,
                type: 'asset/resource'
            },
            {
                test: /\.m?js$/,
                use: [{ loader: 'babel-loader', options: { cacheDirectory: true } }],
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
        // karma-webpack works best with a single chunk per spec bundle
        splitChunks: false,
        runtimeChunk: false
    },
    performance: {
        hints: false
    },
    plugins: [
        new VueLoaderPlugin(),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en/),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
        new webpack.DefinePlugin({
            'process.env': config.test
        })
    ]
};

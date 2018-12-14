
//npm install -g webpack  //全局安装

//npm install --save-dev @babel/core @babel/cli @babel/preset-env
//npm install --save @babel/polyfill

// 一个常见的`webpack`配置文件
//npm install --save-dev webpack  webpack-cli webpack-dev-server
//npm i @babel/core babel-loader @babel/preset-env @babel/preset-react --save-dev
//npm install --save-dev style-loader css-loader
//npm install --save-dev postcss-loader autoprefixer
//npm i react react-dom --save
////npm install --save-dev html-webpack-plugin
const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',

    //已多次提及的唯一入口文件
    entry:{
        app: './src/index.js',
    },
    devtool: 'source-map',

    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'dist')
    },
    devServer: {
        contentBase: "./dist", //本地服务器所加载的页面所在的目录
        historyApiFallback: true, //不跳转
        port: 3001,
        inline: true,//实时刷新
        hot: true
    },
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            use: {
                loader: "babel-loader"
            },
            exclude: /node_modules/
        },{
            test: /\.css$/,
            use: [
                {
                    loader: 'css-loader',
                    options: {
                        modules: true,
                        localIdentName: '[path][name]__[local]--[hash:base64:5]'
                    }
                }, {
                    loader: "postcss-loader"
                }
            ]
        }]
    },

    plugins: [
        new webpack.BannerPlugin('测试react'),
        new HtmlWebpackPlugin({
           template: path.join(__dirname, "/index.html") //new 一个这个插件的实例，并传入相关的参数
        })
    ]
};


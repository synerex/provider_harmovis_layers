

const resolve = require('path').resolve;
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

module.exports = {
	mode: "development",
    output: {
		path: resolve(__dirname,'build'),
		filename: '[name].js'
    },
	devtool: 'source-map',
	entry: {
		bundle: "./src/index.tsx",
		socketWorker: "./src/worker/socket.ts"
	},
    module: {
	rules: [
	    {
			test: /\.tsx$/,
			exclude: /(node_modules)/,
			use: {
				loader: "ts-loader",
				options: {
					logLevel: "info"
				}
			}
	    },
		{
			test: /\.(ts)$/,
			use: [
//				{loader:"babel-loader"},
				{loader:"ts-loader",
				options: {
					logLevel: "info"
				}

			}
			]
			
	    },
	    {
			test: /\.(js)$/,
			loader: 'babel-loader',
			include: [resolve(__dirname, './src')],
			query: { 
				"presets": ["@babel/react"] 
			}
	    },
	    {
			test: /\.scss$/,
			use: ["style-loader", "css-loader", "sass-loader"]
	    },
	    {
			test: /\.css$/,
			use: [
			    'css-loader', // translates CSS into CommonJS
//			    'sass-loader' // compiles Sass to CSS, using Node Sass by default
			]
		},
		{
			test: /\.(svg|png|jpe?g|gif)$/i,
			loader: 'file-loader',
			options: {
			name: '[path][name].[ext]',
			},
		}
	]
    },
    plugins: [
		new CopyPlugin({
			patterns:[
				{ from: 'public', to: '.'}
			],
		}),
		// for compiling cache(speed up)
		new HardSourceWebpackPlugin(),
		// Optional: Enables reading mapbox token from environment variable
//		new webpack.EnvironmentPlugin(['MAPBOX_ACCESS_TOKEN'])
	],
	resolve: {
		extensions: [".ts", ".tsx", ".js", ".json"]
	}
};

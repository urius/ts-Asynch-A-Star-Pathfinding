
const path = require('path');

module.exports = {
	entry: "./src/AAStar.ts",
	output: {
		filename: "aastar.js",
		path: path.resolve (__dirname, "build")
	},
	resolve: {
		extensions:[".js",".ts"]
	},
	module: {		
		rules: [
			{
				test: /\.ts$/,
				loader: "ts-loader",
				exclude: /node_modules/
			}
		]
	}
}
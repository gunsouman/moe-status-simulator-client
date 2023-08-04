import path from "path";
import { fileURLToPath } from "url";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import {CleanWebpackPlugin} from "clean-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyFilePlugin from "copy-webpack-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const option = {
  mode: "development",
  entry: {
    index:path.resolve(__dirname, "src", "index.tsx")
  },
  output: {
    path: path.resolve(__dirname, "build_dev"),
    filename: "bundle.js",
  },
  resolve: {
    alias: {
      "react": "preact/compat",
      "react-dom": "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
    },
    extensions: ["", ".js", ".jsx", ".ts", ".tsx", ".json", ".scss"],
  },
  module: {
    rules: [
      { test: /\.(ts|tsx)$/, use: "ts-loader",  exclude: /node_modules/ },
      { test: /\.json$/, type: "json",  exclude: /node_modules/ },
      { test: /\.(js|jsx)$/, loader: "babel-loader",  exclude: /node_modules/ },
      // { test: /\.jsx$/, loader: "babel-loader", exclude: /node_modules/ },
      { test: /\.(scss|sass|css)$/i, use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"] },
    ],
  },
  //プラグインの設定
  plugins: [
    new MiniCssExtractPlugin({
      // 抽出する CSS のファイル名
      filename: "style.css",
    }),
    new CleanWebpackPlugin(),
    new CopyFilePlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public/"),
        //   to: "./",
          globOptions: {
            // dot: true,
            // gitignore: true,
            ignore: ["**/index.html"],
          },
        },
      ],
    }),
    new HtmlWebpackPlugin({						//	追加
        inject: 'body',
        filename: 'index.html',
        template: './public/index.html',
        chunks: ['index'],
    }),
  ],
  //source-map タイプのソースマップを出力
  // devtool: "source-map",
  target: 'web',
  // node_modules を監視（watch）対象から除外
  watchOptions: {
    ignored: /node_modules/, //正規表現で指定
  },
};

export default option
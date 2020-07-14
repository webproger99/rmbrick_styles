const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCssAssets = require('optimize-css-assets-webpack-plugin');
const Terser = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const AssetsManifest = require('webpack-assets-manifest');
const autoprefixer = require('autoprefixer');

// const webpack = require('webpack');
const fs = require('fs');


const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = !IS_DEV;


const compress = () => {
  const c = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (IS_PROD) {
    c.minimizer = [
      new OptimizeCssAssets(),
      new Terser(),
    ];
  }
  return c;
};

const getFileName = extension => (IS_PROD ? `[name].[hash].${extension}` : `[name].${extension}`);

const generateHtmlPlugins = templateDir => {
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map(item => {
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];
    return new HTMLWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      // inject: false,
    });
  });
};

const htmlPlugins = generateHtmlPlugins(path.resolve(__dirname, 'src/views'));

const getPlugins = () => {
  const plugins = [
    // new webpack.HotModuleReplacementPlugin(),
    ...htmlPlugins,
    // new HTMLWebpackPlugin({
    //   template: './index.html',
    // }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/img'),
        to: path.resolve(__dirname, 'dist/img'),
      },
      {
        from: path.resolve(__dirname, 'src/fonts'),
        to: path.resolve(__dirname, 'dist/fonts'),
      },
      {
        from: path.resolve(__dirname, 'src/js-lib'),
        to: path.resolve(__dirname, 'dist/js-lib'),
      },
      {
        from: path.resolve(__dirname, 'src/css-lib'),
        to: path.resolve(__dirname, 'dist/css-lib'),
      },
    ]),
    new MiniCSSExtractPlugin({
      filename: getFileName('css'),
    }),
    new AssetsManifest({
      output: path.resolve(__dirname, 'dist/manifest.json'),
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ];

  if (IS_PROD && 0) plugins.push(new BundleAnalyzerPlugin());

  return plugins;
};

const cssLoaders = additional => {
  const loaders = [
    {
      loader: MiniCSSExtractPlugin.loader,
      options: {
        hmr: IS_DEV,
        reloadAll: true,
      },
    },
    'css-loader',
    {
      loader: 'postcss-loader',
      options: {
        plugins: [
          autoprefixer({
            overrideBrowserslist:['ie >= 8', 'last 4 version'],
          }),
        ],
        sourceMap: true,
      },
    },
  ];

  if (additional) {
    loaders.push(additional);
  }

  return loaders;
};


const getJsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  ];

  if (IS_DEV) {
    loaders.push('eslint-loader');
  }

  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: [
      '@babel/polyfill',
      './index.js',
    ],
    // other: './other.js',
  },
  output: {
    filename: getFileName('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: compress(),
  devtool: IS_DEV ? 'source-map' : '',
  resolve: {
    extensions: ['.js', '.json', '.css'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@styles': path.resolve(__dirname, 'src/styles'),
    },
  },
  plugins: getPlugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders(),
      },
      {
        test: /\.less$/,
        use: cssLoaders('less-loader'),
      },
      {
        test: /\.(sass|scss)$/,
        use: cssLoaders('sass-loader'),
      },
      {
        test: /\.(png|jpg|jpeg|svg|gif|ttf|woff|woff2)/,
        use: ['file-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: getJsLoaders(),
      },
    ],
  },
  devServer: {
    // hot: IS_DEV,
    port: 4200,
    historyApiFallback: IS_DEV,
    hot: IS_DEV,
    inline: IS_DEV,
    progress: IS_DEV,
    watchContentBase: IS_DEV,
  },
};

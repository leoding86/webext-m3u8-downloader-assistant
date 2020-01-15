'use strict';

const fs = require('fs-extra');
const backgroundConfig = require('./config/webpack.background.config');
const contentScriptsConfig = require('./config/webpack.content-scripts.config');
const optionsPageConfig = require('./config/webpack.options-page.config');
const popupConfig = require('./config/webpack.popup.config');

const platform = process.env.PLATFORM_ENV === 'firefox' ?
  'firefox' : 'chrome';

fs.emptyDirSync(`./dist/${platform}`);

module.exports = [
  backgroundConfig,
  contentScriptsConfig,
  optionsPageConfig,
  popupConfig
];

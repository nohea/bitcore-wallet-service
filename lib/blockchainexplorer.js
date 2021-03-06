'use strict';

var _ = require('lodash');
var $ = require('preconditions').singleton();
var log = require('npmlog');
log.debug = log.verbose;

var Insight = require('./blockchainexplorers/insight');
var Iquidus = require('./blockchainexplorers/iquidus');

var PROVIDERS = {
  'insight': {
    'livenet': 'https://insight.invalid.test:443',
    'testnet': 'https://test-insight.invalid.test:443',
  },
  'iquidus': {
    'livenet': 'http://localhost:3441',
    'testnet': 'http://localhost:3441',
  },
};

function BlockChainExplorer(opts) {
  $.checkArgument(opts);
  console.log("BlockChainExplorer(): " + JSON.stringify(opts));
  var provider = opts.provider || 'invalid';
  var network = opts.network || 'livenet';

  $.checkState(PROVIDERS[provider], 'Provider ' + provider + ' not supported');
  $.checkState(_.contains(_.keys(PROVIDERS[provider]), network), 'Network ' + network + ' not supported by this provider');

  var url = opts.url || PROVIDERS[provider][network];

  switch (provider) {
    case 'iquidus':
      return new Iquidus({
        network: network,
        url: url,
        apiPrefix: opts.apiPrefix,
        userAgent: opts.userAgent,
        feePerKb: opts.feePerKb,
      });
    case 'insight':
      return new Insight({
        network: network,
        url: url,
        apiPrefix: opts.apiPrefix,
        userAgent: opts.userAgent,
      });
    default:
      throw new Error('Provider ' + provider + ' not supported.');
  };
};

module.exports = BlockChainExplorer;

#!/usr/bin/env node

var fs = require('fs');

var ExpressApp = require('./lib/expressapp');
var WsApp = require('./lib/wsapp');
var config = require('./config');

var port = process.env.BWS_PORT || config.port || 3232;

var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;

var serverModule = config.https ? require('https') : require('http');
var serverOpts = {};

if (config.https) {
  serverOpts.key = fs.readFileSync(config.privateKeyFile || './ssl/privatekey.pem');
  serverOpts.cert = fs.readFileSync(config.certificateFile || './ssl/certificate.pem');
}

var startOne = function() {
  var app = ExpressApp.start(config);
  var server = config.https ? serverModule.createServer(serverOpts, app) :
    serverModule.Server(app);
  var ws = WsApp.start(server, config);
  server.listen(port);
  console.log('Bitcore Wallet Service running on port ' + port);
};

if (!config.cluster) {
  startOne();
} else {
  if (!config.storageOpts.multiLevel || !config.lockOpts.lockerServer)
    throw 'When running in cluster mode, multilevel and locker server need to be configured';

  var clusterInstances = config.clusterInstances || numCpus;

  if (cluster.isMaster) {
    for (var i = 0; i < clusterInstances; i++) {
      cluster.fork();
    }
    cluster.on('exit', function(worker, code, signal) {
      console.log('worker ' + worker.process.pid + ' died');
    });
  } else {
    startOne();
  }
}
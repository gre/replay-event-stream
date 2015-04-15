#!/usr/bin/env node

var program = require('commander');
var http = require('http');
var fs = require('fs');
var pkg = require("./package.json");
var es = require('event-stream');
var SlowStream = require("./SlowStream");

program
  .version(pkg.version)
  .usage('<recorded file> [options]')
  .option('-r, --rate [rate]', 'Rate at which speed the stream must go (in messages/sec)', 10)
  .option('-v, --rate-variation [rateVariation]', 'A value in [0.0,1.0[ which indicates the randomness of the rate', 0)
  // TODO not implemented yet
  //.option('-l, --loop [loop]', 'Make the stream loop forever', false)
  .option('-p, --port [port]', 'Port to run the server on.', 8888)
  .parse(process.argv);

if (program.args.length !== 1) {
  console.error("File required in parameter.");
  process.exit(1);
}

var filePath = program.args[0];

fs.stat(filePath, function (err, stats) {
  if (err) throw err;
  if (!stats.isFile()) {
    console.error("A valid text file is required.");
    process.exit(1);
  }
  startServer();
});



function startServer () {
  http.createServer(function(req, res) {
    if (req.url === "/") {
      var readStream =
      fs.createReadStream(filePath, { encoding: "utf8", bufferSize: 64 })
        .pipe(es.split())
        .pipe(es.map(function (data, cb) {
          if (data.length > 0 && data.indexOf("data: ")===0)
            cb(null, data+"\n\n");
          else
            cb(); // drop
        }))
        .pipe(new SlowStream({
          rate: program.rate,
          randomness: program.rateVariation
        }));

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8"
      });
      readStream.pipe(res);
      readStream.on('error', function(err) {
        res.end(err);
      });
    }
    else {
      res.writeHead(404);
      res.end();
    }
  }).listen(program.port);
  console.log("Listening on: http://127.0.0.1:"+program.port);
}

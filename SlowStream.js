
var Stream = require('stream').Stream;
var util = require('util');

function SlowStream (options) {
  Stream.call(this);

  this._rate = options.rate || 10;
  this._randomness = options.randomness || 0;

  this.writable = true;
  this.readable = true;

  this.queue = [];
  this._computeNextRateInterval();
  this._lastWrite = process.hrtime();
  this._timeout = null;
  this._ended = false;
  this._paused = false;
}

util.inherits(SlowStream, Stream);

SlowStream.prototype.write = function write (data) {
  this.queue.push(data);
  this.flush();
  return this.queue.length === 0;
};

SlowStream.prototype.resume = function resume () {
  this._paused = false;
  this.flush();
};

SlowStream.prototype.pause = function pause () {
  this._paused = true;
};

SlowStream.prototype._computeNextRateInterval = function () {
  var r = 1000 / (((1+this._randomness*(2*Math.random()-1)) * this._rate));
  if (isNaN(r) || r <= 0) r = 0;
  if (r > 500) r = 500;
  this._nextRateInterval = r;
};

SlowStream.prototype.flush = function flush () {
  var interval = process.hrtime(this._lastWrite);
  var maxInterval = this._nextRateInterval;
  var gap = interval[1] / 1000000 - maxInterval;

  if (this._paused) return;

  if (this.queue.length) {
    if (gap >= 0) {
      this.emit('data', this.queue.shift());
      this._lastWrite = process.hrtime();
      this._computeNextRateInterval();
    }

    if (!this._timeout) {
      this._timeout = setTimeout(function () {
        this._timeout = null;
        this.flush();
      }.bind(this), gap < 0 ? -gap : maxInterval);
    }
  } else if (this._ended) {
    if (!this._closed) {
      this._closed = true;
      this.emit('end');
      this.emit('close');
    }
  } else {
    this.emit('drain');
  }
};

SlowStream.prototype.end = function end () {
  this._ended = true;
  this.flush();
};

SlowStream.prototype.destroySoon = function destroySoon () {
  this.end();
};

SlowStream.prototype.destroy = function destroy () {
  this.end();
};

module.exports = SlowStream;

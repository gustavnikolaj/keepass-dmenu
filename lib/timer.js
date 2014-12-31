var globalTimerCount = 0;

function Timer(options) {
    options = options || {};

    globalTimerCount += 1;
    this.timerInstance = globalTimerCount;

    this.startTime = null;
    this.endTime = null;

    this.report = !!options.report;
    this.name = options.name || null;

    if (!!options.start) {
        this.start();
    }
}

Timer.prototype.log = function () {
    if (this.log) {
        var args = Array.prototype.slice.call(arguments);
        if (this.name) {
            console.log.apply(console, [this.name + ':'].concat(args));
        } else {
            console.log.apply(console, ['Timer', this.timerInstance + ':'].concat(args));
        }
    }
};

Timer.prototype.start = function () {
    this.startTime = Date.now();
    this.log('Started timer at', this.startTime);
};

Timer.prototype.end = function () {
    this.endTime = Date.now();
    this.log('Stopped timer at', this.endTime);
    this.log('Time elapsed:', this.endTime - this.startTime, 'ms');
};

module.exports = Timer;

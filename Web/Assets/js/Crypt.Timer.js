var Crypt;

Crypt = Crypt || {};

Crypt.Timer = function() {
  return {
    isEnd: false,
    Init: function(options, callback) {
      this.timeout = function() {};
      this.el = options.el;
      this.startTime = options.startTime;
      this.cb = callback;
      this.Start();
    },
    Start: function() {
      var startTime;
      clearTimeout(this.timeout);
      startTime = new Date(new Date(1, 1).setSeconds(this.startTime));
      this.el.text(getDateFormat(startTime));
      this.isEnd = false;
      this.checkTime();
    },
    Stop: function() {
      var startTime;
      clearTimeout(this.timeout);
      startTime = new Date(new Date(1, 1).setSeconds(0));
      this.el.text(getDateFormat(startTime));
      this.isEnd = true;
    },
    checkTime: function() {
      var date;
      date = window.getDate(this.el.text());
      if (date.getMinutes() === 0 && date.getSeconds() === 0) {
        this.cb.end();
        this.Stop();
      } else {
        if (date.getMinutes() === 2 && date.getSeconds() === 0) {
          this.cb.canResend();
        }
        date = new Date(date.getTime() - 1000);
        this.el.text(getDateFormat(date));
      }
      this.timeout = setTimeout(_.bind(function() {
        this.checkTime();
      }, this), 1000);
    }
  };
};

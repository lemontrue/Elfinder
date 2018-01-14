var Crypt;

Crypt = Crypt || {};

Crypt.Dialogs = Crypt.Dialogs || {};


/**
 * Основной Диалог
 */

Crypt.Dialog = function() {
  var _ref;
  return {
    options: {
      immediately: false,
      html: null,
      "class": '',
      uniqId: null,
      onClose: Function.prototype,
      onHide: Function.prototype,
      hideCloseBtn: false,
      closeOnOverlayClick: true,
      visibleToolbar: false,
      top: null
    },
    tpl: {
      wrap: '<div class="fancybox-wrap js-dialog" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner modal-window js-dialog-content "></div></div></div></div>',
      image: '<img class="fancybox-image" src="{href}" alt="" />',
      iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0"' + ((_ref = $.browser.msie) != null ? _ref : {
        ' allowtransparency="true"': ''
      }) + '></iframe>',
      error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
      closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
      next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
      prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
    },
    Open: function(type, data, options) {
      var fbOptions, html, template;
      data = (data != null ? data : data) || {};
      fbOptions = {
        tpl: this.tpl,
        wrapCSS: 'blank-modal',
        autoSize: true,
        helpers: {
          overlay: 1
        },
        afterClose: _.bind(function() {
          return $(this).trigger('onClose');
        }, this)
      };
      fbOptions = _.extend(fbOptions, options);
      switch (type) {
        case 'blankError':
          fbOptions.wrapCSS = 'error-modal';
          template = $('#tpl-blankError').text();
          html = _.template(template)(data);
          break;
        case 'blankInfo':
          fbOptions.wrapCSS = 'info-modal';
          template = $('#tpl-blankInfo').text();
          html = _.template(template)(data);
          break;
        case 'blankCentered':
          fbOptions.wrapCSS = 'blank-centered';
          template = $('#tpl-blankCentered').text();
          html = _.template(template)(data);
          break;
        default:
          template = $('#tpl-' + type).text();
          html = _.template(template)(data);
          break;
      }
      $.fancybox.open(html, fbOptions);
      this.$dialog = $('.js-dialog');
      this.$content = this.$dialog.find('.js-dialog-content');
    },
    SetOptions: function(options) {
      _.extend(this.options, options);
      this.options.onClose = _.isFunction(this.options.onClose) ? this.options.onClose : Function.prototype;
      this.options.onHide = _.isFunction(this.options.onHide) ? this.options.onHide : Function.prototype;
    },
    Close: function() {
      $.fancybox.close();
      return false;
    },
    Hide: function() {
      this.options.onHide();
      this.$dialog.addClass('hidden');
      this.closeOrHide();
    }
  };
};

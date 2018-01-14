var Crypt;

Crypt = window.Crypt || {};

Crypt.Pages.Landing = _.extend(Crypt.Pages, {
  checkPinCount: 0,
  fancyboxRedirect: true,
  regTipOptions: {
    tipJoint: "left",
    background: '#fff5d2',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fee8ae'
  },
  ln: Crypt.l18n.Login,
  initialize: function() {
    var isMobile, k;
    isMobile = {
      Android: function() {
        return navigator.userAgent.match(/Android/i);
      },
      BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
      },
      iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
      },
      Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
      },
      Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
      },
      any: function() {
        return isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows();
      }
    };
    this.$error = $('.error-mess');
    this.$registration = $('.js-registration-form');
    this.$feedback = $('.js-feedback, .js-float-feedback');
    this.$registrationBox = $('.js-registration-box');
    this.$showRegistration = $('.js-show-registration');
    this.$login1 = $('#login1');
    this.$kobilButton = $('#kobilButton');
    this.$password = $('#password');
    this.$pinCode = $('#pinCode');
    this.$kobilLogin2 = $('#kobilLogin');
    this.$fixedHeader = $('.js-fixed-header');
    this.$eye = $('.js-eye');
    if (!isMobile.any()) {
      $(document).scroll(function() {
        var k;
        k = $(this).scrollLeft();
        $('.i-fixed').css('left', -k);
      });
      k = $(document).scrollLeft();
      $('.js-fixed-header').css('left', -k);
    } else {
      $('.i-fixed').css('left', 'inherit !important');
    }
    this.render();
  },
  render: function() {
    if ($.cookie('haveAccount') === "true") {
      location.href = Crypt.Urls.Login;
      return false;
    } else {
      $('.js-app-landing').removeClass('hidden');
    }
    this.$registration.validate(_.extend(Crypt.Config.Forms.Registration, {
      submitHandler: _.bind(function() {
        if ($('.js-onRegistration').hasClass('disabled')) {
          return false;
        }
        Crypt.Preloader.Block(this.$registrationBox);
        this.checkRegPhone();
        return false;
      }, this)
    }));
    this.$registration.submit(function() {
      return false;
    });
    Crypt.Helpers.MaskPhone($("input.js-phone"));
    this.initSlider();
    new Opentip($(".js-registrationCity-tip"), this.ln.AutoCity, '', this.regTipOptions);
    return this.onEvents();
  },
  onEvents: function() {
    $(window).scroll(function() {
      $('.js-fixed-header').toggleClass('i-fixed', $(window).scrollTop() > 0).toggleClass('i-top', $(window).scrollTop() === 0);
      $('.js-scrollUp').toggleClass('show', $(window).scrollTop() > 550);
      $('.js-float-feedback').toggleClass('show', $(window).scrollTop() > 550);
    });
    this.$showRegistration.click(_.bind(function() {
      Crypt.Helpers.ScrollToEl(this.$registration);
      return false;
    }, this));
    $('.js-scrollUp').click(_.bind(function() {
      Crypt.Helpers.ScrollTo(0, 300);
      return false;
    }, this));
    this.$eye.on('click', _.bind(function() {
      if (!this.$eye.hasClass('active')) {
        this.$eye.addClass('active').siblings('input').attr('type', 'text');
      } else {
        this.$eye.removeClass('active').siblings('input').attr('type', 'password');
      }
      return false;
    }, this));
    this.$registration.find('input').on('focusout keypress', function() {
      var form, self;
      self = this;
      form = $(self).closest('form');
      return setTimeout((function() {
        var empty, errors;
        errors = !!form.find('input.error').length;
        empty = false;
        form.find("input").each(function(i, e) {
          if ($(e).val() === '') {
            return empty = true;
          }
        });
        $('.js-onRegistration').toggleClass('disabled', errors || empty);
      }), 200);
    });
    $('.js-city-search').autocomplete({
      serviceUrl: '/registration/CityAutocomplete',
      paramName: "pattern",
      minChars: 3,
      dataType: 'json',
      transformResult: function(response) {
        return {
          suggestions: $.map(response.Cities, function(Item) {
            return {
              value: Item
            };
          })
        };
      }
    });
    this.$feedback.on('click', function() {
      var t;
      t = new Crypt.Dialogs.Feedback();
      return t.initialize();
    });
  },
  onScroll: function() {
    var isFixed, isTop;
    isTop = $("body").scrollTop() === 0;
    isFixed = this.$fixedHeader.hasClass('i-fixed');
    if (isTop && isFixed) {
      this.$fixedHeader.removeClass('i-fixed');
    }
    if (!isTop && !isFixed) {
      this.$fixedHeader.addClass('i-fixed');
    }
  },
  initSlider: function() {
    var el;
    el = $('.jcarousel');
    el.jcarousel({
      wrap: 'both'
    });
    el.on('jcarousel:scrollend', function(event, carousel) {
      var tab;
      tab = el.jcarousel('target').data('tab');
      $('.js-slider-related.js-fiz').toggleClass('hidden', tab !== 1);
      return $('.js-slider-related.js-biz').toggleClass('hidden', tab === 1);
    });
    $('.jcarousel-control-prev').jcarouselControl({
      target: '-=1'
    });
    $('.jcarousel-control-next').jcarouselControl({
      target: '+=1'
    });
    return $('.jcarousel-pagination').on('jcarouselpagination:active', 'li', function() {
      $(this).addClass('active');
    }).on('jcarouselpagination:inactive', 'li', function() {
      $(this).removeClass('active');
    }).jcarouselPagination({
      'item': function(page, carouselItems) {
        return '<li><a href="#' + page + '">' + $(carouselItems).data('title') + '</a></li>';
      }
    });
  },
  getRegPhone: function() {
    return Number($('input[name=Phone]').val().replace(/\D+/g, ""));
  },
  showRegistrationError: function(error) {
    new Crypt.Dialog().Open('blankError', {
      title: 'Ошибка!',
      text: error.Message
    });
  },
  submitRegForm: function() {
    $.ajax({
      url: '/registration',
      data: {
        'Model.Phone': this.getRegPhone(),
        'Model.FIO': $('input[name=FIO]').val(),
        'Model.City': $('input[name=City]').val(),
        'Model.Email': $('input[name=Email]').val(),
        'Model.Password': $('input[name=Password]').val()
      },
      success: _.bind(function(response) {
        if (response.Error) {
          this.showRegistrationError(response.Error);
          Crypt.Preloader.UnBlock(this.$registrationBox);
        } else {
          $.cookie('afterRegistration', 'true', {
            expires: 5,
            path: '/'
          });
          $.cookie('logined', true, {
            expires: 365,
            path: '/'
          });
          location.href = Crypt.Urls.Profile;
        }
      }, this),
      error: _.bind(function() {
        new Crypt.Dialog().Open('blankCentered', this.ln.ErrorReg);
        Crypt.Preloader.UnBlock(this.$registrationBox);
      }, this)
    });
  },

  /**
    Поднимаем диалог подтверждения телефона
   */
  checkRegPhone: function() {
    var RegPhoneConfirm;
    RegPhoneConfirm = new Crypt.Dialogs.RegPhoneConfirm();
    RegPhoneConfirm.initialize(this.getRegPhone(), this.$registrationBox.find('input[name=Email]').val(), {
      success: _.bind(function() {
        this.submitRegForm();
      }, this),
      canceled: _.bind(function() {
        Crypt.Preloader.UnBlock(this.$registrationBox);
      }, this),
      error: _.bind(function() {
        new Crypt.Dialog().Open('blankCentered', this.ln.ErrorReg);
        Crypt.Preloader.UnBlock(this.$registrationBox);
      }, this)
    });
  }
});

Crypt.Pages.Landing.initialize();


/**
 * Диалог активации маркера
 */
Crypt.Dialogs.MarkerActivation = Crypt.View.extend({
  events: {
    'click .js-tabs-title .js-item': 'onTabTitlesClick',
    'keyup .js-auth': 'onAuthChange',
    'keyup .js-pin': 'onEnterPin',
    'keypress .js-new-pin': 'onEnterNewPin',
    'click .js-next': 'onClickNext',
    'click .js-change': 'onClickChange',
    'click .js-back': 'onClickBack',
    'click .js-confirm-decline': 'onConfirmDecline',
    'click .js-cancel-decline': 'onCancelDecline',
    'click .js-cancel': 'onCloseDialog',
    'click .js-print': 'onPrint',
    'click .js-resend': 'resendSms'
  },
  timerTime: 180,
  template: 'markerActivation',
  tryCount: 0,
  maxTryCount: 5,
  activeTab: 0,
  canStep2: false,
  canClose: true,
  isAuth: false,
  markerId: '',
  ln: Crypt.l18n.MarkerActivation,
  initialize: function(data, callback) {
    this.cb = callback;
    this.setDialog();
    this.render();
  },
  setDialog: function() {
    this.dialog = new Crypt.Dialog();
    this.dialog.Open(this.template, {}, {
      wrapCSS: 'empty-modal',
      beforeClose: _.bind(function() {
        if (this.$footer.hasClass('disabled')) {
          return false;
        }
        if (this.activeTab === 3) {
          location.reload();
          return false;
        }
        this.beforeClose();
        return this.canClose;
      }, this)
    });
    return this.setElement(this.dialog.$content);
  },

  /**
   * Рендерим шаблон, кэшируем объекты, запускаем таймер
   */
  render: function() {
    scroll.update();
    this.$footer = this.$('.js-dialog-footer');
    this.$tabsTitlesBlock = this.$('.js-tabs-title');
    this.$tabsTitles = this.$('.js-tabs-title .js-item');
    this.$tabs = this.$('.js-tab-content');
    this.$authFrom = this.$('.js-auth');
    this.$loginField = this.$('.js-login');
    this.$passField = this.$('.js-pass');
    this.$pinField = this.$('.js-pin');
    this.$phoneForm = this.$('.js-phone-confirm');
    this.$loader = this.$('.js-loader');
    this.$changeAuth = this.$('.js-change');
    this.$resendBtn = this.$('.js-resend');
    this.$errorBlock = this.$('.js-error');
    this.$errorRequestBlock = this.$('.js-error-request');
    this.$timerEl = this.$('.js-time');
    this.$certInfoEl = this.$('.js-cert-info');
    this.$printBtn = this.$('.js-print');
    this.$cancelBtn = this.$('.js-cancel');
    this.$backBtn = this.$('.js-back');
    this.$nextBtn = this.$('.js-next');
    this.$subDialogCancel = this.$('.js-sub-dialog-cancel');
    this.$subDialogBack = this.$('.js-sub-dialog-back');
    this.$subDialogChangeAuth = this.$('.js-sub-dialog-change-auth');
    this.$subDialogConfirmRequest = this.$('.js-sub-dialog-confirm-request');
    this.$loginField.focus();
  },
  onConfirmDecline: function() {
    this.unBlockNavigation();
    this.onCloseDialog();
    return false;
  },
  onCloseDialog: function() {
    if (this.$footer.hasClass('disabled')) {
      return false;
    }
    this.canClose = true;
    return this.dialog.Close();
  },
  onCancelDecline: function() {
    this.Hide(this.$subDialogCancel);
    this.unBlockNavigation();
  },
  beforeClose: function() {
    if (!this.canClose) {
      this.blockNavigation();
      this.Show(this.$subDialogCancel);
    }
    return false;
  },
  onClickBack: function() {
    if (this.$footer.hasClass('disabled')) {
      return false;
    }
    this.changeTab(this.activeTab - 1);
    return false;
  },
  blockNavigation: function() {
    this.$tabsTitlesBlock.addClass('disabled');
    this.$footer.addClass('disabled');
  },
  unBlockNavigation: function() {
    this.$tabsTitlesBlock.removeClass('disabled');
    this.$footer.removeClass('disabled');
  },
  onTabTitlesClick: function(e) {
    var index;
    if (this.$tabsTitlesBlock.hasClass('disabled')) {
      return false;
    }
    index = this.$tabsTitles.index($(e.currentTarget));
    if (index === 1) {
      if (this.isAuth && this.canStep2) {
        this.changeTab(index);
      }
    } else {
      if (this.activeTab === 1 && index === 2) {
        return false;
      } else {
        this.changeTab(index);
      }
    }
    return false;
  },
  onAuthChange: function(e) {
    if (this.$loginField.val().length && this.$passField.val().length) {
      this.$nextBtn.removeClass('disabled');
      if (Crypt.Helpers.IsEnter(e)) {
        this.$nextBtn.trigger('click');
      }
    } else {
      this.$nextBtn.addClass('disabled');
    }
  },
  onEnterPin: function(e) {
    this.$pinField.removeClass('error');
    if ((this.$pinField.val().length)) {
      this.$nextBtn.removeClass('disabled');
      if (Crypt.Helpers.IsEnter(e)) {
        this.$nextBtn.trigger('click');
      }
    } else {
      this.$nextBtn.addClass('disabled');
    }
  },
  onEnterNewPin: function(e) {
    var code;
    this.hideErrorRequest();
    code = e.which ? e.which : e.keyCode;
    return /[0-9]/.test(String.fromCharCode(code));
  },
  onClickChange: function() {
    this.Show(this.$subDialogChangeAuth);
    this.blockNavigation();
    this.$subDialogChangeAuth.find('.js-confirm-change-auth').off().on('click', _.bind(function() {
      this.unBlockNavigation();
      this.Hide(this.$subDialogChangeAuth, this.$phoneForm, this.$changeAuth, this.$resendBtn);
      this.hideError();
      this.tryCount = 0;
      this.isAuth = false;
      this.canStep2 = false;
      this.$authFrom.find('input').removeAttr('disabled');
      this.$nextBtn.addClass('disabled');
    }, this));
    this.$subDialogChangeAuth.find('.js-cancel-change-auth').off().on('click', _.bind(function() {
      this.unBlockNavigation();
      this.Hide(this.$subDialogChangeAuth);
    }, this));
    return false;
  },
  onClickNext: function() {
    if (this.$nextBtn.hasClass('disabled') || this.$footer.hasClass('disabled')) {
      return false;
    }
    if (this.activeTab === 0) {
      if (this.isAuth) {
        if (this.canStep2) {
          this.changeTab(1);
        } else {
          this.checkCode();
        }
      } else {
        this.loginMarker();
      }
      return false;
    }
    if (this.activeTab === 1) {
      this.changeTab(2);
      return false;
    }
    if (this.activeTab === 2) {
      this.onSendRequest();
      return false;
    }
    if (this.activeTab === 3) {
      location.reload();
      return false;
    }
    return false;
  },
  changeTab: function(newTab) {
    if (this.activeTab === 3) {
      return false;
    }
    if (this.activeTab !== newTab && (this.activeTab !== 0 || (newTab === 1 && this.canStep2))) {
      if (newTab < this.activeTab) {
        this.Show(this.$subDialogBack);
        this.blockNavigation();
        this.$subDialogBack.find('.js-confirm-back').off().on('click', _.bind(function() {
          this.unBlockNavigation();
          this.Hide(this.$subDialogBack);
          this.activeTab = newTab;
          this.toggleTab();
        }, this));
        this.$subDialogBack.find('.js-cancel-back').off().on('click', _.bind(function() {
          this.unBlockNavigation();
          this.Hide(this.$subDialogBack);
        }, this));
      } else {
        this.activeTab = newTab;
        this.toggleTab();
      }
    } else {
      return false;
    }
  },
  toggleTab: function() {
    this.$tabsTitles.removeClass('active');
    this.Hide(this.$tabs);
    $(this.$tabsTitles[this.activeTab - 1]).addClass('done');
    $(this.$tabsTitles[this.activeTab]).addClass('active');
    $(this.$tabsTitles[this.activeTab]).removeClass('done');
    this.Show($(this.$tabs[this.activeTab]));
    this.Hide(this.$backBtn, this.$cancelBtn);
    this.$tabsTitlesBlock.removeClass('step1 step2 step3');
    this.canClose = true;
    if (this.activeTab === 0) {
      this.$nextBtn.text('Продолжить');
      this.Show(this.$cancelBtn);
      this.$tabsTitlesBlock.addClass('step1');
    }
    if (this.activeTab === 1) {
      $.fancybox.update();
      this.$nextBtn.text('Все верно, продолжить');
      this.Show(this.$backBtn);
      this.$nextBtn.removeClass('disabled');
      this.$tabsTitlesBlock.addClass('step2');
      this.canClose = false;
    }
    if (this.activeTab === 2) {
      $('.tab-pin.js-tab-content').html(_.template($('#tpl-tab-pin').text())());
      cuSel({
        changedEl: "#savePin",
        visRows: 500,
        scrollArrows: false
      });
      this.$nextBtn.text('Отправить запрос');
      this.Show(this.$backBtn);
      this.$tabsTitlesBlock.addClass('step3');
      this.canClose = false;
      this.$('.js-new-pin').val('');
      new Opentip($("#MarkerNewPin_info"), this.ln.MarkerNewPin_info);
      new Opentip($("#MarkerPinContainer_info"), this.ln.MarkerPinContainer_info);
      Opentip.lastZIndex = 9000;
    }
    if (this.activeTab === 3) {
      this.$tabsTitlesBlock.addClass('disabled');
      this.canClose = true;
      this.$nextBtn.text('ОК');
    }
  },
  loginMarker: function() {
    this.blockTabAuth();
    $.ajax({
      url: Crypt.Urls.MarkerLogon,
      data: {
        login: this.$loginField.val(),
        password: this.$passField.val()
      },
      success: _.bind(function(response) {
        if (response.Error) {
          switch (response.Error.Code) {
            case 3:
              this.showError(this.ln.LogonError);
              break;
            case 20:
              if (response.MarkerStatus === 1) {
                this.showError(this.ln.SameErrorCode20.format('Не отправлен'));
              } else if (response.MarkerStatus === 2) {
                this.showError(this.ln.SameErrorCode20.format('Отправлен'));
              } else if (response.MarkerStatus === 3) {
                this.showError(this.ln.SameErrorCode20.format('В обработке'));
              } else if (response.MarkerStatus === 4) {
                this.showError(this.ln.SameErrorCode20.format('Одобрен'));
              } else if (response.MarkerStatus === 5) {
                this.showError(this.ln.SameErrorCode20.format('Отклонен'));
              } else if (response.MarkerStatus === 6) {
                this.showError(this.ln.SameErrorCode20.format('Подтвержден'));
              }
              break;
            default:
              this.showError(this.ln.SameError.format(response.Error.Message));
              break;
          }
          this.unBlockTabAuth();
        } else {
          this.hideError();
          this.markerId = response.CurrentMarkerId;
          switch (response.Status) {
            case 0:
              this.isAuth = true;
              this.canStep2 = true;
              this.blockAuth();
              this.getCertInfo();
              break;
            case 1:
              this.isAuth = true;
              this.canStep2 = false;
              this.$pinField.val();
              this.Hide(this.$resendBtn);
              this.unBlockTabAuth();
              this.needSMS();
              break;
            default:
              break;
          }
        }
      }, this),
      error: function() {
        this.unBlockTabAuth();
      }
    });
  },
  getCertInfo: function() {
    $.ajax({
      url: Crypt.Urls.MarkerCertInfo,
      data: {
        currentMarkerId: this.markerId
      },
      success: _.bind(function(response) {
        var data, i, template;
        if (response.Status === 0) {
          i = response.ShowingInfo;
          data = {
            name: _.find(i, function(el) {
              return el.Name === 'SN';
            }) || {},
            surname: _.find(i, function(el) {
              return el.Name === 'G';
            }) || {},
            post: _.find(i, function(el) {
              return el.Name === 'T';
            }) || {},
            address: _.find(i, function(el) {
              return el.Name === 'STREET';
            }) || {},
            company: _.find(i, function(el) {
              return el.Name === 'O';
            }) || {},
            department: _.find(i, function(el) {
              return el.Name === 'OU';
            }) || {},
            city: _.find(i, function(el) {
              return el.Name === 'L';
            }) || {},
            region: _.find(i, function(el) {
              return el.Name === 'S';
            }) || {},
            country: _.find(i, function(el) {
              return el.Name === 'C';
            }) || {},
            email: _.find(i, function(el) {
              return el.Name === 'E';
            }) || {},
            inn: _.find(i, function(el) {
              return el.Name === 'ИНН';
            }) || {},
            ogrnip: _.find(i, function(el) {
              return el.Name === 'ОГРНИП';
            }) || {},
            ogrn: _.find(i, function(el) {
              return el.Name === 'ОГРН';
            }) || {},
            snils: _.find(i, function(el) {
              return el.Name === 'СНИЛС';
            }) || {},
            KeyUsage: _.find(i, function(el) {
              return el.Name === 'KeyUsage';
            }) || {},
            EnhancedKeyUsage: _.find(i, function(el) {
              return el.Name === 'EnhancedKeyUsage';
            }) || {},
            CertificatePolicies: _.find(i, function(el) {
              return el.Name === 'CertificatePolicies';
            }) || {}
          };
          data = _.each(data, function(el, i) {
            if (!!el && !!el.Value) {
              el.Text = el.Value;
            } else {
              el.Text = '';
            }
          });
          log(data);
          this.certInfo = {
            name: data.name.Text + ' ' + data.surname.Text,
            post: data.post.Text,
            address: data.address.Text,
            company: data.company.Text + data.department.Text,
            city: data.city.Text,
            region: data.region.Text + ', ' + data.country.Text,
            email: data.email.Text,
            inn: data.inn.Text,
            ogrn: data.ogrn.Text,
            ogrnip: data.ogrnip.Text,
            snils: data.snils.Text,
            KeyUsage: data.KeyUsage.Text ? data.KeyUsage.Text.replace(/,/g, ', ') : '',
            EnhancedKeyUsage: data.EnhancedKeyUsage.Text
          };
          log(this.certInfo);
          if (this.certInfo.name.length > 25) {
            this.certInfo.name = this.certInfo.name.substr(0, 25) + '...';
          }
          template = $('#tpl-markerCertInfo').text();
          this.$certInfoEl.html(_.template(template)(this.certInfo));
          this.printText = _.template(template)(this.certInfo);
          this.unBlockTabAuth();
          this.changeTab(1);
        } else if (response.Status === 3) {
          this.loginMarker();
        }
      }, this),
      error: function() {
        this.unBlockTabAuth();
      }
    });
  },
  onPrint: function() {
    var newWin;
    newWin = window.open("about:blank", "Print certificate info ");
    newWin.document.write(_.template($('#tpl-markerCertInfo-print').text())());
    newWin.document.write(this.printText);
    newWin.print();
    return false;
  },
  blockAuth: function() {
    this.Show(this.$changeAuth);
    return this.$authFrom.find('input').attr('disabled', 'disabled');
  },
  showError: function(text) {
    return this.Show(this.$errorBlock.html(text));
  },
  hideError: function() {
    this.Hide(this.$errorBlock);
    return this.$('.js-new-pin').removeClass('error');
  },
  showErrorRequest: function(text) {
    this.Show(this.$errorRequestBlock.html(text));
    return this.$('.js-new-pin').addClass('error');
  },
  hideErrorRequest: function() {
    return this.Hide(this.$errorRequestBlock);
  },
  blockTabAuth: function() {
    this.$nextBtn.addClass('disabled');
    return this.Show(this.$loader);
  },
  unBlockTabAuth: function() {
    if (!this.isAuth) {
      this.$nextBtn.removeClass('disabled');
    }
    return this.Hide(this.$loader);
  },
  needSMS: function() {
    this.blockAuth();
    this.Show(this.$phoneForm);
    this.$pinField.focus();
    return this.activeTimer();
  },
  activeTimer: function() {
    this.timer = new Crypt.Timer();
    return this.timer.Init({
      el: this.$timerEl,
      startTime: this.timerTime
    }, {
      end: _.bind(function() {}, this),
      canResend: _.bind(function() {
        this.Show(this.$resendBtn);
      }, this)
    });
  },

  /**
   * Запрашиваем новый пин
   */
  resendSms: function() {
    if (this.tryCount >= this.maxTryCount) {
      this.timer.Stop();
      this.showError(this.ln.MaxTryCountError);
      this.$nextBtn.addClass('disabled');
      return false;
    }
    this.tryCount++;
    $.ajax({
      url: Crypt.Urls.MarkerResendSms,
      data: {
        currentMarkerId: this.markerId
      },
      success: _.bind(function(response) {
        this.Hide(this.$resendBtn);
        this.timer.Start();
        this.$nextBtn.removeClass('disabled');
        this.$pinField.removeClass('error').val('').focus();
        this.hideError();
      }, this),
      error: _.bind(function() {}, this)
    });
    return false;
  },

  /**
   * Проверяем введенный пин
   */
  checkCode: function() {
    if (this.timer.isEnd) {
      this.showError('Срок действия кода истек!');
      this.$nextBtn.addClass('disabled');
      return false;
    }
    this.$nextBtn.addClass('disabled');
    $.ajax({
      url: Crypt.Urls.MarkerCheckSms,
      data: {
        pin: this.$pinField.val(),
        currentMarkerId: this.markerId
      },
      success: _.bind(function(response) {
        if (response.Status === 0 && response.Error === null) {
          this.markerId = response.CurrentMarkerId;
          this.canStep2 = true;
          this.Hide(this.$phoneForm);
          this.getCertInfo();
        } else {
          if (response.Error.Code === 9) {
            this.showError("Неверный код");
            this.$pinField.addClass('error');
          } else {
            this.showError(this.ln.SameError.format(response.Error.Message));
          }
        }
      }, this),
      error: _.bind(function() {
        this.showError("Произошла ошибка, попробуйте повторить запрос позднее");
      }, this)
    });
  },
  onSendRequest: function() {
    if (!this.validateRequest()) {
      return false;
    }
    this.blockNavigation();
    if (this.$('.js-send-sms').is(':checked') || this.$('.js-send-email').is(':checked')) {
      this.Show(this.$subDialogConfirmRequest);
      if (this.$('.js-send-sms').is(':checked') && this.$('.js-send-email').is(':checked')) {
        $('.js-confirm-request-text').html(this.ln.PinBySMSandEmail);
      } else {
        $('.js-confirm-request-text').html(this.$('.js-send-sms').is(':checked') ? this.ln.PinBySMS : this.ln.PinByEmail);
      }
      this.$subDialogConfirmRequest.find('.js-confirm-request').off().on('click', _.bind(function() {
        this.Hide(this.$subDialogConfirmRequest);
        this.SendRequest();
      }, this));
      this.$subDialogConfirmRequest.find('.js-cancel-request').off().on('click', _.bind(function() {
        this.unBlockNavigation();
        this.Hide(this.$subDialogConfirmRequest);
      }, this));
    } else {
      this.SendRequest();
    }
    return false;
  },
  SendRequest: function() {
    Crypt.Preloader.Block($('.modal-markerActivation'));
    if (this.validateRequest()) {
      $.ajax({
        url: Crypt.Urls.MarkerSendRequest,
        data: {
          currentMarkerId: this.markerId,
          login: this.$loginField.val(),
          password: this.$passField.val(),
          pin: this.$('.js-new-pin').val(),
          SavePIN: false,
          SendSMS: this.$('.js-send-sms').is(':checked'),
          SendEmail: this.$('.js-send-email').is(':checked')
        },
        success: _.bind(function(response) {
          this.unBlockNavigation();
          this.$('.js-dialog-body').html(this.ln.SuccessRequest);
          this.activeTab = 3;
          this.toggleTab();
          Crypt.Preloader.UnBlock($('.modal-markerActivation'));
        }, this),
        error: _.bind(function() {
          Crypt.Preloader.UnBlock($('.modal-markerActivation'));
        }, this)
      });
    }
  },
  validateRequest: function() {
    this.hideErrorRequest();
    if (this.$('.js-new-pin').val().length !== 8) {
      this.showErrorRequest(this.ln.PinLength);
      return false;
    }
    if (!/[0-9]/.test(this.$('.js-new-pin').val())) {
      this.showErrorRequest(this.ln.PinNumbers);
      return false;
    }
    return true;
  }
});

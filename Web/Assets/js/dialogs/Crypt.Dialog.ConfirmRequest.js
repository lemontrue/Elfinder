
/**
 * Диалог активации маркера
 */
Crypt.Dialogs.ConfirmRequest = Crypt.View.extend({
  events: {
    'click .js-confirm': 'onClickNext',
    'click .js-cancel': 'onCloseDialogTry',
    'click .js-sub-confirm': 'onCloseDialog',
    'click .js-sub-cancel': 'onCancelDecline'
  },
  template: 'confirmRequestSend',
  canClose: false,
  initialize: function(markerId, callback) {
    this.cb = callback;
    this.markerId = markerId;
    this.getMarkerInfo();
  },
  setDialog: function() {
    this.dialog = new Crypt.Dialog();
    this.dialog.Open(this.template, this.certInfo, {
      wrapCSS: 'empty-modal',
      beforeClose: _.bind(function() {
        if (this.$footer.hasClass('disabled')) {
          return false;
        }
        this.beforeClose();
        return this.canClose;
      }, this)
    });
    this.setElement(this.dialog.$content);
    return this.render();
  },

  /**
   * Рендерим шаблон, кэшируем объекты
   */
  render: function() {
    this.$footer = this.$('.js-dialog-footer');
    this.$nextBtn = this.$('.js-confirm');
    this.$subDialogCancel = this.$('.js-sub-dialog');
  },
  onCloseDialog: function() {
    this.canClose = true;
    this.dialog.Close();
    return Crypt.Preloader.UnBlock($('#myCertificateList'));
  },
  onCloseDialogTry: function() {
    return this.dialog.Close();
  },
  onCancelDecline: function() {
    this.Hide(this.$subDialogCancel);
  },
  beforeClose: function() {
    if (!this.canClose) {
      this.Show(this.$subDialogCancel);
    }
    return false;
  },
  blockNavigation: function() {
    this.$footer.addClass('disabled');
  },
  unBlockNavigation: function() {
    this.$tabsTitlesBlock.removeClass('disabled');
    this.$footer.removeClass('disabled');
  },
  onClickNext: function() {
    if (this.$nextBtn.hasClass('disabled' || this.$footer.hasClass('disabled'))) {
      return false;
    }
    this.pinDialog = new Crypt.Dialogs.ConfirmRequestPin(_.bind(function(pin) {
      return this.sendRequest(pin);
    }, this));
    return false;
  },
  getMarkerInfo: function() {
    debugger;
    $.ajax({
      url: Crypt.Urls.MarkerRequestCertInfo,
      data: {
        currentMarkerId: this.markerId
      },
      success: _.bind(function(response) {
        var data, i;
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
          if (this.certInfo.name.length > 30) {
            this.certInfo.name = this.certInfo.name.substr(0, 30) + '...';
          }
        }
        this.setDialog();
      }, this),
      error: function() {}
    });
  },
  sendRequest: function(pin) {
    Crypt.Preloader.Block($('.js-dialog'));
    $.ajax({
      url: Crypt.Urls.MarkerRequestConfirm,
      data: {
        requestId: this.markerId,
        pin: pin
      },
      success: _.bind(function(response) {
        Crypt.Preloader.UnBlock($('.js-dialog'));
        if (!!response && !response.Error) {
          new Crypt.Dialogs.RequestCongratulation();
        } else {
          (new Crypt.Dialog).Open('blankError', {
            text: 'Во время операции подтверждения выпуска сертификата произошла ошибка. Повторите действие позже'
          }, {
            afterClose: _.bind(function() {
              this.getMarkerInfo();
            }, this)
          });
        }
      }, this),
      error: _.bind(function(response) {
        Crypt.Preloader.UnBlock($('.js-dialog'));
        (new Crypt.Dialog).Open('blankError', {
          text: 'Во время операции подтверждения выпуска сертификата произошла ошибка. Повторите действие позже'
        }, {
          afterClose: _.bind(function() {
            this.getMarkerInfo();
          }, this)
        });
      }, this)
    });
  }
});

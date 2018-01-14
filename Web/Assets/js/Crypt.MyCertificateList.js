
/**
 * Created by Kirill on 5/4/2015.
 */
var changePin, checkChangePinForm, checkResult, checkSetPin, clearPinFields, deletePin, hideModal, initCertificateList, setPinMethod, showModal, showSetPinModal;

checkSetPin = function() {
  var error, setpin;
  setpin = $.find('#setPin');
  error = $(setpin).parent().find('.info.error');
  if ($(setpin).val() === '') {
    $(setpin).addClass('error');
    return false;
  } else if (!/^[0-9]+$/.test($(setpin).val())) {
    $(error).show();
    $(setpin).addClass('error');
    return false;
  }
  return true;
};

checkChangePinForm = function() {
  var cntrLabelnewPinConfirmErr, cntrLabelnewPinErr, newPin, newPinConfirm, oldPin, result;
  result = true;
  newPin = $.find('#newPin');
  newPinConfirm = $.find('#newPinConfirm');
  oldPin = $.find('#oldPin');
  cntrLabelnewPinErr = $(newPin).parent().find('.info.error').hide();
  cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find('.info.error');
  if ($(newPin).val() === '') {
    $(newPin).addClass('error');
    result = false;
  }
  if (!/^[0-9]+$/.test($(newPin).val())) {
    $(cntrLabelnewPinErr).show();
    $(newPin).addClass('error');
    result = false;
  }
  if ($(oldPin).val() === '') {
    $(oldPin).addClass('error');
    result = false;
  }
  if ($(newPinConfirm).val() === '') {
    $(newPinConfirm).addClass('error');
    result = false;
  } else if ($(newPinConfirm).val() !== $(newPin).val()) {
    $(cntrLabelnewPinConfirmErr).show();
    $(newPinConfirm).addClass('error');
    result = false;
  }
  return result;
};

showSetPinModal = function(id, user2Cert) {
  var w;
  w = $('#modal #' + id);
  if (w[0]) {
    $(w).find('input[type=hidden]').val(user2Cert);
    w.show();
    w.parent().show();
  }
  clearPinFields();
};

showModal = function(id) {
  var w;
  w = $('#modal #' + id);
  if (w[0]) {
    w.show();
    w.parent().show();
  }
};

hideModal = function(id) {
  var w;
  w = $('#modal #' + id);
  if (w[0]) {
    $(w).find('input[type=hidden]').val('');
    w.hide();
    w.parent().hide();
  }
};

clearPinFields = function() {
  $('#newPin').val('');
  $('#newPinConfirm').val('');
  $('#oldPin').val('');
  $('#setPin').val('');
};

changePin = function(me) {
  var cntrLabelOldPinErr, form, oldPin, user2CertHid;
  if (!me) {
    return;
  }
  form = $(me).parent().parent();
  oldPin = $.find('#oldPin');
  cntrLabelOldPinErr = $(oldPin).parent().find('.info.error');
  user2CertHid = form.parent().find('input[type=hidden]');
  if (checkChangePinForm()) {
    $.ajax({
      url: Crypt.Urls.CertList.ChangePin,
      type: 'POST',
      data: {
        newPin: $('#newPin').val(),
        oldPin: $('#oldPin').val(),
        user2Cert: $(user2CertHid).val(),
        userId: $('#UserId').val()
      }
    }).always(function(resp) {
      if (resp.success) {
        $(user2CertHid).val('');
        hideModal('change-pin2');
        clearPinFields();
      } else if (resp.errorOldPin) {
        $(cntrLabelOldPinErr).show();
        $(oldPin).addClass('error');
      } else if (resp.redirectUrl) {
        location.href = resp.redirectUrl;
      } else {
        window.console && window.console.log && window.console.log(resp.exception);
        alert(resp.message);
      }
    });
  }
};

deletePin = function(usercert) {
  var certId;
  if (!usercert) {
    return;
  }
  certId = usercert;
  $.ajax({
    url: Crypt.Urls.CertList.DeletePin,
    type: 'POST',
    data: {
      user2Cert: certId,
      userId: $('#UserId').val()
    }
  }).always(function(resp) {
    if (resp.success) {
      _.each(certificates.certs, function(el) {
        if (el.MyCertificate.Id === certId) {
          el.MyCertificate.HasPIN = false;
        }
      });
      reRenderCertificates();
    } else if (resp.redirectUrl) {
      location.href = resp.redirectUrl;
    } else {
      window.console && window.console.log && window.console.log(resp.exception);
      alert(resp.message);
    }
  });
  return false;
};

setPinMethod = function(me) {
  var form, setpin, user2CertHid;
  if (!me) {
    return;
  }
  form = $(me).parent().parent();
  setpin = form.find('#setPin');
  user2CertHid = form.parent().find('input[type=hidden]');
  if (checkSetPin()) {
    $.ajax({
      url: Crypt.Urls.CertList.SetPin,
      type: 'POST',
      data: {
        newPin: $(setpin).val(),
        user2Cert: $(user2CertHid).val(),
        userId: $('#UserId').val()
      }
    }).always(function(resp) {
      if (resp.success) {
        _.each(certificates.certs, function(el) {
          if (el.MyCertificate.Id === $(user2CertHid).val()) {
            el.MyCertificate.HasPIN = true;
          }
        });
        $(user2CertHid).val('');
        hideModal('change-pin');
        clearPinFields();
        reRenderCertificates();
      } else if (resp.redirectUrl) {
        location.href = resp.redirectUrl;
      } else {
        window.console && window.console.log && window.console.log(resp.exception);
        alert(resp.message);
      }
    });
  }
};

checkResult = function(resp) {
  if (resp.redirectUrl) {
    location.href = resp.redirectUrl;
  }
  scroll.update();
  initCertificateList();
};

initCertificateList = function() {
  $('#certificats-list').find('input[type=text]').each(function(ind, el) {
    var a, changeState, data, defState, hid, saveHandler, saveState;
    data = $(el).val();
    a = $(el).parent().find('a.small-text:first');
    hid = $(el).parent().find('input[type=hidden]:first');
    saveHandler = function() {
      var id, name;
      name = $(el).val();
      id = $(hid).val();
      $.ajax({
        url: Crypt.Urls.CertList.SaveCertFriendlyName,
        type: 'POST',
        data: {
          name: name,
          certId: id,
          userId: $('#UserId').val()
        }
      }).always(function(resp) {
        if (resp.success) {
          if ($(el).val() === '') {
            $(el).removeAttr('disabled');
            $(a).hide();
          } else {
            changeState();
            data = name;
          }
        } else if (resp.redirectUrl) {
          location.href = resp.redirectUrl;
        } else {
          window.console && window.console.log && window.console.log(resp.exception);
          alert(resp.message);
        }
      });
      return false;
    };
    defState = function() {
      saveState();
      $(a).hide();
    };
    saveState = function() {
      $(el).removeAttr('disabled');
      $(a).text('Сохранить');
      $(a).show();
      $(a).off('click').click(saveHandler);
      return false;
    };
    changeState = function() {
      $(el).attr('disabled', 'disabled');
      $(a).text('Изменить');
      $(a).show();
      $(a).off('click').click(saveState);
      return false;
    };
    $(el).keyup(function(e) {
      if (e.keyCode === 13) {
        saveHandler();
      }

      /*if ($(el).val() != "") saveState();
       else defState();
       */
      if ($(el).val().length > 0) {
        saveState();
      } else {
        if (data.length === 0) {
          $(a).hide();
        }
      }
    });
    if ($(el).val() === '') {
      defState();
    } else {
      changeState();
    }
  });
};

$(function() {
  var certificates, cntrLabelOldPinErr, cntrLabelSetPinErr, cntrLabelnewPinConfirmErr, cntrLabelnewPinErr, first, green, newPin, newPinConfirm, oldPin, red, requests, ruDate, setpin, templateCerts, templateRequests;
  $('.js-get-marker').on('click', function() {
    (new Crypt.Dialog).Open('blankInform', {
      title: 'Вы уже отправляли запрос<br>на получение маркера',
      text: 'Ожидайте звонка нашего менеджера,<br>он свяжется с Вами в ближайшее время.<br><br>С уважением, команда Cryptogramm'
    });
  });

  /**
   * Дата на русском. пока только в формате DD month YYYY
   * @param d - UNIX Timestamp
   * @returns {string}
   */
  ruDate = function(d) {
    var date;
    date = new Date(d);
    return date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth() + 1] + ' ' + date.getFullYear();
  };
  templateCerts = $('#tpl-certListItem').text();
  templateRequests = $('#tpl-requestListItem').text();
  first = true;
  green = 0;
  red = 0;
  certificates = _.each(window.certificates.certs, function(Item) {
    Item.NotBefore = Crypt.Helpers.ExtractTimestamp(Item.NotBefore);
    Item.NotAfter = Crypt.Helpers.ExtractTimestamp(Item.NotAfter);
    return Item;
  });
  requests = _.each(window.requests.requests, function(Item) {
    if (Item.Status === 'Не отправлен (запрос на сертификат не отправлялся абонентом)') {
      Item.StatusCode = 1;
    }
    if (Item.Status === 'В обработке (запрос обрабатывается)') {
      Item.StatusCode = 3;
    }
    if (Item.Status === 'Отклонен (запрос на сертификат отклонен)') {
      Item.StatusCode = 5;
    }
    if (Item.Status === 'Одобрен (сертификат выпущен)') {
      Item.StatusCode = 4;
    }
    if (Item.Status === 'Подтвержден (абонент подтвердил получение сертификата)') {
      Item.StatusCode = 6;
    }
    if (Item.Status === 'Отправлен (запрос отправлен на сервер)') {
      Item.StatusCode = 2;
    }
    if (Item.StatusCode === 4) {
      green++;
    }
    if (Item.StatusCode === 5) {
      red++;
    }
    if (Item.Name.length > 30) {
      Item.Name = Item.Name.substr(0, 30) + '...';
    }
    Item.CreationTime = Crypt.Helpers.ExtractTimestamp(Item.CreationTime);
    return Item;
  });
  if (green > 0 && $.cookie('requestConfirmedHide') !== '1') {
    (new Crypt.Dialog).Open('blankInfo3', {
      text: 'Один из ваших запросов ожидает подтверждения. Вы сможете выполнить операцию подтверждения в любое удобное для Вас время в Вашем профиле, но помните, что до тех пор, пока выпуск сертификата не подтвержден, Вы не сможете им воспользоваться!'
    }, {
      beforeClose: _.bind(function() {
        return $('.js-request-list').click();
      }, this)
    });
  }
  $('body').on('change', '#requestConfirmHide', function() {
    if ($('#requestConfirmHide').prop('checked')) {
      return $.cookie('requestConfirmedHide', 1, {
        expires: 365,
        path: '/'
      });
    } else {
      return $.cookie('requestConfirmedHide', 0, {
        expires: 365,
        path: '/'
      });
    }
  });
  log(requests);
  if (green) {
    $('.js-request-list').append('&nbsp;<span class="green">' + green + '</span>');
  }
  if (red) {
    $('.js-request-list').append('&nbsp;<span class="red">' + red + '</span>');
  }
  window.reRenderCertificates = function() {
    var data, isRequests, pin, regTipOptions, sort, tabActive, template, test;
    tabActive = $('.filter .js-tabs').find('li.active').data('val') === 'active';
    isRequests = $('.filter .js-tabs').find('li.active').data('val') === 'requests';
    if (isRequests) {
      $('#chb-withpin').prop('checked', false);
      $('#chb-test').prop('checked', false);
    }
    pin = $('#chb-withpin').prop('checked');
    test = $('#chb-test').prop('checked');
    data = isRequests ? requests : certificates;
    template = isRequests ? templateRequests : templateCerts;
    sort = isRequests ? $('#sel-sort-requests').val() : $('#sel-sort-certs').val();
    sort = sort.split('_');
    if (data) {
      if (sort.length === 2) {
        Crypt.Helpers.SortBy(data, sort[0], sort[1]);
      }
      if (data.length) {
        data = _.filter(data, function(el) {
          var byActive, byPin, byTest;
          byPin = true;
          byTest = true;
          byActive = true;
          if (pin) {
            byPin = el.MyCertificate.HasPIN;
          }
          if (test) {
            byTest = el.IsTest;
          }
          if (tabActive) {
            byActive = el.NotAfter > Date.now();
          }
          if (!isRequests) {
            return byPin && byTest && byActive;
          } else {
            return true;
          }
        });
      }
    }
    if (data) {
      $('#certificats-list .certificats-list').html(_.template(template)({
        Items: data
      }));
      $('.js-sort-select').addClass('hidden');
      if (isRequests) {
        $('.js-chb-sort').addClass('hidden');
        $('.js-sort-select').filter('.i-requests').removeClass('hidden');
        regTipOptions = {
          tipJoint: 'left',
          background: '#fff5d2',
          borderRadius: 4,
          borderWidth: 1,
          borderColor: '#fee8ae'
        };
        $('.js-tip-download-request').each(function(i, el) {
          new Opentip($(el), Crypt.l18n.Profile.MyCertificateList.DownloadRequestTip, '', regTipOptions);
          Opentip.lastZIndex = 9000;
        });
      } else {
        $('.js-sort-select').filter('.i-certificates').removeClass('hidden');
        $('.js-chb-sort').removeClass('hidden');
      }
    }
    if (first) {
      if (data && data.length) {
        $('.js-scrollList').removeClass('hidden');
        $('.js-emptyCertificates').addClass('hidden');
      } else {
        $('.js-scrollList').addClass('hidden');
        $('.js-emptyCertificates').removeClass('hidden');
      }
    }
    first = false;
    regTipOptions = {
      tipJoint: 'left',
      background: '#fff5d2',
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#fee8ae'
    };
    $('.js-test-certificate-tip').each(function(i, el) {
      new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
    });
    initCertificateList();
  };
  reRenderCertificates();
  initCertificateList();
  $('.js-createTestCertificate').on('click', function(e) {
    var pinDialog;
    if (EmailConfirmed) {
      pinDialog = new Crypt.Dialogs.NewTestCertificate;
      pinDialog.initialize({
        canceled: _.bind((function() {}), this),
        success: _.bind((function(cert) {
          certificates.push(cert);
          reRenderCertificates();
          scroll.update();
        }), this)
      });
    } else {
      (new Crypt.Dialog).Open('blankError', {
        text: Crypt.l18n.NewCertificate.needConfirmEmail
      });
    }
    e.preventDefault();
    return false;
  });
  $('#chb-withpin').on('change', function() {
    reRenderCertificates();
  });
  $('#chb-test').on('change', function() {
    reRenderCertificates();
  });
  $('#sel-sort-certs').on('change', function() {
    reRenderCertificates();
  });
  $('#sel-sort-requests').on('change', function() {
    reRenderCertificates();
  });
  $('.filter .js-tabs li').click(function(e) {
    var $box, $el;
    $el = $(e.currentTarget);
    $box = $el.parent();
    if ($el.hasClass('active')) {
      return false;
    }
    $box.find('li').removeClass('active');
    $el.addClass('active');
    reRenderCertificates();
  });
  setpin = $.find('#setPin');
  newPin = $.find('#newPin');
  newPinConfirm = $.find('#newPinConfirm');
  oldPin = $.find('#oldPin');
  cntrLabelnewPinErr = $(newPin).parent().find('.info.error').hide();
  cntrLabelSetPinErr = $(setpin).parent().find('.info.error').hide();
  cntrLabelOldPinErr = $(oldPin).parent().find('.info.error').hide();
  cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find('.info.error').hide();
  $(setpin).blur(function() {
    checkSetPin();
  }).focus(function() {
    $(this).removeClass('error');
    $(cntrLabelSetPinErr).hide();
  });
  $(newPin).blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    } else if ($(newPinConfirm).val() !== '' && $(this).val() !== $(newPinConfirm).val()) {
      $(cntrLabelnewPinConfirmErr).show();
      $(newPinConfirm).addClass('error');
    }
    if (!/^[0-9]+$/.test($(this).val())) {
      $(cntrLabelnewPinErr).show();
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
    $(newPinConfirm).removeClass('error');
    $(cntrLabelnewPinConfirmErr).hide();
    $(cntrLabelnewPinErr).hide();
  });
  $(oldPin).blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
    $(cntrLabelOldPinErr).hide();
  });
  $(newPinConfirm).blur(function() {
    if ($(this).val() === '') {
      $(this).addClass('error');
    } else if ($(this).val() !== $(newPin).val()) {
      $(cntrLabelnewPinConfirmErr).show();
      $(this).addClass('error');
    }
  }).focus(function() {
    $(this).removeClass('error');
    $(cntrLabelnewPinConfirmErr).hide();
  });
  $('body').on('click', '.js-request-actions .js-confirm-request', function() {
    var id;
    id = $(this).closest('.js-item').data('id');
    Crypt.Preloader.Block($('#myCertificateList'));
    new Crypt.Dialogs.ConfirmRequest(id);
    return false;
  });
  $('body').on('click', '.js-request-actions .js-cancel-request', function() {
    var id;
    id = $(this).closest('.js-item').data('id');
    $('#delete-confirm').removeClass('hidden');
    $('#delete-confirm').find('.js-confirm-decline').data('id', id);
    $('#delete-confirm').find('.js-cancel-decline').on('click', function() {
      $('#delete-confirm').addClass('hidden').find('.js-confirm-decline').data('id', '');
      return false;
    });
    $('#delete-confirm').find('.js-confirm-decline').on('click', function(e) {
      id = $(e.target).data('id');
      $.ajax({
        url: Crypt.Urls.MarkerRequestDelete,
        data: {
          requestId: id
        },
        success: _.bind(function(response) {
          $('#delete-confirm').addClass('hidden').find('.js-confirm-decline').data('id', '');
          (new Crypt.Dialog).Open('blankInfo2', {
            text: 'Запрос удален! Вы можете попробовать активировать маркер еще раз с помощью мастера активации. В случае если ошибка повторится, обратитесь в Удостоверяющий Центр где был получен маркер.'
          }, {
            beforeClose: _.bind(function() {
              return location.reload();
            }, this)
          });
        }, this),
        error: _.bind(function(response) {
          (new Crypt.Dialog).Open('blankInfo2', {
            text: 'Произошла ошибка при удалении запроса'
          }, {
            beforeClose: _.bind(function() {
              return location.reload();
            }, this)
          });
          log(response);
        }, this)
      });
      return false;
    });
    return false;
  });
  $('body').on('click', '.js-canceled-more', function() {
    (new Crypt.Dialog).Open('blankInfo', {
      text: 'Отправленный запрос на сертификат был отклонен, попробуйте отправить запрос повторно. В случае, если ошибка повторится, обратитесь в Удостоверяющий Центр, где был получен маркер.'
    });
    return false;
  });
  $('body').on('click', '.js-request-actions .js-request-resend', function() {
    var id;
    id = $(this).closest('.js-item').data('id');
    $.ajax({
      url: Crypt.Urls.MarkerRequestResend,
      data: {
        requestId: id
      },
      success: _.bind(function(response) {
        var smsConfirm;
        if (response.Status === 1) {
          smsConfirm = new Crypt.Dialogs.RequestSmsConfirm();
          smsConfirm.initialize(id, {
            success: _.bind(function() {
              return $.ajax({
                url: Crypt.Urls.MarkerRequestResendAgain,
                data: {
                  requestId: id
                },
                success: _.bind(function(response) {
                  return (new Crypt.Dialog).Open('blankInfo2', {
                    text: 'Запрос успешно отправлен! Очень скоро сертификат будет выпущен, мы дополнительно сообщим Вам об этом. За статусом запроса Вы можете следить в разделе «Запросы на сертификаты»'
                  }, {
                    beforeClose: _.bind(function() {
                      return location.reload();
                    }, this)
                  });
                }, this)
              });
            }, this),
            canceled: _.bind(function() {}, this),
            error: _.bind(function() {}, this)
          });
        } else if (response.Status === 0) {
          (new Crypt.Dialog).Open('blankInfo2', {
            text: 'Запрос успешно отправлен! Очень скоро сертификат будет выпущен, мы дополнительно сообщим Вам об этом. За статусом запроса Вы можете следить в разделе «Запросы на сертификаты»'
          }, {
            beforeClose: _.bind(function() {
              return location.reload();
            }, this)
          });
        } else {
          (new Crypt.Dialog).Open('blankError', {
            text: 'Произошла ошибка, попробуйте повторить запрос позднее'
          }, {
            beforeClose: _.bind(function() {
              return location.reload();
            }, this)
          });
        }
      }, this),
      error: _.bind(function(response) {
        debugger;
        log('переотправка провалилась');
        log(response);
      }, this)
    });
    return false;
  });
});

/**
 * Created by Kirill on 5/4/2015.
 */

$(function () {

    $('.js-get-marker').on('click', function() {
        new Crypt.Dialog().Open('blankInform', {title:'Вы уже отправляли запрос<br>на получение маркера',text:'Ожидайте звонка нашего менеджера,<br>он свяжется с Вами в ближайшее время.<br><br>С уважением, команда Cryptogramm'})
    });

    /**
     * Дата на русском. пока только в формате DD month YYYY
     * @param d - UNIX Timestamp
     * @returns {string}
     */
    ruDate = function (d) {
        var date = new Date(d);
        return date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth() + 1] + ' ' + date.getFullYear();
    };

    var templateCerts = $('#tpl-certListItem').text();
    var templateRequests = $('#tpl-requestListItem').text();
    var first = true;
    var green = 0;
    var red = 0;

    certificates = _.each(certificates.certs, function (Item) {
        Item.NotBefore = Crypt.Helpers.ExtractTimestamp(Item.NotBefore);
        Item.NotAfter = Crypt.Helpers.ExtractTimestamp(Item.NotAfter);
        return Item;
    });

    requests = _.each(requests.requests, function (Item) {
        if (Item.StatusCode == 4) {
            green++;
        }
        if (Item.StatusCode == 5) {
            red++;
        }

        Item.CreationTime = Crypt.Helpers.ExtractTimestamp(Item.CreationTime);
        return Item
    });


    if (green) {
        $('.js-request-list').append('&nbsp;<span class="green">' + green + '</span>');
    }
    if (red) {
        $('.js-request-list').append('&nbsp;<span class="red">' + red + '</span>');
    }

    reRenderCertificates = function (renew) {

        var pin = $('#chb-withpin').prop('checked');
        var test = $('#chb-test').prop('checked');
        var tabActive = $('.filter .js-tabs').find('li.active').data('val') == "active";
        var isRequests = $('.filter .js-tabs').find('li.active').data('val') == "requests";
        var data = isRequests ? requests : certificates;
        var template = isRequests ? templateRequests : templateCerts;
        var sort = isRequests ? $('#sel-sort-requests').val() : $('#sel-sort-certs').val();

        sort = sort.split('_');
        if (data) {


            if (sort.length == 2) {
                Crypt.Helpers.SortBy(data, sort[0], sort[1]);
            }

            if (data.length) {
                data = _.filter(data, function (el) {
                    var byPin = true;
                    var byTest = true;
                    var byActive = true;

                    if (pin)
                        byPin = el.MyCertificate.HasPIN;
                    if (test)
                        byTest = el.IsTest;
                    if (tabActive)
                        byActive = el.NotAfter > Date.now();

                    return !isRequests ? byPin && byTest && byActive : true;
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
                    tipJoint: "left",
                    background: '#fff5d2',
                    borderRadius: 4,
                    borderWidth: 1,
                    borderColor: '#fee8ae'
                };
                $(".js-tip-download-request").each(function (i, el) {
                    new Opentip($(el), Crypt.l18n.Profile.MyCertificateList.DownloadRequestTip, '', regTipOptions);
                    Opentip.lastZIndex = 9000;
                });

            } else {
                $('.js-sort-select').filter('.i-certificates').removeClass('hidden');
                $('.js-chb-sort').removeClass('hidden');
            }

        }

        if (first || renew) {
            if (data && data.length) {
                $('.js-scrollList').removeClass('hidden');
                $('.js-emptyCertificates').addClass('hidden');
            } else {
                $('.js-scrollList').addClass('hidden');
                $('.js-emptyCertificates').removeClass('hidden');
            }
        }

        first = false;

        var regTipOptions = {
            tipJoint: "left",
            background: '#fff5d2',
            borderRadius: 4,
            borderWidth: 1,
            borderColor: '#fee8ae'
        };

        $(".js-test-certificate-tip").each(function (i, el) {
            new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
        });

        initCertificateList();
    };

    reRenderCertificates();

    initCertificateList();

    $('.js-createTestCertificate').on('click', function (e) {
        if (EmailConfirmed) {
            var pinDialog = new Crypt.Dialogs.NewTestCertificate();
            pinDialog.initialize({
                canceled: _.bind(function () {
                }, this),
                success: _.bind(function (cert) {
                    certificates.push(cert);
                    reRenderCertificates(true);
                    scroll.update();
                }, this)
            });
        } else {
            new Crypt.Dialog().Open('blankError', {text: Crypt.l18n.NewCertificate.needConfirmEmail})
        }
        e.preventDefault();
        return false

    });

    $('#chb-withpin').on('change', function () {
        reRenderCertificates()
    });
    $('#chb-test').on('change', function () {
        reRenderCertificates()
    });
    $('#sel-sort-certs').on('change', function () {
        reRenderCertificates()
    });
    $('#sel-sort-requests').on('change', function () {
            reRenderCertificates()
        });

    $('.filter .js-tabs li').click(function (e) {
        var $el = $(e.currentTarget);
        var $box = $el.parent();
        if ($el.hasClass('active')) {
            return false
        }

        $box.find('li').removeClass('active');
        $el.addClass('active');
        reRenderCertificates()
    });

    var setpin = $.find("#setPin"),
        newPin = $.find("#newPin"),
        newPinConfirm = $.find("#newPinConfirm"),
        oldPin = $.find("#oldPin"),
        cntrLabelnewPinErr = $(newPin).parent().find(".info.error").hide(),
        cntrLabelSetPinErr = $(setpin).parent().find(".info.error").hide(),
        cntrLabelOldPinErr = $(oldPin).parent().find(".info.error").hide(),
        cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find(".info.error").hide();

    $(setpin).blur(function () {
        checkSetPin();
    }).focus(function () {
        $(this).removeClass("error");
        $(cntrLabelSetPinErr).hide();
    });

    $(newPin).blur(function () {
        if ($(this).val() == "") {
            $(this).addClass("error");
        } else if ($(newPinConfirm).val() != "" && $(this).val() != $(newPinConfirm).val()) {
            $(cntrLabelnewPinConfirmErr).show();
            $(newPinConfirm).addClass("error");
        }
        if (!/^[0-9]+$/.test($(this).val())) {
            $(cntrLabelnewPinErr).show();
            $(this).addClass("error");
        }
    }).focus(function () {
        $(this).removeClass("error");
        $(newPinConfirm).removeClass("error");
        $(cntrLabelnewPinConfirmErr).hide();
        $(cntrLabelnewPinErr).hide();
    });
    $(oldPin).blur(function () {
        if ($(this).val() == "") {
            $(this).addClass("error");
        }
    }).focus(function () {
        $(this).removeClass("error");
        $(cntrLabelOldPinErr).hide();
    });

    $(newPinConfirm).blur(function () {
        if ($(this).val() == "") {
            $(this).addClass("error");
        } else if ($(this).val() != $(newPin).val()) {
            $(cntrLabelnewPinConfirmErr).show();
            $(this).addClass("error");
        }
    }).focus(function () {
        $(this).removeClass("error");
        $(cntrLabelnewPinConfirmErr).hide();
    });

    $('body').on('click','.js-confirm-request',function () {
        var id = $(this).closest('.js-item').data('id');
        // здесь надо получить инфу о сертификате
        new Crypt.Dialogs.ConfirmRequest(id);
        return false
    });

});

function checkSetPin() {
    var setpin = $.find("#setPin"),
        error = $(setpin).parent().find(".info.error");
    if ($(setpin).val() == "") {
        $(setpin).addClass("error");
        return false;
    } else if (!/^[0-9]+$/.test($(setpin).val())) {
        $(error).show();
        $(setpin).addClass("error");
        return false;
    }
    return true;
}

function checkChangePinForm() {
    var result = true,
        newPin = $.find("#newPin"),
        newPinConfirm = $.find("#newPinConfirm"),
        oldPin = $.find("#oldPin"),
        cntrLabelnewPinErr = $(newPin).parent().find(".info.error").hide(),
        cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find(".info.error");

    if ($(newPin).val() == "") {
        $(newPin).addClass("error");
        result = false;
    }

    if (!/^[0-9]+$/.test($(newPin).val())) {
        $(cntrLabelnewPinErr).show();
        $(newPin).addClass("error");
        result = false;
    }

    if ($(oldPin).val() == "") {
        $(oldPin).addClass("error");
        result = false;
    }
    if ($(newPinConfirm).val() == "") {
        $(newPinConfirm).addClass("error");
        result = false;
    } else if ($(newPinConfirm).val() != $(newPin).val()) {
        $(cntrLabelnewPinConfirmErr).show();
        $(newPinConfirm).addClass("error");
        result = false;
    }

    return result;
}

function showSetPinModal(id, user2Cert) {
    var w = $("#modal #" + id);
    if (w[0]) {
        $(w).find("input[type=hidden]").val(user2Cert);
        w.show();
        w.parent().show();
    }
    clearPinFields();
}

function showModal(id) {
    var w = $("#modal #" + id);
    if (w[0]) {
        w.show();
        w.parent().show();
    }
}

function hideModal(id) {
    var w = $("#modal #" + id);
    if (w[0]) {
        $(w).find("input[type=hidden]").val("");
        w.hide();
        w.parent().hide();
    }
}

function clearPinFields() {
    $("#newPin").val("");
    $("#newPinConfirm").val("");
    $("#oldPin").val("");
    $("#setPin").val("");
}

function changePin(me) {
    if (!me) return;
    var form = $(me).parent().parent(),
        oldPin = $.find("#oldPin"),
        cntrLabelOldPinErr = $(oldPin).parent().find(".info.error"),
        user2CertHid = form.parent().find("input[type=hidden]");

    if (checkChangePinForm()) {
        $.ajax({
            url: Crypt.Urls.CertList.ChangePin,
            type: 'POST',
            data: {
                newPin: $("#newPin").val(),
                oldPin: $("#oldPin").val(),
                user2Cert: $(user2CertHid).val(),
                userId: $('#UserId').val()
            }
        }).always(function (resp) {
            if (resp.success) {
                $(user2CertHid).val("");
                hideModal('change-pin2');
                clearPinFields();
                _.each(certificates, function (el, i) {

                });
                //$("#ajaxFormMyCertificateList").submit();
            } else if (resp.errorOldPin) {
                $(cntrLabelOldPinErr).show();
                $(oldPin).addClass("error");
            } else if (resp.redirectUrl) {
                location.href = resp.redirectUrl;
            } else {
                window.console && window.console.log && window.console.log(resp.exception);
                alert(resp.message);
            }
        });
    }
}

function deletePin(usercert) {
    if (!usercert) return;
    var certId = usercert;
    $.ajax({
        url: Crypt.Urls.CertList.DeletePin,
        type: 'POST',
        data: {user2Cert: certId, userId: $('#UserId').val()}
    }).always(function (resp) {
        if (resp.success) {
            _.each(certificates, function (el, i) {
                if (el.MyCertificate.Id == certId) {
                    el.MyCertificate.HasPIN = false
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
}

function setPinMethod(me) {
    if (!me) return;
    var form = $(me).parent().parent(),
        setpin = form.find("#setPin"),
        user2CertHid = form.parent().find("input[type=hidden]");

    if (checkSetPin()) {
        $.ajax({
            url: Crypt.Urls.CertList.SetPin,
            type: 'POST',
            data: {newPin: $(setpin).val(), user2Cert: $(user2CertHid).val(), userId: $('#UserId').val()}
        }).always(function (resp) {
            if (resp.success) {

                _.each(certificates, function (el, i) {
                    if (el.MyCertificate.Id == $(user2CertHid).val()) {
                        el.MyCertificate.HasPIN = true
                    }

                });

                $(user2CertHid).val("");
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
}

//Проверяем не вернул ли сервер ошибку и инициализируем поля
function checkResult(resp) {
    if (resp.redirectUrl) location.href = resp.redirectUrl;
    scroll.update();
    initCertificateList();
}

function initCertificateList() {
    $("#certificats-list").find("input[type=text]").each(function (ind, el) {
        var data = $(el).val(),
            a = $(el).parent().find("a.small-text:first"),
            hid = $(el).parent().find("input[type=hidden]:first"),
            saveHandler = function () {
                var name = $(el).val();
                var id = $(hid).val();
                $.ajax({
                    url: Crypt.Urls.CertList.SaveCertFriendlyName,
                    type: 'POST',
                    data: {name: name, certId: id, userId: $('#UserId').val()}
                }).always(function (resp) {
                    if (resp.success) {
                        if ($(el).val() == "") {
                            $(el).removeAttr('disabled');
                            $(a).hide();
                        } else {
                            changeState();
                            data = name;
                        }

                        //showModal('attention');
                    } else if (resp.redirectUrl) {
                        location.href = resp.redirectUrl;
                    } else {
                        window.console && window.console.log && window.console.log(resp.exception);
                        alert(resp.message);
                    }
                });
                return false;
            },
            defState = function () {
                saveState();
                $(a).hide();
            },
            saveState = function () {
                $(el).removeAttr('disabled');
                $(a).text("Сохранить");
                $(a).show();
                $(a).off("click").click(saveHandler);
                return false;
            },
            changeState = function () {
                $(el).attr('disabled', 'disabled');
                $(a).text("Изменить");
                $(a).show();
                $(a).off("click").click(saveState);
                return false;
            };

        $(el).keyup(function (e) {
            if (e.keyCode == 13) saveHandler();
            /*if ($(el).val() != "") saveState();
             else defState();*/

            if ($(el).val().length > 0) {
                saveState();
            } else {
                if (data.length === 0)
                    $(a).hide();
            }
        });
        if ($(el).val() == "") defState();
        else changeState();
    });
}
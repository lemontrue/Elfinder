/**
 * Created by Kirill on 5/4/2015.
 */

$(function() {
    /**
     * Пытаемся вытащить Timestamp из строки, числа или чего еще
     * @param {String|Number} date  /Date(1234567890moment()/, ISO8601, UNIX Timestamp
     * @returns {number}    UNIX Timestamp
     * @constructor
     */
    ExtractTimestamp = function(date) {
        if (_.isString(date) && date.indexOf('/') == 0)
            return Number(date.substr(6, 13));
        else if (_.isString(date) && (date.indexOf('Z') > -1 || date.indexOf('T') > -1))
            return (new Date(date)).getTime();
        else if (_.isString(date))
            return Number(date);
        else if (Number(date) === date)
            return date;
        else if (_.isDate(date))
            return date.getTime();
        else
            return null;
    };

    /**
     * Дата на русском. пока только в формате DD month YYYY
     * @param d - UNIX Timestamp
     * @returns {string}
     */
    ruDate = function(d) {
        var date = new Date(d);
        return date.getDate() + ' ' + Crypt.l18n.Date[date.getMonth()+1] + ' ' + date.getFullYear();
    };

    var template = $('#tpl-certListItem').text();
    var first = true;

    reRenderCertificates = function (renew) {
        //if (!certs) {
        //    return false;
        //}
        var sort = $('#sel-sort').val();
        var pin = $('#chb-withpin').prop('checked');
        var test = $('#chb-test').prop('checked');
        var tabActive = $('.filter .js-tabs').find('li.active').data('val') == "active";
        var data = certs.certs;

        if (data) {



            switch (sort) {
                case 'FriendlyNameASC':
                    data.sort(function(a,b) {
                        if (a.MyCertificate.FriendlyName < b.MyCertificate.FriendlyName) return -1;
                        else return a.MyCertificate.FriendlyName > b.MyCertificate.FriendlyName ? 1 : 0;
                    });
                    break;
                case 'FriendlyNameDESC':
                    data.sort(function(a,b) {
                        if (a.MyCertificate.FriendlyName < b.MyCertificate.FriendlyName) return 1;
                        else return a.MyCertificate.FriendlyName > b.MyCertificate.FriendlyName ? -1 : 0;
                    });
                    break;
                case 'IssureDateASC':
                    data.sort(function(a,b) {
                        if ( ExtractTimestamp(a.NotBefore) < ExtractTimestamp(b.NotBefore) ) return -1;
                        else return ExtractTimestamp(a.NotBefore) > ExtractTimestamp(b.NotBefore) ? 1 : 0;
                    });
                    break;
                case 'IssureDateDESC':
                    data.sort(function(a,b) {
                        if ( ExtractTimestamp(a.NotBefore) < ExtractTimestamp(b.NotBefore) ) return 1;
                        else return ExtractTimestamp(a.NotBefore) > ExtractTimestamp(b.NotBefore) ? -1 : 0;
                    });
                    break;
                case 'OwnerASC':
                    data.sort(function(a,b) {
                        if (a.SubjectName < b.SubjectName) return -1;
                        else return a.SubjectName > b.SubjectName ? 1 : 0;
                    });
                    break;
                case 'OwnerDESC':
                    data.sort(function(a,b) {
                        if (a.SubjectName < b.SubjectName) return 1;
                        else return a.SubjectName > b.SubjectName ? -1 : 0;
                    });
                    break;
            }
            if (data.length)
                data = _.filter(data, function(el){
                    var byPin = true;
                    var byTest = true;
                    var byActive = true;

                    if (pin)
                        byPin = el.MyCertificate.HasPIN;
                    if (test)
                        byTest = el.IsTest;
                    if (tabActive)
                        byActive = ExtractTimestamp(el.NotAfter) > Date.now();

                    return byPin && byTest && byActive;
                });
            $('#certificats-list .certificats-list').html(_.template(template)({
                Items: data
            }));
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

        $(".js-test-certificate-tip").each(function(i,el){
            new Opentip($(el), 'Сертификат выпущен без участия<br>аккредитованного Удостоверяющего<br>Центра и не имеет юридической силы.', '', regTipOptions);
        });


        initCertificateList();
    };

    reRenderCertificates();

    initCertificateList();

    $('.js-createTestCertificate').on('click',function(e){
        if (EmailConfirmed) {
            var pinDialog = new Crypt.Dialogs.NewTestCertificate();
            pinDialog.initialize({
                canceled: _.bind(function() {}, this),
                success: _.bind(function(cert) {
                    certs.certs.push(cert);
                    reRenderCertificates(true);
                    scroll.update();
                }, this)
            });
        } else {
            new Crypt.Dialog().Open( 'blankError', { text: Crypt.l18n.NewCertificate.needConfirmEmail } )
        }
        e.preventDefault();
        return false


    });

    $('#chb-withpin').on('change',function() {
        reRenderCertificates()
    });
    $('#chb-test').on('change',function() {
        reRenderCertificates()
    });
    $('#sel-sort').on('change',function() {
        reRenderCertificates()
    });

    $('.filter .js-tabs li').click(function(e) {
        var $el = $(e.currentTarget);
        var $box = $el.parent();
        if ($el.hasClass('active')) {
            return false
        }

        $box.find('li').removeClass('active');
        $el.addClass('active');
        reRenderCertificates()
    });


    //$("#sel-filter, #sel-sort, #chb-withpin").change(function() {
    //    $("#ajaxFormMyCertificateList").submit();
    //});

    //$("#ajaxFormMyCertificateList").submit();

    var setpin = $.find("#setPin"),
        newPin = $.find("#newPin"),
        newPinConfirm = $.find("#newPinConfirm"),
        oldPin = $.find("#oldPin"),
        cntrLabelnewPinErr = $(newPin).parent().find(".info.error").hide(),
        cntrLabelSetPinErr = $(setpin).parent().find(".info.error").hide(),
        cntrLabelOldPinErr = $(oldPin).parent().find(".info.error").hide(),
        cntrLabelnewPinConfirmErr = $(newPinConfirm).parent().find(".info.error").hide();

    $(setpin).blur(function() {
        checkSetPin();
    }).focus(function() {
        $(this).removeClass("error");
        $(cntrLabelSetPinErr).hide();
    });

    $(newPin).blur(function() {
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
    }).focus(function() {
        $(this).removeClass("error");
        $(newPinConfirm).removeClass("error");
        $(cntrLabelnewPinConfirmErr).hide();
        $(cntrLabelnewPinErr).hide();
    });
    $(oldPin).blur(function() {
        if ($(this).val() == "") {
            $(this).addClass("error");
        }
    }).focus(function() {
        $(this).removeClass("error");
        $(cntrLabelOldPinErr).hide();
    });

    $(newPinConfirm).blur(function() {
        if ($(this).val() == "") {
            $(this).addClass("error");
        } else if ($(this).val() != $(newPin).val()) {
            $(cntrLabelnewPinConfirmErr).show();
            $(this).addClass("error");
        }
    }).focus(function() {
        $(this).removeClass("error");
        $(cntrLabelnewPinConfirmErr).hide();
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
            data: { newPin: $("#newPin").val(), oldPin: $("#oldPin").val(), user2Cert: $(user2CertHid).val(), userId: $('#UserId').val() }
        }).always(function(resp) {
            if (resp.success) {
                $(user2CertHid).val("");
                hideModal('change-pin2');
                clearPinFields();
                _.each(certs, function(el,i) {
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
        data: { user2Cert: certId, userId: $('#UserId').val() }
    }).always(function(resp) {
        if (resp.success) {
            _.each(certs.certs, function(el,i) {
                if (el.MyCertificate.Id == certId) {
                    el.MyCertificate.HasPIN = false
                }
            });
            reRenderCertificates();
            //$("#ajaxFormMyCertificateList").submit();
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
            data: { newPin: $(setpin).val(), user2Cert: $(user2CertHid).val(), userId: $('#UserId').val() }
        }).always(function(resp) {
            if (resp.success) {

                _.each(certs.certs, function(el,i) {
                    if (el.MyCertificate.Id == $(user2CertHid).val()) {
                        el.MyCertificate.HasPIN = true
                    }

                });

                $(user2CertHid).val("");
                hideModal('change-pin');

                clearPinFields();
                reRenderCertificates();
                //$("#ajaxFormMyCertificateList").submit();
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
    $("#certificats-list").find("input[type=text]").each(function(ind, el) {
        var data = $(el).val(),
            a = $(el).parent().find("a.small-text:first"),
            hid = $(el).parent().find("input[type=hidden]:first"),
            saveHandler = function() {
                var name = $(el).val();
                var id = $(hid).val();
                $.ajax({
                    url: Crypt.Urls.CertList.SaveCertFriendlyName,
                    type: 'POST',
                    data: { name: name, certId: id, userId: $('#UserId').val() }
                }).always(function(resp) {
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
            defState = function() {
                saveState();
                $(a).hide();
            },
            saveState = function() {
                $(el).removeAttr('disabled');
                $(a).text("Сохранить");
                $(a).show();
                $(a).off("click").click(saveHandler);
                return false;
            },
            changeState = function() {
                $(el).attr('disabled', 'disabled');
                $(a).text("Изменить");
                $(a).show();
                $(a).off("click").click(saveState);
                return false;
            };

        $(el).keyup(function(e) {
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
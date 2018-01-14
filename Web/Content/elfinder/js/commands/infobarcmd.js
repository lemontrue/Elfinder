"use strict"
elFinder.prototype.commands.infobarcmd = function() {
	this.getstate = function() {
	    if (this.fm.selectedFiles().length >=1) return 0;
	    else return -1;
	}
	
	this.exec = function(info) {
	    var fm = this.fm,
	        c = 'class',
	        iconClass = "elfinder-cwd-icon {class} ui-corner-all",
	        sel = this.fm.selectedFiles(),
	        disabled = fm.res(c, 'disabled'),
	        infobar = fm.ui['infobar'],
            selblock = infobar.find('.selectblock'),
	        icon = infobar.find(".selectico span:first"),
	        name = infobar.find(".title"),
	        lastChange = infobar.find(".dateblock span.datespan"),
            size = infobar.find(".dateblock span.sizespan"),
	        cryptInfo = infobar.find(".signature"),
            cryptblock = '<div class="havesig">' +
			'<div class="icoblock">'+

				'<span class="{icon}"></span>' +
			'</div>'+
			'<div class="textblock">'+
				'<div class="top">'+
					'<div class="actiontitle">'+
						'<a href="#" class="action">{action}</a>' +
					'</div>'+
				'</div>'+
				'<div class="bottom">'+
				'</div>'+
			'</div>'+
			'</div>',

            cryptlist = "<div class='cert-list'>" +
                "<span class='elfinder-button-icon elfinder-button-icon-{icon}'/>"+
                "<span class='list-type'>{type}</span>" +
	            "<span class='list-count'>({count})</span>" +
	            "<span class='elfinder-button-icon elfinder-button-icon-info-more'/>",
	        clear = function() {
	            if (infobar) {
	                icon.removeClass();
	                name.text("");
	                lastChange.text("");
	                cryptInfo.empty();
	            }
	        },
            item = 'elfinder-button-menu-item',
            hover = fm.res('class', 'hover'),
            menu = $('<div class="ui-widget ui-widget-content elfinder-button-menu ui-corner-all"/>')
	            .hide()
	            //.delegate('.' + item, 'hover', function () { $(this).toggleClass(hover); })
	            .delegate('.' + item, 'click', function (e) {
	                e.preventDefault();
	                e.stopPropagation();
	                menu.hide();
	            }),
            hide=function() {
                menu.hide();
            },
            addItem = function (type, block) {
                    menu.append($('<div class="' + item + '"/>').append(block));

                },
	        getBlock = function (type, certinfo) {


	            var iconcl = type == 1 ? 'encrypt' : 'sign';
	            var block = cryptblock.replace('{icon}', 'elfinder-cwd-icon elfinder-cwd-icon-' + iconcl + ' ui-corner-all');
	            block = block.replace('{action}', type == 1 ? fm.i18n("encrypted") : fm.i18n("signed"));
	            
	            var com, button, link;
	            block = $(block);
	            if (certinfo.Thumbprint && certinfo.SubjectName) {
	                if ((com = fm._commands['certdownload'])) {
	                    button = 'elfinder' + 'linkbutton';
                        var isTest = certinfo.IsTest ? '<span class="test-certificate-icon no-padding js-test-certificate-tip" id="testTip-'+certinfo.Thumbprint+'"></span>'+certinfo.SubjectName : certinfo.SubjectName;
	                    if ($.fn[button]) link = $('<div/>')[button](com, certinfo.Thumbprint, isTest);
	                    block.find(".bottom").append(link);
	                }

	                var commandName = type == 1 ? 'decrypt' : 'checksign';
	                if ((com = fm._commands[commandName])) {
	                    button = 'elfinder' + 'linkbutton';
	                    if ($.fn[button]) link = $('<div/>')[button](com);
	                    block.find(".actiontitle").append(link);
	                }
	            } else {
	                block.find(".actiontitle").css('padding-top','11px');
	            }

	            return block;
	        };

	    if (info) {
	        cryptInfo.empty();
	        infobar.find(".dateblock div div").addClass('ui-state-disabled');
	        if (info == 'Empty') {
	            cryptInfo.prepend($("<h3>").text(fm.i18n("emptycryptinfo")));
	        }else if (info.Certificates.length==0) {
	            cryptInfo.prepend($("<h3>").text(fm.i18n("cryptinfonocert")));
	        }else {
	            if (info.Certificates.length > 1) {
                    for (var i = 0; i < info.Certificates.length; i++) {
	                    var cert = info.Certificates[i];
	                    addItem(info.FileType, getBlock(info.FileType, cert));
                    }
                    var iconcl = info.FileType == 1 ? 'encrypt' : 'sign';
                    cryptlist = cryptlist.replace('{icon}',iconcl);
                    cryptlist = cryptlist.replace('{type}', info.FileType == 1 ? fm.i18n("encrypted") : fm.i18n("signed"));
                    cryptlist = cryptlist.replace('{count}', info.Certificates.length +' ' + fm.i18n("times"));

                    cryptlist = $(cryptlist).bind('hover', function () { $(this).toggleClass(hover); });
                    cryptlist.find('.elfinder-button-icon').click(function (e) {
                        e.stopPropagation();
                        menu.slideToggle(100);
	                });

	                cryptInfo.append(cryptlist);
	                cryptInfo.append(menu);

	                fm.bind('disable select', hide).getUI().click(hide);
	            } else {

	                cryptInfo.append(getBlock(info.FileType, info.Certificates[0]));
	            }
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
	        }

	        return $.Deferred().resolve();
	    }

	    if (infobar) {
	        clear();
	        var file;
            var acceptExt = ['ods','xls','xlsb','xlsx','ods','xlsb','xlsm','xlsx','odp','pot','potm','potx',
                'pps','ppsm','ppsx','ppt','pptm','pptx','odp','ppsx','pptx','doc','docm','docx','dot',
                'dotm','dotx','odt','pdf','one','onetoc2','jpg','jpeg','gif','png','bmp'];
            var ext = '';
	        if (sel.length == 1 && (file = sel[0]) && file && file.mime != "directory") {

                if (file.name !== null) {
                    ext = file.name.split('.');
                    ext = ext[ext.length-1];


                    $(infobar).find(".js-visaulize").data('type',file.VisualizationType);

                    if (acceptExt.indexOf(ext.toLowerCase()) !== -1) {

                        $(infobar).find(".js-visaulize").css('display', 'block');
                    }  else {
                        $(infobar).find(".js-visaulize").css('display', 'none');
                    }
                }

	            iconClass = iconClass.replace('{class}', fm.mime2class(file.mime));
	            icon.removeClass().addClass(iconClass);
	            name.text(file.name);
	            lastChange.text(fm.formatDate(file));
	            size.text(fm.formatSize(file.size));
	            $(infobar).find(".rename:first").css('display', 'block');
	            $(infobar).find(".dateblock:first").css('display', 'block');
	            selblock.show();
	        } else if (sel.length > 1) {
	            $(infobar).find(".rename:first").css('display', 'none');
	            $(infobar).find(".dateblock:first").css('display', 'none');
	            iconClass = iconClass.replace('{class}', 'elfinder-cwd-icon-group');
	            icon.removeClass().addClass(iconClass);
	            name.text(fm.i18n("infosel") + sel.length);
	            selblock.show();
	        } else selblock.hide();
	    }
	    return $.Deferred().resolve();
	}
}
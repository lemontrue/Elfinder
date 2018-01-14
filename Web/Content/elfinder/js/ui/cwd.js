"use strict";
/**
 * elFinder current working directory ui.
 *
 * @author Dmitry (dio) Levashov
 **/
$.fn.elfindercwd = function(fm, options) {

    this.not('.elfinder-cwd').each(function() {
        // fm.time('cwdLoad');

        var
            list = fm.viewType == 'list',

            blockMultiSelection = location.href.indexOf('multi_selection=false') != -1,

            undef = 'undefined',
            /**
			 * Select event full name
			 *
			 * @type String
			 **/
            evtSelect = 'select.' + fm.namespace,

            /**
			 * Unselect event full name
			 *
			 * @type String
			 **/
            evtUnselect = 'unselect.' + fm.namespace,

            /**
			 * Disable event full name
			 *
			 * @type String
			 **/
            evtDisable = 'disable.' + fm.namespace,

            /**
			 * Disable event full name
			 *
			 * @type String
			 **/
            evtEnable = 'enable.' + fm.namespace,

            c = 'class',
            /**
			 * File css class
			 *
			 * @type String
			 **/
            clFile = fm.res(c, 'cwdfile'),

            /**
			 * Selected css class
			 *
			 * @type String
			 **/
            fileSelector = '.' + clFile,

            /**
			 * Selected css class
			 *
			 * @type String
			 **/
            clSelected = 'ui-selected',

            /**
			 * Disabled css class
			 *
			 * @type String
			 **/
            clDisabled = fm.res(c, 'disabled'),

            /**
			 * Draggable css class
			 *
			 * @type String
			 **/
            clDraggable = fm.res(c, 'draggable'),

            /**
			 * Droppable css class
			 *
			 * @type String
			 **/
            clDroppable = fm.res(c, 'droppable'),

            /**
			 * Hover css class
			 *
			 * @type String
			 **/
            clHover = fm.res(c, 'hover'),

            /**
			 * Hover css class
			 *
			 * @type String
			 **/
            clDropActive = fm.res(c, 'adroppable'),

            /**
			 * Css class for temporary nodes (for mkdir/mkfile) commands
			 *
			 * @type String
			 **/
            clTmp = clFile + '-tmp',

            /**
			 * Number of thumbnails to load in one request (new api only)
			 *
			 * @type Number
			 **/
            tmbNum = fm.options.loadTmbs > 0 ? fm.options.loadTmbs : 5,

            /**
			 * Current search query.
			 *
			 * @type String
			 */
            query = '',

            lastSearch = [],

            lastFilter = [],

            customColsBuild = function() {
                var customCols = '';
                var columns = fm.options.uiOptions.cwd.listView.columns;
                for (var i = 0; i < columns.length; i++) {
                    customCols += '<td class="' + columns[i] + '" title="{' + columns[i] + '}">{' + columns[i] + '}</td>';
                }
                return customCols;
            },

            checkboxforblock = '<span class="button-checkbox bootstrap-checkbox" style="{chbstyle}">' +
                '<input type="checkbox" class="{class}" autocomplete="off" style="display: none;">' +
                '<span class="icon cb-icon-check square" style="display: none;"></span>' +
                '<span class="icon cb-icon-check-empty square"></span>' +
                '</span>',
            checkbox = '<span class="button-checkbox bootstrap-checkbox" style="{chbstyle}">' +
                '<input type="checkbox" class="{class}" autocomplete="off" style="display: none;">' +
                '<span class="icon cb-icon-check square" style="display: none;"></span>' +
                '<span class="icon cb-icon-check-empty square"></span>' +
                '</span>',
            CBbody = checkbox.replace('{class}', ''),
            CBhead = blockMultiSelection ? checkbox.replace('{class}', 'selectAllChB').replace('{chbstyle}', 'display: none;') : checkbox.replace('{class}', 'selectAllChB').replace('{chbstyle}', ''),

            CBSquareBody = checkboxforblock.replace('{class}', ''),
            CBSquareHead = blockMultiSelection ? checkboxforblock.replace('{class}', 'selectAllChB').replace('{chbstyle}', 'display: none;') : checkboxforblock.replace('{class}', 'selectAllChB').replace('{chbstyle}', 'display: block;'),
            selectAllBlock = '<table class="icons-table thead"><thead><tr class="ui-state-default"><td>' + CBSquareHead + ' <span class="selectalltext">' + fm.i18n('selectall') + '</span></td></tr></thead></table>',

            change = function(checkbox) {
                if ($(checkbox).is('input[type="checkbox"]')) {
                    var check = $(checkbox).parent().find(".cb-icon-check");
                    var empty = $(checkbox).parent().find(".cb-icon-check-empty");
                    if (!checkbox.is(':checked')) {
                        check.hide();
                        empty.show();
                    } else {
                        check.show();
                        empty.hide();
                    }
                }
            },

            getTarget = function(obj) {
                var targ;
                var e = obj;
                if (e.target) targ = e.target;
                else if (e.srcElement) targ = e.srcElement;
                if (targ.nodeType == 3) // defeat Safari bug
                    targ = targ.parentNode;
                return targ;
            },

            /**
			 * File templates
			 *
			 * @type Object
			 **/
            templates = {
                icon: '<div id="{hash}" class="' + clFile + ' {permsclass} {dirclass} ui-corner-all" title="{tooltip}">' + CBSquareBody + '<div class="elfinder-cwd-file-wrapper ui-corner-all"><div class="elfinder-cwd-icon {mime} ui-corner-all" unselectable="on" {style}/>{marker}</div><div class="elfinder-cwd-filename" title="{name}">{name}</div></div>',
                //row: '<tr id="{hash}" class="' + clFile + ' {permsclass} {dirclass}" title="{tooltip}"><td><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon {mime}"/>{marker}<span class="elfinder-cwd-filename">{name}</span></div></td><td>{perms}</td><td>{date}</td><td>{size}</td><td>{kind}</td></tr>'
                row: '<tr id="{hash}" class="' + clFile + ' {permsclass} {dirclass}" ><td class="chb" >' + CBbody + '</td><td class="name" title="{tooltip}"><div class="elfinder-cwd-file-wrapper"><span class="elfinder-cwd-icon {mime}"/>{marker}<span class="elfinder-cwd-filename">{name}</span></div></td>' + customColsBuild() + '</tr>'
            },

            permsTpl = fm.res('tpl', 'perms'),

            symlinkTpl = fm.res('tpl', 'symlink'),

            /**
			 * Template placeholders replacement rules
			 *
			 * @type Object
			 **/
            replacement = {
                permsclass: function(f) {
                    return fm.perms2class(f);
                },
                perms: function(f) {
                    return fm.formatPermissions(f);
                },
                dirclass: function(f) {
                    return f.mime == 'directory' ? 'directory' : '';
                },
                mime: function(f) {
                    return fm.mime2class(f.mime);
                },
                size: function(f) {
                    return fm.formatSize(f.size);
                },
                date: function(f) {
                    return fm.formatDate(f);
                },
                kind: function(f) {
                    return fm.mime2kind(f);
                },
                marker: function(f) {
                    return (f.alias || f.mime == 'symlink-broken' ? symlinkTpl : '') + (!f.read || !f.write ? permsTpl : '');
                },
                tooltip: function(f) {
                    //var title = fm.formatDate(f) + (f.size > 0 ? ' ('+fm.formatSize(f.size)+')' : '');
                    var title = f.name + (f.size > 0 ? ' (' + fm.formatSize(f.size) + ')' : '');
                    return f.tooltip ? fm.escape(f.tooltip).replace(/"/g, '&quot;').replace(/\r/g, '&#13;') + '&#13;' + title : title;
                },
                styleforfolder: function(f) {
                    return f.mime == 'directory' ? 'display:none;' : '';
                },
                chbstyle: function(f) {
                    return fm.isModal && f.mime == 'directory' ? 'display:none;' : '';
                },
            },

            /**
			 * Return file html
			 *
			 * @param  Object  file info
			 * @return String
			 **/
            itemhtml = function(f) {
                f.name = fm.escape(f.name);
                return templates[list ? 'row' : 'icon']
                    .replace(/\{([a-z]+)\}/g, function(s, e) {
                        return replacement[e] ? replacement[e](f) : (f[e] ? f[e] : '');
                    });
            },

            /**
			 * Flag. Required for msie to avoid unselect files on dragstart
			 *
			 * @type Boolean
			 **/
            selectLock = false,

            /**
			 * Move selection to prev/next file
			 *
			 * @param String  move direction
			 * @param Boolean append to current selection
			 * @return void
			 * @rise select			
			 */
            select = function(keyCode, append) {
                var code = $.ui.keyCode,
                    prev = keyCode == code.LEFT || keyCode == code.UP,
                    sel = cwd.find('[id].' + clSelected),
                    selector = prev ? 'first:' : 'last',
                    s,
                    n,
                    sib,
                    top,
                    left;

                function sibling(n, direction) {
                    return n[direction + 'All']('[id]:not(.' + clDisabled + '):not(.elfinder-cwd-parent):first');
                }

                if (sel.length) {
                    s = sel.filter(prev ? ':first' : ':last');
                    sib = sibling(s, prev ? 'prev' : 'next');

                    if (!sib.length) {
                        // there is no sibling on required side - do not move selection
                        n = s;
                    } else if (list || keyCode == code.LEFT || keyCode == code.RIGHT) {
                        // find real prevoius file
                        n = sib;
                    } else {
                        // find up/down side file in icons view
                        top = s.position().top;
                        left = s.position().left;

                        n = s;
                        if (prev) {
                            do {
                                n = n.prev('[id]');
                            } while (n.length && !(n.position().top < top && n.position().left <= left));

                            if (n.is('.' + clDisabled)) {
                                n = sibling(n, 'next');
                            }
                        } else {
                            do {
                                n = n.next('[id]');
                            } while (n.length && !(n.position().top > top && n.position().left >= left));

                            if (n.is('.' + clDisabled)) {
                                n = sibling(n, 'prev');
                            }
                            // there is row before last one - select last file
                            if (!n.length) {
                                sib = cwd.find('[id]:not(.' + clDisabled + '):last');
                                if (sib.position().top > top) {
                                    n = sib;
                                }
                            }
                        }
                    }
                    // !append && unselectAll();
                } else {
                    // there are no selected file - select first/last one
                    n = cwd.find('[id]:not(.' + clDisabled + '):not(.elfinder-cwd-parent):' + (prev ? 'last' : 'first'));
                }

                if (n && n.length && !n.is('.elfinder-cwd-parent')) {
                    if (append) {
                        // append new files to selected
                        n = s.add(s[prev ? 'prevUntil' : 'nextUntil']('#' + n.attr('id'))).add(n);
                    } else {
                        // unselect selected files
                        sel.trigger(evtUnselect);
                    }
                    // select file(s)
                    n.trigger(evtSelect);
                    // set its visible
                    scrollToView(n.filter(prev ? ':first' : ':last'));
                    // update cache/view
                    trigger();
                }
            },

            selectedFiles = [],

            selectFile = function(hash) {
                cwd.find('#' + hash).trigger(evtSelect);
            },

            selectAll = function() {
                if (blockMultiSelection) return;
                var phash = fm.cwd().hash;
                cwd.parent().find('input[type="checkbox"].selectAllChB').prop("checked", true);
                change(cwd.parent().find('input[type="checkbox"].selectAllChB'));
                cwd.find('[id]:not(.' + clSelected + '):not(.elfinder-cwd-parent)').trigger(evtSelect);
                selectedFiles = $.map(fm.files(), function(f) {
                    return fm.isModal && f.mime == 'directory' ? null : f.phash == phash ? f.hash : null;
                });
                trigger();
            },

            /**
			 * Unselect all files
			 *
			 * @return void
			 */
            unselectAll = function() {
                selectedFiles = [];
                cwd.parent().find('input[type="checkbox"].selectAllChB').prop("checked", false);
                change(cwd.parent().find('input[type="checkbox"].selectAllChB'));
                cwd.find('[id].' + clSelected).trigger(evtUnselect);
                trigger();
            },

            /**
			 * Return selected files hashes list
			 *
			 * @return Array
			 */
            selected = function() {
                return selectedFiles;
            },

            /**
			 * Fire elfinder "select" event and pass selected files to it
			 *
			 * @return void
			 */
            trigger = function() {
                fm.trigger('select', { selected: selectedFiles });
            },

            /**
			 * Scroll file to set it visible
			 *
			 * @param DOMElement  file/dir node
			 * @return void
			 */
            scrollToView = function(o) {
                var ftop = o.position().top,
                    fheight = o.outerHeight(true),
                    wtop = wrapper.scrollTop(),
                    wheight = wrapper.innerHeight();

                if (ftop + fheight > wtop + wheight) {
                    wrapper.scrollTop(parseInt(ftop + fheight - wheight));
                } else if (ftop < wtop) {
                    wrapper.scrollTop(ftop);
                }
            },

            /**
			 * Files we get from server but not show yet
			 *
			 * @type Array
			 **/
            buffer = [],

            /**
			 * Return index of elements with required hash in buffer 
			 *
			 * @param String  file hash
			 * @return Number
			 */
            index = function(hash) {
                var l = buffer.length;

                while (l--) {
                    if (buffer[l].hash == hash) {
                        return l;
                    }
                }
                return -1;
            },

            /**
			 * Scroll event name
			 *
			 * @type String
			 **/
            scrollEvent = 'scroll.' + fm.namespace,

            /**
			 * Cwd scroll event handler.
			 * Lazy load - append to cwd not shown files
			 *
			 * @return void
			 */
            render = function() {
                var html = [],
                    dirs = false,
                    ltmb = [],
                    atmb = {},
                    last = cwd.find('[id]:last'),
                    top = !last.length,
                    place = list ? cwd.children('table').children('tbody') : cwd,
                    files;

                if (!buffer.length) {
                    return wrapper.unbind(scrollEvent);
                }

                while ((!last.length || last.position().top <= wrapper.height() + wrapper.scrollTop() + fm.options.showThreshold)
                    && (files = buffer.splice(0, fm.options.showFiles)).length) {

                    html = $.map(files, function(f) {
                        if (f.hash && f.name) {
                            if (f.mime == 'directory') {
                                dirs = true;
                            }
                            if (f.tmb) {
                                f.tmb === 1 ? ltmb.push(f.hash) : (atmb[f.hash] = f.tmb);
                            }
                            return itemhtml(f);
                        }
                        return null;
                    });

                    place.append(html.join(''));
                    last = cwd.find('[id]:last');
                    // scroll top on dir load to avoid scroll after page reload
                    top && cwd.scrollTop(0);

                }

                // load/attach thumbnails
                attachThumbnails(atmb);
                ltmb.length && loadThumbnails(ltmb);

                // make directory droppable
                dirs && makeDroppable();

                if (selectedFiles.length) {
                    place.find('[id]:not(.' + clSelected + '):not(.elfinder-cwd-parent)').each(function() {
                        var id = this.id;

                        $.inArray(id, selectedFiles) !== -1 && $(this).trigger(evtSelect);
                    });
                }

            },

            /**
			 * Droppable options for cwd.
			 * Do not add class on childs file over
			 *
			 * @type Object
			 */
            droppable = $.extend({}, fm.droppable, {
                over: function(e, ui) {
                    var hash = fm.cwd().hash;
                    $.each(ui.helper.data('files'), function(i, h) {
                        if (fm.file(h).phash == hash) {
                            cwd.removeClass(clDropActive);
                            return false;
                        }
                    });
                }
            }),

            /**
			 * Make directory droppable
			 *
			 * @return void
			 */
            makeDroppable = function() {
                setTimeout(function() {
                    cwd.find('.directory:not(.' + clDroppable + ',.elfinder-na,.elfinder-ro)').droppable(fm.droppable);
                }, 20);
            },

            /**
			 * Preload required thumbnails and on load add css to files.
			 * Return false if required file is not visible yet (in buffer) -
			 * required for old api to stop loading thumbnails.
			 *
			 * @param  Object  file hash -> thumbnail map
			 * @return Boolean
			 */
            attachThumbnails = function(images) {
                var url = fm.option('tmbUrl'),
                    ret = true,
                    ndx;

                $.each(images, function(hash, tmb) {
                    var node = cwd.find('#' + hash);

                    if (node.length) {

                        (function(node, tmb) {
                            $('<img/>')
                                .load(function() { node.find('.elfinder-cwd-icon').css('background', "url('" + tmb + "') center center no-repeat"); })
                                .attr('src', tmb);
                        })(node, url + tmb);
                    } else {
                        ret = false;
                        if ((ndx = index(hash)) != -1) {
                            buffer[ndx].tmb = tmb;
                        }
                    }
                });
                return ret;
            },

            /**
			 * Load thumbnails from backend.
			 *
			 * @param  Array|Boolean  files hashes list for new api | true for old api
			 * @return void
			 */
            loadThumbnails = function(files) {
                var tmbs = [];

                if (fm.oldAPI) {
                    fm.request({
                            data: { cmd: 'tmb', current: fm.cwd().hash },
                            preventFail: true
                        })
                        .done(function(data) {
                            if (attachThumbnails(data.images || []) && data.tmb) {
                                loadThumbnails();
                            }
                        });
                    return;
                }

                tmbs = tmbs = files.splice(0, tmbNum);
                if (tmbs.length) {
                    fm.request({
                            data: { cmd: 'tmb', targets: tmbs },
                            preventFail: true
                        })
                        .done(function(data) {
                            if (attachThumbnails(data.images || [])) {
                                loadThumbnails(files);
                            }
                        });
                }
            },

            /**
			 * Add new files to cwd/buffer
			 *
			 * @param  Array  new files
			 * @return void
			 */
            add = function(files) {
                var place = list ? cwd.find('tbody') : cwd,
                    l = files.length,
                    ltmb = [],
                    atmb = {},
                    dirs = false,
                    findNode = function(file) {
                        var pointer = cwd.find('[id]:first'), file2;

                        while (pointer.length) {
                            file2 = fm.file(pointer.attr('id'));
                            if (!pointer.is('.elfinder-cwd-parent') && file2 && fm.compare(file, file2) < 0) {
                                return pointer;
                            }
                            pointer = pointer.next('[id]');
                        }
                    },
                    findIndex = function(file) {
                        var l = buffer.length, i;

                        for (i = 0; i < l; i++) {
                            if (fm.compare(file, buffer[i]) < 0) {
                                return i;
                            }
                        }
                        return l || -1;
                    },
                    file,
                    hash,
                    node,
                    ndx;


                while (l--) {
                    file = files[l];
                    hash = file.hash;

                    if (cwd.find('#' + hash).length) {
                        continue;
                    }

                    if ((node = findNode(file)) && node.length) {
                        node.before(itemhtml(file));
                    } else if ((ndx = findIndex(file)) >= 0) {
                        buffer.splice(ndx, 0, file);
                    } else {
                        place.append(itemhtml(file));
                    }

                    if (cwd.find('#' + hash).length) {
                        if (file.mime == 'directory') {
                            dirs = true;
                        } else if (file.tmb) {
                            file.tmb === 1 ? ltmb.push(hash) : (atmb[hash] = file.tmb);
                        }
                    }
                }

                checkCwdEmpty();

                attachThumbnails(atmb);
                ltmb.length && loadThumbnails(ltmb);
                dirs && makeDroppable();
            },

            /**
			 * Remove files from cwd/buffer
			 *
			 * @param  Array  files hashes
			 * @return void
			 */
            remove = function(files) {
                var l = files.length, hash, n, ndx;

                while (l--) {
                    hash = files[l];
                    if ((n = cwd.find('#' + hash)).length) {
                        try {
                            n.detach();
                        } catch (e) {
                            fm.debug('error', e);
                        }
                    } else if ((ndx = index(hash)) != -1) {
                        buffer.splice(ndx, 1);
                    }
                }

                checkCwdEmpty();
            },

            msg = {
                name: fm.i18n('name'),
                perm: fm.i18n('perms'),
                mod: fm.i18n('modify'),
                size: fm.i18n('size'),
                kind: fm.i18n('kind'),
                date: fm.i18n('date')
            },

            getSpanForSort = function(name) {
                var span = '<span class="' + name + ' caret up"></span>';
                if (fm.sortType == name) {
                    if (fm.sortOrder == "asc") {
                        span = span.replace(' up', '');
                    }
                } else {
                    span = span.replace(' caret', '').replace(' up', '');
                }
                return span;
            },

            customColsNameBuild = function() {
                var customColsName = '';
                var columns = fm.options.uiOptions.cwd.listView.columns;
                for (var i = 0; i < columns.length; i++) {

                    var span = getSpanForSort(columns[i]);
                    var td = '<td class="' + columns[i] + '">';
                    if (fm.options.uiOptions.cwd.listView.columnsCustomName[columns[i]] != null) {
                        customColsName += td + fm.options.uiOptions.cwd.listView.columnsCustomName[columns[i]] + span + '</td>';
                    } else {
                        customColsName += td + msg[columns[i]] + span + '</td>';
                    }
                }
                return customColsName;
            },

            checkCwdEmpty = function() {
                var com,
                    button,
                    link,
                    place = list ? cwd.children('table').children('tbody') : cwd;
                cwd.find(".emptyfolder").remove();
                cwd.find(".nofiles").remove();

                if ((com = fm._commands['filter'])) {
                    if (place.is(':empty') && com.filterState != 'All') {
                        var filterdiv = '<div class="nofiles aligncenter"><img src="../Content/elfinder/img/nofiles.png">' +
                            '<p>' + fm.i18n('notfilesforfilter') + '</p>' +
                            '</div>';
                        cwd.append(filterdiv);
                        return;
                    }
                }

                if (place.is(':empty')) {
                    var div = $('<div class="emptyfolder aligncenter">' +
                        '<img src="../Content/elfinder/img/emptyfolder.png">' +
                        '<h6>' + fm.i18n('cwdempty') + '</h6>' +
                        '<p>' + fm.i18n('cwdemptyhelp') + fm.i18n('or') + '</p>' +
                        '</div>');

                    if ((com = fm._commands['upload'])) {
                        button = 'elfinder' + com.options.ui;
                        if ($.fn[button]) link = $('<div/>')[button](com, true, fm.i18n('cwdselectfile'));
                        div.find("p").append(link);
                    }
                    var dir = fm.cwd();
                    if (dir.volumeId == "v0_" && dir.name == fm.i18n('receiveddirname')) div.find("p").remove();
                    cwd.append(div);
                    cwd.parent().children('table.thead').remove();
                } else {
                    if (!cwd.parent().children('table.thead').length) {
                        var thead = '<table class="thead"><thead><tr class="ui-state-default"><td class="chb">' + CBhead + '</td><td class="name">' + fm.i18n('name') + getSpanForSort('name') + '</td>' + customColsNameBuild() + '</tr></thead></table>';
                        if (list) {
                            cwd.parent().prepend(thead);
                        } else {
                            cwd.parent().prepend(selectAllBlock);
                            $(".selectalltext").bind('click', function(e) {
                                e.preventDefault();
                                e.stopPropagation();
                                var cb = $(getTarget(e)).parent().find('input[type="checkbox"].selectAllChB');
                                if (cb && cb.is(':checked')) {
                                    unselectAll();
                                } else {
                                    selectAll();
                                }
                            });
                        }
                    }
                }
            },

            /**
			 * Update directory content
			 *
			 * @param  Array  files
			 * @return void
			 */
            content = function(files, any) {
                var phash = fm.cwd().hash;
                unselectAll();
                try {
                    // to avoid problem with draggable
                    cwd.children('table,' + fileSelector).remove();
                    cwd.parent().children('table.thead').remove();
                    cwd.parent().children('table.thead').remove();
                } catch (e) {
                    cwd.html('');
                }

                cwd.removeClass('elfinder-cwd-view-icons elfinder-cwd-view-list')
                    .addClass('elfinder-cwd-view-' + (list ? 'list' : 'icons'));

                wrapper[list ? 'addClass' : 'removeClass']('elfinder-cwd-wrapper-list');

                //list && cwd.html('<table><thead><tr class="ui-state-default"><td >'+msg.name+'</td><td>'+msg.perm+'</td><td>'+msg.mod+'</td><td>'+msg.size+'</td><td>'+msg.kind+'</td></tr></thead><tbody/></table>');

                var thead = '<table class="thead"><thead><tr class="ui-state-default"><td class="chb">' + CBhead + '</td><td class="name">' + fm.i18n('name') + getSpanForSort('name') + '</td>' + customColsNameBuild() + '</tr></thead></table>';
                list && cwd.html('<table><tbody/></table>');
                list && cwd.parent().prepend(thead);

                buffer = $.map(files, function(f) { return any || f.phash == phash ? f : null; });
                if (!list && buffer.length > 0) {
                    cwd.parent().prepend(selectAllBlock);
                    $(".selectalltext").bind('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        var cb = $(getTarget(e)).parent().find('input[type="checkbox"].selectAllChB');
                        if (cb && cb.is(':checked')) {
                            unselectAll();
                        } else {
                            selectAll();
                        }
                    });
                }

                buffer = fm.sortFiles(buffer);

                //wrapper.bind(scrollEvent, render).trigger(scrollEvent);
                cwd.bind(scrollEvent, render).trigger(scrollEvent);

                checkCwdEmpty();

                phash = fm.cwd().phash;

                if (options.oldSchool && phash && !query) {
                    var parent = $.extend(true, {}, fm.file(phash), { name: '..', mime: 'directory' });
                    parent = $(itemhtml(parent))
                        .addClass('elfinder-cwd-parent')
                        .bind('mousedown click mouseup touchstart touchmove touchend dblclick mouseenter', function(e) {
                            //.bind('mousedown click mouseup dblclick mouseenter', function(e) {
                            e.preventDefault();
                            e.stopPropagation();
                        })
                        .dblclick(function() {
                            fm.exec('open', this.id);
                        });

                    (list ? cwd.find('tbody') : cwd).prepend(parent);
                }

            },

            /**
			 * CWD node itself
			 *
			 * @type JQuery
			 **/
            cwd = $(this)
                .addClass('ui-helper-clearfix elfinder-cwd')
                .attr('unselectable', 'on')
                // fix ui.selectable bugs and add shift+click support 
                .delegate(fileSelector, 'click.' + fm.namespace, function(e) {
                    var p = this.id ? $(this) : $(this).parents('[id]:first'),
                        prev = p.prevAll('.' + clSelected + ':first'),
                        next = p.nextAll('.' + clSelected + ':first'),
                        pl = prev.length,
                        nl = next.length,
                        target = getTarget(e),
                        sib;

                    e.stopImmediatePropagation();
                    if (blockMultiSelection) unselectAll();
                    if (!blockMultiSelection && e.shiftKey && (pl || nl)) {
                        sib = pl ? p.prevUntil('#' + prev.attr('id')) : p.nextUntil('#' + next.attr('id'));
                        sib.add(p).trigger(evtSelect);
                    } else if (e.ctrlKey || e.metaKey) {
                        //$(p).find('input[type="checkbox"]').prop("checked", !p.is('.' + clSelected));
                        //change($(p).find('input[type="checkbox"]'));
                        p.trigger(p.is('.' + clSelected) ? evtUnselect : evtSelect);
                    } else {
                        if ($(target).children().is('input[type="checkbox"]') ||
                            //$(e.srcElement).is('.bootstrap-checkbox') || $(e.srcElement).is('.btn-link') ||
                            $(target).is('.cb-icon-check-empty')
                            || $(target).is('.cb-icon-check')) {
                            p.trigger(p.is('.' + clSelected) ? evtUnselect : evtSelect);
                        } else if (!$(target).is('input[type="text"]')) {
                            if ($(this).data('touching') && p.is('.' + clSelected)) {
                                $(this).data('touching', null);
                                fm.dblclick({ file: this.id });
                                unselectAll();
                            } else {
                                unselectAll();
                                p.trigger(p.is('.' + clSelected) ? evtUnselect : evtSelect);
                            }
                        }
                    }

                    trigger();
                })
                // call fm.open()
                .delegate(fileSelector, 'dblclick.' + fm.namespace, function(e) {
                    fm.dblclick({ file: this.id });
                })
                // for touch device
                .delegate(fileSelector, 'touchstart.' + fm.namespace, function(e) {
                    $(this).data('touching', true);
                    var p = this.id ? $(this) : $(this).parents('[id]:first'),
                        sel = p.prevAll('.' + clSelected + ':first').length +
                            p.nextAll('.' + clSelected + ':first').length;
                    $(this).data('longtap', setTimeout(function() {
                        // long tap
                        p.trigger(p.is('.' + clSelected) ? evtUnselect : evtSelect);
                        trigger();
                        if (sel == 0 && p.is('.' + clSelected)) {
                            p.trigger('click');
                            trigger();
                        }
                    }, 500));
                })
                .delegate(fileSelector, 'touchmove.' + fm.namespace + ' touchend.' + fm.namespace, function(e) {
                    clearTimeout($(this).data('longtap'));
                })
                // attach draggable
                //.delegate(fileSelector, 'mouseenter.'+fm.namespace, function(e) {
                //	var $this = $(this),
                //		target = list ? $this : $this.children();

                //	if (!$this.is('.'+clTmp) && !target.is('.'+clDraggable+',.'+clDisabled)) {
                //		target.draggable(fm.draggable);
                //	}
                //})
                // add hover class to selected file
                .delegate(fileSelector, evtSelect, function(e) {
                    var $this = $(this),
                        id = $this.attr('id'),
                        file = fm.file(id);
                    if (!file || !(file.mime == "directory" && fm.isModal)) {
                        if (!selectLock && !$this.is('.' + clDisabled)) {
                            $(this).find('input[type="checkbox"]').prop("checked", true);
                            change($(this).find('input[type="checkbox"]'));
                            $this.addClass(clSelected).children().addClass(clHover);
                            if ($.inArray(id, selectedFiles) === -1) {
                                selectedFiles.push(id);
                            }
                        }
                    }
                })
                // remove hover class from unselected file
                .delegate(fileSelector, evtUnselect, function(e) {
                    var $this = $(this),
                        id = $this.attr('id'),
                        ndx;

                    if (!selectLock) {
                        $(this).removeClass(clSelected).children().removeClass(clHover);
                        $(this).find('input[type="checkbox"]').prop("checked", false);
                        change($(this).find('input[type="checkbox"]'));
                        ndx = $.inArray(id, selectedFiles);
                        if (ndx !== -1) {
                            selectedFiles.splice(ndx, 1);
                        }
                    }

                })
                // disable files wich removing or moving
                .delegate(fileSelector, evtDisable, function() {
                    var $this = $(this).removeClass(clSelected).addClass(clDisabled),
                        target = (list ? $this : $this.children()).removeClass(clHover);

                    $(target).find('input[type="checkbox"]').prop("checked", false);
                    change($(target).find('input[type="checkbox"]'));

                    $this.is('.' + clDroppable) && $this.droppable('disable');
                    target.is('.' + clDraggable) && target.draggable('disable');
                    !list && target.removeClass(clDisabled);
                })
                // if any files was not removed/moved - unlock its
                .delegate(fileSelector, evtEnable, function() {
                    var $this = $(this).removeClass(clDisabled),
                        target = list ? $this : $this.children();

                    $this.is('.' + clDroppable) && $this.droppable('enable');
                    target.is('.' + clDraggable) && target.draggable('enable');
                })
                .delegate(fileSelector, 'scrolltoview', function() {
                    scrollToView($(this));
                })
                .delegate(fileSelector, 'mouseenter.' + fm.namespace + ' mouseleave.' + fm.namespace, function(e) {
                    fm.trigger('hover', { hash: $(this).attr('id'), type: e.type });
                    $(this).toggleClass('ui-state-hover');
                })
                .bind('contextmenu.' + fm.namespace, function(e) {
                    var file = $(e.target).closest('.' + clFile);

                    if (file.length) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (!file.is('.' + clDisabled)) {
                            if (!file.is('.' + clSelected)) {
                                // cwd.trigger('unselectall');
                                unselectAll();
                                file.trigger(evtSelect);
                                trigger();
                            }
                            fm.trigger('contextmenu', {
                                'type': 'files',
                                'targets': fm.selected(),
                                'x': e.clientX,
                                'y': e.clientY
                            });

                        }

                    }
                    // e.preventDefault();
                })
                // unselect all on cwd click
                .bind('click.' + fm.namespace, function(e) {
                    !e.shiftKey && !e.ctrlKey && !e.metaKey && unselectAll();
                })

                // make files selectable
                .selectable({
                    filter: fileSelector,
                    stop: trigger,
                    delay: 250,
                    selected: function(e, ui) { $(ui.selected).trigger(evtSelect); },
                    unselected: function(e, ui) { $(ui.unselected).trigger(evtUnselect); }
                })
                // make cwd itself droppable for folders from nav panel
                .droppable(droppable)
                // prepend fake file/dir
                .bind('create.' + fm.namespace, function(e, file) {
                    var parent = list ? cwd.find('tbody') : cwd,
                        p = parent.find('.elfinder-cwd-parent'),
                        file = $(itemhtml(file)).addClass(clTmp);

                    unselectAll();

                    if (p.length) {
                        p.after(file);
                    } else {
                        parent.prepend(file);
                    }

                    cwd.scrollTop(0);
                })
                // unselect all selected files
                .bind('unselectall', unselectAll)
                .bind('selectfile', function(e, id) {
                    cwd.find('#' + id).trigger(evtSelect);
                    trigger();
                }),

            wrapper = $('<div class="elfinder-cwd-wrapper"/>')
                .bind('click', function(e) {
                    var td, sort, target = getTarget(e);
                    if ($(target).children().is('input[type="checkbox"].selectAllChB')) {
                        if (!$(target).is(':checked')) unselectAll();
                        else selectAll();
                    } else if ($(target).is('.bootstrap-checkbox')) {
                        td = $(target).parent();
                    } else if ($(target).is('.cb-icon-check-empty')
                        || $(target).is('.cb-icon-check')) {
                        td = $(target).parent().parent();
                    } else if ($(target).is('td.chb')) {
                        td = $(target);
                    } else if ($(target).is('td')) {
                        sort = { order: "desc", stick: true, type: "name" };
                        var span = $(target).find('span');
                        var isNeedSortAsc = $(span).is(".caret") ? $(span).is('.up') : true;
                        $(target).parent().find('span.caret').removeClass('up').removeClass('caret');

                        sort.order = isNeedSortAsc ? "asc" : "desc";
                        sort.type = $(span).is('.date') ? "date" : $(span).is('.kind') ? "kind" : "name";

                        if (isNeedSortAsc) $(span).addClass('caret').removeClass('up');
                        else $(span).addClass('caret').addClass('up');

                        fm.setSort(sort.type, sort.order, sort.stick);
                    } else {
                        !e.shiftKey && !e.ctrlKey && !e.metaKey && unselectAll();
                    }

                    if (td) {
                        var ch = td.find('input[type="checkbox"].selectAllChB');
                        if ($(ch).is(':checked')) unselectAll();
                        else selectAll();
                    }
                })
                .bind('contextmenu', function(e) {
                    e.preventDefault();
                    fm.trigger('contextmenu', {
                        'type': 'cwd',
                        'targets': [fm.cwd().hash],
                        'x': e.clientX,
                        'y': e.clientY
                    });
                }),

            resize = function() {
                var h = 0;

                wrapper.siblings('.elfinder-panel:visible').each(function() {
                    h += $(this).outerHeight(true);
                });

                wrapper.height(wz.height() - h);
            },

            // elfinder node
            parent = $(this).parent().resize(resize),
            // workzone node
            wz = parent.children('.elfinder-workzone').append(wrapper.append(this));


        if (fm.dragUpload) {
            wrapper[0].addEventListener('dragenter', function(e) {
                e.preventDefault();
                e.stopPropagation();

                wrapper.addClass(clDropActive);
            }, false);

            wrapper[0].addEventListener('dragleave', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.target == cwd[0] && wrapper.removeClass(clDropActive);
            }, false);

            wrapper[0].addEventListener('dragover', function(e) {
                e.preventDefault();
                e.stopPropagation();
            }, false);

            wrapper[0].addEventListener('drop', function(e) {
                e.preventDefault();
                wrapper.removeClass(clDropActive);

                var items = e.dataTransfer.items;
                for (var i = 0; i < items.length; i++) {
                    var item = items[i].webkitGetAsEntry();
                    if (item && item.isDirectory) {
                        fm.error('errorDropDir');
                        return;
                    }
                }

                e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length && fm.exec('upload', { files: e.dataTransfer.files }); //fm.upload({files : e.dataTransfer.files});
            }, false);
        }

        fm
            .bind('open', function(e) {
                fm.trigger('filterend');
                content(e.data.files);
            })
            .bind('search', function(e) {
                lastSearch = e.data.files;
                content(lastSearch, true);
            })
            .bind('searchend', function() {
                lastSearch = [];
                if (query) {
                    query = '';
                    content(fm.files());
                }
            })
            .bind('searchstart', function(e) {
                query = e.data.query;
            })
            .bind('filter', function(e) {
                lastFilter = e.data.files;
                content(lastFilter, true);
            })
            .bind('filterend', function() {
                lastFilter = [];
                //if (query) {
                //query = '';
                content(fm.files());
                //}
            })
            .bind('filterstart', function(e) {
                //query = e.data.query;
            })
            .bind('sortchange', function() {
                content(query ? lastSearch : lastFilter.length > 0 ? lastFilter : fm.files(), !!query);
            })
            .bind('viewchange', function() {
                var sel = fm.selected(),
                    l = fm.storage('view') == 'list';

                if (l != list) {
                    list = l;
                    content(lastFilter.length > 0 ? lastFilter : fm.files());

                    $.each(sel, function(i, h) {
                        selectFile(h);
                    });
                    trigger();
                }
                resize();
            })
            .add(function(e) {
                var phash = fm.cwd().hash,
                    files = query
                        ? $.map(e.data.added || [], function(f) {
                            return f.name.indexOf(query) === -1 ? null : f;
                        })
                        : $.map(e.data.added || [], function(f) {
                            return f.phash == phash ? f : null;
                        });
                add(files);
            })
            .change(function(e) {
                var phash = fm.cwd().hash,
                    sel = fm.selected(),
                    files;

                if (query) {
                    $.each(e.data.changed || [], function(i, file) {
                        remove([file.hash]);
                        if (file.name.indexOf(query) !== -1) {
                            add([file]);
                            $.inArray(file.hash, sel) !== -1 && selectFile(file.hash);
                        }
                    });
                } else {
                    $.each($.map(e.data.changed || [], function(f) { return f.phash == phash ? f : null; }), function(i, file) {
                        remove([file.hash]);
                        add([file]);
                        $.inArray(file.hash, sel) !== -1 && selectFile(file.hash);
                    });
                }

                trigger();
            })
            .remove(function(e) {
                remove(e.data.removed || []);
                trigger();
            })
            // fix cwd height if it less then wrapper
            .bind('open add search searchend', function() {
                cwd.css('height', 'auto');

                if (cwd.outerHeight(true) < wrapper.height()) {
                    cwd.height(wrapper.height() - (cwd.outerHeight(true) - cwd.height()) - 2);
                }
            })
            // select dragged file if no selected, disable selectable
            .dragstart(function(e) {
                var target = $(e.data.target),
                    oe = e.data.originalEvent;

                if (target.is(fileSelector)) {

                    if (!target.is('.' + clSelected)) {
                        !(oe.ctrlKey || oe.metaKey || oe.shiftKey) && unselectAll();
                        target.trigger(evtSelect);
                        trigger();
                    }
                    cwd.droppable('disable');
                }

                cwd.selectable('disable').removeClass(clDisabled);
                selectLock = true;
            })
            // enable selectable
            .dragstop(function() {
                cwd.selectable('enable').droppable('enable');
                selectLock = false;
            })
            .bind('lockfiles unlockfiles', function(e) {
                var event = e.type == 'lockfiles' ? evtDisable : evtEnable,
                    files = e.data.files || [],
                    l = files.length;

                while (l--) {
                    cwd.find('#' + files[l]).trigger(event);
                }
                //trigger();
            })
            // select new files after some actions
            .bind('mkdir mkfile duplicate upload rename archive extract', function(e) {
                var phash = fm.cwd().hash, files;

                unselectAll();

                $.each(e.data.added || [], function(i, file) {
                    file && file.phash == phash && selectFile(file.hash);
                });
                trigger();
            })
            .shortcut({
                pattern: 'ctrl+a',
                description: 'selectall',
                callback: selectAll
            })
            //.shortcut({
            //	pattern     : 'left right up down shift+left shift+right shift+up shift+down',
            //	description : 'selectfiles',
            //	type        : 'keydown' , //fm.UA.Firefox || fm.UA.Opera ? 'keypress' : 'keydown',
            //	callback    : function(e) { select(e.keyCode, e.shiftKey); }
            //})
            .shortcut({
                pattern: 'home',
                description: 'selectffile',
                callback: function(e) {
                    unselectAll();
                    scrollToView(cwd.find('[id]:first').trigger(evtSelect));
                    trigger();
                }
            })
            .shortcut({
                pattern: 'end',
                description: 'selectlfile',
                callback: function(e) {
                    unselectAll();
                    scrollToView(cwd.find('[id]:last').trigger(evtSelect));
                    trigger();
                }
            });

    });

    // fm.timeEnd('cwdLoad')

    return this;
};
Crypt = Crypt or {}

# todo вынести в каконить общий инит
Crypt.Dialogs = Crypt.Dialogs || {};

###*
# Основной Диалог
###
Crypt.Dialog = () ->

  options:
    immediately: false
    html: null
    class: ''
    uniqId: null
    onClose: Function.prototype
    onHide: Function.prototype
    hideCloseBtn: false
    closeOnOverlayClick: true
    visibleToolbar: false
    top: null

  tpl:
    wrap     : '<div class="fancybox-wrap js-dialog" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner modal-window js-dialog-content "></div></div></div></div>',
    image    : '<img class="fancybox-image" src="{href}" alt="" />',
    iframe   : '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0"' + ($.browser.msie ? ' allowtransparency="true"' : '') + '></iframe>',
    error    : '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
    closeBtn : '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
    next     : '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
    prev     : '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'


  Open: (type, data, options) ->

    data = data ? data || {}

    # todo переделать этот пиздец с конфигами модалок
    fbOptions = {
      tpl: @tpl
      wrapCSS: 'blank-modal'
      autoSize: true
      helpers:
        overlay : 1
      afterClose: _.bind(()->
        $(@).trigger('onClose')
      ,this)
    }

    fbOptions = _.extend(fbOptions,options)

    switch type
      when 'blankError'
        fbOptions.wrapCSS = 'error-modal'
        template = $('#tpl-blankError').text()
        html = _.template(template)(data)
        break
      when 'blankInfo'
        fbOptions.wrapCSS = 'info-modal'
        template = $('#tpl-blankInfo').text()
        html = _.template(template)(data)
        break
      when 'blankCentered'
        fbOptions.wrapCSS = 'blank-centered'
        template = $('#tpl-blankCentered').text()
        html = _.template(template)(data)
        break
      when 'blankInform'
        fbOptions.wrapCSS = 'blank-inform'
        template = $('#tpl-blankInform').text()
        html = _.template(template)(data)
        break
      else
        template = $('#tpl-'+type).text()
        html = _.template(template)(data)
        break

    $.fancybox.open html, fbOptions

    @$dialog = $('.js-dialog')
    @$content = @$dialog.find('.js-dialog-content')
    return

  SetOptions: (options) ->
    _.extend @options, options
    @options.onClose = if _.isFunction(@options.onClose) then @options.onClose else Function.prototype
    @options.onHide = if _.isFunction(@options.onHide) then @options.onHide else Function.prototype
    return

  Close: ->
    $.fancybox.close()
    false

  Hide: ->
    @options.onHide()
    @$dialog.addClass 'hidden'
    @closeOrHide()
    return


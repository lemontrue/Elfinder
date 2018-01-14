###*
# Диалог активации маркера
###
Crypt.Dialogs.ConfirmRequest = Crypt.View.extend(
  events:
    'click .js-confirm': 'onClickNext'
    'click .js-cancel': 'onCloseDialogTry'
    'click .js-sub-confirm': 'onCloseDialog'
    'click .js-sub-cancel': 'onCancelDecline'

  template: 'confirmRequestSend'
  canClose: false

  initialize: (markerId, callback) ->
    @cb = callback
    @markerId = markerId

    @getMarkerInfo()

    return

  setDialog: () ->
    @dialog = new Crypt.Dialog()
    @dialog.Open(@template, @certInfo, {
      wrapCSS: 'empty-modal'
      beforeClose: _.bind(() ->
        if @$footer.hasClass 'disabled' then return false
        @beforeClose()
        return @canClose
      this)

    })

    @setElement(@dialog.$content)
    @render()

  ###*
  # Рендерим шаблон, кэшируем объекты
  ###
  render: ->
    @$footer = @$('.js-dialog-footer')

    @$nextBtn = @$('.js-confirm')
    @$subDialogCancel = @$('.js-sub-dialog')

    return

  # закрываем диалог
  onCloseDialog: ->
    @canClose = true
    @dialog.Close()
    Crypt.Preloader.UnBlock $('#myCertificateList')

  # закрываем диалог
  onCloseDialogTry: ->
    @dialog.Close()


  # отмена в диалоге подтверждения закрытия
  onCancelDecline: ->
    @Hide @$subDialogCancel
    return

  # диалог подтверждения закрытия
  beforeClose: ->
    if (!@canClose)
      @Show @$subDialogCancel
    return false

  # блокируем навигацию в футере и хэдера диалога
  blockNavigation: ->
    @$footer.addClass 'disabled'
    return

  # разблокируем навигацию
  unBlockNavigation: ->
    @$tabsTitlesBlock.removeClass 'disabled'
    @$footer.removeClass 'disabled'
    return

  # кнопка продожлить
  onClickNext: ->
    if @$nextBtn.hasClass 'disabled' || @$footer.hasClass 'disabled' then return false

    @pinDialog = new Crypt.Dialogs.ConfirmRequestPin(_.bind((pin)->
      @sendRequest(pin)
    this))

    return false

  # запрос получения инфы о сертификтате
  getMarkerInfo: ->
    debugger
    $.ajax
      url: Crypt.Urls.MarkerRequestCertInfo
      data:
        currentMarkerId: @markerId
      success: _.bind((response) ->
        if (response.Status == 0)
          i = response.ShowingInfo
          data =
            name: _.find(i, (el)->
              el.Name == 'SN'
            ) || {}
            surname: _.find(i, (el)->
              el.Name=='G'
            ) || {}
            post: _.find(i, (el)->
              el.Name=='T'
            ) || {}
            address: _.find(i, (el)->
              el.Name=='STREET'
            ) || {}
            company: _.find(i, (el)->
              el.Name=='O'
            ) || {}
            department: _.find(i, (el)->
              el.Name=='OU'
            ) || {}
            city: _.find(i, (el)->
              el.Name=='L'
            ) || {}
            region: _.find(i, (el)->
              el.Name=='S'
            ) || {}
            country: _.find(i, (el)->
              el.Name=='C'
            ) || {}
            email: _.find(i, (el)->
              el.Name=='E'
            ) || {}
            inn: _.find(i, (el)->
              el.Name=='ИНН'
            ) || {}
            ogrnip: _.find(i, (el)->
              el.Name=='ОГРНИП'
            ) || {}
            ogrn: _.find(i, (el)->
              el.Name=='ОГРН'
            ) || {}
            snils: _.find(i, (el)->
              el.Name=='СНИЛС'
            ) || {}
            KeyUsage: _.find(i, (el)->
              el.Name=='KeyUsage'
            ) || {}
            EnhancedKeyUsage: _.find(i, (el)->
              el.Name=='EnhancedKeyUsage'
            ) || {}
            CertificatePolicies: _.find(i, (el)->
              el.Name=='CertificatePolicies'
            ) || {}
          data = _.each(data,(el,i)->
            if (!!el && !!el.Value)
              el.Text = el.Value
            else
              el.Text = ''
            return
          )
          @certInfo = {
            name: data.name.Text + ' ' + data.surname.Text
            post: data.post.Text
            address: data.address.Text
            company: data.company.Text + data.department.Text
            city: data.city.Text
            region: data.region.Text + ', ' + data.country.Text
            email: data.email.Text
            inn: data.inn.Text
            ogrn: data.ogrn.Text
            ogrnip: data.ogrnip.Text
            snils: data.snils.Text
            KeyUsage: if data.KeyUsage.Text then data.KeyUsage.Text.replace(/,/g, ', ') else ''
            EnhancedKeyUsage: data.EnhancedKeyUsage.Text

          }
          if (@certInfo.name.length > 30)
            @certInfo.name =  @certInfo.name.substr(0, 30) + '...'
        @setDialog()
        return
      this)
      error: ->
        return
    return

  # послыаем запрос
  sendRequest: (pin) ->

    Crypt.Preloader.Block $('.js-dialog')
    $.ajax
      url: Crypt.Urls.MarkerRequestConfirm
      data:
        requestId: @markerId
        pin: pin
      success: _.bind((response) ->
        Crypt.Preloader.UnBlock $('.js-dialog')
        if (!!response && !response.Error)
          new Crypt.Dialogs.RequestCongratulation()
        else
          (new (Crypt.Dialog)).Open('blankError', text: 'Во время операции подтверждения выпуска сертификата произошла ошибка. Повторите действие позже',{
            afterClose:  _.bind(() ->
              @getMarkerInfo()
              return
            this)
          })
        return
      this)
      error: _.bind((response) ->
        Crypt.Preloader.UnBlock $('.js-dialog')
        (new (Crypt.Dialog)).Open('blankError', text: 'Во время операции подтверждения выпуска сертификата произошла ошибка. Повторите действие позже',{
          afterClose:  _.bind(() ->
            @getMarkerInfo()
            return
          this)
        })
        return
      this)

    return
)
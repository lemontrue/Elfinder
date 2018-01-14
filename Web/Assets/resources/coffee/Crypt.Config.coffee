Crypt = Crypt or {}

Crypt.Config = {
  Forms:
    Registration:
      rules:
        FIO:
          required: true
          maxlength: 50
        Phone:
          required: true
          minlength: 18
          maxlength: 18
        Email:
          required: true
          tnsEmail: true
          maxlength: 50
        Password:
          required: true
          minlength: 6
          maxlength: 40
          tnsPassword: true
        City: 'required'
      messages:
        FIO: 'Введите ФИО'
        Phone:
          required: 'Введите номер телефона'
          minlength: 'Введите номер, зарегистрированный в РФ, в международном формате, например +7 (123) 456-78-90'
          maxlength: 'Введите номер, зарегистрированный в РФ, в международном формате, например +7 (123) 456-78-90'
        Email:
          required: 'Введите E-mail'
          tnsEmail: 'Некорректный E-mail'
          maxlength: 'Некорректный E-mail'
        Password:
          required: 'Введите Пароль'
          minlength: 'Пароль не менее 6 символов должен включать цифры, заглавные и строчные латинские буквы'
          maxlength: 'Максимальная длина пароля равна 40 символам'
          tnsPassword: 'Пароль не менее 6 символов должен включать цифры, заглавные и строчные латинские буквы'
        City: 'Введите город'

}
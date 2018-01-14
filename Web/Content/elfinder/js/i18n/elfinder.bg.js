﻿/**
 * Bulgarian translation
 * @author Stamo Petkov <stamo.petkov@gmail.com>
 * @version 2012-02-18
 */
if (elFinder && elFinder.prototype && typeof(elFinder.prototype.i18) == 'object') {
    elFinder.prototype.i18.bg = {
        translator: 'Stamo Petkov &lt;stamo.petkov@gmail.com&gt;',
        language: 'Български',
        direction: 'ltr',
        messages: {

            /********************************** errors **********************************/
            'error': 'Грешка',
            'errUnknown': 'Непозната грешка.',
            'errUnknownCmd': 'Непозната команда.',
            'errJqui': 'Грешна конфигурация на jQuery UI. Компонентите selectable, draggable и droppable трябва да са включени.',
            'errNode': 'elFinder изисква да бъде създаден DOM елемент.',
            'errURL': 'Грешка в настройките на elFinder! не е зададена стойност на URL.',
            'errAccess': 'Достъп отказан.',
            'errConnect': 'Няма връзка със сървъра.',
            'errAbort': 'Връзката е прекъсната.',
            'errTimeout': 'Просрочена връзка.',
            'errNotFound': 'Сървърът не е намерен.',
            'errResponse': 'Грешен отговор от сървъра.',
            'errConf': 'Грешни настройки на сървъра.',
            'errJSON': 'Не е инсталиран модул на PHP за JSON.',
            'errNoVolumes': 'Няма дялове достъпни за четене.',
            'errCmdParams': 'Грешни параметри на командата "$1".',
            'errDataNotJSON': 'Данните не са JSON.',
            'errDataEmpty': 'Липсват данни.',
            'errCmdReq': 'Запитването от сървъра изисква име на команда.',
            'errOpen': 'Не мога да отворя "$1".',
            'errNotFolder': 'Обектът не е папка.',
            'errNotFile': 'Обектът не е фаил.',
            'errRead': 'Не мога да прочета "$1".',
            'errWrite': 'Не мога да пиша в "$1".',
            'errPerm': 'Разрешение отказано.',
            'errLocked': '"$1" е заключен и не може да бъде преименуван, местен или премахван.',
            'errExists': 'Вече съществува файл с име "$1"',
            'errInvName': 'Грешно име на фаил.',
            'errFolderNotFound': 'Папката не е открита.',
            'errFileNotFound': 'Фаилът не е открит.',
            'errTrgFolderNotFound': 'Целевата папка "$1" не е намерена.',
            'errPopup': 'Браузъра блокира отварянето на прозорец. За да отворите файла, разрешете отварянето в настройките на браузъра.',
            'errMkdir': 'Не мога да създам папка"$1".',
            'errMkfile': 'Не мога да създам файл "$1".',
            'errRename': 'Не мога да преименувам "$1".',
            'errCopyFrom': 'Копирането на файлове от том "$1" не е разрешено.',
            'errCopyTo': 'Копирането на файлове в том "$1" не е разрешено.',
            'errUploadCommon': 'Грешка при качване.',
            'errUpload': 'Не мога да кача "$1".',
            'errUploadNoFiles': 'Не са намерени файлове за качване.',
            'errMaxSize': 'Данните превишават максимално допостумия размер.',
            'errFileMaxSize': 'Файла превишава максимално допустимия размер.',
            'errUploadMime': 'Не е позволен тип на файла.',
            'errUploadTransfer': '"$1" грешка при предаване.',
            'errSave': 'Не мога да запиша "$1".',
            'errCopy': 'Не мога да копирам "$1".',
            'errMove': 'Не мога да преместя "$1".',
            'errCopyInItself': 'Не мога да копирам "$1" върху самия него.',
            'errRm': 'Не мога да премахна "$1".',
            'errExtract': 'Не мога да извлеча файловете от "$1".',
            'errArchive': 'Не мога да създам архив.',
            'errArcType': 'Неподдържан тип на архива.',
            'errNoArchive': 'Файлът не е архив или е от неподдържан тип.',
            'errCmdNoSupport': 'Сървъра не поддържа тази команда.',
            'errReplByChild': 'Папката “$1” не може да бъде заменена от съдържащ се в нея елемент.',
            'errArcSymlinks': 'От съображения за сигурност няма да бъдат разопаковани архиви съдържащи symlinks.',
            'errArcMaxSize': 'Архивните файлове превишават максимално допустимия размер.',
            'errResize': 'Не мога да преоразмеря "$1".',
            'errUsupportType': 'Неподдържан тип файл.',

            /******************************* commands names ********************************/
            'cmdarchive': 'Създай архив',
            'cmdback': 'Назад',
            'cmdcopy': 'Копирай',
            'cmdcut': 'Изрежи',
            'cmddownload': 'Свали',
            'cmdduplicate': 'Дублирай',
            'cmdedit': 'Редактирай файл',
            'cmdextract': 'Извлечи файловете от архива',
            'cmdforward': 'Напред',
            'cmdgetfile': 'Избери файлове',
            'cmdhelp': 'За тази програма',
            'cmdhome': 'Начало',
            'cmdinfo': 'Информация',
            'cmdmkdir': 'Нова папка',
            'cmdmkfile': 'Нов текстови файл',
            'cmdopen': 'Отвори',
            'cmdpaste': 'Вмъкни',
            'cmdquicklook': 'Преглед',
            'cmdreload': 'Презареди',
            'cmdrename': 'Преименувай',
            'cmdrm': 'Изтрий',
            'cmdsearch': 'Намери файлове',
            'cmdup': 'Една директория нагоре',
            'cmdupload': 'Качи файловете',
            'cmdview': 'Виж',
            'cmdresize': 'Размер на изображение',
            'cmdsort': 'Подреди',

            /*********************************** buttons ***********************************/
            'btnClose': 'Затвори',
            'btnSave': 'Запиши',
            'btnRm': 'Премахни',
            'btnApply': 'Приложи',
            'btnCancel': 'Отказ',
            'btnNo': 'Не',
            'btnYes': 'Да',

            /******************************** notifications ********************************/
            'ntfopen': 'Отваряне на папка',
            'ntffile': 'Отваряне на файл',
            'ntfreload': 'Презареждане съдържанието на папка',
            'ntfmkdir': 'Създавам директория',
            'ntfmkfile': 'Създавам файл',
            'ntfrm': 'Изтриване на файлове',
            'ntfcopy': 'Копиране на файлове',
            'ntfmove': 'Преместване на файлове',
            'ntfprepare': 'Подготовка за копиране на файлове',
            'ntfrename': 'Преименуване на файлове',
            'ntfupload': 'Качвам файлове',
            'ntfdownload': 'Свалям файлове',
            'ntfsave': 'Запис на файлове',
            'ntfarchive': 'Създавам архив',
            'ntfextract': 'Извличам файловете от архив',
            'ntfsearch': 'Търся файлове',
            'ntfsmth': 'Зает съм >_<',
            'ntfloadimg': 'Зареждам изображения',

            /************************************ dates **********************************/
            'dateUnknown': 'неизвестна',
            'Today': 'Днес',
            'Yesterday': 'Вчера',
            'Jan': 'Яну',
            'Feb': 'Фев',
            'Mar': 'Мар',
            'Apr': 'Апр',
            'May': 'Май',
            'Jun': 'Юни',
            'Jul': 'Юли',
            'Aug': 'Авг',
            'Sep': 'Сеп',
            'Oct': 'Окт',
            'Nov': 'Ное',
            'Dec': 'Дек',

            /******************************** sort variants ********************************/
            'sortnameDirsFirst': 'по име (първо папките)',
            'sortkindDirsFirst': 'по вид (първо папките)',
            'sortsizeDirsFirst': 'по размер (първо папките)',
            'sortdateDirsFirst': 'по дата (първо папките)',
            'sortname': 'по име',
            'sortkind': 'по вид',
            'sortsize': 'по размер',
            'sortdate': 'по дата',

            /********************************** messages **********************************/
            'confirmReq': 'Изисква се подтвърждение',
            'confirmRm': 'Сигурни ли сте, че желаете да премахнете файловете?<br/>Това действие е необратимо!',
            'confirmRepl': 'Да заменя ли стария фаил с новия?',
            'apllyAll': 'Приложи за всички',
            'name': 'Име',
            'size': 'Размер',
            'perms': 'Привилегии',
            'modify': 'Променен',
            'kind': 'Вид',
            'read': 'четене',
            'write': 'запис',
            'noaccess': 'без достъп',
            'and': 'и',
            'unknown': 'непознат',
            'selectall': 'Избери всички файлове',
            'selectfiles': 'Избери фаил(ове)',
            'selectffile': 'Избери първият файл',
            'selectlfile': 'Избери последният файл',
            'viewlist': 'Изглед списък',
            'viewicons': 'Изглед икони',
            'places': 'Места',
            'calc': 'Изчисли',
            'path': 'Път',
            'aliasfor': 'Връзка към',
            'locked': 'Заключен',
            'dim': 'Размери',
            'files': 'Файлове',
            'folders': 'Папки',
            'items': 'Елементи',
            'yes': 'да',
            'no': 'не',
            'link': 'Връзка',
            'searcresult': 'Резултати от търсенето',
            'selected': 'Избрани елементи',
            'about': 'За',
            'shortcuts': 'преки пътища',
            'help': 'Помощ',
            'webfm': 'Файлов менаджер за web',
            'ver': 'Версия',
            'protocolver': 'версия на протокола',
            'homepage': 'Начало',
            'docs': 'Документация',
            'github': 'Разклонение в Github',
            'twitter': 'Последвайте ни в Twitter',
            'facebook': 'Присъединете се към нас във Facebook',
            'team': 'Екип',
            'chiefdev': 'Главен разработчик',
            'developer': 'разработчик',
            'contributor': 'сътрудник',
            'maintainer': 'поддръжка',
            'translator': 'преводач',
            'icons': 'Икони',
            'dontforget': 'и не забравяйте да си вземете кърпата',
            'shortcutsof': 'Преките пътища са изключени',
            'dropFiles': 'Пуснете файловете тук',
            'or': 'или',
            'selectForUpload': 'Изберете файлове за качване',
            'moveFiles': 'Премести файлове',
            'copyFiles': 'Копирай файлове',
            'rmFromPlaces': 'Премахни от Места',
            'untitled folder': 'Неозаглавена папка',
            'untitled file.txt': 'неозаглавен_файл.txt',
            'aspectRatio': 'Отношение',
            'scale': 'Мащаб',
            'width': 'Ширина',
            'height': 'Височина',
            'mode': 'Режим',
            'resize': 'Преоразмери',
            'crop': 'Отрежи',


            /********************************** mimetypes **********************************/
            'kindUnknown': 'Непознат',
            'kindFolder': 'Папка',
            'kindAlias': 'Връзка',
            'kindAliasBroken': 'Счупена връзка',
            // applications
            'kindApp': 'Приложение',
            'kindPostscript': 'Postscript документ',
            'kindMsOffice': 'Microsoft Office документ',
            'kindMsWord': 'Microsoft Word документ',
            'kindMsExcel': 'Microsoft Excel документ',
            'kindMsPP': 'Microsoft Powerpoint презентация',
            'kindOO': 'Open Office документ',
            'kindAppFlash': 'Flash приложение',
            'kindPDF': 'PDF документ',
            'kindTorrent': 'Bittorrent файл',
            'kind7z': '7z архив',
            'kindTAR': 'TAR архив',
            'kindGZIP': 'GZIP архив',
            'kindBZIP': 'BZIP архив',
            'kindZIP': 'ZIP архив',
            'kindRAR': 'RAR архив',
            'kindJAR': 'Java JAR файл',
            'kindTTF': 'True Type шрифт',
            'kindOTF': 'Open Type шрифт',
            'kindRPM': 'RPM пакет',
            // texts
            'kindText': 'Текстов документ',
            'kindTextPlain': 'Чист текст',
            'kindPHP': 'PHP изходен код',
            'kindCSS': 'CSS таблица със стилове',
            'kindHTML': 'HTML документ',
            'kindJS': 'Javascript изходен код',
            'kindRTF': 'RTF текстови файл',
            'kindC': 'C изходен код',
            'kindCHeader': 'C header изходен код',
            'kindCPP': 'C++ изходен код',
            'kindCPPHeader': 'C++ header изходен код',
            'kindShell': 'Unix shell script',
            'kindPython': 'Python изходен код',
            'kindJava': 'Java изходен код',
            'kindRuby': 'Ruby изходен код',
            'kindPerl': 'Perl изходен код',
            'kindSQL': 'SQL изходен код',
            'kindXML': 'XML документ',
            'kindAWK': 'AWK изходен код',
            'kindCSV': 'CSV стойности разделени със запетая',
            'kindDOCBOOK': 'Docbook XML документ',
            // images
            'kindImage': 'Изображение',
            'kindBMP': 'BMP изображение',
            'kindJPEG': 'JPEG изображение',
            'kindGIF': 'GIF изображение',
            'kindPNG': 'PNG изображение',
            'kindTIFF': 'TIFF изображение',
            'kindTGA': 'TGA изображение',
            'kindPSD': 'Adobe Photoshop изображение',
            'kindXBITMAP': 'X bitmap изображение',
            'kindPXM': 'Pixelmator изображение',
            // media
            'kindAudio': 'Аудио медия',
            'kindAudioMPEG': 'MPEG звук',
            'kindAudioMPEG4': 'MPEG-4 звук',
            'kindAudioMIDI': 'MIDI звук',
            'kindAudioOGG': 'Ogg Vorbis звук',
            'kindAudioWAV': 'WAV звук',
            'AudioPlaylist': 'MP3 списък за изпълнение',
            'kindVideo': 'Видео медия',
            'kindVideoDV': 'DV филм',
            'kindVideoMPEG': 'MPEG филм',
            'kindVideoMPEG4': 'MPEG-4 филм',
            'kindVideoAVI': 'AVI филм',
            'kindVideoMOV': 'Quick Time филм',
            'kindVideoWM': 'Windows Media филм',
            'kindVideoFlash': 'Flash филм',
            'kindVideoMKV': 'Matroska филм',
            'kindVideoOGG': 'Ogg филм'
        }
    };
}
﻿/**
 * Czech translation
 * @author Jay Gridley <gridley.jay@hotmail.com>
 * @version 2012-03-23
 */
if (elFinder && elFinder.prototype && typeof(elFinder.prototype.i18) == 'object') {
    elFinder.prototype.i18.cs = {
        translator: 'Jay Gridley &lt;gridley.jay@hotmail.com&gt;',
        language: 'čeština',
        direction: 'ltr',
        dateFormat: 'd. m. Y H:i',
        fancyDateFormat: '$1 H:i',
        messages: {

            /********************************** errors **********************************/
            'error': 'Chyba',
            'errUnknown': 'Neznámá chyba.',
            'errUnknownCmd': 'Neznámý příkaz.',
            'errJqui': 'Nedostačující konfigurace jQuery UI. Musí být zahrnuty komponenty Selectable, Draggable a Droppable.',
            'errNode': 'elFinder vyžaduje vytvořený DOM Element.',
            'errURL': 'Chybná konfigurace elFinderu! Není nastavena hodnota URL.',
            'errAccess': 'Přístup zamítnut.',
            'errConnect': 'Nepodařilo se připojit k backendu (konektoru).',
            'errAbort': 'Připojení zrušeno.',
            'errTimeout': 'Vypšel limit pro připojení.',
            'errNotFound': 'Backend nenalezen.',
            'errResponse': 'Nesprávná odpověď backendu.',
            'errConf': 'Nepsrávná konfigurace backendu.',
            'errJSON': 'PHP modul JSON není nainstalován.',
            'errNoVolumes': 'Není dostupný čitelný oddíl.',
            'errCmdParams': 'Nesprávné parametry příkazu "$1".',
            'errDataNotJSON': 'Data nejsou ve formátu JSON.',
            'errDataEmpty': 'Data jsou prázdná.',
            'errCmdReq': 'Dotaz backendu vyžaduje název příkazu.',
            'errOpen': 'Chyba při otevírání "$1".',
            'errNotFolder': 'Objekt není složka.',
            'errNotFile': 'Objekt není soubor.',
            'errRead': 'Chyba při čtení "$1".',
            'errWrite': 'Chyba při zápisu do "$1".',
            'errPerm': 'Přístup odepřen.',
            'errLocked': '"$1" je uzamčený a nemůže být přejmenován, přesunut nebo smazán.',
            'errExists': 'Soubor s názvem "$1" již existuje.',
            'errInvName': 'Nesprávný název souboru.',
            'errFolderNotFound': 'Složka nenalezena.',
            'errFileNotFound': 'Soubor nenalezen.',
            'errTrgFolderNotFound': 'Cílová složka "$1" nenalezena.',
            'errPopup': 'Prohlížeč zabránil otevření vyskakovacího okna. K otevření souboru, povolte vyskakovací okno v prohlížeči.',
            'errMkdir': 'Nepodařilo se vytvořit složku "$1".',
            'errMkfile': 'Nepodařilo se vytvořit soubor "$1".',
            'errRename': 'Nepodařilo se přejmenovat "$1".',
            'errCopyFrom': 'Kopírování souborů z oddílu "$1" není povoleno.',
            'errCopyTo': 'Kopírování souborů do oddílu "$1" není povoleno.',
            'errUploadCommon': 'Chyba nahrávání.',
            'errUpload': 'Nepodařilo se nahrát "$1".',
            'errUploadNoFiles': 'Nejsou vybrány žádné soubory k nahrání.',
            'errMaxSize': 'Překročena maximální povolená velikost dat.',
            'errFileMaxSize': 'Překročena maximální povolená velikost souboru.',
            'errUploadMime': 'Nepovolený typ souboru.',
            'errUploadTransfer': '"$1" chyba přenosu.',
            'errSave': '"$1" nelze uložit.',
            'errCopy': '"$1" nelze zkopírovat.',
            'errMove': '"$1" nelze přemístit.',
            'errCopyInItself': '"$1" nelze zkopírovat do sebe sama.',
            'errRm': '"$1" nelze odstranit.',
            'errExtract': 'Nelze extrahovat soubory z "$1".',
            'errArchive': 'Nelze vytvořit archív.',
            'errArcType': 'Nepodporovaný typ archívu.',
            'errNoArchive': 'Soubor není archív nebo má nepodporovaný formát.',
            'errCmdNoSupport': 'Backend tento příkaz nepodporuje.',
            'errReplByChild': 'Složka "$1" nemůže být nahrazena souborem, který sama obsahuje.',
            'errArcSymlinks': 'Z bezpečnostních důvodů je zakázáno rozbalit archívy obsahující symlinky.',
            'errArcMaxSize': 'Soubory archívu překračují maximální povolenou velikost.',
            'errResize': 'Nepodařilo se změnit velikost obrázku "$1".',
            'errUsupportType': 'Nepodporovaný typ souboru.',

            /******************************* commands names ********************************/
            'cmdarchive': 'Vytvořit archív',
            'cmdback': 'Zpět',
            'cmdcopy': 'Kopírovat',
            'cmdcut': 'Vyjmout',
            'cmddownload': 'Stáhnout',
            'cmdduplicate': 'Duplikovat',
            'cmdedit': 'Upravit soubor',
            'cmdextract': 'Rozbalit archív',
            'cmdforward': 'Vpřed',
            'cmdgetfile': 'Vybrat soubory',
            'cmdhelp': 'O softwaru',
            'cmdhome': 'Domů',
            'cmdinfo': 'Zobrazit informace',
            'cmdmkdir': 'Nová složka',
            'cmdmkfile': 'Nový textový soubor',
            'cmdopen': 'Otevřít',
            'cmdpaste': 'Vložit',
            'cmdquicklook': 'Náhled',
            'cmdreload': 'Obnovit',
            'cmdrename': 'Přejmenovat',
            'cmdrm': 'Smazat',
            'cmdsearch': 'Najít soubory',
            'cmdup': 'Přejít do nadřazené složky',
            'cmdupload': 'Nahrát soubor(y)',
            'cmdview': 'Zobrazit',
            'cmdresize': 'Změnit velikost',
            'cmdsort': 'Seřadit',

            /*********************************** buttons ***********************************/
            'btnClose': 'Zavřít',
            'btnSave': 'Uložit',
            'btnRm': 'Odstranit',
            'btnApply': 'Použít',
            'btnCancel': 'Zrušit',
            'btnNo': 'Ne',
            'btnYes': 'Ano',

            /******************************** notifications ********************************/
            'ntfopen': 'Otevírání složky',
            'ntffile': 'Otevírání souboru',
            'ntfreload': 'Obnovování obsahu složky',
            'ntfmkdir': 'Vytváření složky',
            'ntfmkfile': 'Vytváření souborů',
            'ntfrm': 'Mazání souborů',
            'ntfcopy': 'Kopírování souborů',
            'ntfmove': 'Přesunování souborů',
            'ntfprepare': 'Příprava ke kopírování souborů',
            'ntfrename': 'Přejmenovávání souborů',
            'ntfupload': 'Nahrávání souborů',
            'ntfdownload': 'Stahování souborů',
            'ntfsave': 'Ukládání souborů',
            'ntfarchive': 'Vytváření archívu',
            'ntfextract': 'Rozbalování souborů z archívu',
            'ntfsearch': 'Vyhledávání souborů',
            'ntfsmth': 'Čekejte prosím...',
            'ntfloadimg': 'Načítání obrázků',

            /************************************ dates **********************************/
            'dateUnknown': 'neznámý',
            'Today': 'Dnes',
            'Yesterday': 'Včera',
            'Jan': 'Led',
            'Feb': 'Úno',
            'Mar': 'Bře',
            'Apr': 'Dub',
            'May': 'Kvě',
            'Jun': 'Čer',
            'Jul': 'Čec',
            'Aug': 'Srp',
            'Sep': 'Zář',
            'Oct': 'Říj',
            'Nov': 'Lis',
            'Dec': 'Pro',
            'January': 'Leden',
            'February': 'Únor',
            'March': 'Březen',
            'April': 'Duben',
            'May': 'Květen',
            'June': 'Červen',
            'July': 'Červenec',
            'August': 'Srpen',
            'September': 'Září',
            'October': 'Říjen',
            'November': 'Listopad',
            'December': 'Prosinec',
            'Sunday': 'Neděle',
            'Monday': 'Pondělí',
            'Tuesday': 'Úterý',
            'Wednesday': 'Středa',
            'Thursday': 'Čtvrtek',
            'Friday': 'Pátek',
            'Saturday': 'Sobota',
            'Sun': 'Ne',
            'Mon': 'Po',
            'Tue': 'Út',
            'Wed': 'St',
            'Thu': 'Čt',
            'Fri': 'Pá',
            'Sat': 'So',
            /******************************** sort variants ********************************/
            'sortnameDirsFirst': 'dle jména (složky přednostně)',
            'sortkindDirsFirst': 'dle typu (složky přednostně)',
            'sortsizeDirsFirst': 'dle veliksoti (složky přednostně)',
            'sortdateDirsFirst': 'dle data (složky přednostně',
            'sortname': 'dle jména',
            'sortkind': 'dle typu',
            'sortsize': 'dle velikosti',
            'sortdate': 'dle data',

            /********************************** messages **********************************/
            'confirmReq': 'Požadováno potvržení',
            'confirmRm': 'Opravdu chcete odstranit tyto soubory?<br/>Operace nelze vrátit!',
            'confirmRepl': 'Nahradit staré soubory novými?',
            'apllyAll': 'Všem',
            'name': 'Název',
            'size': 'Velikost',
            'perms': 'Práva',
            'modify': 'Upravený',
            'kind': 'Typ',
            'read': 'čtení',
            'write': 'zápis',
            'noaccess': 'přístup nepovolen',
            'and': 'a',
            'unknown': 'neznámý',
            'selectall': 'Vybrat všechny soubory',
            'selectfiles': 'Vybrat soubor(y)',
            'selectffile': 'Vybrat první soubor',
            'selectlfile': 'Vybrat poslední soubor',
            'viewlist': 'Seznam',
            'viewicons': 'Ikony',
            'places': 'Místa',
            'calc': 'Vypočítat',
            'path': 'Cesta',
            'aliasfor': 'Zástupce pro',
            'locked': 'Uzamčený',
            'dim': 'Rozměry',
            'files': 'Soubory',
            'folders': 'Složky',
            'items': 'Položky',
            'yes': 'ano',
            'no': 'ne',
            'link': 'Odkaz',
            'searcresult': 'Výsledky hledání',
            'selected': 'vybrané položky',
            'about': 'O softwaru',
            'shortcuts': 'Zástupci',
            'help': 'Nápověda',
            'webfm': 'Webový správce souborů',
            'ver': 'Verze',
            'protocolver': 'verze protokolu',
            'homepage': 'Domovská stránka projektu',
            'docs': 'Dokumentace',
            'github': 'Fork us on Github',
            'twitter': 'Follow us on Twitter',
            'facebook': 'Join us on Facebook',
            'team': 'Tým',
            'chiefdev': 'séf vývojářů',
            'developer': 'vývojár',
            'contributor': 'spolupracovník',
            'maintainer': 'údržba',
            'translator': 'překlad',
            'icons': 'Ikony',
            'dontforget': 'a nezapomeňte si vzít plavky',
            'shortcutsof': 'Zástupci nejsou povoleni',
            'dropFiles': 'Přetáhněte soubory sem',
            'or': 'nebo',
            'selectForUpload': 'Vyberte soubory',
            'moveFiles': 'Přesunout sobory',
            'copyFiles': 'Zkupírovat soubory',
            'rmFromPlaces': 'Odstranit z míst',
            'untitled folder': 'bez názvu',
            'untitled file.txt': 'nepojmenovaný soubor.txt',
            'aspectRatio': 'Poměr stran',
            'scale': 'Měřítko',
            'width': 'Šířka',
            'height': 'Výška',
            'mode': 'Mód',
            'resize': 'Změnit vel.',
            'crop': 'Ožezat',
            'rotate': 'Otočit',
            'rotate-cw': 'Otočit o +90 stupňů',
            'rotate-ccw': 'Otočit o -90 stupňů',
            'degree': ' stupňů',

            /********************************** mimetypes **********************************/
            'kindUnknown': 'Neznámý',
            'kindFolder': 'Složka',
            'kindAlias': 'Odkaz',
            'kindAliasBroken': 'Neplatný odkaz',
            // applications
            'kindApp': 'Aplikace',
            'kindPostscript': 'Dokument Postscriptu',
            'kindMsOffice': 'Dokument Microsoft Office',
            'kindMsWord': 'Dokument Microsoft Word',
            'kindMsExcel': 'Dokument Microsoft Excel',
            'kindMsPP': 'Prezentace Microsoft Powerpoint',
            'kindOO': 'Otevřít dokument Office',
            'kindAppFlash': 'Flash aplikace',
            'kindPDF': 'PDF',
            'kindTorrent': 'Soubor BitTorrent',
            'kind7z': 'Archív 7z',
            'kindTAR': 'Archív TAR',
            'kindGZIP': 'Archív GZIP',
            'kindBZIP': 'Archív BZIP',
            'kindZIP': 'Archív ZIP',
            'kindRAR': 'Archív RAR',
            'kindJAR': 'Soubor Java JAR',
            'kindTTF': 'True Type font',
            'kindOTF': 'Open Type font',
            'kindRPM': 'RPM balíček',
            // texts
            'kindText': 'Textový dokument',
            'kindTextPlain': 'Čistý text',
            'kindPHP': 'PHP zdrojový kód',
            'kindCSS': 'Kaskádové styly',
            'kindHTML': 'HTML dokument',
            'kindJS': 'Javascript zdrojový kód',
            'kindRTF': 'Rich Text Format',
            'kindC': 'C zdrojový kód',
            'kindCHeader': 'C hlavička',
            'kindCPP': 'C++ zdrojový kód',
            'kindCPPHeader': 'C++ hlavička',
            'kindShell': 'Unix shell skript',
            'kindPython': 'Python zdrojový kód',
            'kindJava': 'Java zdrojový kód',
            'kindRuby': 'Ruby zdrojový kód',
            'kindPerl': 'Perl skript',
            'kindSQL': 'SQL zdrojový kód',
            'kindXML': 'Dokument XML',
            'kindAWK': 'AWK zdrojový kód',
            'kindCSV': 'CSV',
            'kindDOCBOOK': 'Docbook XML dokument',
            // images
            'kindImage': 'Obrázek',
            'kindBMP': 'Obrázek BMP',
            'kindJPEG': 'Obrázek JPEG',
            'kindGIF': 'Obrázek GIF',
            'kindPNG': 'Obrázek PNG',
            'kindTIFF': 'Obrázek TIFF',
            'kindTGA': 'Obrázek TGA',
            'kindPSD': 'Obrázek Adobe Photoshop',
            'kindXBITMAP': 'Obrázek X bitmapa',
            'kindPXM': 'Obrázek Pixelmator',
            // media
            'kindAudio': 'Audio sobory',
            'kindAudioMPEG': 'MPEG audio',
            'kindAudioMPEG4': 'MPEG-4 audio',
            'kindAudioMIDI': 'MIDI audio',
            'kindAudioOGG': 'Ogg Vorbis audio',
            'kindAudioWAV': 'WAV audio',
            'AudioPlaylist': 'MP3 playlist',
            'kindVideo': 'Video sobory',
            'kindVideoDV': 'DV video',
            'kindVideoMPEG': 'MPEG video',
            'kindVideoMPEG4': 'MPEG-4 video',
            'kindVideoAVI': 'AVI video',
            'kindVideoMOV': 'Quick Time video',
            'kindVideoWM': 'Windows Media video',
            'kindVideoFlash': 'Flash video',
            'kindVideoMKV': 'Matroska video',
            'kindVideoOGG': 'Ogg video'
        }
    };
}
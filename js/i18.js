 var lang_pack = {
     'en-US':{
         'menu':{'file':'File', 'file-open':'Open', 'file-save-as':'Save As',
             'img':'Export Image', 'img-png':'png', 'img-jpeg':'jpeg',
             'zoomin':'Zoom In', 'zoomout':'Zoom Out', 'zoomrst':'Zoom Reset'
         }
     },
     'zh-CN':{
         'menu':{'file':'文件', 'file-open':'打开', 'file-save-as':'另存为',
             'img':'导出图片',
             'zoomin':'放大', 'zoomout':'缩小', 'zoomrst':'默认缩放'
         }
     }
 };
 function menu_text(key)
 {
     var lang = window.navigator.language;
     if (!(lang in lang_pack))
         lang = 'en-US';
     if (key in lang_pack[lang]['menu'])
         return lang_pack[lang]['menu'][key];
     return lang_pack['en-US']['menu'][key]
 }

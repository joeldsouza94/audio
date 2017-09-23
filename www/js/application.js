var Application = {
   initApplication: function() {
      var pagebeforechangeCall = 1;
      console.log("pagebeforechangeinit " + pagebeforechangeCall);
      $(document).on("pageinit", "#player-page", function () {
         console.log("player-page init");
         pagebeforechangeCall = 2;
         console.log("pagebeforechangeCall " + pagebeforechangeCall);
      });
      $(document).on(
         'pageinit',
         '#files-list-page',
         function()
         {  
            console.log("files-list init");
            pagebeforechangeCall = 2;
            console.log("pagebeforechangeCall " + pagebeforechangeCall);
            Application.initFilesListPage();
         }
      );
      $(document).on(
         'pageinit',
         '#aurelio-page',
         function()
         {
            console.log("aurelio.html init");
            pagebeforechangeCall = 2;
            console.log("pagebeforechangeCall " + pagebeforechangeCall);
            Application.openLinksInApp();
         }
      );

      
      //$(document).on("pageinit", "#player-page", function () {
      $(document).on(
         'pagebeforechange',
         function(event, properties)
         {
            if(pagebeforechangeCall == 1) {
               console.log("absUrl :");
               console.log(properties.absUrl);
               if (properties.absUrl === $.mobile.path.makeUrlAbsolute('player.html'))
               {
                              var qwe = $('#media-name').length;
                              console.log("player");
                              console.log(qwe);
                              console.log("123");
                              console.log(properties.options.data);
                              console.log(properties.options.data.file);
                              var passedFile = JSON.parse(properties.options.data.file);
      $(document).on("pageinit", "#player-page", function () {
         console.log("player-page pagebeforechange init");
                              Application.initPlayerPage(passedFile);
                           });
               }
            }
            else {
               pagebeforechangeCall = 1;
               console.log("pagebeforechangeinit " + pagebeforechangeCall); 
            }
         }
      );
      //});

   },

   initFilesListPage: function() {
      $('#update-button').click(
         function()
         {
            $('#waiting-popup').popup('open');
            setTimeout(function(){
               Application.updateMediaList();
            }, 150);
         }
      );
      $(document).on('endupdate', function(){
         Application.createFilesList('files-list', AppFile.getAppFiles());
         $('#waiting-popup').popup('close');
      });
      Application.createFilesList('files-list', AppFile.getAppFiles());
   },
   initPlayerPage: function(file) {
      Player.stop();
      var qwe = $('#media-name').length;
      console.log("player");
      console.log(qwe);
      $('#media-name').text(file.name);
      console.log(file.name);
      console.log(file.fullPath);
      $('#media-path').text(file.fullPath);
      $('#player-play').click(function() {
         Player.playPause(file.fullPath);
      });
      $('#player-stop').click(Player.stop);
      $('#time-slider').on('slidestop', function(event) {
         Player.seekPosition(event.target.value);
      });
   },
   updateIcons: function()
   {
      if ($(window).width() > 480)
      {
         $('a[data-icon], button[data-icon]').each(function() {
            $(this).removeAttr('data-iconpos');
         });
      }
      else
      {
         $('a[data-icon], button[data-icon]').each(function() {
            $(this).attr('data-iconpos', 'notext');
         });
      }
   },
   openLinksInApp: function()
   {
      var avc = $('#aurelio-page').length;
         console.log("avc");
      console.log(avc);
      $("a[target=\"_blank\"]").on('click', function(event) {
         event.preventDefault();
         window.open($(this).attr('href'), '_target');
      });
   },
   updateMediaList: function() {
      console.log("externalRootDirectory/Download/: ");
            var systemUrl = cordova.file.externalRootDirectory;// + "Download/";
            console.log(systemUrl);
      window.resolveLocalFileSystemURL(
         systemUrl,
         function(fileSystem){
            //var root = fileSystem.root;
            console.log("fileSystem:");
            console.log(fileSystem);
            AppFile.deleteFiles();
            Application.collectMedia(fileSystem, true);
         },
         function(error){
            console.log('File System Error: ' + error.code);
         }
      );
   },
   collectMedia: function(path, recursive, level) {
      if (level === undefined)
         level = 0;
      var directoryEntry = path;//new DirectoryEntry('', path);
            console.log("directoryEntry:");
            console.log(directoryEntry);
      if(!directoryEntry.isDirectory) {
         console.log('The provided path is not a directory');
         return;
      }
      var directoryReader = directoryEntry.createReader();
      directoryReader.readEntries(
         function (entries) {
            var appFile;
            var extension;
            for (var i = 0; i < entries.length; i++) {
            console.log("entries[i]:");
            console.log(entries[i]);
               if (entries[i].name === '.')
                  continue;
 
               extension = entries[i].name.substr(entries[i].name.lastIndexOf('.'));
               if (entries[i].isDirectory === true && recursive === true)
                  Application.collectMedia(entries[i], recursive, level + 1);
               else if (entries[i].isFile === true && $.inArray(extension, AppFile.EXTENSIONS) >= 0)
               {
                  appFile = new AppFile(entries[i].name, entries[i].toURL());
                  appFile.addFile();
                  console.log('File saved: ' + entries[i].fullPath);
               }
            }
         },
         function(error) {
            console.log('Unable to read the directory. Error: ' + error.code);
         }
      );
 
      if (level === 0)
         $(document).trigger('endupdate');
      console.log('Current path analized is: ' + path);
   },
   createFilesList: function(idElement, files)
   {
      $('#' + idElement).empty();
 
      if (files == null || files.length == 0)
      {
         $('#' + idElement).append('<p>No files to show. Would you consider a files update (top right button)?</p>');
         return;
      }
 
      function getPlayHandler(file) {
         //console.log("34");
         //console.log(file);
         //console.log(JSON.stringify(file));
         return function playHandler() {
            $(':mobile-pagecontainer').pagecontainer(
               'change',
               'player.html',
               {
                  data: {
                     file: JSON.stringify(file)
                  }
               }
            );
         };
      }
 
      function getDeleteHandler(file) {
         return function deleteHandler() {
            var oldLenght = AppFile.getAppFiles().length;
            var $parentUl = $(this).closest('ul');
 
            file = new AppFile('', file.fullPath);
            file.deleteFile();
            if (oldLenght === AppFile.getAppFiles().length + 1)
            {
               $(this).closest('li').remove();
               $parentUl.listview('refresh');
            }
            else
            {
               console.log('Media not deleted. Something gone wrong.');
               navigator.notification.alert(
                  'Media not deleted. Something gone wrong so please try again.',
                  function(){},
                  'Error'
               );
            }
         };
      }
      
      /*
      $('#files-list').pagecontainer({
        change: function( event, ui ) {}
      });
      */
      var $listElement, $linkElement;
      files.sort(AppFile.compareIgnoreCase);
      for(var i = 0; i < files.length; i++)
      {
         $listElement = $('<li>');
         $linkElement = $('<a>');
         $linkElement
         .attr('href', '#')
         .text(files[i].name)
         .click(getPlayHandler(files[i]));
 
         // Append the link to the <li> element
         $listElement.append($linkElement);
 
         $linkElement = $('<a>');
         $linkElement
         .attr('href', '#')
         .text('Delete')
         .click(getDeleteHandler(files[i]));
 
         // Append the link to the <li> element
         $listElement.append($linkElement);
 
         // Append the <li> element to the <ul> element
         $('#' + idElement).append($listElement);
      }
      $('#' + idElement).listview('refresh');
   }
};

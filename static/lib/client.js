    (function () {
    "use strict";

    $(document).ready(function () {
        templates.setGlobal('ignorePluginEnabled', true);
    });

    $(window).on('action:topic.loaded', function (event, data) {
        addTopicHandlers();
    });
    
    function replaceParams(string, replacements) {
        return string.replace(/\{(\d+)\}/g, function() {
            return replacements[arguments[1]];
        });
    }
    
    $(window).on('action:ajaxify.contentLoaded', function (event, data) {
        /* We are in the profile */
        if (data.tpl=='account/profile') {
            //If the user is visualizing its own profile then the link should have another text and the link reference should point to the list of ignored users.
            if(parseInt(ajaxify.data.yourid,10)===parseInt(ajaxify.data.theirid,10)){
                require(['translator'], function(translator) {
                     translator.translate('[[ignored:ignored_list]]', function(translated) {
                        $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignored-list fa fa-eye-slash" href="/'+data.url+'/ignored" >'+translated+'<a/></li>');
                    });
                }); 
                
            }else{
                //If not, then he/she is visualizing another user profile, so the link must show the option to igonore the user.
                //To show the initial value of the text in the link, we should evaluate if the user is already ignored or not.
                var translationText = ajaxify.data.isIgnored ? '[[ignored:unignore_user]]' : '[[ignored:ignore_user]]';
                var icon = ajaxify.data.isIgnored ? 'fa fa-fw fa-eye' : 'fa fa-fw fa-eye-slash';

                var chatTranslationText = ajaxify.data.isIgnoredForChat ? '[[ignored:chat.unignore_user]]' : '[[ignored:chat.ignore_user]]';
                var chatIcon = ajaxify.data.isIgnoredForChat ? 'fa fa-fw fa-volume-up' : 'fa fa-fw fa-volume-off';

                require(['translator'], function(translator) {
                     translator.translate(translationText, function(translated) {
                        $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user '+icon+'" href="#" >'+translated+'<a/></li>');
                    });

                     translator.translate(chatTranslationText, function(translated) {
                        $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user-chat '+chatIcon+'" href="#" >'+translated+'<a/></li>');
                    });
                }); 
                
            }
            
            addProfileHandlers();
        }else if(data.tpl=='topic'){
            //We are in the topic page.
            var icon, className, postClass = null;
            //we have to check each topic 
            ajaxify.data.posts.forEach(function (post){
                postClass = null;
                if(post.uid!=app.user.uid){    
                    if(post.ignored){
                        icon = 'fa-eye';
                        className = 'unignore';
                        postClass = 'ignored';
                    }else{
                        icon = 'fa-eye-slash';
                        className = 'ignore';
                    }
                    //We add the element on the page, in the place we want       
                    $('li[component="post"][data-pid="'+post.pid+'"]').find('a[itemprop="author"]').after('<a href="#" itemprop="ignorespot" data-uid="'+post.uid+'" class="fa '+icon+' '+className+'"></a>');
                    $('li[component="post"][data-pid="'+post.pid+'"] div.content').after('<div class="original-content hide" component="post/original-content" itemprop="text">'+post.originalContent+'</div>');
                    if(postClass!=null){
                        $('li[component="post"][data-pid="'+post.pid+'"]').addClass('ignored');
                    }
                } 
          });
        }else if(data.tpl=='account/ignored'){
            //Add ignored user list listeners.
            addIgnoredListHandlers();
        }
    });

    function addTopicHandlers() {
        $('.posts').on('click', 'a.ignore, a.unignore', function () {

            //Execute the (un)ignore function
            var autor = $(this).parent().find('a[itemprop="author"]');

            toggleIgnoreUser({
                id: autor.attr('data-uid'),
                name: autor.attr('data-username'),
                ignored: !$(this).hasClass('ignore')
            }, toggleIgnorePosts);

            return false;
        });
    }

    function addProfileHandlers() {
        $('.account').on('click', 'a.ignore-user, a.unignore-user', function () {     
            //Execute the (un)ignore action
            toggleIgnoreUser({
                id: ajaxify.data.uid,
                name: ajaxify.data.username,
                ignored: ajaxify.data.isIgnored
            }, toggleIgnoreProfile);

            return false;
        });

        $('.account').on('click', 'a.ignore-user-chat', function () {     
            //Execute the (un)ignore action for chat
            toggleIgnoreUserForChat({
                id: ajaxify.data.uid,
                name: ajaxify.data.username,
                ignored: ajaxify.data.isIgnoredForChat
            }, toggleIgnoreProfileForChat);

            return false;
        });
    }
    
    function addIgnoredListHandlers() {
        $('.users-container').on('click', 'button.unignore', function () {
            //Execute the (un)ignore action
            toggleIgnoreUser({
                id: $(this).parent().parent().attr('data-uid'),
                name: $(this).parent().find('a').html(),
                ignored: true
            }, toggleIgnoreList);

            return false;
        });
    }

    /**
     * Ignore or unignore the selected user
     */
    function toggleIgnoreUser(user, callback) {
        socket.emit(user.ignored ? 'modules.unignoreUser' : 'modules.ignoreUser', {
            ignoreduid: user.id
        }, function (err, res) {

            if (err) {
                return;
            }

            //Show the user a warning
            var translationString = user.ignored ? '[[ignored:unignoring_confirmation,'+user.name+']]' : '[[ignored:ignoring_confirmation,'+user.name+']]';
            
            require(['translator'], function(translator) {
                translator.translate(translationString, function(translated) {
                        app.alert({
                            message: translated,
                            type: 'success',
                            timeout: 5000
                        });
                    });
                }); 

            callback(user);
        });
    }

    /**
     * Ignore or unignore the selected user for chat
     */
    function toggleIgnoreUserForChat(user, callback) {
        socket.emit(user.ignored ? 'modules.unignoreUserForChat' : 'modules.ignoreUserForChat', {
            ignoreduid: user.id
        }, function (err, res) {

            if (err) {
                return;
            }

            //Show the user a warning
            var translationString = user.ignored ? '[[ignored:chat.unignoring_confirmation,'+user.name+']]' : '[[ignored:chat.ignoring_confirmation,'+user.name+']]';
            
            require(['translator'], function(translator) {
                translator.translate(translationString, function(translated) {
                        app.alert({
                            message: translated,
                            type: 'success',
                            timeout: 5000
                        });
                    });
                }); 

            callback(user);
        });
    }

    /**
     * It marks as ignored all the posts of a user.
     */
    function toggleIgnorePosts(user) {
        var iconsHasBeenChanged = false;
        $('li[component="post"][data-uid="' + user.id + '"]').each(function (i, post) {
            post = $(post);

            if (!user.ignored) {

                //Change the icon and the target class of events.
                if(!iconsHasBeenChanged){
                    $('a[itemprop="ignorespot"][data-uid="'+post.attr('data-uid')+'"]').removeClass('ignore').addClass('unignore').removeClass('fa-eye-slash').addClass('fa-eye');
                    iconsHasBeenChanged= true;
                }
                
                require(['translator'], function(translator) {
                    translator.translate('[[ignored:ignored_post]]', function(translated) {
                        post.find('.content').html(translated);
                        post.addClass('ignored');
                });
        });

            } else {
                //The original content is shown
                post.find('.content').html(post.find('.original-content').html());
                post.removeClass('ignored');
                if(!iconsHasBeenChanged){
                    $('a[itemprop="ignorespot"][data-uid="'+post.attr('data-uid')+'"]').removeClass('unignore').addClass('ignore').removeClass('fa-eye').addClass('fa-eye-slash');
                    iconsHasBeenChanged= true;
                }
            }
        });
    }

    /**
     * Mark the selected user profile as ignored
     */
    function toggleIgnoreProfile(user) {
        
        var textToTranslate = !ajaxify.data.isIgnored ? '[[ignored:unignore_user]]' : '[[ignored:ignore_user]]';
        
        require(['translator'], function(translator) {
        translator.translate(textToTranslate, function(translated) {
                $('a.ignore-user').text(translated);
                $('a.ignore-user').toggleClass('fa-eye-slash');
                $('a.ignore-user').toggleClass('fa-eye');
            });
        }); 
            
        ajaxify.data.isIgnored = !user.ignored;
        
    }

    /**
     * Mark the selected user profile as ignored for chat
     */
    function toggleIgnoreProfileForChat(user) {
        
        var textToTranslate = !ajaxify.data.isIgnoredForChat ? '[[ignored:chat.unignore_user]]' : '[[ignored:chat.ignore_user]]';
        
        require(['translator'], function(translator) {
        translator.translate(textToTranslate, function(translated) {
                $('a.ignore-user-chat').text(translated);
                $('a.ignore-user-chat').toggleClass('fa-volume-off');
                $('a.ignore-user-chat').toggleClass('fa-volume-up');
            });
        }); 
            
        ajaxify.data.isIgnoredForChat = !user.ignored;
        
    }
    
        /**
     * Mark the selected user profile as ignored
     */
    function toggleIgnoreList(user) {
        
        var textToTranslate = !ajaxify.data.isIgnored ? '[[ignored:unignore_user]]' : '[[ignored:ignore_user]]';
        
        require(['translator'], function(translator) {
        translator.translate(textToTranslate, function(translated) {
                $('li.users-box.registered-user[data-uid="'+user.id+'"]').remove();
                if($('li.users-box.registered-user').size()==0){
                    //We show the message of empty ignored list according to the tpl.
                    require(['translator'], function(translator) {
                        translator.translate('[[ignored:ignored_no_one]]', function(translated) {
                            $('#users-container').append('<div id="no-ignored-notice" class="alert alert-success">'+translated+'</div>');
                       });
                    }); 
                    
                }
            });
        }); 
            
        ajaxify.data.isIgnored = !user.ignored;
        
    }


}());

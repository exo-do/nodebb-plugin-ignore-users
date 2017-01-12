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
        if (!app.user.uid) {
            return;
        }
        
        /* We are in the profile */
        if (data.tpl=='account/profile') {
            extendMenuItems(data);
            addProfileHandlers();
        }else if(data.tpl=='topic'){
            if (!app.user.uid) {
                return;
            }

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
                    if(config['theme:id']!=='nodebb-theme-lavender'){
                        $('li[component="post"][data-pid="'+post.pid+'"] div.content').after('<div class="original-content hide" component="post/original-content" itemprop="text">'+post.originalContent+'</div>');
                    }else{
                        $('li[component="post"][data-pid="'+post.pid+'"] div.post-content').after('<div class="original-content hide" component="post/original-content" itemprop="text">'+post.originalContent+'</div>');
                    }
                    if(postClass!=null){
                        $('li[component="post"][data-pid="'+post.pid+'"]').addClass('ignored');
                    }
                }
          });
        }else if(data.tpl=='account/ignored'){
            extendMenuItems(data);
            //Add ignored user list listeners.
            addIgnoredListHandlers();
            if(config['theme:id']==='nodebb-theme-lavender'){
                $('.cover').hide();
            }
        }
    });

    function extendMenuItems(data){
                    //If the user is visualizing its own profile then the link should have another text and the link reference should point to the list of ignored users.
            if(config['theme:id']==='nodebb-theme-lavender'){$('.cover').hide();}
            if(parseInt(ajaxify.data.yourid,10)===parseInt(ajaxify.data.theirid,10)){
                require(['translator'], function(translator) {
                     translator.translate('[[ignored:ignored_list]]', function(translated) {
                        if(config['theme:id']!=='nodebb-theme-lavender'){
                            $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignored-list" href="/'+data.url+'/ignored" ><i class=" fa fa-eye-slash"></i> '+translated+'</a></li>');
                        }else{
                            $('.dropdown-menu.pull-right').append('<li><a class="ignored-list" href="/'+data.url+'/ignored" ><i class=" fa fa-eye-slash"></i> '+translated+'</a></li>');
                        }
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
                        if(config['theme:id']!=='nodebb-theme-lavender'){
                            $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user" href="#" ><i class="'+icon+'"></i> <span class="ignore-user-text">'+translated+'</span></a></li>');
                        }else{
                            $('.dropdown-menu.pull-right').append('<li><a class="ignore-user" href="#" ><i class="'+icon+'"></i> <span class="ignore-user-text">'+translated+'</span></a></li>');
                        }
                    });

                     translator.translate(chatTranslationText, function(translated) {
                         if(config['theme:id']!=='nodebb-theme-lavender'){
                            $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user-chat" href="#" ><i class="'+chatIcon+'"></i> <span class="ignore-user-chat-text">'+translated+'</span></a></li>');
                         }else{
                             $('.dropdown-menu.pull-right').append('<li><a class="ignore-user-chat" href="#" ><i class="'+chatIcon+'"></i> <span class="ignore-user-chat-text">'+translated+'</span></a></li>');
                         }
                    });
                });

            }
    }

    function addTopicHandlers() {
        $('.posts').on('click', 'a.ignore, a.unignore', function () {

            //Execute the (un)ignore function
            var autor = null;
            if(config['theme:id']!=='nodebb-theme-lavender'){
                autor = $(this).parent().find('a[itemprop="author"]');
            }else{
                autor = $(this).parent().parent();
            }

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
                ignored: true,
                targetid: ajaxify.data.uid
            }, toggleIgnoreList);

            return false;
        });

         $('.users-container').on('click', 'button.unignoreForChat', function () {
            //Execute the (un)ignore chat action
            toggleIgnoreUserForChat({
                id: $(this).parent().parent().attr('data-uid'),
                name: $(this).parent().find('a').html(),
                ignored: true,
                targetid: ajaxify.data.uid
            }, toggleIgnoreListForChat);

            return false;
        });
    }

    /**
     * Ignore or unignore the selected user
     */
    function toggleIgnoreUser(user, callback) {
        socket.emit(user.ignored ? 'modules.unignoreUser' : 'modules.ignoreUser', {
            ignoreduid: user.id,
            targetuid: user.targetid
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
            ignoreduid: user.id,
            targetuid: user.targetid
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
     * It marks as ignored all the posts of an user.
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
                        if(config['theme:id']!=='nodebb-theme-lavender'){
                            post.find('.content').html(translated);
                            post.addClass('ignored');
                        }else{
                            post.find('.post-content').html(translated);
                            post.addClass('ignored');
                        }
                });
        });

            } else {
                //The original content is shown
                if(config['theme:id']!=='nodebb-theme-lavender'){
                    post.find('.content').html(post.find('.original-content').html());
                }else{
                    post.find('.post-content').html(post.find('.original-content').html());
                }
                post.removeClass('ignored');
                //Trigger the image processing in the viewport.
                require(['forum/topic/posts'], function(posts) {
                    posts.unloadImages(post);
                    posts.loadImages();
                });
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

                $('span.ignore-user-text').html(translated);
                $('a.ignore-user > i').toggleClass('fa-eye-slash');
                $('a.ignore-user > i').toggleClass('fa-eye');
                $('.in,.open').removeClass('in open');
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

                $('span.ignore-user-chat-text').html(translated);
                $('a.ignore-user-chat > i').toggleClass('fa-volume-off');
                $('a.ignore-user-chat > i').toggleClass('fa-volume-up');
                $('.in,.open').removeClass('in open');
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
                $('li.users-box.registered-user.ignored-for-posts[data-uid="'+user.id+'"]').remove();
                if($('li.users-box.registered-user.ignored-for-posts').length==0){
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

    /**
     * Mark the selected user profile as ignored for chat
     */
    function toggleIgnoreListForChat(user) {

        var textToTranslate = !ajaxify.data.isIgnored ? '[[ignored:chat.unignore_user]]' : '[[ignored:chat.ignore_user]]';

        require(['translator'], function(translator) {
        translator.translate(textToTranslate, function(translated) {
                $('li.users-box.registered-user.ignoreForChat[data-uid="'+user.id+'"]').remove();
                if($('li.users-box.registered-user.ignoreForChat').length==0){
                    //We show the message of empty ignored list according to the tpl.
                    require(['translator'], function(translator) {
                        translator.translate('[[ignored:chat.ignored_no_one]]', function(translated) {
                            $('#users-container-for-chat').append('<div id="no-ignored-for-chat-notice" class="alert alert-success">'+translated+'</div>');
                       });
                    });
                }
            });
        });

        ajaxify.data.isIgnored = !user.ignored;

    }


}());

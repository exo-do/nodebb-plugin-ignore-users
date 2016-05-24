    (function () {
    "use strict";

    $(document).ready(function () {
        templates.setGlobal('ignorePluginEnabled', true);
    });

    $(window).on('action:topic.loaded', function (event, data) {
        //console.log(data);
        addTopicHandlers();
    });
    
    function replaceParams(string, replacements) {
        return string.replace(/\{(\d+)\}/g, function() {
            return replacements[arguments[1]];
        });
    }
    
    $(window).on('action:ajaxify.contentLoaded', function (event, data) {
        /* We are in the profile */
        console.log(data);
        console.log(ajaxify.data);
        if (data.tpl=='account/profile') {
            console.log("Datos: "+JSON.stringify(data));
            //If the user is visualizing its own profile then the link should have another text and the link reference should point to the list of ignored users.
            if(parseInt(ajaxify.data.yourid,10)===parseInt(ajaxify.data.theirid,10)){
                require(['translator'], function(translator) {
                     translator.translate('[[ignored:ignored_list]]', function(translated) {
                        console.log('A:', translated);
                        $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignored-list" href="/'+data.url+'/ignored" >'+translated+'<a/></li>');
                    });
                }); 
                
            }else{
                //If not, then he/she is visualizing another user profile, so the link must show the option to igonore the user.
                //To show the initial value of the text in the link, we should evaluate if the user is already ignored or not.
                var translationText = ajaxify.data.isIgnored ? '[[ignored:unignore_user]]' : '[[ignored:ignore_user]]';
                require(['translator'], function(translator) {
                     translator.translate(translationText, function(translated) {
                        console.log('B:', translated);
                        $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user" href="#" >'+translated+'<a/></li>');
                    });
                }); 
                
            }
            
            addProfileHandlers();
        }else if(data.tpl=='topic'){
            //We are in the topic page.
            var translationText,icon, className = null;
            console.log('Valor de ajaxify_:'+JSON.stringify(ajaxify.data));
            console.log('Valor de APP_:'+JSON.stringify(app));
            //we have to check each topic 
            ajaxify.data.posts.forEach(function (post){
                if(post.uid!=app.user.uid){    
                    if(post.ignored){
                        translationText= '[[ignored:unignore_user]]';
                        icon = 'fa-eye';
                        className = 'unignore';
                    }else{
                        translationText= '[[ignored:ignore_user]]';
                        icon = 'fa-eye-slash';
                        className = 'ignore';
                    }
                    //We add the element on the page, in the place we want
                    require(['translator'], function(translator) {
                            translator.translate(translationText, function(translated) {         
                            $('a[itemprop="author"][data-uid="'+post.uid+'"]').after('<a href="#" class="fa '+icon+' '+className+'"></a>');
                        });
                    });
                } 
          });
        }    
    });

    function addTopicHandlers() {
        $('.posts').on('click', 'a.ignore, a.unignore', function () {

            //Execute the (un)ignore function
            var autor = $(this).parent().find('a[itemprop="author"]');
            
            toggleIgnoreUser({
                id: autor.attr('data-uid'),
                name: autor.attr('data-username'),
                ignored: $(this).hasClass( "ignore" )
            }, toggleIgnorePosts);

            return false;
        });
    }

    function addProfileHandlers() {
        //$('a').on('click','.ignore-user .unignore-user', function () {
        $('.account').on('click', 'a.ignore-user, a.unignore-user', function () {
                   
            //Execute the (un)ignore action
            toggleIgnoreUser({
                id: ajaxify.data.uid,
                name: ajaxify.data.username,
                ignored: ajaxify.data.isIgnored
            }, toggleIgnoreProfile);

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
     * It marks as ignored all the posts of a user.
     */
    function toggleIgnorePosts(user) {
        $('li[component="post"][data-uid="' + user.id + '"]').each(function (i, post) {
            post = $(post);

            if (user.ignored) {

                //Sve the original content
                var content = post.find('.post-content');
                //var originalContent = content.html();

                //Setting the post as hidden
                post.removeClass('ignored');

                content.html('This post is hidden because <b>' + user.name + '</b> is in your list of ignored users.');

                //Adding the original content next to the hidden one to be able to recover it.
                post.find('.original-content').html(originalContent);

                //                //Ignore-unignore buttons
                //                post.find('a.ignore').hide();
                //                post.find('a.unignore').show();
            } else {
                //The post is shown again
                post.removeClass('ignored');
                
                post.removeClass('fa-eye-slash');

                //The original content is shown
                post.find('.post-content').html(post.find('.original-content').html());

                //                //Ignore-unignore buttons
                //                post.find('a.ignore').show();
                //                post.find('a.unignore').hide();
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
            });
        }); 
            
        ajaxify.data.isIgnored = !user.ignored;
        
    }


}());

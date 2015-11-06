    (function () {
    "use strict";

    $(document).ready(function () {
        templates.setGlobal('ignorePluginEnabled', true);
    });

    $(window).on('action:topic.loaded', function (event, data) {
        //console.log(data);
        addTopicHandlers();
    });
    
    $(window).on('action:ajaxify.contentLoaded', function (event, data) {
        /* We are in the profile */
        //console.log(data);
        if ($('.account-username-box').length) {
            addProfileHandlers();
        }
    });

    function addTopicHandlers() {
        $('.posts').on('click', 'a.ignore, a.unignore', function () {

            //Execute the (un)ignore function
            var post = $(this).parents('.post-row');
            toggleIgnoreUser({
                id: post.data('uid'),
                name: post.data('username'),
                ignored: post.is('.ignored')
            }, toggleIgnorePosts);

            //Close the dropdown
            _clearMenus();

            return false;
        });
    }

    function addProfileHandlers() {
        $('.account').on('click', 'a.ignore, a.unignore', function () {

            //Execute the (un)ignore action
            var user = $(this).parents('.account');
            toggleIgnoreUser({
                id: user.data('uid'),
                name: user.data('username'),
                ignored: user.is('.ignored')
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

            user.ignored = !user.ignored;

            //Show the user a warning
            if (user.ignored) {
                app.alert({
                    message: 'You are now ignoring <b>' + user.name + '</b>',
                    type: 'danger',
                    timeout: 5000
                });
            } else {
                app.alert({
                    message: 'You are no longer ignoring <b>' + user.name + '</b>',
                    type: 'success',
                    timeout: 5000
                });
            }

            callback(user);
        });
    }

    /**
     * It marks as ignored all the posts of a user.
     */
    function toggleIgnorePosts(user) {
        $('.post-row[data-uid=' + user.id + ']').each(function (i, post) {
            post = $(post);

            if (user.ignored) {

                //Sve the original content
                var content = post.find('.post-content');
                var originalContent = content.html();

                //Setting the post as hidden
                post.addClass('ignored');
                content.html('This post is hidden because <b>' + user.name + '</b> is in your list of ignored users.');

                //Adding the original content next to the hidden one to be able to recover it.
                post.find('.original-content').html(originalContent);

                //                //Ignore-unignore buttons
                //                post.find('a.ignore').hide();
                //                post.find('a.unignore').show();
            } else {
                //The post is shown again
                post.removeClass('ignored');

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
        if (user.ignored) {
            $('.account').addClass('ignored');
        } else {
            $('.account').removeClass('ignored');
        }
    }


}());

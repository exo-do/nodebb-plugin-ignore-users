(function (module) {
    "use strict";

    var plugin = {};

    var Socket = module.parent.require('./socket.io/modules'),
        User = module.parent.require('./user'),
        db = module.parent.require('./database'),
        plugins = module.parent.require('./plugins'),
        async = module.parent.require('async'),
        helpers = module.parent.require('./controllers/helpers'),
        nconf = module.parent.require('nconf'),
        templates = module.parent.require('templates.js'),
        Topics = module.parent.require('./topics'),
        Posts = module.parent.require('./posts'),
        accountHelpers = module.parent.require('./controllers/accounts/helpers'),
        privileges = module.parent.require('./privileges'),
        translator = require.main.require('./public/src/modules/translator');

    /**
     * Check if the post belongs to an ignored user
     */
    plugin.parse = function (data, callback) {
        try {
            async.eachSeries(data.posts,
            function(p, cb){
                async.waterfall([
                    function (next){
                        privileges.posts.get([p.pid], data.uid, next);
                    }
                ],function(err,privi){

                if (data && p && data.uid && data.uid !== p.uid) {
                    User.isIgnored(data.uid, p.uid, function (err, ignored) {
                        if (err) {
                            console.error("Error checking if the user has been ignored " + p.uid, e);
                            cb();
                        }
                        translator.translate('[[topic:post_is_deleted]]',function(translated){
		                    if (p.deleted && !(privi[0].isAdminOrMod || p.selfPost)) {
			                    p.content = translated;
                                p.originalContent = p.content;
		                    }else{
                                p.originalContent = p.content;
                            }
                            p.ignored = ignored;
                            if(ignored){
                                translator.translate('[[ignored:ignored_post]]', function(translated) {
                                    p.content = translated;
                                    cb();
                                });
                            }else{
                                cb();
                            }
                        });
                    });
                } else {
                    cb();
                }
                }
                )
            }, function(r){
                callback(null, data);
            });
        } catch (e) {
            console.error("Error parsing the post content ", e);
            callback(null, data);
        }
    };

    /**
     * It defines the “/user/:userlug/ignored” new paths that will display the user's ignore list 
     */
    plugin.init = function (params, callback) {
        var app = params.router,
            controllers = params.controllers;

        controllers.accounts.getIgnored = function (req, res, next) {
            if (!req.user) {
                return helpers.notAllowed(req, res);
            }
            var returnUser = null;
            async.waterfall([

                function (next) {
                    accountHelpers.getUserDataByUserSlug(req.params.userslug, req.uid, next);
                    //User.getUidByUserslug(req.params.userslug, next);
                },
                function (user, next) {
                    returnUser = user;
                    if (req.user.uid !== user.uid) {
                        return helpers.notAllowed(req, res);
                    }
                    User.getIgnoredUsers(req.user.uid, next);
                },
                User.getUsersData
            ], function (err, users,usersChat) {
                var usersIgnored = users;
                if (err) {
                    console.err(err);
                    return helpers.notFound(req, res);
                }
               async.waterfall([
                   function(next,users){
                       User.getIgnoredUsersForChat(req.user.uid, next);
                   },
                   User.getUsersData
                   ],function (err,usersChat) {

                if (err) {
                    console.err(err);
                    return helpers.notFound(req, res);
                }

                    returnUser.showSettings= true;
                    returnUser.showHidden= true;
                    returnUser.isSelf= true;
                    returnUser.userslug= req.params.userslug;
                    returnUser.ignored= users;
                    returnUser.ignoredForChat=usersChat;
                    returnUser.ignoredCount= users.length;
                    returnUser.ignoreChatCount= usersChat.length;
                    returnUser.breadcrumbs= [
                        {text:"[[global:home]]",url:"/"},
                        {text:req.params.userslug,url:"/user/"+req.params.userslug},
                        {text:"[[ignored:ignored]]",url:"/user/"+req.params.userslug+"ignored"}];

                    res.render('account/ignored', returnUser);
                });
            });

        }

        app.get('/user/:userslug/ignored', params.middleware.buildHeader, controllers.accounts.getIgnored);
        app.get('/api/user/:userslug/ignored',controllers.accounts.getIgnored);

        templates.setGlobal('ignorePluginEnabled', true);

        callback();
    };

    plugin.changeClientRouting = function (config, callback) {
        config.custom_mapping['^user/.*/ignored'] = 'account/ignored';
        callback(null, config);
    }

    /**
     * "Hook" is called when a user's profile is displayed. We use it to check whether someone is ignored or not.
     */
    plugin.checkIgnoredAccount = function (data, callback) {
        try {
            if (data.uid && data.uid !== data.userData.uid) {
                async.parallel({
                    isIgnored: async.apply(User.isIgnored, data.uid, data.userData.uid),
                    isIgnoredForChat: async.apply(User.isIgnoredForChat, data.uid, data.userData.uid),
                }, function(err, ignored) {
                    if (err) {
                        console.error("[PROFILE] Error while checking if an user is ignored " + data.userData.uid, e);
                        return callback(null, data);
                    }
                    
                    data.userData.isIgnored = ignored.isIgnored;
                    data.userData.isIgnoredForChat = ignored.isIgnoredForChat;
                    callback(null, data);
                });
            } else {
                callback(null, data);
            }
        } catch (e) {
            console.error("[PROFILE] Error checking whether a user is being ignored while checking its profile " + data.userData.uid, e);
            callback(null, data);
        }
    }

    /**
     * It checks if an user (uid) has another user (otheruid) in the ignore list
     */
    User.isIgnored = function (uid, otheruid, callback) {
        db.isSetMember('ignored:' + uid, otheruid, callback);
    };

    /**
     * It returns an user's ignore list
     */
    User.getIgnoredUsers = function (uid, callback) {
        db.getSetMembers('ignored:' + uid, callback);
    };

        /**
     * It returns an user's ignore list
     */
    User.getIgnoredByUsers = function (uid, callback) {
        db.getSetMembers('ignored:by:' + uid, callback);
    };

    /**
     * It adds an user to the ignore list
     */
    Socket.ignoreUser = function (socket, data, callback) {
        plugins.fireHook('action:plugin.ignore-users.toggled', {
            uid: socket.uid,
            ignoreduid: data.ignoreduid,
            ignored: true
        });

        //Users that the actual user is ignoring.
        db.setAdd('ignored:' + socket.uid, data.ignoreduid, callback);
        //Sets of users ignoring a certain user.
        db.setAdd('ignored:by:' + data.ignoreduid, socket.uid, callback);
    };

    /**
     * It removes an user from the ignore list
     */
    Socket.unignoreUser = function (socket, data, callback) {
        plugins.fireHook('action:plugin.ignore-users.toggled', {
            uid: socket.uid,
            ignoreduid: data.ignoreduid,
            ignored: false
        });

        db.setRemove('ignored:' + socket.uid, data.ignoreduid, callback);
        db.setRemove('ignored:by:' + data.ignoreduid,socket.uid , callback);
    };

    /**
     * It checks if an user (uid) has another user (otheruid) in the chat ignore list
     */
    User.isIgnoredForChat = function (uid, otheruid, callback) {
        db.isSetMember('ignored:chat:' + uid, otheruid, callback);
    };

    /**
     * It returns an user's chat ignore list
     */
    User.getIgnoredUsersForChat = function (uid, callback) {
        db.getSetMembers('ignored:chat:' + uid, callback);
    };

    /**
     * It adds an user to the chat ignore list
     */
    Socket.ignoreUserForChat = function (socket, data, callback) {
        plugins.fireHook('action:plugin.ignore-users.chat.toggled', {
            uid: socket.uid,
            ignoreduid: data.ignoreduid,
            ignored: true
        });

        db.setAdd('ignored:chat:' + socket.uid, data.ignoreduid, callback);
    };

    /**
     * It removes an user from the chat ignore list
     */
    Socket.unignoreUserForChat = function (socket, data, callback) {
        plugins.fireHook('action:plugin.ignore-users.chat.toggled', {
            uid: socket.uid,
            ignoreduid: data.ignoreduid,
            ignored: false
        });

        db.setRemove('ignored:chat:' + socket.uid, data.ignoreduid, callback);
    };

    /**
     * It flags the ignored user's threads. Then, the threads are hidden.
     */
    plugin.filterIgnoredTopics = function (data, callback) {
        
        User.getIgnoredUsers(data.uid, function (err, ignoredUsers) {
            if (ignoredUsers && ignoredUsers.length) {
                data.topics.forEach(function (topic) {
                    topic.ignored = ignoredUsers.indexOf(topic.uid.toString()) !== -1;
                });
            }
            
            callback(null, data);
        })
        
    };

    /**
     * If a user attempts to message somebody who has ignored them, show them an error message
     */
    plugin.filterIgnoredChats = function (chats, callback) {
        db.getSortedSetRevRange('chat:room:' + chats.data.roomId + ':uids', 0, -1, function(err, uids) {
            async.each(uids, function(uid, next) {
                User.isIgnoredForChat(uid, chats.uid, function(err, ignored) {
                    if (ignored) {
                        return next(new Error('[[error:chat-restricted]]'));
                    }

                    next(null);
                });
            }, function(err) {
                return callback(err, chats);
            });
        });
        //User.isIgnoredForChat(data., otheruid
    };
    
    /**
     * If an user is ignoring another user and that user is generating a notification, dont push the notification to the ignoring user.
     * filter:notification.push
     * filter:notifications.merge
     */
    plugin.notificationManagement = function name(params,callback) {
        var filteredUids = [];
        if(params.notification!=null){
            User.getIgnoredByUsers(params.notification.from, function (err, ignoredByUsers) {
                if (ignoredByUsers && ignoredByUsers.length) {
                    params.uids.forEach(function (uid) {
                        if(ignoredByUsers.indexOf(uid) == -1){
                            filteredUids.push(uid);
                        }
                    });
                    params.uids = filteredUids;
                }
                callback(null, params);
            })
        }else{
            callback(null, params);
        }
    };

    /**
    * If an user is ignore another user, the topics where the second writes, doesn't make the topic appear in the unread list of the first.
    * hooks:
    *        filter:unread.build 
    */
    plugin.unreadManagement = function name(params,callback) {
        var filteredUids = [];
        User.getIgnoredByUsers(params.uidFrom, function (err, ignoredByUsers) {
            if (ignoredByUsers && ignoredByUsers.length) {
                params.uidsTo.forEach(function (uid) {
                    if(ignoredByUsers.indexOf(uid) == -1){
                        filteredUids.push(uid);
                    }
                });
                params.uidsTo = filteredUids;
            }
            callback(null, params);
        })
    };

    /**
    * When a post is saved, evaluate if the user that writes the posts is ignored by anyone. In that case mark the post as already read
    * for them, that way the post will not show on they unread message box. 
    * hooks:
    *        filter:post.save
    */
    plugin.unreadOmmitment = function name(data,callback) {

         async.waterfall([
                function (next) {
                    User.getIgnoredByUsers(data.uid, next);
                },
                function (ignoredByUsers, next) {
                    if (ignoredByUsers && ignoredByUsers.length && ignoredByUsers[0]!=null) {
                        ignoredByUsers.forEach(function (uid) {
                        var markAsReadUids = [];
                        async.waterfall([
                            function (next){
                                Topics.getUnreadTids(0, uid, null, next);
                            },
                            function(tids,next){
                                    if(tids && tids.indexOf(data.tid) === -1){
                                        markAsReadUids.push(uid);
                                        data.markAsReadUids = markAsReadUids;
                                    }                   
                                }
                            ]
                        );
                    });
                    }else{
                        data.markAsReadUids = [];
                    }
                }
            ],
            callback(null,data)
         );
    };

    /**
     * Processes the mark as read action over a list of uids for a certain post. That list of uids has been calculated previously
     * in the filter:post.save.
     * hooks:
     *      action:post.save
     */
    plugin.markAsReadIfNeccesary = function name(data) {
        //Mark the post read for the user thats ignoring the author.
        if(data.markAsReadUids!=null){
            data.markAsReadUids.forEach(function (uid) {
                var tids = [];
                tids.push(data.tid);
                Topics.markAsRead(tids, uid);
            });
        }
    }

    /**
     * Removes the data existing on originalContent attribute in order to be coherent with the post deletion
     * (if not removed, the post would be vissible if it was ignored previously if an user decides to unignore)
     * 
     * action:post.delete
     */
    plugin.eraseOriginalContentOnPostDeletion = function name(pid){
        Posts.setPostFields(pid, {originalContent: null},function(){});
    }

    /**
     * Restores the attribute originalContent.
     * 
     * action:post.restore
     */
    plugin.includeOriginalContentOnPostDeletion = function name(data){
        Posts.setPostFields(data.pid, {originalContent: data.content},function(){});
    }

    module.exports = plugin;
}(module));

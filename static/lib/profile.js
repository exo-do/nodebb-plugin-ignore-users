(function () {
    "use strict";
    
    $(window).on('action:ajaxify.contentLoaded', function (event, data) {
        /* If we are in the ignored-users screen*/

        if (data.url.match(/^user\/.+\/ignored$/i)) {
            $('.users.account.ignored-users').on('click', 'button.unignore', function () {
                var userbox = $(this).parents('.users-box');
                unignoreUser({id: userbox.data('uid'), name: userbox.find('.username').text()}, function () {
                    userbox.fadeOut();
                });
            });
        }
        
        if(data.tpl=='account/profile'){
            console.log("Datos: "+JSON.stringify(data));
            alert("hey entré bitch.");
            $('.dropdown-menu.dropdown-menu-right').append('<li><a class="ignore-user" href="#" >Ignorar Usuario<a/></li>');
        }
    });


    /**
     * Unignore selected user
     */
    function unignoreUser(user, callback) {
        socket.emit('modules.unignoreUser', {ignoreduid: user.id}, function (err, res) {
            
            if (err) {
                return;
            }

            callback();
            
            //Show the user a warning
            app.alert({
                message: 'From now on <b>' + user.name + '</b>’s publications will be visible',
                type: 'success',
                timeout: 5000
            });
            
        });
    }
    
}());

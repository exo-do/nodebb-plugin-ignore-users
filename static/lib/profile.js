(function () {
	"use strict";
	
	$(document).ready(function () {
		/* Si estamos en la vista de usuarios ignorados */
		$('.users.account.ignored-users').on('click', 'button.unignore', function () {
			var userbox = $(this).parents('.users-box');
			unignoreUser({id: userbox.data('uid'), name: userbox.find('.username').text()}, function () {
				userbox.fadeOut();
			});
		});
	});

	/**
	 * Des-ignora al usuario seleccionado
	 */
	function unignoreUser(user, callback) {
		socket.emit('modules.unignoreUser', {ignoreduid: user.id}, function (err, res) {
			
			if (err) {
				return;
			}

			callback();
			
			//Mostramos un aviso al usuario
			app.alert({
				message: 'A partir de ahora volver&aacute;s a ver todos los posts de <b>' + user.name + '</b>',
				type: 'success',
				timeout: 5000
			});
			
		});
	}
	
}());
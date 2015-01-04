(function () {
	"use strict";

	$(window).on('action:topic.loaded', function (event, data) {
		init();
	});
	
	function init() {
		$('.posts').on('click', 'a.ignore, a.unignore', function () {

			//Ejecutamos la accion de des/ignorar
			var post = $(this).parents('.post-row');
			toggleIgnoreUser({
				id: post.data('uid'),
				name: post.data('username'),
				ignored: post.is('.ignored')
			});

			//Cerramos el dropdown
			_clearMenus();

			return false;
		});
	}

	/**
	 * Ignora o des-ignora al usuario seleccionado
	 */
	function toggleIgnoreUser(user) {
		socket.emit(user.ignored ? 'modules.unignoreUser' : 'modules.ignoreUser', {
			ignoreduid: user.id
		}, function (err, res) {
			if (err) {
				return;
			}

			user.ignored = !user.ignored;

			//Mostramos un aviso al usuario
			if (user.ignored) {
				app.alert({
					message: 'A partir de ahora dejar&aacute;s de ver todos los posts de <b>' + user.name + '</b>',
					type: 'danger',
					timeout: 5000
				});
			} else {
				app.alert({
					message: 'A partir de ahora volver&aacute;s a ver todos los posts de <b>' + user.name + '</b>',
					type: 'success',
					timeout: 5000
				});
			}

			toggleIgnorePosts(user);
		});
	}

	/**
	 * Marca como ignorados todos los posts de un usuario
	 */
	function toggleIgnorePosts(user) {
		$('.post-row[data-uid=' + user.id + ']').each(function (i, post) {
			post = $(post);
			
			if (user.ignored) {

				//Nos guardamos el contenido original
				var content = post.find('.post-content');
				var originalContent = content.html();

				//Ocultamos el post
				post.addClass('ignored');
				content.html('Este post está oculto porque <b>' + user.name + '</b> está en tu lista de ignorados.');

				//Añadimos el contenido original la lado del ocultado para poder recuperarlo luego
				post.find('.original-content').html(originalContent);

				//Botones de ignorar-designorar
				post.find('a.ignore').hide();
				post.find('a.unignore').show();
			} else {
				//Mostramos de nuevo el post
				post.removeClass('ignored');

				//Devolvemos el contenido original
				post.find('.post-content').html(post.find('.original-content').html());

				//Botones de ignorar-designorar
				post.find('a.ignore').show();
				post.find('a.unignore').hide();
			}
		});
	}

}());
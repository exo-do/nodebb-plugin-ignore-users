"use strict";

var plugin = {};

var Socket = module.parent.require('./socket.io/modules'),
	User = module.parent.require('./user'),
	db = module.parent.require('./database');


plugin.init = function (data, callback) {
	plugin.uid = data.uid;
	callback(null, data);
}

/**
 * Parsea todos los posts del hilo en busca de usuarios ignorados
 */
plugin.parsePosts = function (data, callback) {
	try {
		if (plugin.uid) {
			db.getSetMembers('ignored:' + plugin.uid, function (err, uids) {
				if (err) {
					return callback(err);
				}

				data.posts.forEach(function (post) {
					post.ignored = false;
					if (uids.indexOf(post.uid) !== -1) {
						post.originalContent = post.content;
						post.content = "Este post está oculto porque <b>" + post.user.username + "</b> está en tu lista de ignorados.";
						post.ignored = true;
					}
				});

				callback(null, data);
			});
		} else {
			callback(null, data);
		}
	} catch (e) {
		console.error("Error en el metodo parsePosts del plugin ignore-users", e);
	}
};

/**
 * Añade un usuario a la lista de ignorados
 */
Socket.ignoreUser = function (socket, data, callback) {
	db.setAdd('ignored:' + socket.uid, data.ignoreduid, callback);
};

/**
 * Elimina un usuario de la lista de ignorados
 */
Socket.unignoreUser = function (socket, data, callback) {
	db.setRemove('ignored:' + socket.uid, data.ignoreduid, callback);
};

module.exports = plugin;
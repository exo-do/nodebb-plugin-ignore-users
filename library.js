(function (module) {
	"use strict";

	var plugin = {};

	var Socket = module.parent.require('./socket.io/modules'),
		User = module.parent.require('./user'),
		db = module.parent.require('./database');

	/**
	 * Comprueba si el post pertenece a un usuario ignorado
	 */
	plugin.parse = function (data, callback) {
		try {
			if (data.uid) {
				User.isIgnored(data.uid, data.postData.uid, function (err, ignored) {
					if (err) {
						return callback(err);
					}

					data.postData.originalContent = data.postData.content;
					data.postData.ignored = ignored;

					callback(null, data);

				});
			} else {
				callback(null, data);
			}
		} catch (e) {
			console.error("Error al parsear el contenido del post " + data.postData.pid, e);
			callback(null, data);
		}
	};

	/**
	 * Comprueba si un usuario (uid) tiene a otro usuario (otheruid) ignorado
	 */
	User.isIgnored = function (uid, otheruid, callback) {
		db.isSetMember('ignored:' + uid, otheruid, callback);
	};

	/**
	 * Devuelve la lista de usuarios ignorados de un usuario
	 */
	User.getIgnoredUsers = function (uid, callback) {
		db.getSetMembers('ignored:' + uid, callback);
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
}(module));
(function (module) {
	"use strict";

	var plugin = {};

	var Socket = module.parent.require('./socket.io/modules'),
		User = module.parent.require('./user'),
		db = module.parent.require('./database'),
		async = module.parent.require('async'),
		helpers = module.parent.require('./controllers/helpers'),
		nconf = module.parent.require('nconf'),
		templates = module.parent.require('templates.js');

	/**
	 * Comprueba si el post pertenece a un usuario ignorado
	 */
	plugin.parse = function (data, callback) {
		try {
			if (data.uid && data.uid !== data.postData.uid) {
				User.isIgnored(data.uid, data.postData.uid, function (err, ignored) {
					if (err) {
						console.error("Error al comprobar si un usuario esta ignorado " + data.postData.uid, e);
						return callback(null, data);
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
	 * Define las nuevas rutas /user/:userlug/ignored que mostraran la lista de ignorados del usuario
	 */
	plugin.init = function (params, callback) {
		var app = params.router,
			controllers = params.controllers;

		controllers.accounts.getIgnored = function (req, res, next) {
			if (!req.user) {
				return helpers.notAllowed(req, res);
			}

			async.waterfall([

				function (next) {
					User.getUidByUserslug(req.params.userslug, next);
				},
				function (uid, next) {
					if (req.user.uid !== uid) {
						return helpers.notAllowed(req, res);
					}
					User.getIgnoredUsers(req.user.uid, next);
				},
				User.getUsersData
			], function (err, users) {
				if (err) {
					console.err(err);
					return helpers.notFound(req, res);
				}
				
				res.render('account/ignored', {
					showSettings: true,
					showHidden: true,
					isSelf: true,
					userslug: req.params.userslug,
					ignored: users,
					ignoredCount: users.length
				});
			});

		}

		app.get('/user/:userslug/ignored', params.middleware.buildHeader, controllers.accounts.getIgnored);
		app.get('/api/user/:userslug/ignored', controllers.accounts.getIgnored);

		templates.setGlobal('ignorePluginEnabled', true);

		callback();
	};

	plugin.changeClientRouting = function (config, callback) {
		config.custom_mapping['^user/.*/ignored'] = 'account/ignored';
		callback(null, config);
	}

	/**
	 * Hook que se llama cuando se muestra el perfil de un usuario. Lo usamos para saber si está ignorado o no.
	 */
	plugin.checkIgnoredAccount = function (data, callback) {
		try {
			if (data.uid && data.uid !== data.userData.uid) {
				User.isIgnored(data.uid, data.userData.uid, function (err, ignored) {
					if (err) {
						console.error("[PROFILE] Error al comprobar si un usuario esta ignorado " + data.userData.uid, e);
						return callback(null, data);
					}
					
					data.userData.isIgnored = ignored;
					callback(null, data);
				});
			} else {
				callback(null, data);
			}
		} catch (e) {
			console.error("[PROFILE] Error al comprobar si un usuario esta ignorado al ver su perfil " + data.userData.uid, e);
			callback(null, data);
		}
	}

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

	/**
	 * Marca como ignorados, para luego ocultarlos, los hilos creados por un usuario ignorado
	 */
	plugin.filterIgnoredTopics = function (data, callback) {
		
		User.getIgnoredUsers(data.uid, function (err, ignoredUsers) {
			console.log(ignoredUsers)
			if (ignoredUsers && ignoredUsers.length) {
				data.topics.forEach(function (topic) {
					topic.ignored = ignoredUsers.indexOf(topic.uid.toString()) !== -1;
				});
			}
			
			callback(null, data);
		})
		
	};

	module.exports = plugin;
}(module));
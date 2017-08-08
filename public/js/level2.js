// Variable estado usada para cargar el nivel 2 del juego
var level2State = {
	/**
	 * Metodo usado para cargar el juego
	 * @method create
	 */
    create: function() {
		// Cargamos e iniciamos las diferentes variables usadas por el juego
		this.cargarInterfaz();
		this.cargarNave();
		this.cargarAliens();
		this.cargarMuros();
		this.cargarAnimaciones();
		this.cargarAudios();
		this.cargarControles();
    },
	
	/**
	 * Metodo ejecutado cada frame para actualizar la logica del juego
	 * @method update
	 */
    update: function() {
		// Si la nave esta viva
		if (game.nave.alive) {
			game.nave.body.velocity.setTo(0, 0);
			// Si estamos en el movil
			if (!game.escritorio) {
				// Y si pulsamos el joystick
				if (game.joystick.properties.inUse) {
					// Controlamos el movimiento de la nave a partir del movimiento del pad
					if (game.joystick.properties.x < 0) {
						game.nave.body.velocity.x = -game.naveVelocidad;
					} else {
						game.nave.body.velocity.x = game.naveVelocidad;
					}
				}
				// Controlamos evento de disparo
				if (game.botonA.isDown) {
					this.dispararBala();
				}
			} else {
				// Controlamos movimiento de nave si estamos en entorno de escritorio
				if (game.cursores.left.isDown) {
					game.nave.body.velocity.x = -game.naveVelocidad;
				} else if (game.cursores.right.isDown) {
					game.nave.body.velocity.x = game.naveVelocidad;
				}
				// Controlamos evento de disparo
				if (game.botonDisparo.isDown) {
					this.dispararBala();
				}
			}
			// Controlamos evento de disparo de grupo de enemigos 1
			if (game.time.now > game.alienDisparoHora1) {
				this.disparoEnemigo1();
			}
			// Controlamos evento de disparo de grupo de enemigos 2
			if (game.time.now > game.alienDisparoHora2) {
				this.disparoEnemigo2();
			}
			// Giramos nave y actualizamos estrellas mostradas en interfaz
			this.girarNave();
			this.actualizarEstrellas();
			// Controlamos colisiones de objetos en sus diferentes metodos
			game.physics.arcade.overlap(game.nave, game.ayudas, this.manejadorColisionNaveAyuda, null, this);
			game.physics.arcade.overlap(game.balas, game.aliens, this.manejadorDisparoNave, null, this);
			game.physics.arcade.overlap(game.balas, game.aliens2, this.manejadorDisparoNave, null, this);
			game.physics.arcade.overlap(game.balasAlien, game.nave, this.manejadorDisparoEnemigo, null, this);
			game.physics.arcade.overlap(game.nave, game.aliens, this.manejadorColisionNaveAlien, null, this);
			game.physics.arcade.overlap(game.nave, game.aliens2, this.manejadorColisionNaveAlien, null, this);
			game.physics.arcade.overlap(game.balasAlien, game.muros, this.manejadorColisionMuro, null, this);
			game.physics.arcade.overlap(game.balas, game.muros, this.manejadorColisionMuro, null, this);
			game.physics.arcade.overlap(game.balas, game.invasor, this.manejadorColisionInvasor, null, this);
			game.world.bringToTop(game.balas);
			game.world.bringToTop(game.balasAlien);
			game.world.bringToTop(game.ayudas);
			game.world.bringToTop(game.aliens);
			game.world.bringToTop(game.aliens2);
		}
	},
	
	/**
	 * Función usada para gestionar las colisiones producidas entre nuestras balas y los aliens
	 * @method manejadorDisparoNave
	 * @param {} bala
	 * @param {} alien
	 */
	manejadorDisparoNave: function(bala, alien) {
		// Calculamos posibilidad de lanzar o no ayuda
		this.lanzarAyuda(alien);
		// Eliminamos bala y alien colisionados
		bala.kill();
		alien.kill();
		// Agregamos puntos a marcador y reproducimos audio
		game.puntos += 20;
		game.puntosTexto.text = 'Puntos: ' + game.puntos;
		game.sfxExplosion.play();
		// Lanzamos animación de explosión para ese alien concreto
		var explosion = game.explosiones.getFirstExists(false);
		explosion.reset(alien.body.x, alien.body.y);
		explosion.play('boom', 30, false, true);
		// Si no quedan aliens llamamos al método ganarPartida
		if (game.aliens.countLiving() == 0 && game.aliens2.countLiving() == 0) {
			this.ganarPartida();
		}
	},

	/**
	 * Función usada para gestionar las colisiones producidas entre las balas enemigas y nuestra nave
	 * @method manejadorDisparoEnemigo
	 * @param {} nave
	 * @param {} bala
	 */
	manejadorDisparoEnemigo: function(nave, bala) {
		// Eliminamos bala y reproducimos sonido
		bala.kill();
		game.sfxExplosion.play();
		vida = game.vidas.getFirstAlive();
		// Si tenemos vidas eliminamos una
		if (vida) {
			vida.kill();
		}
		// Mostramos la animación de explosión en las coordenadas de nuestra nave
		var explosion = game.explosiones.getFirstExists(false);
		explosion.reset(nave.body.x, nave.body.y);
		explosion.play('boom', 20, false, true);
		// Si no nos quedan vidas llamamos al método perderPartida
		if (game.vidas.countLiving() < 1) {
			this.perderPartida(nave);
		}
	},

	/**
	 * Función usada para gestionar las colisiones producidas entre nuestra nave y las ayudas
	 * @method manejadorColisionNaveAyuda
	 * @param {} nave
	 * @param {} ayudaPuntos
	 */
	manejadorColisionNaveAyuda: function(nave, ayudaPuntos) {
		// Eliminamos ayuda y reproducimos sonido
		ayudaPuntos.kill();
		game.sfxAyuda.play();
		// Agregamos puntos a marcador y reproducimos audio
		game.puntos += parseInt(ayudaPuntos.name);
		game.puntosTexto.text = 'Puntos: ' + game.puntos;
	},

	/**
	 * Función usada para gestionar las colisiones producidas entre nuestra nave y los aliens
	 * @method manejadorColisionNaveAlien
	 * @param {} nave
	 * @param {} alien
	 */
	manejadorColisionNaveAlien: function(nave, alien) {
		// Eliminamos alien, reproducimos sonido y agregamos puntos a marcador
		alien.kill();
		game.sfxExplosion.play();
		game.puntos += 20;
		game.puntosTexto.text = 'Puntos: ' + game.puntos;
		vida = game.vidas.getFirstAlive();
		if (vida) {
			// Si tenemos vidas quitamos una
			vida.kill();
		}
		// Mostramos la animación de explosión en las coordenadas de nuestra nave
		var explosion = game.explosiones.getFirstExists(false);
		explosion.reset(nave.body.x, nave.body.y);
		explosion.play('boom', 20, false, true);
		// Si no nos quedan vidas llamamos al método perderPartida
		if (game.vidas.countLiving() < 1) {
			this.perderPartida(nave);
		// Si no quedan aliens llamamos al método ganarPartida
		} else if (game.aliens.countLiving() == 0) {
			this.ganarPartida();
		}
	},
	
	/**
	 * Función usada para gestionar las colisiones producidas entre las balas y los muros
	 * @method manejadorColisionMuro
	 * @param {} bala
	 * @param {} muro
	 */
	manejadorColisionMuro: function(bala, muro) {
		var factorRedondeo = 3;
		// Obtenemos elemento colisionado, referencia de puntos de colisión y colores alrededor de ese punto
 		var muroMapa = game.muroMapas[game.muros.getChildIndex(muro)];
		var puntoX = Math.round(bala.x - muroMapa.worldX);
		var puntoY = Math.round(bala.y - muroMapa.worldY);
		var colorMapaCen = muroMapa.bmp.getPixelRGB(puntoX, puntoY);
		var colorMapaIzq = muroMapa.bmp.getPixelRGB(puntoX - factorRedondeo, puntoY);
		var colorMapaDer = muroMapa.bmp.getPixelRGB(puntoX + factorRedondeo, puntoY);
		var colorMapaArr = muroMapa.bmp.getPixelRGB(puntoX, puntoY + factorRedondeo);
		var colorMapaAba = muroMapa.bmp.getPixelRGB(puntoX, puntoY - factorRedondeo);
		// Si el canal rojo indica que no hemos destruído esa zona del mapa de bits
		if (colorMapaCen.r > 0 || colorMapaIzq.r > 0 || colorMapaDer.r > 0 || colorMapaArr.r > 0 || colorMapaAba.r > 0) {
			// Pintamos la colisión, reproducimos audio y destruímos la bala
			muroMapa.bmp.draw(game.muroDanio, puntoX - 8, puntoY - 8);
			muroMapa.bmp.update();
			game.sfxMuro.play();
			bala.kill();
		}
	},
	
	/**
	 * Función usada para gestionar las colisiones producidas entre las balas y el invasor superior
	 * @method manejadorColisionInvasor
	 * @param {} bala
	 * @param {} invasor
	 */
	manejadorColisionInvasor: function(bala, invasor) {
		// Eliminamos bala y reproducimos sonido
		bala.kill();
		game.sfxExplosion.play();
		// Mostramos la animación de explosión en las coordenadas del invasor
		var explosion = game.explosiones.getFirstExists(false);
		explosion.reset(invasor.body.x, invasor.body.y);
		explosion.play('boom', 20, false, true);
		// Lanzamos paquete de puntos y eliminamos al insavor
		this.cargarPowerUp('500', invasor.body.x, invasor.body.y);
		game.sfxInvasor.stop();
		invasor.kill();
	},
	
	/**
	 * Función usada para controlar el evento hover en todos los botones a nivel general
	 * @method manejadorOverBoton
	 */
	manejadorOverBoton: function() {
		game.sfxHover.play();
	},

	/**
	 * Función usada para controlar el evento click en el botón volver
	 * @method manejadorClickBotonVolver
	 */
	manejadorClickBotonVolver: function() {
		// Reproducimos audio y llamamos al estado menu para volver al inicio
		game.sfxStart.play();
		game.state.start('menu');
	},
	
	/**
	 * Función usada para controlar el evento click en el botón silenciar
	 * @method manejadorClickBotonSilenciar
	 */
	manejadorClickBotonSilenciar: function() {
		// Activamos o desactivamos el audio en nuestro juego y cambiamos la imagen mostrada
		game.sound.mute = !game.sound.mute;
		game.btnSilenciar.loadTexture((game.sound.mute) ? 'botonVolumen' : 'botonSilenciar');
		game.sfxStart.play();
	},
	
	/**
	 * Función usada para crear e inicializar las variables de la interfaz de juego
	 * @method cargarInterfaz
	 */
	cargarInterfaz: function() {
		// Agregamos skin de fondo a tablero
		game.skin = game.add.sprite(0, 0, 'skin' + game.skinSeleccionada);
		// Variables con textos y puntos mostrados por pantalla
		game.mapaTitulo = game.add.bitmapText(game.world.centerX - 100, 350, 'gem', '', 36);
		this.mostrarLetraPorLetra(game.mapaTitulo, '  Nivel 2    ');
		game.puntosTexto = game.add.text(10, 10, 'Puntos: ' + game.puntos, { font: '34px Arial', fill: '#fff' });
		game.vidas = game.add.group();
		game.vidasTexto = game.add.text(game.world.width - 140, 10, 'Escudos: ', { font: '30px Arial', fill: '#fff' });
		// Mostramos las vidas del jugador
		for (var i = 0; i < game.nivelNaveEscudo; i++) {
			var img = game.vidas.create(game.world.width - 135 + (23 * i), 60, 'nave');
			img.anchor.setTo(0.5, 0.5);
			img.angle = 90;
			img.alpha = 0.4;
		}
		// Agregamos botón volver y silenciar junto con sus manejadores para controlar sus eventos
		game.btnVolver = game.add.button(game.world.left + 10, game.world.bottom - 50, 'botonVolverPeq', this.manejadorClickBotonVolver, this, 0, 1, 0);
		game.btnVolver.onInputOver.add(this.manejadorOverBoton, this);
		game.btnSilenciar = game.add.button(game.world.right - 50, game.world.bottom - 50, 'botonSilenciar', this.manejadorClickBotonSilenciar, this, 0, 1, 0);
		game.btnSilenciar.onInputOver.add(this.manejadorOverBoton, this);
		this.cargarEstrellas();
	},
	
	/**
	 * Función usada para crear e inicializar las variables de nuestra nave
	 * @method cargarNave
	 */
	cargarNave: function() {
		// Variables de nuestra nave
		game.nave = game.add.sprite(400, 500, 'nave');
		game.nave.anchor.setTo(0.5, 0.5);
		game.physics.enable(game.nave, Phaser.Physics.ARCADE);
		game.nave.body.collideWorldBounds = true;
		game.naveDisparoHora = 0;
		// Variables referentes a las balas de nuestra nave
		game.balas = game.add.group();
		game.balas.enableBody = true;
		game.balas.physicsBodyType = Phaser.Physics.ARCADE;
		game.balas.createMultiple(20, 'bala');
		game.balas.setAll('anchor.x', 0.5);
		game.balas.setAll('anchor.y', 1);
		game.balas.setAll('outOfBoundsKill', true);
		game.balas.setAll('checkWorldBounds', true);
		// Variables con las ayudas y powerups para nuestra nave
		game.ayudas = game.add.group();
		game.ayudas.enableBody = true;
		game.ayudas.physicsBodyType = Phaser.Physics.ARCADE;
		game.physics.arcade.gravity.y = 50;
	},
	
	/**
	 * Función usada para crear, inicializar y posicionar los enemigos en pantalla agregándoles movimiento
	 * @method cargarAliens
	 */
	cargarAliens: function() {
		// Variables de los aliens
		game.aliens = game.add.group();
		game.aliens.enableBody = true;
		game.aliens.physicsBodyType = Phaser.Physics.ARCADE;
		game.alienDisparoHora1 = 0;
		game.aliens2 = game.add.group();
		game.aliens2.enableBody = true;
		game.aliens2.physicsBodyType = Phaser.Physics.ARCADE;
		game.alienDisparoHora2 = 0;
		game.alienVelocidad = 2000;
		game.alienVivos = [];
		// Cargamos primer grupo de enemigos
		for (var x = 0; x < 6; x++) {
			var alien = game.aliens2.create(x * 60, y * 50, 'alien');
			alien.anchor.setTo(0.5, 0.5);
			alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
			alien.play('fly');
			alien.body.moves = false;
			game.add.tween(alien).to( { y: alien.body.y + 5 }, 500, Phaser.Easing.Sinusoidal.InOut, true, game.rnd.integerInRange(0, 500), 1000, true);
		}
		// Cargamos en filas columnas al segundo grupo de enemigos
		for (var y = 1; y < 4; y++) {
			for (var x = 0; x < 10; x++) {
				var alien = game.aliens.create(x * 48, y * 50, 'alien');
				alien.anchor.setTo(0.5, 0.5);
				alien.animations.add('fly', [ 0, 1, 2, 3 ], 20, true);
				alien.play('fly');
				alien.body.moves = false;
				// Agregamos movimiendo de vaivén en aliens
				game.add.tween(alien).to( { y: alien.body.y + 5 }, 500, Phaser.Easing.Sinusoidal.InOut, true, game.rnd.integerInRange(0, 500), 1000, true);
			}
		}
		// Asignamos coordenadas iniciales a grupos de enemigos
		game.aliens2.x = 250;
		game.aliens2.y = 50;
		game.aliens.x = 100;
		game.aliens.y = 50;
		// Agregamos los eventos de movimiento horizontal y vertical para los aliens
		game.time.events.loop(game.alienVelocidad / 1.15 * 2, function() { this.descender(game.aliens2, 30); }, this);
		game.add.tween(game.aliens).to( { x: 250 }, game.alienVelocidad / 1.15, Phaser.Easing.Sinusoidal.InOut, true, 0, game.alienVelocidad, true);
		game.time.events.loop(game.alienVelocidad / 1.15 * 2, function() { this.descender(game.aliens, 30); }, this);
		// Variables referentes a las balas de los aliens
		game.balasAlien = game.add.group();
		game.balasAlien.enableBody = true;
		game.balasAlien.physicsBodyType = Phaser.Physics.ARCADE;
		game.balasAlien.createMultiple(30, 'balaAlien');
		game.balasAlien.setAll('anchor.x', 0.5);
		game.balasAlien.setAll('anchor.y', 1);
		game.balasAlien.setAll('outOfBoundsKill', true);
		game.balasAlien.setAll('checkWorldBounds', true);
		var tMin = 10;
		var tMax = 30;
		// Generamos disparador de evento de forma aleatoria entre los segundos 10 y 30 de juego
		var tiempo = Math.floor(Math.random() * (tMax - tMin + 1) + tMin);
		game.time.events.add(Phaser.Timer.SECOND * tiempo, this.cargarAlienTop, this);
	},
	
	/**
	 * Función usada para crear y configurar el alien que aparece en la parte superior de la pantalla
	 * @method cargarAliens
	 */
	cargarAlienTop: function() {
		// Configuramos los parámetros iniciales del invasor
		game.invasor = game.add.sprite(0, 50, 'invasor');
		game.invasor.anchor.setTo(0.5, 0.5);
		game.physics.enable(game.invasor, Phaser.Physics.ARCADE);
		game.invasor.body.collideWorldBounds = false;
		game.physics.arcade.enable(game.invasor);
		game.invasor.body.allowGravity = false;
		var bucle = 1;
		// Le asignamos los eventos de movimiento para que sólo se produzca un bucle de transición hasta que desaparezca
		movimientoAlienTop = game.add.tween(game.invasor).to( { x: game.width - game.invasor.width }, game.alienVelocidad * 5, Phaser.Easing.Linear.None, true, 0, game.alienVelocidad, true);
		movimientoAlienTop.onRepeat.add( function() { if (bucle == 0) { game.tweens.remove(movimientoAlienTop); game.invasor.kill(); } bucle--; }, this);
		game.sfxInvasor.play();
	},
	
	/**
	 * Función usada para cargar los muros utilizados para proteger a la nave
	 * @method cargarMuros
	 */
	cargarMuros: function() {
		// Cargamos valores iniciales
		var totalBases = 4;
		var muroY = 450;
		var ancho = 48;
		var alto = 32;
		// Creamos grupo de muros y mapas de bits para almacenar las imagénes a mostrar
        game.muros = game.add.group();
        game.muros.enableBody = true;
        game.muroDanio = game.make.bitmapData(ancho, alto);
        game.muroDanio.circle(8, 8, 8, 'rgba(0, 27, 7, 1)');  // rgba(255,0,255,0.2)
        game.muroMapas = [];
		// Creamos tantos muros en pantalla como hayamos descrito
        for (var x = 1; x <= totalBases; x++) {
            var muroMapa = game.make.bitmapData(ancho, alto);
            muroMapa.draw('muro', 0, 0, ancho, alto);
            muroMapa.update();
			// Posicionamos los muros y les agregamos y configuramos el sistema de físicas
            var muroX = (x * game.width / (totalBases + 1)) - (ancho / 2);
            var muro = game.add.sprite(muroX, muroY, muroMapa);
			game.physics.arcade.enable(muro);
			muro.body.allowGravity = false;
            game.muros.add(muro);
            game.muroMapas.push( { bmp: muroMapa, worldX: muroX, worldY: muroY });
        }
    },
	
	/**
	 * Función usada para crear y cargar las animaciones usadas en el juego
	 * @method cargarAnimaciones
	 */
	cargarAnimaciones: function() {
		// Variables con las animaciones de las explosiones para los objetos de juego
		game.explosiones = game.add.group();
		game.explosiones.createMultiple(30, 'boom');
		game.explosiones.forEach(this.configurarExplosion, this);
	},
	
	/**
	 * Función usada para crear e cargar los audios usados en el juego
	 * @method cargarAudios
	 */
	cargarAudios: function() {
		// Variables con los audios utilizados en el juego
		game.sfxAyuda = game.add.audio('ayuda');
		game.sfxDisparo = game.add.audio('disparo');
		game.sfxExplosion = game.add.audio('explosion');
		game.sfxMuro = game.add.audio('muro');
		game.sfxInvasor = game.add.audio('invasor');
	},
	
	/**
	 * Función usada para crear y cargar los controles de juego 
	 * @method cargarControles
	 */
	cargarControles: function() {
		// Preparamos los cursores y controles de juego
		game.cursores = game.input.keyboard.createCursorKeys();
		game.botonDisparo = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		// Si ejecutamos la aplicacion desde el movil
		if (!game.escritorio) {
			// Agregamos un pad virtual con su joystick y botón
			game.gamepad = game.plugins.add(Phaser.Plugin.VirtualGamepad);
			game.joystick = game.gamepad.addJoystick(150, 500, 1.2, 'gamepad');
			game.botonA = game.gamepad.addButton(650, 500, 1.0, 'gamepad');
		}
	},	
	
	/**
	 * Función usada para configurar objetos agregándoles una animación
	 * @method configurarExplosion
	 * @param {} objeto
	 */
	configurarExplosion: function(objeto) {
		objeto.anchor.x = 0.5;
		objeto.anchor.y = 0.5;
		objeto.animations.add('boom');
	},

	/**
	 * Función usada para controlar el descenso de los enemigos de tipo alien
	 * @method descender
	 * @param {} grupo
	 * @param {} descensoY
	 */
	descender: function(grupo, descensoY) {
		game.add.tween(grupo).to( { y: grupo.y + descensoY }, 2500, Phaser.Easing.Linear.None, true, 0, 0, false);
	},

	/**
	 * Función usada para gestionar los disparos de los enemigos del primer grupo
	 * @method disparoEnemigo1
	 */
	disparoEnemigo1: function() {
		// Cargamos todos los aliens que quedan vivos en el vector
		game.alienVivos.length = 0;
		game.aliens.forEachAlive(function(alien){
			game.alienVivos.push(alien);
		});
		// Obtenemos la primera bala
		var balaAlien = game.balasAlien.getFirstExists(false);
		// Si no hay balas en pantalla y existen aliens vivos
		if (balaAlien && game.alienVivos.length > 0) {
			// Seleccionamos aleatoriamente un alien entre los que quedan vivos
			var aleatorio = game.rnd.integerInRange(0, game.alienVivos.length-1);
			var alien = game.alienVivos[aleatorio];
			// Y lanzamos la bala desde su posicion hacia nuestra nave
			balaAlien.reset(alien.body.x, alien.body.y);
			game.physics.arcade.moveToObject(balaAlien, game.nave, 200);
			game.alienDisparoHora1 = game.time.now + 3000;
			game.sfxDisparo.play();
		}
	},

	/**
	 * Función usada para gestionar los disparos de los enemigos del segundo grupo
	 * @method disparoEnemigo2
	 */
	disparoEnemigo2: function() {
		// Cargamos todos los aliens que quedan vivos en el vector
		game.alienVivos.length = 0;
		game.aliens2.forEachAlive(function(alien){
			game.alienVivos.push(alien);
		});
		// Obtenemos la primera bala
		var balaAlien = game.balasAlien.getFirstExists(false);
		// Si no hay balas en pantalla y existen aliens vivos
		if (balaAlien && game.alienVivos.length > 0) {
			// Seleccionamos aleatoriamente un alien entre los que quedan vivos
			var aleatorio = game.rnd.integerInRange(0, game.alienVivos.length-1);
			var alien = game.alienVivos[aleatorio];
			// Y lanzamos la bala desde su posicion hacia nuestra nave
			balaAlien.reset(alien.body.x, alien.body.y);
			game.physics.arcade.moveToObject(balaAlien, game.nave, 200);
			game.alienDisparoHora2 = game.time.now + 1500;
			game.sfxDisparo.play();
		}
	},
	
	/**
	 * Función usada para controlar la aleatoriedad a la hora de lanzar los paquetes de ayuda
	 * @method lanzarAyuda
	 * @param {} alien
	 */
	lanzarAyuda: function(alien) {
		// Obtenemos un número aleatorio entre 0 y 1 y si es menor que 0.15 lanzamos una mejora
		var aleatorio = Math.random();
		if (aleatorio < 0.15) {
			// Inicialmente cargamos una mejora con 100 puntos
			var mejora = "100";
			// Si el número está entre 0.05 y 0.1 cargamos una mejora de 200 puntos
			if (aleatorio > 0.05 && aleatorio < 0.1) {
				mejora = "200";
			// Si es menor de 0.05 cargamos una mejora de 300 puntos
			} else if (aleatorio <= 0.05) {
				mejora = "300";
			}
			this.cargarPowerUp(mejora, alien.body.x, alien.body.y);
		}
	},

	/**
	 * Función usada para cargar la ayuda en pantalla a partir de su nombre y localizacion
	 * @method cargarPowerUp
	 * @param {} tipoMejora
	 * @param {} locX
	 * @param {} locY
	 */
	cargarPowerUp: function(tipoMejora, locX, locY) {
		// Creamos una mejora del tipo especificado desde la localizacion concretada
		var objeto = game.ayudas.create(locX, locY, tipoMejora);
		objeto.name = tipoMejora;
		objeto.body.collideWorldBounds = false;
		// Y la hacemos semitransparente ademas de anadirle gravedad
		objeto.alpha = 0.4;
		game.physics.arcade.gravity.y = 50;
	},

	/**
	 * Función usada para disparar balas desde nuestra nave
	 * @method dispararBala
	 */
	dispararBala: function() {
		// Si ha pasado el tiempo suficiente
		if (game.time.now > game.naveDisparoHora) {
			// Obtenemos la primera bala
			var bala = game.balas.getFirstExists(false);
			if (bala) {
				game.sfxDisparo.play();
				// Y la lanzamos desde la ubicacion de la nave
				bala.reset(game.nave.x, game.nave.y + 8);
				bala.body.velocity.y = -400;
				game.naveDisparoHora = game.time.now + game.naveBalasRatio;
			}
		}
	},

	/**
	 * Función usada para mostrar animación de texto cargando un mensaje letra a letra
	 * @method mostrarLetraPorLetra
	 * @param {} mapaTexto
	 * @param {} mensaje
	 * @param {} locY
	 */
	mostrarLetraPorLetra: function(mapaTexto, mensaje) {
		game.time.events.repeat(200, mensaje.length + 1, this.mostrarLetraSiguiente, { mapaTexto: mapaTexto, mensaje: mensaje, contador: 1 , total: mensaje.length });
	},
	
	/**
	 * Función auxiliar usada para mostrar la siguiente letra sobreescribiendo el valor del mensaje inicial
	 * @method mostrarLetraSiguiente
	 */
	mostrarLetraSiguiente: function() {
		if (this.contador > this.total) {
			this.mapaTexto.text = '';
		} else {
			this.mapaTexto.text = this.mensaje.substr(0, this.contador);
			this.contador += 1;
		}
	},
	
	/**
	 * Función usada para girar la nave y dar la sensacion de movilidad
	 * @method girarNave
	 */
	girarNave: function() {
		// Dependiendo de la velocidad en el eje x de la nave
		var giro = game.nave.body.velocity.x / 1000;
		game.nave.scale.x = 1 - Math.abs(giro) / 2;
		// La movemos angularmente para girarla mientras nos desplazamos
		game.nave.angle = giro * 30;
	},
	
	/**
	 * Función usada para cargar un halo de estrellas creando asi una sensacion de velocidad
	 * @method cargarEstrellas
	 */
	cargarEstrellas: function() {
		// Variables vector que contienen las estrellas y sus coordenadas
		game.estrellas = [];
		game.estrellasX = [];
		game.estrellasY = [];
		game.estrellasZ = [];
		// Variables usadas para almacenar parametros de las estrellas 
		game.distanciaEstrellas = 300;
		game.velocidadEstrellas = 1;
		game.maxEstrellas = 1000;
		var sprites = game.add.spriteBatch();
		for (var i = 0; i < game.maxEstrellas; i++) {
			// Cargamos las coordenadas de las estrellas aleatoriamente
			game.estrellasX[i] = Math.floor(Math.random() * 800) - 400;
			game.estrellasY[i] = Math.floor(Math.random() * 600) - 300;
			game.estrellasZ[i] = Math.floor(Math.random() * 1700) - 100;
			var star = game.make.sprite(0, 0, 'star');
			star.anchor.set(0.5);
			sprites.addChild(star);
			// Y las anadimos al vector principal
			game.estrellas.push(star);
		}
	},
	
	/**
	 * Función usada para actualizar el halo de estrellas mostrado durante el juego
	 * @method actualizarEstrellas
	 */
	actualizarEstrellas: function() {
		// Recorremos vector de estrellas
		for (var i = 0; i < game.maxEstrellas; i++) {
			// Y las trasladamos para dar sensacion de movimiento
			game.estrellas[i].perspective = game.distanciaEstrellas / (game.distanciaEstrellas - game.estrellasZ[i]);
			game.estrellas[i].x = game.world.centerX + game.estrellasX[i] * game.estrellas[i].perspective;
			game.estrellas[i].y = game.world.centerY + game.estrellasY[i] * game.estrellas[i].perspective;
			game.estrellasZ[i] += game.velocidadEstrellas;
			if (game.estrellasZ[i] > 290) {
				game.estrellasZ[i] -= 600;
			}
			game.estrellas[i].alpha = Math.min(game.estrellas[i].perspective / 2, 1);
			game.estrellas[i].scale.set(game.estrellas[i].perspective / 2);
			game.estrellas[i].rotation += 0.1;
		}
		// Posicionamos por encima los botones y texto mostrados
		game.world.bringToTop(game.puntosTexto);
		game.world.bringToTop(game.vidasTexto);
		game.world.bringToTop(game.btnVolver);
		game.world.bringToTop(game.btnSilenciar);
	},
	
	/**
	 * Función usada para gestionar la partida perdida
	 * @method perderPartida
	 * @param {} nave
	 */
	perderPartida: function(nave) {
		// Eliminamos la nave y removemos demás elementos de juego
		nave.kill();
		game.sfxInvasor.stop();
		game.balasAlien.callAll('kill');
		// Lanzamos el estado lose
		game.state.start('lose');
	},
	
	/**
	 * Función usada para gestionar la partida ganada
	 * @method ganarPartida
	 */
	ganarPartida: function() {
		// Agregamos puntos a marcador
		game.puntos += 1000;
		game.puntosTexto.text = 'Puntos: ' + game.puntos;
		game.balasAlien.callAll('kill', this);
		game.sfxInvasor.stop();
		game.siguienteNivel = 'level2';
		// Lanzamos el estado levelUp
		game.state.start('levelUp');
	},
}
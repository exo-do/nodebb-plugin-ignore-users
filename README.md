# Ignore Users for NodeBB


Plugin para poder poder ocultar los posts de ciertos usuarios

Requiere hacer modificaciones en la plantilla `topic.tpl`

Buscar la línea

```
	<!-- BEGIN posts -->
	<li class="post-row<!-- IF posts.deleted --> deleted<!-- ENDIF posts.deleted -->" ...></li>
```

Y añadir `<!-- IF posts.ignored --> ignored<!-- ENDIF posts.ignored -->` en el atributo `class`:

```
	<li class="post-row<!-- IF posts.deleted --> deleted<!-- ENDIF posts.deleted --><!-- IF posts.ignored --> ignored<!-- ENDIF posts.ignored -->"...></li>
```
Luego, para añadir los botones de **Ignorar usuario** al desplegable:

```
	<!-- IF !posts.selfPost --> 	 	
	<!-- IF loggedIn --> 	 	
	<li><a href="#" class="unignore" <!-- IF !posts.ignored -->style="display: none;"<!-- ENDIF !posts.ignored -->><i class="fa fa-eye"></i> Des-Ignorar</a></li> 	 	
	<li><a href="#" class="ignore" <!-- IF posts.ignored -->style="display: none;"<!-- ENDIF posts.ignored -->><i class="fa fa-eye-slash"></i> Ignorar usuario</a></li> 	 	
	<!-- ENDIF loggedIn --> 	 	
	<!-- ENDIF !posts.selfPost --> 
```

Y para terminar, simplemente guardamos el contenido original en el DOM para poder mostrarlo en el caso de que el usuario pulse el botón de Des-Ignorar:

```
	<div class="original-content hide" itemprop="text">{posts.originalContent}</div> 
```
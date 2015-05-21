# Ignore Users for NodeBB


Plugin to ignore post from certain users

Modifications on `topic.tpl`

Find line

```
	<!-- BEGIN posts -->
	<li class="post-row<!-- IF posts.deleted --> deleted<!-- ENDIF posts.deleted -->" ...></li>
```

Add `<!-- IF posts.ignored --> ignored<!-- ENDIF posts.ignored -->` on `class` atribute:

```
	<li class="post-row<!-- IF posts.deleted --> deleted<!-- ENDIF posts.deleted --><!-- IF posts.ignored --> ignored<!-- ENDIF posts.ignored -->"...></li>
```
Add buttons to ignore user :

```
	<!-- IF !posts.selfPost --> 	 	
	<!-- IF loggedIn --> 	 	
	<li><a href="#" class="unignore" <!-- IF !posts.ignored -->style="display: none;"<!-- ENDIF !posts.ignored -->><i class="fa fa-eye"></i> Des-Ignorar</a></li> 	 	
	<li><a href="#" class="ignore" <!-- IF posts.ignored -->style="display: none;"<!-- ENDIF posts.ignored -->><i class="fa fa-eye-slash"></i> Ignorar usuario</a></li> 	 	
	<!-- ENDIF loggedIn --> 	 	
	<!-- ENDIF !posts.selfPost --> 
```

Adding content on Dom in case user press unignore:
```
	<div class="original-content hide" itemprop="text">{posts.originalContent}</div> 
```

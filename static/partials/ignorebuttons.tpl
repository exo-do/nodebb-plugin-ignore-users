<!-- IF !posts.selfPost -->
<!-- IF loggedIn -->
<li><a href="#" class="unignore" <!-- IF !posts.ignored -->style="display: none;"<!-- ENDIF !posts.ignored -->><i class="fa fa-eye"></i> Des-Ignorar</a></li>
<li><a href="#" class="ignore" <!-- IF posts.ignored -->style="display: none;"<!-- ENDIF posts.ignored -->><i class="fa fa-eye-slash"></i> Ignorar usuario</a></li>
<!-- ENDIF loggedIn -->
<!-- ENDIF !posts.selfPost -->
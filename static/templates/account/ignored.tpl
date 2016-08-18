<!-- IMPORT partials/account_menu.tpl -->
<div class="users ignored-users">
   <div class="panel panel-default">
      <div class="panel-heading">
         <h3 class="panel-title">[[ignored:ignored_list]]</h3>
      </div>
      <ul id="users-container" class="users-container">
         <!-- BEGIN ignored -->
         <li class="users-box registered-user ignored-for-posts" style="margin-left:10px;" data-uid="{ignored.uid}">
            <a href="{config.relative_path}/user/{ignored.userslug}">
               <!-- IF ignored.picture -->
               <img src="{ignored.picture}" />
               <!-- ELSE -->
               <div class="user-icon" style="background-color: {ignored.icon:bgColor};">{ignored.icon:text}</div>
               <!-- ENDIF ignored.picture -->
            </a>
            <br/>
            <div class="user-info">
               <span>
               <i component="user/status" class="fa fa-circle status {ignored.status}" title="[[global:{ignored.status}]]"></i>
               <a href="{config.relative_path}/user/{ignored.userslug}">{ignored.username}</a>
               </span>
               <br/>
               <!--<!-- IF ignored:joindate -->
               <div title="joindate" class="joindate">
                  <span class="timeago" title="{ignored.joindateISO}"></span>
               </div>
               <!-- ENDIF ignored:joindate -->
               <!-- IF ignored:reputation -->
               <div title="reputation" class="reputation">
                  <i class="fa fa-star"></i>
                  <span class="formatted-number">{ignored.reputation}</span>
               </div>
               <!-- ENDIF ignored:reputation -->
               <!-- IF ignored:postcount -->
               <div title="post count" class="post-count">
                  <i class="fa fa-pencil"></i>
                  <span class="formatted-number">{ignored.postcount}</span>
               </div>
             -->
               <button href="#" class="btn btn-sm btn-success unignore">[[ignored:unignore]]</button>
               <!-- ENDIF ignored:postcount -->
            </div>
         </li>
         <!-- END ignored -->
         <div id="no-ignored-notice" class="alert alert-success <!-- IF ignoredCount -->hide<!-- ENDIF ignoredCount -->">[[ignored:ignored_no_one]]</div>
      </ul>
   </div>
</div>
<div class="users ignored-users">
<div class="panel panel-default">
      <div class="panel-heading">
         <h3 class="panel-title">[[ignored:chat_ignored_list]]</h3>
	  </div>
         <ul id="users-container-for-chat" class="users-container">
         <!-- BEGIN ignoredForChat -->
         <li class="users-box registered-user ignoreForChat" style="margin-left:10px;" data-uid="{ignoredForChat.uid}">
            <a href="{config.relative_path}/user/{ignoredForChat.userslug}">
               <!-- IF ignoredForChat.picture -->
               <img src="{ignoredForChat.picture}" />
               <!-- ELSE -->
               <div class="user-icon" style="background-color: {ignoredForChat.icon:bgColor};">{ignoredForChat.icon:text}</div>
               <!-- ENDIF ignoredForChat.picture -->
            </a>
            <br/>
            <div class="user-info">
               <span>
               <i component="user/status" class="fa fa-circle status {ignoredForChat.status}" title="[[global:{ignoredForChat.status}]]"></i>
               <a href="{config.relative_path}/user/{ignoredForChat.userslug}">{ignoredForChat.username}</a>
               </span>
               <br/>
               <!--<!-- IF ignoredForChat:joindate -->
               <div title="joindate" class="joindate">
                  <span class="timeago" title="{ignoredForChat.joindateISO}"></span>
               </div>
               <!-- ENDIF ignoredForChat:joindate -->
               <!-- IF ignoredForChat:reputation -->
               <div title="reputation" class="reputation">
                  <i class="fa fa-star"></i>
                  <span class="formatted-number">{ignoredForChat.reputation}</span>
               </div>
               <!-- ENDIF ignoredForChat:reputation -->
               <!-- IF ignoredForChat:postcount -->
               <div title="post count" class="post-count">
                  <i class="fa fa-pencil"></i>
                  <span class="formatted-number">{ignoredForChat.postcount}</span>
               </div>
             -->
               <button href="#" class="btn btn-sm btn-success unignoreForChat">[[ignored:chat.unignore_user]]</button>
               <!-- ENDIF ignoredForChat:postcount -->
            </div>
         </li>
         <!-- END ignoredForChat -->
          <div id="no-ignored-for-chat-notice" class="alert alert-success <!-- IF ignoreChatCount -->hide<!-- ENDIF ignoreChatCount -->">[[ignored:chat.ignored_no_one]]</div>
         </ul>
      </div>
  </div>
<input type="hidden" template-variable="yourid" value="{yourid}" />
<input type="hidden" template-variable="theirid" value="{theirid}" />
<input type="hidden" template-variable="ignoredCount" value="{ignoredCount}" />
<input type="hidden" template-variable="ignoredCountChat" value="{ignoreChatCount}" />
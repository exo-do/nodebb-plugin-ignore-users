<!-- IMPORT partials/account_menu.tpl -->

<div class="users account ignored-users">
	
	<div class="panel panel-default">
		<div class="panel-heading"><h3 class="panel-title">[[ignored:ignored_list]]</h3></div>
		
		<!-- BEGIN ignored -->
		<div class="panel-body users-box" data-uid="{ignored.uid}" data-username="{ignored.username}">
			<a href="{relative_path}/user/{ignored.userslug}"><img src="{ignored.picture}" class="img-thumbnail"/></a>
			<div class="user-info">
				<a href="{relative_path}/user/{ignored.userslug}">{ignored.username}</a>
				<div title="reputation" class="reputation">
					<span class='formatted-number'>{ignored.reputation}</span>
					<i class='fa fa-star'></i>
				</div>
				<div title="post count" class="post-count">
					<span class='formatted-number'>{ignored.postcount}</span>
					<i class='fa fa-pencil'></i>
				</div>
				<button href="#" class="btn btn-success btn-xs unignore">[[ignored:unignore]]</button>
			</div>
		</div>

		<!-- END ignored -->
	</div>
	<div id="no-ignored-notice" class="alert alert-success <!-- IF ignoredCount -->hide<!-- ENDIF ignoredCount -->">[[ignored:ignored_no_one]]</div>
</div>

<input type="hidden" template-variable="yourid" value="{yourid}" />
<input type="hidden" template-variable="theirid" value="{theirid}" />
<input type="hidden" template-variable="ignoredCount" value="{ignoredCount}" />

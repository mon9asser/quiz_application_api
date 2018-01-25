$(document).ready(function() {
	"use strict"

	var application = {
		reg_usr: {
			is_creator: 0,
			name: null,
			email: null,
			password: null
		}
	};
	// ==============================================================
	/* --------------------- Register New User ------------------- */
	// ==============================================================
	$(
		'input.signup , input.login , select.signup'
	).on('change , keyup', function() {
		// => Rset Error Message
		$(this).css({
			"border-color": "#ccc"
		});
		$(".error_mesage").css({display:'none'});
		$(this).prev('.error-message').html(
			'');
		$(this).parent().parent().prev(
			'.error-msg-response').html('');
		// ==> Fill Target Values
		var targetElemen = $(this).attr(
			'name');
		switch (targetElemen) {
			case 'name':
				application.reg_usr.name = $(
					this).val();
				break;
			case 'access_type.is_creator':
				application.reg_usr.is_creator =
					$(this).val();
				break;
			case 'email':
				application.reg_usr.email = $(
					this).val();
				break;
			case 'password':
				application.reg_usr.password =
					$(this).val();
				break;
		}
	});
	// == -----------------------------------------------------------------
	// == --------------------------> Register part
	// == -----------------------------------------------------------------
	$('#signup_user').on('click',
		function(e) {

			var user = application.reg_usr ;
			var userArgs = new Array();


			if(user.email == null)
			userArgs[userArgs.length] = 'email' ;
			if(user.name == null)
			userArgs[userArgs.length] = 'name';
			if(user.password == null)
			userArgs[userArgs.length] = 'password';


			if(userArgs.length != 0 ){
				for (var i = 0; i < userArgs.length; i++) {
					var field = userArgs[i] ;
					$('input[name="' + field + '"]'
				).prev('.error-message').html("Required !");
					$('input[name="' + field + '"]'
					).css({
						border: '1px solid red'
					});
				}
				return false;
			}

			$.getJSON("ext/js/json.app.keys.json", function(api_key_data) {
				$.ajax({
					type: 'post',
					data: application.reg_usr,
					url: "/api/users/create",
					headers: {
						"X-api-keys": api_key_data.API_KEY,
						"X-api-app-name": api_key_data.APP_NAME
					},
					success: function(res) {
						if(res.Message){
							$(".error_mesage > ul > li").html(res.Message);
							$(".error_mesage").css({display:'block'});
							return false ;
						}
						if(res.redirectTo == true )
						window.location.href = "/" ;
					},
					error: function(err) {

						if (err.responseJSON.errors.email) {
							$('input[name="' + err.responseJSON
								.errors.email.path + '"]'
							).prev('.error-message').html(
								err.responseJSON.errors.email
								.message);
							$('input[name="' + err.responseJSON
								.errors.email.path + '"]'
							).css({
								border: '1px solid red'
							});
						}
						console.log(err);
						if (err.responseJSON.errors.name) {
							$('input[name="' + err.responseJSON
									.errors.name.path + '"]')
								.prev('.error-message').html(
									err.responseJSON.errors.name
									.message);
							$('input[name="' + err.responseJSON
									.errors.name.path + '"]')
								.css({
									border: '1px solid red'
								});
						}
						console.log(err.responseJSON
							.errors);
						if (err.responseJSON.errors.password) {
							$('input[name="' + err.responseJSON
								.errors.password.path +
								'"]').prev(
								'.error-message').html(
								err.responseJSON.errors.password
								.message);
							$('input[name="' + err.responseJSON
								.errors.password.path +
								'"]').css({
							headers: {
						"X-api-keys": api_key_data.API_KEY,
						"X-api-app-name": api_key_data.APP_NAME
					},	border: '1px solid red'
							});
						}
					}
				});
				return false;
			});
		});
	// == -----------------------------------------------------------------
	// == --------------------------> Login part
	// == -----------------------------------------------------------------
	$('#login_user').on('click',
		function(e) {
			$.getJSON("ext/js/json.app.keys.json", function(api_key_data) {
			if (application.reg_usr.email ==
				null) {
				$("input[name='email']").css({
					border: "1px solid tomato"
				});
			}
			if (application.reg_usr.password ==
				null) {
				$("input[name='password']").css({
					border: "1px solid tomato"
				});
			}
			if (application.reg_usr.password ==
				null && application.reg_usr.email ==
				null) {
				return false;
			}
			$.ajax({
				type: 'post',
				data: {
					email: application.reg_usr.email,
					password: application.reg_usr
						.password
				},
				headers: {
					"X-api-keys": api_key_data.API_KEY,
					"X-api-app-name": api_key_data.APP_NAME
				},
				url: "/api/users/login",
				success: function(responsedData) {
					 if(responsedData.isRedirect != null && responsedData.isRedirect == true )
					 window.location.href = "/";
					 else
					 window.location.href = "/login";

				},
				error: function(err) {
					try {
						if (err) {
							if (err.responseJSON.errorMSG) {
								$('.error-msg-response').html(
									err.responseJSON.errorMSG
								);
							}
						}
					}
					catch (err) {
						console.log(err);
					}
				}
			});
			e.preventDefault();
		});
	});
});

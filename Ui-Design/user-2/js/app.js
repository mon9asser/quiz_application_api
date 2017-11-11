$(document).ready(function(){


	// Collapse the navigation of question option
	$('.edit-question-tag').on('click',function(){
		// Opening the editor !
			 var targetCollapse = $(this).parent('.actions').parent('.collapse-option')
			 				.parent('.drop-zone-caption').next('.question-edit');
 				//alert(targetCollapse.prop('tagName') );
			 targetCollapse.addClass('transition').css({
					 'height': 'auto',
				   'margin-top': '10px',
				   'border-top': '1px solid #eee' ,
				   'padding': '10px',
				   'background': '#fff'
			 });
	});
	// Closing the editor !
	$('.close-iconix').on('click' , function(){
		var targetCollapse = $(this).parent('.question-edit');
		targetCollapse.removeClass('transition').css({
			'background': 'yellow' ,
			'padding': '0px',
			'height': '0px',
			'border-width': '0px',
			'margin-top': '0px',
		})
	});



	$('.control-panel-toggle').on('click', function() {
		var self = $(this);
		if (self.hasClass('open')) {
			self.removeClass('open');
			$('.control-panel').removeClass('open');
		} else {
			self.addClass('open');
			$('.control-panel').addClass('open');
		}
	});

/* ==========================================================================
	Scroll
	========================================================================== */

	if (!("ontouchstart" in document.documentElement)) {

		document.documentElement.className += " no-touch";

		var jScrollOptions = {
			autoReinitialise: true,
			autoReinitialiseDelay: 100
		};

		$('.scrollable .box-typical-body').jScrollPane(jScrollOptions);
		$('.side-menu').jScrollPane(jScrollOptions);
		$('.side-menu-addl').jScrollPane(jScrollOptions);
		$('.scrollable-block').jScrollPane(jScrollOptions);
	}


	// Left mobile menu
	$('.hamburger').click(function(){
		if ($('body').hasClass('menu-left-opened')) {
			$(this).removeClass('is-active');
			$('body').removeClass('menu-left-opened');
			$('html').css('overflow','auto');
		} else {
			$(this).addClass('is-active');
			$('body').addClass('menu-left-opened');
			$('html').css('overflow','hidden');
		}
	});

	$('.mobile-menu-left-overlay').click(function(){
		$('.hamburger').removeClass('is-active');
		$('body').removeClass('menu-left-opened');
		$('html').css('overflow','auto');
	});

	// Right mobile menu
	$('.site-header .burger-right').click(function(){
		if ($('body').hasClass('menu-right-opened')) {
			$('body').removeClass('menu-right-opened');
			$('html').css('overflow','auto');
		} else {
			$('.hamburger').removeClass('is-active');
			$('body').removeClass('menu-left-opened');
			$('body').addClass('menu-right-opened');
			$('html').css('overflow','hidden');
		}
	});

	$('.mobile-menu-right-overlay').click(function(){
		$('body').removeClass('menu-right-opened');
		$('html').css('overflow','auto');
	});

});

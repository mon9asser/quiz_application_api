$(document).ready(function(){


	/* ==========================================================================
		Side Bar Right
		========================================================================== */

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

		$('.control-item-header .icon-toggle, .control-item-header .text').on('click', function() {
			var content = $(this).closest('li').find('.control-item-content');

			if (content.hasClass('open')) {
				content.removeClass('open');
			} else {
				$('.control-item-content.open').removeClass('open');
				content.addClass('open');
			}
		});

		




});

var scroll_timer;
var scroll_amount = 0;

$(document).ready(function() {
	/* 
	 * Add photosets-div DOMs, 
	 * and associate the id to it using jQuery data() func, 
	 * and set the background color, 
	 * and set the height of the photosets area, 
	 * and add the scroll effect to the sidebar area
	 * 
	 * DOM structure:
	 * 
	 *   div class = "photoset" (data: index, photoset_id, bg)
	 *   |-- div class="photoset-title-div"
	 *     |-- p class="photoset-title"
	 *     |-- p class="photoset-description"
	 *     |-- img class="loading-icon" alt="loading" src="images/loading.gif"
	 *   |-- div class="thumbs-area" (data: is_loaded)
	 * 
	 * The father DOM is div #collections.
	 * 
	 *  */
	var collections_wrapper = $("#collections");
	$.getJSON("/service/photosets", function(data) {
		$.each(data, function(index, node) {
			/* bulid elements */
			var photoset_div = $('<div>', {
				class: 'photoset'
			});
			var the_title_div = $('<div>', {
				class: 'photoset-title-div'
			});
			var p_title = $('<p>', {
				class: 'photoset-title'
			});
			var p_description = $('<p>', {
				class: 'photoset-description'
			});
			var img_loading_icon = $('<img>', {
				class: 'loading-icon', 
				alt: 'loading', 
				src: 'images/loading.gif'
			});
			var thumbs_area_div = $('<div>', {
				class: 'thumbs-area'
			});
			/* set text of title and description */
			p_title.text(node.title);
			p_description.text(node.description);
			/* insert the elements to proper positions */
			p_title.appendTo(the_title_div);
			p_description.appendTo(the_title_div);
			img_loading_icon.appendTo(the_title_div);
			the_title_div.appendTo(photoset_div);
			photoset_div.hide();
			thumbs_area_div.appendTo(photoset_div);
			photoset_div.appendTo(collections_wrapper);
			
			/* attach data */
			photoset_div.data('index', index);
			photoset_div.data('photoset_id', node.id);
			thumbs_area_div.data('is_loaded', false);
			
			/* TODO: add effects to the photoset div */
			photoset_div.slideDown();
		});
		
		/* Pick a color from a color set as the photosets div's bg sequentially,
		 * except the first element */
		var bgs = ['#004299', '#069620', '#B07B00', '#BD0055'];
		$('.photoset-title-div').each(function(index) {
			if (index == 0) { return; }
			var the_bg = bgs[index % (bgs.length)]
			$(this).css('background-color', the_bg);
			/* stores the unactive bg to the element using jquery .data() */
			$(this).data('bg', the_bg);
		});
		
		/* Add class .active to the first photosets title div */
		//$('#collections .photoset-title-div:first').addClass('active');
		activatePhotoset($('#collections .photoset:first'));
		
		/* Set height of sidebar when resize */
		var sidebar = $('#sidebar');
		sidebar.css({ "height": $(window).height() });
		$(window).resize(function(){
			sidebar.css({ "height": $(window).height() });
		});
		
			
		/* Set scroll effect */
		sidebar.mouseenter(function(e) {
			// set on the timer
			scroll_timer = setInterval(scroll_timer_func, 30);
		});
		sidebar.mouseleave(function(e) {
			// set off the timer
			clearInterval(scroll_timer);
		});
		sidebar.mousemove(function(e) {
			my_debug(1, "(" + e.pageX + ", " + e.pageY + ")");
			my_debug(2, "window.height: " + $(window).height());
			my_debug(3, "document.height: " + $(document).height());
			
			var delta = e.pageY - Math.floor($(window).height() / 2);
			var rate = 0.07;
			scroll_amount = Math.floor(delta * rate);
			
			my_debug(4, "scroll_amount: " + scroll_amount);
		});
	});
	
	/* 
	 * To those unactive photosets div,
	 * add fade in/out effect when mouse hovering.
	 * 
	 * Using delegation so that the events can
	 * also apply to dynamically created elements
	 * 
	 *  */
	$('#collections').on('mouseenter', '.photoset-title-div:not(.active)', function(event) {
		$(this).fadeTo('fast', 1.0);
	});
	$('#collections').on('mouseleave', '.photoset-title-div:not(.active)', function(event) {
		$(this).fadeTo('fast', 0.5);
	});
	
	/* The small thumbnail's fade in/out effect when mouse hovering */
	$('#collections').on('mouseenter', '.thumb-small', function(event) {
		$(this).fadeTo('fast', 1.0);
	});
	$('#collections').on('mouseleave', '.thumb-small', function(event) {
		$(this).fadeTo('fast', 0.5);
	});
	
	/* The small thumbnail's click event */
	$('#collections').on('click', '.thumb-small', function(event) {
		displayPhoto($(this).data('photo_id'));
	});
	
	/* And active/deactive to the photoset title */
	$('#collections').on('click', '.photoset-title-div:not(.active)', function(event) {
		//first deactivate then activate
		deactivatePhotoset($('.photoset-title-div.active').parent(), 
			activatePhotoset($(this).parent()));	
	});
	
});

function scroll_timer_func() {
	/* up scrolling */
	if( (scroll_amount > 0) && 
		($('#collections').height() + $('#collections').position().top > $(window).height()) ) {
			
		$('#collections').animate({top:'-=' + scroll_amount}, 0);
		my_debug(5, "going up, " + ($('#collections').height() + $('#collections').position().top) + ">" + $(window).height());
		
	/* down scrolling */
	} else if ( (scroll_amount < 0) && ($('#collections').position().top < 0) ) {
		my_debug(5, "going down");
		$('#collections').animate({top:'-=' + scroll_amount}, 0);
		
	}
	
	/* adjust the top of the collections to 0 if top > 0 */
	if($('#collections').position().top > 0) {
		$('#collections').animate({top: 0}, 50);
	}
}

function my_debug(index, msg) {
	$('#debug' + index).text(msg);
}

function displayPhoto(photo_id) {
	var display_img = $('#display-img');
	var display_img_div = $('#display-img-div');
	var display_text_div = $('#display-text-div');
	var loading_bar = $('#loading-bar');
	
	// load image data based on photo_id
	$.getJSON('/service/photo?photo_id=' + photo_id, function(data) {
		display_img.attr('src', data.url_z);
		$('#display-title').text(data.title);
		$('#display-description').text(data.description);
	});
	
	// after the img is loaded, hide the loading bar, show photo and text
	display_img.bind("load", function() {
		display_img.hide();
		display_img.fadeIn('1000');
		display_text_div.hide();
		display_text_div.fadeIn('1000');
		loading_bar.hide();
	});
	
	// show the loading bar
	loading_bar.show();
	loading_bar.animate({
		top: (display_img_div.height() - loading_bar.height())/2, 
		left: (display_img_div.width() - loading_bar.width())/2
	}, 0);
	
}


/*
 * Activate a photoset div. Things to be done:
 * 
 * 1. AT LAST, clear the 'style' attribute of the div
 * 2. Add class .active to the photoset div.
 * 3. Add all the thumbs' DOMs to the following .thumbs-area div,
 *    if they have not being added.
 * 4. Zoom out the .thumbs-area with animation.
 * 
 * 
 * Arguments:
 * The div is a jquery's DOM wrapper, 
 * which is pointing to a .photoset element
 * 
 * */
function activatePhotoset(div) {
	var photoset_title_div = div.find('.photoset-title-div');
	
	/* clear the 'style' attribute */
	photoset_title_div.attr('style', '');
	/* add class .active */
	photoset_title_div.addClass('active');
	
	/* load DOMs if haven't done yet */
	var the_thumbs_area = div.find('.thumbs-area');
	if (the_thumbs_area.data('is_loaded') != true) {
		/* fade the photoset-title-div to dark,
		 * show the loading img, 
		 * until all the DOMs loaded */
		photoset_title_div.fadeTo(100, 0.3);
		photoset_title_div.find('.loading-icon').show();
		
		
		/* build imgs, add DOMs, with effects */
		var the_photoset_id = div.data('photoset_id');
		$.getJSON('/service/photos_in_set?set_id=' + the_photoset_id, function(data) {
			//alert("JSON loaded");
			$.each(data, function(index, node) {
				//alert('going to build an <img>, id: ' + node.id);
				var the_img = $('<img>', {
					class: 'thumb-small', 
					src: node.url_sq, 
					style: 'display: inline;', 
					alt: node.title
				});
				the_img.data('photo_id', node.id);
				the_img.hide(); // hide fot the coming animation
				the_img.appendTo(the_thumbs_area);
				// show the img with fade-in effect when loaded
				the_img.bind("load", function() { 
					$(this).fadeIn('slow').css('display', 'inline');
				});
				
				/* remove the darkness of photoset-title-div, 
				 * hide the loading icon */
				photoset_title_div.fadeTo(100, 1.0);
				photoset_title_div.find('.loading-icon').hide();
			});
		});
		
		/* Till now the imgs are already loaded */
		the_thumbs_area.data('is_loaded', true);
		
	} else {
		/* just slide down the thumbs-area */
		the_thumbs_area.slideDown(300);
	}
	
}

/* 
 * Deactivate a photoset div. Things to be done:
 * 
 * 1. Remove the class 'active' from the photoset-title-div
 * 2. Set the bg of the photoset-title-div
 * 3. slide up the thumbs area, and check if over-up-scrolled
 * 
 * Arguments:
 * The div is a jquery's DOM wrapper, 
 * which is pointing to a .photoset element
 * 
 *  */
function deactivatePhotoset(div) {
	var photoset_title_div = div.find('.photoset-title-div');
	var thumbs_area = div.find('.thumbs-area');
	
	photoset_title_div.removeClass('active');
	photoset_title_div.css('background-color', photoset_title_div.data('bg'));
	
	thumbs_area.slideUp(300, function() {
		/* Set collections' proper top position if over-up-scrolled */
		if ( $('#collections').height() + $('#collections').position().top < $(window).height()) {
			if($(window).height() - $('#collections').height() <= 0) {
				$('#collections').animate({top: (($(window).height() - $('#collections').height())) }, 'fast');
			} else {
				$('#collections').animate({top: 0 }, 'fast');
			}
		}
	});
}


$(document).ready(function() {
	/* 
	 * Add photosets-div DOMs, 
	 * and associate the id to it using jQuery data() func, 
	 * and set the background color.
	 * 
	 * DOM structure:
	 * 
	 *   div class = "photoset" (data: index, photoset_id, bg)
	 *   |-- div class="photoset-title-div"
	 *     |-- p class="photoset-title"
	 *     |-- p class="photoset-description"
	 *   |-- div class="thumbs-area" (data: is_loaded)
	 * 
	 * The father DOM is div #collections.
	 * 
	 *  */
	var collections_wrapper = $("#collections");
	$.getJSON("/service/photosets", function(data) {
		$.each(data, function(index, node) {
			/* bulid elements */
			var photoset_div = $('<div>', 
							{
								class: 'photoset'
							});
			var the_title_div = $('<div>', 
							{
								class: 'photoset-title-div'
							});
			var p_title = $('<p>', 
							{
								class: 'photoset-title'
							});
			var p_description = $('<p>', 
							{
								class: 'photoset-description'
							});
			var thumbs_area_div = $('<div>', 
							{
								class: 'thumbs-area'
							});
			/* set text of title and description */
			p_title.text(node.title);
			p_description.text(node.description);
			/* insert the elements to proper positions */
			p_title.appendTo(the_title_div);
			p_description.appendTo(the_title_div);
			the_title_div.appendTo(photoset_div);
			photoset_div.hide();
			thumbs_area_div.appendTo(photoset_div);
			photoset_div.appendTo(collections_wrapper);
			
			/* attach data */
			photoset_div.data('index', index);
			photoset_div.data('photoset_id', node.id);
			thumbs_area_div.data('is_loaded', false);
			thumbs_area_div.data('test', 7); //debug
			
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
	
	/* And active/deactive to the photoset title */
	$('#collections').on('click', '.photoset-title-div:not(.active)', function(event) {
		//first deactivate then activate
		deactivatePhotoset($('.photoset-title-div.active').parent(), 
			activatePhotoset($(this).parent()));	
	});
	
});

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
	/* clear the 'style' attribute */
	div.find('.photoset-title-div').attr('style', '');
	
	/* add class .active */
	div.find('.photoset-title-div').addClass('active');
	
	/* load DOMs if haven't done yet */
	var the_thumbs_area = div.find('.thumbs-area');
	if (the_thumbs_area.data('is_loaded') != true) {
		//alert('not loaded yet')
		/* build imgs, add DOMs, with effects */
		var the_photoset_id = div.data('photoset_id');
		//alert("the photoset id: " + the_photoset_id);
		$.getJSON('/service/photos_in_set?set_id=' + the_photoset_id, function(data) {
			//alert("JSON loaded");
			$.each(data, function(index, node) {
				//alert('going to build an <img>, id: ' + node.id);
				var the_img = $('<img>', 
					{
						class: 'thumb-small', 
						src: node.url_sq, 
						alt: node.title
					});
				the_img.data('photo_id', node.id);
				the_img.hide(); // hide fot the coming animation
				the_img.appendTo(the_thumbs_area);
				the_img.fadeIn('slow');
			});
		});
		
		/* Till now the imgs are already loaded */
		the_thumbs_area.data('is_loaded', true);
		
	} else {
		/* just slide down the thumbs-area */
		the_thumbs_area.slideDown(300);
	}
	
	/*  */
}

/* 
 * Deactivate a photoset div. Things to be done:
 * 
 * 1. Remove the class 'active' from the photoset-title-div
 * 2. Set the bg of the photoset-title-div
 * 3. slide up the thumbs area
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
	
	thumbs_area.slideUp(300);
}

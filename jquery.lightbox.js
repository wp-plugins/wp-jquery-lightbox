/**
 * WP jQuery Lightbox
 * Version 1.3.2 - 2011-05-17
 * @author Ulf Benjaminsson (http://www.ulfben.com)
 *
 * This is a modified version of Warren Krevenkis Lightbox-port (see notice below) for use in the WP jQuery Lightbox-
 * plugin (http://wordpress.org/extend/plugins/wp-jquery-lightbox/)
 *  Modifications include:
 *	. improved the resizing code to respect aspect ratio
 *	. improved scaling routines to maximize images while taking captions into account
 *  . added support for browser resizing and orientation changes
 *	. grabs image caption from WordPress [gallery] or media library output
 *	. using WordPress API to localize script (with safe fallbacks)
 *	. grabs image title if the link lacks one
 *	. using rel attribute instead of class
 *	. auto-lightboxing all links after page load
 *	. replaced explicit IMG-urls with divs, styled through the CSS.
 *	. honors empty captions / titles
 *	. use only title if captions is identical
 *  . added support for disabling all animations
 *	. using no-conflict mode (for good measure)
 **/
/**
 * jQuery Lightbox
 * Version 0.5 - 11/29/2007
 * @author Warren Krewenki
 *
 * This package is distributed under the BSD license.
 * For full license information, see LICENSE.TXT
 *
 * Based on Lightbox 2 by Lokesh Dhakar (http://www.huddletogether.com/projects/lightbox2/)
 * Originally written to make use of the Prototype framework, and Script.acalo.us, now altered to use jQuery.
 **/
(function(jQuery){
	jQuery.fn.lightbox = function(options){
		// build main options
		var opts = jQuery.extend({}, jQuery.fn.lightbox.defaults, options);        
		return jQuery(this).live("click", function(){
    		    initialize();
				start(this);
				return false;
		});
		
	    /**
	     * initalize()
	     *
	     * @return void
	     * @author Warren Krewenki
	     */
	     
	    function initialize() {
			jQuery(window).bind('orientationchange', resizeListener);
			jQuery(window).bind('resize', resizeListener);		
			/*if(opts.followScroll){
				jQuery(window).bind('scroll', orientListener);	
			}*/
		    jQuery('#overlay').remove();
		    jQuery('#lightbox').remove();
		    opts.inprogress = false;
		    
		    // if jsonData, build the imageArray from data provided in JSON format
            if(opts.jsonData && opts.jsonData.length > 0) {
                var parser = opts.jsonDataParser ? opts.jsonDataParser : jQuery.fn.lightbox.parseJsonData;                
                opts.imageArray = [];
                opts.imageArray = parser(opts.jsonData);
	        }
		    
		    var outerImage = '<div id="outerImageContainer"><div id="imageContainer"><iframe id="lightboxIframe" /><img id="lightboxImage"><div id="hoverNav"><a href="javascript://" title="' + opts.strings.prevLinkTitle + '" id="prevLink"></a><a href="javascript://" id="nextLink" title="' + opts.strings.nextLinkTitle + '"></a></div><div id="loading"><a href="javascript://" id="loadingLink"><div id="jqlb_loading"></div></a></div></div></div>';
		    var imageData = '<div id="imageDataContainer" class="clearfix"><div id="imageData"><div id="imageDetails"><span id="caption"></span><span id="numberDisplay"></span></div><div id="bottomNav">';
		    if (opts.displayHelp){
			    imageData += '<span id="helpDisplay">' + opts.strings.help + '</span>';
			}
		    imageData += '<a href="javascript://" id="bottomNavClose" title="' + opts.strings.closeTitle + '"><div id="jqlb_closelabel"></div></a></div></div></div>';
		    var string;
		    if (opts.navbarOnTop) {
		      string = '<div id="overlay"></div><div id="lightbox">' + imageData + outerImage + '</div>';
		      jQuery("body").append(string);
		      jQuery("#imageDataContainer").addClass('ontop');
		    } else {
		      string = '<div id="overlay"></div><div id="lightbox">' + outerImage + imageData + '</div>';
		      jQuery("body").append(string);
		    }
		    jQuery("#overlay").click(function(){ end(); }).hide();
		    jQuery("#lightbox").click(function(){ end();}).hide();
		    jQuery("#loadingLink").click(function(){ end(); return false;});
		    jQuery("#bottomNavClose").click(function(){ end(); return false; });
		    jQuery('#outerImageContainer').width(opts.widthCurrent).height(opts.heightCurrent);
		    jQuery('#imageDataContainer').width(opts.widthCurrent);		
		    if (!opts.imageClickClose) {
        		jQuery("#lightboxImage").click(function(){ return false; });
        		jQuery("#hoverNav").click(function(){ return false; });
		    }
	    };
	    //allow image to reposition & scale if orientation change or resize occurs.
		function resizeListener(e){		
			if(opts.resizeTimeout){
				clearTimeout(opts.resizeTimeout);
				opts.resizeTimeout = false;
			}			
			opts.resizeTimeout = setTimeout(function(){doScale(false);}, 15); //avoid duplicate event calls.		
		}					
	    function getPageSize() {
		    return new Array(jQuery(document).width(),jQuery(document).height(), jQuery(window).width(), jQuery(window).height());
	    };
	    
	    function getPageScroll() {
		    var xScroll, yScroll;
		    if (self.pageYOffset) {
			    yScroll = self.pageYOffset;
			    xScroll = self.pageXOffset;
		    } else if (document.documentElement && document.documentElement.scrollTop){  // Explorer 6 Strict
			    yScroll = document.documentElement.scrollTop;
			    xScroll = document.documentElement.scrollLeft;
		    } else if (document.body) {// all other Explorers
			    yScroll = document.body.scrollTop;
			    xScroll = document.body.scrollLeft;
		    }
		    return new Array(xScroll,yScroll);
	    };
				
	    function start(imageLink) {
		    jQuery("select, embed, object").hide();
		    var arrayPageSize = getPageSize();
		    jQuery("#overlay").hide().css({width: arrayPageSize[0]+"px", height: arrayPageSize[1]+'px', opacity : opts.overlayOpacity}).fadeIn(400);		
			imageNum = 0;
		    // if data is not provided by jsonData parameter
            if(!opts.jsonData) {
                opts.imageArray = [];				
		        // if image is NOT part of a set..				
		        if (!imageLink.rel || (imageLink.rel == '')) {
			        // add single image to Lightbox.imageArray
					var s = '';
					if(imageLink.title){
						s = imageLink.title;
					}else if(jQuery(this).children(':first-child').attr('title')){
						s = jQuery(this).children(':first-child').attr('title');
					}														
			        opts.imageArray.push(new Array(imageLink.href, opts.displayTitle ? s : ''));
		        } else {								
		        // if image is part of a set..
			        jQuery("a").each(function(){
				        if(this.href && (this.rel == imageLink.rel)){
							var title = '';
							var caption = '';
							var captionText = '';
							var jqThis = jQuery(this);
							if(this.title){
								title = this.title;
							}else if(jqThis.children('img:first-child').attr('title')){
								title = jqThis.children('img:first-child').attr('title');//grab the title from the image if the link lacks one
							}							
							if(jqThis.parent().next('.gallery-caption').html()){															
								var jq = jqThis.parent().next('.gallery-caption');
								caption = jq.html();
								captionText = jq.text();
							}else if(jqThis.next('.wp-caption-text').html()){								
								caption = jqThis.next('.wp-caption-text').html();				
								captionText = jqThis.next('.wp-caption-text').text();				
							}
							title = jQuery.trim(title);
							captionText = jQuery.trim(captionText);
							if(title.toLowerCase() == captionText.toLowerCase()){
								title = caption;//to keep linked captions
								caption = ''; //but not duplicate the text								
							}						
							var s = '';
							if(title != '' && caption != ''){
								s = title+'<br />'+caption;
							}else if(title != ''){
								s = title;
							}else if(caption != ''){
								s = caption;
							}						
					        opts.imageArray.push(new Array(this.href, opts.displayTitle ? s : ''));							
				        }
			        });
		        }
		    }		
		    if(opts.imageArray.length > 1) {
		        for(i = 0; i < opts.imageArray.length; i++){
				    for(j = opts.imageArray.length-1; j>i; j--){
					    if(opts.imageArray[i][0] == opts.imageArray[j][0]){
						   opts.imageArray.splice(j,1); 
					    }
				    }
			    }
			    while(opts.imageArray[imageNum][0] != imageLink.href) { imageNum++;}
		    }
		    // calculate top and left offset for the lightbox
		    var arrayPageScroll = getPageScroll();
			
		    setLightBoxPos(arrayPageScroll[1], arrayPageScroll[0]).show();
		    changeImage(imageNum);
	    };
	    				
	    function changeImage(imageNum) {
		    if(opts.inprogress == false){
			    opts.inprogress = true;
			    opts.activeImage = imageNum;			
			    // hide elements during transition
			    jQuery('#loading').show();
			    jQuery('#lightboxImage').hide();
			    jQuery('#hoverNav').hide();
			    jQuery('#prevLink').hide();
			    jQuery('#nextLink').hide();
			   // jQuery('#imageDataContainer').hide(); 
			   //jQuery('#imageData').hide();
				doChangeImage();
		   }
	    };
	    
	    function doChangeImage() {		
		    opts.imgPreloader = new Image();		  
			opts.imgPreloader.onload=function(){		
				preloadNeighborImages();
				jQuery('#lightboxImage').attr('src', opts.imageArray[opts.activeImage][0]);
				doScale();  // once image is preloaded, resize image container
			};			
		    opts.imgPreloader.src = opts.imageArray[opts.activeImage][0];
	    };
	    
		function doScale(animate){
			if(!opts.imgPreloader){
				return;
			}
			if(animate == undefined){animate = opts.animate;}
			var newWidth = opts.imgPreloader.width;
			var newHeight = opts.imgPreloader.height;
			var arrayPageSize = getPageSize();	
			updateDetails(); //order of calls is important! initializes height of imageDataContainer			
			var maxWidth = arrayPageSize[2] - 2*opts.borderSize;
			var maxHeight = arrayPageSize[3] - (jQuery("#imageDataContainer").height()+(2*opts.borderSize));		  
			if(opts.fitToScreen) {		            
				var ratio = 1;					
				if(newHeight > maxHeight){					
					ratio = maxHeight/newHeight; //ex. 600/1024 = 0.58					
				}				
				newWidth = newWidth*ratio;		
				newHeight = newHeight*ratio;
				ratio = 1;
				if(newWidth > maxWidth){					
					ratio = maxWidth/newWidth; //ex. 800/1280 == 0.62					
				}
				newWidth = parseInt(newWidth*ratio);		
				newHeight = parseInt(newHeight*ratio);									
			}				
			var arrayPageScroll = getPageScroll();
			var centerY = arrayPageScroll[1]+(maxHeight*0.5);
			var newTop = centerY - newHeight*0.5;			
			jQuery('#lightboxImage').width(newWidth).height(newHeight);
			resizeImageContainer(newWidth, newHeight, newTop, animate);			
		}
		
		function resizeImageContainer(imgWidth, imgHeight, lightboxTop, animate) {
		    if(animate == undefined){animate = opts.animate;}
			opts.widthCurrent = jQuery("#outerImageContainer").outerWidth();
		    opts.heightCurrent = jQuery("#outerImageContainer").outerHeight();
		    var widthNew = Math.max(350, imgWidth  + (opts.borderSize * 2));
		    var heightNew = (imgHeight  + (opts.borderSize * 2));
		    // scalars based on change from old to new
		    opts.xScale = (widthNew / opts.widthCurrent) * 100;
		    opts.yScale = (heightNew / opts.heightCurrent) * 100;
		    // calculate size difference between new and old image, and resize only if necessary
		    wDiff = opts.widthCurrent - widthNew;
		    hDiff = opts.heightCurrent - heightNew;			
			setLightBoxPos(lightboxTop, null, animate);
			if(animate && (hDiff != 0 && wDiff != 0)){ 
				jQuery('#imageDataContainer').animate({width: widthNew},opts.resizeSpeed,'linear');
				jQuery('#outerImageContainer').animate({width: widthNew},opts.resizeSpeed,'linear',function(){					
					jQuery('#outerImageContainer').animate({height: heightNew},opts.resizeSpeed,'linear',function(){
						showImage();
					});
				});
			} else {				
				jQuery('#imageDataContainer').width(widthNew);
				jQuery('#outerImageContainer').width(widthNew);
			    jQuery('#outerImageContainer').height(heightNew);
				showImage();
			}
		    jQuery('#prevLink').height(imgHeight);
		    jQuery('#nextLink').height(imgHeight);
	    };
	    
		function setLightBoxPos(top, left, animate){
			if(animate == undefined){animate = opts.animate;}
			if(left == undefined || left == null){
				var arrayPageScroll = getPageScroll();
				left = arrayPageScroll[0];
			}
			if(animate){
				 jQuery('#lightbox').animate({top: top}, 250,'linear');
				 return jQuery('#lightbox').animate({left: left}, 250,'linear');
			}
		    return jQuery('#lightbox').css({top: top+'px', left: left+'px'});
		}
		
	    function end() {
		    disableKeyboardNav();
		    jQuery('#lightbox').hide();
		    jQuery('#overlay').fadeOut();
		    jQuery('select, object, embed').show();
	    };
	    
	    function preloadNeighborImages(){
		    if(opts.loopImages && opts.imageArray.length > 1) {
	            preloadNextImage = new Image();
	            preloadNextImage.src = opts.imageArray[(opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1][0]      
	            preloadPrevImage = new Image();
	            preloadPrevImage.src = opts.imageArray[(opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1][0]
	        } else {
		        if((opts.imageArray.length - 1) > opts.activeImage){
			        preloadNextImage = new Image();
			        preloadNextImage.src = opts.imageArray[opts.activeImage + 1][0];
		        }
		        if(opts.activeImage > 0){
			        preloadPrevImage = new Image();
			        preloadPrevImage.src = opts.imageArray[opts.activeImage - 1][0];
		        }
	        }
	    };
	    		
	    function showImage() {	
			//assumes updateDetails have been called earlier!
			jQuery("#imageData").show();
			jQuery('#caption').show();
			//jQuery('#imageDataContainer').slideDown(400);
			//jQuery("#imageDetails").hide().fadeIn(400);		
		    jQuery('#loading').hide();
			if(opts.animate){
				jQuery('#lightboxImage').fadeIn("fast");		
			}else{
				jQuery('#lightboxImage').show();
			}		    		    		
		    opts.inprogress = false;
			var arrayPageSize = getPageSize();
		    jQuery("#overlay").css({width: arrayPageSize[0]+"px", height: arrayPageSize[1]+'px'});
			updateNav();
	    };
	    
	    function updateDetails() {
		    jQuery('#numberDisplay').html('');					
			jQuery('#caption').html('').hide();			
		    if(opts.imageArray[opts.activeImage][1]){
			    jQuery('#caption').html(opts.imageArray[opts.activeImage][1]).show();
		    }			
		    var nav_html = '';
			var prev = '';
			var pos = (opts.imageArray.length > 1) ? opts.strings.image + (opts.activeImage + 1) + opts.strings.of + opts.imageArray.length : '';
			var link = (opts.displayDownloadLink) ? '<a href="' + opts.imageArray[opts.activeImage][0] + '" id="downloadLink">' + opts.strings.download + '</a>' : '';
			var next = '';
			if(opts.imageArray.length > 1 && !opts.disableNavbarLinks){	 // display previous / next text links   			           
				if((opts.activeImage) > 0 || opts.loopImages) {
					prev = '<a title="' + opts.strings.prevLinkTitle + '" href="#" id="prevLinkText">' + opts.strings.prevLinkText + "</a>";
				}
				if(((opts.activeImage + 1) < opts.imageArray.length) || opts.loopImages) {
					next += '<a title="' + opts.strings.nextLinkTitle + '" href="#" id="nextLinkText">' + opts.strings.nextLinkText + "</a>";
				}							
		    }	
			nav_html = prev + nav_html + pos + link + next;				
			if(nav_html != ''){
				jQuery('#numberDisplay').html(nav_html).show();	
			}
			jQuery("#imageData").show();
			updateNav();
	    };
	    
	    function updateNav() {
		    if(opts.imageArray.length > 1){
			    jQuery('#hoverNav').show();                
                // if loopImages is true, always show next and prev image buttons 
                if(opts.loopImages) {
		            jQuery('#prevLink,#prevLinkText').show().click(function(){
			            changeImage((opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1); return false;
		            });		            
		            jQuery('#nextLink,#nextLinkText').show().click(function(){
			            changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); return false;
		            });		        
		        } else {
			        // if not first image in set, display prev image button
			        if(opts.activeImage != 0){
				        jQuery('#prevLink,#prevLinkText').show().click(function(){
					        changeImage(opts.activeImage - 1); return false;
				        });
			        }
			        // if not last image in set, display next image button
			        if(opts.activeImage != (opts.imageArray.length - 1)){
				        jQuery('#nextLink,#nextLinkText').show().click(function(){
					        changeImage(opts.activeImage +1); return false;
				        });
			        }
                }                
			    enableKeyboardNav();
		    }
	    };
	    
	    function keyboardAction(e) {
            var o = e.data.opts
		    var keycode = e.keyCode;
		    var escapeKey = 27;            
		    var key = String.fromCharCode(keycode).toLowerCase();            
		    if((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)){ // close lightbox
			    end();
		    } else if((key == 'p') || (keycode == 37)){ // display previous image
		        if(o.loopImages) {
		            disableKeyboardNav();
		            changeImage((o.activeImage == 0) ? (o.imageArray.length - 1) : o.activeImage - 1);
		        } 
		        else if(o.activeImage != 0){
				    disableKeyboardNav();
				    changeImage(o.activeImage - 1);
			    }
		    } else if((key == 'n') || (keycode == 39)){ // display next image
		        if (opts.loopImages) {
		            disableKeyboardNav();
		            changeImage((o.activeImage == (o.imageArray.length - 1)) ? 0 : o.activeImage + 1);
		        }
			    else if(o.activeImage != (o.imageArray.length - 1)){
				    disableKeyboardNav();
				    changeImage(o.activeImage + 1);
			    }
		    }
	    };	    
	    function enableKeyboardNav() {
		    jQuery(document).bind('keydown', {opts: opts}, keyboardAction);
	    };
	    function disableKeyboardNav() {
		    jQuery(document).unbind('keydown');
	    };	    
	};
    
    jQuery.fn.lightbox.parseJsonData = function(data) {
        var imageArray = [];        
        jQuery.each(data, function(){
            imageArray.push(new Array(this.url, this.title));
        });        
        return imageArray;
    };
	jQuery.fn.lightbox.defaults = {				
		overlayOpacity : 0.8,
		borderSize : 10,
		imageArray : new Array,
		activeImage : null,
		inprogress : false, //this is an internal state variable. don't touch.
		widthCurrent: 250,
		heightCurrent: 250,
		xScale : 1,
		yScale : 1,
		displayTitle: true,
		navbarOnTop: false,		
		displayHelp: false,
        disableNavbarLinks: true,
        loopImages: true,
        imageClickClose: true,
        jsonData: null,
        jsonDataParser: null,
		followScroll: false
	};	
})(jQuery);

/*
Se till att all initiering sker på ett ställe och att JQLBSettings är optional
Se till Download-länken läggs till även om bilden inte är i ett sett.
*/
jQuery(document).ready(function(){
	if(typeof JQLBSettings == 'object' && JQLBSettings.resizeSpeed){JQLBSettings.resizeSpeed = parseInt(JQLBSettings.resizeSpeed);}
	var default_strings = {
		help: ' \u2190 / P - previous image\u00a0\u00a0\u00a0\u00a0\u2192 / N - next image\u00a0\u00a0\u00a0\u00a0ESC / X - close image gallery',
		prevLinkTitle: 'previous image',
		nextLinkTitle: 'next image',
		prevLinkText:  '&laquo; Previous',
		nextLinkText:  'Next &raquo;',
		closeTitle: 'close image gallery',
		image: 'Image ',
		of: ' of ',
		download: 'Bajs'
	};
	jQuery('a[rel^="lightbox"]').lightbox({
		fitToScreen: (typeof JQLBSettings == 'object' && JQLBSettings.fitToScreen == '1') ? true : false,
		resizeSpeed: (typeof JQLBSettings == 'object' && JQLBSettings.resizeSpeed >= 0) ? JQLBSettings.resizeSpeed : 400,
		animate: (typeof JQLBSettings == 'object' && JQLBSettings.resizeSpeed == 0) ? false : true,
		displayDownloadLink: (typeof JQLBSettings == 'object' && JQLBSettings.displayDownloadLink == '0') ? false : true,
		//followScroll: (typeof JQLBSettings == 'object' && JQLBSettings.followScroll == '0') ? false : true,
		strings: (typeof JQLBSettings == 'object' && typeof JQLBSettings.help == 'string') ? JQLBSettings : default_strings
	});	
});
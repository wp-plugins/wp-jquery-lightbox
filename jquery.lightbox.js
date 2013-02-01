/**
 * WP jQuery Lightbox
 * Version 1.3.4.2 - 2011-02-01
 * @author Ulf Benjaminsson (http://www.ulfben.com)
 *
 * This is a modified version of Warren Krevenkis Lightbox-port (see notice below) for use in the WP jQuery Lightbox-
 * plugin (http://wordpress.org/extend/plugins/wp-jquery-lightbox/)
 *  Modifications include:
 *	. added "support" for WordPress admin bar.
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
 /** toyNN: davidtg@comtrya.com: fixed IE7-8 incompatabilities in 1.3.* branch **/ 
(function($){
    $.fn.lightbox = function(options) {
        var opts = $.extend({}, $.fn.lightbox.defaults, options);
		if($("#overlay").is(':visible')){//to resize the overlay whenever doLightbox is invoked
			$(window).trigger('resize'); //we need this to deal with InfiniteScroll and similar.
		}
		function onClick() {
            initialize();
            start(this);
            return false;
        }	
		if(parseFloat($().jquery) >= 1.7){
			return $(this).on("click", onClick);
        }else{
			return $(this).live("click", onClick); //deprecated since 1.7
		}				
		function initialize() {
            $(window).bind('orientationchange', resizeListener);
            $(window).bind('resize', resizeListener);
            $('#overlay').remove();
            $('#lightbox').remove();
            opts.isIE8 = isIE8(); // //http://www.grayston.net/2011/internet-explorer-v8-and-opacity-issues/
            opts.inprogress = false;
			opts.auto = -1;
            var outerImage = '<div id="outerImageContainer"><div id="imageContainer"><iframe id="lightboxIframe" /><img id="lightboxImage"><div id="hoverNav"><a href="javascript://" title="' + opts.strings.prevLinkTitle + '" id="prevLink"></a><a href="javascript://" id="nextLink" title="' + opts.strings.nextLinkTitle + '"></a></div><div id="jqlb_loading"><a href="javascript://" id="loadingLink"><div id="jqlb_spinner"></div></a></div></div></div>';
            var imageData = '<div id="imageDataContainer" class="clearfix"><div id="imageData"><div id="imageDetails"><span id="caption"></span><span id="numberDisplay"></span></div><div id="bottomNav">';
            if (opts.displayHelp) {
                imageData += '<span id="helpDisplay">' + opts.strings.help + '</span>';
            }
            imageData += '<a href="javascript://" id="bottomNavClose" title="' + opts.strings.closeTitle + '"><div id="jqlb_closelabel"></div></a></div></div></div>';
            var string;
            if (opts.navbarOnTop) {
                string = '<div id="overlay"></div><div id="lightbox">' + imageData + outerImage + '</div>';
                $("body").append(string);
                $("#imageDataContainer").addClass('ontop');
            } else {
                string = '<div id="overlay"></div><div id="lightbox">' + outerImage + imageData + '</div>';
                $("body").append(string);
            }
            $("#overlay").click(function () { end(); }).hide();
            $("#lightbox").click(function () { end(); }).hide();
            $("#loadingLink").click(function () { end(); return false; });
            $("#bottomNavClose").click(function () { end(); return false; });
            $('#outerImageContainer').width(opts.widthCurrent).height(opts.heightCurrent);
            $('#imageDataContainer').width(opts.widthCurrent);
            if (!opts.imageClickClose) {
                $("#lightboxImage").click(function () { return false; });
                $("#hoverNav").click(function () { return false; });
            }
			
			$("#caption").click(function() {
				clearInterval(opts.auto);
				opts.auto = setInterval(function(){console.log("p"); changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1);}, 1000);
				return false;
			});		
			console.log(opts.auto);
        };
		
		
		
        //allow image to reposition & scale if orientation change or resize occurs.
        function resizeListener(e) {
            if (opts.resizeTimeout) {
                clearTimeout(opts.resizeTimeout);
                opts.resizeTimeout = false;
            }
            opts.resizeTimeout = setTimeout(function () { doScale(false); }, 50); //a delay to avoid duplicate event calls.		
        }
        function getPageSize(){           
            var pgDocHeight = $(document).height();
            if (opts.isIE8 && pgDocHeight > 4096) {
                pgDocHeight = 4096;
            }
			var viewportHeight = $(window).height() - opts.adminBarHeight;			
			//$(document).width() returns width of HTML document
            return new Array($(document).width(), pgDocHeight, $(window).width(), viewportHeight, $(document).height());
        };
        //code for IE8 check provided by http://kangax.github.com/cft/
        function isIE8() {
            var isBuggy = false;
            if (document.createElement) {
                var el = document.createElement("div");
                if (el && el.querySelectorAll) {
                    el.innerHTML = "<object><param name=\"\"></object>";
                    isBuggy = el.querySelectorAll("param").length != 1;
                }
                el = null;
            }
            return isBuggy;
        };
        function getPageScroll() {
            var xScroll = 0; var yScroll = 0;
            if (self.pageYOffset) {
                yScroll = self.pageYOffset;
                xScroll = self.pageXOffset;
            } else if (document.documentElement && document.documentElement.scrollTop) {  // Explorer 6 Strict
                yScroll = document.documentElement.scrollTop;
                xScroll = document.documentElement.scrollLeft;
            } else if (document.body) {// all other Explorers
                yScroll = document.body.scrollTop;
                xScroll = document.body.scrollLeft;
            }
			if(opts.adminBarHeight && parseInt($('#wpadminbar').css('top'), 10) === 0){
				yScroll += opts.adminBarHeight;
			}	
            return new Array(xScroll, yScroll);
        };

		function start(imageLink) {
            $("select, embed, object").hide();
            var arrayPageSize = getPageSize();
            var arrayPagePos = getPageScroll();
            var newTop = 0;
            $("#overlay").hide().css({width: arrayPageSize[0] + 'px', height: arrayPageSize[1] + 'px', opacity: opts.overlayOpacity}).fadeIn(400);
            if (opts.isIE8 && arrayPageSize[1] == 4096) {
                if (arrayPagePos[1] >= 1000) {
                    newTop = arrayPagePos[1] - 1000;
                    if ((arrayPageSize[4] - (arrayPagePos[1] + 3096)) < 0) {
                        newTop -= (arrayPagePos[1] + 3096) - arrayPageSize[4];
                    }
                    $("#overlay").css({ top: newTop + 'px' });
                }
            }
            var imageNum = 0;  			
			var images = [];
			opts.downloads = {}; //to keep track of any custom download links
			// if image is NOT part of a set..				
			if (!imageLink.rel || (imageLink.rel == '')) {
				// add single image to Lightbox.imageArray
				//TODO: find out of this *ever* happens
				var s = '';
				var jqImg = $(this).children(':first-child');
				if (imageLink.title) {
					s = imageLink.title;
				} else if (jqImg.attr('title')) {
					s = jqImg.attr('title');
				} else if(jqImg.attr('alt')){
					title = jqImg.attr('alt'); //if neither link nor image have a title attribute
				}
				if(opts.displayDownloadLink || $(imageLink).attr("data-download")){							
					opts.downloads[images.length] = $(imageLink).attr("data-download"); //use length as an index. convenient since it will always be unique							
				}						
				images.push(new Array(imageLink.href, opts.displayTitle ? s : ''));
			} else {
				// if image is part of a set..
				$("a").each(function () {
					if (this.href && (this.rel == imageLink.rel)) {
						var title = '';
						var caption = '';
						var captionText = '';
						var jqThis = $(this);
						var jqImg = jqThis.children('img:first-child');
						if (this.title) { //title of link
							title = this.title;
						} else if (jqImg.attr('title')) {
							title = jqImg.attr('title'); //grab the title from the image if the link lacks one
						} else if(jqImg.attr('alt')){
							title = jqImg.attr('alt'); //if neither link nor image have a title attribute
						}
						if (jqThis.parent().next('.gallery-caption').html()) {
							var jq = jqThis.parent().next('.gallery-caption');
							caption = jq.html();
							captionText = jq.text();
						} else if (jqThis.next('.wp-caption-text').html()) {
							caption = jqThis.next('.wp-caption-text').html();
							captionText = jqThis.next('.wp-caption-text').text();
						}
						title = $.trim(title);
						captionText = $.trim(captionText);
						if (title.toLowerCase() == captionText.toLowerCase()) {
							title = caption; //to keep linked captions
							caption = ''; //but not duplicate the text								
						}
						var s = '';
						if (title != '') {
							s = '<span id="titleText">' + title + '</span>';
						} 
						if (caption != '') {
							if (title != ''){
								s += '<br />';
							} 
							s += '<span id="captionText">' + caption +'</span>';
						}						
						if(opts.displayDownloadLink || jqThis.attr("data-download")){							
							opts.downloads[images.length] = jqThis.attr("data-download"); //use length as an index. convenient since it will always be unique							
						}						
						images.push(new Array(this.href, opts.displayTitle ? s : '', images.length));
					}
				});
			}            
            if (images.length > 1) {
                for (i = 0; i < images.length; i++) {
                    for (j = images.length - 1; j > i; j--) {
                        if (images[i][0] == images[j][0]) {
                            images.splice(j, 1);
                        }
                    }
                }
                while (images[imageNum][0] != imageLink.href) { imageNum++; }
            }
            opts.imageArray = images;
			// calculate top and left offset for the lightbox
            setLightBoxPos(arrayPagePos[1], arrayPagePos[0]).show();
            changeImage(imageNum);
        };
		
		function setLightBoxPos(newTop, newLeft) {        
            if (opts.resizeSpeed > 0) {
                $('#lightbox').animate({ top: newTop }, 250, 'linear');
                return $('#lightbox').animate({ left: newLeft }, 250, 'linear');
            }
            return $('#lightbox').css({ top: newTop + 'px', left: newLeft + 'px' });
        }
		
        function changeImage(imageNum) {
            if (opts.inprogress == false) {
                opts.inprogress = true;
                opts.activeImage = imageNum;
                // hide elements during transition
                $('#jqlb_loading').show();
                $('#lightboxImage').hide();
                $('#hoverNav').hide();
                $('#prevLink').hide();
                $('#nextLink').hide();
                doChangeImage();
            }
        };

        function doChangeImage() {
            opts.imgPreloader = new Image();
            opts.imgPreloader.onload = function () {
                $('#lightboxImage').attr('src', opts.imageArray[opts.activeImage][0]);
                doScale();  // once image is preloaded, resize image container
                preloadNeighborImages();
            };
            opts.imgPreloader.src = opts.imageArray[opts.activeImage][0];
        };

        function doScale() {
            if (!opts.imgPreloader) {
                return;
            }
            var newWidth = opts.imgPreloader.width;
            var newHeight = opts.imgPreloader.height;
            var arrayPageSize = getPageSize();  
			var noScrollWidth = (arrayPageSize[2] < arrayPageSize[0]) ? arrayPageSize[0] : arrayPageSize[2]; //if viewport is smaller than page, use page width.
			$("#overlay").css({ width: noScrollWidth + 'px', height: arrayPageSize[1] + 'px' });  
            var maxHeight = (arrayPageSize[3]) - ($("#imageDataContainer").height() + (2 * opts.borderSize));
            var maxWidth = (arrayPageSize[2]) - (2*opts.borderSize);			
			if (opts.fitToScreen){
				var displayHeight = maxHeight-opts.marginSize;	
				var displayWidth = maxWidth-opts.marginSize;	
                var ratio = 1;
                if (newHeight > displayHeight) {
                    ratio = displayHeight / newHeight; //ex. 600/1024 = 0.58					
                }
                newWidth = newWidth * ratio;
                newHeight = newHeight * ratio;
                ratio = 1;
                if (newWidth > displayWidth) {
                    ratio = displayWidth / newWidth; //ex. 800/1280 == 0.62					
                }
                newWidth = Math.round(newWidth * ratio);
                newHeight = Math.round(newHeight * ratio);
            }        
			var arrayPageScroll = getPageScroll();
			var centerY = arrayPageScroll[1] + (maxHeight * 0.5);
			var newTop = centerY - newHeight * 0.5;
			var newLeft = arrayPageScroll[0];
			$('#lightboxImage').width(newWidth).height(newHeight);
			resizeImageContainer(newWidth, newHeight, newTop, newLeft);           
        }

        function resizeImageContainer(imgWidth, imgHeight, lightboxTop, lightboxLeft) {
            opts.widthCurrent = $("#outerImageContainer").outerWidth();
            opts.heightCurrent = $("#outerImageContainer").outerHeight();
            var widthNew = Math.max(350, imgWidth + (opts.borderSize * 2));
            var heightNew = (imgHeight + (opts.borderSize * 2));
            // scalars based on change from old to new
            opts.xScale = (widthNew / opts.widthCurrent) * 100;
            opts.yScale = (heightNew / opts.heightCurrent) * 100;           
            setLightBoxPos(lightboxTop, lightboxLeft);                   
            updateDetails(); //toyNN: moved updateDetails() here, seems to work fine.    
			$('#imageDataContainer').animate({ width: widthNew }, opts.resizeSpeed, 'linear');
			$('#outerImageContainer').animate({ width: widthNew }, opts.resizeSpeed, 'linear', function () {
				$('#outerImageContainer').animate({ height: heightNew }, opts.resizeSpeed, 'linear', function () {
					showImage();
				});
			});
			updateNav();
            $('#prevLink').height(imgHeight);
            $('#nextLink').height(imgHeight);
        };

        function showImage() {
            //assumes updateDetails have been called earlier!
            $("#imageData").show();
            $('#caption').show();
            //$('#imageDataContainer').slideDown(400);
            //$("#imageDetails").hide().fadeIn(400);		
            $('#jqlb_loading').hide();
            if (opts.resizeSpeed > 0) {
                $('#lightboxImage').fadeIn("fast");
            } else {
                $('#lightboxImage').show();
            }
            opts.inprogress = false;
        };
		
		function preloadNeighborImages() {
            if (opts.imageArray.length > 1) {
                preloadNextImage = new Image();
                preloadNextImage.src = opts.imageArray[(opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1][0]
                preloadPrevImage = new Image();
                preloadPrevImage.src = opts.imageArray[(opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1][0]
            } else {
                if ((opts.imageArray.length - 1) > opts.activeImage) {
                    preloadNextImage = new Image();
                    preloadNextImage.src = opts.imageArray[opts.activeImage + 1][0];
                }
                if (opts.activeImage > 0) {
                    preloadPrevImage = new Image();
                    preloadPrevImage.src = opts.imageArray[opts.activeImage - 1][0];
                }
            }
        };

        function updateDetails() {
            $('#numberDisplay').html('');
            $('#caption').html('').hide();
			var images = opts.imageArray;
			var txt = opts.strings;
			var i = opts.activeImage;
			var downloadIndex = images[i][2];
            if (images[i][1]) {
                $('#caption').html(images[i][1]).show();
            }
            var nav_html = '';           
            var pos = (images.length > 1) ? txt.image + (i + 1) + txt.of + images.length : '';
            var link = '';
			if(opts.displayDownloadLink || opts.downloads[downloadIndex]){
				var url = opts.downloads[downloadIndex] ? opts.downloads[downloadIndex] : images[i][0]; 
				link = (opts.displayDownloadLink) ? '<a href="' + url + '" id="downloadLink" target="'+opts.linkTarget+'">' + txt.download + '</a>' : '';
			}     
            nav_html = nav_html + pos + link;
            if (nav_html != '') {
                $('#numberDisplay').html(nav_html).show();
            }
        };
        function updateNav() {
            if (opts.imageArray.length > 1) {
                $('#hoverNav').show();      
				$('#prevLink').show().click(function () {
					changeImage((opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1); return false;
				});
				$('#nextLink').show().click(function () {
					changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); return false;
				});
				if($.fn.touchwipe){
					$('#imageContainer').touchwipe({
						 wipeLeft: function() { changeImage((opts.activeImage == 0) ? (opts.imageArray.length - 1) : opts.activeImage - 1); },
						 wipeRight: function() { changeImage((opts.activeImage == (opts.imageArray.length - 1)) ? 0 : opts.activeImage + 1); },					
						 min_move_x: 20,				
						 preventDefaultEvents: true
					});
				}
                enableKeyboardNav();
            }
        };
        function end() {
            disableKeyboardNav();
			clearInterval(opts.auto);
            $('#lightbox').hide();
            $('#overlay').fadeOut();
            $('select, object, embed').show();
        };

        function keyboardAction(e) {
            var o = e.data.opts;
            var keycode = e.keyCode;
            var escapeKey = 27;
            var key = String.fromCharCode(keycode).toLowerCase();
            if ((key == 'x') || (key == 'o') || (key == 'c') || (keycode == escapeKey)) { // close lightbox
                end();
            } else if ((key == 'p') || (keycode == 37)) { // display previous image
				disableKeyboardNav();
                changeImage((o.activeImage == 0) ? (o.imageArray.length - 1) : o.activeImage - 1);
            } else if ((key == 'n') || (keycode == 39)) { // display next image
                disableKeyboardNav();
                changeImage((o.activeImage == (o.imageArray.length - 1)) ? 0 : o.activeImage + 1);
            }          
            return false;
        };
        function enableKeyboardNav() {			
			$(document).bind('keydown', {opts: opts}, keyboardAction);
        };
        function disableKeyboardNav() {
            $(document).unbind('keydown');
        };
    };    
    $.fn.lightbox.defaults = {
		adminBarHeight:28,
        overlayOpacity: 0.8,
        borderSize: 10,
        imageArray: new Array,
        activeImage: null,
        inprogress: false, //this is an internal state variable. don't touch.
        widthCurrent: 250,
        heightCurrent: 250,
        xScale: 1,
        yScale: 1,
        displayTitle: true,       
        imageClickClose: true,
        followScroll: false,
        isIE8: false  //toyNN:internal value only
    };	
	$(document).ready(doLightBox);	
})(jQuery);
//you can call this manually at any time to activate the lightboxing. (useful for ajax-loaded content)
function doLightBox(){
	var ua = navigator.userAgent;
	var haveConf = (typeof JQLBSettings == 'object');
	if(haveConf && JQLBSettings.resizeSpeed) {
		JQLBSettings.resizeSpeed = parseInt(JQLBSettings.resizeSpeed);
	}
	if(haveConf && JQLBSettings.marginSize){
		JQLBSettings.marginSize = parseInt(JQLBSettings.marginSize);
	}
	var default_strings = {
		help: ' Browse images with your keyboard: Arrows or P(revious)/N(ext) and X/C/ESC for close.',
		prevLinkTitle: 'previous image',
		nextLinkTitle: 'next image',		
		closeTitle: 'close image gallery',
		image: 'Image ',
		of: ' of ',
		download: 'Download'
	};
	jQuery('a[rel^="lightbox"]').lightbox({
		adminBarHeight: jQuery('#wpadminbar').height() || 0,
		linkTarget: (haveConf && JQLBSettings.linkTarget.length) ? JQLBSettings.linkTarget : '_self',
		displayHelp: (haveConf && JQLBSettings.help.length) ? true : false,
		marginSize: (haveConf && JQLBSettings.marginSize) ? JQLBSettings.marginSize : 0,
		fitToScreen: (haveConf && JQLBSettings.fitToScreen == '1') ? true : false,
		resizeSpeed: (haveConf && JQLBSettings.resizeSpeed >= 0) ? JQLBSettings.resizeSpeed : 400,
		displayDownloadLink: (haveConf && JQLBSettings.displayDownloadLink == '0') ? false : true,
		navbarOnTop: (haveConf && JQLBSettings.navbarOnTop == '0') ? false : true,		
		strings: (haveConf && typeof JQLBSettings.help == 'string') ? JQLBSettings : default_strings
	});	
}

=== WP jQuery Lightbox ===
Contributors: ulfben
Donate link: http://amzn.com/w/2QB6SQ5XX2U0N
Tags: lightbox, jquery, nodal, image, display, ulfben
Requires at least: 2.9.2
Tested up to: 3.0.1
Stable tag: 1.1

A drop in replacement for Lightbox 2 and similar plugins, shedding the bulk of Prototype and Scriptaculous.

== Description ==

This plugin lets you keep [the awesome Lightbox 2](http://www.huddletogether.com/projects/lightbox2/)-functionality, but sheds the bulk of the Prototype Framework **and** Scriptaculous Effects Library.

Warren Krewenki [ported Lightbox over to jQuery](http://warren.mesozen.com/jquery-lightbox/) and this plugin is mostly a wrapper to his work. 
It provides an admin panel for configuration, (optional) auto-boxing of your image links and support for WordPress galleries.

You can configure the animation speed and disable image resizing (if you don't want the plugin to fit images to smaller monitors).

See the plugin in action here: [http://game.hgo.se/blog/motion-capture/](http://game.hgo.se/blog/motion-capture/)

== Installation ==

1. Upload the `wp-jquery-lightbox`-folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Check out the jQuery Lightbox-panel in your admin interface for usage details and configuration.

= How to Use: =
1. You can use WordPress image galleries and have them grouped and auto-lightboxed: `[gallery link="file"]`	
1. You can add a `rel="lightbox"` attribute to any link tag to activate the lightbox. For example:

	`<a href="image-1.jpg" rel="lightbox" title="my caption">image #1</a>`
	
1. If you have a set of related images that you would like to group, follow step one but additionally include a group name in the rel attribute. For example:
	
	`<a href="image-1.jpg" rel="lightbox[roadtrip]">image #1</a>`
	
	`<a href="image-2.jpg" rel="lightbox[roadtrip]">image #2</a>`
	
	`<a href="image-3.jpg" rel="lightbox[roadtrip]">image #3</a>`

Optional: Use the title attribute if you want to show a caption.

You can navigate the images with your keyboard: Arrows, P(revious)/N(ext) and X/C/ESC for close.

No limits to the number of image sets per page or how many images are allowed in each set. Go nuts!

== Changelog ==

= 1.1 =
* Honors empty captions. 
* Fixed typos on admin page.
* (thanks, josephknight! http://tinyurl.com/3677p6r)

= 1.0 =
* Release.

== Upgrade Notice ==

= 1.1 =
Honors empty captions and fixes some typos.

= 1.0 =
First release.
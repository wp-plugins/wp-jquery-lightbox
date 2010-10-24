=== WP jQuery Lightbox ===
Contributors: ulfben
Donate link: http://amzn.com/w/2QB6SQ5XX2U0N
Tags: lightbox, jquery, nodal, image, display, ulfben
Requires at least: 2.9.2
Tested up to: 3.0.1
Stable tag: 1.2.1

A drop-in replacement for Lightbox 2 and similar plugins, shedding the bulk of Prototype and Scriptaculous.

== Description ==

This plugin lets you keep [the awesome Lightbox 2](http://www.huddletogether.com/projects/lightbox2/)-functionality, but sheds the bulk of the Prototype Framework **and** Scriptaculous Effects Library.

Warren Krewenki [ported Lightbox over to jQuery](http://warren.mesozen.com/jquery-lightbox/) and this plugin is mostly a wrapper to his work. 
It provides an admin panel for configuration, (optional) auto-boxing of your image links and support for WordPress galleries, *including* [media library](http://codex.wordpress.org/Media_Library_SubPanel) titles and captions.

You can navigate the images with your keyboard: Arrows, P(revious)/N(ext) and X/C/ESC for close.

See the plugin in action here: [http://game.hgo.se/blog/motion-capture/](http://game.hgo.se/blog/motion-capture/)

*If you value [my plugins](http://profiles.wordpress.org/users/ulfben/) and want to motivate further development - please **help me out** by [downloading and installing DropBox](http://www.dropbox.com/referrals/NTIzMDI3MDk) from my refferal link. It's a cross-plattform application to sync your files online and across computers. A 2GB account is free and my refferal earns you a 250MB bonus!*

= 1.2.1 (2010-10-24) =
* [Use only caption if title is identical](http://wordpress.org/support/topic/plugin-wp-jquery-lightbox-title-captions-bug-found-solved-and-fix-proposed?replies=8#post-1748874)
* Removed a forgotten debug call

= 1.2 (2010-10-12) = 
* Added support for Media Library titles and captions.
* Minified the javascript (8.6KB vs 17.8KB)
* Minified the CSS (2.0KB vs 2.7KB)

[Older changelogs moved here.](http://wordpress.org/extend/plugins/wp-jquery-lightbox/changelog/)

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

= 1.2.1 (2010-10-24) =
* [Use only caption if title is identical](http://wordpress.org/support/topic/plugin-wp-jquery-lightbox-title-captions-bug-found-solved-and-fix-proposed?replies=8#post-1748874)
* Removed a forgotten debug call

= 1.2 (2010-10-12) = 
* Added support for Media Library titles and captions.
* Minified the javascript (8.6KB vs 17.8KB)
* Minified the CSS (2.0KB vs 2.7KB)

= 1.1 (2010-10-09) = 
* Honors empty captions. 
* Fixed typos on admin page.
* (thanks, josephknight! http://tinyurl.com/3677p6r)

= 1.0 (2010-04-11) = 
* Release.

== Upgrade Notice ==

= 1.2.1 =
Removed forgotten debug call. Important upgrade!

= 1.2 =
Support caption and titles from the Media Library

= 1.1 =
Honors empty captions and fixes some typos.

= 1.0 =
First release.

== Frequently Asked Questions ==

= Must fade-in and animation of all *box-scripts be so slow? =

WP-jQuery Lightbox lets you configure the animation speed and disable image resizing from the admin panel.

= Can I help you in any way? =

Absolutely! If you [download & install DropBox](http://www.dropbox.com/referrals/NTIzMDI3MDk) on my refferal, I get 1GB (much needed!) extra space. DropBox is a cross-plattform application to sync your files online and across computers, and a 2GB account is *free*. Also - my refferal earns you a 250MB bonus! 

If you've had any commercial applications for my plugins, please consider [sending me a book or two](http://www.amazon.com/gp/registry/wishlist/2QB6SQ5XX2U0N/105-3209188-5640446?reveal=unpurchased&filter=all&sort=priority&layout=standard&x). (used are fine!) 

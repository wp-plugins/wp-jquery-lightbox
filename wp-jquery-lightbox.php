<?php
/*
Plugin Name: wp-jquery-lightbox
Plugin URI: http://wordpress.org/extend/plugins/wp-jquery-lightbox/
Description: A drop in replacement for LightBox-2 and similar plugins. Uses jQuery to save you from the JS-library mess in your header. :)
Version: 1.2.1
Author: Ulf Benjaminsson
Author URI: http://www.ulfben.com
*/
if(!defined('WP_CONTENT_URL')){
	define('WP_CONTENT_URL', get_option('siteurl').'/wp-content');
}
if(!defined('WP_PLUGIN_URL')){
	define('WP_PLUGIN_URL', WP_CONTENT_URL.'/plugins');
}
define('JQLB_DONATE_URL', 'http://www.amazon.com/gp/registry/wishlist/2QB6SQ5XX2U0N/105-3209188-5640446?reveal=unpurchased&filter=all&sort=priority&layout=standard&x=21&y=17');
define('JQLB_BASENAME', plugin_basename( __FILE__ ));
define('JQLB_URL', WP_PLUGIN_URL.'/wp-jquery-lightbox/');
define('JQLB_SCRIPT_URL', JQLB_URL.'jquery.lightbox.min.js');
define('JQLB_STYLE_URL', JQLB_URL.'lightbox.min.css');
add_action('admin_menu', 'jqlb_register_menu_item');
add_action('wp_print_styles', 'jqlb_css');	
add_action('wp_print_scripts', 'jqlb_js');
add_filter('plugin_row_meta', 	'jqlb_set_plugin_meta', 2, 10);	
add_filter('the_content', 'jqlb_autoexpand_rel_wlightbox', 99);
add_filter('the_excerpt', 'jqlb_autoexpand_rel_wlightbox', 99);
function jqlb_set_plugin_meta( $links, $file ) { // Add a link to this plugin's settings page
	if($file == JQLB_BASENAME) {
		return array_merge($links, array(sprintf( '<a href="%s/wp-admin/options-general.php?page=%s">%s</a>', get_option('siteurl'), JQLB_BASENAME, __('Settings', 'wpdtree'))));
	}
	return $links; 
}
function jqlb_add_admin_footer(){ //shows some plugin info in the footer of the config screen.
	$plugin_data = get_plugin_data(__FILE__);
	printf('%1$s by %2$s (who <a href="'.JQLB_DONATE_URL.'">appreciates books</a>) :)<br />', $plugin_data['Title'].' '.$plugin_data['Version'], $plugin_data['Author']);		
}	
function jqlb_register_menu_item() {	
	register_setting( 'jqlb-settings-group', 'jqlb_automate'); 
	register_setting( 'jqlb-settings-group', 'jqlb_resize_on_demand');
	register_setting( 'jqlb-settings-group', 'jqlb_resize_speed', 'jqlb_pos_intval');
	add_option('jqlb_automate', 1); //default is to auto-lightbox.
	add_option('jqlb_resize_on_demand', 1); //default is to resize
	add_option('jqlb_resize_speed', 250); 
	add_options_page('jQuery Lightbox Options', 'jQuery Lightbox', 10, 'jquery-lightbox-options', 'jqlb_options_panel');
}
function jqlb_css(){
	if(is_admin() || is_feed()){return;}
	wp_enqueue_style('jquery.lightbox.min.css', JQLB_STYLE_URL, false, '1.2');
}
function jqlb_js() {			   	
	if(is_admin() || is_feed()){return;}
	wp_deregister_script('jquery');
	wp_register_script('jquery', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');
	wp_enqueue_script('jquery', '', array(), '1.4.2', true);			
	wp_enqueue_script('wp-jquery-lightbox', JQLB_SCRIPT_URL,  Array('jquery'), '1.2', true);
	wp_localize_script('wp-jquery-lightbox', 'JQLBSettings', array(
		'fitToScreen' => get_option('jqlb_resize_on_demand'),
		'resizeSpeed' => get_option('jqlb_resize_speed')
		));
}
/* automatically insert rel="lightbox[nameofpost]" to every image with no manual work. 
	if there are already rel="lightbox[something]" attributes, they are not clobbered. 
	Michael Tyson, you are a regular expressions god! - http://atastypixel.com */
function jqlb_autoexpand_rel_wlightbox($content) {
	if(get_option('jqlb_automate') == 1){
		global $post;	
		$pattern = "/(<a(?![^>]*?rel=['\"]lightbox.*)[^>]*?href=['\"][^'\"]+?\.(?:bmp|gif|jpg|jpeg|png)['\"][^\>]*)>/i";
		$replacement = '$1 rel="lightbox['.$post->ID.']">';
		$content = preg_replace($pattern, $replacement, $content);
	}			
	return "\n<!-- wp-jquery-lightbox, a WordPress plugin by ulfben --> \n" . $content;
}
function jqlb_pos_intval($v){
	return abs(intval($v));
}
function jqlb_options_panel(){
	if(!function_exists('current_user_can') || !current_user_can('manage_options')){
			die(__('Cheatin&#8217; uh?'));
	} 
	add_action('in_admin_footer', 'jqlb_add_admin_footer');
	?> 
	<div class="wrap">
	<h2>jQuery Lightbox</h2>
	<form method="post" action="options.php">
		<table>
		<?php settings_fields('jqlb-settings-group'); ?>
			<tr valign="baseline">
				<th scope="row"><?php _e('Auto-lightbox image links', 'jqlb') ?></th> 
				<td>
					<?php $check = get_option('jqlb_automate') ? ' checked="yes" ' : ''; ?>
					<input type="checkbox" name="jqlb_automate" value="1" <?php echo $check; ?>/>
					<p><small><?php _e('Let the plugin add necessary html to image links', 'jqlb') ?></small></p>
				</td>
			</tr>
			<tr valign="baseline">
				<th scope="row"><?php _e('Shrink large images to fit smaller screens', 'jqlb') ?></th> 
				<td>
					<?php $check = get_option('jqlb_resize_on_demand') ? ' checked="yes" ' : ''; ?>
					<input type="checkbox" name="jqlb_resize_on_demand" value="1" <?php echo $check; ?> />
					<p><small><?php _e('Note: <u>Excessively large images</u> waste bandwidth!', 'jqlb') ?></small></p>
				</td>
			</tr>
			<tr valign="baseline">
				<th scope="row"><?php _e('Animation speed (in milliseconds)', 'jqlb') ?></th> 
				<td>					
					<input type="text" name="jqlb_resize_speed" value="<?php echo intval(get_option('jqlb_resize_speed')) ?>" />					
				</td>
			</tr>				
		 </table>
		<p class="submit">
		  <input type="submit" name="Submit" value="<?php _e('Save Changes', 'jqlb') ?>" />
		</p>
	</form>
	<h2>How to Use:</h2> 	
	<ol> 
	<li>You can safely use WordPress image galleries and have them grouped and auto-lightboxed: <code>[gallery link="file"]</code></li> 	
	<li>Alternatively, manually add a <code>rel="lightbox"</code> attribute to any link tag to activate the lightbox. For example:
	<pre><code>	&lt;a href=&quot;images/image-1.jpg&quot; rel=&quot;lightbox&quot; title=&quot;my caption&quot;&gt;image #1&lt;/a&gt;</code></pre> 
	<em>Optional:</em> Use the <code>title</code> attribute if you want to show a caption.
	</li> 
	<li>If you have a set of related images that you would like to group, follow step one but additionally include a group name in the rel attribute. For example:
<pre><code>	&lt;a href=&quot;images/image-1.jpg&quot; rel=&quot;lightbox[roadtrip]&quot;&gt;image #1&lt;/a&gt;
	&lt;a href=&quot;images/image-2.jpg&quot; rel=&quot;lightbox[roadtrip]&quot;&gt;image #2&lt;/a&gt;
	&lt;a href=&quot;images/image-3.jpg&quot; rel=&quot;lightbox[roadtrip]&quot;&gt;image #3&lt;/a&gt;</code></pre> 
	No limits to the number of image sets per page or how many images are allowed in each set. Go nuts!</li> 	
	</ol>	
	
	<h2>Credits</h2><ul style="list-style-type: circle;margin-left: 24px;">
	<li>wp-jquery-lightbox was created by <a href="http://www.ulfben.com">Ulf Benjaminsson</a> (who <a href="http://amzn.com/w/2QB6SQ5XX2U0N">appreciates books</a>). :)</li>		
	<li>wp-jquery-lightbox borrowed code from <a href="http://stimuli.ca/lightbox/">LightBox-2 by Rupert Morris</a></li>		
	<li>wp-jquery-lightbox uses a slightly modified (see below) <a href="http://github.com/krewenki/jquery-lightbox/">jQuery Lightbox</a> by <a href="http://warren.mesozen.com/jquery-lightbox/">Warren Krewenki</a></li>		
	<li><a href="http://github.com/krewenki/jquery-lightbox/">jQuery Lightbox</a> is based on <a href="http://www.huddletogether.com/projects/lightbox2/">Lightbox 2 by Lokesh Dhakar</a></li>		
	</ul>
	
	<h2>Notes to self:</h2><p style="margin-left: 24px;">	
	I've changed the behaviour of jQuery Lightbox to rely on <code>rel="lightbox"</code> instead of <code>class="lightbox"</code>, since rel is what all the previous *box-scripts used.<br />
	I rewrote the jQuery Lightbox resizing code, to take into account <strong>both</strong> height and width and never destroy aspect ratio.<br />
	I replaced the <code>fileLoadingImage</code>-setting with a <code>jqlb_loading</code>-div, feeding an image from CSS instead of parameterizing the javascript.<br />
	I did the same thing with <code>fileBottomNavCloseImage</code> (replaced with <code>jqlb_closelabel</code>-div)<br />
	I borrowed the regular expression from LightBox-2, to automatically insert rel="lightbox[post_id]" without clobbering manual inputs.<br />
	I've added support to grab titles and captions from the WordPress Media Gallery-output (<code>[gallery]</code>, "insert attachments" etc)<br />
	I've fixed the bug of ignoring empty titles (now honored)
	</p>
	</div>
<?php } ?>
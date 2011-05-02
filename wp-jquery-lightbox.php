<?php
/*
Plugin Name: wp-jquery-lightbox
Plugin URI: http://wordpress.org/extend/plugins/wp-jquery-lightbox/
Description: A drop in replacement for LightBox-2 and similar plugins. Uses jQuery to save you from the JS-library mess in your header. :)
Version: 1.3.1
Author: Ulf Benjaminsson
Author URI: http://www.ulfben.com
*/
add_action( 'plugins_loaded', 'jqlb_init' );
function jqlb_init() {
	if(!defined('WP_CONTENT_URL')){
		define('WP_CONTENT_URL', get_option('siteurl').'/wp-content');
	}
	if(!defined('WP_PLUGIN_URL')){
		define('WP_PLUGIN_URL', WP_CONTENT_URL.'/plugins');
	}
	define('JQLB_PLUGIN_DIR', dirname( __FILE__ ) . '/');
	define('JQLB_DONATE_URL', 'http://www.amazon.com/gp/registry/wishlist/2QB6SQ5XX2U0N/105-3209188-5640446?reveal=unpurchased&filter=all&sort=priority&layout=standard&x=21&y=17');
	define('JQLB_BASENAME', plugin_basename(__FILE__));
	define('JQLB_URL', WP_PLUGIN_URL.'/wp-jquery-lightbox/');
	define('JQLB_SCRIPT_URL', JQLB_URL.'jquery.lightbox.min.js');
	define('JQLB_STYLE_URL', JQLB_URL.'lightbox.min.css');
	define('JQLB_LANGUAGES_DIR', JQLB_PLUGIN_DIR . 'languages/');
	load_plugin_textdomain('jqlb', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/');
	add_action('admin_init', 'jqlb_register_settings');
	add_action('admin_menu', 'jqlb_register_menu_item');
	add_action('wp_print_styles', 'jqlb_css');	
	add_action('wp_print_scripts', 'jqlb_js');
	add_filter('plugin_row_meta', 	'jqlb_set_plugin_meta', 2, 10);	
	add_filter('the_content', 'jqlb_autoexpand_rel_wlightbox', 99);
}
function jqlb_set_plugin_meta( $links, $file ) { // Add a link to this plugin's settings page
	static $this_plugin;
	if(!$this_plugin) $this_plugin = plugin_basename(__FILE__);
	if($file == $this_plugin) {
		$settings_link = '<a href="options-general.php?page=jquery-lightbox-options">'.__('Settings', 'jqlb').'</a>';	
		array_unshift($links, $settings_link);
	}
	return $links; 
}
function jqlb_add_admin_footer(){ //shows some plugin info in the footer of the config screen.
	$plugin_data = get_plugin_data(__FILE__);
	printf('%1$s by %2$s (who <a href="'.JQLB_DONATE_URL.'">appreciates books</a>) :)<br />', $plugin_data['Title'].' '.$plugin_data['Version'], $plugin_data['Author']);		
}	
function jqlb_register_settings(){
	register_setting( 'jqlb-settings-group', 'jqlb_automate', 'jqlb_bool_intval'); 
	register_setting( 'jqlb-settings-group', 'jqlb_resize_on_demand', 'jqlb_bool_intval');
	register_setting( 'jqlb-settings-group', 'jqlb_show_download', 'jqlb_bool_intval');
	register_setting( 'jqlb-settings-group', 'jqlb_resize_speed', 'jqlb_pos_intval');
	//register_setting( 'jqlb-settings-group', 'jqlb_follow_scroll', 'jqlb_bool_intval');
	add_option('jqlb_automate', 1); //default is to auto-lightbox.
	add_option('jqlb_resize_on_demand', 1); //default is to resize
	add_option('jqlb_show_download', 0); 
	add_option('jqlb_resize_speed', 400); 
	//add_option('jqlb_follow_scroll', 0);  
}
function jqlb_register_menu_item() {		
	add_options_page('jQuery Lightbox Options', 'jQuery Lightbox', 'manage_options', 'jquery-lightbox-options', 'jqlb_options_panel');
}
function jqlb_get_locale(){
	//$lang_locales and ICL_LANGUAGE_CODE are defined in the WPML plugin (http://wpml.org/)
	global $lang_locales;
	if (isset($lang_locales[ICL_LANGUAGE_CODE])){
		$locale = $lang_locales[ICL_LANGUAGE_CODE];
	} else {
		$locale = get_locale();
	}
	return $locale;
}
function jqlb_css(){
	if(is_admin() || is_feed()){return;}
	$locale = jqlb_get_locale();
	$cssfile = 'lightbox.min.' . $locale . '.css';
	if(is_readable(JQLB_PLUGIN_DIR . $cssfile)){
		wp_enqueue_style('jquery.lightbox.min.css', JQLB_URL . $cssfile, false, '1.3');
	}else{
		wp_enqueue_style('jquery.lightbox.min.css', JQLB_STYLE_URL, false, '1.3');
	}	
}
function jqlb_js() {			   	
	if(is_admin() || is_feed()){return;}
	wp_enqueue_script('jquery', '', array(), false, true);			
	wp_enqueue_script('wp-jquery-lightbox', JQLB_SCRIPT_URL,  Array('jquery'), '1.3', true);
	wp_localize_script('wp-jquery-lightbox', 'JQLBSettings', array(
		'fitToScreen' => get_option('jqlb_resize_on_demand'),
		'resizeSpeed' => get_option('jqlb_resize_speed'),
		'displayDownloadLink' => get_option('jqlb_show_download'),
		//'followScroll' => get_option('jqlb_follow_scroll'),
		/* translation */
		'help' => __(' \u2190 / P - previous image\u00a0\u00a0\u00a0\u00a0\u2192 / N - next image\u00a0\u00a0\u00a0\u00a0ESC / X - close image gallery', 'jqlb'),
		'prevLinkTitle' => __('previous image', 'jqlb'),
		'nextLinkTitle' => __('next image', 'jqlb'),
		'prevLinkText' =>  __('&laquo; Previous', 'jqlb'),
		'nextLinkText' => __('Next &raquo;', 'jqlb'),
		'closeTitle' => __('close image gallery', 'jqlb'),
		'image' => __('Image ', 'jqlb'),
		'of' => __(' of ', 'jqlb'),
		'download' => __('Download', 'jqlb')
	));
}

function jqlb_autoexpand_rel_wlightbox($content) {
	if(get_option('jqlb_automate') == 1){
		global $post;	
		$content = jqlb_do_regexp($content, $post->ID);
	}			
	return $content;
}
function jqlb_apply_lightbox($content, $id = -1){
	if($id === -1){
		$id = time().rand(0, 32768);
	}
	return jqlb_do_regexp($content, $id);
}

/* automatically insert rel="lightbox[nameofpost]" to every image with no manual work. 
	if there are already rel="lightbox[something]" attributes, they are not clobbered. 
	Michael Tyson, you are a regular expressions god! - http://atastypixel.com */
function jqlb_do_regexp($content, $id){
	$id = esc_attr($id);
	$pattern = "/(<a(?![^>]*?rel=['\"]lightbox.*)[^>]*?href=['\"][^'\"]+?\.(?:bmp|gif|jpg|jpeg|png)['\"][^\>]*)>/i";
	$replacement = '$1 rel="lightbox['.$id.']">';
	return preg_replace($pattern, $replacement, $content);
}

function jqlb_bool_intval($v){
	return $v == 1 ? '1' : '0';
}

function jqlb_pos_intval($v){
	return abs(intval($v));
}
function jqlb_options_panel(){
	if(!function_exists('current_user_can') || !current_user_can('manage_options')){
			die(__('Cheatin&#8217; uh?', 'jqlb'));
	} 
	add_action('in_admin_footer', 'jqlb_add_admin_footer');
	?> 
	<div class="wrap">
	<h2>jQuery Lightbox</h2>
	<form method="post" action="options.php">
		<table>
		<?php settings_fields('jqlb-settings-group'); ?>
			<tr valign="baseline">
				<td>
					<?php $check = get_option('jqlb_automate') ? ' checked="yes" ' : ''; ?>
					<input type="checkbox" id="jqlb_automate" name="jqlb_automate" value="1" <?php echo $check; ?>/>
					<label for="jqlb_automate" title="<?php _e('Let the plugin add necessary html to image links', 'jqlb') ?>"> <?php _e('Auto-lightbox image links', 'jqlb') ?></label>
				</td>
			</tr>
			<tr valign="baseline">
				<td>
					<?php $check = get_option('jqlb_show_download') ? ' checked="yes" ' : ''; ?>
					<input type="checkbox" id="jqlb_show_download" name="jqlb_show_download" value="1" <?php echo $check; ?> />
					<label for="jqlb_show_download"> <?php _e('Show download link', 'jqlb') ?> </label>
				</td>
			</tr>
			<tr valign="baseline">
				<td>
					<?php $check = get_option('jqlb_resize_on_demand') ? ' checked="yes" ' : ''; ?>
					<input type="checkbox" id="jqlb_resize_on_demand" name="jqlb_resize_on_demand" value="1" <?php echo $check; ?> />
					<label for="jqlb_resize_on_demand"><?php _e('Shrink large images to fit smaller screens', 'jqlb') ?></label> 
				</td>
			</tr>					
			<tr valign="baseline">
				<td>					
					<input type="text" id="jqlb_resize_speed" name="jqlb_resize_speed" value="<?php echo intval(get_option('jqlb_resize_speed')) ?>" />
					<label for="jqlb_resize_speed"><?php _e('Animation duration (in milliseconds)', 'jqlb') ?></label>			
				</td>
			</tr>				
		 </table>
		<p class="submit">
		  <input type="submit" name="Submit" value="<?php _e('Save Changes', 'jqlb') ?>" />
		</p>
	</form>
	<?php
		$locale = jqlb_get_locale();
		$diskfile = JQLB_LANGUAGES_DIR . "howtouse-" . $locale . ".html";
		if (!file_exists($diskfile)){
			$diskfile = JQLB_LANGUAGES_DIR . "howtouse.html";
		}
		$text = false;
		if(function_exists('file_get_contents')){
			$text = @file_get_contents($diskfile);
		} else {
			$text = @file($diskfile);
			if($text !== false){
				$text = implode("", $text);
			}
		}
		if($text === false){
			$text = '<p>The documentation files are missing! Try <a href="http://wordpress.org/extend/plugins/wp-jquery-lightbox/">downloading</a> and <a href="http://wordpress.org/extend/plugins/wp-jquery-lightbox/installation/">re-installing</a> this plugin.</p>';
		}
		echo $text;
	?>
	</div>	
<?php }?>

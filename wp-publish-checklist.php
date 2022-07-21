<?php
/**
 * Plugin Name: WP Publish Checklist
 * Plugin URI:
 * Description: WP Publish Checklist works with the block editor to ensure certain fields are present before it gets published.
 * Author: Muhammad Muhsin
 * Author URI: https://muhammad.dev
 *
 * @package WP Publish Checklist
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Enqueue the plugin's scripts and styles.
 */
function wp_publish_checklist_enqueue_scripts() {
    wp_enqueue_script(
		'wp-publish-checklist-script',
		plugins_url( 'build/index.js', __FILE__ ),
		[ 'wp-plugins', 'wp-edit-post', 'wp-i18n', 'wp-element', 'wp-components', 'wp-data' ],
		'1.0.0',
		true,
	);

    wp_enqueue_style(
        'wp-publish-checklist-style',
        plugins_url( 'build/style-index.css', __FILE__ ),
        [],
        false,
    );
}
add_action( 'enqueue_block_editor_assets', 'wp_publish_checklist_enqueue_scripts' );

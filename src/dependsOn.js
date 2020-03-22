/*!
 * dependsOn v${version}
 * a jQuery plugin to facilitate the handling of form field dependencies.
 *
 * Copyright 2016 David Street
 * Licensed under the MIT license.
 */

let SubjectController = require( './subject-controller' );

/**
 * Plugin access point.
 * @param {Object} initialSet An object of key-value pairs of selectors and qualifiers
 * representing the inital DependencySet.
 * @param {Object} opts An object for key-value pairs of options.
 * @return {SubjectController}
 */
jQuery.fn.WPOnion_dependsOn = function( initialSet, opts ) {
	let options = $.extend( {}, {
		disable: true,
		hide: true,
		duration: 200,
		trigger: 'change'
	}, opts );

	// Namespace the trigger event
	options.trigger += ( options.trigger.search( '.dependsOn' ) > -1 ) ? '' : '.dependsOn';
	return new SubjectController( this, initialSet, options );
};

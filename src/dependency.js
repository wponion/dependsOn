/**
 * Dependency
 * ---
 * Class which defines dependency qualifiers
 */


let EventEmitter = require( 'events' ).EventEmitter;

let Dependency = function( selector, qualifiers, trigger ) {
	this.$ele       = $( selector );
	this.qualifiers = qualifiers;
	this.fieldState = getFieldState( this.$ele );
	this.methods    = [
		'enabled',
		'checked',
		'values',
		'not',
		'match',
		'contains',
		'email',
		'url'
	];

	// Set initial state of the dependency
	this.qualified = this.doesQualify();

	this.$ele.on( trigger, handler.bind( this ) );
	this.runCheck = handler.bind( this );

	function handler( e ) {
		let prevState = this.qualified;

		this.fieldState = getFieldState( this.$ele );
		this.qualified  = this.doesQualify();

		if( this.qualified !== prevState ) {
			this.emit( 'change', {
				selector: selector,
				e: e,
				qualified: this.qualified
			} );
		}
	}
};

Dependency.prototype = $.extend( {}, EventEmitter.prototype );

/**
 * Checks & Returns Proper Method Alias.
 * @param method
 * @return {boolean}
 */
Dependency.prototype.method_alias = function( method ) {
	switch( method ) {
		case '\'\'':
		case '""':
		case 'empty':
		case 'EMPTY':
			method = 'empty';
			break;

		case '!""':
		case '!\'\'':
		case '!empty':
		case '!EMPTY':
		case 'not_empty':
			method = 'not_empty';
			break;

		case '=':
		case '==':
		case '===':
		case 'equals':
		case 'OR':
		case 'or':
		case '||':
			method = 'values';
			break;

		case '!=':
		case '!==':
		case '!===':
		case '!equals':
		case 'not_equals':
			method = 'not_equals';
			break;

		case 'has':
		case 'HAS':
		case 'in':
		case 'IN':
			method = 'contains';
			break;

		case '>':
		case 'gt':
			method = 'greater_than';
			break;

		case '>=':
		case 'gte':
			method = 'greater_than_or_equal';
			break;

		case 'lt':
		case '<':
			method = 'lesser_than';
			break;

		case 'lte':
		case '<=':
			method = 'lesser_than_or_equal';
			break;
	}

	return method;
};

/**
 * Qualifier method which checks for the `disabled` attribute.
 * ---
 * Returns false when dependency is disabled and `enabled`
 * qualifier is true *or* when dependency is not disabled and
 * `enabled` qualifier is false.
 * Returns true otherwise.
 *
 * @param {Boolean} enabledVal The value we are checking
 * @return {Boolean}
 */
Dependency.prototype.enabled = function( enabledVal ) {
	return !!( ( !this.fieldState.disabled && enabledVal ) || ( this.fieldState.disabled && !enabledVal ) );
};

/**
 * Qualifier method which checks for the `checked` attribute on
 * checkboxes and radio buttons.
 * ---
 * Dependency must be a checkbox for this qualifier.
 * Returns false if checkbox is not checked and the `checked` qualifier
 * is true *or* the checkbox is checked and the `checked` qualifier
 * is false.
 *
 * @param {Boolean} checkedVal The value we are checking.
 * @return {Boolean}
 */
Dependency.prototype.checked = function( checkedVal ) {
	if( this.$ele.attr( 'type' ) === 'checkbox' ) {
		if( ( !this.fieldState.checked && checkedVal ) ||
			( this.fieldState.checked && !checkedVal ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Qualifier method which checks the dependency input value against an
 * array of whitelisted values.
 * ---
 * For single value dependency, returns true if values match.
 * When dependency value is an array, returns true if array compares to
 * a single value in the whitlist.
 * This is helpful when dealing with a multiselect input, and comparing
 * against an array of value sets:
 * 		[ [1, 2, 3], [4, 5, 6], [7, 8] ]
 *
 * @param  {Array} whitelist The list of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.values = function( whitelist ) {
	if( typeof whitelist === 'string' && typeof this.fieldState.value === 'string' && this.fieldState.value === whitelist ) {
		return true;
	}

	for( let i = 0, len = whitelist.length; i < len; i++ ) {
		if( this.fieldState.value !== null && Array.isArray( this.fieldState.value ) ) {
			if( $( this.fieldState.value ).not( whitelist[ i ] ).length === 0 &&
				$( whitelist[ i ] ).not( this.fieldState.value ).length === 0 ) {
				return true;
			}
		} else if( whitelist[ i ] === this.fieldState.value ) {
			return true;
		}
	}

	return false;
};

/**
 * Qualifier method which checks the dependency input value against an
 * array of blacklisted values.
 * ---
 * Returns true when the dependency value is not in the blacklist.
 *
 * @param  {Array} blacklist The list of unacceptable values
 * @return {Boolean}
 */
Dependency.prototype.not = function( blacklist ) {
	return !this.values( blacklist );
};

/**
 * Qualifier method which runs a RegEx pattern match on the dependency
 * input value.
 * ---
 * Returns true when the dependency value matches the regular expression.
 * If dependency value is an array, will only return true if _all_ values
 * match the regular expression.
 *
 * @param  {RegExp} regex Regular expression to test against
 * @return {Boolean}
 */
Dependency.prototype.match = function( regex ) {
	let val = this.fieldState.value;

	if( !Array.isArray( this.fieldState.value ) ) {
		val = [ val ];
	}

	for( let i = 0, len = val.length; i < len; i++ ) {
		if( !regex.test( val[ i ] ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Qualifier method which runs a RegExp pattern match on the dependency
 * input value.
 * ---
 * Returns true when the dependency value does *not* match the regexp.
 * If dependency value is an array, will only return true if _none_ of the
 * values match the regular expression.
 *
 * @param  {RegExp} regex Regular expression to test against
 * @return {Boolean}
 */
Dependency.prototype.notMatch = function( regex ) {
	let val = this.fieldState.value;

	if( !Array.isArray( this.fieldState.value ) ) {
		val = [ val ];
	}

	for( let i = 0, len = val.length; i < len; i++ ) {
		if( regex.test( val[ i ] ) ) {
			return false;
		}
	}

	return true;
};

/**
 * Qualifier method which checks if a whitelisted value exists in an
 * array of dependency values.
 * ---
 * Useful for select inputs with the `multiple` attribute.
 * If dependency value is not an array, the method will fallback to the
 * `values` qualifier.
 *
 * @param  {Array} whitelist List of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.contains = function( whitelist ) {
	if( typeof whitelist === 'string' && typeof this.fieldState.value === 'string' && this.fieldState.value.indexOf( whitelist ) >= 0 ) {
		return true;
	}

	if( typeof whitelist === 'object' ) {
		for( let i = 0, len = whitelist.length; i < len; i++ ) {
			if( typeof this.fieldState.value === 'string' ) {
				return ( this.fieldState.value.indexOf( whitelist[ i ] ) >= 0 );
			} else if( $.inArray( whitelist[ i ], this.fieldState.value ) !== -1 ) {
				return true;
			}
		}
	}

	if( !Array.isArray( this.fieldState.value ) ) {
		return this.values( whitelist );
	}

	return false;
};

/**
 * Qualifier method which checks the dependency input value against an
 * array of whitelisted values with any condition.
 *
 * @param  {Array} whitelist The list of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.any = function( whitelist ) {
	whitelist  = ( typeof whitelist === 'string' ) ? whitelist.split( ',' ) : whitelist;
	let values = ( typeof this.fieldState.value === 'string' ) ? this.fieldState.value.split( ' ' ) : this.fieldState.value;

	for( let i in values ) {
		if( values.hasOwnProperty( i ) ) {
			if( $.inArray( values[ i ], whitelist ) > -1 ) {
				return true;
			}
		}
	}
	return false;
};

/**
 * Qualifier method which checks the dependency input value against an
 * array of whitelisted values with any condition. and returns false if value exists.
 *
 * @param  {Array} whitelist The list of acceptable values
 * @return {Boolean}
 */
Dependency.prototype.not_any = function( whitelist ) {
	return ( true !== this.any( whitelist ) );
};

/**
 * Qualifier method which checks given value is empty.
 * @return {boolean}
 */
Dependency.prototype.not_equals = function( whitelist ) {
	return ( whitelist !== this.fieldState.value );
};

/**
 * Qualifier method which checks given value is greater_than.
 * @return {boolean}
 */
Dependency.prototype.greater_than = function( whitelist ) {
	return ( Number( whitelist ) > Number( this.fieldState.value ) );
};

/**
 * Qualifier method which checks given value is empty.
 * @return {boolean}
 */
Dependency.prototype.greater_than_or_equal = function( whitelist ) {
	return ( Number( whitelist ) >= Number( this.fieldState.value ) );
};

/**
 * Qualifier method which checks given value is empty.
 * @return {boolean}
 */
Dependency.prototype.lesser_than = function( whitelist ) {
	return ( Number( this.fieldState.value ) < Number( whitelist ) );
};

/**
 * Qualifier method which checks given value is empty.
 * @return {boolean}
 */
Dependency.prototype.lesser_than_or_equal = function( whitelist ) {
	return ( Number( this.fieldState.value ) <= Number( whitelist ) );
};

/**
 * Qualifier method which checks given value is empty.
 * @return {boolean}
 */
Dependency.prototype.empty = function() {
	return ( '' === this.fieldState.value );
};

/**
 * Qualifier method which checks given value is not empty.
 * @return {boolean}
 */
Dependency.prototype.not_empty = function() {
	return ( '' !== this.fieldState.value );
};

/**
 * Qualifier method which checks that the value is a valid email address
 * ---
 * Returns true when the value is an email address and `shouldMatch` is
 * true *or* when value is not an email address and `shouldMatch`
 * is false.
 *
 * @param  {Boolean} shouldMatch Should the value be valid
 * @return {Boolean}
 */
Dependency.prototype.email = function( shouldMatch ) {
	let regex = /^[_a-zA-Z0-9\-\+]+(\.[_a-zA-Z0-9\-\+]+)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.(([0-9]{1,3})|([a-zA-Z]{2,3})|(aero|coop|info|museum|name))$/;
	return this.match( regex ) === shouldMatch;
};

/**
 * Qualifier method which checks that the value is a valid URL
 * ---
 * Returns true when the value is a URL and `shouldMatch` is true *or*
 * when value is not a URL and `shouldMatch` is false.
 *
 * @param  {Boolean} shouldMatch Should the value be valid
 * @return {Boolean}
 */
Dependency.prototype.url = function( shouldMatch ) {
	let regex = /(((http|ftp|https):\/\/)|www\.)[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?\^=%&:\/~\+#!]*[\w\-\@?\^=%&\/~\+#])?/;
	return this.match( regex ) === shouldMatch;
};

/**
 * Qualifier method which checks that the value within an inclusive
 * numerical range
 * ---
 * Returns true when the value falls within the range. Alpha characters can
 * also be evaluated, and will only be considered valid when the range values
 * are also apha characters.
 *
 * @param  {Number|Character} start The range start
 * @param  {Number|Character} end The range extend
 * @param  {Number}           [step] The number of steps
 * @return {Boolean}
 */
Dependency.prototype.range = function( start, end, step ) {
	let type     = typeof start === 'string' ? 'char' : 'number';
	let startVal = type === 'char' ? start.charCodeAt() : start;
	let endVal   = type === 'char' ? end.charCodeAt() : end;
	let val      = type === 'char' ? this.fieldState.value.charCodeAt() : parseFloat( this.fieldState.value );

	if( step ) {
		let valArray = [];
		for( let i = startVal; i <= endVal; i += step ) {
			valArray.push( i );
		}
		return valArray.indexOf( val ) >= 0;
	} else {
		if( val >= startVal && val <= endVal ) {
			return true;
		}
	}
	return false;
};

/**
 * Check the dependency value against all of its qualifiers. If
 * qualifiers contains an unknown qualifier, treat it as a custom
 * qualifier and execute the function.
 *
 * @return {Boolean}
 */
Dependency.prototype.doesQualify = function() {
	for( let q in this.qualifiers ) {
		if( !this.qualifiers.hasOwnProperty( q ) ) {
			continue;
		}

		let $callback = this.method_alias( q );
		console.log( $callback );
		if( this.methods.indexOf( $callback ) && typeof this[ $callback ] === 'function' ) {
			if( $callback === 'range' ) {
				if( !this[ $callback ].apply( this, this.qualifiers[ q ] ) ) {
					return false;
				}
			} else {
				if( !this[ $callback ].call( this, this.qualifiers[ q ] ) ) {
					return false;
				}
			}
		} else if( typeof this.qualifiers[ q ] === 'function' ) {
			if( !this.qualifiers[ q ].call( this.qualifiers, this.$ele.val() ) ) {
				return false;
			}
		}
	}
	return true;
};

module.exports = Dependency;

/**
 * Get the current state of a field
 * @param  {jQuery} $ele The element
 * @return {Object}
 * @private
 */
function getFieldState( $ele ) {
	let val = $ele.val();

	// If dependency is a radio group, then filter by `:checked`
	if( $ele.attr( 'type' ) === 'radio' ) {
		val = $ele.filter( ':checked' ).val();
	}

	return {
		value: val,
		checked: $ele.is( ':checked' ),
		disabled: $ele.is( ':disabled' ),
		selected: $ele.is( ':selected' )
	};
}

// Array.isArray polyfill
if( !Array.isArray ) {
	Array.isArray = function( arg ) {
		return Object.prototype.toString.call( arg ) === '[object Array]';
	};
}

// Number.isNaN polyfill
Number.isNaN = Number.isNaN || function( value ) {
	return value !== value;
};

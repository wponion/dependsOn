# WPOnion DependsOn

A jQuery plugin to facilitate the handling of form field dependencies.

```javascript
$( subject ).WPOnion_dependsOn( dependencySet, [options] );
```
## Examples

[Demo](http://wponion.github.com/dependsOn)

## Installation

### with npm

```
npm install --save @wponion/jquery-depends-on
```

### Download directly

[Latest Release](https://github.com/wponion/dependsOn/releases/latest)

### Build from source
```
git clone https://github.com/wponion/dependsOn.git
cd dependsOn
npm install
gulp

# --> dist/wponion-dependsOn.js
```

## Usage

**Include jQuery (requires v1.7 or higher)**

```<script type="text/javascript" src="jquery/jquery-1.7.2.min.js"></script>```


**Include dependsOn**

```<script type="text/javascript" src="wponion-dependsOn.js"></script>```

**Add form components**

```html
<form id="myForm">
	<label for="myCheck">Check Me</label>
	<input type="checkbox" id="myCheck">

	<label for="myText">Input</label>
	<input type="text" id="myText" value="">
</form>
```

**Activate plugin**

```js
$('#myText').WPOnion_dependsOn({
	// The selector for the depenency
	'#myCheck': {
		// The dependency qualifiers
		enabled: true,
		checked: true
	}
});
```

## Qualifiers

|Qualifiers|Description|Alias|
|----------|-----------|-----|
| `enabled`| (Boolean) If true, then dependency must not have the "disabled" attribute.||
| `checked` |  (Boolean) If true, then dependency must not have the "checked" attribute. Used for checkboxes only. ||
| `values`| (Array/String) Dependency value must equal one of the provided values.<br/> if provided value is **array**.<br/> if provided value is **string** then it must match.| `=` , `==` , `===` , `equals` , `OR` , `or` , `\|\|`|
| `not_equals`| (String) Dependency value must not match.| `!=` , `!==` , `!===` , `!equals`|
| `empty`| Dependency value must be empty.|`''` , `""` , `EMPTY`|
| `not_empty`| Dependency value must not be empty.|`!''` , `!""` , `!empty` , `!EMPTY`|
| `not`| (Array) Dependency value must not equal any of the provided values.| |
| `match`| (RegEx) Dependency value must match the regular expression.| |
| `notMatch`| (RegEx) Dependency value must not match the regular expression.||
| `contains`| (Array) One of the provided values must be contained in an array of dependency values. Used for select fields with the "multiple" attribute.|`in` , `IN` , `has` , `HAS`|
| `email`| (Boolean) If true, dependency value must match an email address.||
| `url`| (Boolean) If true, Dependency value must match an URL.||
| `range`| (Array) Dependency value must be within the given range.||
| `gt`| (Int) Dependency value must be greater than given value.| `>` |
| `gte`| (Int) Dependency value must be greater than given or equal value.| `>=` |
| `lt`| (Int) Dependency value must be lesser than given value.| `<` |
| `lte`| (Int) Dependency value must be lesser than given or equal value.| `<=` |
| `Custom`| (Function) Custom function which return true or false.||

## Options
| Option Name | Description | Default |
| ----------- | ----------- | ------- |
|`disable` | (Boolean) Add "disabled" attribute to the subject's form field. | **true** | 
|`readonly` | (Boolean) Add "readonly" attribute to the subject's form field.| **false** |
|`hide` | (Boolean) Hide the subject on disable and reveal the subject on enable.| **true** |
|`duration` | (Number) The time in milliseconds for the fade transition. Used only if `hide` is set to true| **200** |
|`trigger` | (String) The event used to check dependencies.| `'change'` |
|`onEnable` | (Function) The callback function to execute when the subject has been enabled| - |
|`onDisable` | (Function) The callback function to execute when the subject has been disabled.| - |
|`valueOnEnable` | (String) The value to set the subject to when enabled.| - |
|`valueOnDisable` | (String) The value to set the subject to when disabled.| - |
|`checkOnEnable` | (Boolean) If true, "checked" attribute will be added to subject when enabled. If false, "checked" attribute will be removed from subject when enabled. For checkboxes and radio buttons.| - |
|`checkOnDisable` | (Boolean) If true, "checked" attribute will be added to subject when disabled. If false, "checked" attribute will be removed from subject when disabled. For checkboxes and radio buttons.| - |
|`valueTarget` | (String) jQuery selector for the object to you want to target for editing the value. Use if you want to alter the value of something other than the subject.| - |
|`toggleClass` | (String) The class you wish to be appended to the subject when enabled. The class will be removed when the subject is disabled.| - |

## Callbacks

When the `onEnable` and `onDisable` callbacks are called, `this` is set to the last triggered dependency, and the function is passed two arguments:
* `e`: The triggering event object
* `$subject`: The jQuery object of the subject

## Other Libraries

* [rails_depends_on](https://github.com/francescob/rails_depends_on) - Rails Gem for dependsOn
* [depends_on](https://github.com/dstreet/dependsOn) - jQuery for dependsOn

## License
This project is licensed under **MIT**. See the [LICENSE](LICENSE) file for more info.

## Backed By
| [![DigitalOcean][do-image]][do-ref] | [![JetBrains][jb-image]][jb-ref] |  [![Tidio Chat][tidio-image]][tidio-ref] |
| --- | --- | --- |

[do-image]: https://vsp.ams3.cdn.digitaloceanspaces.com/cdn/DO_Logo_Horizontal_Blue-small.png
[jb-image]: https://vsp.ams3.cdn.digitaloceanspaces.com/cdn/phpstorm-small.png?v3
[tidio-image]: https://vsp.ams3.cdn.digitaloceanspaces.com/cdn/tidiochat-small.png
[do-ref]: https://s.svarun.in/Ef
[jb-ref]: https://www.jetbrains.com
[tidio-ref]: https://tidiochat.com
# shCropbox

Drag and drop cropping a rectangle area from image (or any DOM object).

Pacel Tzonkov (sunhater@sunhater.com)
https://github.com/sunhater/shCropbox

## License

* MIT License

## Installation

Just include jQuery and shCropbox source files

```html
<html>
    <head>
        ...
        <script src="http://code.jquery.com/jquery-2.0.3.min.js" type="text/javascript"></script>
        <script src="/your/path/to/sh-cropbox.js" type="text/javascript"></script>
        <link href="/your/path/to/sh-cropbox.css" type="text/css" />
        ...
  </head>
  <body>
        ...
  </body>
</html>
```

## Creation

Put your image into HTML body and give it an `id` attribute.

```html
<img id="cropbox" src="https://www.thewowstyle.com/wp-content/uploads/2015/03/Desktop-Wallpaper-HD2.jpg" width="100%" />
```

Then put such JavaScript code:

```javascript
$('#cropbox').shCropbox();
```

Now you can move and resize the cropping area. See the browser console. It will output the coordinates (`x` and `y`) and the size (`width` and `height`) of cropping area and the size of the displayed image (`xMax` and `yMax`). 

You can set your own callback to get these values using the `update` option:

```javascript
$('#cropbox').shCropbox({
    update: function(x, y, width, height, xMax, yMax) {
        // Your own code
    }
});
```

## Other Options 

| Name: `min` | Type: `integer` | Default: `50` |
|-------------|-----------------|---------------|

Minimum size (width and height) of cropping area

| Name: `scrollPreventTouch` | Type: `jQuery selector` | Default: `body` |
|----------------------------|-------------------------|-----------------|

Selects the element to disable scrolling when move and resize the cropping area

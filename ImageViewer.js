/*!
 * JQuery ImageViewer Plugin 1.1.1
 * Copyright (C) 2014-2015 Yuzhou Feng <http://eternalcat.com>
 *
 *Usage: $("#").imageViewer(imgURL);
 */
(function ($) {
    var offsetX, offsetY;
    var distance1, distance2;
    var panning = false;
    var zooming = false;
    var startX0;
    var startY0;
    var startX1;
    var startY1;
    var endX0;
    var endY0;
    var endX1;
    var endY1;
    var startDistanceBetweenFingers;
    var endDistanceBetweenFingers;
    var pinchRatio;
    var imgWidth = 100;
    var imgHeight = 100;

    var currentContinuousZoom = 1.0;
    var currentOffsetX = 0;
    var currentOffsetY = 0;
    var currentWidth = imgWidth;
    var currentHeight = imgHeight;

    var newContinuousZoom;
    var newHeight;
    var newWidth;
    var newOffsetX;
    var newOffsetY;

    var centerPointStartX;
    var centerPointStartY;
    var centerPointEndX;
    var centerPointEndY;
    var translateFromZoomingX;
    var translateFromZoomingY;
    var translateFromTranslatingX;
    var translateFromTranslatingY;
    var translateTotalX;
    var translateTotalY;

    var percentageOfImageAtPinchPointX;
    var percentageOfImageAtPinchPointY;

    var sizeRatio;
    //var zoomLevel=1;

    $.fn.imageViewer = function (options) {
        var imageViewer = $(this);
        this.css("overflow","hidden").css("position","relative");
        this.empty();
        theImageTag = "<img id='pic' style='position:absolute;left:0px;top:0px;'></div>";
        theZoomBtnTag = "<div style='position:absolute;z-index:1000;'><button id='zoomIn'>+</button><button id='zoomReset'>Reset</button><button id='zoomOut'>-</button></div>";
        this.append(theImageTag);
        this.append(theZoomBtnTag);
        var img = new Image();
        //img.src = "altamarker.png";
        if (options) {
            img.src = options;
        } else {
            img.src = "altamarker1.png";
        }
        img.onload = function () {
            sizeRatio = img.height / img.width;
            //img.height = parseInt(imageViewer.css("height"));
            //img.width = img.height / sizeRatio;
            img.width = parseInt(imageViewer.css("width"));
            img.height = img.width * sizeRatio;
            imgWidth = img.width;
            imgHeight = img.height;
            currentWidth = imgWidth;
            currentHeight = imgHeight;

            $("#pic").css("width", img.width).css("height", img.height).css("z-index","1").attr("src", img.src);
        };

        var theImage = document.getElementById('pic');

        currentOffsetX = theImage.offsetLeft;
        currentOffsetY = theImage.offsetTop;

        $("#zoomIn").bind("mousedown", function (e) {
            //zoomLevel *= 1.1;
            currentOffsetX = parseInt(theImage.style.left) - 0.05 * parseInt(theImage.style.width);
            currentOffsetY = parseInt(theImage.style.top) - 0.05 * parseInt(theImage.style.height);
            currentWidth = parseInt(theImage.style.width) * 1.1;
            currentHeight = currentWidth * sizeRatio;
            theImage.style.left = currentOffsetX + "px";
            theImage.style.top = currentOffsetY + "px";
            theImage.style.width = currentWidth + "px";
            theImage.style.height = currentHeight + "px";
            //$("#zoomLevel").val(parseInt(zoomLevel * 100) + "%");
        });
        //.css("z-index","1000").css("position","absolute");

        $("#zoomOut").bind("mousedown", function (e) {
            //zoomLevel *= 0.9;
            currentOffsetX = parseInt(theImage.style.left) + 0.05 * parseInt(theImage.style.width);
            currentOffsetY = parseInt(theImage.style.top) + 0.05 * parseInt(theImage.style.height);
            currentWidth = parseInt(theImage.style.width) * 0.9;
            currentHeight = currentWidth * sizeRatio;
            theImage.style.left = currentOffsetX + "px";
            theImage.style.top = currentOffsetY + "px";
            theImage.style.width = currentWidth + "px";
            theImage.style.height = currentHeight + "px";
            //$("#zoomLevel").val(parseInt(zoomLevel*100)+"%");
        });
        //.css("z-index", "1000").css("position", "absolute");

        $("#zoomReset").bind("mousedown", function (e) {
            currentOffsetX = 0;
            currentOffsetY = 0;
            currentWidth = imgWidth;
            currentHeight = imgHeight;
            theImage.style.left = currentOffsetX + "px";
            theImage.style.top = currentOffsetY + "px";
            theImage.style.width = currentWidth + "px";
            theImage.style.height = currentHeight + "px";
            //this.val("100%");
        });

        theImage.addEventListener('touchstart', function (event) {
            panning = false;
            zooming = false;
            if (event.touches.length == 1) {
                panning = true;
                startX0 = event.touches[0].pageX;
                startY0 = event.touches[0].pageY;

            }
            if (event.touches.length == 2) {
                zooming = true;
                startX0 = event.touches[0].pageX;
                startY0 = event.touches[0].pageY;
                startX1 = event.touches[1].pageX;
                startY1 = event.touches[1].pageY;
                //Log("2finger:" + startX0 + ":" + startY0 + ", " + startX1 + ":" + startY1);
                centerPointStartX = ((startX0 + startX1) / 2.0);
                centerPointStartY = ((startY0 + startY1) / 2.0);
                //Log("Center Start:" + centerPointStartX + ":" + centerPointStartY);
                percentageOfImageAtPinchPointX = (centerPointStartX - currentOffsetX) / currentWidth;
                percentageOfImageAtPinchPointY = (centerPointStartY - currentOffsetY) / currentHeight;
                startDistanceBetweenFingers = Math.sqrt(Math.pow((startX1 - startX0), 2) + Math.pow((startY1 - startY0), 2));
            }
        });

        theImage.addEventListener('touchmove', function (event) {
            // This keeps touch events from moving the entire window.
            event.preventDefault();

            if (panning) {
                endX0 = event.touches[0].pageX;
                endY0 = event.touches[0].pageY;
                translateFromTranslatingX = endX0 - startX0;
                translateFromTranslatingY = endY0 - startY0;
                newOffsetX = currentOffsetX + translateFromTranslatingX;
                newOffsetY = currentOffsetY + translateFromTranslatingY;
                theImage.style.left = newOffsetX + "px";
                theImage.style.top = newOffsetY + "px";
            }
            else if (zooming) {
                // Get the new touches
                endX0 = event.touches[0].pageX;
                endY0 = event.touches[0].pageY;
                endX1 = event.touches[1].pageX;
                endY1 = event.touches[1].pageY;

                // Calculate current distance between points to get new-to-old pinch ratio and calc width and height
                endDistanceBetweenFingers = Math.sqrt(Math.pow((endX1 - endX0), 2) + Math.pow((endY1 - endY0), 2));
                pinchRatio = endDistanceBetweenFingers / startDistanceBetweenFingers;
                newContinuousZoom = pinchRatio * currentContinuousZoom;
                newWidth = imgWidth * newContinuousZoom;
                newHeight = imgHeight * newContinuousZoom;
                // Get the point between the two touches, relative to upper-left corner of image
                centerPointEndX = ((endX0 + endX1) / 2.0);
                centerPointEndY = ((endY0 + endY1) / 2.0);
                //Log("Center End:" + centerPointEndX + ":" + centerPointEndY);
                // This is the translation due to pinch-zooming
                translateFromZoomingX = (currentWidth - newWidth) * percentageOfImageAtPinchPointX;
                translateFromZoomingY = (currentHeight - newHeight) * percentageOfImageAtPinchPointY;

                // And this is the translation due to translation of the centerpoint between the two fingers
                translateFromTranslatingX = centerPointEndX - centerPointStartX;
                translateFromTranslatingY = centerPointEndY - centerPointStartY;

                // Total translation is from two components: (1) changing height and width from zooming and (2) from the two fingers translating in unity
                translateTotalX = translateFromZoomingX + translateFromTranslatingX;
                translateTotalY = translateFromZoomingY + translateFromTranslatingY;

                // the new offset is the old/current one plus the total translation component
                newOffsetX = currentOffsetX + translateTotalX;
                newOffsetY = currentOffsetY + translateTotalY;
                //Log("pos:" + percentageOfImageAtPinchPointX + ":" + percentageOfImageAtPinchPointY);
                // Set the image attributes on the page
                theImage.style.left = newOffsetX + "px";
                theImage.style.top = newOffsetY + "px";
                theImage.style.width = newWidth + "px";
                theImage.style.height = newHeight + "px";
            }
        });

        theImage.addEventListener('touchend', function (event) {
            if (panning) {
                panning = false;
                currentOffsetX = newOffsetX;
                currentOffsetY = newOffsetY;
            }
            else if (zooming) {
                zooming = false;
                currentOffsetX = newOffsetX;
                currentOffsetY = newOffsetY;
                currentWidth = newWidth;
                currentHeight = newHeight;
                currentContinuousZoom = newContinuousZoom;
            }

        });

        function zoomImg(o, e) {
            //document.write(e.originalEvent.wheelDelta + ":" + e.originalEvent.detail + "<br/>");
            var delta = (e.originalEvent.wheelDelta < 0 || e.originalEvent.detail > 0) ? 1 : -1;

            //	var delta = e.detail < 0 || e.wheelDelta > 0 ? 1 : -1;
            var zoom = (delta < 0) ? 1.1 : 0.9;
            //	var zoom=(event.wheelDelta>0)?1.1:0.9;
            //	var zoom = (e.originalEvent.wheelDelta /120 > 0) ?1.1:0.9;
            o.style.left = Math.round(e.originalEvent.pageX - offsetX * zoom) + 'px';
            o.style.top = Math.round(e.originalEvent.pageY - offsetY * zoom) + 'px';

            o.style.width = parseInt(o.style.width) * zoom + "px";
            o.style.height = parseInt(o.style.width) * sizeRatio + "px";
        }

        $("#pic").bind("mousewheel DOMMouseScroll", function (e) {

            //offsetX = e.pageX- parseInt(this.style.left);
            //offsetY = e.pageY-parseInt(this.style.top); 
            //document.write(e.originalEvent.pageX + " : " + e.originalEvent.clientX + "<br/>");
            offsetX = e.originalEvent.pageX - parseInt(this.style.left);
            offsetY = e.originalEvent.pageY - parseInt(this.style.top);
            zoomImg(this, e);
            return false;
        });
       $("#pic").draggable();
    }
}(jQuery));

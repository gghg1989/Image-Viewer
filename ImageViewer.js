/**
 * <h3>JQuery ImageViewer Plugin 1.3.6</h3>
 * Copyright (C) 2014-2017 Yuzhou Feng <http://eternalcat.com>
 * <br/>
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * <br/>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * Usage: $("#").imageViewer(imgURL);
 */
 
(function ($) {
    var offsetX, offsetY;
    var offsetW, offsetH;
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
    var dragLock = true;
    var viewerX, viewerY;

    var theImage;

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
            img.src = "./property.jpg";
        }
        img.onload = function () {
            setTimeout(function(){ //TEMP solution for cannot get plugin width bug
                offsetW = imageViewer.width();
                offsetH = imageViewer.height();
                // viewerX = imageViewer.offset().left;
                // viewerY = imageViewer.offset().top;

                sizeRatio = img.height / img.width;
                img.width = offsetW;
                img.height = img.width * sizeRatio;

                currentOffsetX = Math.round((offsetW  - img.width) / 2);
                currentOffsetY = Math.round((offsetH  - img.height) / 2);
                
                //img.width = img.height / sizeRatio;
                // if( parseInt(imageViewer.css("width")) != 0 ) {
                //     img.width = parseInt(imageViewer.css("width"));
                //     img.height = img.width * sizeRatio;
                // }
                // else if ( parseInt(imageViewer.css("height"))  != 0 ) {
                //     img.height = parseInt(imageViewer.css("height"));
                //     img.width = img.height / sizeRatio;
                // }
                
                imgWidth = img.width;
                imgHeight = img.height;
                currentWidth = imgWidth;
                currentHeight = imgHeight;

                $("#pic").css("width", img.width)
                    .css("height", img.height)
                    .css("left", currentOffsetX+"px")
                    .css("top", currentOffsetY+"px")
                    .css("z-index","1")
                    .attr("src", img.src);
            },200);
        };

        var theImage = document.getElementById('pic');
        // theImage.style.cursor = "-webkit-grab";
        currentOffsetX = theImage.offsetLeft; //Returns the horizontal offset position 
        currentOffsetY = theImage.offsetTop;  //Returns the vertical offset position



        // Check image size, if smaller than viewer
        var checkSize = function() {
            // console.log(parseInt(theImage.style.width) <= offsetW + ":" + parseInt(theImage.style.height) <= offsetH)
            if(parseInt(theImage.style.width) <= offsetW || parseInt(theImage.style.height) <= offsetH) {
                dragLock = true;
                theImage.style.cursor = "";
                currentOffsetX = Math.round((offsetW  - parseInt(theImage.style.width)) / 2);
                currentOffsetY = Math.round((offsetH  - parseInt(theImage.style.height)) / 2);

                theImage.style.left = currentOffsetX + "px";
                theImage.style.top = currentOffsetY + "px";
            }
            else {
                dragLock = false;
                theImage.style.cursor = "-webkit-grab";
            }
        }

        // checkSize();

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
            checkSize();
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
            checkSize();
            //$("#zoomLevel").val(parseInt(zoomLevel*100)+"%");
        });
        //.css("z-index", "1000").css("position", "absolute"); 

        $("#zoomReset").bind("mousedown", function (e) {
            currentWidth = imgWidth;
            currentHeight = imgHeight;
            theImage.style.width = currentWidth + "px";
            theImage.style.height = currentHeight + "px";
            currentOffsetX = Math.round((offsetW  - parseInt(theImage.style.width)) / 2);
            currentOffsetY = Math.round((offsetH  - parseInt(theImage.style.height)) / 2);
            theImage.style.left = currentOffsetX + "px";
            theImage.style.top = currentOffsetY + "px";
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
                newContinuousZoom = pinchRatio; //* currentContinuousZoom;
                newWidth = currentWidth * newContinuousZoom;
                newHeight = currentHeight * newContinuousZoom;
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
                // Log("pos:" + percentageOfImageAtPinchPointX + ":" + percentageOfImageAtPinchPointY);
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
                
                //currentContinuousZoom = newContinuousZoom;
            }

        });

        
        function zoomImg(event) {
            event.preventDefault();

            offsetX = event.pageX - parseInt(theImage.style.left);
            offsetY = event.pageY - parseInt(theImage.style.top);
            
            var delta = (event.originalEvent.wheelDelta < 0 || event.originalEvent.detail > 0) ? 1 : -1;
            //  var delta = e.detail < 0 || e.wheelDelta > 0 ? 1 : -1;
            var zoom = (delta < 0) ? 1.1 : 0.9;

            theImage.style.width = parseInt(theImage.style.width) * zoom + "px";
            theImage.style.height = parseInt(theImage.style.width) * sizeRatio + "px";
            
            //  var zoom=(event.wheelDelta>0)?1.1:0.9;
            //  var zoom = (e.originalEvent.wheelDelta /120 > 0) ?1.1:0.9;
            currentOffsetX = Math.round(event.pageX - offsetX * zoom);
            currentOffsetY = Math.round(event.pageY - offsetY * zoom);
            
            // Check image drag boundaries
            var rightBoundary = offsetW - parseInt(theImage.style.width);
            var bottomBoundary = offsetH - parseInt(theImage.style.height);
            if(currentOffsetX >= 0) {
                currentOffsetX = 0;
            }
            else if(currentOffsetX <= rightBoundary) {
                currentOffsetX = rightBoundary;
            }
            if(currentOffsetY >= 0) {
                currentOffsetY = 0;
            }
            else if(currentOffsetY < bottomBoundary) {
                currentOffsetY = bottomBoundary;
            }

            theImage.style.left = currentOffsetX + "px";
            theImage.style.top = currentOffsetY + "px";
            
            
            checkSize();
        }
         
        // theImage.addEventListener("mousewheel", function(event) {zoomImg(event)});
     
        // theImage.addEventListener("DOMMouseScroll", function(event) {zoomImg(event)});

        $(theImage).on("mousewheel", function(event) {zoomImg(event)})
        
        var dragged;
        var dragFlag = false;
        theImage.addEventListener("mousedown", function(event) {

            // Avoiding the events which comes from the browser itself
            event.preventDefault();

            if(dragLock) return;
            
            theImage.style.cursor = "-webkit-grabbing";

            startX0 = event.pageX;
            startY0 = event.pageY;
            
            dragFlag = true;
            
            // store a ref. on the dragged elem
            dragged = event.target;
            // make it half transparent
            // dragged.style.opacity = .5; 
        }, false);
        
        theImage.addEventListener("mousemove", function(event) {
            if(dragLock) return;
            
            //console.log(event.pageX + ":" + event.pageY);
            if (dragFlag) {
                // console.log(event.pageX + ":" + event.pageY);
                theImage.style.cursor = "-webkit-grabbing";
                endX0 = event.pageX;
                endY0 = event.pageY;
                translateFromTranslatingX = endX0 - startX0;
                translateFromTranslatingY = endY0 - startY0;
                newOffsetX = currentOffsetX + translateFromTranslatingX;
                newOffsetY = currentOffsetY + translateFromTranslatingY;
                
                // Check image drag boundaries
                var rightBoundary = offsetW - parseInt(theImage.style.width);
                var bottomBoundary = offsetH - parseInt(theImage.style.height);
                if(newOffsetX >= 0) {
                    newOffsetX = 0;
                }
                else if(newOffsetX <= rightBoundary) {
                    newOffsetX = rightBoundary;
                }
                if(newOffsetY >= 0) {
                    newOffsetY = 0;
                }
                else if(newOffsetY < bottomBoundary) {
                    newOffsetY = bottomBoundary;
                }
                // console.log(newOffsetX + ":" + newOffsetY);
                theImage.style.left = newOffsetX + "px";
                theImage.style.top = newOffsetY + "px";
            }
        }, false);
        
        theImage.addEventListener("mouseup", function(event) { mouseUp();}, false);
        
        // deal with the problem when mouse point is out side the window
        theImage.addEventListener("mouseout", function(event) { mouseUp();}, false);
        
        function mouseUp() {
            if(dragLock) return;


            currentOffsetX = newOffsetX;
            currentOffsetY = newOffsetY;
            
            dragFlag = false;
            // reset the transparency
            theImage.style.cursor = "-webkit-grab";
            event.target.style.opacity = "";
        }
            
        //$("#pic").draggable();
    }
}(jQuery));

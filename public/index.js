
var socket = io.connect('http://localhost:4000');
(function() {
    'use strict';

    var $ = document;
    navigator.getUserMedia  = navigator.getUserMedia ||  navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
//The HTML <canvas> element is used to draw graphics, on the fly, via JavaScript.The <canvas> element is only a container for graphics. You must use JavaScript to actually draw the graphics.Canvas has several methods for drawing paths, boxes, circles, text, and adding images.
    var video = $.getElementById('video-source');
    var canvasSource = $.getElementById('canvas-source');
    var canvasBlended = $.getElementById('canvas-source-blend');


    //The HTMLCanvasElement.getContext() method returns a drawing context on the canvas, or null if the context identifier is not supported.


    var contextSource = canvasSource.getContext('2d');
    var contextBlended = canvasBlended.getContext('2d');
    //Returns a list of the elements within the document (using depth-first pre-order traversal of the document's nodes) that match the specified group of selectors. The object returned is a NodeList.

    var lastImageData;

    // invert the x axis of webcam steram so the user feels like they are in front of a mirror
  contextSource.translate(canvasSource.width, 0);
   contextSource.scale(-1,1);

    video.style.display = 'none';




    navigator.getUserMedia({
        audio: true,
        video: true
    }, gotStream, gotStreamFail);

    function gotStream(stream) {
        video.src = URL.createObjectURL(stream);
//The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint.
        requestAnimationFrame(update);
    }

    function gotStreamFail(error) {
        console.error(error);
    }


    function drawVideo() {
        socket.on('difference', function(data){
            contextSource.drawImage(video, 0,0,video.width,video.height);
            outer.innerHTML += '<p><strong>' + data+ ': </strong></p>';

        //contextSource.drawImage(video, 0,0,video.width,video.height);
        // while(i<100){
        //
        // socket.on('difference', function(data){
        //     contextSource.drawImage(video, 0,0,video.width,video.height);
        //     outer.innerHTML += '<p><strong>' + i+ data+ ': </strong></p>';
        //     i++;
        });
    }


    // black and white only
    function differenceAccuracy(target, data1, data2) {
       // if (data1.length !== data2.length) return null;
        var i = 0;
        while(i < (data1.length)) {
            var average1 = (data1[i] + data1[i+1] + data1[i+2]) / 3;
            var average2 = (data2[i] + data2[i+1] + data2[i+2]) / 3;
            var diff = threshold(Math.abs(average1 - average2));

            target[i] = diff;
            target[i+1] = diff;
            target[i+2] = diff;
            target[i+3] = 0xFF;
            i=i+4;
            //callback();
            //socket.emit('difference',"difference detected");
        }

    }
    function callback()
    {
        socket.emit('difference',"Motion detected");
    }


    // return white or black if threshold reached
    function threshold(value) {
        return (value > 0x20) ? 0xFF : 0;
    }
    function blend() {
        var width = canvasSource.width;
        var height = canvasSource.height;
        var sourceData = contextSource.getImageData(0,0,width,height);
        //if last image does not exist then last image is equal to source image
        if (!lastImageData) lastImageData = sourceData;
        var blendedData = contextSource.createImageData(width, height);
        differenceAccuracy(blendedData.data, sourceData.data, lastImageData.data);
        contextBlended.putImageData(blendedData, 0, 0);
        lastImageData = sourceData;
        callback();
    }
    function update(now) {
        drawVideo();
        blend();

        requestAnimationFrame(update);
    }
  /*  socket.on("image", function(info) {
        if (info.image) {
            //var img = new Image();
            //img.src = 'data:image/jpeg;base64,' + info.buffer;
            //ctx.drawImage(img, 0, 0);
            console.log(hiiiii);
            contextSource.drawImage(video, 0,0,video.width,video.height);
        }
    });*/

})();


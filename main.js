var penguinTemplate = document.querySelector('#penguin-animation');
var errorTemplate = document.querySelector('#error-modal');
var requestTemplate = document.querySelector('#request-modal');


if(!("FaceDetector" in window)) {
    document.body.appendChild(errorTemplate.content);
    throw new Error('Face recognition not supported on this device');
}

var penguin = penguinTemplate.content.querySelector('#penguin');
var detector = new FaceDetector();
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var video = document.createElement('video');
var img = new Image();
var cameraStream = null;
let isAnim = true;
let t = 0;


function stopAnim(){
    isAnim=false;
    penguin.pauseAnimations();
    penguin.classList.add('paused');
}
function startAnim(){
    isAnim=true;
    penguin.unpauseAnimations();
    penguin.classList.remove('paused');
}
function openCamera(){
    function success(stream){
        cameraStream = stream;
        video.srcObject = stream;
        video.play();
        video.onloadedmetadata = function(){
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        };
        document.body.innerHTML = '';
        document.body.appendChild(penguinTemplate.content);
        recognitionFrame();
    }
    function failure(){
        navigator.permissions.query({name: 'camera'}).then(function(res){
           if(res.state === 'granted') {
               openCamera();
           }else {
               setTimeout(failure, 200)
           }
        });
    }
    if (navigator.getUserMedia)
        navigator.getUserMedia({audio:false, video:true}, success, failure);
    else
        alert("Your browser does not support getUserMedia()");
}
function recognitionFrame(){
    ctx.drawImage(video, 0,0,canvas.width,canvas.height);
    img.src = canvas.toDataURL();
}
function throttle(f){
    clearTimeout(t);
    setTimeout(f, 500);
}
img.onload = () => {
    detector.detect(img).then(function(faces){
        if(faces?.length) {
            isAnim && throttle(stopAnim);
        } else {
            !isAnim && throttle(startAnim);
        }
        setTimeout(recognitionFrame,100);
    });
};
navigator.permissions.query({name: 'camera'}).then(function(res){
   if(res.state !== "granted") {
       document.body.append(requestTemplate.content);
       openCamera();
   } else {
       openCamera();
   }
});

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800; //declares variables which let the script know what the html has drawn the canvas at
canvas.height = 500;

const keys = [];
const refugees = []; //refugee array
const troops = []; //stormtrooper array
const refugeeNumbers = 15; //number of refugees allowed at once 
const troopsNumbers = 15; //number of troops allowed at once(placeholder)
var score = 0; //number of refugees safely arrived
var dead = 0;
var refugeeSpawns = 0; //track total number of refugee spawns since start
const maxRefugeeSpawns = 150; //150

const playerSprite = new Image ();
playerSprite.src = "assets/sprites/chewie.png";
const background = new Image ();
background.src = "assets/background.png";
const troopSprite = new Image ();
troopSprite.src = "assets/sprites/stormtrooper.png";
const boom = new Image ();
boom.src = "assets/sprites/boom.png";

const refugeeSprites = [];
const refugee1 = new Image ();
refugee1.src = "assets/sprites/toby.png";
const refugee2 = new Image ();
refugee2.src = "assets/sprites/tobywig.png";
const refugee3 = new Image ();
refugee3.src = "assets/sprites/bith.png";
const refugee4 = new Image ();
refugee4.src = "assets/sprites/c3p0.png";
const refugee5 = new Image ();
refugee5.src = "assets/sprites/dart.png";
const refugee6 = new Image ();
refugee6.src = "assets/sprites/falleen1.png";
const refugee7 = new Image ();
refugee7.src = "assets/sprites/jawa.png";
const refugee8 = new Image ();
refugee8.src = "assets/sprites/oola.png";
const refugee9 = new Image ();
refugee9.src = "assets/sprites/toki.png";
refugeeSprites.push(refugee1, refugee2, refugee3, refugee4, refugee5, refugee6, refugee7, refugee8, refugee9);

function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH){
  ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

const player = {
  x: 200,
  y: 200,
  width: 40,
  height: 72,
  frameX: 0,
  frameY: 3,
  speed: 9, 
  moving: false
};

class Refugee {
  constructor(){
    this.width = 32;
    this.height = 48;
    this.frameX = 0;
    this.frameY = 3;
    this.x = (Math.random() * (150 - 0) + 0);
    this.y = (Math.random() * (1250-550) + 550);//stagger starting y to simulate timed spawn start
    this.sprite = refugeeSprites[Math.floor(Math.random() * refugeeSprites.length)]; //randomise sprite
    this.moving = false;
    this.speed = (Math.random() * ((player.speed * 0.5) - (player.speed * 0.25)) + (player.speed * 0.25));
    this.destX = (Math.random() * (100 - 20) + 20); //Math.random() * (max-min) + min
    this.destY = 100;
    this.arrived = false;
    this.dead = false;
    //this.toClosest = undefined;
  }
  draw(){
    drawSprite(this.sprite, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
      if (this.frameX < 3 && this.moving) this.frameX++
      else this.frameX = 0;
    }  
  update(){
    if (this.y > this.destY) { //moving up the screen logic
      this.y -= this.speed;
      this.moving = true;
    }
    if (this.x > this.destX && this.y < canvas.height-100){//correcting for X
      this.x -= (this.speed * 0.2);
      this.moving = true;
    }
    if (this.x < this.destX && this.y < canvas.height-100){//correction for X
      this.x += (this.speed * 0.2);
      this.moving = true;
    }
    if (this.x > (this.destX-5) && this.x < (this.destX + 5) && this.y <= this.destY) {
      this.moving = false; //arrival logic
      this.arrived = true;
    }
  }
  remove(){
    let i = refugees.indexOf(this);
    if (this.arrived === true) {
      refugees.splice(i, 1);
      score++;
    }
    if (this.dead === true) {
      refugees.splice(i, 1);
      dead++;
    }
  }
}

/* move enemy sprite towards player: 
//calculate direction towards player
toPlayerX = playerX - this.x;
toPlayerY = playerY - this.y;
//normalise
toPlayerLength = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY); //total distance to cover
toPlayerX = toPlayerX / toPlayerlength; //proportion of total distance in X axis
toPlayerY = toPlayerY / toPlayerLength; 
//move towards player
this.x += toPlayerX * this.speed;
this.y += to playerY * this.speed;*/


class Troop {
  constructor(){
    this.width = 32;
    this.height = 48;
    this.frameX = 0;
    this.frameY = 1;
    this.moving = false;
    this.x = 400; //placeholder values for sprite check
    this.y = 250; //placeholder values for sprite check
    this.speed = 7; //placeholder, define better later
    this.target = refugees[(Math.floor(Math.random() * (refugees.length)))]; //which index of the refugee array to take targetX and targetY from
    this.targetX = 0;
    this.targetY = 0;
    this.toTargetX = 0;
    this.toTargetY = 0;
    this.toTargetLength = 0;
    this.destX = 0;
    this.destY = 0;
    this.firing = false;
    this.suicide = false;
    this.dead = false;
    //does it need a var to initiate despawn?
  }
  draw(){
    if (this.suicide === false){
        drawSprite(troopSprite, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
        if (this.frameX < 3 && this.moving) this.frameX++
        else this.frameX = 0;
    }
    else {
      drawSprite(boom, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
      if (this.frameY < 8) {
        this.frameX = 0;
        this.frameY++;
        if (this.frameY === 8){
          this.dead = true;
        }
      }
    }
  }
  update(){
    let sap = this.target; //couldn't figure out how to make the troop change target without declaring a local variable
    this.targetX = sap.x;
    this.targetY = sap.y;
    this.toTargetX = this.targetX - this.x;
    this.toTargetY = this.targetY - this.y;
    this.toTargetLength = Math.sqrt(this.toTargetX * this.toTargetX + this.toTargetY * this.toTargetY);
    this.toTargetX = this.toTargetX / this.toTargetLength;
    this.toTargetY = this.toTargetY / this.toTargetLength;

    if (refugees.length != 0) { //stops the troopers spazzing out endgame
      //walk towards target if target on canvas
      if (this.targetY < canvas.height-100 && this.targetX > 0){
        this.x += this.toTargetX * this.speed;
        this.y += this.toTargetY * this.speed;
      }

      //check if target has arrived and select a new target if they have
      if (sap.arrived === true){
        sap = refugees[(Math.floor(Math.random() * (refugees.length)))]
        if (sap.arrived === false) {
          this.target = sap;
        }
      }

      //check if target has arrived and select a new target if they have
      if (sap.dead === true){
        sap = refugees[(Math.floor(Math.random() * (refugees.length)))]
        if (sap.dead === false) {
          this.target = sap;
        }
      }

      //kill refugee on contact
      if (this.toTargetLength < sap.width) {
        sap.dead = true;
        this.suicide = true;
      }   

    }

    //select a refugee (for loop to cycle through refugee array and pick a refugee based on some logic (try randomising first, then try psition logic)
    //shoot at the refugee
    //walk towards the refugee stopping to shoot periodically
  }
  remove(){
    let i = troops.indexOf(this);
    if (this.dead === true) {
      troops.splice(i, 1);
    }
  }
}

refugeeSpawner = function() {
  if (refugeeSpawns < maxRefugeeSpawns && refugees.length < refugeeNumbers){
    for(i=0; i < refugeeNumbers; i++) { //add refugees to the game
      refugees.push(new Refugee());
      refugeeSpawns++;
    }
  }
}

troopSpawner = function() {
  if (troops.length < 1){
    for (i=0; i < troopsNumbers; i++) {
      troops.push(new Troop());
    }
  }
}

drawScore = function(){
  ctx.font = "normal bolder 16px verdana";
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillText ("Rescued refugees: "+score, canvas.width-200, 20);
  ctx.fillText ("Lost refugees: "+dead, canvas.width-200, 40);
}

window.addEventListener("keydown", function (e){
  keys[e.keyCode] = true;//when a key is pressed that key is added to the keys array
  player.moving = true;
});

window.addEventListener("keyup", function (e){
  delete keys[e.keyCode]; //when a key is released that key is deleted from the keys array.  This method prevents event listeners from interfering with one another and makes control more responsive.
  player.moving = false;
});

function movePlayer() {
  if (keys[38] && player.y > 100){//up
    player.y -= player.speed;
    player.frameY = 3;
    player.moving = true;
  }
  if (keys[37] && player.x > 0){//left
    player.x -= player.speed;
    player.frameY = 1;
    player.moving = true;
  }
  if (keys[40] && player.y < (canvas.height - player.height)){//down
    player.y += player.speed;
    player.frameY = 0;
    player.moving = true;
  }
  if (keys[39] && player.x < (canvas.width - player.width)){//right
    player.x += player.speed;
    player.frameY = 2;
    player.moving = true;
  }
}
function handlePlayerFrame(){
  if (player.frameX < 3 && player.moving) player.frameX++
  else player.frameX = 0;
}

let fps, fpsInterval, startTime, now, then, elapsed; //declare empty variables

function startAnimating(fps){ //function needed to kick off the animation by getting system time and tying fps to system time.
  fpsInterval = 1000/fps; //how much time passes before the next frame is served
  then = Date.now(); //Date.now is no. of ms elapsed since 1.1.1970
  startTime = then;
  animate();
}

function animate(){
  requestAnimationFrame(animate); //pass the parent function to RAF to cause it to call itself recursively
  now = Date.now();
  elapsed = now - then;
  if (elapsed > fpsInterval) { //check to see if it's time to draw the next frame
    then = now - (elapsed % fpsInterval); //resets the clock to keep frame rate consistent
    ctx.clearRect (0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    requestAnimationFrame(animate);
    //by giving requestAnimationFrame the name of it's parent function as a parameter it will run
    //repeatedly until infinity.  The function needs to be called once outside of itself to initialise.
    for (i=0; i < refugees.length; i++){
    refugees[i].draw();
    refugees[i].update();
    refugees[i].remove();
    }
    refugeeSpawner();

    for (i=0; i < troops.length; i++){
      troops[i].draw();
      troops[i].update();
      troops[i].remove();
    }
    troopSpawner();

    drawSprite(playerSprite, player.width*player.frameX, player.height*player.frameY, player.width, player.height, player.x, player.y, player.width, player.height);
    movePlayer();
    handlePlayerFrame();

    drawScore();

    console.log(troops);
    
  }
}
startAnimating(15);

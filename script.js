//COMPLETED BUILD
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800; //declares variables which let the script know what the html has drawn the canvas at
canvas.height = 500;

const keys = []; //array for storing and splicing key presses
const refugees = []; //refugee array
const troops = []; //stormtrooper array
const bolts = []; //stores bolt attributes until despawn
const shootFrame = [59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131]; //15 prime numbers for troppers shooting intervals
const refugeeNumbers = 15; //number of refugees allowed at once 
const troopsNumbers = 20; //number of troops allowed at once(placeholder)
var score = 0; //number of refugees safely arrived (adds 1 to final score)
var dead = 0; //number of refugees killed by troops (subtracts 1 from final score)
var killed = 0; //number of troops killed by player (adds 1 to final score)
var refugeeSpawns = 0; //track total number of refugee spawns since start
const maxRefugeeSpawns = 150; //number of refugees to rescue
var finalScore = 0; //(refugees saved + troops killed - refugees lost)
var continueAnimating = true; //once last refugee despawned for whatever reason gets false and kills the animation loop to end the game and allow restart

//sprites and images
const playerSprite = new Image ();
playerSprite.src = "chewie.png";
const background = new Image ();
background.src = "background.png";
const troopSprite = new Image ();
troopSprite.src = "stormtrooper.png";
const boom = new Image ();
boom.src = "boom.png";

const refugeeSprites = [];
const refugee1 = new Image ();
refugee1.src = "toby.png";
const refugee2 = new Image ();
refugee2.src = "tobywig.png";
const refugee3 = new Image ();
refugee3.src = "bith.png";
const refugee4 = new Image ();
refugee4.src = "c3p0.png";
const refugee5 = new Image ();
refugee5.src = "dart.png";
const refugee6 = new Image ();
refugee6.src = "falleen1.png";
const refugee7 = new Image ();
refugee7.src = "jawa.png";
const refugee8 = new Image ();
refugee8.src = "oola.png";
const refugee9 = new Image ();
refugee9.src = "toki.png";
refugeeSprites.push(refugee1, refugee2, refugee3, refugee4, refugee5, refugee6, refugee7, refugee8, refugee9);

//audio
const deathSounds = [];
const roar = new Audio ();
roar.src = "roar.mp3";
const pew = new Audio ();
pew.src = "pew.wav";
const bang = new Audio ();
bang.src = "bang.mp3";
const death1 = new Audio ();
death1.src = "death1.mp3"
const death2 = new Audio ();
death2.src = "death2.wav"
const death3 = new Audio ();
death3.src = "death3.wav"
const death4 = new Audio ();
death4.src = "death4.wav"
const death5 = new Audio ();
death5.src = "death5.mp3"
deathSounds.push(death1, death2, death3, death4, death5);

//simplifies code to assign a sprite to an object by creating a function
function drawSprite(img, sX, sY, sW, sH, dX, dY, dW, dH){
  ctx.drawImage(img, sX, sY, sW, sH, dX, dY, dW, dH);
}

//player object
const player = {
  x: 200,
  y: 200,
  width: 40,
  height: 72,
  frameX: 0,
  frameY: 3,
  speed: 9, 
  moving: false,
  shooting: false,
};

//bolt (player weapon) object.  Only one bolt can be present at a time as collision detection for multiple bolts in the array using for loops within either the troop update or bolt update logic is crashin the programme
class Bolt {
  constructor(){
    this.x = player.x+(player.width/2); //starting position of bolt (middle of player sprite)
    this.y = player.y+(player.height/2);
    this.dx = 0; //change of direction attribute, related to keypress at time of firing
    this.dy = 0;
    this.radius = 5; 
    this.speed = 20; 
  }
  draw(){
    //three layers of ellipses consecutively smaller of different colours
      ctx.beginPath();
      ctx.arc (this.x, this.y, this.radius, 0, 2 * Math.PI);
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.closePath();
      ctx.beginPath();
      ctx.arc (this.x, this.y, this.radius*0.75, 0, 2 * Math.PI);
      ctx.fillStyle = "lightgreen";
      ctx.fill();
      ctx.beginPath();
      ctx.arc (this.x, this.y, this.radius*0.5, 0, 2 * Math.PI);
      ctx.fillStyle = "gold";
      ctx.fill();
    }     
  update(){
    //bolt movement
    this.x += this.dx;
    this.y += this.dy;   
    //if the player is not moving the bolt will fire in the direction the player is standing facing
    if (this.dy === 0) {
      if (player.frameY === 3) this.dy = -this.speed;//up
      if (player.frameY === 0) this.dy = this.speed;//down
    }
    if (this.dx === 0) {
      if (player.frameY === 1) this.dx = -this.speed;//left
      if (player.frameY === 2) this.dx = this.speed;//right
    }
  }
  remove(){
    //bolt is removed from the array when it leaves the screen
    let i = bolts.indexOf(this);
    if (this.x > canvas.width || this.x < 0 || this.y > canvas.height || this.y < 0) {
      bolts.splice(i, 1);
      player.shooting = false;
    }    
  }
}

//Refugee objects. 
class Refugee {
  constructor(){
    this.width = 32; //parameters required for drawSprite function, used to calculate which part of the spritesheet to draw
    this.height = 48;
    this.frameX = 0;
    this.frameY = 3;
    this.x = (Math.random() * (150 - 0) + 0); //starting position
    this.y = (Math.random() * (1250-550) + 550);//stagger starting y to simulate timed spawn start
    this.sprite = refugeeSprites[Math.floor(Math.random() * refugeeSprites.length)]; //randomise sprite
    this.moving = false; //required to pause animation of sprite when it arrives at the destination
    this.speed = (Math.random() * ((player.speed * 0.5) - (player.speed * 0.25)) + (player.speed * 0.25)); //vary movement speed for variety
    this.destX = (Math.random() * (100 - 20) + 20); //aim for a slightly different X coord along the destination for variety
    this.destY = 100;
    this.arrived = false; //to trigger despawn and point counter once arrived at destination
    this.killed = false; //trigger despawn and point counter if killed by trooper
    this.dead = false; //trigger attacking trooper to select new target
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
      score++;
      refugees.splice(i, 1);
    }
    if (this.killed === true) {      
      refugees.splice(i, 1);
      this.dead = true;
      dead+=1;
    }
  }
}

//stormtrooper objects
class Troop {
  constructor(){
    this.width = 32;
    this.height = 48;
    this.frameX = 0;
    this.frameY = 1;
    this.moving = false;
    this.x = (Math.floor(Math.random() * (1200 - 850))+850); //starting coords offscreen staggered for variety
    this.y = (Math.floor(Math.random() * (450 - 150))+150); 
    this.speed = 7; 
    this.target = refugees[(Math.floor(Math.random() * (refugees.length)))]; //which index of the refugee array to take targetX and targetY from
    this.targetX = 0; //calculate which direction to move to intercept target, see bottom of code
    this.targetY = 0;
    this.toTargetX = 0;
    this.toTargetY = 0;
    this.toTargetLength = 0;
    this.toPlayerX = 0;
    this.toPlayerY = 0;
    this.toPlayerLength = 0;
    this.deathSound = deathSounds[Math.floor(Math.random() * deathSounds.length)]; //pick a random grunt to play on death by player
    this.suicide = false; //when true triggers sprite change to explosion
    this.dead = false; //when true triggers despawn
    this.killed = false; //when true adds to point counter
    this.startTimer = null; //timers for drawing blaster fire
    this.timer = null;
    this.shooting = false;
    this.blastX = null;
    this.blastY = null;
    this.shootingFrame = shootFrame[(Math.floor(Math.random() * (shootFrame.length)))];//pick a random time interval from the associated array so that all troopers are not firing predictably
    this.stopX = (Math.floor(Math.random() * (400 - 300))+300); //slight pause for variety when troop comes into view before following selected target
  }
  draw(){
    if (this.suicide === false){
        drawSprite(troopSprite, this.width*this.frameX, this.height*this.frameY, this.width, this.height, this.x, this.y, this.width, this.height);
        if (this.frameX < 3 && this.moving) this.frameX++
        else this.frameX = 0;
        if (this.timer > this.startTimer) this.timer++;
        if (this.shooting = true) {
          ctx.beginPath();
          ctx.rect (this.blastX, this.blastY, 15, 3);
          ctx.fillStyle = "red"
          ctx.fill();
          ctx.closePath();
          this.blastX -= 20;
        }
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
    let sap = this.target; //logic for following selected target.  Bit of pythagoras
    this.targetX = sap.x;
    this.targetY = sap.y;
    this.toTargetX = this.targetX - this.x;
    this.toTargetY = this.targetY - this.y;
    this.toTargetLength = Math.sqrt(this.toTargetX * this.toTargetX + this.toTargetY * this.toTargetY);
    this.toTargetX = this.toTargetX / this.toTargetLength;
    this.toTargetY = this.toTargetY / this.toTargetLength;
    this.toPlayerX = (player.x+20) - (this.x+16);
    this.toPlayerY = (player.y+36) - (this.y+24);
    this.toPlayerLength = Math.sqrt(this.toPlayerX * this.toPlayerX + this.toPlayerY * this.toPlayerY);
    //set timers for shooting
    if (this.startTimer == null) this.startTimer = Date.now();
    if (this.timer == null) this.timer = this.startTimer;
    if (this.timer === this.startTimer) this.timer++;
    //use modula so that shooting is only triggered once per shootingFrame frames.  This is why they're all prime numbers
    if ((this.timer - this.startTimer) % this.shootingFrame === 0) {
      this.blastX = this.x;
      this.blastY = this.y+(this.height/2);
      this.shooting = true;
    }
    if (this.blastX < 0) this.shooting = false;
    //pause at stopX position
    if (this.x > this.stopX) {
      this.x -= this.speed;
      this.moving = true;
    } else this.moving = false;
    //target selection logic
    if (refugees.length != 0) { //stops the troopers spazzing out endgame
      //walk towards target if target on canvas
      if (this.targetY < canvas.height && this.targetX > 0 && this.x < this.stopX){
        this.x += this.toTargetX * this.speed;
        this.y += this.toTargetY * this.speed;
        this.moving = true;
      }
      //check if target has arrived and select a new target if they have
      if (sap.arrived === true){
        sap = refugees[(Math.floor(Math.random() * (refugees.length)))]
        if (sap.arrived === false) {
          this.target = sap;
        }
      }
      //check if target has died and select a new target if they have
      if (sap.dead === true){
        sap = refugees[(Math.floor(Math.random() * (refugees.length)))]
        if (sap.dead === false) {
          this.target = sap;
        }
      }
      //kill refugee on contact
      if (this.toTargetLength < sap.width) {
        sap.killed = true;
        this.suicide = true;
        bang.play ();
      }   
    }
    //die on player contact
    if (this.toPlayerLength < this.height) {
      this.suicide = true;
      this.killed = true;
    }
    //die on bolt contact
    if (bolts.length != 0 && bolts[0].x > this.x && bolts[0].x < this.x + this.width && bolts[0].y > this.y && bolts[0].y < this.y + this.height){
      this.suicide = true;
      this.killed = true;
    }
  }
  remove(){
    let i = troops.indexOf(this);
    if (this.dead === true && this.killed === false) {
      troops.splice(i, 1);
    }
    if (this.dead === true && this.killed === true) {
      killed++;
      troops.splice(i, 1);
      this.deathSound.play ();
    }
  }
}
//add refugees to the game and keep count of spawns
refugeeSpawner = function() {
  if (refugeeSpawns < maxRefugeeSpawns && refugees.length < refugeeNumbers){
    for(i=0; i < refugeeNumbers; i++) {
      refugees.push(new Refugee());
      refugeeSpawns++;
    }
  }
}
//add troops to the game and keep them coming until the game ends
troopSpawner = function() {
  if (troops.length < 10){
    for (i=0; i < (troopsNumbers - troops.length); i++) {
      troops.push(new Troop());
    }
  }
}
//scorekeeping
drawScore = function() {
  ctx.font = "normal bolder 16px verdana";
  ctx.fillStyle = "rgb(0, 0, 0)";
  ctx.fillText ("Rescued refugees: "+score, canvas.width-210, 20);
  ctx.fillText ("Lost refugees: "+dead, canvas.width-210, 40);
  ctx.fillText ("Killed stormtroopers: "+killed, canvas.width-210, 60);
  ctx.fillText ("Total score: "+finalScore, canvas.width-210, 80);
  finalScore = ((score + killed)-dead);
}
//event listeners for keypresses. keycode used as keys wasn't working properly with the version of chrome the programme was tested on
window.addEventListener("keydown", function (e){
  keys[e.keyCode] = true;//when a key is pressed that key is added to the keys array
  player.moving = true;
});
window.addEventListener("keyup", function (e){
  delete keys[e.keyCode]; //when a key is released that key is deleted from the keys array.  This method prevents event listeners from interfering with one another and makes control more responsive.
  player.moving = false;
});
//player movement and shooting logic
function movePlayer() {
  if ((keys[87] || keys[38]) && player.y > 100){//up
    player.y -= player.speed;
    player.frameY = 3;
    player.moving = true;
  }
  if ((keys[65] || keys[37]) && player.x > 0){//left
    player.x -= player.speed;
    player.frameY = 1;
    player.moving = true;
  }
  if ((keys[83] || keys[40]) && player.y < (canvas.height - player.height)){//down
    player.y += player.speed;
    player.frameY = 0;
    player.moving = true;
  }
  if ((keys[68] || keys[39]) && player.x < (canvas.width - player.width)){//right
    player.x += player.speed;
    player.frameY = 2;
    player.moving = true;
  }
  if (keys[32] && player.shooting === false && player.moving === true){
      player.shooting = true;
      bolts.push(new Bolt());
      if (keys[87] || keys[38]) bolts[0].dy = -bolts[0].speed;//up
      if (keys[65] || keys[37]) bolts[0].dx = -bolts[0].speed;//left
      if (keys[83] || keys[40]) bolts[0].dy = bolts[0].speed;//down
      if (keys[68] || keys[39]) bolts[0].dx = bolts[0].speed;//right
      pew.play ();
  }
}
//animate the player sprite. Required as player was not built using a constructor
function handlePlayerFrame(){
  if (player.frameX < 3 && player.moving) player.frameX++
  else player.frameX = 0;
}
//random chewie noises for ambiance
function rawr(){
  if (killed % 10 === 0) roar.play ();
  if (score+dead === maxRefugeeSpawns) roar.play ();
}

//animation logic. lifted wholesale from a tutorial
let fps, fpsInterval, startTime, now, then, elapsed; //declare empty variables

function startAnimating(fps){ //function needed to kick off the animation by getting system time and tying fps to system time.
  fpsInterval = 1000/fps; //how much time passes before the next frame is served
  then = Date.now(); //Date.now is no. of ms elapsed since 1.1.1970
  startTime = then;
  animate();
}

//where the magic happens
function animate(){
  if (continueAnimating === true) {
    requestAnimationFrame(animate); //pass the parent function to RAF to cause it to call itself recursively
    now = Date.now();
    elapsed = now - then;
    if (elapsed > fpsInterval) { //check to see if it's time to draw the next frame
      then = now - (elapsed % fpsInterval); //resets the clock to keep frame rate consistent
      ctx.clearRect (0, 0, canvas.width, canvas.height); //gets rid of everything and draws fresh
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      
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

      for (i=0; i < bolts.length; i++) {
          bolts[i].draw();
          bolts[i].update();
          bolts[i].remove();
      }

      rawr();
      drawScore();

      //ends the game
      if (score+dead === maxRefugeeSpawns) {
        continueAnimating = false;
        alert (`Your final score is ${finalScore}\n\nPress F5 to restart!`)
      }
    }
  }
}
if (continueAnimating) startAnimating(15); //starts the animation and condition prevents this from restarting the animation once the game has ended


//STUFF TO REMEMBER FOR NEXT TIME
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

//generate a random number within boundries //Math.random() * (max-min) + min
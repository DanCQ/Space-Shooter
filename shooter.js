const canvas = document.getElementById("canvas");
const portfolio = document.querySelector(".portfolio");
const spacecraft = document.getElementById("spacecraft"); //player
const explosion = new Audio("assets/sounds/explosion.mp3");
const scratch = new Audio("assets/sounds/scratch.mp3");
const splat = new Audio("assets/sounds/splat.mp3");
let laser = new Audio("assets/sounds/laser.mp3"); 

//music tracks
const thinkAboutIt = new Audio("assets/music/ThinkAboutIt.mp3");
const flying = new Audio("assets/music/AdventuresOfFlyingJack.mp3");
const battle = new Audio("assets/music/BattleReady.mp3");
const gotham = new Audio("assets/music/Gothamlicious.mp3");
const honor = new Audio("assets/music/HonorBound.mp3");
const buster = new Audio("assets/music/VideoGameBlockbuster.mp3");

const musicTracks = [flying, battle, gotham, honor, buster];
let  music = musicTracks[randomRange(0, musicTracks.length - 1)];

const alien1 = document.getElementById("alien1");
const alien2 = document.getElementById("alien2");
const alien3 = document.getElementById("alien3");
const alien4 = document.getElementById("alien4");
const alien5 = document.getElementById("alien5");
const alien6 = document.getElementById("alien6");
//enemy images
let aliens = [alien1, alien2, alien3, alien4, alien5, alien6];

let screenHeight = window.innerHeight;
let screenWidth = window.innerWidth;
canvas.height = screenHeight;
canvas.width = screenWidth;
c = canvas.getContext("2d");

//used for interval
let allow = true; 
let off; 
let time = 0;

//mouse location
let mouse = { 
    x: screenWidth / 2,
    y: screenHeight / 2
};

//background
let alpha = 0.8;
let animation;
let radians = 0.0002;
let slow = false;
let starArr = []; //object array

//game objects
let count = 0; //for enemy deployment
let enemyArr = []; //enemy object array
let enemyInt; //for enemy deployment
let ex;
let explodeArr = [];
let fireArr = []; //torpedos object array

let angle; //for fire and mouse position
let fire = ""; //for torpedo objects
let fireVx = 1;
let fireVy = 1;
let target; //for fire direction
let isTouch = 'ontouchstart' in window; //checks if it's a touchscreen

let interaction = false;
let user; //user interactivity
let userVx; //user velocity x
let userVy; //user velocity y


//141 colors. The minimum is 0, the maximum is 140
const colorArray = [
    "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", 
    "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", 
    "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkkhaki", 
    "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", 
    "darkslateblue", "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", 
    "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", 
    "goldenrod", "gray", "green", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", 
    "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", 
    "lightgoldenrodyellow", "lightgray", "lightgreen", "lightpink", "lightsalmon", "lightseagreen",
    "lightskyblue", "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", 
    "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", 
    "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", 
    "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", 
    "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", 
    "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", 
    "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "snow", "springgreen", "steelblue", "tan",
    "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen"
];


//object blueprint
class Enemy{
    constructor (x,y,vx,vy,radius) {
    this.x = x;
    this.y = y;
    this.velocity = {
        x: vx,
        y: vy
    };
    this.angle; //math formula to correctly follow in a circle;
    this.hit = 0;
    this.radius = radius;
    this.frictionY = 1 - this.size();
    this.frictionX = 1 - this.size();
    this.collision = 1 - this.size(); //added to Resolve Collision
    this.mass = 1 + this.size(); //needed for Resolve collision     
    }

    //takes size into account
    size() {
        if(this.radius > 0) {
            return this.radius / 100;
        } else {
            return 0;
        }
    }

    update(enemyArr) {

        //sets left & right boundaries
        if(this.x + this.radius + this.velocity.x >= screenWidth || this.x + this.velocity.x <= this.radius) {
            this.velocity.x = -this.velocity.x * this.frictionX; //reduces side movement on side bounce
        }
        //sets ceiling & floor boundaries
        if(this.y + this.radius + this.velocity.y >= screenHeight || this.y + this.velocity.y <= this.radius) {
            this.velocity.y = -this.velocity.y * this.frictionY;  //reduces upward movement on floor bounce
        } else {
            this.velocity.y; //gravity
        }

        if(this.y + this.radius <= this.radius * 2 - 5) {   //rapidly unstick from ceiling
            this.y += 25;
            this.velocity.x += randomRange(-2,2);  //adds slight sideways movement 
        } else if(this.y + this.radius <= this.radius * 2) {  //unstick items from ceiling
            this.y += 1; 
        }
        if(this.y + this.radius >= screenHeight + 5) {  //rapidly bring up items from floor
            this.y -= 25; 
            this.velocity.x += randomRange(-2,2);  //adds slight sideways movement 
        } else if(this.y + this.radius >= screenHeight) {  //prevents from sinking into floor
            this.y -= 1; 
        }

        if(this.x + this.radius >= screenWidth + 5) {   //rapidly unstick from right
            this.x -= 25;
            this.velocity.x += randomRange(-2,2);  //adds slight sideways movement 
        } else if(this.x + this.radius >= screenWidth) {   //unstick items from right
            this.x -= 1; 
        }
        if(this.x + this.radius <= (this.radius * 2) - 5) {  //rapidly unstick from left
            this.x += 25;
            this.velocity.x += randomRange(-2,2);  //adds slight sideways movement 
        } else if(this.x + this.radius <= this.radius * 2) {    //unstick items from left
            this.x += 1; 
        }


        this.x += this.velocity.x; 
        this.y += this.velocity.y;


        for(let i = 0; i < enemyArr.length; i++) {
            
            aliens[i].style.visibility = slow == false ? "visible" : "hidden";
            aliens[i].style.left = `${-screenWidth / 2 - (aliens[i].offsetWidth / 2) + enemyArr[i].x}px`;
            aliens[i].style.top = `${-screenHeight / 2 - (aliens[i].offsetHeight / 2) + enemyArr[i].y}px`;
            enemyArr[i].angle = Math.atan2(user.y - enemyArr[i].y, user.x - enemyArr[i].x);
            enemyArr[i].angle *= 180 / Math.PI; 


            if(enemyArr[i].hit > 800) {

                aliens[i].style.visibility = "hidden";
                aliens.push(aliens[i]); //recycles destroyed enemy image to end of array
                aliens.splice(i, 1); //removes dead enemy image
                ex = {
                    x: enemyArr[i].x,
                    y: enemyArr[i].y
                }
                enemyArr.splice(i, 1); //removes dead enemy movements

                explode("squid");
                splat.play();
                count--; //reduces enemy count for creator

                user.hit -= 25; //restores player life
                if(user.hit < 0) {
                    user.hit = 0;
                }
            }

            //enemies turn towards user 
            if(enemyArr[i].x > user.x + aliens[i].offsetWidth / 2 && enemyArr[i].y > user.y + aliens[i].offsetHeight / 2) {
    
                aliens[i].style.transform = `scaleX(1) scaleY(1) rotate(${-enemyArr[i].angle}deg)`;
            
            } else if(enemyArr[i].x > user.x + aliens[i].offsetWidth / 2 && enemyArr[i].y < user.y + aliens[i].offsetHeight / 2) {
    
                aliens[i].style.transform = `scaleX(-1) scaleY(-1) rotate(${-enemyArr[i].angle}deg)`;
            }

            if(enemyArr[i].x < user.x + aliens[i].offsetWidth / 2 && enemyArr[i].y > user.y + aliens[i].offsetHeight / 2) {
    
                aliens[i].style.transform = `scaleX(-1) scaleY(-1) rotate(${-enemyArr[i].angle}deg)`;
            
            } else if(enemyArr[i].x < user.x + aliens[i].offsetWidth / 2 && enemyArr[i].y < user.y + aliens[i].offsetHeight / 2) {
    
                aliens[i].style.transform = `scaleX(1) scaleY(1) rotate(${-enemyArr[i].angle}deg)`;
            }


            //collision detection among user and enemies
            if(distance(user.x, user.y, enemyArr[i].x, enemyArr[i].y) - user.radius - enemyArr[i].radius < 0 && user.alive) {

                user.hit++;

                userVx = user.x - enemyArr[i].x; //user x velocity set at impact
                 
                userVy = user.y - enemyArr[i].y; //user y velocity set at impact

                scratch.play();

                resolveCollision(user, enemyArr[i]); //collision physics 
            }


            //accurate collision detection among enemies
            if(this === enemyArr[i]) continue;
            if(distance(this.x, this.y, enemyArr[i].x, enemyArr[i].y) - this.radius - enemyArr[i].radius < 0) {

                //activates if combined velocity is above threshold
                if(this.velocity.y + this.velocity.x + enemyArr[i].velocity.y + enemyArr[i].velocity.x > 0.5 || 
                this.velocity.y + this.velocity.x + enemyArr[i].velocity.y + enemyArr[i].velocity.x < -0.5) {

                    resolveCollision(this, enemyArr[i]);
                }
            }

        } 
    }
}


//object blueprint
class Explosion {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius; //size of circles
        this.velocity = velocity; 
        this.alpha = 1; //visibility value
        this.color = color;
    }

    //circle
    draw() {
        c.save();
        c.globalAlpha = this.alpha;
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
        c.restore();
    }

    update() {

        this.x += this.velocity.x * randomRange(1, 3); //sideways expansion force 
        this.y += this.velocity.y * randomRange(1, 3); //velocity and dowards pull
        
        this.draw();
    }
}


//background galaxy blueprint
class Galaxy {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = radius
    }

    //circle
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.shadowColor = this.color;
        c.shadowBlur = 15;
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
    }
}


//player object
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.alive = true;
        this.collision = 1;
        this.hit = 0;
        this.mass = 1;
        this.radius = 60; //radius of player object
        this.friction = 0.005;
        this.lastMouse = {
            x: x,
            y: y
        }; 
        this.velocity = {
            x: 0,
            y: 0
        };
    }

    update() {
        
        this.lastMouse.x += (mouse.x - this.lastMouse.x) * this.friction;
        this.lastMouse.y += (mouse.y - this.lastMouse.y) * this.friction;
        this.x = this.lastMouse.x;
        this.y = this.lastMouse.y;
        this.velocity = {
            x: userVx * 0.4,
            y: userVy * 0.4
        };


        //spacecraft animations
        let rotation = angle; //cannot alter angle, used in fire position too
        rotation *= 180 / Math.PI; //math formula to correctly follow in a circle
    
        //makes ship face in mouse direction
        if(mouse.x > user.x + spacecraft.offsetWidth / 2) {

            spacecraft.style.transform = `scaleX(-1) scaleY(1) rotate(${-rotation}deg)`;

        } else if(mouse.x < user.x - spacecraft.offsetWidth / 2) {

            spacecraft.style.transform = `scaleX(-1) scaleY(-1) rotate(${rotation}deg)`;
        }

        //positions ship image and updates movement
        spacecraft.style.left = `${-screenWidth / 2 - (spacecraft.offsetWidth / 2) + user.x}px`;
        spacecraft.style.top = `${-screenHeight / 2 - (spacecraft.offsetHeight / 2) + user.y}px`;

        //music volume decreases as player dies
        if(user.hit > 700) {
            music.volume = 0.1;
        } else if(user.hit > 600) {
            music.volume = 0.2;
        } else if(user.hit > 500) {
            music.volume = 0.3;
        } else if(user.hit > 400) {
            music.volume = 0.4;
        } else if(user.hit > 300) {
            music.volume = 0.5;
        } else if(user.hit > 200) {
            music.volume = 0.6;
        } else if(user.hit > 100) {
            music.volume = 0.7;
        } else {
            music.volume = 0.8;
        }

        if(user.hit > 800 && user.alive) {
            
            music.pause();
            
            spacecraft.style.visibility = "hidden";
                
            ex = {
                x: this.x,
                y: this.y
            }

            this.alive = false;
            explode("user");

            explosion.play();
            
            setTimeout(function() {
                slow = true;

                thinkAboutIt.play();
                thinkAboutIt.loop = true;
            },5000);
        }
    };
}


//object blueprint
class Torpedo {
    constructor(x, y, tx, ty) {
        this.x = x;
        this.y = y;
        this.color = "chartreuse";
        this.collision = 1;
        this.mass = 1;
        this.radius = 1;
        this.velocity = {
            x: 5,
            y: 5 
        };
        this.target = {
            x: tx * this.velocity.x,
            y: ty * this.velocity.y
        };
    }

    draw(previous) {
        c.save();
        c.beginPath();
        c.strokeStyle = this.color;
        c.lineWidth = 2.5;
        c.moveTo(previous.x, previous.y);
        c.lineTo(this.x, this.y);
        c.stroke();
        c.closePath();
        c.restore();
    }

    update() {

        let previous = {
            x: this.x - this.target.x,
            y: this.y - this.target.y
        };

        this.velocity = {
            x: 5 + fireVx,
            y: 5 + fireVy
        };

        //prevents slowdown by deleting offscreen projectiles
        if(this.x > screenWidth || this.x < 0 || this.y > screenHeight || this.y < 0) {
            fireArr.splice(this, 1);
        }

        //fire detection on enemies
        enemyArr.forEach(obj => {

            if(distance(this.x, this.y, obj.x, obj.y) - obj.radius + 15 < 0) {

                fireVx = this.x - obj.x;  //user x velocity set at impact
             
                fireVy = this.y - obj.y; //user y velocity set at impact
                
                resolveCollision(this, obj);
                obj.hit++;

                this.target = { 
                    x: Math.cos(Math.PI * 2 + randomRange(-10,10)) * Math.random(), //creates circular particle positions
                    y: Math.sin(Math.PI * 2 + randomRange(-10,10)) * Math.random() //creates curved particle positions
                };    
            }
        }); 

        this.x += this.target.x;
        this.y += this.target.y;

        this.draw(previous);
    }
}


function animate() { 

    animation = requestAnimationFrame(animate);

    c.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    c.fillRect(0,0,screenWidth,screenHeight);
    //c.clearRect(0,0,screenWidth,screenHeight);

    c.save();
    c.translate(screenWidth / 2, screenHeight / 2); //repositions screen
    c.rotate(radians);
    
    //animates background
    starArr.forEach(obj => {
        obj.update();
    });
    c.restore();

    radians += 0.0003;

    if(slow) {
        if(alpha > 0.001) {
            alpha -= 0.0025;
        }  
        radians += 0.005;
        
    } else {
        alpha = 0.8;
    }

    enemyArr.forEach(obj => {
        obj.update(enemyArr);
    });

    //player projectiles
    fireArr.forEach(obj => {   
        obj.update(); 
    });

    explodeArr.forEach(obj => {
        
        obj.update();
       
        setTimeout(function() { 
            
            obj.alpha -= 0.05;
            
            if(obj.alpha < 0) {
                explodeArr.splice(obj, 1);
            }
        }, 1000);
    });

    //player object
    if(user.alive) {
        user.update();
    }
}


//used for screen resizing
function backgroundDisplay() {

    starArr = [];

    //background galaxy 
    for(let i = 0; i < 500; i++) {

        //makes up for offset of screen in rotation animation
        let x = randomRange(-screenWidth, screenWidth); 
        let y = randomRange(-screenHeight, screenHeight);
        let color = colorArray[randomRange(0, colorArray.length - 1)];
        let radius = randomRange(0.6, 1);
            
        let star = new Galaxy(x, y, radius, color);
            
        starArr.push(star);
    }  
}


function creator() {

    //background galaxy
    backgroundDisplay();
    
    //player object
    user = new Player(screenWidth / 2, screenHeight / 2);

    //enemy objects
    enemyInt = setInterval(function() {
            
        if(count < 6 && user.alive) { 

            let x, y;
            let vx = randomRange(-25,25); //random velocity x-axis
            let vy = randomRange(-25,25); //random velocity y-axis
            let radius = alien1.offsetHeight / 2;
            
            //chooses random spawn location outside view window
            if(Math.random() < 0.5) {
                x = Math.random() < 0.5 ? 0 - radius : screenWidth + radius; 
                y = Math.random() * screenHeight;
            } else {
                x = Math.random() * screenWidth;
                y = Math.random() < 0.5 ? 0 - radius : screenHeight + radius; 
            }
                    
            let alien = new Enemy(x,y,vx,vy,radius);
            
            enemyArr.push(alien); //sends to array
            count++;   
        }
        
        if(music.ended) {
            music = musicTracks[randomRange(0, musicTracks.length - 1)];
        }

        if(interaction && music.paused && user.alive) {
            music.play();
        }

    },  10000 + randomRange(-8000, 8000)); //enemy intervals

}


//checks collision distance between objects
function distance(x1,y1,x2,y2) {
    let xSpace = x2 - x1;
    let ySpace = y2 - y1;

    return Math.sqrt(Math.pow(xSpace,2) + Math.pow(ySpace,2));
}


function explode(whom) {

    let sparks;
    let x = ex.x; 
    let y = ex.y;
    let sparkCount =  whom == "squid" ? 300 : 1000;
    let color = whom == "squid" ? "cyan" : "wheat";

    for(let i = 0; i < sparkCount; i++) {

        let radius = randomRange(0.5, 1);
        let radians = Math.PI * 2 / sparkCount;

        sparks = new Explosion(x, y, radius, color, { 
            x: Math.cos(radians * i) * Math.random(), //creates circular particle positions
            y: Math.sin(radians * i) * Math.random()  //creates curved particle positions
        });
        
        explodeArr.push(sparks);
    }
}


function fireLock(event) {
    //better sound if not touchscreen
    if(!isTouch) { //performance issue
        laser = new Audio("assets/sounds/laser.mp3"); 
    }

    //gets mouse angle from ship. coordinate y first, then x
    angle = Math.atan2(event.y - user.y, event.x - user.x);
            
    //sends fire at this angle
    target = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

    //starts from user location
    fire = new Torpedo(user.x, user.y, target.x, target.y);

    fireArr.push(fire);
    laser.play();
}


//Returns a random number within a chosen range
function randomRange(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
//Math.floor() rounds down to the nearest whole number  e.i. 10 = 0 - 9  
//Math.random() returns a random decimal between 0 - 0.99
}


//simulated collision physics 
function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;
    
    //measures angle & velocity before equation
    function rotate(velocity, angle) {
	    const rotatedVelocities = {
		    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
		    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
	    };
        return rotatedVelocities;
    } 
    
    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x * particle.collision;
        particle.velocity.y = vFinal1.y * particle.collision;

        otherParticle.velocity.x = vFinal2.x * otherParticle.collision;
        otherParticle.velocity.y = vFinal2.y * otherParticle.collision;
    }
}


document.body.addEventListener("click", function(event) {

    event.preventDefault();
    interaction = true;

    if(user.alive) {

        fireLock(event); //fires if alive

    } else if (slow) {

        location.reload(); //refreshes page if dead
    }
});


portfolio.addEventListener("click", function() {

    window.open("https://dany-cervantes-portfolio.pages.dev/");
})


canvas.addEventListener("mousemove", function(event) {
    
    //gets mouse angle from ship
    angle = Math.atan2(event.y - user.y, event.x - user.x);

    mouse.x = event.x;
    mouse.y = event.y;
});


canvas.addEventListener("touchmove", function(event) {
    //touchscreen swipe controls
    mouse.x = event.touches[0].clientX;
    mouse.y = event.touches[0].clientY;
    
    //sets ship direction
    angle = Math.atan2(mouse.y - user.y, mouse.x - user.x);
});


spacecraft.addEventListener("click", function() {

    portfolio.style.visibility = "visible";

    time = 3000; //3 seconds, resets on click
    
    if(allow) {

        allow = false; //prevents multiple intervals

        off = setInterval(() => {
            time -= 1000;
        
            if(time <= 0) {
                portfolio.style.visibility = "hidden";
                clearInterval(off);
                allow = true;
            }
        }, 1000);
    }
});


//prevents infite loop when loading page on mobile
setTimeout(function() {

    window.addEventListener("resize", function() {
        
        //Only way found to avoid a canvas resize bug on mobile
        setTimeout(function() {
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
            canvas.height = screenHeight;
            canvas.width = screenWidth;
            backgroundDisplay(); //redeploy stars
        },100);
    });
}, 25); 


window.onload = function() {

    creator();
    
    animate();

};

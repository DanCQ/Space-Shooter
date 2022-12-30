const canvas = document.getElementById("canvas");
const portfolio = document.querySelector(".portfolio");
const spacecraft = document.getElementById("spacecraft"); //player

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
let starArr = []; //object array
let radians = 0.00015;
let slow = false;

//game objects
let enemyArr = []; //enemy object array
let fireArr = []; //torpedos object array

let angle; //for fire and mouse position
let inverted = false; //direction of ship
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


//Returns a random number within a chosen range
function randomRange(min,max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
//Math.floor() rounds down to the nearest whole number  e.i. 10 = 0 - 9  
//Math.random() returns a random decimal between 0 - 0.99
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
        c.shadowColor = `${this.color}`;
        c.shadowBlur = 15;
        c.fillStyle = `${this.color}`;
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
        this.collision = 1;
        this.mass = 1;
        this.radius = 85; //radius of mouse object
        this.velocity = {
            x: 0,
            y: 0
        };
        this.lastMouse = {
            x: x,
            y: y
        };

    }

    update() {
        this.lastMouse.x += (mouse.x - this.lastMouse.x) * 0.004;
        this.lastMouse.y += (mouse.y - this.lastMouse.y) * 0.004;
        this.x = this.lastMouse.x;
        this.y = this.lastMouse.y;
        this.velocity = {
            x: userVx,
            y: userVy
        };

    };
}


//object blueprint
class Torpedo {
    constructor(x, y, tx, ty, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.target = {
            x: tx * 4,
            y: ty * 4
        };
        this.width = 2.5;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.width, 0, Math.PI * 2, false);
        c.fillStyle = `${this.color}`;
        c.fill();
        c.closePath();
    }

    update() {
       
        //prevents slowdown by deleting offscreen projectiles
        if(this.x > screenWidth || this.x < 0 || this.y > screenHeight || this.y < 0) {
            fireArr.splice(this, 1);
        }

        this.x += this.target.x;
        this.y += this.target.y;

        this.draw();
    }
}


function creator() {

    //background galaxy
    backgroundDisplay();

    //player object
    user = new Player(screenWidth / 2, screenHeight / 2);

}


function animate() {  

    requestAnimationFrame(animate);

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

    radians += 0.00015;

    if(slow) {
        if(alpha > 0.001) {
            alpha -= 0.0025;
        }  
        radians += 0.005;
        
    } else {
        alpha = 0.8;
    }


    //shots
    fireArr.forEach(obj => {
        obj.update();
    });

    //player object
    user.update();

    
   //spacecraft animations
    let rotation = angle; //cannot alter angle, used in fire position too
    rotation *= 180 / Math.PI; //math formula to correctly follow in a circle
    //makes ship face in mouse direction
    if(mouse.x > user.x + spacecraft.offsetWidth / 2) {

        spacecraft.style.transform = `scaleX(-1) scaleY(1) rotate(${-rotation}deg)`;
        inverted = true;

    } else if(mouse.x < user.x - spacecraft.offsetWidth / 2) {

        spacecraft.style.transform = `scaleX(-1) scaleY(-1) rotate(${rotation}deg)`;
        inverted = false;
    }

    //positions ship image and updates movement
    spacecraft.style.left = `${-screenWidth / 2 - (spacecraft.offsetWidth / 2) + user.x}px`;
    spacecraft.style.top = `${-screenHeight / 2 - (spacecraft.offsetHeight / 2) + user.y}px`;

}


canvas.addEventListener("click", function(event) {

    let fire;
 
    //gets mouse angle from ship. coordinate y first, then x
    angle = Math.atan2(event.y - user.y, event.x - user.x);
    let color = colorArray[randomRange(0, colorArray.length - 1)];

    //sends fire at this angle
    let target = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }
    //starts from user location
    if(inverted) { 
        fire = new Torpedo(user.x - spacecraft.offsetWidth / 2, user.y, target.x, target.y, color);
    } else {
        fire = new Torpedo(user.x, user.y, target.x, target.y, color);
    }

    fireArr.push(fire);
});


canvas.addEventListener("mousemove", function(event) {
    
    //gets mouse angle from ship
    angle = Math.atan2(event.y - user.y, event.x - user.x);

    mouse.x = event.x;
    mouse.y = event.y;
    
});


spacecraft.addEventListener("click", function() {

    portfolio.style.visibility = "visible";

    time = 10000; //3 seconds, resets on click
    
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

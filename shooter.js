const canvas = document.getElementById("canvas");
const portfolio = document.querySelector(".portfolio");
const spacecraft = document.getElementById("spacecraft");

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
let radians = 0.0003;
let slow = false;

//game objects
let enemyArr = []; //enemy object array
let twister = []; //cursor object
let fireArr = []; //torpedos object array
let angle;
let inverted = false;
let rotation;
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
       
        //prevents slowdown by deleting objects
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
    for(let i = 0; i < 250; i++) {

        let x = randomRange(0, screenWidth); //makes up for offset of screen in animation
        let y = randomRange(0, screenHeight);
        let color = colorArray[randomRange(0, colorArray.length - 1)];
        let radius = randomRange(0.6, 1);
        
        let star = new Galaxy(x, y, radius, color);
        
        starArr.push(star);
    }  

    //player object
    user = new Player(screenWidth / 2, screenHeight / 2);

}


function animate() {

    requestAnimationFrame(animate);

    //c.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    c.clearRect(0,0,screenWidth,screenHeight);


    //animates background
     starArr.forEach(obj => {
        obj.update();
    });

    //animates twister
    twister.forEach(obj => {
        obj.update();
    });

    //shots
    fireArr.forEach(obj => {
        obj.update();
    });

    //player object
    user.update();
    
    rotation = angle;
    rotation *= 180 / Math.PI; 
    //spacecraft image follows the mouse while looking correct
    if(mouse.x > user.x + spacecraft.offsetWidth / 2) {

        spacecraft.style.transform = `scaleX(-1) scaleY(1) rotate(${-rotation}deg)`;

    } else if(mouse.x < user.x - spacecraft.offsetWidth / 2) {

        spacecraft.style.transform = `scaleX(-1) scaleY(-1) rotate(${rotation}deg)`;
    }

    spacecraft.style.left = `${-screenWidth / 2 - (spacecraft.offsetWidth / 2) + user.x}px`;
    spacecraft.style.top = `${-screenHeight / 2 - (spacecraft.offsetHeight / 2) + user.y}px`;

    
}


canvas.addEventListener("click", function(event) {
    
    let fire;

    //coordinate y first, then x
    angle = Math.atan2(event.y - user.y, event.x - user.x);
    let color = colorArray[randomRange(0, colorArray.length - 1)];
    let target = {
        x: Math.cos(angle),
        y: Math.sin(angle)
    }

  
    fire = new Torpedo(user.x, user.y, target.x, target.y, color);
    
    fireArr.push(fire);
});


canvas.addEventListener("mousemove", function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
    angle = Math.atan2(event.y - user.y, event.x - user.x);

});


//prevents infite loop when loading page on mobile
setTimeout(function() {

    window.addEventListener("resize", function() {
        
        //Only way found to avoid a canvas resize bug on mobile
        setTimeout(function() {
            location.reload();
            /* 
            screenHeight = window.innerHeight;
            screenWidth = window.innerWidth;
            canvas.height = screenHeight;
            canvas.width = screenWidth; */
        },100);
    });

}, 25); 


window.onload = function() {

    creator();
    
    animate();
};
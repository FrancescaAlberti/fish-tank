//settings
var FishNumber = 1;
var FishSpeed = {
    min: 0.5,
    max: 2
};
var FishSize = {
    min: 10,
    max: 40
};

var FishMaxLifeSpan = 5;

var possibleSpeeds = {
    '0': 100000,
    '1': 10000,
    '2': 1000
}
var worldSpeed = possibleSpeeds['1'].valueOf();
var FishArray = [];
let FoodArray = [];
let blinking;
let fleeing;
let isSetup = true;

function setup() {
    //frameRate(20);
    canvas = createCanvas(800, 500);
    pCounter = createP(FishArray.length);
    pCounter.id('fishCounter');

    //create fishes
    CreateFishes(FishNumber, FishSize, FishSpeed);
    //create food
    CreateFood();


    //add fish button
    button = createButton('click me');
    button.id('addFish');
    button.mousePressed(function() {
        let fish = createFish(FishSize, FishSpeed);
        FishArray.push(fish);
        var counter = select('#fishCounter');
        counter.html(FishArray.length);
    });

    // set world speed
    slider = createSlider(0, 2, 1, 1);
    slider.id('worldSpeed');
    slider.changed(function() {
        let sliderValue = slider.value();
        worldSpeed = possibleSpeeds[sliderValue].valueOf();
    });
}


function createFish(FishSize, FishSpeed) {
    let fish;
    let color = '';
    for (var j = 0; j < 3; j++) {
        color += floor(random(1, 255)) + (j === 2 ? '' : ',');
    }
    fish = new Fish(
        random(width), //x position
        random(100, height - 100), //y position
        random(this.FishSize.min, this.FishSize.max), //body dim
        this.FishSpeed, //speed
        color, //color
        { currentAge: random(1, 3), lifeSpan: random(4, FishMaxLifeSpan) } //age
    );
    return fish;
}

function CreateFood() {
    if (FoodArray.length === 0)
        food = new Food();
}

function CreateFishes(FishNumber, FishSize, FishSpeed) {
    for (var i = 0; i < FishNumber; i++) {
        let fish = createFish(FishSize, FishSpeed);
        FishArray.push(fish);
        var counter = select('#fishCounter');
        counter.html(FishArray.length);
    }
}


function draw() {
    //sfondo
    background('#99eeee');
    //draw fishes
    FishArray.forEach(function(fish) {
        fish.move();
        fish.blink();
        fish.aging();
        fish.die();
        fish.display();
    });

    food.display();
}


class Fish {
    constructor(xin, yin, widthin, speed, mainColor, life) {
        this.position = {
            x: xin,
            y: yin
        };
        /* this.position = createvector(xin, yin); */
        this.dim = {
            height: widthin * 0.5,
            width: widthin,
            eye: widthin * 0.5 * 0.2,
            blink: widthin * 0.5 * 0.2 * 0.5
        };
        this.fishSpeed = {
            min: speed.min * (widthin / 100), // 1 * 0.8 = 0.8 // 1 * 0.2 = 0.2
            max: speed.max * (widthin / 100), // 4 * 0.8 = 3.2 // 4 * 0.2 = 0.8      
            currentX: random(speed.min * (widthin / 100), speed.max * (widthin / 100)),
            currentY: random(speed.min * (widthin / 200), speed.max * (widthin / 200))
        };
        this.col = mainColor;

        this.life = {
            currentAge: life.currentAge,
            lifeSpan: life.lifeSpan
        };

    }

    display() {
        noStroke();
        let colSplitted = this.col.split(',');
        fill(Number(colSplitted[0]), Number(colSplitted[1]), Number(colSplitted[2]));

        //tail
        triangle(this.position.x, this.position.y,
            this.position.x - this.dim.width * 0.5, this.position.y - this.dim.height,
            this.position.x - this.dim.width * 0.5, this.position.y + this.dim.height);
        //body
        ellipse(this.position.x, this.position.y, this.dim.width, this.dim.height);
        //fins
        triangle(this.position.x + this.dim.width * 0.4, this.position.y,
            this.position.x - this.dim.width * 0.1, this.position.y - this.dim.height,
            this.position.x - this.dim.width * 0.1, this.position.y + this.dim.height * 1);

        fill('#000');
        //eye
        ellipse(this.position.x + this.dim.width * 0.3, this.position.y, this.dim.height * 0.2, blinking ? this.dim.blink : this.dim.eye);
    }

    move() {
        this.position.x += this.fishSpeed.currentX / worldSpeed * 10000;
        this.position.y += this.fishSpeed.currentY / worldSpeed * 10000;

        //upper border
        if (this.position.y + this.dim.height < 0) {
            this.position.y = 0 - this.dim.height;
            this.dim.height *= -1;
            //fix for speed limits
            if (this.position.y > this.fishSpeed.max || this.position.y < this.fishSpeed.min) {
                this.fishSpeed.currentY = random(this.fishSpeed.min, this.fishSpeed.max);
            }
            this.fishSpeed.currentY *= random(0.9, 1.2);
        }

        //lower border
        if (this.position.y + this.dim.height > height) {
            this.position.y = height - this.dim.height;
            this.dim.height *= -1;
            //fix for speed limits
            if (this.position.y > this.fishSpeed.max || this.position.y < this.fishSpeed.min) {
                this.fishSpeed.currentY = random(this.fishSpeed.min, this.fishSpeed.max);
            }
            this.fishSpeed.currentY *= -random(0.9, 1.2);
        }

        //right side
        if (this.position.x + this.dim.width * 0.5 > width) {
            fleeing = false;
            this.position.x = width - this.dim.width;
            this.dim.width *= -1;
            //fix for speed limits
            if (this.position.x > this.fishSpeed.max || this.position.x < this.fishSpeed.min) {
                this.fishSpeed.currentX = random(this.fishSpeed.min, this.fishSpeed.max);
            }
            this.fishSpeed.currentX *= -random(0.9, 1.2);
        }

        //left side
        else if (this.position.x + this.dim.width * 0.5 < 0) {
            fleeing = false;
            this.dim.width *= -1;
            this.position.x = this.dim.width;
            //fix for speed limits
            if (this.position.x > this.fishSpeed.max || this.x < this.fishSpeed.min) {
                this.fishSpeed.currentX = random(-(this.fishSpeed.max), -(this.fishSpeed.min));
            }
            this.fishSpeed.currentX *= -random(0.9, 1.2);
        }

        //mouse hover
        else if ((this.position.y + this.dim.height > mouseY && this.position.y - this.dim.height < mouseY)) {
            if ((this.position.x + this.dim.width > mouseX && this.position.x - this.dim.width < mouseX && this.dim.width > 0 && fleeing == false)) {
                fleeing = true;
                this.dim.width *= -1;
                this.fishSpeed.currentX *= -2;
                console.log('a');
            } else if ((this.position.x - this.dim.width > mouseX && this.position.x + this.dim.width < mouseX && this.dim.width < 0 && fleeing == false)) {
                fleeing = true;
                this.dim.width *= -1;
                this.fishSpeed.currentX *= -2;
                console.log('b');
            }
        }
    }

    blink() {
        //before and after right side
        if (this.position.x + this.dim.width * 0.6 > width || this.position.x - this.dim.width * 1.2 > width) {
            blinking = true;
        }
        //before and after left side
        else if (this.position.x + this.dim.width * 0.6 < 0 || this.position.x - this.dim.width * 1.2 < 0) {
            blinking = true;
        }
        //normal blinking
        else if (random(0, 1000) < 5) {
            blinking = true;
        } else {
            blinking = false;
        }

    }

    eat() {
        for (var i = 0; i < FoodArray.length; i++) {
            for (var f = 0; f < FishArray.length; f++)
                if (i.position.x == f.position.x && i.position.y == f.position.y) {
                    f.nutrition += i.nutrition;
                    console.log(f.nutrition);
                }
        }
    }

    aging() {
        for (var i = 0; i < FishArray.length; i++) {
            FishArray[i].life.currentAge += FishArray[i].life.lifeSpan / worldSpeed;
        }
    }

    die() {
        for (var i = 0; i < FishArray.length; i++) {
            if (FishArray[i].life.currentAge >= FishArray[i].life.lifeSpan) {
                FishArray.splice(i, 1)
                var counter = select('#fishCounter');
                counter.html(FishArray.length);
            }
        }
    }
}


class Food {
    constructor() {
        /* this.position = {
          x: random(0, width),
          y: random(0, height)
        }; */
        this.position = createVector(random(0, width), random(0, height));
        this.nutrition = random(1, 10);
        this.size = this.nutrition;
    }

    display() {

        fill("#000");
        ellipse(this.position.x, this.position.y, this.size, this.size)
    }

}
class planet{
    constructor(name, origin, maxX, maxY, start, mass, radius, semi_major_axis, perihelion, aphelion, orbital_period, rotation_period, axial_tilt, temperature, surface_gravity, composition, moons, z_index){
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.semi_major_axis = semi_major_axis;
        this.perihelion = perihelion;
        this.aphelion = aphelion;
        this.orbital_period = orbital_period;
        this.rotation_period = rotation_period;
        this.axial_tilt = axial_tilt;
        this.temperature = temperature;
        this.surface_gravity = surface_gravity;
        this.composition = composition;
        this.moons = moons;
        this.origin = origin;
        this.maxX = maxX;
        this.maxY = maxY;
        this.start = start;
        this.position = start;
        this.z_index = z_index;
        this.top = true;
        // Calculate the movement per second of the planet, in half the orbital period, the planet goes through maxX to -maxX once
        // Set so that 1 second = 1 hour (planets will move 1 hour per second)
        // Negative value means the planet is moving right to left, positive means left to right
        this.movement_per_second = -((this.maxX*2)/(this.orbital_period/2));
        //temporarily increase speed REMOVE THIS
        this.movement_per_second *= speed_multiplier;
        
        let rings = 0;
        // include rings for saturn and uranus to properly scale the planet
        if(this.name == 'Saturn'){
            rings = 80000;
        }
        else if(this.name == 'Uranus'){
            rings = 25000;
        }
        // This line sets the scale of the planet on a logarithmic scale so that earth is original sized, and jupiter is 3x larger, currently ~2.2th root
        this.scale = ((radius+rings)/6371)**0.4545

        this.planet_height = 100*this.scale;
        this.planet_width = 100*this.scale;

        // find planet offset to center the planet in its correct position on the ellipse
        this.offsetX = 1/2*this.planet_width;
        this.offsetY = 1/2*this.planet_height;
    }

    get real_position(){
        let realPositionX = this.origin[0] + this.position[0]-this.offsetX;
        let realPositionY = this.origin[1] - this.position[1]-this.offsetY;
        return [realPositionX, realPositionY];
    }

    get card_offset(){
        let x_offset = 0;
        let y_offset = 0;
        // if x is between -maxX and -1/3*maxX, card is on the right
        if(this.position[0] > -this.maxX && this.position[0] < -.2*this.maxX){
            x_offset = this.planet_width;
            y_offset = -this.planet_height;
        }
        // if x is between -1/3*maxX and 1/3*maxX, and y is positive, card is on the bottom
        else if(this.position[0] > -.2*this.maxX && this.position[0] < .2*this.maxX && this.position[1] > 0){
            y_offset = 0;
            x_offset = 0;
        }
        // if x is between 1/3*maxX and maxX, card is on the left
        else if(this.position[0] > .2*this.maxX && this.position[0] < this.maxX){
            x_offset = -500;
            y_offset = -this.planet_height;
        }
        // if x is between -1/3*maxX and 1/3*maxX, and y is negative, card is on the top
        else if(this.position[0] > -.2*this.maxX && this.position[0] < .2*this.maxX && this.position[1] < 0){
            y_offset = -this.planet_height-400;
            x_offset = 0;
        }
        return [x_offset, y_offset];
    }

    // Move the planet by the movement per second times the time passed in seconds
    move(deltaT){
        // Check change conditions
        // If top is true, the planet is moving right to left and y is positive, if top is false, the planet is moving left to right and y is negative
        // Swap when the planet reaches the end of the ellipse
        // Change z-index to move in front or behind other planets/sun
        // Swap movement_per_second to move in the opposite direction
        if((this.position[0] <= -(this.maxX)) && this.top){
            this.top = false;
            this.z_index = 20-this.z_index;
            this.movement_per_second = -this.movement_per_second;
        }
        else if((this.position[0] >= this.maxX) && !this.top){
            this.top = true;
            this.z_index = 20-this.z_index;
            this.movement_per_second = -this.movement_per_second;
        }

        // Move the planet
        let movement = this.movement_per_second*deltaT;
        let x = this.position[0] + movement;
        // lock x to the max values of the ellipse
        if(x > this.maxX){
            x = this.maxX;
        }
        else if(x < -this.maxX){
            x = -this.maxX;
        }
        // y is defined by the equation of an ellipse, positive if top is true, negative if top is false
        let y = (this.maxY*((this.maxX**2-x**2)**.5))/this.maxX;
        if(!this.top){
            y = -y;
        }
        this.position = [x,y];
    }
}

function read_planet_data(planet_data_json){
    let planets = [];
    let planets_data = JSON.parse(planet_data_json);
    planets_data = planets_data.objects;
    let planet_names = ['Eris', 'Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Mars', 'Earth', 'Venus', 'Mercury'];
    // Origins represents the starting position of the planets, repective to their max x values. Y values always start positive, determined by x value.
    
    let screen_width = window.innerWidth;
    console.log("screen width:", screen_width);
    let screen_height = window.innerHeight;
    console.log("screen height:", screen_height);
    width_padding = .025*screen_width;
    console.log("width padding:", width_padding);
    height_padding = .025*screen_height;
    console.log("height padding:", height_padding);
    for(let i = 0; i < planet_names.length; i++){
        let planet_name = planet_names[i];
        let planet_data = planets_data[planet_name];
        let name = planet_names[i];
        //origin represents the center of the ellipse that the planet will orbit around
        let originX = screen_width/2
        let originY = screen_height/2 + (i*(height_padding))
        let origin = [originX, originY];
        //maxX represents the maximum width of the ellipse that the planet will orbit around
        let maxX = screen_width/2 - ((i+1)*width_padding);
        let maxY = screen_height/2 - ((i+1)*height_padding);
        //find the starting position of the planet, origin is a percentage of maxX
        let startX = planet_data.origin*maxX;
        // startY is defined by the equation of an ellipse, always the positive value
        let startY = (maxY*((maxX**2-startX**2)**.5))/maxX;
        let start = [startX,startY];
        let mass = planet_data.mass;
        let radius = Number(planet_data.equatorial_radius);
        let semi_major_axis = planet_data.orbital_distance;
        let perihelion = planet_data.perihelion;
        let aphelion = planet_data.aphelion;
        let orbital_period = Number(planet_data.orbital_period);
        let rotation_period = planet_data.rotationary_period;
        let axial_tilt = planet_data.axis_of_rotation;
        let temperature = planet_data.temperature;
        let surface_gravity = planet_data.gravity;
        let composition = planet_data.composition;
        let moons = planet_data.number_of_moons;
        //sun z-index is 10, planets behind sun are 11-20, planets in front of sun are 0-9
        let z_index = i;
        planets.push(new planet(name, origin, maxX, maxY, start, mass, radius, semi_major_axis, perihelion, aphelion, orbital_period, rotation_period, axial_tilt, temperature, surface_gravity, composition, moons, z_index));
    }
    return planets;
}

function add_planets_to_html(planets){
    console.log('Adding planets to html');
    console.log(planets);
    let planet_div = document.getElementById('planets');
    for(let i = 0; i < planets.length; i++){
        let planet = planets[i];
        let real_position = planet.real_position;
        
        // Set rotation period in degrees per second, rotation period is in hours with a scale of 1 hour/second
        let rotation_period = (1/planet.rotation_period)*360*speed_multiplier;

        let planet_height = planet.planet_height;
        let planet_width = planet.planet_width;

        let orbital_period_output = '';
        if(planet.orbital_period > 24*365){
            orbital_period_output = Math.round((planet.orbital_period/(24*365))*100)/100 + ' years';
        }
        else if(planet.orbital_period > 48){
            orbital_period_output = Math.round((planet.orbital_period/24)*100)/100 + ' days';
        }
        else{
            orbital_period_output = planet.orbital_period + ' hours';
        }

        let rotation_period_output = '';
        if(planet.rotation_period > 24){
            rotation_period_output = Math.round((planet.rotation_period/24)*100)/100 + ' days';
        }
        else{
            rotation_period_output = planet.rotation_period + ' hours';
        }
      

        let planet_html = '<div class="planet" id="' + planet.name + '" style="position:absolute; left:' + (real_position[0]) + 'px; top:' + (real_position[1]) +'px;">';
                planet_html += '<div class="">';
                    // planet_html += '<canvas id="canvas" width="' + planet.maxX + '" height="' + planet.maxY + '" style="position:absolute; left:' + real_position[0] + 'px; top:' + real_position[1] + 'px;"></canvas>';
                    planet_html += '<div class="planet_model" style="width:'+ planet_width + 'px; height:' + planet_height +'px;">';
                        // planet_html += '<img src="https://t4.ftcdn.net/jpg/10/18/11/31/360_F_1018113113_Ce9kjo5sLSpeQE4OqI3g2Khc9gp6ZzJ6.jpg"' + planet.name + '.png" alt="' + planet.name + '">';
                        // planet_html += '<div class="planet_placeholder" style="position: absolute; width:10px; height:10px;"></div>';
                        planet_html += '<model-viewer id="'+ planet.name + '_model" alt="' + planet.name + '" src="assets/3d/'+ planet.name +'.glb" environment-image="assets/3d/moon_1k.hdr" poster="" shadow-intensity="1" touch-action="pan-y" disable-pan auto-rotate rotation-per-second='+ rotation_period +'deg disable-tap style="transform: rotate('+ planet.axial_tilt+ 'deg);" disable-zoom brightness=-0.5></model-viewer>';
                        // planet_html += '<div class="planet_orbit" style="width:' + 2*planet.maxX + 'px; height:' + 2*planet.maxY + 'px;"></div>';
                        
                    planet_html += '</div>';
                    planet_html += '<div class="card" id="' + planet.name + '_card" planet_info>';
                        planet_html += '<h1>' + planet.name + '</h1>';
                        planet_html += '<p>Mass: ' + planet.mass + ' kg</p>';
                        planet_html += '<p>Radius: ' + planet.radius + ' km</p>';
                        planet_html += '<p>Semi Major Axis: ' + planet.semi_major_axis + ' AU</p>';
                        planet_html += '<p>Perihelion: ' + planet.perihelion + ' AU</p>';
                        planet_html += '<p>Aphelion: ' + planet.aphelion + ' AU</p>';
                        planet_html += '<p>Orbital Period: ' + orbital_period_output + '</p>';
                        planet_html += '<p>Rotation Period: ' + rotation_period_output + '</p>';
                        planet_html += '<p>Axial Tilt: ' + planet.axial_tilt + ' degrees</p>';
                        planet_html += '<p>Temperature: ' + planet.temperature + ' K</p>';
                        planet_html += '<p>Surface Gravity: ' + planet.surface_gravity + ' m/s^2</p>';
                        planet_html += '<p>Composition: ' + planet.composition + '</p>';
                        planet_html += '<p>Moons: ' + planet.moons + '</p>';
                    planet_html += '</div>';
                planet_html += '</div>';
            planet_html += '</div>';
        planet_div.innerHTML += planet_html;
    
    }
}
var speed_multiplier = 1;

var slider = document.getElementById("speed-multiplier");
var output = document.getElementById("speed-output");
var planets = [];
output.innerHTML = slider.value;

slider.oninput = function() {
    output.value = this.value;
    update_speed(this.value);
}

output.oninput = function() {
    if (Number(this.value) != NaN){
        slider.value = this.value;
        output.ariaPlaceholder = this.value;
        update_speed(this.value);
        }
    }
    

function update_speed(speed){
    change_speed(speed, planets);

    let speed_info = document.getElementById('speed-info');
    plural = '';
    if(speed_multiplier != 1){
        plural = 's';
    }
    speed_info.innerHTML = speed_multiplier + ' hour' + plural + ' each real second';

    let earth_speed_info = document.getElementById('earth-speed-info');
    let earth_speed = 365*24/speed_multiplier;
    if(earth_speed >= 120){
        earth_speed = earth_speed/60;
        earth_speed = Math.round(earth_speed*100)/100;
        earth_speed_info.innerHTML = earth_speed + ' real minutes';
    }
    else{
        if(earth_speed > 0.01){
            earth_speed = Math.round(earth_speed*100)/100;
        }
        earth_speed_info.innerHTML = earth_speed + ' real seconds';
    }
    
    let planet_speed_info = document.getElementById('planet-speed-info');
    planet_speed_info.innerHTML = ' ' + Math.round(3600*speed_multiplier) + 'x as fast as real life!';
}


function change_speed(speed, planets){
    planets.forEach(planet => {

        //reset movement per second
        let movement_per_second = ((planet.maxX*2)/(planet.orbital_period/2));
        //add new speed multiplier
        movement_per_second *= speed;
        //move planet in the correct direction
        if(planet.top){
            planet.movement_per_second = -movement_per_second;
        }
        else{
            planet.movement_per_second = movement_per_second;
        }
        let planet_model = document.getElementById(planet.name + '_model');
        planet_model.setAttribute('rotation-per-second', (1/planet.rotation_period)*360*speed + 'deg');
    }
    );
    let sun_model = document.getElementById('Sun_model');
    sun_model.setAttribute('rotation-per-second', (1/24)*360*speed + 'deg');
    speed_multiplier = speed;
}


fetch('https://jlefevre559.github.io/system_project/system.json')
    .then(response => response.json())
    .then(data => {
        planet_data_json = JSON.stringify(data);

        planets = read_planet_data(planet_data_json);
        add_planets_to_html(planets);

        //sleep function to wait for the planets to be added to the html before moving them
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        console.log('sleeping');
        sleep(1000).then(() => {
            console.log('sleep done');
            let last_time = new Date();
            function update(){
                let current_time = new Date();
                let deltaT = (current_time - last_time)/1000;
                for(let i = 0; i < planets.length; i++){
                    planets[i].move(deltaT);
                    let planet = document.getElementById(planets[i].name);
                    let real_position = planets[i].real_position;
                    // Transform the planet to its new position
                    planet.style.left = (real_position[0]) + 'px';
                    planet.style.top = (real_position[1]) + 'px';
                    planet.style.zIndex = planets[i].z_index;
                    // check for hovered planet
                    if(document.querySelector('.planet[id='+ planets[i].name + ']:active') != null){
                        planet.style.zIndex = 30;
                    }
                    
                    
                    let card = document.getElementById(planets[i].name + '_card');
                    let card_offset = planets[i].card_offset;
                    // Transform the card to its new position
                    card.style.left = (card_offset[0]) + 'px';
                    card.style.top = (card_offset[1]) + 'px';
                    let cards = document.getElementsByClassName('card');
                    for(let j = 0; j < cards.length; j++){
                        cards[j].style.zIndex = 30;
                    }
                }
                last_time = current_time;
                requestAnimationFrame(update);
            }
            sleep(50).then(() => {
                console.log('sleep done');
                update();
            });
        });
    });


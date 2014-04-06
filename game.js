/*
-------------------------------------------------------------------------------
--
--	Krzysztof Jankowski
--	P 1 X  G A M E S
--
--	p1x.in
--	@w84death
--
--	Logic War [30.03.2014]
--
-------------------------------------------------------------------------------
*/

var version = 'alpha2'
console.log('Logic War '+version+'\n--------------------------')

var game = {
	field: null,
	width: 4,
	height: 4,
	spriteSize: 64,
	score: {
		red: 0,
		blue: 0
	},
	turn: 0,

	blockTypes: ['unit red','unit blue','wall','trap', 'health'],
	blockLabels: ['1','1','','!', '+'],
	bigArray: null,
	lastID: 0,

	init: function(){

		// init DOM
		this.field = document.getElementById('game');
		this.field.style.width = this.width * this.spriteSize + 'px';
		this.field.style.height = this.height * this.spriteSize + 'px';
		document.body.style.width = this.field.style.width;
		// init array
		this.bigArray = [];
		for (var i = 0; i < this.width; i++) {
			this.bigArray[i] = [];
		};

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.bigArray[x][y] = null;
			};
		};

		window.addEventListener("keydown", function(event) {
		    if([32, 37, 38, 39, 40].indexOf(event.keyCode) > -1) {
		       event.preventDefault();
		       game.registerMove(event); 
		    }
		}, false);

		var hammertime = Hammer(this.field, {swipe_velocity: 0.1}).on('dragleft dragright dragdown dragup swipeleft swiperight swipeup swipedown', function(event) {				        		
	        event.gesture.preventDefault();
	        if(['swipeleft','swiperight','swipeup','swipedown'].indexOf(event.type) > -1) {
	        	game.registerMove(event);   	
	        }
    	});

		Element.prototype.remove = function() {
		    this.parentElement.removeChild(this);
		}		

		// start new game
		this.newGame();
	},

	registerMove: function(event){
        this.moveField(event);
        this.turn++;
        setTimeout(function() {
        	game.generateRandomBlock({type:false})
        }, 300);
	},

	newSeed: function(){
		var randomizer = new Date(),
			pathArray = window.location.pathname.split( '/' ),
			seed = pathArray[1] || randomizer;

		// get seed from url or use date (random)
		console.log('RANDOM SEED: '+seed);
		Math.seedrandom(seed);
	},

	newGame: function(){		
		this.newSeed();

		this.turn = 0;
		this.field.innerHTML = '';
		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				this.bigArray[x][y] = null;
			};
		};
		this.score = {
			red: 0,
			blue: 0
		}
		
		this.generateRandomBlock({type:0});
		this.generateRandomBlock({type:1});
		this.generateRandomBlock({type:2});
	},

	generateRandomBlock: function(params){

		// CLEAR GARBAGE
		var garbage = document.getElementsByTagName('span');
		for (var i = 0; i < garbage.length; i++) {
			if(garbage[i].id == '-1'){
				garbage[i].remove();
			}
		};

		// FIND EMPTY FIELDS
		var emptyFields = [];

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if(this.bigArray[x][y] == null){
					emptyFields.push({x:x, y:y});
				}
			};
		};


		if(emptyFields.length > 0){
			var randomField = (Math.random()*emptyFields.length)<<0,
				type = null;

			// DECIDE WHAT BLOCK TO GENERATE
			if(params.type !== false){
				type = params.type;
			}else{
				var randomizer = (Math.random()*100)<<0;
				if(randomizer < 35) type = 0; else
				if(randomizer < 70) type = 1; else
				if(randomizer < 80) type = 2; else
				if(randomizer < 90) type = 3; else
				type = 4;
			}

			// INSERT NEW BLOCK
			this.insertBlock({
				x:emptyFields[randomField].x,
				y:emptyFields[randomField].y,
				type: type
			});

			// CALCULATE SCORE
			this.calculateScore();

			return true;
		}else{
			// WHELL.. EVERY GAME HAS AN END
			this.gameOver();
			return false;
		}
	},

	gameOver: function(){		
		var score = this.score.blue-this.score.red;
		alert('Game Over\nYOUR SCORE IS '+ score );
		this.newGame();
	},

	insertBlock: function(params){
		var newID = this.lastID++,
			newBlock = document.createElement('span');

		// MAKE DOM STUFF
		newBlock.className = this.blockTypes[params.type];
		newBlock.id = newID;
		newBlock.style.left = params.x * this.spriteSize + 'px';
		newBlock.style.top = params.y * this.spriteSize + 'px';
		newBlock.innerHTML = this.blockLabels[params.type];
		this.field.appendChild(newBlock);

		// ADD ID TO THE ARRAY
		this.bigArray[params.x][params.y] = {
			id: newID,
			type: params.type,
			level: 1
		};

		return true;
	},

	calculateScore: function(){
		this.score.red = 0;
		this.score.blue = 0;

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if(this.bigArray[x][y] !== null){
					if(this.bigArray[x][y].type === 0){
						this.score.red += this.bigArray[x][y].level;
					}
					if(this.bigArray[x][y].type === 1){
						this.score.blue += this.bigArray[x][y].level;
					}
				}
			};
		};
		document.getElementById('red-score').innerHTML = this.score.red;
		document.getElementById('blue-score').innerHTML = this.score.blue;

		if(this.score.blue === 0 && this.turn > 0){
			this.gameOver();
		}
	},

	fadeBlock: function(id){
		document.getElementById(id).style.opacity = 0;
		document.getElementById(id).id = -1;
	},

	calculateNewBlock: function(a, b){
		if(this.bigArray[a.x][a.y] === null){
			this.bigArray[a.x][a.y] = {
				id: this.bigArray[b.x][b.y].id,
				type: this.bigArray[b.x][b.y].type,
				level: this.bigArray[b.x][b.y].level
			}
			this.bigArray[b.x][b.y] = null;
		}
		else
		if(this.bigArray[a.x][a.y].type < 2 && this.bigArray[b.x][b.y].type < 2 && this.bigArray[a.x][a.y].type === this.bigArray[b.x][b.y].type){
			this.fadeBlock(this.bigArray[a.x][a.y].id);
			this.bigArray[a.x][a.y].id = this.bigArray[b.x][b.y].id;
			this.bigArray[a.x][a.y].level += this.bigArray[b.x][b.y].level;
			this.bigArray[b.x][b.y] = null;
		}else
		if(this.bigArray[a.x][a.y].type < 2 && this.bigArray[b.x][b.y].type < 2 && this.bigArray[a.x][a.y].type !== this.bigArray[b.x][b.y].type){
			if(this.bigArray[a.x][a.y].level > this.bigArray[b.x][b.y].level){
				this.fadeBlock(this.bigArray[b.x][b.y].id);
				this.bigArray[a.x][a.y].level -= 1;
				this.bigArray[b.x][b.y] = null;
			}else
			if(this.bigArray[a.x][a.y].level < this.bigArray[b.x][b.y].level){
				this.fadeBlock(this.bigArray[a.x][a.y].id);
				this.bigArray[b.x][b.y].level -= 1;
				this.bigArray[a.x][a.y] = null;
			}else
			if(this.bigArray[a.x][a.y].level == this.bigArray[b.x][b.y].level){
				this.fadeBlock(this.bigArray[a.x][a.y].id);
				this.fadeBlock(this.bigArray[b.x][b.y].id);
				this.bigArray[a.x][a.y] = null;
				this.bigArray[b.x][b.y] = null;
			}
		}else
		if(this.bigArray[a.x][a.y].type === 3 || this.bigArray[b.x][b.y].type === 3){
			this.fadeBlock(this.bigArray[a.x][a.y].id);
			this.fadeBlock(this.bigArray[b.x][b.y].id);
			this.bigArray[a.x][a.y] = null;
			this.bigArray[b.x][b.y] = null;
		}else
		if(this.bigArray[a.x][a.y].type === 4 && this.bigArray[b.x][b.y].type < 2){
			this.fadeBlock(this.bigArray[a.x][a.y].id);
			this.bigArray[a.x][a.y] = {
				id: this.bigArray[b.x][b.y].id,
				type: this.bigArray[b.x][b.y].type,
				level: this.bigArray[b.x][b.y].level + 1
			}
			this.bigArray[b.x][b.y] = null;
		}else
		if(this.bigArray[a.x][a.y].type < 2 && this.bigArray[b.x][b.y].type === 4){
			this.fadeBlock(this.bigArray[b.x][b.y].id);
			this.bigArray[a.x][a.y].level += 1;
			this.bigArray[b.x][b.y] = null;
		}
	},

	moveField: function(event){
		var x,y,temp;

		// UP

		if(event.keyIdentifier == 'Up' || event.type == 'swipeup'){
			for (y = 0; y < this.height; y++) {
				for (x = 0; x < this.width; x++) {
					temp = y+1;
					while(temp < this.height){
						if(this.bigArray[x][temp] !== null){
							this.calculateNewBlock({x:x,y:y},{x:x,y:temp});
							temp = this.height;
						}
						temp++;
					}
				};
			};
		}

		// DOWN

		if(event.keyIdentifier == 'Down' || event.type == 'swipedown'){
			for (y = this.height-1; y > -1; y--) {
				for (x = 0; x < this.width; x++) {
					temp = y-1;
					while(temp > -1){
						if(this.bigArray[x][temp] !== null){
							this.calculateNewBlock({x:x,y:y},{x:x,y:temp});
							temp = -1;
						}
						temp--;
					}
				};
			};
		}

		// LEFT

		if(event.keyIdentifier == 'Left' || event.type == 'swipeleft'){
			for (x = 0; x < this.width; x++) {
				for (y = 0; y < this.height; y++) {
					temp = x+1;
					while(temp < this.width){
						if(this.bigArray[temp][y] !== null){
							this.calculateNewBlock({x:x,y:y},{x:temp,y:y});
							temp = this.width;
						}
						temp++;
					}
				};
			};
		}

		// RIGHT

		if(event.keyIdentifier == 'Right' || event.type == 'swiperight'){
			for (x = this.width-1; x > -1; x--) {
				for (y = 0; y < this.height; y++) {
					temp = x-1;
					while(temp > -1){
						if(this.bigArray[temp][y] !== null){
							this.calculateNewBlock({x:x,y:y},{x:temp,y:y});
							temp = -1;
						}
						temp--;
					}

				};
			};
		}

		// VISUALY MOVE BLOCKS

		for (var x = 0; x < this.width; x++) {
			for (var y = 0; y < this.height; y++) {
				if(this.bigArray[x][y] !== null){
					var block = document.getElementById(this.bigArray[x][y].id);
					block.style.top = y * this.spriteSize + 'px';
					block.style.left = x * this.spriteSize + 'px';
					if(this.bigArray[x][y].type < 2){
						block.innerHTML = this.bigArray[x][y].level;
					}
				}
			};
		};
	},

	showHelp: function(){
		document.getElementById('help').style.display = 'block';
	},
	closeHelp: function(){
		document.getElementById('help').style.display = 'none';
	},

	showCredits: function(){
		document.getElementById('credits').style.display = 'block';
	},
	closeCredits: function(){
		document.getElementById('credits').style.display = 'none';
	},
}

game.init();
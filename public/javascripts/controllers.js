// Controller for the poll list
//var IpCon = '152.74.16.149';

//var IpCon = '152.74.151.55';

function PollListCtrl2($scope) {
	console.log("scope",$scope);
}

 function PollListCtrl($scope, Poll,$http) {
	$scope.polls = Poll.query();
	var refresh = function(){

		$http.get('/polls/polls').success(function(response){
			$scope.polls = response;
			console.log("clean");

		});
	}
	//refresh();
	$scope.delete = function(poll_id) {
		var Polln = new Poll();
		var id = poll_id;
		if (confirm("Seguro que desea borrar esta encuesta?")) {
		//	console.log("asdsdfasdfasdsadasd",id);

			$http.delete('/deleteobject/'+ id).then(function(){

				refresh();
			});


		}
	};

	$scope.open = function() {
		$scope.showModal = true;
	};

	$scope.ok = function() {

		
	//	console.log("delete",poll_id);
		$scope.showModal = false;
	};

	$scope.cancel = function() {
		$scope.showModal = false;
	};




	$scope.logout =function(){
		if (confirm("Seguro que desea salir?")) {
			$http.get('/logout/');
				console.log("logout");
		}
	
	};

	
}

// Controller for an individual poll
function PollItemCtrl2($scope, $routeParams, socket, Poll) {
	$scope.poll = Poll;
	
	//console.log($scope.poll);
	var perro;

	
	$scope.polltipo3 = {
		elecciones: [ { text: '', Cantidad: 0 },],
	};

	var dif = $scope.poll.choices_tipo3.length - 2;
	for(var i = 0; i < $scope.poll.choices_tipo3.length; i++){
		if(i > 0){
			$scope.polltipo3.elecciones.push({ text: $scope.poll.choices_tipo3[i].text, Cantidad: 0 });
		}else{
			$scope.polltipo3.elecciones[i].text = $scope.poll.choices_tipo3[i].text;
		}
	}
	//console.log($scope.polltipo3);
	switch(parseInt($scope.poll.tipo)){
		case 0:
			perro = $scope.poll.choices_tipo1;
			break;
		case 1:
			perro = $scope.poll.choices_tipo2;
			break;
		case 2:
			perro = $scope.poll.choices_tipo3;
			break;
	}

	$scope.polled = perro;
	
	$scope.newValue=function(top, dato){
		$scope.polltipo3.elecciones[top].Cantidad = dato;
    }


	socket.on('myvote', function(data) {
		if(data._id === $routeParams.pollId) {

			$scope.poll = data;
		}
	});
	
	socket.on('vote', function(data) {
		if(data._id === $routeParams.pollId) {
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
		}		
	});
	
	$scope.vote = function() {
		if(parseInt($scope.poll.tipo)!=2){
			var pollId = $scope.poll._id,
				choiceId = $scope.poll.userVote;
			
			if(choiceId) {
				var voteObj = { poll_id: pollId, choice: choiceId };
				socket.emit('send:vote', voteObj);
			} else {
				alert('You must select an option to vote for');
			}
		}else{

			var pollId = $scope.poll._id,
				choiceId = $scope.poll.userVote;
				
			var voteObj = { poll_id: pollId, choice: $scope.polltipo3 };
			socket.emit('send:vote', voteObj);
			
		}
	};
}
// Controller for an individual poll
function PollItemCtrl($scope, $routeParams, socket, Poll, $http, $timeout) {	
	$scope.poll = Poll;
	$scope.Activado = $scope.poll.Activa;
	var myLineChart;
//	console.log("A " +$scope.Activado);
	
	$scope.showMoreFunc = function() {
		$scope.Activado = true;
    	var mytimeout = $timeout($scope.onTimeout,1000);
		$http.get('/grabar/'+$scope.poll._id).success(function(){
			// console.log("YAY!");
		});
		/*$http.get('http://'+IpCon+':3000/grabar/'+$scope.poll._id).success(function(){
			 console.log("YAY!");
		});*/
	} 

	$scope.showMoreFunc2 = function() {
		 $scope.Activado = false;
		 $http.get('/detener/'+$scope.poll._id).success(function(){
			// console.log("YAY!");
			});
		 /*$http.get('http://'+IpCon+':3000/detener/'+$scope.poll._id).success(function(){
			 console.log("YAY!");
			});*/
	} 

	/**/

	$scope.counter = $scope.poll.TimeToExpire/1000;
    $scope.onTimeout = function(){
		if($scope.counter>0){
        	$scope.counter--;
        	mytimeout = $timeout($scope.onTimeout,1000);
		}
    }
    
    $scope.stop = function(){
        $timeout.cancel(mytimeout);
    }

	$scope.$on('$viewContentLoaded', function(){
		var largo2;
		var typez = "";
		
		var choicesl;
		switch(parseInt($scope.poll.tipo)){
			case 0:
				largo2 = $scope.poll.choices_tipo1.length;
				choicesl = $scope.poll.choices_tipo1;
				typez = "pie";
				break;
			case 1:
				largo2 = $scope.poll.choices_tipo2.length;
				choicesl = $scope.poll.choices_tipo2;
				typez = "doughnut";
				break;
			case 2:
				largo2 = $scope.poll.choices_tipo3.length;
				choicesl = $scope.poll.choices_tipo3;
				typez = "bar";
				break;
		}

		//var largo2 = $scope.poll.choices.length;
		var datos = {
				labels: [
					"Red", "Blue", "Yellow"
					],
				datasets: [{
					label: '# of Votes',
					data: [1, 1, 1],
					backgroundColor: [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)'
					],
					borderColor: [
						'rgba(255,99,132,1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)'
					],
					borderWidth: 1
				}]
			}
		var ctx = document.getElementById("myChart").getContext('2d');
		ctx.setLineDash([1, 1]);
				myLineChart = new Chart(ctx, {
				type: typez,
				data: datos,
				options: {
					scales: {
						xAxes: [{
							stacked: true
						}],
						yAxes: [{
							stacked: true
						}]
					}
				}
		});

		for(var i=0; i < largo2; i++){
			myLineChart.data.labels[i] = choicesl[i].text;
		//	console.log(choicesl[i].text);
			if(parseInt($scope.poll.tipo)!=2){
				myLineChart.data.datasets[0].data[i] = choicesl[i].votes.length;
			}else{
				myLineChart.data.datasets[0].label[i] = "Promedio votos";
				myLineChart.data.datasets[0].data[i] = choicesl[i].Cantidad;
			}
		}
		myLineChart.update();
  	});

	socket.on('myvote', function(data) {
		if(data._id === $routeParams.pollId) {
			$scope.poll = data;
		}
	});
	
	socket.on('vote', function(data) {
		if(data._id === $routeParams.pollId) {
			var largo = data.choices.length;
			$scope.poll.choices = data.choices;
			$scope.poll.totalVotes = data.totalVotes;
			for(var i=0; i < largo; i++){
				myLineChart.data.labels[i] = $scope.poll.choices[i].text;
				if(parseInt($scope.poll.tipo)!=2){
					myLineChart.data.datasets[0].data[i] = $scope.poll.choices[i].votes.length;
				}else{
					myLineChart.data.datasets[0].label[i] = "Promedio votos";
					myLineChart.data.datasets[0].data[i] = $scope.poll.choices[i].Cantidad;
				}
			}
			//myLineChart.data.datasets[0].data[5] = 10;
    		myLineChart.update();
		}		
	});
	
	$scope.vote = function() {
		var pollId = $scope.poll._id,
				choiceId = $scope.poll.userVote;
		
		if(choiceId) {
			var voteObj = { poll_id: pollId, choice: choiceId };
			socket.emit('send:vote', voteObj);
		} else {
			alert('You must select an option to vote for');
		}
	};
}

function PollConfigCrtl($scope,$location,Data,$http){

	
	console.log("scope",Data);

}

function PollEditCtrl($scope, $location, Poll, Poll2, $http) {
	console.log("poll2",Poll2);
	$scope.cat = {
			catSchema: Poll2.catSchema

		};

	var auxSele = -1;
	$scope.isCorrect = 2;
	$scope.opcion = Poll2.tipo;
	$scope.polltipo = {
		pregunta: Poll2.question,
		tipo: Poll2.tipo,
		Min: Poll2.Min,
		Max: Poll2.Max,
		RealTime: Poll2.RealTime,
		Activa: Poll2.Activa,
		TimeToExpire: (Poll2.TimeToExpire/1000),
		

	};

	$scope.polltipo1 = {
		elecciones: [ { text: '' }, { text: '' } ],
	};

	$scope.polltipo2 = {
		elecciones: [ { text: '', isCorrect: true }, { text: '', isCorrect: true}],
	};

	$scope.polltipo3 = {
		elecciones: [ { text: '', Cantidad: 0 }, { text: '', Cantidad: 0}],
	};
	$scope.$on('$viewContentLoaded', function(){
		
		switch($scope.opcion){
			case 0:
				for(var i = 2; i < Poll2.choices_tipo1.length; i++) {
					$scope.addChoice(0);
				}
				for(var i = 0; i < Poll2.choices_tipo1.length; i++) {
					$scope.polltipo1.elecciones[i].text = Poll2.choices_tipo1[i].text;
				}
				break;
			case 1:
				for(var i = 2; i < Poll2.choices_tipo2.length; i++) {
					$scope.addChoice(1);
				}
				for(var i = 0; i < Poll2.choices_tipo2.length; i++) {
					$scope.polltipo2.elecciones[i].text = Poll2.choices_tipo2[i].text;
					$scope.polltipo2.elecciones[i].isCorrect = Poll2.choices_tipo2[i].isCorrect;
					if(Poll2.choices_tipo2[i].isCorrect){
						$scope.isCorrect = i;
					}
				}
			//	console.log($scope.polltipo2);
				break;
			case 2:
				for(var i = 2; i < Poll2.choices_tipo3.length; i++) {
					$scope.addChoice(2);
				}
				for(var i = 0; i < Poll2.choices_tipo3.length; i++) {
					$scope.polltipo3.elecciones[i].text = Poll2.choices_tipo3[i].text;
				}
				break;
		}
	});
	
	$scope.addChoice = function() {
		switch($scope.opcion){
			case 0:
				$scope.polltipo1.elecciones.push({ text: '' });
				break;
			case 1:
				$scope.polltipo2.elecciones.push({ text: '', isCorrect: false });
				break;
			case 2:
				$scope.polltipo3.elecciones.push({ text: '', Cantidad: 0 });
				break;
		}
	};


	$scope.newValue=function(top){
		 if(auxSele != -1){
		 	$scope.polltipo2.elecciones[auxSele].isCorrect = false;
		 }
		 $scope.polltipo2.elecciones[top].isCorrect = true;
		 auxSele = top;
    }

	$scope.getDRT = function(RTselect){
		var Lrt = false;
		if(RTselect == "true"){
			Lrt = true;
		}
		$scope.RealTime = Lrt;
	}

	$scope.getDataSelect = function(typo){
		switch(parseInt(typo)){
			case -1:
				$scope.opcion = -1;
				break;
			case 0:
				$scope.opcion = 0;
				break;
			case 1:
				$scope.opcion = 1;
				break;
			case 2:
				$scope.opcion = 2;
				break;
		}
		//console.log($scope.opcion);
	}
	
	// Validate and save the new poll to the database
	$scope.createPoll = function() {
		//console.log("scope create",$scope)
		//$window.location.href = 
		//window.location.href = '/pop/'+Poll2._id;
		//$location.path('/pop/'+Poll2._id);
			var poll = $scope.polltipo;
		

			//cat

			var catcat;
			catcat = $scope.cat;
		for(var i=0; i < catcat.catSchema.length; i++){
			var tag = catcat.catSchema[i];
			
		}
			//end cat

			var pollTipos;
			switch(parseInt(poll.tipo)){
				case 0:
					pollTipos = $scope.polltipo1;
					break;
				case 1:
					pollTipos = $scope.polltipo2;
					break;
				case 2:
					pollTipos = $scope.polltipo3;
					break;

			}
			// Check that a question was provided
			if(pollTipos.elecciones.length > 0 && parseInt(poll.tipo) >= 0) {
				var choiceCount = 0;
				
				// Loop through the choices, make sure at least two provided
				for(var i = 0, ln = pollTipos.elecciones.length; i < ln; i++) {
					var choice = pollTipos.elecciones[i];
					
					if(choice.text.length > 0) {
						choiceCount++
					}
				}
			
				if(choiceCount > 1) {
					var pollAux;
					switch(parseInt(poll.tipo)){
						case 0:
							var pollAux = { question: poll.pregunta,
											tipo: poll.tipo,
											Min: 0,
											Max: 0,
											RealTime: poll.RealTime,
											Activa: poll.Activa,
											TimeToExpire: poll.TimeToExpire,
											choices_tipo1: pollTipos.elecciones,
											catSchema: catcat.catSchema
											};
							break;
						case 1:
							var pollAux = { question: poll.pregunta,
											tipo: poll.tipo,
											Min: 0,
											Max: 0,
											RealTime: poll.RealTime,
											Activa: poll.Activa,
											TimeToExpire: poll.TimeToExpire,
											Max:poll.Max,
											choices_tipo2: pollTipos.elecciones,
											catSchema: catcat.catSchema
											};
							break;
						case 2:
							var pollAux = { question: poll.pregunta,
											tipo: poll.tipo,
											Min: poll.Min,
											Max: poll.Max,
											RealTime: poll.RealTime,
											Activa: poll.Activa,
											TimeToExpire: poll.TimeToExpire,
											choices_tipo3: pollTipos.elecciones,
											catSchema: catcat.catSchema
											};
							break;
					}

				//	console.log("editfinish",pollAux);
					if(parseInt(poll.tipo) == 2 && poll.Min >= poll.Max){
						alert('El valor minimo de la encuesta no puede ser mayor o igual al valor maximo asignado');
					}else{

						$http.post('/pop/'+Poll2._id, JSON.stringify(pollAux)).then(function(){
							$location.path('polls');
						});
					}
				} else {
					alert('You must enter at least two choices');
				}
			} else {
				alert('You must enter a question');
			}
		
	}
}

// Controller for creating a new poll
function PollNewCtrl($scope, $location, Poll) {
	// Define an empty poll model object
	//console.log($scope);

	$scope.cat = {
			catSchema: [{text:'Todas'}],
		};

	var auxSele = -1;
	$scope.opcion = -1;
	$scope.polltipo = {
		pregunta: '',
		tipo: '-1',
		Min: 1,
		Max: 10,
		RealTime: false,
		Activa: false,
		TimeToExpire: 0,
	
	};

	$scope.polltipo1 = {
		elecciones: [ { text: '' }, { text: '' }, { text: '' }],
	};

	$scope.polltipo2 = {
		elecciones: [ { text: '', isCorrect: false }, { text: '', isCorrect: false}, { text: '', isCorrect: false }],
	};

	$scope.polltipo3 = {
		elecciones: [ { text: '', Cantidad: 0 }, { text: '', Cantidad: 0}, { text: '', Cantidad: 0 }],
	};
	
 	$scope.newValue=function(top){
		 if(auxSele != -1){
		 	$scope.polltipo2.elecciones[auxSele].isCorrect = false;
		 }
		 $scope.polltipo2.elecciones[top].isCorrect = true;
		 auxSele = top;
    }

	$scope.getDRT = function(RTselect){
		var Lrt = false;
		if(RTselect == "true"){
			Lrt = true;
		}
		$scope.RealTime = Lrt;
	}

	$scope.getDataSelect = function(typo){
		switch(parseInt(typo)){
			case -1:
				$scope.opcion = -1;
				break;
			case 0:
				$scope.opcion = 0;
				break;
			case 1:
				$scope.opcion = 1;
				break;
			case 2:
				$scope.opcion = 2;
				break;
		}
	//	console.log($scope.opcion);
	}

	// Method to add an additional choice option
	$scope.addChoice = function() {
		switch($scope.opcion){
			case 0:
				$scope.polltipo1.elecciones.push({ text: '' });
				break;
			case 1:
				$scope.polltipo2.elecciones.push({ text: '', isCorrect: false });
				break;
			case 2:
				$scope.polltipo3.elecciones.push({ text: '', Cantidad: 0 });
				break;
		}
	};


	// Validate and save the new poll to the database


	$scope.createPoll = function() {
		var poll = $scope.polltipo;
		var tg = $scope.cat;
	//	console.log("tpoll",poll);
	//	console.log("tag",tg.catSchema);
		var pollTipos;
		var catcat;
			catcat = $scope.cat;
		for(var i=0; i < catcat.catSchema.length; i++){
			var tag = catcat.catSchema[i];
			
		}
	//	console.log("tagif",tag);
		switch(parseInt(poll.tipo)){
			case 0:
				pollTipos = $scope.polltipo1;
				break;
			case 1:
				pollTipos = $scope.polltipo2;
				break;
			case 2:
				pollTipos = $scope.polltipo3;
				break;

		}
		// Check that a question was provided
		if(pollTipos.elecciones.length > 0 && parseInt(poll.tipo) >= 0) {
			var choiceCount = 0;
			
			// Loop through the choices, make sure at least two provided
			for(var i = 0, ln = pollTipos.elecciones.length; i < ln; i++) {
				var choice = pollTipos.elecciones[i];
			//	console.log(choice);
				if(choice.text.length > 0) {
					choiceCount++
				}
			}
				//	console.log("choiceif",choice);

		
			if(choiceCount > 1) {
				var pollAux;
				switch(parseInt(poll.tipo)){
					case 0:
						var pollAux = { question: poll.pregunta,
										tipo: poll.tipo,
										Min: 0,
										Max: 0,
										RealTime: poll.RealTime,
										Activa: poll.Activa,
										TimeToExpire: poll.TimeToExpire,
										choices_tipo1: pollTipos.elecciones,
										catSchema: catcat.catSchema
										};
						break;
					case 1:
						var pollAux = { question: poll.pregunta,
										tipo: poll.tipo,
										Min: 0,
										Max: 0,
										RealTime: poll.RealTime,
										Activa: poll.Activa,
										TimeToExpire: poll.TimeToExpire,
										Max:poll.Max,
										choices_tipo2: pollTipos.elecciones,
										catSchema: catcat.catSchema
										};
						break;
					case 2:
						var pollAux = { question: poll.pregunta,
										tipo: poll.tipo,
										Min: poll.Min,
										Max: poll.Max,
										RealTime: poll.RealTime,
										Activa: poll.Activa,
										TimeToExpire: poll.TimeToExpire,
										choices_tipo3: pollTipos.elecciones,
										catSchema: catcat.catSchema
										};
						break;
				}
				if(parseInt(poll.tipo) == 2 && poll.Min >= poll.Max){
					alert('El valor minimo de la encuesta no puede ser mayor o igual al valor maximo asignado');
				}else{
					// Create a new poll from the model
		//			console.log("pollaux",pollAux);
					var newPoll = new Poll(pollAux);
					// Call API to save poll to the database
					newPoll.$save(function(p, resp) {
						if(!p.error) {
							// If there is no error, redirect to the main view
							$location.path('polls');
							//$location.path('mostrarEn/'+newPoll._id);
						} else {
							alert('Could not create poll');
						}
					});
				}
			
			} else {
				alert('You must enter at least two choices');
			}
		} else {
			alert('You must enter a question');
		}
	};
}
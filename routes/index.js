// Connect to MongoDB using Mongoose
var mongoose = require('mongoose');
var db;

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp_test');
}

// Get Poll schema and model
var PollSchema = require('../models/Poll.js').PollSchema;
var Poll = db.model('polls', PollSchema);

var user_schema = require('../models/Poll.js').user_schema;
var User = db.model('User', User);
// Main application view

exports.most = function(req, res) {
	console.log(req.session.user_id);
	var vars = { feedback: req.session.user_id };
	res.render('mostrarEnc');
};

exports.index = function(req, res) {
	console.log("asdf");
	console.log(req.session);
	if(req.session.user_id)
		res.render('index');
	else
		res.redirect('/');
};

exports.prueba = function(req, res) {
	User.findOne({email:req.body.email,password:req.body.password},function(err,user){
			if (user) {
				req.session.user_id = user._id;
				console.log("rs.session",req.session);
				req.session.name = user.name;
				//res.redirect('index');				
			}
		});
	//res.render('prueba');
};

// JSON API for getting a single poll
exports.poll = function(req, res) {
	// Poll ID comes in the URL
	var pollId = req.params.id;
	console.log("hola amiguitos :v " + pollId);
	// Find the poll by its ID, use lean as we won't be changing it
	Poll.findById(pollId, '', { lean: true }, function(err, poll) {
		if(poll) {
			var userVoted = false,
					userChoice,
					totalVotes = 0;


			// Loop through poll choices to determine if user has voted
			// on this poll, and if so, what they selected
			
			switch(poll.tipo){
				case 0:
					for(c in poll.choices_tipo1) {
						var choice = poll.choices_tipo1[c]; 
						for(v in choice.votes) {
							var vote = choice.votes[v];
							totalVotes++;
							if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
								userVoted = true;
								userChoice = { _id: choice._id, text: choice.text };
							}
						}
					}
					break;
				case 1:
					for(c in poll.choices_tipo2) {
						var choice = poll.choices_tipo2[c]; 

						for(v in choice.votes) {
							var vote = choice.votes[v];
							totalVotes++;

							if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
								userVoted = true;
								userChoice = { _id: choice._id, text: choice.text };
							}
						}
					}
					break;
				case 2:
					for(c in poll.choices_tipo3) {
						var choice = poll.choices_tipo3[c]; 

						for(v in choice.votes) {
							var vote = choice.votes[v];
							totalVotes++;

							if(vote.ip === (req.header('x-forwarded-for') || req.ip)) {
								userVoted = true;
								userChoice = { _id: choice._id, text: choice.text };
							}
						}
					}
					break;

			}
			

			// Attach info about user's past voting on this poll

			poll.userVoted = userVoted;
			poll.userChoice = userChoice;

			poll.totalVotes = totalVotes;
		
			res.json(poll);
		} else {
			res.json({error:true});
		}
	});
};

// JSON API for creating a new poll
exports.create = function(req, res) {
	console.log(req.session.user_id);
	var id_Us = req.session.user_id;
	var tipo = req.body.tipo;
	var reqBody = req.body;
	// Filter out choices with empty text
	var choices;
	var cat = req.body.catSchema;
	//var choices = reqBody.choices.filter(function(v) { return v.text != ''; });
			
	// Build up poll object to save
	var pollObj;
	console.log(tipo +  "  asdasdas");
	switch(parseInt(tipo)){
		case 0:
			choices = reqBody.choices_tipo1.filter(function(v) { return v.text != ''; });
			pollObj = {id_User: id_Us, question: reqBody.question, tipo: parseInt(tipo),
						Min: reqBody.Min,Max:reqBody.Max,
						RealTime: reqBody.RealTime,
						Activa: reqBody.Activa,
						TimeToExpire: reqBody.TimeToExpire*1000,
						choices_tipo1: choices,
						catSchema: cat
						
					};
			break;
		case 1:
			choices = reqBody.choices_tipo2.filter(function(v) { return v.text != ''; });
			pollObj = {id_User: id_Us, question: reqBody.question, tipo: parseInt(tipo),
						Min: reqBody.Min,Max:reqBody.Max,
						RealTime: reqBody.RealTime,
						Activa: reqBody.Activa,
						TimeToExpire: reqBody.TimeToExpire*1000,
						choices_tipo2: choices,
					catSchema: cat};
			break;
		case 2:
			choices = reqBody.choices_tipo3.filter(function(v) { return v.text != ''; });
			pollObj = {id_User: id_Us, question: reqBody.question, tipo: parseInt(tipo),
						Min: reqBody.Min,Max:reqBody.Max,
						RealTime: reqBody.RealTime,
						Activa: reqBody.Activa,
						TimeToExpire: reqBody.TimeToExpire*1000,
						choices_tipo3: choices,
						catSchema: cat};
			break;
	}

	console.log("Create /exports");
	console.log(pollObj);
	// Create poll model from built up poll object
	var poll = new Poll(pollObj);
	
	// Save poll to DB
	poll.save(function(err, doc) {
		if(err || !doc) {
			console.log(JSON.stringify(err))
			throw 'Error';
		} else {
			res.json(doc);
		}		
	});
};



exports.vote = function(socket) {
	
	socket.on('send:vote', function(data) {
		console.log(data);
		var ip = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address.address || socket.request.connection.remoteAddress	;
		console.log("II ke paza?!");
		Poll.findById(data.poll_id, function(err, poll) {
			var choiceL;
			
			switch(parseInt(poll.tipo)){
				case 0:
					choiceL = poll.choices_tipo1;
					break;
				case 1:
					choiceL = poll.choices_tipo2;
					break;
				case 2:
					choiceL = poll.choices_tipo3;
					break;
			}
			var choice;
			
			
			if(parseInt(poll.tipo)!=2){
				choice = choiceL.id(data.choice);
				choice.votes.push({ ip: ip });
			}else{
				var totalVotes = choiceL[0].votes.length;
				console.log(totalVotes);
				for(var i=0;i<choiceL.length;i++){
					choice = choiceL.id(choiceL[i]._id);
					choice.votes.push({ ip: ip });
					if(totalVotes > 0){
						choiceL[i].Cantidad = (choiceL[i].Cantidad * (totalVotes) 
													+ data.choice.elecciones[i].Cantidad)/(totalVotes+1);
						
						console.log(choiceL[i].Cantidad);
					}else{
						choiceL[i].Cantidad = data.choice.elecciones[i].Cantidad;
						console.log(choiceL[i].Cantidad);
					}
				}
			}
			
			poll.save(function(err, doc) {
				var choiceL2;
				switch(parseInt(doc.tipo)){
					case 0:
						choiceL2 = doc.choices_tipo1;
						break;
					case 1:
						choiceL2 = doc.choices_tipo2;
						break;
					case 2:
						choiceL2 = doc.choices_tipo3;
						break;
				}

				var theDoc = { 
						question: doc.question, _id: doc._id, choices: choiceL2, 
						userVoted: false, totalVotes: 0 
				};
				
				// Loop through poll choices to determine if user has voted
				// on this poll, and if so, what they selected
				if(parseInt(doc.tipo)!=2){
					for(var i = 0, ln = choiceL2.length; i < ln; i++) {
						var choice = choiceL2[i]; 

						for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
							var vote = choice.votes[j];
							theDoc.totalVotes++;
							theDoc.ip = ip;
							if(vote.ip === ip) {
								theDoc.userVoted = true;
								theDoc.userChoice = { _id: choice._id, text: choice.text };
							}
						}
					}
				}else{
					theDoc.totalVotes = choiceL[0].votes.length;
					if(theDoc.totalVotes > 0){
						for(var i = 0, ln = choiceL2.length; i < ln; i++) {
							var choice = choiceL2[i];
							for(var j = 0, jLn = choice.votes.length; j < jLn; j++) {
								var vote = choice.votes[j];
								theDoc.ip = ip;
								if(vote.ip === ip) {
									theDoc.userVoted = true;
								}
							}
						}
					}
				}

				socket.emit('myvote', theDoc);
				socket.broadcast.emit('vote', theDoc);
			});			
		});
	});
};

exports.session = function(req, res){
		User.findOne({email:req.body.email,password:req.body.password},function(err,user){
			if (user) {
				req.session.user_id = user._id;
				console.log("rs.session",req.session);
				req.session.name = user.name;
				res.redirect('index');				
			}else{
				var feedbackMsg = "No pudimos iniciar session, email o contraseña incorrecto";
				//res.send("No existe el usuario");
				res.render("login",{type:"warning",feedback: feedbackMsg});
			//	setTimeout(function(){ res.redirect("index"); }, 2000);
			}
		});
	};

exports.login = function(req, res) {
	console.log("rs.login",req.session);
	var vars = { type: req.query.type,
				feedback: req.query.feedback };
	if(req.session.user_id){
		res.redirect("index");
	}

	res.render('login',vars
	);
};

exports.signing = function(req, res){
	res.render('signup');
};

exports.createUser = function(req, res) {
	var user = new User({
		name: req.body.name,
		last_name:  req.body.lastname,
		username:  req.body.username,
		password: req.body.password,
		password_confirmation: req.body.p_c,
		universidad: req.body.uni,
		email: req.body.email
	});

	user.save().then(function(us){
		res.redirect("/log_in?type=success&feedback=Guardamos los datos del usuario");
	},function(err){
		if (err) {
			console.log(String(err));
		}
		var feedbackMsg = "No pudimos guadar los datos del usuario";
		res.render("users",{type:"warning",feedback: feedbackMsg});
		setTimeout(function(){ res.redirect("singup"); }, 2000);

	});
};



// JSON API for list of polls
exports.list = function(req, res) {
	// Query Mongo for polls, just get back the question text
/*	Poll.find({id_User: req.session.user_id},{'catSchema':2}, function(error, cat) {

		res.json(cat);
		console.log(cat);
		
	});
*/

	Poll.find({id_User: req.session.user_id}, ['question', 'tipo',['catSchema']].toArray, function(error, polls) {

		res.json(polls);
	//	console.log(polls);
	//console.log("cat:",polls.catSchema);
	});
};

exports.delete = function(req, res){
		var id = req.params.id;
		console.log(id); 
		Poll.findByIdAndRemove({_id:id}, function(err, doc){
			
			res.json(doc);
			
		});

};

exports.logout =function(req,res){


 req.session.destroy(function(err){

	 	if(!err){
		res.redirect("/log_in");
			console.log("deberia renderizar login");
		 }else{
		res.redirect("/log_in");

		 }

 });
 

};
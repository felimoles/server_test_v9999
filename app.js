var express = require('express');
var fs = require('fs');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var session = require('express-session');
var mongoose = require('mongoose');
var cors = require('cors');

var db;
if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp_test');
}

// Get Poll schema and model
var PollSchema = require('./models/Poll.js').PollSchema;
var Poll = db.model('polls', PollSchema);

// Get Poll schema and model
var PollSchema = require('./models/Poll.js').PollSchema;
var Poll2 = db.model('polls', PollSchema);

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

/*app.all('/*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,HEAD,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'content-Type,x-requested-with');
  next();
});*/
app.use(cors());

// session
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
	secret: "aSdFgHjKlÑ13579",
	resave: false,
	saveUninitialized: false
}));



app.set('port', process.env.VCAP_APP_PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.methodOverride());

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.cookieParser());

// Handle Errors gracefully

app.set('trust proxy', 1); // trust first proxy

app.use(function(err, req, res, next) {
	if(!err) return next();
	res.json({error: true});
});

app.use(app.router);


// Main App Page
app.get('/', routes.login);

app.get('/index', routes.index);

app.get('/log_in', routes.login);

app.get('/sign_up', routes.signing);

app.post('/pruebita', routes.createUser);

app.post('/sesion', routes.session);

app.get('/polls/polls',  routes.list);

app.get('/polls/:id', routes.poll);

app.get('/prueba', routes.prueba);

app.get('/mos', function(req, res) {
	res.render('mos');
});

app.get('/polls2/:id', function(req, res){
	res.redirect('/polls/'+req.body.id);	
});

app.post('/pollsito', function(req, res){
	Poll.findOne({_NumId: req.body.pollId}, function(err,user){
		if (user) {
			res.redirect('/polls/'+user._id);
			//res.json(user);
		}else{
			res.send("No existe el usuario");
		}
	});
});

app.get('/detener/:id', function(req, res){
	Poll.findOne({_id: req.params.id }, function(err,user){
		if (user) {
			if(user.Activa){
				user.Activa = false;
				// Call API to save poll to the database
				user.save(function(err, updatedModel) {
					if(!err) {
						//res.
					} else {
						alert('No se pudo desactivar');
					}
				});
			}
		}
	});
});

app.post('/pop/:id', function(req, res){
	Poll.findOne({_id: req.params.id }, function(err,user){
		if (user) {
			user.question = req.body.question;
			user.tipo = req.body.tipo;
			user.RealTime = req.body.RealTime;
			user.Activa = req.body.Activa;
			user.TimeToExpire = req.body.TimeToExpire;
			user.Max = req.body.Max;
			user.Min = req.body.Min;
			user.catSchema = req.body.catSchema;
			
			if(req.body.choices_tipo1){
				user.choices_tipo1 = req.body.choices_tipo1;
			}
			else if(req.body.choices_tipo2){
				user.choices_tipo2 = req.body.choices_tipo2;
			}
			else if(req.body.choices_tipo3){
				user.choices_tipo3 = req.body.choices_tipo3;
			}
			user.save(function(err, updatedModel) {
				if(!err) {
					res.send("asdasd");
				} else {
					alert('No se pudo activar');
				}
			});
		}
	});
});

app.get('/grabar/:id', function(req, res){
	console.log(req.params.id);
	Poll.findOne({_id: req.params.id }, function(err,user){
		if (user) {
			if(!user.Activa){
				console.log("holi");
				user.Activa = true;
				// Call API to save poll to the database
				user.save(function(err, updatedModel) {
					if(!err) {
						//res.
					} else {
						alert('No se pudo activar');
					}
				});
				if(user.RealTime){
					setTimeout(function () {
									user.Activa = false;
										// Call API to save poll to the database
									user.save(function(err, updatedModel) {
										if(!err) {
											// If there is no error, redirect to the main view
											//res.redirect('/polls/'+user._id);
										} else {
											alert('No se pudo desactivar');
										}
									});
									//console.log(perro2);
									console.log('timeout completed');
								}, user.TimeToExpire);
				}
			}
		}
	});
});

app.get('/lolcito/:id', function(req, res){
	console.log(req.params.id);
	Poll.findOne({_id: req.params.id }, function(err,user){
		if (user) {
			res.redirect('mos#/mostrarEn/'+user._id);
		}else{
			res.send("No existe la encuesta"); 
		}
	});
});

app.get('/pollsito3', function(req, res){
	Poll.findOne({_NumId: req.query.pollId}, function(err,user){
		if (user) {
			res.redirect('mos#/polled/'+user._id);
		}else{
			res.send("No existe la encuesta"); 
		}
	});
});

app.post('/polls', routes.create);

app.post('/cat',routes.createcat)

app.post('/vote', routes.vote);

app.get('/logout',routes.logout);

app.delete('/deleteobject/:id',routes.delete);

io.sockets.on('connection', routes.vote);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

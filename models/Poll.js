var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var db;

var shortid = require('shortid');
 
console.log(shortid.generate());

if (process.env.VCAP_SERVICES) {
   var env = JSON.parse(process.env.VCAP_SERVICES);
   db = mongoose.createConnection(env['mongodb-2.2'][0].credentials.url);
} else {
   db = mongoose.createConnection('localhost', 'pollsapp_test');
}

var autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(db);



var voteSchema = new mongoose.Schema({ 
	ip: String,
});

// Subdocument schema for poll choices
var choiceSchema3 = new mongoose.Schema({
	text: String,
	Cantidad: Number,
	votes: [voteSchema]
});

var choiceSchema2 = new mongoose.Schema({
	text: String,
	isCorrect: Boolean,
	votes: [voteSchema]
});

// Subdocument schema for poll choices
var choiceSchema = new mongoose.Schema({
	text: String,
	votes: [voteSchema]
});

var categoriaSchema = new mongoose.Schema({
	text: String,
	pollSchema: [PollSchema]
});

// Document schema for polls
var PollSchema = new mongoose.Schema({
	id_User: { type: String, required: true },
	_NumId: { type: String, 'default':shortid.generate, ref: "User" },
	tipo: { type: Number },
	RealTime: { type: Boolean },
	Activa: { type: Boolean },
	TimeToExpire: { type: Number },
	categoria: { type: String },
	question: { type: String, required: true },
	Min: Number,
	Max: Number,
	choices_tipo1: [choiceSchema],
	choices_tipo2: [choiceSchema2],
	choices_tipo3: [choiceSchema3]
});

//Auto-increment
//PollSchema.plugin(autoIncrement.plugin, { model: 'polls', field: '_NumId'});

var password_validation = {
			validator: function(p){
				this.password_confirmation == p;
			},
			message: "Las contraseñas no son iguales"
		}

var email_match = [/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/, "Coloca un email válido"];
var posibles_valores = ["M","F"];

var user_schema = Schema({
	name: String,
	last_name: String,
	username: {type:String,required:true, unique: true, maxlength:[50,"Nombre de usuario muy grande"]},
	password: {
		type:String,
		minlength:[6,"La contraseña es muy corta"],
		validate: password_validation
	},
	universidad: { type:String, required:"La universidad es un campo obligatorio" },
	email: {type:String,required:"El correo es obligatorio",match:email_match, unique: true},
});

user_schema.virtual("password_confirmation").get(function(){
	return this.p_c;
}).set(function(password){
	this.p_c = password;
});

var User = mongoose.model("User", user_schema);

module.exports.User = User;

var Poll = mongoose.model("polls", PollSchema);
module.exports.Poll = Poll;

// Subdocument schema for votes

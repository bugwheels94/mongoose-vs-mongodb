var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
Promise.all([
	mongoose.connect('mongodb://talknonymous.local:27017/mongoose-vs-mongodb'),
	MongoClient.connect('mongodb://talknonymous.local:27017')	
]).then((clients) => {
	var db = mongoose.connection;
	var Schema = mongoose.Schema;
	var recordSchema = new Schema({
		name: String,
		interest: String,
		job: String,
		subrecord: { type: Schema.Types.ObjectId, ref: 'subrecords' }
	});
	var subRecordSchema = new Schema({
		name: String,
		interest: String,
		job: String
	});
	var subrecordModel = mongoose.model('subrecords', subRecordSchema);
	var recordModel = mongoose.model('records', recordSchema);
	var nativeCollection = clients[1].db('mongoose-vs-mongodb').collection('records')
	suite
	.add('Mongoose', {
		defer: true,
		fn: function(def) {
			recordModel.find({_id: "5a9cf6860acccf5de0cf948a"}).exec().then(function (e) {
				def.resolve();
			});
		}
	})
	.add('MongoDB', {
		defer: true,
		fn: function(def) {
			nativeCollection.find({_id: "5a9cf6860acccf5de0cf948a"}).toArray((r) => {
				def.resolve();
				// console.log(r)
			})
		}
	})
	.on('cycle', function(event) {
  		console.log(String(event.target));
	})
	.on('complete', function() {
  		console.log('Fastest is ' + this.filter('fastest').map('name'));
	})
	.run({ 'async': true });


})

var Benchmark = require('benchmark');
var suite = new Benchmark.Suite;

var mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient;
var collectionMongoose = 'testrecord1';
var collectionMongodb = 'testrecord2';
Promise.all([
	mongoose.connect('mongodb://talknonymous.local:27017/mongoose-vs-mongodb'),
	MongoClient.connect('mongodb://talknonymous.local:27017')	
]).then((clients) => {
	var db = mongoose.connection;
	var Schema = mongoose.Schema;
	var recordSchema = new Schema({
		name: String,
		interest: String,
		job: String
	});
	var recordModel = mongoose.model(collectionMongoose, recordSchema);
	var nativeCollection = clients[1].db('mongoose-vs-mongodb').collection(collectionMongodb)
	var records = [];
	for (var i = 0; i < 100; i++) {
		records.push({
			name: 'bugwheels' + i,
			interest: 'Not Many',
			job: 'Useless'
		})
	}
	suite
	.add('Mongoose', {
		defer: true,
		fn: function(def) {
			recordModel.insertMany(records,() => {
				def.resolve()
			})
		}
	})
	.add('MongoDB', {
		defer: true,
		fn: function(def) {
			nativeCollection.insertMany(records, (e, r) => {
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
  		nativeCollection.drop()
  		db.dropCollection(collectionMongoose)
	})
	.run({ 'async': true });


})
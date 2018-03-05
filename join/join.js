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
	var s = [{
				$match: {
					'name': 'buwheelsx0'
				}
			},{
				$lookup: {
						         from: "subrecords",
						         localField: "subrecord",
						         foreignField: "_id",
						         as: "newsub"
			       }
			}]
	suite
	.add('MongoDB', {
		defer: true,
		fn: function(def) {
			nativeCollection.aggregate(s, {raw: true, cursor: {batchSize: 1}}, () => {
				def.resolve();
			})
		}
	})
	.add('Mongoose', {
		defer: true,
		fn: function(def) {
			process.nextTick(() => {
				recordModel.findOne({
					'name': 'buwheelsx0'
	//				_id: "5a9b1a4f118a592378305c36"
				}).populate('subrecord').exec().then(function (e) {
					def.resolve();
				});
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

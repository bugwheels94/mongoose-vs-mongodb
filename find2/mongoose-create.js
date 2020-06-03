const ops = Number(process.env.OPERATIONS)
var mongooseCollectionName='testrecord2'
var mongoose = require('mongoose')
var record = {
	name: 'bugwheels',
	interest: 'Not Many',
	job: 'Useless'
}
mongoose.connect('mongodb://mongo:27017/mongoose-vs-mongodb', { useNewUrlParser: true, useUnifiedTopology: true })
	.then((client) => {
	var db = mongoose.connection;
	var Schema = mongoose.Schema;
	var recordSchema = new Schema({
		name: String,
		interest: String,
		job: String
	});
	var recordModel = mongoose.model(mongooseCollectionName, recordSchema);
	const promise = []	
	for (let i = 0; i < ops; i++)
		promise.push(new recordModel(record).save())
	Promise.all(promise).then(() => {
		db.close()
		console.log("Mongoose Done");
	})


})

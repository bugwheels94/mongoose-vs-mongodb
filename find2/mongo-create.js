const ops = Number(process.env.OPERATIONS)
const MongoClient = require('mongodb').MongoClient;
const promise = [];
	MongoClient.connect('mongodb://mongo:27017', {useUnifiedTopology: true})
	.then((client) => {
		
		var nativeCollection = client.db('mongoose-vs-mongodb').collection('records')
		for (let i = 0; i < ops; i++)
			promise.push(nativeCollection.insertOne({
				name: 'bugwheels',
				interest: 'Not Many',
				job: 'Useless'
			}))
		Promise.all(promise).then(() => {
			client.close()
			console.log("Done");
		})
	})

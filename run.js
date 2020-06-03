const util = require('util');
const exec = require('child_process').exec;
const results = [];
const OPERATIONS = process.env.OPERATIONS || 10000;
var args = process.argv.slice(2)
const parsedArgs = args.reduce((acc, current) => {
	switch(current) {
		case 'dev': return { ...acc, dev: true}
		case 'nocleanup': return { ...acc, nocleanup: true}
		case 'verbose': return { ...acc, verbose: true}
	}
	return acc
}, {})
function myExec({ cmd, nolog = false, env } ) {
	const child = exec(cmd, { env: env || {}});
	var scriptOutput = "", scriptError = '';
	child.stdout.on('data', function (data) {
		scriptOutput += data.toString();
		parsedArgs.verbose && !nolog && console.log(data);
	});
	child.stderr.on('data', function (data) {
		scriptError += data.toString();
		parsedArgs.verbose && !nolog && console.log(data);
	});
	return new Promise(function (resolve, reject) {
		child.addListener("error", (error) => {
			reject(error)
		});
		child.addListener("exit", (code) => {
			if (code) reject(scriptError)
			resolve(scriptOutput);
		})
	});
}
async function ls(name) {
	try {
		await myExec({ cmd: `docker-compose -f docker-compose.yml ${parsedArgs.dev ? '-f docker-compose.dev.yml' : ''} up ${name}`, env: { OPERATIONS } });
		const id = await pollStatus(name);
		let stdout  = await myExec({ cmd: `docker inspect ${id}`, nolog: true });
		const info = JSON.parse(stdout)[0];
		results.push({
			started: info.State.StartedAt, finished: info.State.FinishedAt,
			name: info.Config.Labels.name, operations: OPERATIONS,
			time_taken: (new Date(info.State.FinishedAt)).getTime() - (new Date(info.State.StartedAt)).getTime()
		})
		console.log("Time Taken by ", info.Config.Labels.name, (new Date(new Date(info.State.FinishedAt)).getTime() - (new Date(info.State.StartedAt)).getTime()))
		return await myExec({ cmd: `docker-compose stop && docker-compose rm -f` });	
	} catch(e) {
		if (!(e.startsWith('No such service:') || parsedArgs.verbose)) console.log(e);
		return 'Done';
	}
}
async function run() {
	for(let i = 1; i < 10; i++) {
		let result = await ls(`task-${i}`);
		if (result === 'Done') break;
	}
	if (!parsedArgs.nocleanup) {
		console.log("Cleaning Up...")
		await myExec({cmd: `docker-compose down`});	// remove network
	}
	console.log(results.map(result => ({
		...result,
		operations_per_second: result.operations / (result.time_taken / 1000)
	})))
}
run()

async function pollStatus(name) {
	return new Promise((rs, rj) => {
		const interval = setInterval(async () => {
			const stdout = await myExec({ cmd: `docker ps -qaf name=${name} -f status=exited`, nolog: true});
			if (stdout) {
				clearInterval(interval);
				rs(stdout.trim())
			}
		}, 5000);	
	})
}
import Hapi from 'hapi';
import Handlebars from 'handlebars';
import Extend from 'handlebars-extend-block';
import Inert from 'inert';
import Routes from './routes/';

const server = new Hapi.Server();
require('dotenv').load();

server.connection({
    host: process.env.IP || '0.0.0.0',
    port: process.env.PORT || '3002'
});

server.register([
	require('hapi-postgres-connection'),
    require('vision'),
    { register: Inert }

], (err) => {
    if (err) {
        console.log("Failed to load module. ", err);
    }

    server.route(Routes);
});

server.views({
	engines: {
		html: {
			module:Extend(Handlebars),
			isCached: false,
		},
	},
	path: 'views',
	layoutPath: 'views/layout',
	layout: 'default'/*,
	partialsPath: 'views/partials'*/
});

server.start((err) => {
	if(err) {
		throw err;
	}
	console.log(`Server running at: ${server.info.uri}`);
});
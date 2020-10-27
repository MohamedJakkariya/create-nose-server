/** @format */

const mysql = require('mysql');

// db configurations
const db_config = {
	host: process.env.DB_HOSTNAME,
	user: process.env.DB_USERNAME,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_NAME,
};

//Connect to the Amazon RDS instance
var connection = mysql.createConnection(db_config);

// set connection to global as a global varibale
global.connection = connection;

function connect() {
	//- Establish a new connection
	connection.connect(function (err) {
		if (err) {
			// mysqlErrorHandling(connection, err);
			console.log(
				'\n\t *** Cannot establish a connection with the database. ***',
			);

			connection = reconnect(connection);
		} else {
			console.log('\n\t *** New connection established with the database. ***');
		}
	});
}

//- Reconnection function
function reconnect(connection) {
	console.log('\n Try to next connection ...');

	setTimeout(() => {
		//- Destroy the current connection variable
		if (connection) connection.destroy();

		//- Create a new one
		connection = mysql.createConnection(db_config);
		global.connection = connection;

		connection.connect(function (err) {
			if (err) {
				console.log(' Reason of ', {
					code: err.code,
					errno: err.errno,
					sqlMessage:
						err.sqlMessage,
					sqlState: err.sqlState,
					fatal: err.fatal,
				});

				//- Try to connect every 2 seconds.
				setTimeout(reconnect, 2000);
			} else {
				console.log(
					'\n\t *** New connection established with the database. ***',
				);
				return connection;
			}
		});
	}, 5000);
}

//- Error listener
connection.on('error', function (err) {
	//- The server close the connection.
	if (err.code === 'PROTOCOL_CONNECTION_LOST') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Connection in closing
	else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_QUIT') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Fatal error : connection variable must be recreated
	else if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Error because a connection is already being established
	else if (err.code === 'PROTOCOL_ENQUEUE_HANDSHAKE_TWICE') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}
	//- Error because a connection is already being established
	else if (err.code === 'ECONNERESET') {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}

	//- Anything else
	else {
		console.log(
			'/!\\ Cannot establish a connection with the database. /!\\ (' +
				err.code +
				')',
		);
		connection = reconnect(connection);
	}
});

// Handle uncaught errors from disconnecting db connection
process.on('uncaughtException', (err) => {
	console.log('Uncaught Exception ', err);
	reconnect(connection);
});

module.exports = {
	reconnect,
	connect,
};

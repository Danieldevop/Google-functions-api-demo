import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';
import { Routes } from './routes';

admin.initializeApp(functions.config().firebase);

export class Server {
	public app: any;
	public main: any;

	constructor() {
		this.app = express();
		this.main = express();
	}

	validateFirebaseIdToken(request:any, response:any, next:any) {
		const authenticationHeader = request.headers.authorization;
		const authenticationHeaderBaererExists = authenticationHeader ? 
		authenticationHeader.startsWith('Bearer ') : false

		if (!authenticationHeaderBaererExists) {
			response.status(403).send('Unauthorized');
			return;
		}

		const idToken = authenticationHeader.split('Bearer ')[1];

		admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
			return next()
		}).catch((error) => {
			response.status(403).send('Unauthorized');
		})

	}

	appConfig() {
		this.app.use(this.validateFirebaseIdToken); // Authentication Middleware
		this.main.use('/api/v1', this.app);
		this.main.use(bodyParser.json());
	}


	/* Including app Routes starts */
	includeRoutes() {
		new Routes(this.app).appRoutes();

	}

	/* Including app Routes ends*/
	appExecute() {
		this.appConfig();
		this.includeRoutes();
	}
}
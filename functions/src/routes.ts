import * as admin from 'firebase-admin';
// import * as functions from 'firebase-functions';

export class Routes {
	public app: any;
	public db:any;

	constructor(app:any) {
		this.app = app;
		this.db = admin.firestore();
	}

	appRoutes() {
		// Endpoint Routes
		this.app.get('/warmup', (request:any, response:any) => {
			response.send('Ready for the battle');
		});

		this.app.post('/fights', async (request:any, response:any) => {
			try {
				const { winner, loser, title } = request.body;
				const data = {
					winner,
					loser,
					title
				}

				const fightRef = await this.db.collection('fights').add(data);
				const fight = await fightRef.get();

				response.json({
					id: fightRef.id,
					data: fight.data()
				});

			} catch(error) {
				response.status(500).send(error);
			}

		});

		this.app.get('/fights/:id', async (request:any, response:any) => {
			try {
				const fightId = request.params.id;

        		if (!fightId) throw new Error('Fight ID is required');

        		const fight = await this.db.collection('fights').doc(fightId).get();

        		if (!fight.exists){
            		throw new Error("Fight doesn't exist.")
        		}

		        response.json({
		          id: fight.id,
		          data: fight.data()
		        });

			} catch(error) {
				response.status(500).send(error);
			}
		});

		this.app.get('/fights', async (request:any, response:any) => {
			try {

				const fightQuerySnapshot = await this.db.collection('fights').get();
				const fights:any = [];
				fightQuerySnapshot.forEach(
					(doc:any) => {
						fights.push({
							id: doc.id,
							data: doc.data()
						});
					}
				);

				response.json(fights);
			} catch(error) {
				response.status(500).send(error);
			}
		});

		// Update a fight by Id
	    this.app.put('/fights/:id', async (request:any, response:any) => {
	      try {

	        const fightId = request.params.id;
	        const title = request.body.title;

	        if (!fightId) throw new Error('id is blank');

	        if (!title) throw new Error('Title is required');

	        const data = { 
	            title
	        };
	        await this.db.collection('fights')
	            .doc(fightId)
	            .set(data, { merge: true });

	        response.json({
	            id: fightId,
	            data
	        })


	     } catch(error){

	        response.status(500).send(error);

	      }
	      
	    });

	    this.app.delete('/fights/:id', async (request:any, response:any) => {
	      try {

	        const fightId = request.params.id;

	        if (!fightId) throw new Error('id is blank');

	        await this.db.collection('fights')
	            .doc(fightId)
	            .delete();

	        response.json({
	            id: fightId,
	        })


	      } catch(error){

	        response.status(500).send(error);

	      }
      
    	});

	}

}
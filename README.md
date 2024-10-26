## Running the service locally

To run the service locally, you can use the dev docker compose file. to do this, you need NodeJS, NPM, Docker and Docker Compose to be installed on your machine, then get into the project's root and first run:

```
npm install
```

This will install the dependencies, which are needed to run the local dev containers and maps the folder to be able to develop and have the service restarted insde the container.

You need to have a `.env` file in the project root containing the following environment variables:

```
PORT=3000

PG_HOSTNAME=db
PG_USERNAME=pulseUser
PG_PASSWORD=pulsePassword
PG_DBNAME=pulse

MONGO_HOSTNAME=mongodb

HELIUS_API_KEY=YourHeliusApiKey
```

Get your Helius API key from the [Helius website](https://dashboard.helius.dev/), you need to create an account for this.

You can then run the following command to spin up 3 containers; one for MongoDB, another for the Postgres DB and a third one for the pulse service.

```
docker compose -f docker-compose.dev.yml up
```

You should be able to see the server starting in the pulse service logs:

```
api-1        |
api-1        | > pulse@1.0.0 dev
api-1        | > nodemon src/index.ts
api-1        |
api-1        | [nodemon] 3.1.7
api-1        | [nodemon] to restart at any time, enter `rs`
api-1        | [nodemon] watching path(s): *.*
api-1        | [nodemon] watching extensions: ts,json
api-1        | [nodemon] starting `ts-node src/index.ts`
api-1        | [server]: Server is running at http://localhost:3000
```

At this point, you can send a `POST` request to the service `http://localhost/addresses/sync` endpoint with a payload consisting of the list of Solana accounts or addresses that you want to run the ETL operations on, for example:

```
[
  "2fmz8SuNVyxEP6QwKQs6LNaT2ATszySPEJdhUDesxktc",
  "ADCDZvxXpB3zv88pg84QM4SbL6f45KkN61hgmxKJcP8H"
]
```

This should return a list of results for each address of the number of newly synced transactions, and total transactions of that address that we have in the Postgres DB, as follows:

```
[
  {
    "newlySynced": 0,
    "total": 41
  },
  {
    "newlySynced": 0,
    "total": 147
  }
]
```

## Infrastructure

The pulse service can be orchestrated and deployed as follows:

- Adding github actions that run any existing tests, build and publish the docker image to either GitHub packages, AWS ECR or another docker registry on every push to main, and possibly every PR push to allow developers to test their work.
- Create the following Terraform resources to automate the provisioning on the infrastructure on AWS:
    - AWS DocumentDB which is MongoDB compatible with automatic backups and possibly redundancy enabled. Or use ECS to have a MongoDB service.
    - AWS RDS for the PostgresDB service with automatic backups and possibly redundancy enabled. Or use ECS to have a PostgresQL service.
    - ECS Cluster for the pulse ETL service.
- Add a GitHub action that triggers the ECS Pulse service to pull the new docker image whenever there is a new one published, so after every push to main. This GitHub action can also check the AWS resources and make sure there aren't any issues, or reapply the Terraform changes if needed.
- For Terraform, we can use an AWS S3 bucket to store the state.


## Future developments.

- Analyse other types of transactions and add mapping for other types of transfers like NFT transfers.
- Do a more thorough analysis for the instructions and decode the raw data fields in them to extract the right method_id.
- Note that the way this is architected, a given transaction can be in the table more than one time, hash is not unique but the (address, hash) pair is unique. This was to make it simple to cache transactions and not fetch any txs that were cached already. This could be improved in the future.
- Improve error handling throughout the application, in part by surfacing any error in the API to the user.
- Add different kinds of tests to the pipeline, primarily unit tests and more importantly end-to-end and integration tests.

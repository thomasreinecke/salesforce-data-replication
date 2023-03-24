# salesforce-data-replication

This node app allows you to replicate data from a Salesforce org to PostgreSQL based on the credentials and object visibility of your user,
utilizing the [Salesforce REST APIs](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_query.htm).

Full documentation of this project can be found on Medium.

***

## Installation

- install postgres in a local docker container
```
docker pull postgres:13.7
docker run -itd -e POSTGRES_USER=postgres -e \
       POSTGRES_PASSWORD=<your_password> -p 5432:5432 \
       --name postgresql postgres:13.7
```

- clone the repository
- install dependencies with `yarn` or `npm install`
- create the `.env` using the following template

```
DB_HOST=localhost
DB_PORT=5432
DB_SALESFORCE_DATA=salesforce-data
DB_USERNAME=postgres
DB_PASSWORD=<your_postgres_password>
DB_SCHEMA=public
DB_DIALECT=postgres

URL=<url_to_salesforce, typically https://<your_stuff>.sandbox.my.salesforce.com>
BEARER_TOKEN=<your Bearer token from Salesforce Inspector>
```

- install postgres and create the schema mentioned below
- run with `yarn main`

***


## Database schema

Create the tables `Account` and `Contact` in the public schema of the Postgresql database server you are pointing to with your .env configuration

```
CREATE TABLE IF NOT EXISTS public."Account"
(
    "Id" character varying(18),
    "Name" character varying(255),
    "IsPartner" boolean,
    "AccountNumber" character varying(40),
    "CreatedDate" timestamp with time zone,
    "LastModifiedDate" timestamp with time zone
)
TABLESPACE pg_default;
ALTER TABLE IF EXISTS public."Account" OWNER to postgres;

```

### Contact
```
CREATE TABLE IF NOT EXISTS public."Contact"
(
    "Id" character varying(18),
    "AccountId" character varying(18),
    "Name" character varying(255),
    "Email" character varying(255),
    "CreatedDate" timestamp with time zone,
    "LastModifiedDate" timestamp with time zone
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."Account" OWNER to postgres;

```




# Example output
```

$ node main.js
🚀 PG:SALESFORCE-DATA connected to postgres @ localhost:5432 @ salesforce-data
🚀 STARTED: 12:19:06 PM
ℹ️ replicating table 'Account'
ℹ️ records to be processed : 117081
📁 in progress - total records 117081, written 2000
📁 in progress - total records 117081, written 4000
📁 in progress - total records 117081, written 6000
...
📁 in progress - total records 117081, written 117081
✅ done - total records 117081, written 117081
ℹ️ replicating table 'Contact'
ℹ️ records to be processed : 386906
📁 in progress - total records 386906, written 2000
📁 in progress - total records 386906, written 4000
📁 in progress - total records 386906, written 6000
...
📁 in progress - total records 386906, written 386906
✅ done - total records 386906, written 386906
🚀 ENDED: 12:19:06 PM (258 seconds)
done
```
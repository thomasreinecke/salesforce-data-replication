# salesforce-data-replication

This node app allows you to replicate data from a Salesforce org to PostgreSQL based on the credentials and object visibility of your user,
utilizing the [Salesforce REST APIs](https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_query.htm).

Full documentation of this project can be found on Medium.

***

## Installation

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
const fs = require("fs");
const { Pool } = require('pg')
require("dotenv").config();

const salesforceDataReplicator = require('./salesforce-data-replicator');

const PG_SALESFORCE_DATA_CONFIG = {
    dialect: process.env.DB_DIALECT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_SALESFORCE_DATA,
    min: 10,
    max: 50,
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 0,
    idle: 30000,
    acquire: 60000,
};

// main
async function main () {
    const pgSalesforceData = new Pool(PG_SALESFORCE_DATA_CONFIG);
    pgSalesforceData.on('error', (error) => {
    console.log(`❌ error on pg-salesforce-data connection`, error);
    });
    console.log(`🚀 PG:SALESFORCE-DATA connected to ${PG_SALESFORCE_DATA_CONFIG.dialect} @ ${PG_SALESFORCE_DATA_CONFIG.host}:${PG_SALESFORCE_DATA_CONFIG.port} @ ${PG_SALESFORCE_DATA_CONFIG.database}`);

    const startTime = new Date();
    console.log(`🚀 STARTED: ${startTime.toLocaleTimeString()}`)

    // replace Account table
    await salesforceDataReplicator.replicateTable( {
        table: "Account",
        fields: [
            "Id", 
            "Name", 
            "IsPartner", 
            "AccountNumber", 
        ],
        where: "isPartner = true",
        pgPool: pgSalesforceData
    });

    // replicate Contact table
    await salesforceDataReplicator.replicateTable( {
        table: "Contact",
        fields: [
            "Id", 
            "AccountId",
            "Name", 
            "Email",
        ],
        where: "Account.isPartner = true",
        pgPool: pgSalesforceData
    });

    const endTime = new Date();
    const diffInMilliseconds = Math.abs(endTime.getTime() - startTime.getTime());
    const diffInSeconds = Math.floor(diffInMilliseconds / 1000);

    console.log(`🚀 ENDED: ${startTime.toLocaleTimeString()} (${diffInSeconds} seconds)`)
    console.log('done')
}

main().catch((error) => {
    console.log(error)
}).
finally(process.exit);


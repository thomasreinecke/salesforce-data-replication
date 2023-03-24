/**
 * salesforce-data-mapper 
 * 
 * utility that allows to run a query against Salesforce to 
 * 
 * 
 * 
 **/

require('dotenv').config()
const sfdxFetch = require('./sfdx-object-fetch');

const url = process.env.URL;
const token = process.env.BEARER_TOKEN;
const MAX_BATCH_SIZE = 2000; 


function replaceCharInObject(obj, charToReplace, replacementChar) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      var value = obj[key];
      if (typeof value === 'string') {
        obj[key] = value.replaceAll(charToReplace, replacementChar);
      } else if (typeof value === 'object') {
        replaceCharInObject(value, charToReplace, replacementChar);
      }
    }
  }
}

module.exports.replicateTable = async function replicateTable ({ table, fields, where, pgPool }) {

  console.log(`ℹ️  replicating table '${table}'`);

  fields.push('CreatedDate')
  fields.push('LastModifiedDate')

  const allFields = fields.join(',');


  // construct the count query : with the count we know to what degree we have to split into multiple calls
  const countQuery = `SELECT COUNT(ID) FROM ${table} WHERE ${where}`
  const countResult = await sfdxFetch.sobject({ query: countQuery, url: url, token: token });
  const count = Number(countResult[0].expr0);
  console.log(`ℹ️  records to be processed : ${count}`);

  // first delete all records from the target pg table
  await pgPool.query(`DELETE from "${table}"`);

  // iterate through the batches, load the data off salesforce and ingest them to pg
  let recordsWritten = 0;

  let LAST_CREATED_DATE = null;
  let LAST_CREATED_ID = null;

  do {
    // const orderPart = (LAST_CREATED_DATE !== null) ? `AND CreatedDate > ${LAST_CREATED_DATE} ORDER BY CreatedDate` : ``;
    const orderPart = (LAST_CREATED_DATE !== null) ? `AND Id > '${LAST_CREATED_ID}'` : ``;
    const dataQuery = `SELECT ${allFields} FROM ${table} WHERE ${where} ${orderPart} ORDER BY Id LIMIT ${MAX_BATCH_SIZE}`
    // console.log(dataQuery)
    const dataResult = await sfdxFetch.sobject({ query: dataQuery, url: url, token: token });

    // console.log("count", dataResult);
    for(let a=0; a < dataResult.length; a++) {
        const record = dataResult[a];
        delete record.attributes

        replaceCharInObject(record, '\"', '');
        replaceCharInObject(record, '"', '');
        replaceCharInObject(record, "\'", "");
        replaceCharInObject(record, "'", "");

        let data = Object.values(record);
        let stringifiedData = JSON.stringify(data)
        // console.log(data)

        stringifiedData = stringifiedData.substring(1, stringifiedData.length - 1); 
        stringifiedData = stringifiedData.replaceAll('"', '\'');
        const pgFieldNames = `"${fields.join('","')}"`;
        // console.log('stringifiedData: ', stringifiedData)

        let insertQuery = null;
        try {
          insertQuery = `INSERT INTO "${table}" (${pgFieldNames}) VALUES (${ stringifiedData })`;
          // console.log(`${recordsWritten} : ${insertQuery}`)
          await pgPool.query(insertQuery);
          recordsWritten++;
        } catch(error) {
          console.error(error);
          console.error(record)
          console.error(stringifiedData)
          console.error(insertQuery)
          return;
        }
        LAST_CREATED_DATE = record.CreatedDate;
        LAST_CREATED_ID = record.Id;
    }

    console.log(`📁in progress - total records ${count}, written ${recordsWritten}`)

  } while(recordsWritten !== count)
  

  console.log(`✅ done - total records ${count}, written ${recordsWritten}`)


  //   // query for some Account records 
  //   const query = `
  //       SELECT ID, Name FROM Account where isPartner = true AND BP_Status__c = 'Active'
  //   `;

  // const query = `
  //   SELECT FIELDS(ALL) FROM Opportunity WHERE Name LIKE '%opportunity%' OR Account.Name LIKE 'opportunity' ORDER BY LastModifiedDate DESC LIMIT 100
  // `;

  // const response = await sfdxFetch.sobject({
  //   query: query,
  //   url: url,
  //   token: token
  // });

  // console.log("response", response);
}


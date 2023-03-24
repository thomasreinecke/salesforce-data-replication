const axios = require('axios');

module.exports.sobject = async function sobject ({ url, token, query, version = 'v56.0', cache = '0.1' }) {
  try {
    const response = await axios(`${url}/services/data/${version}/query/?q=${encodeURIComponent(query).trim()}&cache=${cache}`, {
      "headers": {
        "accept": "application/json; charset=UTF-8",
        "accept-language": "en-US,en;q=0.9,en-GB;q=0.8",
        "authorization": `Bearer ${token}`,
      },
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET"
    });

    return response.data.records;
  } catch (error) {
    console.log("Error", error)
    return null
  }
}

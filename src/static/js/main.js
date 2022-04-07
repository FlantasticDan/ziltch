async function postToServer(object, endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(object)
    });
    const responseBody = await response.json();
    return responseBody
}

async function getFromServer(endpoint) {
const response = await fetch(endpoint, {
    method: 'GET',
    cache: 'no-cache'
});
const responseBody = await response.json();
return responseBody
}
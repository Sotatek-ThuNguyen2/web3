export async function fetchData(client, query) {
    const response = await client.query(query).toPromise();
    console.log('response:', response)
    // setTokens(response.data.tokens);
  }
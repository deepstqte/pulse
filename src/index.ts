import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import axios, { AxiosResponse } from 'axios';
import { RawTransaction, OctavTransaction, AddressResult } from './types';
import { txExpression } from './etl';
import { protocolUUIDMap } from './mockData';
import { initPostgresDB, addTransactionsToPg } from './pgUtils';
import { connectToCollection, getAccountLastTx, cacheWalletAndLastTx } from './mongoUtils';

dotenv.config();

// Define the API endpoint
const apiRootUrl: string = 'https://api.helius.xyz';

initPostgresDB();

// Function to fetch data from the API
async function fetchDataForAddress(address: string): Promise<AddressResult> {
  try {

    const query = {
      'account': address
    };

    const limit: string = '100';
    let returnedResultsCnt = +limit;
    let beforeTxParam = ''
    const lastTx: string|boolean = await getAccountLastTx(address);
    const untilTxParam: string = lastTx ? 'until=' + lastTx : '';
    const txCollection = await connectToCollection('transactions');

    // Get the latest tx cached in MongoDB if it exists and get any newer transactions in batches of 100s
    // Any transactions fetched are cached in MongoDB
    let newlySynced = 0;
    while (returnedResultsCnt != 0) {
      const apiUrl: string = apiRootUrl + '/v0/addresses/' + address + '/transactions?' + untilTxParam + '&limit=' + limit + beforeTxParam + '&api-key='+process.env.HELIUS_API_KEY;
      const response: AxiosResponse<RawTransaction[]|any> = await axios.get<RawTransaction[]>(apiUrl, {
        headers: {
          'accept': 'application/json'
        }
      });
      response.data.forEach((transaction:RawTransaction) => {
        transaction.account = address;
        transaction.protocolUUID = protocolUUIDMap[transaction.source];
      });
      if (response.data.length != 0) {
        await txCollection.insertMany(response.data);
        beforeTxParam = '&before='+response.data[response.data.length - 1].signature;
      }
      returnedResultsCnt = response.data.length;
      newlySynced += response.data.length;
    }

    // Using the transformation mapping defined in the etl file
    // create a new transformedData list of Octav data transactions
    const options = {};
    const cursor = txCollection.find(query, options);
    let transformedData: any = []
    for await (const doc of cursor) {
      transformedData.push(await txExpression.evaluate(doc));
    }

    // Cache the address that was searched and its latest tx
    // This is used when fetching the data from the Helius API
    await cacheWalletAndLastTx(address)

    // Add the transformed data to the Postgres DB
    addTransactionsToPg(transformedData);
    return ({
      'newlySynced': newlySynced,
      'total': transformedData.length
    });
  } catch (error: any) {
    // Handle errors, if any
    console.error('Error fetching data:', error.message);
    return ({
      'newlySynced': 0,
      'total': 0
    });
  }
}

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.post("/addresses/sync", async (req: Request, res: Response) => {
  const addresses = req.body;
  let result: AddressResult[] = [];
  for (const i in addresses) {
    const addressData = await fetchDataForAddress(addresses[i]);
    result.push(addressData);
  }
  res.send(result);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

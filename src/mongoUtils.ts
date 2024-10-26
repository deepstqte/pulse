import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from "dotenv";

dotenv.config();

const mongoUri = 'mongodb://'+process.env.MONGO_HOSTNAME+':27017';

const dbName = 'pulse';

// Access the mongodb database
const client = new MongoClient(mongoUri);

export async function connectToCollection(collectionName: string): Promise<Collection> {
  client.connect();
  const db: Db = client.db(dbName);
  const collection: Collection = db.collection(collectionName);
  return (collection);
}

export async function getAccountLastTx(address: string): Promise<string|boolean> {
  try {
    const cachedAccountsCollection = await connectToCollection('cachedAccounts');
    const query = {
      'account': address
    };
    const cachedAccount = await cachedAccountsCollection.findOne(query);
    return(cachedAccount ? cachedAccount['lastTx'] : false);
  } catch (error: any) {
    // Handle errors, if any
    console.error('Error: ', error.message);
    return (false);
  }
}

export async function cacheWalletAndLastTx(address: string): Promise<boolean> {
  try {
    const cachedAccountsCollection = await connectToCollection('cachedAccounts');
    const txsCollection = await connectToCollection('transactions');
    const query = {
      'account': address
    };
    const newestTx = await txsCollection.findOne(query, { sort: { timestamp: -1 } }) || {'signature': ''};
    if ((await cachedAccountsCollection.countDocuments(query)) === 0) {
      await cachedAccountsCollection.insertOne({
        'account': address,
        'lastTx': newestTx.signature
      });
    } else {
      await cachedAccountsCollection.updateOne(query, {
        'lastTx': newestTx.signature
      })
    }
    return (true);
  } catch (error: any) {
    // Handle errors, if any
    console.error('Error: ', error.message);
    return (false);
  }
}

import 'dotenv/config';
import { DynamoDBClient, ListTablesCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function test() {
  try {
    const res = await client.send(new ListTablesCommand({}));
    console.log("Success! Tables:", res.TableNames);
  } catch (e) {
    console.error("Error:", e.name, e.message);
    const serverTime = e.$metadata && e.$metadata.httpHeaders && e.$metadata.httpHeaders.date;
    console.log("Server time:", serverTime);
    console.log("Local time:", new Date().toUTCString());
    console.log("Time difference:", Math.abs(new Date(serverTime).getTime() - new Date().getTime()) / 1000, "seconds");
  }
}
test();

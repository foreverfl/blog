import { MongoClient, ServerApiVersion } from "mongodb";

// 환경 변수에서 URI 가져오기
const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB() {
  try {
    await client.connect();
    await client.db("blog").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    return client.db("blog");
  } finally {
    // 이 예시에서는 연결을 즉시 닫지 않음
    // await client.close();
  }
}

export { connectDB };

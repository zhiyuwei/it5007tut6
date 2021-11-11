

const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

// Atlas URL  - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb+srv://UUU:PPP@cluster0-XXX.mongodb.net/issuetracker?retryWrites=true';

// mLab URL - replace UUU with user, PPP with password, XXX with hostname
// const url = 'mongodb://UUU:PPP@XXX.mlab.com:33533/issuetracker';


function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  client.connect(function(err, client) {
    if (err) {
      callback(err);
      return;
    }
    console.log('Connected to MongoDB');

    const db = client.db();
    db.collection('customers').drop()
    const collection = db.collection('customers');

    const customer = { id: 1, name: 'Tom', phone: 92346275, time:'2021-10-21'};
    collection.insertOne(customer, function(err, result) {
      if (err) {
        client.close();
        callback(err);
        return;
      }
      console.log('InsertId of insertOne:\n', result.insertedId);
      collection.find({ _id: result.insertedId})
        .toArray(function(err, docs) {
        if (err) {
          client.close();
          callback(err);
          return;
        }
        console.log('Result of find:\n', docs);
        client.close();
        callback(err);
      });
    });
  });
}

async function testWithAsync() {
  console.log('\n--- testWithAsync ---');
  const client = new MongoClient(url, { useNewUrlParser: true });
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db();
    // await db.collection('customers').drop()
    const collection = db.collection('customers');

    const customer2 = [{id: 2, name: 'Julia', phone: 91023845, time:'2021-10-23'},
    {id: 3, name: 'Jack', phone: 92847362, time:'2021-10-23'}]
    const result2 = await collection.insertMany(customer2);
    console.log('IDs of insertMany:\n', result2.insertedIds);
    const docs1 = await collection.find().toArray();
    console.log('Result of insertMany:\n', docs1);

    const update = await collection.updateOne({id:2},{$set:{phone:92847385}});
    const docs2 = await collection.find({id:2}).toArray();
    console.log('Result of updateOne:\n', docs2);

    const delete1 = await collection.deleteOne({id:3});
    const docs3 = await collection.find().toArray();
    console.log('Result of deleteOne:\n', docs3);

    
  } catch(err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallbacks(function(err) {
  if (err) {
    console.log(err);
  }
  testWithAsync();
});
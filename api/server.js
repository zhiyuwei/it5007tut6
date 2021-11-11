const fs = require('fs');
const express = require('express');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost/issuetracker';

let db;

let aboutMessage = "Issue Tracker API v1.0";


const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: 'A Date() type in GraphQL as a scalar',
  serialize(value) {
    return value.toISOString();
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return isNaN(dateValue) ? undefined : dateValue;
  },
  parseLiteral(ast) {
    if (ast.kind == Kind.STRING) {
      const value = new Date(ast.value);
      return isNaN(value) ? undefined : value;
    }
  },
});

const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage,
    issueAdd,
    issueRemove
  },
  GraphQLDate,
};

function setAboutMessage(_, { message }) {
  return aboutMessage = message;
}

async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

async function removeSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: -1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function issueValidate(issue) {
  const errors = [];
  if (issue.name.length == 0) {
    errors.push('Customer name cannot be empty');
  }
  if (issue.phone == '') {
    errors.push('Phone number cannot be empty');
  }
  if (isNaN(issue.phone) ) {
    errors.push('Please enter numbers');
  }
  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s)', { errors });
  }
}

async function issueAdd(_, { issue }) {
  issueValidate(issue);
  issue.created = new Date();
  
  issue.id = await getNextSequence('issues');
  
  const result = await db.collection('issues').insertOne(issue);
  const savedIssue = await db.collection('issues')
    .findOne({ _id: result.insertedId });
  return savedIssue;
}

async function issueRemove(_, { issue }) {
  issueValidate(issue);
  const deleteone=await db.collection('issues').findOne(issue);
  const index=deleteone.id
  await db.collection('issues').deleteOne(issue);
  await removeSequence('issues');
  await db.collection('issues').updateMany({id:{$gt:index}},{$inc:{id:-1}})
  
  
}

async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();
  console.log('Connected to MongoDB at', url);
  db = client.db();
}

const server = new ApolloServer({
  typeDefs: fs.readFileSync('schema.graphql', 'utf-8'),
  resolvers,
  formatError: error => {
    console.log(error);
    return error;
  },
});

const app = express();


server.applyMiddleware({ app, path: '/graphql' });

(async function () {
  try {
    await connectToDb();
    app.listen(5000, function () {
      console.log('API server started on port 5000');
    });
  } catch (err) {
    console.log('ERROR:', err);
  }
})();
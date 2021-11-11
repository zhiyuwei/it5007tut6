db.issues.remove({});

const count = db.issues.count();

db.counters.remove({ _id: 'issues' });
db.counters.insert({ _id: 'issues', current: count });
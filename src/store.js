import path from 'path';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync(path.resolve(__dirname, '../db.json'));
const db = low(adapter);

db.defaults({ links: [] })
  .write()

export default db;

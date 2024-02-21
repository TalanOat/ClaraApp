import * as SQLite from 'expo-sqlite';

interface JournalEntry {
  id?: number;
  title: string;
  body: string;
  createdAt?: Date;
}

const db = SQLite.openDatabase('journal.db');

export class DatabaseService {
  constructor() {
    //
  }

  public initDB() {
    //"tx" means transaction 
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          title TEXT,
          body TEXT,
          createdAt DATE)`
      );
    }, (error) => {
      console.error('database init error:', error);
    });
  }

  //TODO: add code to protect against SQL injection
  public getAllJournalEntries() {
    //"tx" means transaction 
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM journals', [], (trans, result) => {
        console.log(trans, result)
      });
    });
  }

  //TODO: add code to protect against SQL injection
  public createJournalEntry(title: string, body: string, createdAt: string) {
    console.log("title", title)
    console.log("body", body)
    console.log("createdAt", createdAt)
    //"tx" means transaction 
    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO journals (title, body, createdAt) VALUES (?, ?, ?)', 
        [title, body, createdAt],
        (txObject, resultSet) => {
          console.log('Insert successful, ID:', resultSet)
        },
        (txObject, error) => {
          console.error('Insertion error:', error);
          return true;
        }
      );
    });
  }


}

export const databaseService = new DatabaseService();
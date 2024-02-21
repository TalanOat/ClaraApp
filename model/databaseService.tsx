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

  public getAllJournalEntries(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM journals 
            ORDER BY createdAt DESC`,
          [],
          (txObject, result) => {
            resolve(result.rows._array);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public getJournalEntryByID(id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM journals WHERE id = ?`,
          [id],
          (txObject, result) => {
            //should always be one id per entry, but if case not
            //  met, then something has gone wrong in the code
            if (result.rows.length > 0) {
              resolve(result.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }
  //TODO: add code to protect against SQL injection
  // public createJournalEntry(title: string, body: string, createdAt: string) {
  //   //"tx" means transaction 
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       'INSERT INTO journals (title, body, createdAt) VALUES (?, ?, ?)',
  //       [title, body, createdAt],
  //       (txObject, resultSet) => {
  //         console.log('Insert successful, ID:', resultSet)
  //       },
  //       (txObject, error) => {
  //         console.error('Insertion error:', error);
  //         return true;
  //       }
  //     );
  //   });
  // }

  public createJournalEntry(title: string, body: string, createdAt: string): Promise<void> {
    return new Promise((resolve, reject) => { // Wrap in a promise
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO journals (title, body, createdAt) VALUES (?, ?, ?)',
          [title, body, createdAt],
          (txObject, resultSet) => {
            console.log('Insert successful, ID:', resultSet);
            resolve(); // Signal success
          },
          (txObject, error) => {
            console.error('Insertion error:', error);
            reject(error); // Signal failure
            return true;
          }
        );
      });
    });
  }

  //TODO: add code to protect against SQL injection
  public updateJournalEntry(id: number, title: string, body: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'UPDATE journals SET title = ?, body = ? WHERE id = ?',
          [title, body, id],
          (txObject, resultSet) => {
            console.log('Update successful', resultSet);
            resolve();
          },
          (txObject, error) => {
            console.error('Update error:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }

  //TODO: add code to protect against SQL injection
  public deleteJournalEntryByID(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM journals WHERE id = ?',
          [id],
          (txObject, resultSet) => {
            console.log('Delete successful', resultSet);
            resolve();
          },
          (txObject, error) => {
            console.error('Delete error:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }



}

export const databaseService = new DatabaseService();
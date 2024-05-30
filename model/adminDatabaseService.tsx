import * as SQLite from 'expo-sqlite/legacy';

interface JournalEntry {
  id?: number;
  title: string;
  body: string;
  createdAt?: Date;
}

const db = SQLite.openDatabase('journal.db');

export class AdminDatabaseService {
  constructor() {

  }

  // public initDB() {
  //   //"tx" means transaction 
  //   db.transaction((tx) => {
  //     tx.executeSql(
  //       `CREATE TABLE IF NOT EXISTS journals (
  //         id INTEGER PRIMARY KEY AUTOINCREMENT, 
  //         title TEXT,
  //         text TEXT,
  //         createdAt DATE)`
  //     );
  //   }, (error) => {
  //     console.error('database init error:', error);
  //   });
  // }

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

  //TODO: add code to protect against SQL injection
  public dropTable(tableName: string) {
    db.transaction((tx) => {
      tx.executeSql(
        `DROP TABLE IF EXISTS ${tableName};`,
        [],
        () => {
          console.log('Table dropped successfully')
        },
        (txObject, error) => {
          console.error('Error dropping table:', error);
          return true;
        }
      );
    });
  }

  //TODO: add code to protect against SQL injection
  public selectAllFromTable(tableName: string) {
    //"tx" means transaction 
    console.log(tableName)
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM ${tableName};`,
        [tableName], // Parameterized query
        (trans, result) => {
          console.log('Rows:', result.rows._array);
        },
        (trans, error) => {
          console.log(error);
          return true;
        }
      );
    });
  }

  public dropAllTables() {
    const tableNames = [
        'journals',
        'tracking_names',
        'emotions',
        'mood_journals',
        'mood_journal_emotions',
    ];

    return new Promise<void>((resolve, reject) => {
        db.transaction(tx => {
            tableNames.forEach(tableName => {
                tx.executeSql(
                    `DROP TABLE IF EXISTS ${tableName}`,
                    [],
                    () => {
                      console.log("succesfully dropped all tables")
                     },
                    (_, error) => {
                        console.error(`Error dropping table ${tableName}:`, error);
                        reject(error); 
                        return true; 
                    } 
                );
            });
            resolve(); // Signal success after all tables are processed
        });
    });
}


}

export const adminDatabaseService = new AdminDatabaseService();
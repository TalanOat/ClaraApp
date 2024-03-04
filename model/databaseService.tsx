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
    //ANCHOR journal table
    db.transaction((tx) => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          title TEXT,
          body TEXT,
          createdAt DATE)`
      );
      //ANCHOR mood Journal tables
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tracking_values (
           id INTEGER PRIMARY KEY AUTOINCREMENT,  
           value1 TEXT,
           value2 TEXT,
           value3 TEXT
         )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tracking_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          figure1 INTEGER, 
          figure2 INTEGER,
          figure3 INTEGER
        )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS tracking_value_to_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          valueID INTEGER, 
          dataID INTEGER,
          FOREIGN KEY (valueID) REFERENCES tracking_values(id),
          FOREIGN KEY (dataID) REFERENCES tracking_data(id) 
        )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS emotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_emotion INTEGER, 
          extended_emotion TEXT
        )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS mood_journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at DATE,
          tracking_data_id INTEGER, 
          FOREIGN KEY (tracking_data_id) REFERENCES tracking_data(id) 
        )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS mood_journal_emotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mood_journal_id INTEGER,
          emotion_id INTEGER, 
          FOREIGN KEY (mood_journal_id) REFERENCES mood_journals(id),
          FOREIGN KEY (emotion_id) REFERENCES emotions(id) 
        )`
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
  public createJournalEntry(title: string, body: string, createdAt: string): Promise<void> {
    return new Promise((resolve, reject) => { // Wrap in a promise
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO journals (title, body, createdAt) VALUES (?, ?, ?)',
          [title, body, createdAt],
          (txObject, resultSet) => {
            console.log('insert successful', resultSet);
            resolve(); // Signal success
          },
          (txObject, error) => {
            console.error('insert error:', error);
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
            console.log('update successful', resultSet);
            resolve();
          },
          (txObject, error) => {
            console.error('update error:', error);
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
            console.log('delete successful', resultSet);
            resolve();
          },
          (txObject, error) => {
            console.error('delete error:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public createThreeTrackingValues(value1: string, value2: string, value3: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO tracking_values (value1, value2, value3) VALUES (?, ?, ?)',
          [value1, value2, value3],
          (txObject, resultSet) => {
            console.log('insert successful', resultSet);
            resolve();
          },
          (txObject, error) => {
            console.error('insert error:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }

  // public createTrackingDataAndLink(value1: number, value2: number, value3: number, trackingValueID: number): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     db.transaction((tx) => {
  //       //(1) insert into (tracking_data)
  //       tx.executeSql(
  //         'INSERT INTO tracking_data (figure1, figure2, figure3) VALUES (?, ?, ?)',
  //         [value1, value2, value3],
  //         //(2) if successful then update the joining table
  //         (txObject, resultSet) => {
  //           const dataId = resultSet.insertId;
  //           //(3) insert link into (tracking_value_to_data) using trackingValueID
  //           if (dataId) {
  //             tx.executeSql(
  //               'INSERT INTO tracking_value_to_data (valueID, dataID) VALUES (?, ?)',
  //               [trackingValueID, dataId],
  //               () => {
  //                 console.log('Linking insert successful');
  //                 resolve(null);
  //               },
  //             );
  //           }
  //           else {
  //             console.error('first insert failed to return a ID to complete the remaining insert:');
  //             return true;
  //           }
  //         },
  //         (txObject, error) => {
  //           console.error('insert error:', error);
  //           reject(error);
  //           return true;
  //         }
  //       );
  //     });
  //   });
  // }

  public createTrackingDataAndLink(value1: number, value2: number, value3: number, trackingValueID: number): Promise<number> { // Updated to return a number (trackingDataID)
    return new Promise<number>((resolve, reject) => {
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO tracking_data (figure1, figure2, figure3) VALUES (?, ?, ?)',
                [value1, value2, value3],
                (txObject, resultSet) => {
                    const dataId = resultSet.insertId;
                    
                    if (dataId) {
                        tx.executeSql(
                            'INSERT INTO tracking_value_to_data (valueID, dataID) VALUES (?, ?)',
                            [trackingValueID, dataId], 
                            (txObject, result) => {
                              //console.log("dataId: ", dataId)
                                resolve(dataId); 
                            }, 
                        );
                    } else {
                        console.error('first insert failed to return a ID to complete the remaining insert:');
                        reject(new Error("Failed to get trackingDataID"));
                    }
                },
                (txObject, error) => {
                    console.error('insert error:', error);
                    reject(error);
                    return true; 
                }
            );
        });
    });
}

  public getAllTrackingValues(): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM tracking_values
           ORDER BY id DESC LIMIT 1`,
          [],
          (txObject, result) => {
            if (result.rows.length > 0) {
              const lastRow = result.rows.item(0);
              //const lastRowArray = Object.values(lastRow); 
              resolve(lastRow);
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

  public getAllTrackingAndData(valueID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT td.id, td.figure1, td.figure2, td.figure3  
           FROM tracking_data td 
           JOIN tracking_value_to_data tvtd ON td.id = tvtd.dataID
           WHERE tvtd.valueID = ?`,
          [valueID],
          (txObject, result) => {
            const dataArray = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              dataArray.push({
                id: row.id,
                figure1: row.figure1,
                figure2: row.figure2,
                figure3: row.figure3
              });
            }
            resolve(dataArray);

          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  //ANCHOR - New mood Journal Changes

  public createMoodJournal(createdAt: string, trackingDataId: number): Promise<number> { // Updated return type
    return new Promise<number>((resolve, reject) => { // Specify Promise type
        db.transaction((tx) => {
            tx.executeSql(
                'INSERT INTO mood_journals (created_at, tracking_data_id) VALUES (?, ?)',
                [createdAt, trackingDataId],
                (txObject, resultSet) => {
                    if (resultSet.insertId) { // Check for insertId existence
                        resolve(resultSet.insertId);
                    } else {
                        reject(new Error("Failed to get moodJournalId after insertion"));
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

  public addEmotion(baseEmotion: number, extendedEmotion?: string): Promise<number> {
    return new Promise<number>((resolve, reject) => { // Specify Promise type
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO emotions (base_emotion, extended_emotion) VALUES (?, ?)',
          [baseEmotion, extendedEmotion ?? null], 
          (txObject, resultSet) => {
            if (resultSet.insertId) { 
              resolve(resultSet.insertId);
            } else {
              //TODO - edit this
              reject(new Error("no insert ID"));
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

  public addMoodJournalEmotion(moodJournalId: number, emotionId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO mood_journal_emotions (mood_journal_id, emotion_id) VALUES (?, ?)',
          [moodJournalId, emotionId],
          () => {
            console.log("MoodJournalEmotion created successfully")
            resolve();
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }


}

export const databaseService = new DatabaseService();
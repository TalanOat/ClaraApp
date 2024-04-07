import * as SQLite from 'expo-sqlite';

interface JournalEntry {
  id?: number;
  title: string;
  body: string;
  createdAt?: Date;
}

interface TrackingName {
  id: number;
  name: string;
}

interface MoodJournal {
  createdAt: string;
  trackingNameId1: number;
  figure1: number;
  trackingNameId2: number;
  figure2: number;
  trackingNameId3: number;
  figure3: number;
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
        `CREATE TABLE IF NOT EXISTS tracking_names (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
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
          tracking_name1_id INTEGER,
          tracking_value1 INTEGER, 
          tracking_name2_id INTEGER,
          tracking_value2 INTEGER,
          tracking_name3_id INTEGER,
          tracking_value3 INTEGER,
          FOREIGN KEY (tracking_name1_id) REFERENCES tracking_names(id),
          FOREIGN KEY (tracking_name2_id) REFERENCES tracking_names(id),
          FOREIGN KEY (tracking_name3_id) REFERENCES tracking_names(id)
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
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS usage_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt TEXT,
          type TEXT,
          start TEXT, 
          end TEXT
        )`
      );
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          createdAt TEXT,
          step INTEGER, 
          steps INTEGER, 
          daily TEXT
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

  public getAllJournalsForDate(date: string): Promise<any[]> {
    //date format => "YYYY-MM-DD"
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM journals 
           WHERE DATE(createdAt) = ?
           ORDER BY createdAt DESC`,
          [date],
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

  public createJournalEntry(title: string, body: string, createdAt: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO journals (title, body, createdAt) VALUES (?, ?, ?)',
          [title, body, createdAt],
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

  public getLastJournalEntry(): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM journals ORDER BY id DESC LIMIT 1;`,
          [],
          (txObject, result) => {
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

  //! TODO add checks to make suer that there is at least three values in the table
  public createThreeTrackingNames(value1: string, value2: string, value3: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO tracking_names (name) VALUES (?),(?),(?)',
          [value1, value2, value3],
          (txObject, resultSet) => {
            console.log('tracking names added');
            resolve(true);
          },
          (txObject, error) => {
            console.error('tracking name adding error:', error);
            reject(error);
            resolve(false);
            return true;
          }
        );
      });
    });
  }

  public getLastThreeTrackingNames(): Promise<TrackingName[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT id, name FROM tracking_names ORDER BY id DESC LIMIT 3',
          [],
          (_, resultSet) => {
            const trackingNames: TrackingName[] = [];
            for (let i = 0; i < resultSet.rows.length; i++) {
              trackingNames.push({
                id: resultSet.rows.item(i).id,
                name: resultSet.rows.item(i).name
              });
            }
            resolve(trackingNames);
          },
          (_, error) => {
            console.error('Error fetching tracking names:', error);
            reject(error);
            return true;
          }
        );
      });
    });
  }

  //ANCHOR - New mood Journal Changes

  public createMoodJournal(moodJournalData: MoodJournal): Promise<number> {
    return new Promise<number>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO mood_journals 
            (created_at, tracking_name1_id, tracking_value1, 
             tracking_name2_id, tracking_value2, tracking_name3_id, tracking_value3) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            moodJournalData.createdAt,
            moodJournalData.trackingNameId1,
            moodJournalData.figure1,
            moodJournalData.trackingNameId2,
            moodJournalData.figure2,
            moodJournalData.trackingNameId3,
            moodJournalData.figure3
          ],
          (txObject, resultSet) => {
            resolve(resultSet.insertId || -1);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public updateMoodJournalFigures(id: number, figure1: number, figure2: number, figure3: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE mood_journals 
           SET tracking_value1 = ?, tracking_value2 = ?, tracking_value3 = ?
           WHERE id = ?`,
          [figure1, figure2, figure3, id],
          (txObject, resultSet) => {
            resolve(true);
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
    return new Promise<number>((resolve, reject) => {
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
            //console.log("MoodJournalEmotion created successfully")
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

  public getAllMoodJournals(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT mj.*,
          tn1.name AS tracking_name1, 
          tn2.name AS tracking_name2, 
          tn3.name AS tracking_name3
            FROM mood_journals mj
            LEFT JOIN tracking_names tn1 ON mj.tracking_name1_id = tn1.id
            LEFT JOIN tracking_names tn2 ON mj.tracking_name2_id = tn2.id
            LEFT JOIN tracking_names tn3 ON mj.tracking_name3_id = tn3.id 
            ORDER BY mj.created_at DESC`,
          [],
          (txObject, resultSet) => {
            resolve(resultSet.rows._array);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public getMoodJournalByID(moodJournalID: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT mj.*,
                  tn1.name AS tracking_name1, 
                  tn2.name AS tracking_name2, 
                  tn3.name AS tracking_name3
            FROM mood_journals mj
            LEFT JOIN tracking_names tn1 ON mj.tracking_name1_id = tn1.id
            LEFT JOIN tracking_names tn2 ON mj.tracking_name2_id = tn2.id
            LEFT JOIN tracking_names tn3 ON mj.tracking_name3_id = tn3.id 
            WHERE mj.id = ?`,
          [moodJournalID],
          (txObject, resultSet) => {
            if (resultSet.rows.length > 0) {
              resolve(resultSet.rows.item(0));
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

  public getLatestMoodJournal(): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT mj.*,
                  tn1.name AS tracking_name1, 
                  tn2.name AS tracking_name2, 
                  tn3.name AS tracking_name3
            FROM mood_journals mj
            LEFT JOIN tracking_names tn1 ON mj.tracking_name1_id = tn1.id
            LEFT JOIN tracking_names tn2 ON mj.tracking_name2_id = tn2.id
            LEFT JOIN tracking_names tn3 ON mj.tracking_name3_id = tn3.id 
            ORDER BY mj.created_at DESC 
            LIMIT 1`,
          [],
          (txObject, resultSet) => {
            if (resultSet.rows.length > 0) {
              resolve(resultSet.rows.item(0));
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

  public getAllMoodJournalsForDate(date: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT mj.*, 
              tn1.name AS tracking_name1, 
              tn2.name AS tracking_name2, 
              tn3.name AS tracking_name3
           FROM mood_journals mj
           LEFT JOIN tracking_names tn1 ON mj.tracking_name1_id = tn1.id
           LEFT JOIN tracking_names tn2 ON mj.tracking_name2_id = tn2.id
           LEFT JOIN tracking_names tn3 ON mj.tracking_name3_id = tn3.id 
           WHERE DATE(mj.created_at) = ?
           ORDER BY mj.created_at DESC`,
          [date],
          (txObject, resultSet) => {
            resolve(resultSet.rows._array);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public getAllMoodJournalsForDaysFromDate(date: string, days: number): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - days);

      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM (
                   SELECT mj.*, 
                          tn1.name AS tracking_name1, 
                          tn2.name AS tracking_name2, 
                          tn3.name AS tracking_name3,
                          RANK() OVER (PARTITION BY DATE(mj.created_at) ORDER BY mj.created_at DESC) AS rank
                   FROM mood_journals mj
                   LEFT JOIN tracking_names tn1 ON mj.tracking_name1_id = tn1.id
                   LEFT JOIN tracking_names tn2 ON mj.tracking_name2_id = tn2.id
                   LEFT JOIN tracking_names tn3 ON mj.tracking_name3_id = tn3.id 
                   WHERE DATE(mj.created_at) >= ? AND DATE(mj.created_at) <= ?
                ) WHERE rank = 1`,
          [startDate.toISOString().slice(0, 10), date],
          (txObject, resultSet) => {
            resolve(resultSet.rows._array);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }


  public deleteMoodJournalEntryByID(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'DELETE FROM mood_journals WHERE id = ?',
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

  public getEmotionsForMoodJournal(moodJournalId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT 
           e.base_emotion, e.extended_emotion 
           FROM mood_journal_emotions mje
           JOIN emotions e ON e.id = mje.emotion_id 
           WHERE mje.mood_journal_id = ?`,
          [moodJournalId],
          (txObject, result) => {
            const emotionsArray = [];
            for (let i = 0; i < result.rows.length; i++) {
              emotionsArray.push({
                baseKey: result.rows.item(i).base_emotion,
                extendedKey: result.rows.item(i).extended_emotion
              });
            }
            resolve(emotionsArray);
          },
          (txObject, error) => {
            reject(error);
            return true;
          }
        );
      });
    });
  }

  public createUsageLog(createdAt: string, type: string, start: string, end: string): Promise<void> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO usage_logs (createdAt, type, start, end) VALUES (?, ?, ?, ?)',
          [createdAt, type, start, end],
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

  public getAllUsageLogs(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM usage_logs 
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

  public createGoal(name: string, createdAt: string, step: number, steps: number, daily: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO goals (name, createdAt, step, steps, daily) VALUES (?, ?, ?, ?, ?)',
          [name, createdAt, step, steps, daily],
          (txObject, resultSet) => {
            console.log('insert successful', resultSet);
            resolve(true);
          },
          (txObject, error) => {
            console.error('insert error:', error);
            reject(error);
            resolve(false)
            return true;
          }
        );
      });
    });
  }

  public addOneToGoal(id: number): Promise<number> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE goals 
           SET step = step + 1 
           WHERE id = ?
           RETURNING step`,
          [id],
          (txObject, resultSet) => {
            if (resultSet.rows.length > 0) {
              const newStep = resultSet.rows.item(0).step;
              resolve(newStep);
            } else {
              reject(new Error("Goal not found or update failed"));
            }
          },
          (txObject, error) => {
            console.error('update error:', error);
            reject(error);
            return (false);
          }
        );
      });
    });
  }

  public subtractOneFromGoal(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE goals 
           SET step = CASE WHEN step > 0 THEN step - 1 ELSE 0 END 
           WHERE id = ?`,
          [id],
          (txObject, resultSet) => {
            //console.log('update successful', resultSet);
            resolve(true);
          },
          (txObject, error) => {
            console.error('update error:', error);
            reject(error);
            return (false);
          }
        );
      });
    });
  }

  public getAllGoals(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM goals 
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


}

export const databaseService = new DatabaseService();
import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
    const db = await SQLite.openDatabaseAsync('journal.db');
    try {
        await db.execAsync(
        `CREATE TABLE IF NOT EXISTS journals (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          title TEXT,
          body TEXT,
          createdAt DATE)
      
        CREATE TABLE IF NOT EXISTS tracking_names (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT
         )
  
        CREATE TABLE IF NOT EXISTS emotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_emotion INTEGER, 
          extended_emotion TEXT
        )
  
        CREATE TABLE IF NOT EXISTS mood_journals (
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
        )
  
        CREATE TABLE IF NOT EXISTS mood_journal_emotions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mood_journal_id INTEGER,
          emotion_id INTEGER, 
          FOREIGN KEY (mood_journal_id) REFERENCES mood_journals(id),
          FOREIGN KEY (emotion_id) REFERENCES emotions(id) 
        )
  
        CREATE TABLE IF NOT EXISTS usage_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          createdAt TEXT,
          type TEXT,
          start TEXT, 
          end TEXT
        )
  
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          createdAt TEXT,
          step INTEGER, 
          steps INTEGER, 
          daily TEXT
        )`
        );
    }
    catch (error) {
        console.log(error)
    }   
};
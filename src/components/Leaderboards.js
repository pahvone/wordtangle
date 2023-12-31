import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, get, ref, update } from "firebase/database";

export class LeaderboardEntry {
  id = "";
  xpGain = 0;
  lvl = 0;

  constructor(id, gain, lvl) {
    this.id = id;
    this.xpGain = gain;
    this.lvl = lvl;
  }
}

export default class Leaderboards {
  // Generates new leaderboard every monday.
  // Use cloud functions instead
  /*
  async getGMT() {
    try {
      const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/GMT');
      const data = await response.json();
      return new Date(data.utc_datetime);
    } catch (error) {
      console.error('Error fetching current time:', error);
      return null;
    }
  }

  async checkGendate() {
    const lb = await this.getLeaderboard();
    const gmtDate = await this.getGMT();
    
    if(lb && gmtDate){
      const genDate = {
        day: gmtDate.getDay(),
        date: gmtDate.getDate()
      }
      if(lb.genDate === null || lb.genDate === "" || (gmtDate.day === 1 && gmtDate.date !== lb.genDate.date)) {
        return genDate
      }
      else return lb.genDate
    }
  }
  */

  fixStruct(entries) {
    const db = getDatabase();
    const auth = getAuth();

    let newArr = [];

    //DON'T DO IT LIKE THIS
    for (var i = 0; i < 100; i++) {
      if (entries[i] !== undefined) newArr.push(entries[i]);
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(entries);
        update(ref(db, "/leaderboards/"), { entries: newArr });
      }
    });
  }

  async updateEntry(userId, xpgained, lvl) {
    const lb = await this.getLeaderboard();
    const entries = lb.entries || [];
    const existingEntry = entries.find((entry) => entry.id === userId);

    let xp = existingEntry ? existingEntry.xpGain + xpgained : xpgained;
    const updatedEntries = entries.map((entry) =>
      entry.id === userId ? { ...entry, xpGain: xp, lvl: lvl } : entry,
    );

    if (!existingEntry) {
      updatedEntries.push(new LeaderboardEntry(userId, xp, lvl));
    }

    this.updateLeaderboards(updatedEntries);
  }

  async deleteEntry(userId) {
    let data = await this.getLeaderboard();

    for (var i = 0; i < data.entries.length; i++) {
      if (data.entries[i].id === userId) {
        data.entries.splice(i, 1);
        break;
      }
    }
    this.updateLeaderboards(data.entries);
  }

  async updateLeaderboards(entries) {
    const db = getDatabase();
    const auth = getAuth();

    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          update(ref(db, "/leaderboards/"), { entries });
          resolve(entries);
        }
      });
    });
  }

  async getLeaderboard() {
    const db = getDatabase();
    const auth = getAuth();

    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          get(ref(db, "/leaderboards/")).then((snapshot) => {
            resolve(snapshot.val());
          });
        }
      });
    });
  }

  getUserName(uid) {
    const db = getDatabase();
    const auth = getAuth();
    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          get(ref(db, "/users/" + uid)).then((snapshot) => {
            if (snapshot.val().username) resolve(snapshot.val().username);
          });
        }
      });
    });
  }
}

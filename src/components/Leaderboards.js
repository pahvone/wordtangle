import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, get, ref, update } from "firebase/database";
import ActivityTracker from "./ActivityTracker";

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
  async newLeaderBoards() {
    const currentDate = new Date();

    this.updateLeaderboards();
  }

  newEntry(_entries, userId, xp, lvl) {
    let entries = _entries;
    let entry = new LeaderboardEntry(userId, xp, lvl);
    entries.push(entry);
    return entries;
  }

  async updateEntry(userId, xpgained, lvl) {
    await this.getLeaderboard().then((lb) => {
      let entries = [];
      let entry = null;
      console.log(lb.entries);
      let xp = 0;
      if (!lb.entries) {
        xp = xpgained;
        entries = this.newEntry([], userId, xp, lvl);
      } else {
        for (var i = 0; i < lb.entries.length; i++) {
          if (lb.entries[i].id === userId) {
            entry = lb.entries[i];
            break;
          }
        }
        if (entry) xp = entry.xpGain + xpgained;
        else xp = xpgained;
      }
      entries = this.newEntry(entries, userId, xp, lvl);

      console.log(entries);
      this.updateLeaderboards(entries);
    });
  }

  async updateLeaderboards(entries) {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    //let test2 = new LeaderboardEntry("testiID", 50, 3);
    //let test3 = new LeaderboardEntry("toinentestiID", 400, 6);

    //const entries = [test1, test2, test3];

    return new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          update(ref(db, "/leaderboards/"), {
            entries: entries,
          });
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

  getUserName() {
    const db = getDatabase();
    const auth = getAuth();
    const userId = auth.currentUser.uid;

    console.log(userId);

        return new Promise((resolve) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    get(ref(db, "/users/" + user.uid)).then((snapshot) => {
                        if(snapshot.val().username) resolve(snapshot.val().username);
                    })
                }
            })
        });
    }


}

/* ═════════════════════════════════════════════════════════════════════════
   DAILY CONFIGURATION — EDIT THIS FILE EACH DAY
   ═════════════════════════════════════════════════════════════════════════ */

window.DAILY_CONFIG = {

    date: "2026-06-20",
    lockTime: "24:00",
    timezone: "America/New_York",

    event: {
        title: "LAL vs BOS",
        subtitle: "Los Angeles at Boston",
        sport: "basketball",
        time: "7:30 PM ET",
        venue: "TD Garden, Boston"
    },

    teams: {
        LAL: { color: "#552583", name: "Los Angeles Lakers" },
        BOS: { color: "#007A33", name: "Boston Celtics" },
        GAME: { color: "#c9a227", name: "Game Prop" }
    },

    props: [
        { id:1,  team:"LAL",  player:"LeBron James",        line:"Will score 25+ points",             points:2 },
        { id:2,  team:"BOS",  player:"Jayson Tatum",        line:"Will score 25+ points",             points:2 },
        { id:3,  team:"GAME", player:"LAL vs BOS",          line:"Will go to overtime",               points:5 },
        { id:4,  team:"LAL",  player:"LeBron James",        line:"Will score 30+ points",             points:4 },
        { id:5,  team:"BOS",  player:"Jayson Tatum",        line:"Will score 30+ points",             points:3 },
        { id:6,  team:"GAME", player:"LAL vs BOS",          line:"Total score over 220.5",            points:2 },
        { id:7,  team:"LAL",  player:"LeBron James",        line:"Will record 8+ assists",            points:2 },
        { id:8,  team:"BOS",  player:"Jayson Tatum",        line:"Will record 10+ rebounds",          points:3 },
        { id:9,  team:"GAME", player:"LAL vs BOS",          line:"Total score under 210.5",           points:3 },
        { id:10, team:"LAL",  player:"LeBron James",        line:"Will record a double-double",       points:2 },
        { id:11, team:"BOS",  player:"Jayson Tatum",        line:"Will record 5+ assists",            points:2 },
        { id:12, team:"GAME", player:"LAL vs BOS",          line:"Game decided by 5 points or less",  points:3 },
        { id:13, team:"LAL",  player:"Anthony Davis",       line:"Will score 25+ points",             points:2 },
        { id:14, team:"BOS",  player:"Jaylen Brown",        line:"Will score 25+ points",             points:2 },
        { id:15, team:"GAME", player:"LAL",                 line:"Will win by 10+ points",            points:4 },
        { id:16, team:"LAL",  player:"Anthony Davis",       line:"Will record 10+ rebounds",          points:2 },
        { id:17, team:"BOS",  player:"Jaylen Brown",        line:"Will record 5+ assists",            points:2 },
        { id:18, team:"GAME", player:"BOS",                 line:"Will win by 10+ points",            points:3 },
        { id:19, team:"LAL",  player:"Anthony Davis",       line:"Will block 3+ shots",               points:3 },
        { id:20, team:"BOS",  player:"Jaylen Brown",        line:"Will hit 3+ three-pointers",        points:3 },
        { id:21, team:"GAME", player:"1st Quarter",         line:"Total points over 55.5",            points:2 },
        { id:22, team:"LAL",  player:"Anthony Davis",       line:"Will record a double-double",       points:2 },
        { id:23, team:"BOS",  player:"Kristaps Porzingis",  line:"Will score 20+ points",             points:2 },
        { id:24, team:"GAME", player:"LAL vs BOS",          line:"Both teams score 100+",             points:1 },
        { id:25, team:"LAL",  player:"D'Angelo Russell",    line:"Will hit 4+ three-pointers",        points:3 },
        { id:26, team:"BOS",  player:"Kristaps Porzingis",  line:"Will block 2+ shots",               points:2 },
        { id:27, team:"GAME", player:"LAL vs BOS",          line:"Any player records triple-double",  points:4 },
        { id:28, team:"LAL",  player:"D'Angelo Russell",    line:"Will score 20+ points",             points:2 },
        { id:29, team:"BOS",  player:"Derrick White",       line:"Will hit 3+ three-pointers",        points:3 },
        { id:30, team:"GAME", player:"LAL vs BOS",          line:"Lead changes 10+ times",            points:4 },
        { id:31, team:"LAL",  player:"Austin Reaves",       line:"Will score 15+ points",             points:1 },
        { id:32, team:"BOS",  player:"Jrue Holiday",        line:"Will record 3+ steals",             points:4 },
        { id:33, team:"LAL",  player:"Austin Reaves",       line:"Will record 5+ assists",            points:3 },
        { id:34, team:"BOS",  player:"Al Horford",          line:"Will record 8+ rebounds",           points:3 },
        { id:35, team:"LAL",  player:"Rui Hachimura",       line:"Will score 10+ points",             points:1 },
        { id:36, team:"BOS",  player:"Jayson Tatum",        line:"Will record a double-double",       points:3 },
        { id:37, team:"LAL",  player:"LeBron James",        line:"Will make 10+ field goals",         points:3 },
        { id:38, team:"BOS",  player:"Celtics Bench",       line:"Will combine for 25+ points",       points:2 },
        { id:39, team:"LAL",  player:"LAL Backcourt",       line:"Will combine for 40+ points",       points:3 },
        { id:40, team:"BOS",  player:"Derrick White",       line:"Will score 15+ points",             points:1 }
    ]
};

// Today's early results (fictional) - update as games finish
window.RESULTS = { 
    1: "hit", 
    2: "miss", 
    13: "hit", 
    14: "hit", 
    15: "miss", 
    24: "hit" 
};

// Yesterday's final results (fictional) - so the past picks page shows green/red!
window.PAST_RESULTS = {
    "2026-06-19": {
        1: "hit", 2: "miss", 3: "miss", 4: "miss", 5: "hit",
        6: "hit", 7: "hit", 8: "miss", 9: "miss", 10: "hit",
        11: "miss", 12: "hit", 13: "hit", 14: "hit", 15: "miss",
        16: "hit", 17: "miss", 18: "miss", 19: "hit", 20: "hit",
        21: "hit", 22: "hit", 23: "miss", 24: "hit", 25: "miss",
        26: "miss", 27: "miss", 28: "hit", 29: "hit", 30: "miss",
        31: "hit", 32: "miss", 33: "miss", 34: "hit", 35: "hit",
        36: "hit", 37: "hit", 38: "miss", 39: "hit", 40: "hit"
    }
};
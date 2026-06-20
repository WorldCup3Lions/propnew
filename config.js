/* ═════════════════════════════════════════════════════════════════════════
   DAILY CONFIGURATION — EDIT THIS FILE EACH DAY
   ═════════════════════════════════════════════════════════════════════════ */

window.DAILY_CONFIG = {

    date: "2026-06-19",
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
        { id:1,  team:"LAL", player:"LeBron James",    line:"Will score 25+ points",             points:2 },
        { id:16, team:"BOS", player:"Jayson Tatum",    line:"Will score 25+ points",             points:2 },
        { id:31, team:"GAME", player:"LAL vs BOS",     line:"Will go to overtime",               points:5 },
        { id:2,  team:"LAL", player:"LeBron James",    line:"Will score 30+ points",             points:4 },
        { id:17, team:"BOS", player:"Jayson Tatum",    line:"Will score 30+ points",             points:3 },
        { id:32, team:"GAME", player:"LAL vs BOS",     line:"Total score over 220.5",            points:2 },
        { id:3,  team:"LAL", player:"LeBron James",    line:"Will record 8+ assists",            points:2 },
        { id:18, team:"BOS", player:"Jayson Tatum",    line:"Will record 10+ rebounds",          points:3 },
        { id:33, team:"GAME", player:"LAL vs BOS",     line:"Total score under 210.5",           points:3 },
        { id:4,  team:"LAL", player:"LeBron James",    line:"Will record a double-double",       points:2 },
        { id:19, team:"BOS", player:"Jayson Tatum",    line:"Will record 5+ assists",            points:2 },
        { id:34, team:"GAME", player:"LAL vs BOS",     line:"Game decided by 5 points or less",  points:3 },
        { id:5,  team:"LAL", player:"Anthony Davis",   line:"Will score 25+ points",             points:2 },
        { id:20, team:"BOS", player:"Jaylen Brown",    line:"Will score 25+ points",             points:2 },
        { id:35, team:"GAME", player:"LAL",            line:"Will win by 10+ points",            points:4 },
        { id:6,  team:"LAL", player:"Anthony Davis",   line:"Will record 10+ rebounds",          points:2 },
        { id:21, team:"BOS", player:"Jaylen Brown",    line:"Will record 5+ assists",            points:2 },
        { id:36, team:"GAME", player:"BOS",            line:"Will win by 10+ points",            points:3 },
        { id:7,  team:"LAL", player:"Anthony Davis",   line:"Will block 3+ shots",               points:3 },
        { id:22, team:"BOS", player:"Jaylen Brown",    line:"Will hit 3+ three-pointers",        points:3 },
        { id:37, team:"GAME", player:"1st Quarter",    line:"Total points over 55.5",            points:2 },
        { id:8,  team:"LAL", player:"Anthony Davis",   line:"Will record a double-double",       points:2 },
        { id:23, team:"BOS", player:"Kristaps Porzingis", line:"Will score 20+ points",          points:2 },
        { id:38, team:"GAME", player:"LAL vs BOS",     line:"Both teams score 100+",             points:1 },
        { id:9,  team:"LAL", player:"D'Angelo Russell",line:"Will hit 4+ three-pointers",        points:3 },
        { id:24, team:"BOS", player:"Kristaps Porzingis", line:"Will block 2+ shots",            points:2 },
        { id:39, team:"GAME", player:"LAL vs BOS",     line:"Any player records triple-double",  points:4 },
        { id:10, team:"LAL", player:"D'Angelo Russell",line:"Will score 20+ points",             points:2 },
        { id:25, team:"BOS", player:"Derrick White",   line:"Will hit 3+ three-pointers",        points:3 },
        { id:40, team:"GAME", player:"LAL vs BOS",     line:"Lead changes 10+ times",            points:4 },
        { id:11, team:"LAL", player:"Austin Reaves",   line:"Will score 15+ points",             points:1 },
        { id:26, team:"BOS", player:"Jrue Holiday",    line:"Will record 3+ steals",             points:4 },
        { id:12, team:"LAL", player:"Austin Reaves",   line:"Will record 5+ assists",            points:3 },
        { id:27, team:"BOS", player:"Al Horford",      line:"Will record 8+ rebounds",           points:3 },
        { id:13, team:"LAL", player:"Rui Hachimura",   line:"Will score 10+ points",             points:1 },
        { id:28, team:"BOS", player:"Jayson Tatum",    line:"Will record a double-double",       points:3 },
        { id:14, team:"LAL", player:"LeBron James",    line:"Will make 10+ field goals",         points:3 },
        { id:29, team:"BOS", player:"Celtics Bench",   line:"Will combine for 25+ points",       points:2 },
        { id:15, team:"LAL", player:"LAL Backcourt",   line:"Will combine for 40+ points",       points:3 },
        { id:30, team:"BOS", player:"Derrick White",   line:"Will score 15+ points",             points:1 }
    ]
};

window.RESULTS = { 1: "hit", 2: "miss", 5: "hit", 7: "miss", 20: "hit" };
window.PAST_RESULTS = {};
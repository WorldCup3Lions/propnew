/* ═════════════════════════════════════════════════════════════════════════
   DAILY CONFIGURATION — EDIT THIS FILE EACH DAY
   
   QUICK GUIDE:
   1. Update "date" to today
   2. Update "lockTime" — picks lock at this time (24h format, ET timezone)
   3. Update "event" with today's featured matchup
   4. Update "props" with today's available bets
   5. As games finish, update RESULTS from "pending" to "hit" or "miss"
   6. (Optional) Move yesterday's final results into PAST_RESULTS before
      changing the date, so past picks still show correct outcomes
   ═════════════════════════════════════════════════════════════════════════ */

window.DAILY_CONFIG = {

    // Today's date (YYYY-MM-DD) — change this each day
    date: "2025-06-19",

    // Time when picks lock (24-hour format, Eastern Time)
    // Users cannot open packs or change picks after this time
    lockTime: "23:00",

    // Timezone reference for lock time
    timezone: "America/New_York",

    // ── Today's Featured Event ──
    event: {
        title: "LAL vs BOS",                          // Abbreviation format
        subtitle: "Los Angeles at Boston",             // City format
        sport: "basketball",
        time: "8:30 PM ET",
        venue: "TD Garden, Boston"
    },

    // ── Available Props ──
    // sport options: basketball, football, hockey, soccer, baseball, golf, tennis, ufc
    // points: 1 (easy) → 5 (legendary)
    // Use TEAM ABBREVIATIONS and player names (not full team names)
    props: [

        // ── Basketball ──
        { id:1,  sport:"basketball", text:"LAL — LeBron James 25+ points",                 points:2 },
        { id:2,  sport:"basketball", text:"LAL — LeBron James 30+ points",                 points:4 },
        { id:3,  sport:"basketball", text:"BOS — Jayson Tatum 10+ rebounds",               points:3 },
        { id:4,  sport:"basketball", text:"BOS — Jayson Tatum 30+ points",                 points:3 },
        { id:5,  sport:"basketball", text:"BOS — Jaylen Brown 5+ assists",                 points:2 },
        { id:6,  sport:"basketball", text:"LAL — Anthony Davis 3+ blocks",                 points:3 },
        { id:7,  sport:"basketball", text:"LAL — Anthony Davis double-double",             points:2 },
        { id:8,  sport:"basketball", text:"LAL — D'Angelo Russell 4+ three-pointers",     points:3 },
        { id:9,  sport:"basketball", text:"LAL vs BOS — Goes to overtime",                 points:5 },
        { id:10, sport:"basketball", text:"LAL — Wins by 10+ points",                     points:3 },
        { id:11, sport:"basketball", text:"BOS — Wins by 10+ points",                     points:3 },
        { id:12, sport:"basketball", text:"LAL vs BOS — Q1 total over 55.5",              points:2 },
        { id:13, sport:"basketball", text:"LAL vs BOS — Total over 220.5",                points:2 },
        { id:14, sport:"basketball", text:"LAL vs BOS — Total under 210.5",               points:3 },
        { id:15, sport:"basketball", text:"LAL — LeBron James 8+ assists",                points:2 },
        { id:16, sport:"basketball", text:"BOS — Kristaps Porzingis 20+ points",          points:2 },
        { id:17, sport:"basketball", text:"BOS — Jrue Holiday 3+ steals",                 points:4 },
        { id:18, sport:"basketball", text:"LAL vs BOS — Both score 100+",                 points:1 },
        { id:19, sport:"basketball", text:"LAL vs BOS — Any triple-double",               points:4 },
        { id:20, sport:"basketball", text:"LAL — Leads at halftime",                      points:2 },
        { id:21, sport:"basketball", text:"BOS — Leads at halftime",                      points:2 },
        { id:22, sport:"basketball", text:"LAL vs BOS — Decided by 5 or less",            points:3 },
        { id:23, sport:"basketball", text:"LAL — LeBron 10+ field goals",                 points:2 },
        { id:24, sport:"basketball", text:"BOS — Derrick White 3+ three-pointers",        points:3 },
        { id:25, sport:"basketball", text:"LAL — Austin Reaves 15+ points",               points:1 },

        // ── Football ──
        { id:26, sport:"football",  text:"KC — Patrick Mahomes 300+ pass yards",          points:2 },
        { id:27, sport:"football",  text:"KC — Patrick Mahomes 3+ TD passes",             points:3 },
        { id:28, sport:"football",  text:"KC — Travis Kelce 80+ rec yards",               points:2 },
        { id:29, sport:"football",  text:"KC — Travis Kelce scores TD",                   points:2 },
        { id:30, sport:"football",  text:"SF — Christian McCaffrey 100+ rush yards",      points:2 },
        { id:31, sport:"football",  text:"SF vs KC — Any QB 4+ TD passes",                points:5 },
        { id:32, sport:"football",  text:"SF vs KC — Defensive touchdown",                points:4 },
        { id:33, sport:"football",  text:"SF vs KC — Total sacks over 4.5",              points:2 },
        { id:34, sport:"football",  text:"SF vs KC — First score is a field goal",        points:2 },
        { id:35, sport:"football",  text:"SF vs KC — 50+ yard completion",                points:3 },
        { id:36, sport:"football",  text:"SF — Any receiver 10+ catches",                 points:3 },
        { id:37, sport:"football",  text:"SF vs KC — Any team 30+ points",                points:2 },
        { id:38, sport:"football",  text:"SF vs KC — 2-point conversion",                 points:5 },
        { id:39, sport:"football",  text:"SF vs KC — Any kicker 3+ field goals",          points:3 },
        { id:40, sport:"football",  text:"SF vs KC — Any QB 2+ interceptions",           points:3 },

        // ── Hockey ──
        { id:41, sport:"hockey",    text:"BOS — Any player hat trick",                    points:5 },
        { id:42, sport:"hockey",    text:"NYR vs BOS — Total over 5.5 goals",             points:2 },
        { id:43, sport:"hockey",    text:"NYR vs BOS — Goes to shootout",                 points:3 },
        { id:44, sport:"hockey",    text:"NYR vs BOS — Power play goal",                  points:1 },
        { id:45, sport:"hockey",    text:"NYR vs BOS — 2+ goal lead blown",               points:4 },
        { id:46, sport:"hockey",    text:"NYR — Goalie 35+ saves",                        points:3 },
        { id:47, sport:"hockey",    text:"NYR vs BOS — Goal in first 5 min",              points:3 },
        { id:48, sport:"hockey",    text:"BOS — Any player 3+ points",                    points:3 },
        { id:49, sport:"hockey",    text:"NYR vs BOS — Short-handed goal",                points:4 },
        { id:50, sport:"hockey",    text:"NYR vs BOS — Decided by 1 goal",                points:2 },
        { id:51, sport:"hockey",    text:"NYR vs BOS — Fight breaks out",                 points:3 },
        { id:52, sport:"hockey",    text:"NYR — Any player 5+ shots on goal",             points:1 },

        // ── Soccer ──
        { id:53, sport:"soccer",    text:"ARS vs CHE — 3+ total goals",                   points:2 },
        { id:54, sport:"soccer",    text:"ARS — Any player scores brace",                  points:3 },
        { id:55, sport:"soccer",    text:"ARS vs CHE — Penalty awarded",                   points:3 },
        { id:56, sport:"soccer",    text:"ARS vs CHE — Either clean sheet",                points:2 },
        { id:57, sport:"soccer",    text:"ARS vs CHE — Red card shown",                    points:4 },
        { id:58, sport:"soccer",    text:"ARS vs CHE — Goal from outside box",             points:3 },
        { id:59, sport:"soccer",    text:"ARS vs CHE — Goes to extra time",                points:5 },
        { id:60, sport:"soccer",    text:"ARS vs CHE — Corner total over 10.5",            points:2 },
        { id:61, sport:"soccer",    text:"ARS — Any player hat trick",                     points:5 },
        { id:62, sport:"soccer",    text:"ARS vs CHE — Both teams score",                  points:1 },
        { id:63, sport:"soccer",    text:"ARS vs CHE — 2+ goals in 2nd half",              points:2 },
        { id:64, sport:"soccer",    text:"ARS vs CHE — VAR overturn",                      points:3 },

        // ── Baseball ──
        { id:65, sport:"baseball",  text:"NYY vs LAD — Any player home run",              points:1 },
        { id:66, sport:"baseball",  text:"NYY vs LAD — Total runs over 8.5",              points:2 },
        { id:67, sport:"baseball",  text:"NYY — Pitcher 8+ strikeouts",                   points:3 },
        { id:68, sport:"baseball",  text:"NYY vs LAD — Grand slam",                       points:5 },
        { id:69, sport:"baseball",  text:"NYY vs LAD — Team 5+ runs in one inning",       points:4 },
        { id:70, sport:"baseball",  text:"NYY vs LAD — Extra innings",                    points:3 },
        { id:71, sport:"baseball",  text:"NYY vs LAD — No-hitter broken after 5th",       points:5 },
        { id:72, sport:"baseball",  text:"LAD — Any player 3+ hits",                      points:2 },
        { id:73, sport:"baseball",  text:"NYY — Any batter 2+ home runs",                 points:4 },
        { id:74, sport:"baseball",  text:"NYY vs LAD — Double play turned",               points:1 },

        // ── Golf ──
        { id:75, sport:"golf",      text:"PGA — Leader shoots 65 or better",              points:3 },
        { id:76, sport:"golf",      text:"PGA — Hole-in-one recorded",                    points:5 },
        { id:77, sport:"golf",      text:"PGA — Leader leads by 3+ strokes",              points:2 },
        { id:78, sport:"golf",      text:"PGA — Playoff required",                         points:4 },

        // ── Tennis ──
        { id:79, sport:"tennis",    text:"WIM — Match goes to 5 sets",                    points:3 },
        { id:80, sport:"tennis",    text:"WIM — Any set goes to tiebreak",                points:2 },
        { id:81, sport:"tennis",    text:"WIM — Player wins after losing 1st 2 sets",     points:5 },

        // ── UFC ──
        { id:82, sport:"ufc",       text:"UFC — Main event ends in round 1",              points:3 },
        { id:83, sport:"ufc",       text:"UFC — Title fight goes distance",               points:3 },
        { id:84, sport:"ufc",       text:"UFC — Any fight ends by submission",            points:2 },
        { id:85, sport:"ufc",       text:"UFC — Knockout of the Night",                   points:3 }
    ]
};

/* ═════════════════════════════════════════════════════════════════════════
   RESULTS — Update these as games finish
   
   Change "pending" to "hit" or "miss" for each prop ID.
   Any ID not listed here defaults to "pending".
   
   This is the FASTEST way to grade results throughout the day.
   ═════════════════════════════════════════════════════════════════════════ */
window.RESULTS = {
    1: "hit",      // LAL — LeBron James 25+ points ✓
    2: "miss",     // LAL — LeBron James 30+ points ✗
    3: "pending",  // BOS — Jayson Tatum 10+ rebounds
    4: "pending",  // BOS — Jayson Tatum 30+ points
    5: "hit",      // BOS — Jaylen Brown 5+ assists ✓
    6: "miss",     // LAL — Anthony Davis 3+ blocks ✗
    7: "hit",      // LAL — Anthony Davis double-double ✓
    8: "pending",  // LAL — D'Angelo Russell 4+ three-pointers
    // IDs 9–85 default to "pending" — update as games finish
};

/* ═════════════════════════════════════════════════════════════════════════
   PAST RESULTS — Copy finalized results here before changing the date
   
   This ensures past picks still display correct outcomes after you
   update DAILY_CONFIG for a new day. Format is the same as RESULTS:
   
   "YYYY-MM-DD": { propId: "hit"|"miss", ... }
   ═════════════════════════════════════════════════════════════════════════ */
window.PAST_RESULTS = {
    // Example (uncomment and fill in when archiving a day):
    // "2025-07-10": {
    //     1: "hit", 2: "miss", 3: "hit", 5: "miss", 7: "hit"
    // },
};
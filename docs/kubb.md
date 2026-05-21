# KUBB event

## UI Mockup

![kubb event ui mockup](images/pool.jpg)

## Leaderboard Consequences

3 matches. Semi-Finals and a Final.

Overall winner gets each team member 2pts.

Runner-up gets each team member 1pt.

## Sections

### Instructions String

>- Semi-Finals and Final
>- Winner = 2 pts to each team member
>- Runner-up = 1 pt to each team member

### LEADERBOARD POINTS CONTRIBUTION

* Table displaying final points after the bracket has been completed
* Automatically populated based on the results of the bracket.
* Allocate points to winning team's and runners-up team members

### BRACKET

UI elements (see mockup) displaying bracket layout and each round.

Placeholders for final, updated with team names when winners selected for previous matches.

There are four team slots for the semi-finals. Each element is a dropdown to select from the teams created in the next section.

Crown emoji 👑 check buttons next to each team in bracket. Click/tap to select winner. Mutually exclusive/zero sum within a matchup - there can only be one winner. 

### TEAMS

Four tables, 1 for each team.

3 tables of 2 players, and 1 table with 1 player.

The team names are renamable by the admin user.

Each team member cell is a drop down for selecting player names.

Crown emoji implemented as described in BRACKET section. Player can choose the winners in either section, and both sections remain in sync.

### FIXTURES

* A list of fixtures with UI elements displaying which team is facing which.
* Generated from bracket inputs.
* Each fixture has a label to the left of it for the bracket round/match.
* Updating the fixture updates the bracket. Leaderboard points contribution updated when final and 3rd round play-off match updated (the only matches that provide points to the leaderboard totals).
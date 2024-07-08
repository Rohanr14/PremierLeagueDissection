// Define the scenes
const scenes = [
    { id: 'intro', title: 'Introduction: The Birth of the Premier League' },
    { id: 'goals', title: 'Goal Scoring Trends' },
    { id: 'homeaway', title: 'Home vs Away Performance' },
    { id: 'balance', title: 'The Rise of Competitive Balance' },
    { id: 'players', title: 'Player Impact: Goals and Assists' },
    { id: 'pace', title: 'The Changing Pace of the Game' },
    { id: 'conclusion', title: 'Conclusion: The Modern Premier League' }
];

let currentSceneIndex = 0;
let matchesData, standingsData, topScorersData;

// Function to update the scene
function updateScene() {
    const scene = scenes[currentSceneIndex];
    const container = d3.select('#scene-container');
    
    // Clear previous content
    container.html('');
    
    // Add new content
    container.append('h2').text(scene.title);
    
    // Here, you'll add the specific visualization for each scene
    switch(scene.id) {
        case 'intro':
            renderIntroScene(container);
            break;
        case 'goals':
            renderGoalsScene(container);
            break;
        // Add cases for other scenes
        default:
            container.append('p').text(`Visualization for ${scene.id} will go here.`);
    }
    
    // Update button states
    d3.select('#prev-btn').property('disabled', currentSceneIndex === 0);
    d3.select('#next-btn').property('disabled', currentSceneIndex === scenes.length - 1);
}

// Event listeners for navigation buttons
d3.select('#prev-btn').on('click', () => {
    if (currentSceneIndex > 0) {
        currentSceneIndex--;
        updateScene();
    }
});

d3.select('#next-btn').on('click', () => {
    if (currentSceneIndex < scenes.length - 1) {
        currentSceneIndex++;
        updateScene();
    }
});

// Load and process the data
Promise.all([
    d3.csv('https://raw.githubusercontent.com/Rohanr14/PremierLeagueDissection/main/premier-league-matches-92-23.csv'),
    d3.csv('https://raw.githubusercontent.com/Rohanr14/PremierLeagueDissection/main/premier-league-standings-92-23.csv'),
    d3.csv('https://raw.githubusercontent.com/Rohanr14/PremierLeagueDissection/main/premier-league-top5-scorers-92-23.csv')
]).then(([matches, standings, topScorers]) => {
    matchesData = processMatchesData(matches);
    standingsData = processStandingsData(standings);
    topScorersData = processTopScorersData(topScorers);
    console.log('Data loaded and processed:', { matchesData, standingsData, topScorersData });
    // Initialize the first scene after data is loaded
    updateScene();
}).catch(error => console.error('Error loading the data:', error));

function processMatchesData(data) {
    return data.map(d => ({
        season: +d.Season_End_Year,
        week: +d.Wk,
        date: new Date(d.Date),
        home: d.Home,
        away: d.Away,
        homeGoals: +d.HomeGoals,
        awayGoals: +d.AwayGoals,
        result: d.FTR
    }));
}

function processStandingsData(data) {
    return data.map(d => ({
        season: +d['Initial Year'],
        position: +d['League position'],
        club: d.Club,
        gamesPlayed: +d['Games Played'],
        wins: +d.Wins,
        draws: +d.Draws,
        losses: +d.Losses,
        points: +d.Points,
        goalsFor: +d['Goals for'],
        goalsAgainst: +d['Goals Against'],
        goalDifference: +d['Goal Difference'],
        cleanSheets: +d['Clean Sheets']
    }));
}

function processTopScorersData(data) {
    return data.map(d => ({
        season: +d.Year,
        rank: +d.Rank,
        name: d.Name,
        team: d.Team,
        goals: +d.Goals,
        assists: +d.Assists,
        goalInvolvements: +d['Goal Involvements'],
        marketValue: d['Market Value'],
        appearances: +d.Appearances,
        age: +d.Age,
        penalties: +d.Penaltys,
        minutesPlayed: +d['Minutes Played'].replace(/,/g, ''),
        minsPerGoal: +d['Mins per goal'].replace(/'/g, ''),
        goalsPerMatch: +d['Goals per match']
    }));
}

function renderIntroScene(container) {
    container.append('p').text('Welcome to the Evolution of the Premier League (1992-2023)');
    
    // Create a simple bar chart showing the number of teams per season
    const teamsPerSeason = d3.rollup(standingsData, v => v.length, d => d.season);
    const chartData = Array.from(teamsPerSeason, ([season, count]) => ({season, count}))
        .sort((a, b) => a.season - b.season);

    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    x.domain(chartData.map(d => d.season));
    y.domain([0, d3.max(chartData, d => d.count)]);

    svg.selectAll('.bar')
        .data(chartData)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.season))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.count))
        .attr('height', d => height - y(d.count));

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-65)');

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Season');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Number of Teams');
}

function renderGoalsScene(container) {
    container.append('p').text('Goal scoring trends will be visualized here');
    // We'll implement this function in the next step
}

// Add more rendering functions for other scenes
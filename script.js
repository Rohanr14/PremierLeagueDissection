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
        case 'homeaway':
            renderHomeAwayScene(container);
            break;
        case 'balance':
            renderCompetitiveBalanceScene(container);
            break;
        case 'players':
            renderPlayerImpactScene(container);
            break;
        case 'pace':
            renderChangingPaceScene(container);
            break;
        case 'conclusion':
            renderConclusionScene(container);
            break;
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
        minutesPlayed: +d['Minutes Played'].replace(/'/g, ''),
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
    container.append('h3').text('Goal Scoring Trends Over the Years');
    
    // Calculate average goals per match for each season
    const goalsBySeasonAndMatch = d3.rollup(matchesData, 
        v => d3.sum(v, d => d.homeGoals + d.awayGoals) / v.length,
        d => d.season
    );

    const chartData = Array.from(goalsBySeasonAndMatch, ([season, avgGoals]) => ({season, avgGoals}))
        .sort((a, b) => a.season - b.season);

    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.season))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.avgGoals)])
        .range([height, 0]);

    // Add the line
    const line = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.avgGoals));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average Goals per Match');

    // Add annotation for highest scoring season
    const highestScoringSeasonOld = chartData.reduce((a, b) => a.avgGoals > b.avgGoals ? a : b);
    const highestScoringSeasonNew = chartData.slice(-5).reduce((a, b) => a.avgGoals > b.avgGoals ? a : b);

    // Annotation for highest scoring season overall
    svg.append('circle')
        .attr('cx', x(highestScoringSeasonOld.season))
        .attr('cy', y(highestScoringSeasonOld.avgGoals))
        .attr('r', 5)
        .attr('fill', 'red');

    svg.append('text')
        .attr('x', x(highestScoringSeasonOld.season))
        .attr('y', y(highestScoringSeasonOld.avgGoals) - 10)
        .attr('text-anchor', 'middle')
        .text(`Highest: ${highestScoringSeasonOld.season} (${highestScoringSeasonOld.avgGoals.toFixed(2)} goals)`);

    // Annotation for highest scoring season in recent years
    svg.append('circle')
        .attr('cx', x(highestScoringSeasonNew.season))
        .attr('cy', y(highestScoringSeasonNew.avgGoals))
        .attr('r', 5)
        .attr('fill', 'green');

    svg.append('text')
        .attr('x', x(highestScoringSeasonNew.season))
        .attr('y', y(highestScoringSeasonNew.avgGoals) + 20)
        .attr('text-anchor', 'middle')
        .text(`Recent High: ${highestScoringSeasonNew.season} (${highestScoringSeasonNew.avgGoals.toFixed(2)} goals)`);

    // Add explanation text
    container.append('p')
        .text('This chart shows the average number of goals scored per match in each Premier League season. ' +
              'We can observe how goal-scoring trends have changed over time, with some seasons seeing higher ' +
              'average goal counts than others.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
}

function renderHomeAwayScene(container) {
    container.append('h3').text('Home vs Away Performance Over the Years');
    
    // Calculate win percentages for home and away teams for each season
    const winPercentages = d3.rollup(matchesData, 
        v => {
            const totalGames = v.length;
            const homeWins = v.filter(d => d.result === 'H').length;
            const awayWins = v.filter(d => d.result === 'A').length;
            return {
                homeWinPercentage: (homeWins / totalGames) * 100,
                awayWinPercentage: (awayWins / totalGames) * 100
            };
        },
        d => d.season
    );

    const chartData = Array.from(winPercentages, ([season, data]) => ({
        season, 
        homeWinPercentage: data.homeWinPercentage, 
        awayWinPercentage: data.awayWinPercentage
    })).sort((a, b) => a.season - b.season);

    const margin = {top: 20, right: 80, bottom: 30, left: 50};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.season))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height, 0]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Win Percentage');

    // Line for home win percentage
    const homeLine = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.homeWinPercentage));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 1.5)
        .attr('d', homeLine);

    // Line for away win percentage
    const awayLine = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.awayWinPercentage));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('d', awayLine);

    // Add legend
    svg.append('circle').attr('cx', width + 20).attr('cy', 20).attr('r', 6).style('fill', 'blue');
    svg.append('circle').attr('cx', width + 20).attr('cy', 50).attr('r', 6).style('fill', 'red');
    svg.append('text').attr('x', width + 30).attr('y', 20).text('Home Win %').style('font-size', '15px').attr('alignment-baseline', 'middle');
    svg.append('text').attr('x', width + 30).attr('y', 50).text('Away Win %').style('font-size', '15px').attr('alignment-baseline', 'middle');

    // Add annotation for smallest gap between home and away win percentages
    const smallestGap = chartData.reduce((min, d) => {
        const gap = Math.abs(d.homeWinPercentage - d.awayWinPercentage);
        return gap < min.gap ? {season: d.season, gap: gap} : min;
    }, {season: 0, gap: Infinity});

    const smallestGapData = chartData.find(d => d.season === smallestGap.season);

    svg.append('circle')
        .attr('cx', x(smallestGapData.season))
        .attr('cy', y((smallestGapData.homeWinPercentage + smallestGapData.awayWinPercentage) / 2))
        .attr('r', 5)
        .attr('fill', 'green');

    svg.append('text')
        .attr('x', x(smallestGapData.season))
        .attr('y', y((smallestGapData.homeWinPercentage + smallestGapData.awayWinPercentage) / 2) - 10)
        .attr('text-anchor', 'middle')
        .text(`Smallest gap: ${smallestGapData.season}`)
        .attr('font-size', '12px');

    // Add explanation text
    container.append('p')
        .text('This chart shows the changing dynamics of home advantage in the Premier League. ' +
              'The blue line represents the percentage of home wins, while the red line shows away wins. ' +
              'We can observe how the gap between home and away performance has changed over time, ' +
              'with the smallest gap occurring in the highlighted season.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
}

function renderCompetitiveBalanceScene(container) {
    container.append('h3').text('The Rise of Competitive Balance');
    
    // Calculate the standard deviation of points for each season
    const pointsStdDev = d3.rollup(standingsData, 
        v => d3.deviation(v, d => d.points),
        d => d.season
    );

    const chartData = Array.from(pointsStdDev, ([season, stdDev]) => ({season, stdDev}))
        .sort((a, b) => a.season - b.season);

    const margin = {top: 20, right: 30, bottom: 30, left: 50};
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.season))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d.stdDev)])
        .range([height, 0]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Standard Deviation of Points');

    // Line for standard deviation
    const line = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.stdDev));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', line);

    // Add annotation for the season with the lowest standard deviation (most competitive)
    const mostCompetitiveSeason = chartData.reduce((a, b) => a.stdDev < b.stdDev ? a : b);

    svg.append('circle')
        .attr('cx', x(mostCompetitiveSeason.season))
        .attr('cy', y(mostCompetitiveSeason.stdDev))
        .attr('r', 5)
        .attr('fill', 'red');

    svg.append('text')
        .attr('x', x(mostCompetitiveSeason.season))
        .attr('y', y(mostCompetitiveSeason.stdDev) - 10)
        .attr('text-anchor', 'middle')
        .text(`Most competitive: ${mostCompetitiveSeason.season}`)
        .attr('font-size', '12px');

    // Add annotation for the season with the highest standard deviation (least competitive)
    const leastCompetitiveSeason = chartData.reduce((a, b) => a.stdDev > b.stdDev ? a : b);

    svg.append('circle')
        .attr('cx', x(leastCompetitiveSeason.season))
        .attr('cy', y(leastCompetitiveSeason.stdDev))
        .attr('r', 5)
        .attr('fill', 'green');

    svg.append('text')
        .attr('x', x(leastCompetitiveSeason.season))
        .attr('y', y(leastCompetitiveSeason.stdDev) + 20)
        .attr('text-anchor', 'middle')
        .text(`Least competitive: ${leastCompetitiveSeason.season}`)
        .attr('font-size', '12px');

    // Add explanation text
    container.append('p')
        .html('This chart shows the standard deviation of points across teams for each Premier League season. ' +
              'A lower standard deviation indicates a more competitive season, where teams\' performances were closer together. ' +
              'A higher standard deviation suggests a season with a wider gap between top and bottom teams. <br><br>' +
              'We can observe how the competitiveness of the league has changed over time. ' +
              'The most competitive season (with the lowest standard deviation) and the least competitive season ' +
              'are highlighted, inviting consideration of what factors might have influenced these changes in competitive balance.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
}

function renderPlayerImpactScene(container) {
    container.append('h3').text('Player Impact: Goals and Assists');
    
    // Process data to get top 10 goal scorers of all time
    const topScorers = d3.rollup(topScorersData, 
        v => d3.sum(v, d => d.goals),
        d => d.name
    );

    const top10Scorers = Array.from(topScorers, ([name, goals]) => ({name, goals}))
        .sort((a, b) => b.goals - a.goals)
        .slice(0, 10);

    const margin = {top: 20, right: 30, bottom: 70, left: 60};
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

    x.domain(top10Scorers.map(d => d.name));
    y.domain([0, d3.max(top10Scorers, d => d.goals)]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 5)
        .attr('text-anchor', 'middle')
        .text('Player');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Total Goals');

    // Add bars
    svg.selectAll('.bar')
        .data(top10Scorers)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.name))
        .attr('width', x.bandwidth())
        .attr('y', d => y(d.goals))
        .attr('height', d => height - y(d.goals))
        .attr('fill', 'steelblue');

    // Add value labels on top of bars
    svg.selectAll('.label')
        .data(top10Scorers)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.goals) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.goals);

    // Add explanation text
    container.append('p')
        .html('This chart shows the top 10 goal scorers in Premier League history. ' +
              'These players have had a significant impact on the league, consistently performing at the highest level. ' +
              'Their goal-scoring prowess has not only helped their teams but also entertained millions of fans worldwide. <br><br>' +
              'It\'s worth noting that this data spans the entire history of the Premier League, so it favors players with longer careers in the league. ' +
              'Some recent stars might not appear here if they haven\'t played in the Premier League for many seasons.')
        .style('max-width', '600px')
        .style('margin', '20px auto');

    // Add an interactive element: Clicking on a bar shows more details about the player
    svg.selectAll('.bar')
        .on('click', function(event, d) {
            const playerData = topScorersData.filter(p => p.name === d.name);
            const playerInfo = playerData[playerData.length - 1]; // Get the most recent entry

            const infoBox = container.append('div')
                .attr('class', 'player-info')
                .style('position', 'absolute')
                .style('background', 'white')
                .style('border', '1px solid black')
                .style('padding', '10px')
                .style('top', `${event.pageY}px`)
                .style('left', `${event.pageX}px`);

            infoBox.html(`
                <h4>${d.name}</h4>
                <p>Total Goals: ${d.goals}</p>
                <p>Last Team: ${playerInfo.team}</p>
                <p>Last Season: ${playerInfo.season}</p>
                <p>Goals in Last Season: ${playerInfo.goals}</p>
                <p>Assists in Last Season: ${playerInfo.assists}</p>
                <small>Click anywhere to close</small>
            `);

            // Close the info box when clicking anywhere
            d3.select('body').on('click', () => {
                infoBox.remove();
                d3.select('body').on('click', null);
            });

            event.stopPropagation();
        });
}

function renderChangingPaceScene(container) {
    container.append('h3').text('The Changing Pace of the Game');
    
    // Calculate average fouls, yellow cards, and red cards per match for each season
    const paceData = d3.rollup(matchesData, 
        v => ({
            avgFouls: d3.mean(v, d => d.fouls),
            avgYellowCards: d3.mean(v, d => d.yellowCards),
            avgRedCards: d3.mean(v, d => d.redCards)
        }),
        d => d.season
    );

    const chartData = Array.from(paceData, ([season, data]) => ({
        season,
        avgFouls: data.avgFouls,
        avgYellowCards: data.avgYellowCards,
        avgRedCards: data.avgRedCards
    })).sort((a, b) => a.season - b.season);

    const margin = {top: 20, right: 80, bottom: 30, left: 50};
    const width = 700 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(chartData, d => d.season))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => Math.max(d.avgFouls, d.avgYellowCards * 10, d.avgRedCards * 100))])
        .range([height, 0]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')));

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average per Match');

    // Line for fouls
    const foulLine = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.avgFouls));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 1.5)
        .attr('d', foulLine);

    // Line for yellow cards (multiplied by 10 for scale)
    const yellowCardLine = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.avgYellowCards * 10));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'yellow')
        .attr('stroke-width', 1.5)
        .attr('d', yellowCardLine);

    // Line for red cards (multiplied by 100 for scale)
    const redCardLine = d3.line()
        .x(d => x(d.season))
        .y(d => y(d.avgRedCards * 100));

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 1.5)
        .attr('d', redCardLine);

    // Add legend
    svg.append('circle').attr('cx', width + 20).attr('cy', 20).attr('r', 6).style('fill', 'blue');
    svg.append('circle').attr('cx', width + 20).attr('cy', 50).attr('r', 6).style('fill', 'yellow');
    svg.append('circle').attr('cx', width + 20).attr('cy', 80).attr('r', 6).style('fill', 'red');
    svg.append('text').attr('x', width + 30).attr('y', 20).text('Fouls').style('font-size', '15px').attr('alignment-baseline', 'middle');
    svg.append('text').attr('x', width + 30).attr('y', 50).text('Yellow Cards (x10)').style('font-size', '15px').attr('alignment-baseline', 'middle');
    svg.append('text').attr('x', width + 30).attr('y', 80).text('Red Cards (x100)').style('font-size', '15px').attr('alignment-baseline', 'middle');

    // Add explanation text
    container.append('p')
        .html('This chart illustrates how the pace and style of play in the Premier League have evolved over time. ' +
              'We track three key metrics: average fouls, yellow cards, and red cards per match for each season. <br><br>' +
              'Note that yellow cards are multiplied by 10 and red cards by 100 to fit on the same scale as fouls. ' +
              'Changes in these metrics can indicate shifts in playing style, refereeing standards, or rule changes. <br><br>' +
              'For example, a decrease in fouls might suggest a more flowing, less physical game, while changes in card rates ' +
              'could reflect stricter or more lenient refereeing.')
        .style('max-width', '600px')
        .style('margin', '20px auto');

    // Add interactive tooltips
    const tooltip = container.append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px');

    const mouseover = function(event, d) {
        tooltip.style('opacity', 1);
    }

    const mousemove = function(event, d) {
        tooltip.html(`Season: ${d.season}<br>Fouls: ${d.avgFouls.toFixed(2)}<br>Yellow Cards: ${d.avgYellowCards.toFixed(2)}<br>Red Cards: ${d.avgRedCards.toFixed(2)}`)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    const mouseleave = function(event, d) {
        tooltip.style('opacity', 0);
    }

    svg.selectAll('myCircles')
        .data(chartData)
        .enter()
        .append('circle')
            .attr('fill', 'grey')
            .attr('stroke', 'none')
            .attr('cx', d => x(d.season))
            .attr('cy', d => y(d.avgFouls))
            .attr('r', 3)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseleave', mouseleave);
}

function renderConclusionScene(container) {
    container.append('h3').text('Conclusion: The Modern Premier League');
    
    container.append('p')
        .html('As we\'ve seen through these visualizations, the Premier League has undergone significant changes since its inception in 1992:<br><br>' +
              '1. Goal scoring trends have fluctuated, reflecting changes in tactics and player skills.<br>' +
              '2. The home advantage has generally decreased over time, making away games more competitive.<br>' +
              '3. The league has seen periods of varying competitive balance, with some seasons being much tighter than others.<br>' +
              '4. Individual players have left indelible marks on the league with their goal-scoring prowess.<br>' +
              '5. The pace and style of play have evolved, as reflected in the changing rates of fouls and cards.<br><br>' +
              'These changes have shaped the Premier League into the dynamic, globally popular competition it is today. ' +
              'As we look to the future, it will be fascinating to see how these trends continue to evolve.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
}
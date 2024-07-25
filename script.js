// Gradient class definition
class Gradient {
    constructor() {
        this.canvas = document.getElementById('gradient-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colors = [
            { r: 0, g: 100, b: 255 },    // Light Blue
            { r: 0, g: 255, b: 150 },    // Light Green
            { r: 255, g: 100, b: 100 },  // Light Red
            { r: 255, g: 200, b: 0 }     // Light Yellow
        ];
        this.step = 0;
        this.colorIndices = [0, 1, 2, 3];
    }

    initGradient() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.updateGradient();
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }

    updateGradient() {
        const c0 = this.colors[this.colorIndices[0]];
        const c1 = this.colors[this.colorIndices[1]];
        const c2 = this.colors[this.colorIndices[2]];
        const c3 = this.colors[this.colorIndices[3]];

        const istep = 1 - this.step;
        const r1 = Math.round(istep * c0.r + this.step * c1.r);
        const g1 = Math.round(istep * c0.g + this.step * c1.g);
        const b1 = Math.round(istep * c0.b + this.step * c1.b);
        const color1 = `rgb(${r1},${g1},${b1})`;

        const r2 = Math.round(istep * c2.r + this.step * c3.r);
        const g2 = Math.round(istep * c2.g + this.step * c3.g);
        const b2 = Math.round(istep * c2.b + this.step * c3.b);
        const color2 = `rgb(${r2},${g2},${b2})`;

        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.step += 0.0005;
        if (this.step >= 1) {
            this.step %= 1;
            this.colorIndices[0] = this.colorIndices[1];
            this.colorIndices[2] = this.colorIndices[3];
            this.colorIndices[1] = (this.colorIndices[1] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
            this.colorIndices[3] = (this.colorIndices[3] + Math.floor(1 + Math.random() * (this.colors.length - 1))) % this.colors.length;
        }

        requestAnimationFrame(() => this.updateGradient());
    }
}

// Initialize the gradient after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', (event) => {
    const gradient = new Gradient();
    gradient.initGradient();
});

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
        club: d['Club'],
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
        minutesPlayed: d['Minutes Played'] ? +d['Minutes Played'].replace(/[,']/g, '') : null,
        minsPerGoal: d['Mins per goal'] ? +d['Mins per goal'].replace(/'/g, '') : null,
        goalsPerMatch: +d['Goals per match']
    }));
}

// Data loading and processing
Promise.all([
    d3.csv('premier-league-matches-92-23.csv'),
    d3.csv('premier-league-standings-92-23.csv'),
    d3.csv('premier-league-top5-scorers-92-23.csv')
]).then(([matches, standings, topScorers]) => {
    matchesData = processMatchesData(matches);
    standingsData = processStandingsData(standings);
    topScorersData = processTopScorersData(topScorers);
    updateScene(); // Initialize the first scene after data is loaded
}).catch(error => console.error('Error loading the data:', error));

function renderIntroScene(container) {
    container.append('p').text('Welcome to the Evolution of the Premier League (1992-2023)');
    
    // Create a simple bar chart showing the number of teams per season
    const teamsPerSeason = d3.rollup(standingsData, v => v.length, d => d.season);
    let chartData = Array.from(teamsPerSeason, ([season, count]) => ({season, count}))
        .sort((a, b) => a.season - b.season);

    // Filter out any anomalous data (e.g., seasons with more than 22 teams)
    chartData = chartData.filter(d => d.count <= 23 && d.count >= 19);

    const margin = {top: 20, right: 20, bottom: 70, left: 40};
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
        .attr('height', d => height - y(d.count))
        .attr('fill', 'steelblue');

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
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Season');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Number of Teams');

    // Add explanation text
    container.append('p')
        .html('This chart shows the number of teams participating in the Premier League each season. ' +
              'The Premier League started with 22 teams in 1992 and, after a few years of variation, was reduced to 20 teams from the 1998-1999 season and remained stable since.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
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

    const margin = {top: 30, right: 100, bottom: 50, left: 60};
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
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 10)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Average Goals per Match');

    // Add annotation for highest scoring season
    const highestScoringSeason = chartData.reduce((a, b) => a.avgGoals > b.avgGoals ? a : b);
    const lowestScoringSeason = chartData.reduce((a, b) => a.avgGoals < b.avgGoals ? a : b);

    function addAnnotation(data, color, text, yOffset) {
        svg.append('circle')
            .attr('cx', x(data.season))
            .attr('cy', y(data.avgGoals))
            .attr('r', 5)
            .attr('fill', color);

        svg.append('text')
            .attr('x', x(data.season))
            .attr('y', y(data.avgGoals) + yOffset)
            .attr('text-anchor', 'middle')
            .text(`${text}: ${data.season} (${data.avgGoals.toFixed(2)})`)
            .attr('font-size', '12px');
    }

    addAnnotation(highestScoringSeason, 'red', 'Highest', -10);
    addAnnotation(lowestScoringSeason, 'green', 'Lowest', 20);

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add dots for each data point
    svg.selectAll('.dot')
        .data(chartData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.season))
        .attr('cy', d => y(d.avgGoals))
        .attr('r', 3)
        .attr('fill', 'steelblue')
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Season: ${d.season}<br>Avg Goals: ${d.avgGoals.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add explanation text
    container.append('p')
        .html('This chart shows the average number of goals scored per match in each Premier League season. ' +
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

    const margin = {top: 30, right: 120, bottom: 50, left: 60};
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
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 10)
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
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 100}, 0)`);

    legend.append('circle').attr('cx', 0).attr('cy', 6).attr('r', 6).style('fill', 'blue');
    legend.append('circle').attr('cx', 0).attr('cy', 30).attr('r', 6).style('fill', 'red');
    legend.append('text').attr('x', 10).attr('y', 10).text('Home Win %').style('font-size', '12px').attr('alignment-baseline', 'middle');
    legend.append('text').attr('x', 10).attr('y', 34).text('Away Win %').style('font-size', '12px').attr('alignment-baseline', 'middle');

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
        .attr('x', x(smallestGapData.season) + 65)
        .attr('y', y((smallestGapData.homeWinPercentage + smallestGapData.awayWinPercentage) / 2) + 5)
        .attr('text-anchor', 'middle')
        .text(`Smallest gap: ${smallestGapData.season}`)
        .attr('font-size', '12px');

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add dots for each data point
    svg.selectAll('.dot-home')
        .data(chartData)
        .enter().append('circle')
        .attr('class', 'dot-home')
        .attr('cx', d => x(d.season))
        .attr('cy', d => y(d.homeWinPercentage))
        .attr('r', 3)
        .attr('fill', 'blue')
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Season: ${d.season}<br>Home Win %: ${d.homeWinPercentage.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    svg.selectAll('.dot-away')
        .data(chartData)
        .enter().append('circle')
        .attr('class', 'dot-away')
        .attr('cx', d => x(d.season))
        .attr('cy', d => y(d.awayWinPercentage))
        .attr('r', 3)
        .attr('fill', 'red')
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Season: ${d.season}<br>Away Win %: ${d.awayWinPercentage.toFixed(2)}`)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add explanation text
    container.append('p')
        .html('This chart shows the changing dynamics of home advantage in the Premier League. ' +
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

    let chartData = Array.from(pointsStdDev, ([season, stdDev]) => ({season, stdDev}))
        .sort((a, b) => a.season - b.season)
        .filter(d => d.season !== 0 && d.stdDev !== 0); // Filter out invalid data points

    const margin = {top: 30, right: 50, bottom: 50, left: 60};
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
        .domain([0, d3.max(chartData, d => d.stdDev)])
        .range([height, 0]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format('d')).ticks(10));

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
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

    // Add dots for each data point
    svg.selectAll('.dot')
        .data(chartData)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('cx', d => x(d.season))
        .attr('cy', d => y(d.stdDev))
        .attr('r', 3)
        .attr('fill', 'steelblue');

    // Add annotation for the season with the lowest standard deviation (most competitive)
    const mostCompetitiveSeason = chartData.reduce((a, b) => a.stdDev < b.stdDev ? a : b);

    svg.append('circle')
        .attr('cx', x(mostCompetitiveSeason.season))
        .attr('cy', y(mostCompetitiveSeason.stdDev))
        .attr('r', 5)
        .attr('fill', 'red');

    svg.append('text')
        .attr('x', x(mostCompetitiveSeason.season) + 85)
        .attr('y', y(mostCompetitiveSeason.stdDev) + 15)
        .attr('text-anchor', 'middle')
        .text(`Most competitive: ${mostCompetitiveSeason.season} (${mostCompetitiveSeason.stdDev.toFixed(2)})`)
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
        .attr('y', y(leastCompetitiveSeason.stdDev) - 10)
        .attr('text-anchor', 'middle')
        .text(`Least competitive: ${leastCompetitiveSeason.season} (${leastCompetitiveSeason.stdDev.toFixed(2)})`)
        .attr('font-size', '12px');

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll('.dot')
        .on('mouseover', function(event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Season: ${d.season}<br>Std Dev: ${d.stdDev.toFixed(2)}`)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

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
    
    // Process data to get top 10 players by combined goals and assists
    const playerImpact = d3.rollup(topScorersData, 
        v => ({
            goals: d3.sum(v, d => d.goals),
            assists: d3.sum(v, d => d.assists),
            total: d3.sum(v, d => d.goals + d.assists)
        }),
        d => d.name
    );

    const top10Players = Array.from(playerImpact, ([name, stats]) => ({name, ...stats}))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

    const margin = {top: 30, right: 30, bottom: 100, left: 60};
    const width = 700 - margin.left - margin.right;
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

    x.domain(top10Players.map(d => d.name));
    y.domain([0, d3.max(top10Players, d => d.total)]);

    // Add the X Axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em');

    // Add the Y Axis
    svg.append('g')
        .call(d3.axisLeft(y));

    // Add X axis label
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Player');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 10)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Total Impact (Goals + Assists)');

    // Add stacked bars
    const subgroups = ['goals', 'assists'];
    const color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#1f77b4', '#ff7f0e']);

    const stackedData = d3.stack()
        .keys(subgroups)(top10Players);

    svg.append("g")
      .selectAll("g")
      .data(stackedData)
      .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
          .attr("x", d => x(d.data.name))
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());

    // Add value labels on top of bars
    svg.selectAll('.label')
        .data(top10Players)
        .enter().append('text')
        .attr('class', 'label')
        .attr('x', d => x(d.name) + x.bandwidth() / 2)
        .attr('y', d => y(d.total) - 5)
        .attr('text-anchor', 'middle')
        .text(d => d.total);

    // Add legend
    const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(subgroups.slice().reverse())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d.charAt(0).toUpperCase() + d.slice(1));

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.selectAll("rect")
        .on('mouseover', function(event, d) {
            const playerData = d.data;
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`
                <strong>${playerData.name}</strong><br>
                Total Impact: ${playerData.total}<br>
                Goals: ${playerData.goals}<br>
                Assists: ${playerData.assists}
            `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on('mouseout', function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Add explanation text
    container.append('p')
        .html('This chart shows the top 10 players in Premier League history based on their combined goals and assists. ' +
              'These players have had a significant impact on the league, consistently performing at the highest level. ' +
              'Their goal-scoring prowess and ability to create chances for teammates have not only helped their teams but also entertained millions of fans worldwide. <br><br>' +
              'It\'s worth noting that this data spans the entire history of the Premier League, so it ' +
              'favors players with longer careers in the league. Some recent stars might not appear ' +
              'here if they haven\'t played in the Premier League for many seasons.')
        .style('max-width', '600px')
        .style('margin', '20px auto');
}

function renderChangingPaceScene(container) {
    container.append('h3').text('The Evolution of Competitiveness: Points Gap Analysis');
    
    // Process data to get point gaps for each season
    const pointGaps = d3.rollup(standingsData, 
        v => {
            const sortedPositions = v.sort((a, b) => a.position - b.position);
            const first = sortedPositions.find(d => d.position === 1);
            const fourth = sortedPositions.find(d => d.position === 4);
            const fifth = sortedPositions.find(d => d.position === 5);
            const seventeenth = sortedPositions.find(d => d.position === 17);
            const eighteenth = sortedPositions.find(d => d.position === 18);
            
            return {
                topFourGap: first && fourth ? first.points - fourth.points : null,
                championsLeagueCutoff: fourth && fifth ? fourth.points - fifth.points : null,
                relegationBattle: seventeenth && eighteenth ? seventeenth.points - eighteenth.points : null
            };
        },
        d => d.season
    );

    const chartData = Array.from(pointGaps, ([season, gaps]) => ({season, ...gaps}))
        .sort((a, b) => a.season - b.season)
        .filter(d => d.season >= 1992 && d.season <= 2023);

    console.log('Points Gap Data:', chartData);

    const margin = {top: 30, right: 150, bottom: 50, left: 60};
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
        .domain([0, d3.max(chartData, d => Math.max(d.topFourGap, d.championsLeagueCutoff, d.relegationBattle))])
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
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .text('Season');

    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left + 20)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Points Gap');

    // Line generators
    const createLine = key => d3.line()
        .defined(d => d[key] !== null)
        .x(d => x(d.season))
        .y(d => y(d[key]));

    const topFourLine = createLine('topFourGap');
    const championsLeagueLine = createLine('championsLeagueCutoff');
    const relegationLine = createLine('relegationBattle');

    // Add the lines
    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'blue')
        .attr('stroke-width', 2)
        .attr('d', topFourLine);

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'green')
        .attr('stroke-width', 2)
        .attr('d', championsLeagueLine);

    svg.append('path')
        .datum(chartData)
        .attr('fill', 'none')
        .attr('stroke', 'red')
        .attr('stroke-width', 2)
        .attr('d', relegationLine);

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width + 10}, 10)`);

    const legendItems = [
        { color: 'blue', text: 'Title Race Gap', description: '(1st - 4th)' },
        { color: 'green', text: 'Champions League Cutoff', description: '(4th - 5th)' },
        { color: 'red', text: 'Relegation Battle', description: '(17th - 18th)' }
    ];

    legendItems.forEach((item, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(0, ${i * 60})`);
        
        legendItem.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .style('stroke', item.color)
            .style('stroke-width', 2);
        
        legendItem.append('text')
            .attr('x', 25)
            .attr('y', 0)
            .text(item.text)
            .style('font-size', '12px')
            .attr('alignment-baseline', 'middle')
            .style('font-weight', 'bold');
        
        legendItem.append('text')
            .attr('x', 25)
            .attr('y', 20)
            .text(item.description)
            .style('font-size', '10px')
            .attr('alignment-baseline', 'middle');
    });

    // Add tooltips
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Function to handle mouseover for all data points
    function handleMouseOver(event, d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`Season: ${d.season}<br>
                      Title Race Gap: ${d.topFourGap} points<br>
                      Champions League Cutoff: ${d.championsLeagueCutoff} points<br>
                      Relegation Battle: ${d.relegationBattle} points`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
    }

    // Function to handle mouseout
    function handleMouseOut() {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }

    // Add dots and hover effects for each line
    ['topFourGap', 'championsLeagueCutoff', 'relegationBattle'].forEach((key, i) => {
        svg.selectAll(`.dot-${key}`)
            .data(chartData.filter(d => d[key] !== null))
            .enter().append('circle')
            .attr('class', `dot-${key}`)
            .attr('cx', d => x(d.season))
            .attr('cy', d => y(d[key]))
            .attr('r', 4)
            .attr('fill', ['blue', 'green', 'red'][i])
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);
    });

    // Add explanation text
    container.append('p')
        .html(`
            <strong>Understanding the Competitiveness of the Premier League</strong><br><br>
            This chart illustrates how the competitive landscape of the Premier League has evolved over time by tracking three key point gaps:<br><br>
            <span style="color: blue;"><strong>1. Title Race Gap (blue):</strong></span> The point difference between 1st and 4th place. A smaller gap indicates a tighter race for the title and top positions.<br><br>
            <span style="color: green;"><strong>2. Champions League Cutoff (green):</strong></span> The point difference between 4th and 5th place. This shows how fierce the competition is for the final Champions League spot.<br><br>
            <span style="color: red;"><strong>3. Relegation Battle (red):</strong></span> The point difference between 17th (safety) and 18th (relegation). A smaller gap suggests a more intense fight to avoid relegation.<br><br>
            <strong>Interpreting the Trends:</strong><br>
            - Decreasing gaps suggest increased competitiveness in that area of the league.<br>
            - Increasing gaps indicate a widening performance divide.<br>
            - Sharp changes might reflect shifts in team strategies, financial disparities, or league policies.<br><br>
            Hover over the data points to see exact values for each season.
        `)
        .style('max-width', '700px')
        .style('margin', '20px auto')
        .style('line-height', '1.4');
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
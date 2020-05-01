const fs = require('fs');
const { spawnSync } = require('child_process');

console.log('Loading repos...');

const repos = {};

for (const user of ['antelle', 'keeweb']) {
    const apiUrl = `https://api.github.com/users/${user}/repos`;
    const data = JSON.parse(spawnSync('curl', [apiUrl]).stdout.toString('utf8'));
    for (const item of data) {
        repos[item.html_url] = item.stargazers_count;
    }
}

console.log('Updating stars...');

let html = fs.readFileSync('index.html', 'utf8');

html = html.replace(/<a.*?✩\s*[\d.\w]+/g, str => {
    const repo = str.match(/https:\/\/github\.com\/[^"]+/)[0];
    let stars = repos[repo];
    if (!stars) {
        throw new Error(`Repo not found: ${repo}`);
    }
    if (stars >= 1000) {
        stars = (Math.round(stars / 100) / 10) + 'k';
    }

    str = str.replace(/[\d.\w]+$/, stars);

    console.log(repo, stars);

    return str;
});

console.log('Writing html...');
fs.writeFileSync('index.html', html);

console.log('Done');

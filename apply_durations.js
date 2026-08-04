const fs = require('fs');

const durations = require('./youtube-durations.json');
let seedContent = fs.readFileSync('prisma/seed.ts', 'utf-8');

for (const [url, mins] of Object.entries(durations)) {
  if (mins) {
    // Find the block for this url and replace estimatedMinutes
    // We can do this with a regex:
    // youtubeUrl: "https://www.youtube.com/watch?v=NTHVTY6w2Co",
    // orderIndex: 1,
    // estimatedMinutes: 20,
    
    // It's safer to use regex that replaces estimatedMinutes right after that url
    const regex = new RegExp(`youtubeUrl:\\s*"${url.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\$&')}",\\s*orderIndex:\\s*\\d+,\\s*estimatedMinutes:\\s*\\d+`, 'g');
    
    seedContent = seedContent.replace(regex, (match) => {
      return match.replace(/estimatedMinutes:\s*\d+/, `estimatedMinutes: ${mins}`);
    });
  }
}

fs.writeFileSync('prisma/seed.ts', seedContent, 'utf-8');
console.log("Updated seed.ts with real durations!");

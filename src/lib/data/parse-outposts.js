// Script to parse outpost names from outposts-stanton.json
const fs = require('fs');

// Read the outposts-stanton.json file
const outpostsData = JSON.parse(fs.readFileSync('./outposts-stanton.json', 'utf8'));

// Extract just the names and IDs
const outposts = outpostsData.data.map(outpost => {
  return {
    id: outpost.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: outpost.name,
    system: "Stanton",
    body: outpost.moon_name || outpost.planet_name,
    type: "Outpost"
  };
});

// Format the outposts as a JavaScript array string
const outpostsArrayString = outposts.map(outpost => 
  `  { id: "${outpost.id}", name: "${outpost.name}", system: "Stanton", body: "${outpost.body}", type: "Outpost" }`
).join(',\n');

// Write the formatted list to a file
fs.writeFileSync('./outposts-list.js', `// Generated list of Stanton system outposts\n// Add these to your game-data.ts destinations array\n\n${outpostsArrayString}\n`);

console.log(`Successfully extracted ${outposts.length} outpost names to outposts-list.js`);

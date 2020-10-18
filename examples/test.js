const path = require('path');
const waifu2x = require("../lib").default;

let cwd = process.cwd();
waifu2x(path.join(cwd, 'input.jpg')).noise(3).toFile(path.join(cwd, 'output.jpg')).then(r => {
    console.log("Done!");
});
const fs = require('fs');
const path = require('path');

const src = process.argv[2];

if (!src) {
    throw new Error('Missing file path argument');
}

fs.readdir(src, function(err, files) {
    const tstamp = new Date().toISOString().split('T')[0].replace(/-/g,'')
    files.forEach(function(file) {
        if(file.includes('-bundle.js') && !file.includes('.map')) {
            let file_arr = file.split('-');
            let ext = file_arr.pop();
            let fname = file_arr.join('-');
            let dest = path.join(src, `${fname}-${tstamp}-${ext}`);
            fs.rename(path.join(src, file), dest, function(err) {
                if (err) throw err;
            });
        }
    });
});


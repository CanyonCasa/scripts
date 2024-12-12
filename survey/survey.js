// survey.js

let cfg;
// dependencies...
require('./Extensions2JS');
const FileSystem = require('fs').promises;
const path = require('path');
const { createHash } = require('crypto');
const SQ3Wrapper = require('./SQ3Wrapper');

// helper functions...
// read number of bytes from file for short hash...
async function readBytesFromFile(filePath, numBytes) {
    try {
        const fileHandle = await FileSystem.open(filePath, 'r');
        const buffer = Buffer.alloc(numBytes);
        const { bytesRead } = await fileHandle.read(buffer, 0, numBytes, 0);
        await fileHandle.close();
        return Buffer.from(buffer,0,bytesRead); // return bytes read
    } catch (err) {
        console.error('Error reading file:', err);
        return Buffer.from(null);
    }
};

// embellished recursive folder listing routine...
async function listFolder(folder,recursive=true) {
    try {
        let lst = [];
        let errors = [];
        const dir = await FileSystem.readdir(folder);
        for (let obj of dir) {
            let f = path.join(folder,obj).replaceAll('\\','/'); // use linux notation
            try { 
                let s = await FileSystem.lstat(f); 
                let isLink = s.isSymbolicLink() || f.endsWith('.lnk');
                let isDir = s.isDirectory() && !isLink;
                let isFile = s.isFile() && !isLink;
                let rec=path.parse(f);
                rec.mergekeys({
                    file: f, size: s.size, 
                    atime: s.atime.toISOString(), mtime: s.mtime.toISOString(), ctime: s.ctime.toISOString(),
                    isDir: isDir, isFile: isFile, isLink: isLink, isDuplicate: false, 
                    hash: '', flag: '', exclude: cfg.excludedExtensions.includes(rec.ext), error: s.error||0
                });
                //console.log(rec);
                if (rec.isDir && cfg.excludedFolders.some(x=>rec.file.includes(x))) rec.exclude = true;
                if (rec.isFile && !rec.exclude) {
                    let numBytes = rec.size > cfg.hashSize ? cfg.hashSize : rec.size;
                    if (numBytes) {
                        rec.hash = createHash('sha256').update(await readBytesFromFile(rec.file,numBytes)).digest('base64')
                    };
                };
                lst.push(rec); // complete file system object record
                if (recursive && rec.isDir && !rec.exclude) { // recurse folder if not excluded
                    let sf = path.join(folder,rec.base).replaceAll('\\','/'); // use linux notation
                    let subDirList = await listFolder(sf);
                    if (subDirList) {
                        if (subDirList.list) lst.push(...subDirList.list);
                        if (subDirList.errors) errors.push(...subDirList.errors);
                    };
                };            
            } catch(e) { 
                console.error(f,e);
                errors.push({path: f, error: e.errno})
            };

        };
        return { list: lst, errors: errors };
    } catch(error) {
        console.error(error);
        return null; 
    }
}

// main code run as asynchronous IIFE...
(async () => {

let cfgFile = process.argv[2];
if (!cfgFile) {
    console.log('No configuration file specified ...');
    console.log('  SYNTAX: node survey <cfg_file>');
    process.exit();
};
cfg = require(cfgFile);
let { jsonFile, dbFile, root } = cfg;

// remove previously generated files...
if (jsonFile) await FileSystem.unlink(jsonFile).catch(e=>{});
if (dbFile) await FileSystem.unlink(dbFile).catch(e=>{});

// optional build time measurement...
const start = Date.now();

console.log(`Building recursive tree from: ${root}`);
let lst = await listFolder(root);
if (!lst) process.exit(1);
let d = lst.list.filter(o=>o.isDir).length;
let f = lst.list.filter(o=>o.isFile).length;
let l = lst.list.filter(o=>o.isLink).length;
let e = lst.errors.length;
console.log(`Found: ${d} directories, ${f} files, ${l} links, ${e} errors`);

// optional debug for testing small folder; comment call below to omit on whole disk
function debug(){
    let d = lst.filter(o=>o.isDir);
    let f = lst.filter(o=>o.isFile);
    let l = lst.filter(o=>o.isLink);
    let e = lst.errors;
    console.log(`Directories...`); d.forEach(n=>console.log(`  ${n.file}${n.exclude?' (x)':''}`))
    console.log(`Files...`); f.forEach(n=>console.log(`  ${n.file}${n.exclude?' (x)':''}`))
    console.log(`Links...`); l.forEach(n=>console.log(`  ${n.file}`))
    console.log(`Errors...`); lst.errors.forEach(n=>console.log(`  [${n.error}] ${n.path}`))
};
//debug();

let mark = Date.now();
console.log(`Finished directory search: ${Date.prototype.humanTime(mark-start)}`)

// optionally export flat file list as JSON array of objects...
if (jsonFile) {
    await FileSystem.writeFile(jsonFile,JSON.stringify(lst,null,2));
    mark = Date.now();
    console.log(`JSON file saved: ${Date.prototype.humanTime(mark-start)}`)
};

// conversion to SQLite3 database for export
if (dbFile) {
    let filesTable = `CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY, root TEXT, dir TEXT, base TEXT, ext TEXT, name TEXT, file TEXT,
        size INTEGER, atime TEXT, mtime TEXT, ctime TEXT, isDir INTEGER, isFile INTEGER, isLink INTEGER,
        isDuplicate INTEGER, hash TEXT, flag TEXT, exclude INTEGER, error INTEGER);`;
    let errorsTable = `CREATE TABLE IF NOT EXISTS errors (id INTEGER PRIMARY KEY, error INTEGER, path TEXT)`;
    let insertQuery = `INSERT INTO files VALUES(NULL,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    let errorsQuery = `INSERT INTO errors VALUES(NULL,?,?)`

    const mySQ3 = new SQ3Wrapper(); // instance of Promise based wrapper
    await mySQ3.open(":memory:");
    await mySQ3.sql(filesTable);
    for (let obj of lst.list) {  // insert a row for each file system object...
        let { root, dir, base, ext, name, file, size, atime, mtime, ctime, isDir, isFile, isLink, 
            isDuplicate, hash, flag, exclude, error } = obj;
        let params = [ root, dir, base, ext, name, file, size, atime, mtime, ctime, isDir, isFile, isLink, 
                isDuplicate, hash, flag, exclude, error ];
        await mySQ3.sql(insertQuery,params);
    };

    await mySQ3.sql(errorsTable);
    for (let err of lst.errors) {  // insert a row for each file system error...
        await mySQ3.sql(errorsQuery,[err.error,err.path]);
    };

    mark = Date.now();
    console.log(`SQLite3 in memory database ready: ${Date.prototype.humanTime(mark-start)}`);

    await mySQ3.saveAs(dbFile);

    mark = Date.now();
    console.log(`SQLite3 in memory database saved: ${Date.prototype.humanTime(mark-start)}`);
        
    mySQ3.close();
};

process.on('beforeExit',()=>{
    mark = Date.now();
    console.log(`Total build time: ${Date.prototype.humanTime(mark-start)}`)
});

})()
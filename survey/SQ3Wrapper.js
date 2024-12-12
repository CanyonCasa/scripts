// Simple promise-based query wrapper for SQLite3 database

const sqlite3 = require('sqlite3'); // sqlite3 bindings...

module.exports = SQ3Wrapper = function SQ3Wrapper(cfg) {
    this.file = cfg?.file;
}

// wrapper for database open/create/connect function, optional callback...
SQ3Wrapper.prototype.open = function open(file) {
    if (file) this.file = file;
    return new Promise((resolve,reject) => {
        this.db = new sqlite3.Database(this.file,err=>{
            if (err) { reject(err) } else { resolve() };
        });
    });
}

// wrapper for database close function
SQ3Wrapper.prototype.close = function(callback) { this.db.close(callback); };

// async (Promise) wrapper for database run function...
SQ3Wrapper.prototype.sql = async function sql (query, params=[]) {
    return new Promise((resolve,reject)=>{
        if (query.startsWith('SELECT')) {
            this.db.all(query,params,(err,data)=>{
                if (err) { console.log('query',err); reject(err) } else { resolve(data) };   
            })
        } else {
            this.db.run(query,params,(err,data)=>{
                if (err) { console.log(err); reject(err) } else { resolve(data) };   
            })
        }
    });
}

SQ3Wrapper.prototype.saveAs = async function saveAs (file) {
    await this.sql(`VACUUM INTO '${file}'`);
}

// definitions...
module.exports = {

    hashSize: 256,  // bytes to read for short hash
    excludedExtensions: '.lnk,.tmp,.bak,.log'.split(','),
    excludedFolders: 'node_modules,windows'.split(','),
    jsonFile: 'survey.json',    // JSON output filename, comment to skip
    dbFile: 'survey.sq3',       // SQLite3 output filename, comment to skip
    root: './'  // root folder for tree

};

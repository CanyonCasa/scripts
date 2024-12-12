# survey.js

#### *Keywords*
disk, logger, preprocessor

#### *Abstract*
*A Javascript program run under NodeJS to log all files on a disk or directory tree into a JSON or SQLite3 database file.* It does not performa any disk operations but simple surveys the disk as a kind of preprocessor gathering the data usefull for later disk actions.

### Installation
**Assumes the previous installation of NodeJS and NPM.**
Copy the files in the survey folder to a local directory. Run 
```javascript
npm install
```

### Syntax
To run the script use:
```javascript
node survey <configuration_file>
```
where \<configuration_file\> represents the configuration filespec, which must be absolute or relative (i.e. ./cfg). Not necessary to specify the .js extension as for example
```javascript
node survey ./cfg
```
*Note: the script uses the / character for both Linux and Windows file specification. See the cfg.js file for example configuration values*

### Data Collected
The survey script collects the following data:

| info | format | description |
| :--- | :----- | :---------- |
| root | TEXT | The root of the file path |
| dir | TEXT | The full directory of the file path |
| base | TEXT | The base filename without a path or extension |
| ext | TEXT | The file extension |
| name | TEXT | The filename without a path component |
| file | TEXT | The fully qualified filespec |
| size | INTEGER | Size of the file in bytes |
| atime | TEXT | The last access time for the file is ISO string format |
| mtime | TEXT | The last modified time for the file is ISO string format |
| ctime | TEXT | The create time for the file is ISO string format |
| isDir | INTEGER | Boolean flag indicting if file system object is a directory (0: false, 1: true) |
| isFile | INTEGER | Boolean flag indicting if file system object is a file (0: false, 1: true) |
| isLink | INTEGER | Boolean flag indicting if file system object is a link (0: false, 1: true) |
| isDuplicate | INTEGER | Boolean flag indicting if file system object is a duplicate (0: false, 1: true) |
| hash | TEXT | A short (fast) SHA-256 hash computed from the first 256 bytes of the file |
| flag | TEXT | A reserved user flag field for post-processing|
| exclude | INTEGER | Boolean flag indicating if object should be ignored (0: false, 1: true) |
| error | INTEGER | Boolean flag indicating if a stat error occured during search (0: false, 1: true) |

*Notes:*

1. All file specifiers use / character for both Linux and Windows.
2. isDuplicate, hash, flag, exclude, and error fields are provided for post-processing actions by other scripts.
3. The hash may be used for initial file matching, assuming a hash of the complete file contents is generated for an absolute matching test.

### Output
The script optionally outputs a JSON of a flat array of all discovered file system objects. It optionally outputs an additional SQLite3 database.

Definitions at the top of the script allow for customizing excluded files and directories, as well as speicifing the names of the output files. Future versions of this script will likely move these setting to a configuration file for more flexibility.

### Metrics
Running on a 12th Gen Intel(R) Core(TM) i7-12650H, 1500 Mhz (10 Core(s), 16 Logical Processor(s)) took 2 mins 7 secs to catalog 18426 directories, 110555 files, 478 links, while generating 214 errors. Errors mainly due to accessing protected folders. The generated JSON output (survey.json) was 89,552,957 bytes while the SQLite3 database was 48,562,176 bytes.

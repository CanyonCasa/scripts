# scripts
A collection of scripts used in my **Raspberry Pi** projects. Note, some scripts may require other installed pakages to work. You may also have to alter
paths and/or #! references for proper operation. For example, I use the scripts for AWS Lightsail instances as well, where most executables are installed 
under _/opt/bitnami_ rather than _/bin_.

## /usr/local/bin Scripts
Most of the scripts should reside in the _/usr/local/bin_ directory. (I generally add a symbolic link _/u_ for the _/usr/local/bin_ path to simplify access.) 
Data needed for some scripts resides in _/usr/local/etc_. Using the _/usr/local_ directory prevents scripts being overwritten during OS updates/upgrades.

```bash
sudo ln -s /usr/local/bin /u
```

### bsync
A backup script based on running rsync snippets from a configuration file, allowing backups to be customized machine-by-machine without altering the script. 
Also depends on _sms.py_ and _mail_ scripts.

### pid
A handy little script for listing processes (i.e. process id) by name.

### raspian-shrink and raspian-grow
Scripts to change the raspian partition size. **NOTICE: USE AT YOUR OWN RISK AND ONLY IF YOU UNDERSTAND WHAT YOU ARE DOING. ALSO THESE SCRIPTS MAY BECOME 
ABSOLETE WITH CHANGES TO THE PARTITIONING STRUCTURE BASED ON OS VERSIONS.**

### strip
Strips _#_ comments from **"streamed"** large configuration files to more clearly see the actual configuration. Does not alter the file.

### SMS and Mail
Note the _sms.py_ and _sg_mail_ scripts rely on **Twilio** and **SendGrid** services respectively. Example (sanitized) configuration files given for each service 
should be defined and placed in _/usr/local/etc_ with 600 permissions (i.e root only read/write access). **ALERT: IF cloning this repo, make sure you do not 
upload configured _twilio.json_ and _sendgrid.json_ files to github as it will compromise your accounts** The _mail_to.py_ respresents an older mail script configured 
for a SMTP service such as gmail.

### Update
The _update_ script performs an OS update and upgrade and notifies a sys admin of the results. Note, as defined the script depends on both sms and sg_mail scripts and 
their respective services, but these lines may be removed or altered as desired. It can be configured from a _/etc/cron.d_ file to run periodically, as shown below. 
The _croncall_ script provides a wrapper to log the cron call to let you know that the command has run sucessfully, mainly for debug.

```bash
# OS update @ 10:10PM every Saturday...
10 10 * * 6       root    /usr/local/bin/croncall update
```
## /etc/systemd/system Services

The _*.service_ files must be placed in the /etc/systemd/system directory AND enabled appropriately.

### TMUX

I find the tmux service particularly useful. It requires setup of the _tmux.service_, which runs the _tmuxuser_ script, and possibly requires install of _tmux_. 
This script launches a _tmux_ process for each user at login, if they have a _.tmux.init_ file in their home directory. This file configures/customizes 
the particular windows created by tmux. Users should customize it accordingly, which is beyond the scope of this documentation. See _tmux_ documentation 
for specifics. Users may also define a _.tmux.conf_ file in thier home directory to customize tmux behavior as desired. Note, both the init and conf 
files are 'dot' files, making them hidden files.

Once setup, upon login a user simply enters the command _gotmux_ (i.e "got mux" or "go tmux") to resume the defined session and pick up where they left off
as sessions persist from login to login.

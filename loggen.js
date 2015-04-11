#!/usr/bin/env node

/**
 * random syslog messages generator for McAfee SIEM
 *
 * services supported: ssh2
 *
 * Valid login string looks like
 * Mar 31 17:11:21 localhost sshd[65858]: Accepted password for root from 172.16.4.105 port 50468 ssh2
 *
 * Wrong password string looks like
 * Mar 31 17:15:29 localhost sshd[65897]: Failed password for root from 172.16.4.105 port 50669 ssh2
 *
 * Another appeared message
 * Mar 31 17:15:23 localhost sshd[65858]: Received disconnect from 172.16.4.105: 11: disconnected by user
 *
 * TODO
 *  - imitate the bruteforce attack on the ssh server (single remote IP, a lot of wrong logins)
 *  - add more services
 */

var strftime = require('./strftime-min');
var syslog = require('./logger-lib');

var   syslogServerHost = "192.168.201.160" // syslog target host
    , syslogServerPort = 514 // syslog port, we will use UDP
    , users = ['root', 'admin', 'ramon', 'andy', 'h4ck3r', 'nimda', 'toor', 'billg', 'steve', 'justauser', 'operator', 'monitoring', 'antiram', 'vlad', 'oleg', 'igor3']; // username to appear in the log string
var options = {};

options.name = 'sshd';
options.hostname = 'very_important_ssh_server';

var logger = syslog.createClient(syslogServerPort, syslogServerHost, options);

var getRandomX = function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};

var loginOK = function() { // whether login is failed or not
    return getRandomX(1,50) > 2; // this will give about 5% of failed logins
};

var getRemotePort = function () {
    return getRandomX(10000, 65534);
};

var getRemoteHost = function () {
    var   octet = [];

    for (var i = 0; i < 4; i++) {
        octet[i] = getRandomX(1, 219);
    }
    return octet[0] + "." + octet[1] + "." + octet[2] + "." + octet[3];
};

/*
var getProcessID = function () {
    return getRandomX(1500, 65534);
};

var getDate = function () {
    // format is as follows: Mar 31 17:15:23
    return strftime('%b %d %H:%M:%S');
};
*/

var getUser = function () {
    return users[getRandomX(0,users.length)];
};

var msgLoginOK = function () {
    //return getDate() + ' localhost sshd[' + getProcessID() +']: Accepted password for ' + getUser() +
    return  'Accepted password for ' + getUser() + ' from ' + getRemoteHost() + ' port ' + getRemotePort() + ' ssh2';
};

var msgLoginFailed = function () {
    return 'Failed password for ' + getUser() + ' from ' + getRemoteHost() + ' port ' + getRemotePort() + ' ssh2';
};

var sendMessageToSyslog = function (message) {
    //
    console.log(message);
    logger.info(message);
};

var sleep = function (milliseconds) {
    var start = new Date().getTime();
    for (var ms = 0; ms < 1e7; ms++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
};
for (var ty=1; ty<10000; ty++) {
    loginOK() ? sendMessageToSyslog(msgLoginOK()) : sendMessageToSyslog(msgLoginFailed());
    sleep(1000);
}
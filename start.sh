#!/bin/sh

systemctl is-active --quiet nginx || sudo systemctl start nginx
systemctl is-active --quiet mariadb || sudo systemctl start mariadb
mariadb --user=AzureDiamond --password=hunter2 -D sweng < maintenance.sql



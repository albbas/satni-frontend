* git tag -a v0.10.4
* git push origin master
* git push origin v0.10.4
* yarn build
* rsync -az  --delete --delete-excluded --info=progress2 build/* gtweb.uit.no:/var/www/html/risten/
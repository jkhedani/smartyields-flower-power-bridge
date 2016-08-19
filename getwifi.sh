#!/bin/bash

while [ "$(nmcli -t -f WIFI,STATE g)" = 'enabled:disconnected' ]
do
	#Limited primary check to see if usb flash drive is mounted
	volume="/media/sypi"
	if mount|grep -o $volume; then
		echo "mounted"
	else
	echo "not mounted"
	fi

	#Check to see if usb device is present. If not, exit.
	set -e 									#abort if a command returns non successful (non-zero)
	ls -l /dev/disk/by-label | grep -c sd*  #check to see if disk starting with sd is present.
									    #returns the count of grep so 0 if none
	set +e 								    #undo set -e

	#A little more robust, grabs the last word including partition. i.e. sda1
	blk=$(ls -l /dev/disk/by-label | grep sd* | grep -oE '[^/]+$')

	#Get the mountpoint as a variable
	mntpnt=$(lsblk --nodeps /dev/$blk  -o MOUNTPOINT -n)
	# echo $mntpnt 							#print where the usb flash drive is mounted

	#Get WiFi credentials file
	#(Assumes WiFi is in the file name)
	loc=$(find $mntpnt -iname '*WiFi*.txt')
	echo "Location:" $loc

	#Get SSID (not case sensitive but needs ssid and password, delimited by semicolon
	ssid=$(grep -i 'SSID' $loc | cut -f2- -d':' | sed 's/^.*://')
	pw=$(grep -i 'Password' $loc | cut -f2- -d':' | sed 's/^.*://')
	echo $ssid $pw

	#Use nmcli to connect using ssid and password\
	nmcli d wifi connect $ssid password $pw wep-key-type key
	sleep 5

	#Check which network you are on
	myssid=$(iwgetid -r)
	echo $myssid
done

exit 0

####################
#####  README  #####
####################
# 1. Setting up getwifi.sh needs three things
# 2. In the flower-power-bridge repository you should find getwifi.sh
# 		You will need to configure it to run on boot (see below)
# 3. The Wifi text file with credentials must have “WiFi” in the filename (case-sensitive) 
# 		and must have the following format.
	# SSID:*********
	# Password:*****

# Getwifi.sh after configuring to run on boot will check to see if a usb flash drive is mounted (if not, exit)
# and search for a textfile with “WiFi” in the filename. It will search for two parameters, ssid and password, 
# (not case sensitive), and then use nmcli to login to that network.  

####  Config to run on boot ####
# Edit etc/rc.local to run getwifi.sh on boot
# 		sudo nano /etc/rc.local
# Change the code to include the following
#
# 		#This script is executed at the end of each multiuser runlevel 
# 		/home/sypi/Desktop/sy-bridge2/getwifi.sh || exit 1 # Added by me 
# 		exit 0
#
# Referenced here (http://askubuntu.com/questions/228304/how-do-i-run-a-script-at-start-up)

# Note 1: it take about 1~2 minutes for the script to run and connect to wifi after being powered on
# Note 2: Running the script in terminal gives some feedback (have to disable set -e). 
# If lsblk error shows, it means that the usb flash drive wasn’t recognized 
# (file system was different, more than one partition, etc). 

# Now, with a usb flash drive plugged in, restart the pi and it should boot, 
# and connect to specified network.

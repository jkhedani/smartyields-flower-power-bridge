#!/bin/bash

# Automatic WIFI enabler
# @author By Justin Hedani
# @notes
#	- It has not been tested but if there are two USB sticks attached
#	  to the program, it may not work.
#	- Program will die if it cannot connect to network within ~200 seconds


isConfigured=false # This should be set to true to stop the program
maxLoop=20 # The maximum number of times this program can run
loopIndex=0 #increment the loop index

while [ "$isConfigured" = "false" ]
do

	# Retrieve info about potentially connected USB drive
	USBDriveNames=$(ls -l /dev/disk/by-id/usb* | sed 's/.*usb-\(.*\)-[0-9]:.*/\1/') # Find and retrieve the name of the drive
	hasUSBDrive=${#USBDriveNames} # Just get the length of the name if it exists

	# Since some stupid drives try to mount all kinds of helper crap, let's just mount them all.
	for USBDriveName in "$USBDriveNames"
	do
		echo "Mounting drive $USBDriveName"
		USBDriveMountPath=$(readlink -f /dev/disk/by-id/usb-$USBDriveName-0:0)
		mount $USBDriveMountPath "/media/sypi"
		sleep 2
	done

	# If the USB drive is connected...
	if [ "$hasUSBDrive" -gt 0 ]
	then

		# Look for text file containing WIFI
		credentialsFilePath=$(find /media/sypi -iname '*WIFI*.txt')
		hasCredentials=${#credentialsFilePath}

		if [ "$hasCredentials" -gt 0 ]
		then

			# Retrieve the credentials (not case sensitive but needs ssid and password, delimited by semicolon)
        		ssid=$(grep -i 'SSID' $credentialsFilePath | cut -f2- -d':' | sed 's/^.*://')
        		password=$(grep -i 'Password' $credentialsFilePath | cut -f2- -d':' | sed 's/^.*://')
        		echo "SSID: $ssid"
			echo "Password: $password"

			# If the wifi is turned off, turn it on.
			wifiState=$(nmcli -t -f WIFI g) # State of the physical hardware
			if [ "$wifiState" = "disabled" ]
			then
				echo "Enabling WIFI..."
				nmcli r wifi on
				echo "WIFI on."
			fi

			# Run NMCLI script
			nmcli d wifi connect $ssid password $password wep-key-type key
			sleep 5

			# Then check if we're connected or not
			networkState=$(nmcli -t -f STATE g) # State of the units connection to the network
			if [ "$networkState" = "connected" ]
			then
				echo "You are connected!"
				isConfigured=true
			fi

		# Exit program if there is no credentials file
		else
			echo "No credentials file found."
			break
		fi

	# If no USBs are present exit the program.
	else
		echo "No USB drives are present."
		break
	fi

	# Protect program from going rogue.
	# Increment loop index
	let "loopIndex++"

	# If we've loop through the program the max number of times, exit.
	if [ "$maxLoop" -eq "$loopIndex" ]
	then
		break
	fi

	# sleep 5 seconds before trying again
	sleep 5
done

exit 0

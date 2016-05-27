# Smart Yields Flower Power Bridge

### Requirements

ubuntu (>= 16.x LTS)
nodejs (>= 0.12)
npm (*)
pm2 (*)


### Pre-installation

If you don't have NodeJS or NPM installed.

Update listing and install node. This may get stale so refer to official install
instructions just in case: https://nodejs.org/en/download/package-manager/

		$ curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
		$ sudo apt-get install -y nodejs

If you don't have pm2 installed, make sure you install NodeJS & NPM before hand.

		$ npm install -g pm2


### Installation

1. Download this repository to the file system on the bridge you wish to deploy.

		$ git clone https://github.com/jkhedani/smartyields-flower-power-bridge.git sy-bridge

2. Navigate into your newly installed bridge program and install dependencies.

		$ cd sy-bridge
		$ npm install

3. Create your configuration and modify your settings.

		$ mv config.example.json config.json


4. Prepare the startup script.

		$ pm2 startup ubuntu

   Follow the command line instructions to run a secondary permissions command on
   the console output. It should look SIMILAR to this but is NOT the same:

   sudo su -c "env PATH=$PATH:/usr/bin pm2 startup ubuntu -u vagrant"

5. Start the bridge on the process manager.

		$ pm2 start pm2init.json

6. Check if the process is running smoothly by checking the status is `online`.

 		$ pm2 status

7. If all looks goods, save the process for restart.

		$ pm2 save

8. That's it. Feel free to test if the script restarts after reboot.

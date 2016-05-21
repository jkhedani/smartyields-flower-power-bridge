# Smart Yields Flower Power Bridge


### Requirements

ubuntu (>= 16.x LTS)
nodejs (>= 0.12)
npm (*)

### Installation

1. Download this repository to the file system on the bridge you wish to deploy:

		$ git clone https://github.com/jkhedani/smartyields-flower-power-bridge.git sy-bridge

2. Navigate into your newly installed bridge program and install dependencies:

		$ cd sy-bridge
		$ npm install

3. Create your configuration and modify your settings:

		$ mv config.example.json config.json

4. Start the bridge!

		$ node bridge.js

# Express Demo

This is a demo application for HomeAway's public API written in Node.js on the Express web framework.  To run this, you will need to have NPM and Node installed.  

install the depdenencies

    npm install

set up your client id and secret in environment variables

    export HOMEAWAY_CLIENT_ID=00000000-0000-0000-0000-000000000000
    export HOMEAWAY_CLIENT_SECRET=00000000-0000-0000-0000-000000000000

run it!

    node index.js


Once the app starts up, you should see the token response from the OAuth server. If that checks out, you can go in your browser to the _login_ page, which will allow you to authenticate with a HomeAway CAS user:

[https://localhost:3443/login](https://localhost:3443/login)
	
when that link is clicked, the user is redirected to the CAS server to authenticate - once the user has authenticated and approved the requesting application, a redirect is issued to the _Express Demo_ application, passing it an authentication ticket, at which point the application makes a final call back to the oauth endpoint to get an OAuth token, which it then stores in a cookie for use on subsequent API calls.

To demonstrate an API call, access the Listing Details API call:

[https://localhost:3443/listing/100000](https://localhost:3443/listing/100000)
# ace

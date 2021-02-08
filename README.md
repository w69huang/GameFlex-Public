# GameFlex
FYDP / Capstone University of Waterloo<br>
Electrical and Computer Engineering 2021<br><br>
Zachary Walford, Kristopher Sousa, Jackson Barr, William Huang<br>

----

## Pre Setup

    git pull
    npm install -g npm 

### Install MongoDB 
- For Ubuntu see: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/
    - WSL: https://stackoverflow.com/questions/62495999/installing-mongodb-in-wsl
    - if the IPC fails: https://stackoverflow.com/questions/46673717/gpg-cant-connect-to-the-agent-ipc-connect-call-failed
- For Windows: go to MongoDB website and install it as a service
- For MAC: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/
    - 

### Run MongoDB
On WSL:<br>

    sudo service mongod start

On MAC: <br>

    brew services start mongodb-community@4.4
<br>
    brew services stop mongodb-community@4.4



## Backend
### Setup
    cd backend
    npm install
    npm install -g nodemon

### Run 
    nodemon app.js


## Front End
### Setup
Note: Close vscode if you're running it from Ubuntu (WSL) and run `killall node`

    cd frontend
    npm install

    npm install -g @angular/cli


### Run
    ng serve

### Generate Component and other info on Angluar cli
https://cli.angular.io/

## My SQL:

## Creating a connection with MySQL:

### Initialize a DB:
We are using mySQL 8.0+
Create a database as we did in ECE 356:

- Open up terminal and start up mysql

- If you had an existing server and enabled passwords but for got, you will have to reinitialize your server. For mac, this is using system preferences, for other devices, im not sure. 

- Log in as root and create a new user with: CREATE USER 'newuser'@'%' IDENTIFIED BY 'user_password';

- Create the DB with: CREATE {name-of-db};

- Grant ur user with permissions on the database: GRANT ALL PRIVILEGES ON database_name.* TO 'database_user'@'%';

### Checking if the mysql server connected successfully:
First make sure to install the mySQL module using:
cd .../FYDP_Project/backend
npm init -y
npm install mysql

Go into the mysql.js file inside of ../backend/database/mysql.js

Change the user, password, and database fields to the values you you created on your own local mysql server. CHANGE NOTHING ELSE!

To confirm that ur connection works, start the backend server with nodemon app.js and confirm that you see "Connected!" printed on your console.


### How to create requests for the SQL server:
In order to make a call to the SQL server, you first establish a connection to the server on the node js side as shown above, and then create a new model and set up a base for what the model object holds as well as what functions you want this model to be able to perform. These functions are what will turn into requests further on. **NOTE:** Examples can be found inside of the mysql.test files.

The key part of this is mysql_connection.query() function. Whatever is inside of the brackets is what we are sending to the database.

Once the model is created and the functions are finalized, we can move onto the controller found inside of the controller folder. What this is for is to check if the parameters passed to the request match what is required and acts as a middleman between the model and the route. 

Lastly, the routes are just the type of CRUD calls that are made to perform the functions defined inside of the model. Simple as that. 

Inside of app.js, the mysqlapp.use("base url", "routes") allows us to automatically import all the routes created inside of the routing file and place a base url infront if needed. Also, make sure to call the **mysqlapp** refererence as the **app** reference to express is for mongodb. 

This works for select statments, inserts, etc. Make sure to surround char strings inside of " " and not ' ' as strings encompassed inside of ' ' refer to variables and not strings.  


### How To make Requsts to mySQL:

In order to make the requests to the mySQL server, download Post Man at the link below: 
https://www.postman.com/

Once installed, select **Create a Request** and choose which type of CRUD call you want to test. Type in the url as http://localhost:5000/<whatever your endpoint is>
If the request your making is one that requires a parameter to be passed to it, then select the **Body** header and make sure **x-www-form-urlencoded** is selected. Then add the key and value pairs of the parameters you are sending. For example, inside of the test.create model function, I create a new test object and pass its variables in as the columns of the respective table. My keys in this case would be userid, username, password, and email. Then the values can be whatever you want as long as the type is the same.

To confirm that this works, once you press the send button, the response section should show you json for a 200 code. If not, something went wrong so ask for some help! :) 

Additionally after starting up the front and backend (making sure the SQL instance is running on GCP), go to localhost:4200/dummy to test the database and see how they work. The code for these requests and such can be found in the following files:
- ../frontend/src/app/dummy
- ../backend/database/models/mysql.test.model.js
- ../backend/database/mysql.js
- ../backend/controller/mysql.test.controller.js
- ../backend/app.js

### Closing a connection. 
It is good practice to make sure that a connection is closed once you are done using it. To do this, just call:

connection.end((err) => {
    // The error is just to make sure we can log stuff is something fails.
});


## Remote mySQL and MongoDB servers:

### MySQL:

To start the mySQL server, log onto the GCP console and select the **_SQL_** option in the side bar. Click on gcp-gameflex-sql and then select **_Start_** from the triple dot beside **_Overview_**. Wait a couple seconds and it should be up. The public IP Address should be used to replace **_localhost_** inside the connection code.

Currently only one user exists:
- **User**: #####
- **Password**: #####

### MongoDB: 

Similar to the mySQL server, select the **_Compute Engine_** from the side bar and click the box beside **_gameflex-mongodb-arbiters-vm-0_** and  **_gameflex-mongodb-servers-vm-0_** to select them. Press the play button beside VM Instances. Wait a couple seconds and it should be up. The external IP of **_gameflex-mongodb-servers-vm-0_** should be what is used to replace **_127.0.0.1_** inside the connection code.

#### Peer JS:
The peer JS server is also here. To install peerjs locally on ur user:
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash

    nvm install node

    npm install peerjs -g


## Live Demo:

### VM Startup:
To start up the live demo, check that the VM instances **_gameflex_frontend_**  and **_gameflex-mongodb-servers-vm-0_** are running. Then SSH into the mongo VM with the ssh button and type in ./startup.sh which will run the peerjs in that terminal. 

Then you want to SSH into the frontend VM and go to my profile (w69huang) by typing:
    1. cd ..
    2. cd w69huang
Here, you should see multiple folders, but you should CD into **_FYDP_Project_** and into **_backend_**. Start the backend service as normal. If it doesn't start, check the Possible Issues section at the bottom.

After that, open up a new tab and then enter in the external IP of the frontend VM (104.155.129.45) as the url. If it just automatically closes your new tab when you go to that, then go to google.com first then enter in the IP of the VM (I'm guessing it has something to do with security settings on the browser).
This should direct you to the frontend page, but if it doesn't take a screenshot of the issue and direct it to Will. 

### Frontend Code:
The code for the application isn't exactly the same code as what we manage and change. You first have to go to the .../FYDP_Project/frontend/ directory on your local machine and then type in:

    ng build --prod

This will build a new dist/ folder. The contents of FYDP_Project/frontend/dist/frontend/* will contain the files that we use with apache to load in the webpage we see on 104.155.129.45. After we have these files, we want to SCP them into the VM into: 

    /var/www/html 

**_NOTE:_**: The SCP can be done using the gcloud console on your local machine. The command should be:

    sudo gcloud compute scp --recurse <Wherever the FYDP_Project is WRT where you currently are>/frontend/dist/frontend/* 104.155.129.45:/var/www/html/ --zone us-central1-a

**_NOTE2:_**:Alternatively, you can do this on the VM, but will have to install the angular CLI (see Possible Issues at the bottom). You can then do the following:
    1. cd /var/www/html
    2. sudo rm * 
    3. cd to the frontend in the profile: w69huang
    4. ng build --prod 
    5. cd into frontend/dist/frontend/
    6. sudo cp * /var/www/html

After doing that, you should restart the apache server to ensure that these are updated.

    sudo systemctl restart apache2

Then the new pages should show up no problem. If this is not the case, once again take a screenshot of the issue and then send it over to Will. :) 

### Backend Code:

When creating more backend code and new endpoints, we want to make sure we add a proxy to catch requests sent to port 80 (for http requests) and then determine whether or not it's a Mongo call or a MySQL call. To do this, you want to do the following:

    1. cd /etc/apache2/
    2. sudo vim apache2.conf
    3. Scroll all the way down
    4. Determine if the new backend code is for MySQL or Mongo and find what the common route is. E.g. for user calls, every request beings with 104.155.129.45/user/... with /user/ being the common route.
    5. Create two new lines where port if 5000 for MySQL and 3000 for Mongo:
        i. ProxyPass /<common-route>/ http://localhost:<port>/<common-route>/
        ii. ProxyPassReverse /<common-route>/ http://localhost:<port>/<common-route>/
    6. Restart apache2 using:
        sudo systemctl restart apache2


# MAJOR THINGS TO LOOK OUT FOR

    1. When adding a new batch of endpoints to the SQL server, make sure to give them all a common starting url. For example:
        http//.../user/{Whatever endpoint}
    This makes it easier for us to reroute the endpoints on the VM. This isn't a problem with the mongo endpoints since i've allowed them to take the default "http//.../" so the only thing to look out for is that we don't have common url between mongo and SQL.   

    2.

## Possible Issues:
    1. If the console tells you that there is no peerjs command, run the following lines in the terminal:
        - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
        - nvm install node -g
        - npm install peerjs -g

    Use sudo to install if it doesn't work.
    
    2. When starting up the backend service, if you encounter that you don't have npm installed, run the following lines:
        - curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
        - nvm install node -g
        - npm install
        - npm install -g nodemon
        - npm install
        - npm install -g @angular/cli
    Use sudo to install if doesn't work

    3. If the frontend on 104.155.129.45 doesn't match what is inside of /var/www/html, you can either hard reset your browser or clear your browser's cache through History -> Clear Cache. 

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

### Closing a connection. 
It is good practice to make sure that a connection is closed once you are done using it. To do this, just call:

connection.end((err) => {
    // The error is just to make sure we can log stuff is something fails.
});

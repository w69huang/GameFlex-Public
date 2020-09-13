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

### Run MongoDB
On WSL:<br>

    sudo service mongod start


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

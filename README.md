// => Rung next command lines to install mongoDb - nodejs - npm and project dependencies
---------------------------------------------------
#Instakk MongoDB
  => sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
  => echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
  => sudo apt-get update
  => sudo apt-get install -y mongodb-org
  => sudo apt-get install -y mongodb-org=3.6.2 mongodb-org-server=3.6.2 mongodb-org-shell=3.6.2 mongodb-org-mongos=3.6.2 mongodb-org-tools=3.6.2
  =>sudo service mongod start

# install nodejs v9.x
  => curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
  => sudo apt-get update
  => sudo apt-get install -y nodejs

# install npm
  sudo npm install

# install dependencies
  => sudo npm install

#!/bin/bash
# chmod 755 startNetwork.sh

export COMPOSER_ROOT=./blockchain
cd $COMPOSER_ROOT/fabric-dev-servers
./startFabric.sh

composer network deploy -a ../perishable-network.bna -A admin -S adminpw -c PeerAdmin@hlfv1 -f networkadmin.card
composer-rest-server -c admin@perishable-network -n always

#cd $COMPOSER_ROOT
#./ngrok http 3000
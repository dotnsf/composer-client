//. hyperledger-client.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ../../Downloads/my-simple-network.bna -i PeerAdmin -s secret


const NS = 'me.juge.sample';
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;

const HyperledgerClient = function() {
  var vm = this;
  vm.businessNetworkConnection = null;
  vm.businessNetworkDefinition = null;

  vm.prepare = (resolved, rejected) => {
    if (vm.businessNetworkConnection != null && vm.businessNetworkDefinition != null) {
      resolved();
    } else {
      console.log('HyperLedgerClient.prepare(): create new business network connection');
      vm.businessNetworkConnection = new BusinessNetworkConnection();
      const connectionProfile = 'hlfv1';
      const businessNetworkIdentifier = 'my-simple-network';
      const participantId = 'PeerAdmin';
      const participantPwd = 'secret';
      return vm.businessNetworkConnection.connect(connectionProfile, businessNetworkIdentifier, participantId, participantPwd)
      .then(result => {
        vm.businessNetworkDefinition = result;
        resolved();
      }).catch(error => {
        console.log('HyperLedgerClient.prepare(): reject');
        rejected(error);
      });
    }
  };

  vm.updateParticipantTx = (participant, resolved, rejected) => {
    vm.prepare(() => {
      let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'UpdateMyParticipantTx');
      transaction.participantId = participant.participantId;
      transaction.newFirstName = participant.firstName;
      transaction.newLastName = participant.lastName;
      transaction.newCompanyName = participant.companyName;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.UpdateMyParticipantTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteParticipantTx = (participantId, resolved, rejected) => {
    vm.prepare(() => {
      let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'DeleteMyParticipantTx');
      transaction.participantId = participantId;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.DeleteMyParticipantTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.updateAssetTx = (asset, resolved, rejected) => {
    vm.prepare(() => {
      let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'UpdateMyAssetTx');
      transaction.assetId = asset.assetId;

      //. Reference は Relationship を使って指定
      var n = asset.owner.indexOf( '#' );
      var participantId = asset.owner.substring( n + 1 );
      transaction.newOwner = factory.newRelationship( NS, "MyParticipant", participantId );

      transaction.newName = asset.name;

      //. DateTime 型の場合、
      //transaction.newCreated = asset.created;
      var dt = new Date();
      dt.setTime( Date.parse( asset.created ) );
      transaction.newCreated = dt;

      transaction.newPrice = asset.price;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.UpdateMyAssetTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.deleteAssetTx = (assetId, resolved, rejected) => {
    vm.prepare(() => {
      let currentDate = new Date();
      let factory = vm.businessNetworkDefinition.getFactory();
      let transaction = factory.newTransaction(NS, 'DeleteMyAssetTx');
      transaction.assetId = assetId;
      return vm.businessNetworkConnection.submitTransaction(transaction)
      .then(result => {
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.DeleteMyAssetTx(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getParticipant = (participantId, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.MyAsset')
      .then(registry => {
        return registry.resolve(participantId);
      }).then(participant => {
        resolved(participant);
      }).catch(error => {
        console.log('HyperLedgerClient.getParticipant(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAllParticipants = ( resolved, rejected ) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getParticipantRegistry(NS + '.MyParticipant')
      .then(registry => {
        return registry.getAll();
      })
      .then(participants => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        var result = [];
        participants.forEach(participant => {
          result.push(serializer.toJSON(participant));
        });
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.getAllParticipants(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAsset = (assetId, resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.MyAsset')
      .then(registry => {
        return registry.resolve(assetId);
      }).then(asset => {
        resolved(asset);
      }).catch(error => {
        console.log('HyperLedgerClient.getAsset(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.getAllAssets = (resolved, rejected) => {
    vm.prepare(() => {
      return vm.businessNetworkConnection.getAssetRegistry(NS + '.MyAsset')
      .then(registry => {
        return registry.getAll();
      })
      .then(assets => {
        let serializer = vm.businessNetworkDefinition.getSerializer();
        var result = [];
        assets.forEach(asset => {
          result.push(serializer.toJSON(asset));
        });
        resolved(result);
      }).catch(error => {
        console.log('HyperLedgerClient.getAllAssets(): reject');
        rejected(error);
      });
    }, rejected);
  };

  vm.queryAssetsByPrice = (condition, resolved, rejected) => {
    if ( condition.priceFrom > 0 && condition.priceTo > condition.priceFrom ) {
      vm.prepare(() => {
        // let query = vm.businessNetworkConnection.buildQuery('SELECT me.juge.sample.MyAsset');
        let params = {
          priceFrom: condition.priceFrom,
          priceTo: condition.priceTo
        };
        return vm.businessNetworkConnection.query('ASSETS_BY_PRICE', params)
        .then(assets => {
          let serializer = vm.businessNetworkDefinition.getSerializer();
          var result = [];
          assets.forEach(asset => {
            result.push(serializer.toJSON(asset));
          });
          resolved(result);
        }).catch(error => {
          console.log('HyperLedgerClient.query(): reject');
          rejected(error);
        });
      }, rejected);
    } else {
      // use getAll instead of query (TODO: implement filtering)
      vm.getAllAssets(resolved, rejected);
    }
  };

  vm.queryAssetsByCompanyName = (condition, resolved, rejected) => {
    if ( condition.companyName ) {
      vm.prepare(() => {
        // let query = vm.businessNetworkConnection.buildQuery('SELECT me.juge.sample.MyAsset');
        let params = {
          companyName: condition.companyName
        };
        return vm.businessNetworkConnection.query('ASSETS_BY_COMPANYNAME', params)
        .then(assets => {
          let serializer = vm.businessNetworkDefinition.getSerializer();
          var result = [];
          assets.forEach(asset => {
            result.push(serializer.toJSON(asset));
          });
          resolved(result);
        }).catch(error => {
          console.log('HyperLedgerClient.query(): reject');
          rejected(error);
        });
      }, rejected);
    } else {
      // use getAll instead of query (TODO: implement filtering)
      vm.getAllAssets(resolved, rejected);
    }
  };
}

module.exports = HyperledgerClient;

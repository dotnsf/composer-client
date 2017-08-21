//. app.js

//. Run following command to deploy business network before running this app.js
//. $ composer network deploy -p hlfv1 -a ./my-simple-network.bna -i PeerAdmin -s secret

var express = require( 'express' ),
    cfenv = require( 'cfenv' ),
    multer = require( 'multer' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    app = express();
var appEnv = cfenv.getAppEnv();

const HyperledgerClient = require( './hyperledger-client' );
const client = new HyperledgerClient();

app.use( multer( { dest: './tmp/' } ).single( 'file' ) );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.get( '/', function( req, res ){
  var template = fs.readFileSync( __dirname + '/public/index.ejs', 'utf-8' );
  res.write( ejs.render( template, {} ) );
  res.end();
});


app.get( '/participants', function( req, res ){
  client.getAllParticipants( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/participant', function( req, res ){
  var participantId = req.query.participantId;

  client.getParticipant( participantId, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.post( '/participant', function( req, res ){
  var participantId = req.body.participantId;
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var companyName = req.body.companyName;
  var participant = { participantId: participantId, firstName: firstName, lastName: lastName, companyName: companyName };

  client.updateParticipantTx( participant, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.delete( '/participant', function( req, res ){
  var participantId = req.body.participantId;

  client.deleteParticipantTx( participantId, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/assets', function( req, res ){
  client.getAllAssets( result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/asset', function( req, res ){
  var assetId = req.query.assetId;

  client.getAsset( assetId, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.post( '/asset', function( req, res ){
  var assetId = req.body.assetId;
  var participantId = req.body.participantId;
  var name = req.body.name;
  var created = req.body.created;
  var price = req.body.price;
  //. K.Kimura(2017/Aug/18) How to specify owner??
  var asset = { assetId: assetId, owner: "resource:me.juge.sample.MyParticipant#" + participantId, name: name, created: created, price: price };

  client.updateAssetTx( asset, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.delete( '/asset', function( req, res ){
  var assetId = req.body.assetId;

  client.deleteAssetTx( assetId, result => {
    res.write( JSON.stringify( { status: 'ok' }, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

app.get( '/queryAssetsByPrice', function( req, res ){
  var priceFrom = parseInt( req.query.priceFrom );
  var priceTo = parseInt( req.query.priceTo );
  var condition = { priceFrom: priceFrom, priceTo: priceTo };

  client.queryAssetsByPrice( condition, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});

/*
 * Can not query with Relationships
 *
app.get( '/queryAssetsByCompanyName', function( req, res ){
  var companyName = req.query.companyName;
  var condition = { companyName: companyName };

  client.queryAssetsByCompanyName( condition, result => {
    res.write( JSON.stringify( result, 2, null ) );
    res.end();
  }, error => {
    res.write( JSON.stringify( error, 2, null ) );
    res.end();
  });
});
*/


var port = appEnv.port || 3000;
app.listen( port );
console.log( "server starting on " + port + " ..." );



var builder = require('botbuilder');
var restify = require('restify');

//restify
var server  = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function(){
    console.log('%s desplegado en %s ', server.name, server.url);
});

//bot Service
var appId = "492a0959-cee3-469c-bb1f-20408e0b8bb4";
var appPassword = "Kr%;k@n0Q7ydRbzA";


//bot
var connector = new builder.ChatConnector({
    appId: appId,
    appPassword: appPassword
});

server.post('/api/messages' , connector.listen());
/*
var bot = new builder.UniversalBot(connector , (session, args, next) => {
    session.send("Hola desde ObinOne");
});*/

var bot = new builder.UniversalBot(connector);

var luisAppId = "83ad2c37-27b4-485e-8030-2485e1496f6c";
var luisAPIKey = "c673852f688d4ff28cecd643ae0a6ccf";
var luisAPIHost = "eastus.api.cognitive.microsoft.com";

const luisUrl = "https://" + luisAPIHost + "/luis/v2.0/apps/" + luisAppId + "?subscription-key=" + luisAPIKey; 

var recognizer = new builder.LuisRecognizer(luisUrl);
var intents = new builder.IntentDialog({
    recognizers: [recognizer]
});

bot.dialog('/', intents);

intents.matches('Saludos', (session, args, next) => {
    session.send("Hola Soy ObiOne, tu broker online. Como te puedo ayudar?")
});

var polizas = [
    "SOAT Fisico",
    "SOAT Digital",
    "Poliza Vehicular",
    "Poliza de Salud",
    "Seguro Domiciliario"
]

intents.matches('ListaPolizas', (session, args, next) =>{
    session.send("Estas son los prodcutos que Rimac te ofrece: \n\n" + polizas.join("\n\n"));
});

intents.matches('ComprarPolizas', [(session, args, next) => {
    console.log(JSON.stringify(args));

    var polizaEntity = args.entities.filter(e => e.type == "polizas");
    var numeroEntity = args.entities.filter(e => e.type == "builtin.number");

    if(polizaEntity.length > 0){
        session.userData.poliza = polizaEntity[0].resolution.values[0];
    } else {
        delete session.userData.poliza;
    }

    if(numeroEntity.length > 0){
        session.userData.nroPol = numeroEntity[0].resolution.value;
    } else {
        delete session.userData.nroPol;
    }

    if(!session.userData.poliza){
        session.beginDialog('getPoliza');
    } else {
        next();
    }
}, (session, args, next) => {

    if(!session.userData.nroPol){
        session.beginDialog('getNroPol');
    } else {
        next();
    }

}, (session, args, next) => {
    session.send(" Listo!, Tu has comprado " + session.userData.nroPol + " productos " + session.userData.poliza + ". Todo va estar Bien!");
}]);

bot.dialog('getPoliza', [(session, args, next) => {
    builder.Prompts.choice(session,'Que poliza te gustaria comprar?', polizas);
}, (session, results) => {
    session.userData.poliza = results.response.entity;
    session.endDialogWithResult(results);
}]);

bot.dialog('getNroPol', [(session, args, next) => {
    builder.Prompts.number(session, 'Perfecto, Cuantas polizas compraras?');
}, (session, results) => {
    session.userData.nroPol = results.response;
    session.endDialogWithResult(results);
}]);














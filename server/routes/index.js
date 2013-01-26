var UUID = require('node-uuid')
  , http = require('http')
  , path = require('path')
  , request = require('request')
  , UUID = require('node-uuid')
  , log = require('nodeutil').logger.getInstance()
  , q = require("querystring")
  , voice = require('../lib/voice')
  , uuids = {};

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('/index.html');
};

exports.voice = function(req, res){
  var uuid = UUID.v1();
  log.debug('voice>>>>>body');
  log.debug(req.body);
  log.debug('>>>>>uuids');
  log.debug(uuids);
  console.log('hello==========');
  console.log(req.params);
  if(req.params.text) {
    uuids[uuid] = req.params.text;
    if(!req.params.UrlOnly) {
      log.debug('Apply HTML result...');
      var html = '<audio controls="controls" autobuffer="autobuffer" autoplay="autoplay"> <source src="/tts/' + uuid + '" /> </audio>'
      console.log(html);

      res.end(html);
    } else {
      log.debug('Apply url only...');
      res.end('/tts/' + uuid);
    }
  } else {
    res.end('No text input...');
  }
};

exports.getTTS = function(req, res){
  var uuid = req.params.id
    , text = uuids[uuid];
  //rempve the item from uuids
  delete uuids[uuid];
  log.debug('Got text: %s from uuid:%s', text, uuid);
  if(!text) {
    //TODO: show a commond voice for present ?
    res.end('No text input...');
  } else {
    voice.getVoice(text, function(wavurl){
      if(wavurl) {
        //res.redirect(wav);
        //req.pipe(request(wavurl));
        log.info('Request resource:%s', wavurl);
        request.get(wavurl).pipe(res);
      } else
        res.end('Error voice...');
    });
  }
};

function getVoiceURI(req, res) {
  voice.getVoice(req.params.text, function(wavurl){
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end({
        wavurl:wavurl,
        text: req.params.text
      });
  })
}
exports.getVoiceURI = getVoiceURI;

//Process the sample route
//Will render using layout ejs/layout.ejs, and bind page ejs/sample.ejs
exports.sampleGet = function(req, res){
        var user = req.params.user; //Using req.params to get the route define params
        var id = req.params.id;
        var form_input = req.body.form_input;

  res.render('sample', { title: 'Express', user: user, id: id, form_input: form_input });
}













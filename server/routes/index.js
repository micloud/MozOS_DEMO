var UUID = require('node-uuid')
  , http = require('http')
  , path = require('path')
  , request = require('request')
  , UUID = require('node-uuid')
  , log = require('nodeutil').logger.getInstance()
  , q = require("querystring")
  , voice = require('../lib/voice')
  , uuids = {}
  , soap = require('soap')
  , url = 'http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl'
  , _args = {
    accountID: 'moz',
    password: 'moz1234',
    TTStext: 'HELLO',
    TTSSpeaker:'Bruce',
    volume:'50',
    speed:'5',
    outType:'wav'
  };

exports.voice = function(req, res){
  var uuid = UUID.v1();
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

exports.retrieveVoice = function(req, res){
  var uuid = req.params.id
    , text = uuids[uuid];
  //rempve the item from uuids
  delete uuids[uuid];
  log.debug('Got text: %s from uuid:%s', text, uuid);
  if(!text) {
    res.end('No text input...');
  } else {
    getVoice('you input a ' + text + ' to do', function(wavurl){
      if(wavurl) {
        log.info('Request resource:%s', wavurl);
        request.get(wavurl).pipe(res);
      } else
        res.end('Error voice...');
    });
  }
};

/**
 * Connect voice services
 */
function getVoice(txt, cb) {
  var args = _args;
  _args.TTStext = txt;
  soap.createClient(url, function(err, client) {
      client.ConvertText(args, function(err, result) {
          if(err) log.error(err);
          log.debug(result);
          var convertId = result.Result.split('&')[2];
          log.debug('convertId='+ convertId);
          if(result.Result.split('&')[0] == 0 && convertId) {
            var t = 100;
            var wav;
            var fn = function(){
              client.GetConvertStatus({
                accountID: _args.accountID,
                password: _args.password,
                convertID:convertId
              }, function(err2, result2){
                if(err2) log.error(err2);
                if(result2 && result2.Result && result2.Result.split('&')[0] == 0) {
                  log.debug(result2);
                  if(result2.Result.split('&')[3] == 'completed') {
                    wav = result2.Result.split('&')[4];
                    cb(wav);
                  } else {
                    fn();
                  }
                } else {
                  log.error('client.GetConvertStatus error, result=%s', result2);
                  cb(null);
                }
              });
            };

            fn();
          } else {
            log.error('client.ConvertText error, result=%s', result);
            cb(null);
          }
      });
  });
}


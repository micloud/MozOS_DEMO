var soap = require('soap')
  , exec = require('child_process').exec
  , log = require('nodeutil').logger.getInstance()

var url = 'http://tts.itri.org.tw/TTSService/Soap_1_3.php?wsdl';
var _args = {
  accountID: 'alvin',
  password: '246800',
  TTStext: 'HELLO',
  TTSSpeaker:'Bruce',
  volume:'50',
  speed:'5',
  outType:'wav'
};

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
                  cv(null);
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
exports.getVoice = getVoice;

/* Executing example
getVoice('Hello', function(wav){
  exec('wget ' + wav, function(err, stdo, stde){
    if(err) console.log(err);
    console.log('>>>>>>>');
    console.log(stdo);
    console.log('>>>>>>>');
    console.log(stde);
  });
}); 
*/

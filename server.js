var cheerio = require('cheerio');
var express = require('express');
var request = require('request');

var constantes = {
	url : 'http://seguimientoweb.correos.cl/ConEnvCorreos.aspx'
}

function getTrackingInfo(trackingNumber){
	console.log(constantes.url);
	return new Promise(function(resolve, reject){
		request.post(constantes.url, function(error, response, body){
			var $ = cheerio.load(body);
			var entradas = [];
			cheerio.load($('.tracking').html())('tr').each(function(){
				var entrada = { 
					'estado' : $(this).children('td').eq(0).text().trim(),
					'fecha' : $(this).children('td').eq(1).text().trim(),
					'lugar' : $(this).children('td').eq(2).text().trim()
				};
				if (entrada.estado)
					entradas.push(entrada);
			});
			// console.log(entradas);
			var keys = [];
			var values = [];
			$('.datosgenerales td').each(function(a){
				if (a % 2 == 0){
					keys.push($(this).text().trim().replace(' ', '_'));
				}else{
					values.push($(this).text().trim());
				}
			});
			var datosgenerales = {};
			keys.map(function(k,index){
				datosgenerales[k] = values[index];
			})
			resolve({
				'datosgenerales' : datosgenerales,
				'registros' : entradas
			});
		}).form({
            obj_key: 'Cor398-cc',
            obj_env: trackingNumber
        });
	});
}







//##########################     EXPRESS     #########################

var app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/:id', function (req, res) {
	if (isNaN(req.params.id)){
		res.send('el identificador de seguimiento tiene que ser un número');
	}
	else{
		getTrackingInfo(req.params.id).then(function(r){
			res.send(r);
		});
	}
});

var port = Number(process.env.PORT || 3003);

var server = app.listen(port, function (error) {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});







var cheerio = require('cheerio');
var express = require('express');
var request = require('request');

const constantes = { url : 'http://seguimientoweb.correos.cl/ConEnvCorreos.aspx' }
var port = Number(process.env.PORT || 3003);

function getTrackingInfo(trackingNumber){

	console.log(constantes.url);
	return new Promise(function(resolve, reject){
		
		request.post(constantes.url, function(error, response, body){
			
			var $ = cheerio.load(body);
			var entradas = [];
			var keys = [];
			var values = [];
			var datosgenerales = {};
			console.log('Llegó la respuesta de correos De Chile');
			if ($('.envio_no_existe').text()) {
				
				console.log($('.envio_no_existe').text());
				resolve('El numero de seguimiento no existe');
				return;

			}

			cheerio.load($('.tracking').html())('tr').each(function(){

				var entrada = { 
					'estado' : $(this).children('td').eq(0).text().trim(),
					'fecha' : $(this).children('td').eq(1).text().trim(),
					'lugar' : $(this).children('td').eq(2).text().trim()
				};
				if (entrada.estado)

					entradas.push(entrada);

			});
			$('.datosgenerales td').each(function(a){

				if (a % 2 == 0)

					keys.push($(this).text().trim().replace(' ', '_'));

				else

					values.push($(this).text().trim());

			});
			keys.map(function(k, index) {

				datosgenerales[k] = values[index];

			})
			resolve({'datosgenerales' : datosgenerales, 'registros' : entradas});

		}).form({

			obj_key: 'Cor398-cc',
			obj_env: trackingNumber

		});

	});
	
}







//##########################		 EXPRESS		 #########################

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

	getTrackingInfo(req.params.id).then(function(r){

		res.send(r);
	
	});

});

var server = app.listen(port, function (error) {

	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);

});

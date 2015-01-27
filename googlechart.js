/**
 * Copyright 2014 Urbiworx
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var RED = require(process.env.NODE_RED_HOME+"/red/red");
var util = require("util");
var urllib = require("url");
var mustache = require("mustache");

var cors = require('cors');

function GoogleChartReply(n) {
	RED.nodes.createNode(this,n);
	this.on("input",function(msg) {
			if (msg.res) {
				if (msg.headers) {
					msg.res.set(msg.headers);
				}
				var statusCode = msg.statusCode || 200;
				var response="";
				response+='{"cols": [';
				for (var i=0;i<msg.attribs.length;i++){
						response+='{"id":"","label":"'+msg.attribs[i].name+'","pattern":"","type":"'+msg.attribs[i].type+'"}'+((i!=msg.attribs.length-1)?",":"");
				}
				response+='],';
				response+='"rows": [';
				for (var i=0;i<msg.payload.length;i++){
					response+='{"c":[';
						for (var j=0;j<msg.attribs.length;j++){
							var obj=msg.payload[i][msg.attribs[j].name];
							if (msg.attribs[j].type=="date"){
								response+='{"v":"'+obj.toJSON()+'","f":null}';
							} else if (msg.attribs[j].type=="string"){
								response+='{"v":"'+obj+'","f":null}';
							} else {
								response+='{"v":'+obj+',"f":null}';
							}
							if (j<msg.attribs.length-1){
								response+=",";
							}
						}
					response+="]}";
					if (i<msg.payload.length-1){
						response+=",";
					}
				}
				response+="]";
				response+="}";
				msg.res.send(statusCode,response);
				/*if (typeof msg.payload == "object" && !Buffer.isBuffer(msg.payload)) {
					msg.res.jsonp(statusCode,msg.payload);
				} */
			} else {
				node.warn("No response object");
			}
		});
}
function GoogleChart(n) {
	RED.nodes.createNode(this,n);
		this.path = n.path.trim();
	this.charttype = n.charttype.trim();
	this.attribs = n.attribs;
	var that=this;
		if (RED.settings.httpNodeRoot !== false) {
				var node = this;

				this.errorHandler = function(err,req,res,next) {
						node.warn(err);
						res.send(500);
				};

				this.callback = function(req,res) {
			if (urllib.parse(req.url, true).query.data=="true"){
				node.send({req:req,res:res,charttype:that.charttype,attribs:that.attribs,payload:{}});
			} else {
				res.end('<html>'+
								'<head>'+
								'<!--Load the AJAX API-->'+
								'<script type="text/javascript" src="https://www.google.com/jsapi?autoload={\'modules\':[{\'name\':\'visualization\',\'version\':\'1\',\'packages\':[\'annotationchart\']}]}"></script>'+
								'<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>'+
								'<script type="text/javascript">'+
								'google.load("visualization", "1", {"packages":["corechart"]});'+
								'google.setOnLoadCallback(drawChart);'+
								'function drawChart() {'+
								'  var jsonData = $.ajax({'+
								'	  url: "'+that.path+'?data=true",'+
								'	  dataType:"json",'+
								'	  async: false'+
								'	  }).responseText;'+
									((that.charttype!=="AnnotationChart")?'setTimeout(function () { drawChart(); }, 60000);\n':'')+
								'  jsonData=jsonData.replace(/(\\r\\n|\\n|\\r)/gm,"").replace(/,[ ]*?\\]/g,"]");\n'+
								'  var jsonDataParsed=JSON.parse(jsonData);\n'+
								'  for (var i=0;i<jsonDataParsed.cols.length;i++){\n'+
								'  	if (jsonDataParsed.cols[i].type.indexOf("date")!=-1){\n'+
								'    for (var j=0;j<jsonDataParsed.rows.length;j++){\n'+
								'       jsonDataParsed.rows[j].c[i].v=new Date(jsonDataParsed.rows[j].c[i].v);\n'+
								'    }\n'+
								'   }\n'+
								'  }\n'+
								'  var data = new google.visualization.DataTable(jsonDataParsed);'+
								'  var chart = new google.visualization.'+that.charttype+'(document.getElementById("chart_div"));'+
								'  chart.draw(data, {width: 800, height: 240});'+
								'}'+
								'</script>'+
								'</head>'+
								'<body>'+
								'<div id="chart_div"></div>'+
								'</body>'+
							'</html>');
				}
				}

				var corsHandler = function(req,res,next) { next(); }

				if (RED.settings.httpNodeCors) {
						corsHandler = cors(RED.settings.httpNodeCors);
						RED.httpNode.options(this.path,corsHandler);
				}
				RED.httpNode.get(this.path,corsHandler,this.callback,this.errorHandler);


				this.on("close",function() {
						var routes = RED.httpNode.routes["get"];
						for (var i = 0; i<routes.length; i++) {
								if (routes[i].path == this.path) {
										routes.splice(i,1);
										//break;
								}
						}
						if (RED.settings.httpNodeCors) {
								var routes = RED.httpNode.routes['options'];
								for (var i = 0; i<routes.length; i++) {
										if (routes[i].path == this.path) {
												routes.splice(i,1);
												//break;
										}
								}
						}
				});


		} else {
				this.warn("Cannot create http-in node when httpNodeRoot set to false");
		}
}
RED.nodes.registerType("chart request",GoogleChart);
RED.nodes.registerType("chart response",GoogleChartReply);


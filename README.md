#Google chart for Node Red
Easily turn your information into google charts using this plugin for Node Red

#Installation
Just install this plugin to your Node Red installation by using npm: "npm install node-red-contrib-googlechart" in your Node Red root directory

#Usage
All you need to know is bundled with the installation: Just drag one of each of the google chart nodes (advanced>chart request and adavanced>chart response) into your graph and read the manual displayed

#Example
```
[{"id":"6c82fa75.937d04","type":"function","name":"","func":"msg.payload=[\n\t{name:'ute',age:20},\n\t{name:'schnute',age:21},\n\t{name:'kasimir',age:25},\n];\nreturn msg;","outputs":1,"x":376,"y":303,"z":"48e4c7b7.b71b38","wires":[["567e8aef.a98174"]]},{"id":"9cf811b5.6307f","type":"chart request","charttype":"ColumnChart","path":"/googlechart","attribs":[{"name":"name","type":"string"},{"name":"age","type":"number"}],"x":160,"y":300,"z":"48e4c7b7.b71b38","wires":[["6c82fa75.937d04"]]},{"id":"567e8aef.a98174","type":"chart response","x":573,"y":297,"z":"48e4c7b7.b71b38","wires":[]}]
```
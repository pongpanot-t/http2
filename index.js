const http2 = require('spdy')
const logger = require('morgan')
const express = require('express')
const app = express()
const fs = require('fs')

app.use(logger('dev'))
app.use(express.static('public'))

const importList = require('./import');
const importHTML = fs.readFileSync('./public/import.html');

const pushy = (req,res,list)=>{

    list.map((row)=>{
        var contentType;
        switch (row.type) {
            case "html":
                contentType = "text/html";
                break;
            case "js":
                contentType = "application/javascript";
        }
        
        const importFile = fs.readFileSync('./public/'+row.path);

        res.push(row.path, 
            {
                status: 200,
                method: 'GET',
                request: {
                    accept: '*/*'
                },
                response: {
                    'content-type':contentType
                }
            }
            ,
            function(err, stream){
                if (err) return;
                stream.end(importFile);
            }
        )
    })

}

app.get('/pushy', (req, res) => {

    pushy(req,res,importList);
    res.end(importHTML)
    
})

var options = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.crt')
}

http2
  .createServer(options, app)
  .listen(8080, ()=>{
    console.log(`Server is listening on https://localhost:8080. You can open the URL in the browser.`)
  }
)
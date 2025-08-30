# http hyper text transfer protocol
## ley word [url,uri,urn]
## what are http headers
metadata :- key value sent along with request and response
caching outhentication, manage state
x-prefix 2012(x-deprecated)
1. request headers -from client
2.response headers - from server
3. representation headers - encoding/compression
4. payload headers - data

## most common headers

: accept- applocation/json
: user-agent
: authorigation
: content- type
: cookie- {}
: cache- control
## cors headers
: access-control allow origin
: access- control allow

## http methods

basic set of operations that can be used to interact with server
. get : retrieve a resource
. head : no message body ( response header only)
. options : what opration are available
. trace : loopback test (get same data)
. delete : remove a resource
. put : replace aresource
. post : interact with resource ( mostly add)
. patch : chang part of a resource

##assignment learn http methods

## http status code
.1 xx informetinal
.2 xx success
.3 xx redirection
.4 xx client error
.5 xx server error

{
  100: continue,102:processing, 200: ok, 201: created, 202: accepted, 307: temperary redirect, 308: permanent redirect, 400: bad request, 401: unauthoriged, 402: payment required, 404: not found, 500: internal server error, 504: gate way time out
}


$(document).ready(function(){
    chrome.storage.sync.get('uid', function(items){
        if (items.uid){
            $('#oex_main').hide('slow');
            $('#oex_timeline').show('slow');
            
        }

    });
});


function connect(e){
    var dbname = document.getElementById('database').value;
    var user = document.getElementById('login').value;
    var passwd = document.getElementById('password').value;
    var server = document.getElementById('server').value;
    var request = new XmlRpcRequest(server+'/xmlrpc/common','login');
    request.addParam(dbname);
    request.addParam(user);
    request.addParam(passwd);
    var response = request.send();
    var uid = response.parseXML();
    uid = parseInt(uid);
    if (typeof uid === 'number' && !isNaN(uid)) {
        chrome.storage.sync.set({'uid': uid, 'dbname':dbname,'user':user,'passwd':passwd,'server':server }, function(){
            
        });
    } else {
        alert('Incorrect Login, check your data again');
    }
    
}
function settings(e){
    $('#oex_main').show('slow');
    $('#oex_timeline').hide('slow');
    chrome.storage.sync.get(['uid','dbname','user','passwd','server'], function(items){
        if (items.dbname) {
            console.log(items.dbname);
            document.getElementById('database').value = items.dbname;
            document.getElementById('login').value = items.user;
            document.getElementById('password').value = items.passwd;
            document.getElementById('server').value = items.server;
        }
    });

}

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('settings').addEventListener('click', settings)
});

document.addEventListener('DOMContentLoaded', function (){
    document.querySelector('button').addEventListener('click', connect)
});

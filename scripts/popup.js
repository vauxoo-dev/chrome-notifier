$(document).ready(function(){
    chrome.storage.sync.get('uid', function(items){
        if (items.uid){
            $('#main').hide();
            $('#timeline').show();
        } else {
            $('#timeline').hide();
            $('#main').show();
        }
    });
});


function connect(e){
    var dbname = document.getElementById('database').value;
    var user = document.getElementById('login').value;
    var passwd = document.getElementById('password').value;
    var server = document.getElementById('server').value;
    var request = new XmlRpcRequest(server,'login');
    request.addParam(dbname);
    request.addParam(user);
    request.addParam(passwd);
    var response = request.send();
    var uid = response.parseXML();
    uid = parseInt(uid);
    if (typeof uid === 'number' && !isNaN(uid)) {
        chrome.storage.sync.set({'uid': uid, 'dbname':dbname,'user':user,'passwd':passwd,'server':server }, function(){
            alert('saved');
        });
    } else {
        alert('Incorrect Login, check your data again');
    }
    
}

document.addEventListener('DOMContentLoaded', function (){
    document.querySelector('button').addEventListener('click', connect)
});

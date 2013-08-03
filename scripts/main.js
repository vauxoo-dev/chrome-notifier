$(document).ready(function(){
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('signIn').addEventListener('click', connect)
});
document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('buttonDb').addEventListener('click', fillListDb)
});

function fillListDb(){
    var server = document.getElementById('hostInputButton').value;
    console.log(server);
    $.xmlrpc({
        url: server+'/xmlrpc/db',
        methodName: 'list',
        params: [],
        success: function(response, status, jqXHR) {
            $('#selectDatabase').append(
                _.map(response[0], function(db){
                    return $('<option>'+db+'</option>');
                })
            );
            $('.alert').hide();
            $('#dbFilledSuccess').toggle();
        },
        error: function(jqXHR, status, error) {
            $('.alert').hide();
            $('#dbFilledError').toggle();
        }
    });    
}

function connect(e){
    /* TODO: Fill this values
    var dbname = document.getElementById('database').value;
    var user = document.getElementById('login').value;
    var passwd = document.getElementById('password').value;
    */
    /*
    var request = new XmlRpcRequest(server+ '/xmlrpc/common','login');
    console.log(server);
    request.addParam(dbname);
    request.addParam(user);
    request.addParam(passwd);
    var response = request.send();
    var uid = response.parseXML();
    uid = parseInt(uid);
    if (typeof uid === 'number' && !isNaN(uid)) {
        chrome.storage.sync.set({'uid': uid, 'dbname':dbname,'user':user,'passwd':passwd,'server':server }, function(){
        $('#oex_main').hide('slow');
        $('#oex_timeline').show('slow');
        });
    } else {
        alert('Incorrect Login, check your data again');
    }
    */
    
}


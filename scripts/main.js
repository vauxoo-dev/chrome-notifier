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
    $('#buttonDb').button('loading');
    $.xmlrpc({
        url: server+'/xmlrpc/db',
        methodName: 'list',
        params: [],
        success: function(response, status, jqXHR) {
            var selectDb = $('#selectDatabase')
            dbs_elements = _.map(response[0], function(db){
                                return $('<option>'+db+'</option>');
                            })
            selectDb.append(dbs_elements);
            console.log(dbs_elements);
            if (dbs_elements.length > 1){
                console.log('Multidb');
            } else {
                console.log('Mono-db');
                selectDb.hide(); 
                $('#dbFilledSuccess').html('<p>Mono db: <b>'+response[0][0]+'</b></p>');
            }
            $('#buttonDb').button('reset');
            $('.alert').hide();
            $('#dbFilledSuccess').toggle();
        },
        error: function(jqXHR, status, error) {
            $('.alert').hide();
            $('#dbFilledError').toggle();
        }
    });    
}

function connect(){
    var e = document.getElementById("selectDatabase");
    var dbname = e.options[e.selectedIndex].text;
    var server = document.getElementById('hostInputButton').value;
    var user = document.getElementById('inputUser').value;
    var passwd = document.getElementById('inputPassword').value;
    chrome.storage.sync.set({'dbname':dbname,
                             'user':user,
                             'passwd':passwd,
                             'server':server },
    function(){ 
        $.xmlrpc({
            url: server+'/xmlrpc/common',
            methodName: 'login',
            params: [ dbname, user, passwd ],
            success: function(response, status, jqXHR) {
                if (typeof  response[0] === 'number' && !isNaN(response[0])) {
                    console.log('User Id' + response[0]);
                    chrome.storage.sync.set({'uid': response[0]});
                    $('#dbFilledSuccess').html('<p>'+dbname+'</p><p>Your are Logged as: <b>'+user+'</b></p>');
                } else {
                    $('#dbFilledError').toggle();
                    $('#dbFilledError').html('<p>Error Login: '+user+'</p>');
                    console.log('Something is wrong with your credentials');
                }
            },
            error: function(response, status, error) {
            }
            });
    });
}


$(document).ready(function(){
    fillListDb();
    connect();
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('signIn').addEventListener('click', connect)
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('buttonDb').addEventListener('click', function(){
        fillListDb();
    });
});


function fillListDb(){
    document.getElementById('hostInputButton').value = localStorage['server'];
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
            } else {
                var e = document.getElementById("selectDatabase");
                dbname = e.options[e.selectedIndex].text;
                if (localStorage['dbname'] === dbname){
                     getSettings();    
                }
                selectDb.hide(); 
                $('#dbFilledSuccess').html('<p>Mono db: <b>'+response[0][0]+'</b></p>');
            }
            $('#buttonDb').button('reset');
            $('.alert').hide();
            $('#dbFilledSuccess').toggle();
        },
        error: function(jqXHR, status, error) {
            document.getElementById('hostInputButton').value = ''; 
            $('.alert').hide();
            $('#dbFilledError').toggle();
        }
    });    
}

function connect(){
    $('#signIn').button('loading');
    var dbname = localStorage['dbname'],
        user = localStorage['user'] ,
        passwd =localStorage['passwd'] ,
        server = localStorage['server']
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
            $('#signIn').button('reset');
        },
        error: function(response, status, error) {
        }
    });
}

function setSettings(){
    var e = document.getElementById("selectDatabase");
    localStorage['dbname'] = e.options[e.selectedIndex].text;
    localStorage['server'] = document.getElementById('hostInputButton').value;
    localStorage['user'] = document.getElementById('inputUser').value;
    localStorage['passwd'] = document.getElementById('inputPassword').value;
}

function getSettings(){
    document.getElementById('hostInputButton').value = localStorage['server'];
    document.getElementById('inputUser').value = localStorage['user'];
    document.getElementById('inputPassword').value = localStorage['passwd'];
}

$(document).ready(function(){
    fillListDb();
    connect();
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('clearSettings').addEventListener('click', function (){
        clearSettings();
    });
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('setSettings').addEventListener('click', function (){
        setSettings();
    });
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('useSettings').addEventListener('click', function (){
        getSettings();
    });
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('buttonDb').addEventListener('click', function(){
        fillListDb();
    });
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('signIn').addEventListener('click', function (){
        setSettings();
        connect();
    });
});

function fillListDb(){
    if (!localStorage['server']){
        var server = document.getElementById('hostInputButton').value;
        localStorage['server'] = server;
    } else { 
        document.getElementById('hostInputButton').value = localStorage['server'];
        var server = localStorage['server'];
    }
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
            $('#buttonDb').button('reset');
        }
    });    
}

function connect(){
    $('#signIn').button('loading');
    var dbname = localStorage['dbname'],
        user = localStorage['user'] ,
        passwd = localStorage['passwd'] ,
        server = localStorage['server']
    $.xmlrpc({
        url: server+'/xmlrpc/common',
        methodName: 'login',
        params: [ dbname, user, passwd ],
        success: function(response, status, jqXHR) {
            if (typeof  response[0] === 'number' && !isNaN(response[0])) {
                localStorage['uid'] = response[0];
                $('#dbFilledSuccess').html('<p>'+dbname+'</p><p>Your are Logged as: <b>'+user+'</b></p>');
            } else {
                $('#dbFilledError').toggle();
                $('#dbFilledError').html('<p>Error Login: '+user+'</p>');
                console.log('Something is wrong with your credentials');
            }
            $('#signIn').button('reset');
        },
        error: function(response, status, error) {
            $('#signIn').button('reset');
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

function clearSettings(){
    delete localStorage['dbname'];
    delete localStorage['server'];
    delete localStorage['user'];
    delete localStorage['passwd'];
        $('#signIn').button('reset');
        $('#buttonDb').button('reset');
}

function getSettings(){
    document.getElementById('hostInputButton').value = localStorage['server'];
    document.getElementById('inputUser').value = localStorage['user'];
    document.getElementById('inputPassword').value = localStorage['passwd'];
}

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('loadMessages').addEventListener('click', function (){
        res = oe_read('project.task',
                      [1,2,3],
                      ['name', 'description'],
                      this.id);
    });
});

/*

Openerp Methods

*/

function taskView(taskObj) {
    var base = $('<div></div>'),
        heading = $('<a></a>'),
        bodyoftask = base,
        allElements = $('<div></div>'),
        tableTW = $('<table></table>')
    heading.addClass('accordion-heading');
    bodyoftask.addClass('accordion-body collapse');
    bodyoftask.attr({
        'id': 'collapse'+taskObj.id
    });
    bodyoftask.css({'height': '0px'});
    heading.attr({
       'data-toggle': "collapse", 
       'data-parent': "#acordion2", 
       'href': "#collapse"+taskObj.id
    });
    heading.text(taskObj.name);
    buttonAct = actionButtons(taskObj);
    bodyoftask.prepend($('<div class="row-fluid"></div>').append(buttonAct));
    bodyoftask.append($('<p></p>').text(taskObj.description));
    tableTW.addClass('table table-condensed table-striped table-bordered');
    tableTW.append("<caption><h5>Task Works</h5></caption><tbody><thead><tr><th>Id</td><th>Details</th><th>Time</th><th>RevId</th></tr></thead></tbody><tbody><tr><td>5</td><td>I did Something</td><td>10/12/2013 10:10:11</td><td>28</td></tr></tbody>");
    bodyoftask.append(tableTW);
    allElements.addClass("accordion-group"); 
    allElements.append(heading, bodyoftask);
    return allElements
}

function actionButtons (taskObj){
    var btnGroup=$("<div class='btn-group span4'></div>"),
        aToggle=$('<a class="btn dropdown-toggle btn-mini" data-toggle="dropdown" href="#"></a>'),
        spanSpace = $('<span class="caret"></span>'),
        buttonContainer = $('<ul class="dropdown-menu"></ul>')
    buttonContainer.attr({
            'id': 'pt' + taskObj.id
        });
    aToggle.text('Actions');
    aToggle.prepend(spanSpace);
    var refreshTask = $('<li><a href="#">Refresh</a></li>'), 
        sendMessage = $('<li><a href="#">Send Message</a></li>'), 
        loadMessages = $('<li><a href="#">Messages</a></li>'),
        loadTW = $('<li><a href="#">Reload</a></li>')
    
    res = btnGroup.append(aToggle, buttonContainer.append(refreshTask, sendMessage, loadTW, loadMessages));
    return res 
}

function oe_read(model, ids, fields, button){
    var forcedIds = $.xmlrpc.force('array', ids)
    var forcedUid = $.xmlrpc.force('int', localStorage['uid'])
    var forcedFields = $.xmlrpc.force('array', fields)
    $("#"+button).button('loading');
    placeHolderAcc = $("#accordion2");
    $.xmlrpc({
        url: localStorage['server']+'/xmlrpc/object',
        methodName: 'execute',
        params: [ localStorage['dbname'],
                  forcedUid,
                  localStorage['passwd'],
                  model,
                  'read',
                  forcedIds,
                  forcedFields],
        success: function(response, status, jqXHR) {
            $("#"+button).button('reset');
            var elements = _.map(response[0], function(e){
                return taskView(e);
            });
            placeHolderAcc.append(elements);
        },
        error: function(response, status, error) {
            $("#"+button).button('reset');
        }
    });
}

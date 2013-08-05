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
        allElements = $('<div></div>')
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
    buttonAct = actionButtons(taskObj),
    bodyoftask.prepend($('<div class="row-fluid"></div>').append(buttonAct));
    bodyoftask.append($('<p></p>').text(taskObj.description));
    bodyoftask.append(getTableTW(taskObj));
    allElements.addClass("accordion-group"); 
    allElements.append(heading, bodyoftask);
    return allElements
}

function getTableTW(taskObj){
    var tableTW = $('<table></table>'),
        tableCaption = $('<caption><h5>Task Works</h5></caption>')
    tableTW.addClass('table table-condensed table-striped table-bordered');
    tableTW.append("<tbody><thead><tr><th>Id</td><th>Details</th><th>Time</th><th>RevId</th>");
    content = $("</tr></thead></tbody><tbody><tr><td>5</td><td>I did Something</td><td>10/12/2013 10:10:11</td><td>28</td></tr></tbody>");
    return tableTW
    
}

function actionButtons (taskObj){
    var btnGroup=$("<div class='btn-group span4'></div>"),
        aToggle=$('<a class="btn dropdown-toggle btn-mini" data-toggle="dropdown" href="#"></a>'),
        spanSpace = $('<span class="caret"></span>'),
        buttonContainer = $('<ul class="dropdown-menu"></ul>')
    buttonContainer.attr({
            'data-resid': taskObj.id,
            //TODO: generalize this object stuff for other things.
            'data-object': 'project.task'
        });
    aToggle.text('Actions');
    aToggle.prepend(spanSpace);
    var refreshTask = $('<li><i class="icon-arrow-down"></i>Refresh</li>'), 
        sendMessage = $('<li><i class="icon-pencil"></i>Send Msg</li>'), 
        loadMessages = $('<li><i class="icon-envelope"></i>>Messages</li>'),
        loadTW = $('<li><i class="icon-info-sign"></i>Reload</li>')
        //Setting actions
 
        refreshTask.click(function(){ actRefreshTask($(this)) });
        sendMessage.click(function(){ actSendMessage($(this)) });
        loadMessages.click(function(){ actLoadMessages($(this)) });
        loadTW.click(function(){ actLoadMessages($(this)) });
    res = btnGroup.append(aToggle, buttonContainer.append(refreshTask, sendMessage, loadTW, loadMessages));
    return res 
}
//TODO: Every action using the data-resid will execute the process using Ajax
//in only the specific element.
function actSendMessage(el){
    console.log('Send MEssage');
    console.log(el.parent().attr('data-resid'));
}

function actLoadMessages(el){
    console.log('Load Messages');
    console.log(el.parent().attr('data-resid'));
}

function actLoadTW(el){
    console.log('Load TW');
    console.log(el.parent().attr('data-resid'));
}

function actRefreshTask(el){
    console.log('Refreshi Tasks');
    console.log(el.parent().attr('data-resid'));
    //console.log(el.parent().parent().attr('data-resid'));
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

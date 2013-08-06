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
            var selectDb = $('#selectDatabase');
            selectDb.html('');
            dbs_elements = _.map(response[0], function(db){
                                return $('<option>'+db+'</option>');
                            });
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
        res = oeReadTask('project.task',
                      [1,2,3],
                      ['name', 'description'],
                      this.id);
    });
});

/*

Openerp Methods

*/

function messageView(taskObj){
    var messageCont = $('<div class="media"></div>'),
        forcedUid = $.xmlrpc.force('int', localStorage['uid']),
        Url = localStorage['server']+'/xmlrpc/object'
        Db = localStorage['dbname'],
        Passwd = localStorage['passwd'],
        forcedFields = $.xmlrpc.force('array',
                       ['id', 'body', 'author_id', 'date',
                        'to_read', 'email_from'])
        forcedIds = $.xmlrpc.force('array', taskObj.message_ids),
    $.xmlrpc({
        url: Url,
        methodName: 'execute',
        params: [ Db,
                  forcedUid,
                  Passwd,
                  'mail.message',
                  'read',
                  forcedIds,
                  forcedFields],
        success: function(response, status, jqXHR) {
            var elements = _.map(response[0], function(e){
                imgCont = $('<a>').attr({
                    "class": "pull-left",
                    "href": "#"
                }).append($('<img>').attr({
                    'class': 'media-object',
                    'src': 'images/img64x64.png'
                }));
                messageText = $('<div class="media-body"><div>');
                messageTitle = $('<h6 class="media-heading"></h6>');
                messageContent = $('<div class="body">').html(e.body);
                messageTitleContent = 'Author: '+e.author_id[1];
                buttonsCont = actionButtonsMessage(taskObj).addClass('row span1');
                return messageCont.append(imgCont,
                              messageText.append(buttonsCont,
                                         messageTitle.text(messageTitleContent),
                                         messageContent))
            });
        },
        error: function(response, status, error) {
        }
    });
//////////
    return messageCont
}

function taskView(taskObj) {
    var base = $('<div></div>'),
        heading = $('<a></a>'),
        bodyoftask = base,
        messagesPlaceholder = $('<div></div>'),
        allElements = $('<div></div>')

    heading.addClass('accordion-heading');
    bodyoftask.addClass('accordion-body collapse');
    bodyoftask.attr({
        'id': 'collapse'+taskObj.id
    });
    messagesPlaceholder.attr({
        'class': 'messages'
    });
    messagesPlaceholder.append(messageView(taskObj));
    bodyoftask.css({'height': '0px'});
    heading.attr({
       'data-toggle': "collapse", 
       'data-parent': "#acordion2", 
       'href': "#collapse"+taskObj.id
    });
    var state = $('<span class="label">').text(taskObj.state);
    var stage = $('<span class="badge badge-info">').text(taskObj.stage_id[1]);

    if (taskObj.state === 'draft'){ state.addClass('label-important'); }
    else if (taskObj.state === 'open') { state.addClass('label-success');}
    else if (taskObj.state === 'done') {state.addClass('label-inverse'); }

    heading.append( $('<i class="icon-chevron-right">'),
                   $('<b>').text(taskObj.id+': '),
                   state,
                   stage,
                   $('<br>'),
                   taskObj.name);
    var buttonAct = actionButtons(taskObj);
    bodyoftask.prepend($('<div class="row-fluid"></div>').append(buttonAct));
    bodyoftask.append($('<p></p>').text(taskObj.description));
    console.log(taskObj.message_ids);
    a = _.map( taskObj.message_ids, function(m){return m});
    bodyoftask.append(getTableTW(taskObj), messagesPlaceholder);
    allElements.addClass("accordion-group"); 
    allElements.append(heading, bodyoftask);
    return allElements
}

function getTableTW(taskObj){
    var containerGlobal = $('<div>');
    var tableTW = $('<table></table>'),
        tableCaption = $('<div class="row-fluid span4"><h5 class="span3">Task Works</h5><i class="icon-plus"></i><i class="icon-minus"></i></div>')
    tableTW.addClass('table table-condensed table-striped table-bordered');
    tableTW.append("<thead><tr><th>Id</th><th>Details</th><th>Time</th><th>User</th></tr></thead>");
    //Searching TW ids and reading them.
    //var forcedIds = $.xmlrpc.force('array', ids)
    var forcedUid = $.xmlrpc.force('int', localStorage['uid']),
        forcedDomain = $.xmlrpc.force('array', [['task_id', '=', taskObj.id]]),
        Url = localStorage['server']+'/xmlrpc/object'
        Db = localStorage['dbname'],
        Passwd = localStorage['passwd'],
        forcedFields = $.xmlrpc.force('array',
                       ['id', 'name', 'user_id', 'date',
                        'hours'])

    $.xmlrpc({
        url: Url,
        methodName: 'execute',
        params: [ Db,
                  forcedUid,
                  Passwd,
                  'project.task.work',
                  'search',
                  forcedDomain],
        success: function(response, status, jqXHR) {
            forcedIds = $.xmlrpc.force('array', response[0]),
            $.xmlrpc({
                url: Url,
                methodName: 'execute',
                params: [ Db,
                          forcedUid,
                          Passwd,
                          'project.task.work',
                          'read',
                          forcedIds,
                          forcedFields],
                success: function(response, status, jqXHR) {
                    var elements = _.map(response[0], function(e){
                        content = $("<tbody><tr><td>"+e.id+"</td><td>"+e.name+"</td><td>"+e.date+"</td><td>"+e.user_id[1]+"</td></tr></tbody>");
                        tableTW.append(content);
                        return e;
                    });
                },
                error: function(response, status, error) {
                }
            });
        },
        error: function(response, status, error) {
        }
    });
    //////////////
    containerGlobal.append( tableCaption, tableTW )
    return containerGlobal
}

function actionButtonsMessage (taskObj){
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
    var answerTask = $('<li><i class="icon-share-alt"></i>Reply</li>'), 
        favoriteMessage = $('<li><i class="icon-star-empty"></i>Fav Msg</li>') 

        // Setting Actions.

        answerTask.click(function(){ actAnswerTask($(this)) });
        favoriteMessage.click(function(){ actFavoriteMessage($(this)) });
    res = btnGroup.append(aToggle,
                          buttonContainer.append(answerTask, favoriteMessage));
    return res
}

function actAnswerTask(taskObj){
}

function actOpenOpenerp(taskObj){
}

function actFavoriteMessage(taskObj){
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
}

function actLoadMessages(el){
}

function actLoadTW(el){
}

function actRefreshTask(el){
}

function oeReadTask(model, ids, fields, button){
    //Searching TW ids and reading them.
    //var forcedIds = $.xmlrpc.force('array', ids)
    var forcedUid = $.xmlrpc.force('int', localStorage['uid']),
        forcedDomain = $.xmlrpc.force('array', [['user_id', '=', parseInt(localStorage['uid'])]]),
        Url = localStorage['server']+'/xmlrpc/object'
        Db = localStorage['dbname'],
        Passwd = localStorage['passwd'],
        forcedFields = $.xmlrpc.force('array',
                       ['id', 'name', 'user_id', 'description',
                        'state', 'stage_id', 'message_ids'])
        $("#"+button).button('loading');
        placeHolderAcc = $("#accordion2");
        placeHolderAcc.html('');
    $.xmlrpc({
        url: Url,
        methodName: 'execute',
        params: [ Db,
                  forcedUid,
                  Passwd,
                  'project.task',
                  'search',
                  forcedDomain],
        success: function(response, status, jqXHR) {
            forcedIds = $.xmlrpc.force('array', response[0]),
            $.xmlrpc({
                url: Url,
                methodName: 'execute',
                params: [ Db,
                          forcedUid,
                          Passwd,
                          'project.task',
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
        },
        error: function(response, status, error) {
            $("#"+button).button('reset');
        }
    });
    //////////////
}

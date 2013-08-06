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

function messageView(taskObj){
    var messageCont = $('<div class="media"></div>'),
        imgCont = $('<a class="pull-left" href="#">').append($('<img>').attr({
            'class': 'media-object',
            'src': 'images/img64x64.png'
        })),
        messageText = $('<div class="media-body"><div>') 
        messageTitle = $('<h4 class="media-heading"></h4>'),
        messageContent = 'iCras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis.',
        messageTitleContent = 'Hola Mundo'
        console.log(imgCont);
        buttonsCont = actionButtonsMessage(taskObj).addClass('row span1');
        return messageCont.append(imgCont,
                                  messageText.append(buttonsCont,
                                                     messageTitle.text(messageTitleContent),
                                                     $('<p>').text(messageContent)))
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
    messagesPlaceholder.append(messageView);
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
    bodyoftask.append(getTableTW(taskObj), messagesPlaceholder);
    allElements.addClass("accordion-group"); 
    allElements.append(heading, bodyoftask);
    return allElements
}

function getTableTW(taskObj){
    var tableTW = $('<table></table>'),
        tableCaption = $('<caption><h5>Task Works</h5></caption>')
    tableTW.addClass('table table-condensed table-striped table-bordered');
    tableTW.append("<thead><tr><th>Id</th><th>Details</th><th>Time</th><th>RevId</th></tr></thead>");
    //Searching TW ids and reading them.
    //var forcedIds = $.xmlrpc.force('array', ids)
    var forcedUid = $.xmlrpc.force('int', localStorage['uid']),
        forcedDomain = $.xmlrpc.force('array', [['task_id', '=', taskObj.id]]),
        Url = localStorage['server']+'/xmlrpc/object'
        Db = localStorage['dbname'],
        Passwd = localStorage['passwd'],
        forcedFields = $.xmlrpc.force('array', ['id', 'name'])

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
                        content = $("<tbody><tr><td>"+e.id+"</td><td>"+e.name+"</td><td>10/12/2013 10:10:11</td><td>28</td></tr></tbody>");
                        tableTW.append(content);
                        return e;
                    });
                    console.log(content);
                },
                error: function(response, status, error) {
                }
            });
        },
        error: function(response, status, error) {
        }
    });
    //////////////
    return tableTW
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
    console.log('Answer MEssage on TAsk');
}

function actFavoriteMessage(taskObj){
    console.log('Answer Favorite Message');
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
}

function oe_read(model, ids, fields, button){
    var forcedIds = $.xmlrpc.force('array', ids)
    var forcedUid = $.xmlrpc.force('int', localStorage['uid'])
    var forcedFields = $.xmlrpc.force('array', fields)
    $("#"+button).button('loading');
    placeHolderAcc = $("#accordion2");
    placeHolderAcc.html('');
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

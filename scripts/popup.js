function oe_search(items, args, model){
    var request = new XmlRpcRequest(items.server+'/xmlrpc/object','execute');
    var ids = [];
    request.addParam(items.dbname);
    request.addParam(items.uid);
    request.addParam(items.passwd);
    request.addParam(model);
    request.addParam('search');
    request.addParam(args);
    var response = request.send();
    ids = response.parseXML();
    return(ids);
}

function oe_read(items, model, record_id, fields){
    var request = new XmlRpcRequest(items.server+'/xmlrpc/object','execute');
    request.addParam(items.dbname);
    request.addParam(items.uid);
    request.addParam(items.passwd);
    request.addParam(model);
    request.addParam('read');
    request.addParam(record_id);
    request.addParam(fields);
    var response = request.send();
    var oe_object = response.parseXML();
    return(oe_object);
}
$(document).ready(function(){
    chrome.storage.sync.get(['uid','dbname','user','passwd','server'], function(items){
        if (items.uid){
            $('#oex_main').hide();
            $('#oex_timeline').show('slow');
            var args = [['user_id','=',items.uid]];
            var model = 'project.task';
            var ids = oe_search(items, args, model);
            var fields = ['name','id','user_id','date_deadline','description'];
            for (var id in ids){
                var tasks = oe_read(items, model, ids[id], fields);
                if (tasks.faultCode){
                    alert(tasks.faultCode, tasks.faultString);
                } else {
                    $('#oex_timeline').append(
                            '<div class="oex_card" id="'+tasks.id+'">'+
                                '<div class="oex_content">'+
                                    '<b>'+tasks.name+'</b>'+
                                '</div>'+
                                '<div>'+
                                '<div class="oex_div_text">'+
                                    '<a href="#"><span class="oex_openerp_bold">+<span></a>'+
                                    '<p class="oex_text">'+tasks.description+'</p>'+
                                '</div>'+
                                    '<span>'+
                                        '<i class="oex_text_red">'+tasks.date_deadline+'<i>'+
                                    '<span>'+
                                    '<a href="#"><span class="oex_openerp_bold_tws">'+
                                        'Task Works'+
                                    '</span></a>'+
                                    '<a href="#"><span id="'+tasks.id+'"class=oex_openerp_bold_messages>'+
                                        'Messages'+
                                    '</span></a>'+
                                '</div>'+
                                '<div class oex_messages id="'+tasks.id+'">'+
                                '</div>'+
                            '</div>');
                }
            }
            addEventClick();
        }
    });
});
$('.oex_timeline').ready(function() {
    $('#oex_loading').hide('slow');
});

function connect(e){
    var dbname = document.getElementById('database').value;
    var user = document.getElementById('login').value;
    var passwd = document.getElementById('password').value;
    var server = document.getElementById('server').value;
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
function message_clicked(task_id){
    chrome.storage.sync.get(['uid','dbname','user','passwd','server'], function(items){
        if (items.uid){
        var args = [['task_id.id','=',task_id]];
        var model = 'project.task.work';
        var ids = oe_search(items, args, model);
        var fields = ['name','id','user_id','date','hours'];
        for (var id in ids){
                var works = oe_read(items, model, ids[id], fields);
                if (works.faultCode){
                    alert(works.faultCode, works.faultString);
                } else {
                    var elem = '#'+task_id+'.oex_messages';
                    console.log(elem);
                    $(elem).append(
                        '<div><p>'+works.name+'</p></div>'
                    );    
                }
            }
        }
    });
}

function addEventClick(){
var messages = $('.oex_openerp_bold_messages');
messages.each(function (a, span_obj) {
    console.log("vaina "+ a, span_obj);
    $span_element = $(span_obj);
    console.log('span'+ $span_element.attr('id'));
    var task_id = $span_element.attr('id');
    $span_element.click(function(){
        message_clicked(task_id);
        });
    });
}
document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('settings').addEventListener('click', settings)
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('oe_login').addEventListener('click', connect)
});

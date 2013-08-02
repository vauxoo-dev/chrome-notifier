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
                                    '<a href="#"><span span id="'+tasks.id+'" class="oex_openerp_bold_tws">'+
                                        'Task Works'+
                                    '</span></a>'+
                                    '<a href="#"><span id="'+tasks.id+'"class=oex_openerp_bold_messages>'+
                                        'Messages'+
                                    '</span></a>'+
                                '</div>'+
                                '<div class="oex_tws" id="'+tasks.id+'">'+
				                '<table class="oex_list_content" id="'+tasks.id+'">'+
                                    '<thead>'+
                                    '<tr id="'+tasks.id+'" class="oex_list_header_columns">'+
                                        '<th><div>'+
                                            'Task Work'+
                                        '</div></th>'+
                                        '<th><div>'+
                                            'Time Spent'+
                                        '</div></th>'+
                                        '<th><div>'+
                                            'Date'+
                                        '</div></th>'+
                                    '</tr>'+
                                    '</thead>'+
					                '<tbody id="'+tasks.id+'" class="oex_tbody">'+
					                '</tbody>'+
				                '</table>'+
                                '</div>'+
                                '<div class="oex_messages" id="'+tasks.id+'">'+
                                '</div>'+
                            '</div>');
                }
            }
            addEventClickTw();
            addEventClickMsg();
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
function tw_clicked(task_id){
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
                    var elem = '#'+task_id+'.oex_tbody';
                    if ($('#'+works.id+'.oex_tr_tw').length > 0){
                        continue;
                    } else {
                        $(elem).append(
                            '<tr id="'+works.id+'" class="oex_tr_tw">'+
                                '<td class="oex_list_field_cell">'+works.name+'</td>'+
                                '<td class="oex_list_field_cell">'+works.hours+'</td>'+
                                '<td class="oex_list_field_cell">'+works.date+'</td>'+
                            '</tr>'
                        );   
                    }
                }
            }
        var h = $('#'+task_id+'.oex_card')[0].scrollHeight;
        $('.oex_div_message').remove();
        $('#'+task_id+'.oex_card').animate({'height':h});
        $('#'+task_id+'.oex_list_content').css({opacity: 0.0, visibility:'visible'}).animate({opacity:1.0});
        }
    });
}

function msg_clicked(task_id){
    chrome.storage.sync.get(['uid','dbname','user','passwd','server'], function(items){
        if (items.uid){
        var args = [['res_id','=',task_id],['model','=','project.task']];
        var model = 'mail.message';
        var ids = oe_search(items, args, model);
        var fields = ['id','body','date','author_id'];
        for (var id in ids){
                var messages = oe_read(items, model, ids[id], fields);
                if (messages.faultCode){
                    alert(messages.faultCode, messages.faultString);
                } else {
                    if ($('#'+messages.id+'.oex_div_message').length > 0){
                        continue;
                    } else {
                        var elem = '#'+task_id+'.oex_messages';
                        $(elem).append(
                            '<div id="'+messages.id+'" class="oex_div_message">'+messages.body+'</div>'
                            );  
                        } 
                    }
                }
        var h = $('#'+task_id+'.oex_card')[0].scrollHeight;
        $('.oex_tr_tw').remove();
        $('#'+task_id+'.oex_card').animate({'height':h});
        $('#'+task_id+'.oex_messages').css({opacity: 0.0, visibility:'visible'}).animate({opacity:1.0});
            }
    });
}

function addEventClickTw(){
    var tws = $('.oex_openerp_bold_tws');
    tws.each(function (a, span_obj) {
        $span_element = $(span_obj);
        var task_id = $span_element.attr('id');
        $span_element.click(function(){
            tw_clicked(task_id);
            });
        });
}
function addEventClickMsg(){
    var msg = $('.oex_openerp_bold_messages');
    msg.each(function (a, span_obj) {
        $span_element = $(span_obj);
        var task_id = $span_element.attr('id');
        $span_element.click(function(){
            msg_clicked(task_id);
            });
        });
}
document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('settings').addEventListener('click', settings)
});

document.addEventListener('DOMContentLoaded', function (){
    document.getElementById('oe_login').addEventListener('click', connect)
});

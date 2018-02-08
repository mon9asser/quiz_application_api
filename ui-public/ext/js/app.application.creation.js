$(document).ready(function(){
  // ==> Resorting items inside list
  var sortable_items = document.getElementById("docQuestions")
  Sortable.create(sortable_items, {
     ghostClass: 'shadow_element' ,
     group: "question-list"
   });

 // ==> geting sortable items from another list
 var qs_types = document.getElementById("qs-sortable");
 Sortable.create(qs_types, {
  ghostClass: 'shadow_element' ,
  sort : false ,
    group: {
      name: "question-list",
      pull: "clone",
      revertClone: true,
    } ,
    onEnd: function (evt) {
    		var itemEl = evt.item;  // dragged HTMLElement
        var parentElement = $("#docQuestions") ;
        var server_ip = $("#serverId_app").attr("serverIp");
        var target_qsType = $( itemEl ).attr("question-data");

          $.ajax({
            url : server_ip + target_qsType,
            type : "GET",
            success : function (questionTypeElement){

              // Append Question Type !
              $(questionTypeElement).insertBefore( parentElement.children("li").eq(evt.newIndex));
            }
          });
          itemEl.remove();


    }

  });
});

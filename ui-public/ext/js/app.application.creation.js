$(document).ready(function(){




  // ================> Application Sorting
  var server_ip = $("#serverId_app").attr("serverIp");
  var jsonFile =  server_ip + "ext/js/json.app.keys.json";
  $.getJSON(jsonFile, function(api_key_data) {
        // ==============================================================
        // ================>>>> Sorting !! <<<<<<<<<<<===================
        // ==============================================================
        var qs_sortable = $("#qs-sortable");
        var qs_dropped = $(".dropped-qs");
        var qs_dropped_2 = $(".dropped-qs-2");

        var dropped = false;
        var draggable_sibling;
        qs_dropped_2.sortable();
        qs_sortable.sortable({
            start: function(event, ui) {
                 draggable_sibling = $(ui.item).prev();
                 $('.dragelement-here').addClass('dragged-items');
         },
            stop: function(event, ui) {
                if (dropped) {
                  if (draggable_sibling.length == 0)
                     $('#qs-sortable').prepend(ui.item);
                     $('.dragelement-here').removeClass('dragged-items');
                    draggable_sibling.after(ui.item);
                    dropped = false;
                }
            }
          });
          qs_dropped.droppable({
            activeClass: 'active',
                hoverClass:'hovered',
                drop:function(event,ui){
                  $('.dragelement-here').removeClass('dragged-items');

                    // Question type page [QS]
                    var $questionType = ui.helper[0].getAttribute('question-data');
                      if($questionType != null ){
                      $.ajax({
                        url : server_ip + $questionType ,
                        type :"GET" ,
                        success : function (response){
                            console.log(response);
                          $(".dropped-qs").prepend(response);
                          $(".dragelement-here").remove();
                        },
                        error : function (err){
                          console.log(err);
                        }
                      });
                      }
                    // $http({
                    //       method: 'GET',
                    //       url: 'templates/question-types/'+$questionType
                    //     }).then(function successCallback(response) {
                    //        $(".dropped-qs").prepend(response.data);
                    //        $(".dragelement-here").remove();
                    //     }, function errorCallback(response) {
                    //       // called asynchronously if an error occurs
                    //       // or server returns response with an error status.
                    //   });
                    // console.log(event.target);
                    // $(event.target).addClass('dropped');
                    dropped = true;
              }
          });

    });


});

var attendee_data = function ( attendees ){
  var attendee_object = new Object();
  var attendee_array = new Array();
  for(var i = 0 ; i < attendees.length ; i++){
      var thisAttendee = attendees[i];
      attendee_object["user_id"] = thisAttendee._id ;
      attendee_object["user_id"]['results'] = {
          "raw_value" : thisAttendee.results.result.raw_value ,
          "percentage_value" : thisAttendee.results.result.percentage_value ,
      };
    attendee_array.push(attendee_array);
  }
  return attendee_array ;
};


module.exports = { attendee_data };

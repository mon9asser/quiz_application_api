        var imagePath =  req.body.media_question.media_field ;
        var fileExtension = path.extname(imagePath);
        var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
        var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );

        if(isExists == -1 )
            {
                return new Promise((resolve , reject)=>{
                    res.send(notes.Errors.Error_file_extension);
                });
            }

        var new_filename = "question_"+question_id+targetExtension.image.toLowerCase();
        var targetPath =__dirname + "/../../public/themeimages/"+new_filename ;

















                if(req.body.media_optional != null ){
                  question_answers["media_optional"] = new Object();

                  var exists_array = new Array();
                  if(req.body.media_optional.media_type == null) {
                    exists_array[exists_array.length] = "media_type";
                  }

                  if(req.body.media_optional.media_name == null) {
                    exists_array[exists_array.length] = "media_name";
                  }

                  if(req.body.media_optional.media_src == null) {
                    exists_array[exists_array.length] = "media_src";
                  }

                  if(exists_array.length != 0 ){
                    return new Promise((resolve , reject) => {
                      res.send(notes.Messages.Required_Message(exists_array));
                    });
                  }


                    if( ! _.isInteger(req.body.media_optional.media_type)  || req.body.media_optional.media_type  > 1 ) {
                       return new Promise((resolve , reject)=>{
                         res.send({"Message" : "This Value should be integer (0 or 1) 0 => for image type , 1 => for video type"});
                       });
                    } 

                     if(  req.body.media_question.media_type != 1  ){
                       var imagePath =  req.body.media_question.media_src ;
                       var fileExtension = path.extname(imagePath);
                       var isExists =  _.findIndex([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );
                       var targetExtension =  _.find ([{image : ".JPG"},{image :".PNG"},{image :".JPEG"} , {image :".jpg"},{image :".jpeg"},{image :".png"}] , {image:fileExtension} );

                       // new name for this media
                       var media_name = "answer_"+question_answers._id+targetExtension.image.toLowerCase();
                       // ==> Create Image or media
                       console.log(media_name);
                     }


                     question_answers["media_optional"] = {
                       "media_type" : (req.body.media_optional.media_type != null ) ? req.body.media_optional.media_type : null ,
                       "media_name" : (req.body.media_optional.media_name != null ) ? req.body.media_optional.media_name : null ,
                       "media_src" : (req.body.media_optional.media_src != null ) ? req.body.media_optional.media_src : null ,
                     } ;

                }
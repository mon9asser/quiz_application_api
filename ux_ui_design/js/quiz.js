$(document).ready(function(){        var $start_slider = false ;        var $QuizApplication = {            labels : [                'A' , 'B' , 'C' , 'D' , 'F' ,'E' , 'G' , 'H' , 'I' , 'J' ,                'K' , 'L' , 'M' , 'N' , 'O' , 'P' , 'Q' , 'R' , 'S' , 'T'            ],            choices : $('.answe-list') ,            answered : true ,            slide_indexer  : 1 ,            questionNumbers : $('.question_naumbers').length ,            questionCurrentNumber : this.slide_indexer ,            progress_bar : $('#progressionbar') ,            progress_current_status : function (indexValue){                // Fill Progress bar                var $currentStatus= Math.round(parseInt(indexValue) * 100 / parseInt(this.questionNumbers)) + "%";                this.progress_bar.html($currentStatus);                $('.progression-complete').css({                    width: $currentStatus                });                if($currentStatus == "100%")                {                    this.progress_bar.addClass("animated zoomOut");                    this.progress_bar.html("<i style='font-size: 22px;' class='fa fa-check animated bounceIn'></i>");                    this.progress_bar.removeClass("animated zoomOut");                    this.progress_bar.addClass("animated zoomIn");                    $('.iscompleted').addClass("animated bounceIn");                    // this.progress_bar.css({                    //     float: "none",                    //     left: "48.5%",                    //     right: "0px"                    // });                }            }        };     // Init AOS        AOS.init();    // Swiper Slider ( Init )    $swiper = new Swiper ('.swiper-sliderex' , {        allowTouchMove : $QuizApplication.answered ,        on : {            init:function (){                $QuizApplication.progress_current_status(1);                $QuizApplication.slide_indexer = 2;            }        }    });        // Active selected Choice    $('.answe-list > li').on("click" , function (){        $('.answe-list > li').css({            borderColor:'rgba(255,255,255,0.1) !important' ,            boxShadow:'0px 0px 0px 0px transparent !important' ,            color:"#fff"        });        if($('.answe-list > li').hasClass('answer-list-activated'))            $('.answe-list > li').removeClass('answer-list-activated');        $(this).addClass('answer-list-activated');         $start_slider = true ;         $QuizApplication.answered = true ;         $swiper.slideNext(500);        if($QuizApplication.slide_indexer != $QuizApplication.questionNumbers)            $QuizApplication.slide_indexer+=1;    });    $swiper.on("slideChange" , function (){        if($start_slider == true){            $QuizApplication.progress_current_status( $QuizApplication.slide_indexer );        }    });    $("#startQuiz").on("click" , function (){        $('.xcompletion').addClass("animated bounceIn");        $swiper.slideNext(500);    });    // Labels for All Choices    $(window).on("load" , function (){        $QuizApplication.choices.each(function(inc){            $(this).children("li").each(function(i){                // Set Animation when user view the choices                $(this).on('inview' , function(){                    // ++> HERE                  // $(this).addClass("animated");                });                // Prepend the labels              $(this).prepend( "<span class='label'>"+$QuizApplication.labels[i]+"</span>") ;            });        });    });}) ;
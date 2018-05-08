
// 10. Brief report api
{	
	status_code:,
	message:””,
	data:{
		
			quiz:
				{
					Total:2 /*total quizzes*/,
					total_attendees:23 /* total attendees in all quiz based on filter (not paging) */
					items:[
							// ------------------------
						  ]
 				},
			survey:
				{
					total:3 /*total surveys..*/,
					total_attendees:23
				}
					items:[
						 	// ------------------------
						]
		}
}
// a. Pagination data
// If pagination found then retun additional paging  object along with above data. 
{
	total:"",
	total_attendees:23
	// The above should contains total quiz/survey and totalAttendees  (no need to consider paging details)
	data:{
		 paging: { 
					 items :200
					 item_per_page:200,
					 total_items:2000,
					 page_index:1,
					 total_pages:10
				 }
		}
}












// =================================================================================
// =================================================================================
// =================================================================================


// 11. Detailed report.	 (return attendee details of a quiz)
// => a. Overall data

		data:{
			app_nfo:
				{
					app_name:””
					app_id :””,
					total_questions:20, /*should be number*/
					pass_grad:80,/*80%*/ if graded quiz
				}

			overview:
				{
					total_attendees:23 
					completed:3,
					passed:2 //if quiz
					failed: 1//if quiz
					started:10,
					not_started:3
				}
				,
			items: 
				[ <here attendees list that you already done> ]
		}


// => b. Pagination data
    data:{
		 	// => Other data here as specified above.
			paging:
			{
				items:200,
				item_per_page:200,
				total_items:2000,
				page_index:1,
				total_pages:10
			}
	}





// =================================================================================
// =================================================================================
// =================================================================================


// 12. Statistics report- [ return survey statistics ]
// => Overall data
Data:{

	app_nfo:
			{
				app_name:””
				app_id :””,
				total_questions:20,
			},
	overview:
			{
				total_attendees:23 ,
				started:10,
				not_started:3,
				completed:10,
			}
	,
	questions:[
				<here data you already sending  >
			  ]

	
}

// No needs of pagination for statics

		


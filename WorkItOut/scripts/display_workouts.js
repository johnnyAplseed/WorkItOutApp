
window.onload = function () {
	var workouts = JSON.parse(localStorage.getItem("Workouts"));
	console.log(JSON.stringify(workouts));

	this.availableWorkouts = document.getElementById("workouts_wrapper").innerHTML;
	if(workouts != null){
		for (var i = 0; i < workouts.length; i++) {
			console.log(workouts[i].name.toString().replace(/ /g, '_'));
			document.getElementById("workouts_wrapper").innerHTML += 
			"<div><button class='home_page_button workout_button' id=" + workouts[i].name.toString().replaceAll(/ /g, '_') + "_workout_button" +
			//button with workout name takes you to the workout
			"  onClick=" + "loadWorkout('" + workouts[i].name.toString().replace(/ /g, '_') + "')  >" + (workouts[i].name).toString() + "</button><button class='home_page_button delete_button ' id=" + workouts[i].name.toString().replaceAll(/ /g, '_')  + "_delete_button" +
			//button with trash can image use deletes workout function 
			"  onClick=" + "deleteWorkout('" + workouts[i].name.toString().replace(/ /g, '_') + "')"+">  <img class=" + "delete_img" + " src="+ "../images/trash-can.png" +" alt='delete workout'> </button></div>"
		}
	}

	document.getElementById("workouts_wrapper").innerHTML += "<div></div><button class='home_page_button workout_button  default_workout_button' onclick=" + "window.location.href='" + "../additions/add_workout_table.html' >Add Workout</button></div>";

}

function loadWorkout(name) {
	console.log(name);
	console.log(name.toString().replace('_', ' '));
	url = '../workouts/anyWorkout.html?name=' + encodeURIComponent(name.toString());
	document.location.href = url;
}

function deleteWorkout(name) {
	if (confirm("Do you wish to delete " + name ) == true) {

		console.log(name + " is being deleted");
		console.log(name.toString().replaceAll('_', ' '));
		if(confirm("are you absolutely positive??")){
			var workouts = JSON.parse(localStorage.getItem("Workouts"));
			
			if (workouts != null){
				for (i = 0; i<workouts.length;i++ )
				{
					if(workouts[i].name == name.toString().replaceAll('_', ' '))
					{
						//save spliced array to local storage
						if(confirm("You cannot undo this delete, \n ARE YOU SURE??")){
							var temp = workouts[i].name.toString().toUpperCase() + "_history";
							workouts.splice(i, 1);
							//update the original workouts array, it feeds workouts.html
							window.localStorage.setItem("Workouts", JSON.stringify(workouts))
							//Remove the history file for the workout
							window.localStorage.removeItem(temp);
						} else {
							alert("Workout not deleted...")
						}
					}
				}
			}
		}
	}
	//reload page
	document.location.href = '../content/workouts.html';
}















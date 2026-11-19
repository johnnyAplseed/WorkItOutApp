//initialize variables
this.workoutName;
this.workoutType;
this.workoutTable = [];
this.workoutNotes;

function saveWorkoutTable() {


    workoutArray = JSON.parse(window.localStorage.getItem("Workouts")) ? JSON.parse(window.localStorage.getItem("Workouts")) : [];
    console.log(workoutArray);

    // function superset () {
    //     return (
    //         superset = {
    //         exerciseName: "",
    //         superset: false
    //     })
    // }

    var newWorkout = {
        name: null,
        type: null,
        notes: null,
        exercises: [],
        supersets: [],
        arrLength: 0,
        dateCreated: new Date()
    };

    newWorkout.name = document.getElementById("new_workout_name").value;
    newWorkout.type = document.getElementById("workout_type").value;

    if (newWorkout.name == "" ){
        alert("A name for the workout is required");
        return;
    }

    //get workouts from local storgae and check if this name exists
    var existingWorkouts = JSON.parse(localStorage.getItem("Workouts"));

    //make sure workouts is not empty
    if (existingWorkouts != null){
        console.log(existingWorkouts.length);
        //loop through looking for the new workouts string value. 
        var nameExists = false;
        existingWorkouts.forEach(element => {
            if (element.name.includes(newWorkout.name, 0)){
                nameExists = true;
                return;//this return only applies to this function, need to break out one more level. 
            }
        });
        //dont let user save a workout that has the same same name as an existing workout. 
        if (nameExists)
        {
            alert("A workout with the same name already exists, please change the name and try again. ");
            return;
        }
    }

    if (newWorkout.type == "Default" ){
        alert("Please check the workout type and try again.");
        return;
    }

    //loop through table to grab workouts
    for (var i = 1; i < 21; i++) {
        for (var j = 1; j < 5; j++) {
            //check if the cell has value
            if (document.getElementById("table_data_" + i + "_" + j).innerHTML.length > 0) {
                //add populated cell to the end of the array
                newWorkout.exercises.push(document.getElementById("table_data_" + i + "_" + j).innerHTML);
            }
        }
        var checkbox = document.getElementById("workout_" + i + "_superset").checked;
        var exerciseName = document.getElementById("table_data_"+ i + "_1").innerHTML;
        if (exerciseName != "") {
            if (checkbox){
                let superset = {exercise: exerciseName,superset: checkbox};
                newWorkout.supersets.push(superset);
            } else {
                let superset = {exercise: exerciseName,superset: checkbox};
                newWorkout.supersets.push(superset);
            }
        }
    }
    //Add workout name, type, and notes to the array
    newWorkout.name = document.getElementById("new_workout_name").value;
    newWorkout.type = document.getElementById("workout_type").value;
    newWorkout.notes = document.getElementById("new_workout_notes").value;
    newWorkout.arrLength = newWorkout.exercises.length;

    //Log the results for validation
    console.log("NEW WORKOUT2:\nWorkout Name: " + newWorkout.name +
        "\nWorkout Type: " + newWorkout.type +
        "\nWorkout Array: " + newWorkout.exercises +
        "\nArray Length:" + newWorkout.arrLength +
        "\nWorkout Notes: " + newWorkout.notes);

    workoutArray.push(newWorkout);

    if (confirm("Are you sure you want to submit this workout?")){
        window.localStorage.setItem("Workouts", JSON.stringify(workoutArray));
        // Back to the workouts list, where the new workout now shows up.
        // replace() rather than href, so the finished form drops out of the
        // history: pressing back from the list won't reopen it, where
        // submitting again would only hit the "name already exists" alert.
        window.location.replace("../content/workouts.html");
    } else {
        var workoutSubmittedMessage = document.createElement("div");
        var savedString = document.createElement("h3");
        savedString.innerText  = "Save cancelled..."
        workoutSubmittedMessage.appendChild(savedString);
        workoutSubmittedMessage.id="workout_saved_alert";
        document.getElementById("new_workout_notes").parentNode.appendChild(workoutSubmittedMessage);
    }
    



}



// Workouts page: the three built-in workouts stay pinned at the top (they live
// in workouts.html), then every workout the user has saved, then "Add Workout".
// The saved ones can be dragged into any order using the handle on their left.
//
// The order is kept in its own localStorage key instead of by reordering the
// "Workouts" array, because that array is the app's only copy of every saved
// workout. Keeping the two apart means a mistake in the drag code can cost the
// ordering and nothing else. Names tie them together - a name is already this
// app's identity for a workout (history is stored as "<NAME>_history", and two
// workouts cannot share a name), so the order list needs no upkeep: a name it
// does not know sorts to the end, and a name with no workout behind it is
// ignored.

var WORKOUTS_KEY = "Workouts";
var ORDER_KEY = "Workout Order";

function readWorkouts() {
	try {
		var workouts = JSON.parse(localStorage.getItem(WORKOUTS_KEY));
		return Array.isArray(workouts) ? workouts : [];
	} catch (err) {
		console.error("Could not read saved workouts", err);
		return [];
	}
}

function readWorkoutOrder() {
	try {
		var order = JSON.parse(localStorage.getItem(ORDER_KEY));
		return Array.isArray(order) ? order : [];
	} catch (err) {
		console.error("Could not read saved workout order", err);
		return [];
	}
}

function saveWorkoutOrder(names) {
	try {
		localStorage.setItem(ORDER_KEY, JSON.stringify(names));
	} catch (err) {
		console.error("Could not save workout order", err);
	}
}

// Saved order first, then any workout the order list has not seen yet - one
// added since the last drag - in the order it was created.
function inSavedOrder(workouts) {
	var order = readWorkoutOrder();

	var ranked = workouts.map(function (workout, index) {
		var rank = order.indexOf(workout.name);
		return {
			workout: workout,
			// Unranked workouts get a rank past the end of the order list, so
			// they always land after the ones the user has arranged.
			rank: rank < 0 ? order.length + index : rank,
			index: index
		};
	});

	ranked.sort(function (a, b) { return (a.rank - b.rank) || (a.index - b.index); });

	return ranked.map(function (entry) { return entry.workout; });
}

function buildWorkoutRow(workout) {
	var row = document.createElement("div");
	row.className = "workout_row";
	row.dataset.workoutName = workout.name;

	var handle = document.createElement("button");
	handle.type = "button";
	handle.className = "home_page_button drag_handle";
	handle.setAttribute("aria-label", "Reorder " + workout.name);
	var handleBars = document.createElement("span");
	handleBars.className = "drag_handle_bars";
	handle.appendChild(handleBars);
	handle.addEventListener("pointerdown", startDrag);

	var openButton = document.createElement("button");
	openButton.type = "button";
	openButton.className = "home_page_button workout_button";
	openButton.textContent = workout.name;
	openButton.addEventListener("click", function () {
		loadWorkout(workout.name.toString().replace(/ /g, "_"));
	});

	var deleteButton = document.createElement("button");
	deleteButton.type = "button";
	deleteButton.className = "home_page_button delete_button";
	deleteButton.setAttribute("aria-label", "Delete " + workout.name);
	deleteButton.addEventListener("click", function () {
		deleteWorkout(workout.name.toString().replace(/ /g, "_"));
	});

	var trashIcon = document.createElement("img");
	trashIcon.className = "delete_img";
	trashIcon.src = "../images/trash-can.png";
	trashIcon.alt = "delete workout";
	deleteButton.appendChild(trashIcon);

	row.appendChild(handle);
	row.appendChild(openButton);
	row.appendChild(deleteButton);

	return row;
}

function renderWorkouts() {
	var list = document.getElementById("custom_workouts");
	if (!list) return;

	list.innerHTML = "";
	inSavedOrder(readWorkouts()).forEach(function (workout) {
		list.appendChild(buildWorkoutRow(workout));
	});
}

//--------------------------------------------------------------------------------------------------------------
// Drag to reorder
//--------------------------------------------------------------------------------------------------------------
// Pointer events cover touch and mouse in one code path. A drag can only start
// on the handle: the rest of the row is a tap target that opens or deletes a
// workout, so anything looser would fire those by accident. The handle's
// "touch-action: none" (in styles.css) is what stops a touch drag from
// scrolling the page instead.
//
// The move/up listeners go on the document, not on the handle. Reordering
// calls insertBefore on the row the handle sits in, which detaches it for an
// instant - long enough for the browser to drop pointer capture, after which
// a handle-bound listener only fires while the cursor happens to be over the
// handle, and the drag can end without ever being saved.

var drag = null;

function startDrag(event) {
	// Left button / touch / pen only.
	if (typeof event.button === "number" && event.button !== 0) return;

	var row = event.currentTarget.parentNode;
	var list = row.parentNode;
	if (!list || list.children.length < 2) return;

	drag = {
		row: row,
		list: list,
		pointerId: event.pointerId,
		originY: event.clientY,
		moved: false
	};

	document.addEventListener("pointermove", onDragMove);
	document.addEventListener("pointerup", endDrag);
	document.addEventListener("pointercancel", endDrag);

	row.classList.add("dragging");
	event.preventDefault();
}

function onDragMove(event) {
	if (!drag || event.pointerId !== drag.pointerId) return;
	event.preventDefault();

	// How far the row has been pushed out of the slot it currently occupies.
	// The origin is re-based on every reorder below, so this is always
	// measured against where the row sits now, not where the drag began.
	var offset = event.clientY - drag.originY;
	drag.row.style.transform = "translateY(" + offset + "px)";

	// The row belongs after the last row whose middle its leading edge has
	// passed - its bottom edge when pushed down, its top edge when pushed up.
	//
	// Two things fall out of using the leading edge rather than the pointer
	// or the row's own centre. Half a row of travel commits the move, instead
	// of a full row for the centre or an unpredictable amount for the pointer
	// (which sits wherever on the handle the row happened to be grabbed). And
	// dragging a row to sit exactly over its neighbour lands cleanly in both
	// directions, rather than tying on the neighbour's middle and stopping a
	// slot short.
	var draggedBox = drag.row.getBoundingClientRect();
	var leadingEdge = offset > 0 ? draggedBox.bottom : draggedBox.top;

	var others = Array.prototype.filter.call(drag.list.children, function (row) {
		return row !== drag.row;
	});
	var after = null;
	for (var i = 0; i < others.length; i++) {
		var box = others[i].getBoundingClientRect();
		if (box.top + box.height / 2 < leadingEdge) after = others[i];
	}

	var before = after ? after.nextElementSibling : drag.list.firstElementChild;
	if (before === drag.row) return;

	// Moving the row changes where layout puts it, so the drag origin has to
	// shift by the same amount - otherwise the row jumps out from under the
	// finger by exactly one row height. Both measurements are taken with the
	// transform off so they compare like with like.
	drag.row.style.transform = "none";
	var naturalTopBefore = drag.row.getBoundingClientRect().top;
	drag.list.insertBefore(drag.row, before);
	var naturalTopAfter = drag.row.getBoundingClientRect().top;
	drag.originY += naturalTopAfter - naturalTopBefore;

	drag.row.style.transform = "translateY(" + (event.clientY - drag.originY) + "px)";
	drag.moved = true;
}

function endDrag(event) {
	if (!drag || event.pointerId !== drag.pointerId) return;

	document.removeEventListener("pointermove", onDragMove);
	document.removeEventListener("pointerup", endDrag);
	document.removeEventListener("pointercancel", endDrag);

	drag.row.style.transform = "";
	drag.row.classList.remove("dragging");

	// Also saved on pointercancel: whatever order the rows are in on screen is
	// a valid order, and it is what the user last saw.
	if (drag.moved) {
		saveWorkoutOrder(Array.prototype.map.call(drag.list.children, function (row) {
			return row.dataset.workoutName;
		}));
	}

	drag = null;
}

//--------------------------------------------------------------------------------------------------------------
// Open / delete
//--------------------------------------------------------------------------------------------------------------

function loadWorkout(name) {
	console.log(name);
	url = '../workouts/anyWorkout.html?name=' + encodeURIComponent(name.toString());
	document.location.href = url;
}

function deleteWorkout(name) {
	if (confirm("Do you wish to delete " + name) == true) {

		console.log(name + " is being deleted");
		if (confirm("are you absolutely positive??")) {
			var workouts = readWorkouts();

			for (var i = 0; i < workouts.length; i++) {
				if (workouts[i].name == name.toString().replaceAll('_', ' ')) {
					//save spliced array to local storage
					if (confirm("You cannot undo this delete, \n ARE YOU SURE??")) {
						var deletedName = workouts[i].name.toString();
						var temp = deletedName.toUpperCase() + "_history";
						workouts.splice(i, 1);
						//update the original workouts array, it feeds workouts.html
						window.localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
						//Remove the history file for the workout
						window.localStorage.removeItem(temp);
						//Drop it from the order too, so a future workout reusing
						//the name does not inherit this one's position.
						saveWorkoutOrder(readWorkoutOrder().filter(function (ordered) {
							return ordered !== deletedName;
						}));
					} else {
						alert("Workout not deleted...")
					}
				}
			}
		}
	}
	//reload page
	document.location.href = '../content/workouts.html';
}

document.addEventListener("DOMContentLoaded", renderWorkouts);

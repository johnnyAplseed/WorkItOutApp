// Long press: hold a finger (or the mouse button) on an element to run an
// action, without also triggering whatever a normal tap on it does.
//
// Used to rename a workout (workouts page) and an exercise (anyWorkout page).
// Shared so both behave the same way, and kept dependency-free like the rest
// of the app.
//
// Three things have to happen for a long press to feel right on a phone:
//  - Moving the finger cancels it. Otherwise starting a scroll on top of a
//    workout and pausing for half a second would open the rename prompt.
//  - The click the browser fires on release is swallowed, so a long press on
//    a workout button renames it instead of renaming and then opening it.
//    This is done for the whole page, not just the pressed element: a rename
//    redraws the list, so on a phone the click lands on the freshly built
//    button under the finger, which knows nothing about the long press.
//  - The context menu / text selection callout that the OS shows on a long
//    press is suppressed (here for the menu, in styles.css for the callout).

var LONG_PRESS_MS = 500;
var LONG_PRESS_MOVE_TOLERANCE_PX = 10;

var longPressSwallowNextClick = false;

// Capture phase on the window runs before any element's own click listener.
window.addEventListener("click", function (event) {
	if (!longPressSwallowNextClick) return;
	longPressSwallowNextClick = false;
	event.preventDefault();
	event.stopPropagation();
}, true);

// A long press that ended without a click (e.g. the finger slid off) must not
// eat the next, unrelated tap, so any new press clears the flag.
window.addEventListener("pointerdown", function () {
	longPressSwallowNextClick = false;
}, true);

function addLongPress(element, onLongPress) {
	var timer = null;
	var startX = 0;
	var startY = 0;

	function cancel() {
		if (timer !== null) {
			clearTimeout(timer);
			timer = null;
		}
	}

	element.addEventListener("pointerdown", function (event) {
		// Left button / touch / pen only.
		if (typeof event.button === "number" && event.button !== 0) return;

		startX = event.clientX;
		startY = event.clientY;
		cancel();
		timer = setTimeout(function () {
			timer = null;
			longPressSwallowNextClick = true;
			if (navigator.vibrate) {
				try { navigator.vibrate(30); } catch (err) { /* not supported - fine */ }
			}
			onLongPress(event);
		}, LONG_PRESS_MS);
	});

	element.addEventListener("pointermove", function (event) {
		if (timer === null) return;
		if (Math.abs(event.clientX - startX) > LONG_PRESS_MOVE_TOLERANCE_PX ||
			Math.abs(event.clientY - startY) > LONG_PRESS_MOVE_TOLERANCE_PX) {
			cancel();
		}
	});

	element.addEventListener("pointerup", cancel);
	element.addEventListener("pointercancel", cancel);
	element.addEventListener("pointerleave", cancel);

	element.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	element.classList.add("long_pressable");
}

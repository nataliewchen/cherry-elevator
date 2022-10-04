const elevator = {
  queue: [],
  currentFloor: 1,
  direction: 1,
  totalFloors: 4,
  city: 'Oakland'
}

const ELEVATOR_SPEED = 1000; // milliseconds per floor traveled
const DELAY_BETWEEN_MOVES = 1000; // milliseconds of pause between subsequent moves


// dynamically create floor buttons
function createFloorBtns() {
  const floorBtnPanel = document.querySelector('.floor-btn-panel');
  while (floorBtnPanel.firstChild) { // loop and clear all btns from panel
    floorBtnPanel.removeChild(floorBtnPanel.firstChild); 
  }

  for (let i=1; i < elevator.totalFloors + 1; i++) { // create new btns and add to panel
    const floorBtn = document.createElement('button');
    floorBtn.classList.add('floor-btn');
    floorBtn.id = `floor${i}`;
    floorBtn.innerText = i;
    floorBtnPanel.append(floorBtn); 
  }
}
createFloorBtns();


// update variable and ui
function updateCurrentFloor(num) {
  elevator.currentFloor = num;
  const floorNums = document.querySelectorAll('.floor-num');
  for (let el of floorNums) {
    el.innerText = elevator.currentFloor; // update ui in all relevant places
  }
}


// add floor to queue and move if stationary
function addFloor(floorNum) {
  if (!elevator.queue.includes(floorNum)) { // don't add duplicate floors
    elevator.queue.push(floorNum);
    if (elevator.queue.length === 1) {
      moveFloor(); // trigger recursion if not moving
    }
  }
}


// hightlight up/down indicators
function activateCues(target) {
  if (target > elevator.currentFloor) { // moving upwards
    elevator.direction = 1;
    document.querySelector('#direction-up').classList.add('up-highlight');
  } else if (target < elevator.currentFloor) { // moving downwards
    elevator.direction = -1;
    document.querySelector('#direction-down').classList.add('down-highlight');
  }
}


// unhightlight floor btn and direction indicators
function deactivateCues() {
  document.querySelector(`#floor${elevator.currentFloor}`).classList.remove('floor-selected');
  document.querySelector('#direction-up').classList.remove('up-highlight');
  document.querySelector('#direction-down').classList.remove('down-highlight');
}


function endMoveAndRecurse(delay = 0) {
  elevator.queue.shift(); // remove 'target' floor from queue
  deactivateCues();
  

  if (elevator.queue.length) { // more floors in queue
    setTimeout(() => { 
      moveFloor(); // recurse on next floor
    }, delay)
  } else {
    document.querySelector('.toggle-settings').disabled = false;
  }
}


function moveFloor() {
  document.querySelector('.toggle-settings').disabled = true; // can't change settings while moving
  const target = elevator.queue[0]; // next floor in queue
  if (target === elevator.currentFloor) { // already at target
    endMoveAndRecurse();
  } else {
    activateCues(target);
  
    const floorsTraveled = Math.abs(elevator.currentFloor-target);
    const travelTime = floorsTraveled * ELEVATOR_SPEED;

    // scroll background img
    document.querySelector('.window').style.backgroundPosition = `0 ${100-(10*(target-1))}%`; // move 10% in y-direction for every floor
    document.querySelector('.window').style.transitionDuration = `${travelTime/1000}s`;

    const intervalId = setInterval(() => {
      updateCurrentFloor(elevator.direction === 1 ? elevator.currentFloor + 1 : elevator.currentFloor - 1); // update ui as floors change

      if (elevator.currentFloor === target) { // target reached
        clearInterval(intervalId); // stop updating floor num
      }
    }, ELEVATOR_SPEED);

    setTimeout(() => {
      endMoveAndRecurse(DELAY_BETWEEN_MOVES); // pause before moving to next floor
    }, travelTime);
  }
}




// catch floor btn click thru event bubbling
document.querySelector('.floor-btn-panel').addEventListener('click', (e) => {
  const floorNum = Number(e.target.innerText);
  if (floorNum) { // not NaN
    document.querySelector(`#floor${floorNum}`).classList.add('floor-selected'); // highlight btn
    addFloor(floorNum);
  }
})


// hide settings form
function closeSettings() {
  document.querySelector('.settings').classList.add('hide');
  document.querySelector('.backdrop').classList.add('hide');
}


// hide settings form on outside click
document.querySelector('.backdrop').addEventListener('click', closeSettings)


// toggle settings form display
document.querySelector('.toggle-settings').addEventListener('click', () => {
  document.querySelector('.settings').classList.toggle('hide');
  document.querySelector('.backdrop').classList.toggle('hide');

  // reset form to original values if exiting without saving
  document.querySelector('#floors').value = elevator.totalFloors;
  document.querySelector('#city').value = elevator.city;
});



document.querySelector('.settings').addEventListener('submit', (e) => {
  e.preventDefault(); // prevent form submit

  // update floor btns
  elevator.totalFloors = Number(document.querySelector('#floors').value);
  createFloorBtns();

  // update background image
  const city = document.querySelector('#city').value;
  elevator.city = city;
  document.querySelector('.window').style.backgroundImage = `url("assets/${city.toLowerCase().replaceAll(' ', '-')}.jpg")`;

  // reset elevator settings
  elevator.queue = [];
  elevator.direction = 1;

  updateCurrentFloor(1);
  document.querySelector('.window').style.transition = 'background-position none'; // temp transition override
  document.querySelector('.window').style.backgroundPosition = '0 100%'; // move to bottom of image
  document.querySelector('.window').style.transition = 'background-position linear'; // reset transition

  closeSettings();   // close settings form
})
const holidays = [
  {
    hdate: "01-01-2023",
    holiday: "New Year Day",
  },
  {
    hdate: "07-04-2023",
    holiday: "Good Friday",
  },
  {
    hdate: "01-05-2023",
    holiday: "May Day",
  },
  {
    hdate: "31-10-2023",
    holiday: "Halloween",
  },
  {
    hdate: "25-12-2023",
    holiday: "Christmas",
  },
];

const radioIdToColor = {
  Shayla: "eventone",
  Tessa: "eventtwo",
  Angelo: "eventthree",
  Lee: "eventfour",
  Brendley: "eventfive",
};

const calendar = document.querySelector("#calendar");
const monthBanner = document.querySelector("#month");
let navigation = 0;
let clicked = null;
let events = localStorage.getItem("events")
  ? JSON.parse(localStorage.getItem("events"))
  : {};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function loadCalendar() {
  const dt = new Date();

  if (navigation !== 0) {
    dt.setMonth(new Date().getMonth() + navigation);
  }
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  monthBanner.innerText = `${dt.toLocaleDateString("en-us", {
    month: "long",
  })} ${year}`;
  calendar.innerHTML = "";
  const dayInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayofMonth = new Date(year, month, 1);
  const dateText = firstDayofMonth.toLocaleDateString("en-us", {
    weekday: "long",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  // Extract the day string and find its index in the weekdays array
  const dayString = dateText.split(", ")[0];
  const emptyDays = weekdays.indexOf(dayString);
  
  // Loop through each day in the month
  for (let i = 1; i <= dayInMonth + emptyDays; i++) {
    const dayBox = document.createElement("div");
    dayBox.classList.add("day");
    // Format the month and date values with leading zeros if necessary
    const monthVal = month + 1 < 10 ? "0" + (month + 1) : month + 1;
    const dateVal = i - emptyDays < 10 ? "0" + (i - emptyDays) : i - emptyDays;
    const dateText = `${dateVal}-${monthVal}-${year}`;
    /// Check if the current day is greater than the empty days
    if (i > emptyDays) {
      dayBox.innerText = i - emptyDays;

      // Check if there are events for the current day
      const eventsOfTheDay = events[dateText] || [];

      // Check if there is a holiday for the current day
      const holidayOfTheDay = holidays.find((e) => e.hdate === dateText);

      if (i - emptyDays === day && navigation === 0) {
        dayBox.id = "currentDay";
      }
      // Add event divs for each event of the day
      if (eventsOfTheDay.length > 0) {
        eventsOfTheDay.forEach((eventOfTheDay) => {
          const eventDiv = document.createElement("div");
          if (eventOfTheDay.classmate) {
            const eventColor = radioIdToColor[eventOfTheDay.classmate];
            eventDiv.classList.add(eventColor);
          }
          dayBox.appendChild(eventDiv);
        });
      }
      // Add a holiday event div if there is a holiday for the day
      if (holidayOfTheDay) {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event");
        eventDiv.classList.add("holiday");
        eventDiv.innerText = holidayOfTheDay.holiday;
        dayBox.appendChild(eventDiv);
      }
      // Add a click event listener to show a modal when a day is clicked
      dayBox.addEventListener("click", () => {
        showModal(dateText);
      });
    } else {
      //Add a plain class to days before the first day of the month
      dayBox.classList.add("plain");
    }
    //Apprnd the day box to the calendar
    calendar.append(dayBox);
  }
}

function buttons() {
  const btnBack = document.querySelector("#btnBack");
  const btnNext = document.querySelector("#btnNext");
  const btnDelete = document.querySelector("#btnDelete");
  const btnSave = document.querySelector("#btnSave");
  const closeButtons = document.querySelectorAll(".btnClose");
  const txtTitle = document.querySelector("#txtTitle");
  const btnFindAvailableTime = document.querySelector("#btnFindAvailableTime");

  //Back Button for Months
  btnBack.addEventListener("click", () => {
    navigation--;
    loadCalendar();
  });

  //Next Button for Months
  btnNext.addEventListener("click", () => {
    navigation++;
    loadCalendar();
  });

  modal.addEventListener("click", closeModal);
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  //Delete Button
  btnDelete.addEventListener("click", function () {
    events = events.filter((e) => e.date !== clicked);
    localStorage.setItem("events", JSON.stringify(events));
    closeModal();
  });

  // Save Button
  btnSave.addEventListener("click", function () {
    if (txtTitle.value) {
      txtTitle.classList.remove("error");
      const dateText = clicked;

      if (!events[dateText]) {
        events[dateText] = [];
      }

      const selectedUserRadioButton = document.querySelector('input[name="classmate"]:checked');
      if (selectedUserRadioButton) {
        const selectedUser = selectedUserRadioButton.value;
        const startTime = document.querySelector("#starttime").value;
        const endTime = document.querySelector("#endtime").value;

        const event = {
          title: txtTitle.value.trim(),
          classmate: selectedUser,
          startTime: startTime,
          endTime: endTime,
        };

        events[dateText].push(event);

        txtTitle.value = "";
        localStorage.setItem("events", JSON.stringify(events));
        closeModal();
      } else {
       console.log("Please select a user.");
     }
  } else {
    txtTitle.classList.add("error");
  }
});

btnFindAvailableTime.addEventListener("click", () => {
  findAvailableTime(clicked);
});

}

const modal = document.querySelector("#modal");
const viewEventForm = document.querySelector("#viewEvent");
const addEventForm = document.querySelector("#addEvent");

function formatTime12Hr(date) {
  const options = { hour: 'numeric', minute: '2-digit', hour12: true };
  return date.toLocaleTimeString('en-US', options);
}

function findAvailableTime(dateText) {
  const eventsOfTheDay = events[dateText] || [];

  // Sort events based on start time
  const sortedEvents = eventsOfTheDay.sort((a, b) => {
    const aTime = parseTime(`1999-01-01T${a.startTime}`);
    const bTime = parseTime(`1999-01-01T${b.startTime}`);
    return aTime - bTime;
  });

  console.log('Sorted Events:', sortedEvents);

  const availableTimes = [];

  if (sortedEvents.length === 0) {
    // If no events, the whole day is available
    availableTimes.push("12:00 AM - 11:59 PM");
  } else {
    // Check gaps between events
    let currentEnd = new Date('1999-01-01T00:00:00');

    // Loop through sorted events to find available time slots
    for (const event of sortedEvents) {
      const eventStart = parseTime(`1999-01-01T${event.startTime}`);
      const eventEnd = parseTime(`1999-01-01T${event.endTime}`);
    
      console.log('Current Event:', event);
      console.log('Event Start:', eventStart);
      console.log('Event End:', eventEnd);
    
      // Check if there is a gap between the current end time and the next event start time
      if (currentEnd.getTime() < eventStart.getTime()) {
        // Add the gap as an available time slot
        availableTimes.push(`${formatTime12Hr(currentEnd)} - ${formatTime12Hr(eventStart)}`);
      }
    
      currentEnd = eventEnd;
    }

    // Check if there is a gap after the last event
    if (currentEnd.getTime() < new Date('1999-01-02T00:00:00').getTime()) {
      // Add the gap after the last event as an available time slot
      availableTimes.push(`${formatTime12Hr(currentEnd)} - 11:59 PM`);
    }
  }

  // Log the available time slots for debugging or analysis
  console.log('Available Times:', availableTimes);

  // Display or use the availableTimes array as needed
  if (availableTimes.length > 0) {
    // Show an alert with the available time slots
    alert(`Available Times:\n${availableTimes.join('\n')}`);
  } else {
    // Show an alert if there are no available time slots
    alert('No available time on this date.');
  }
}

function parseTime(timeString) {
  // Use a regular expression to match time components in the provided string
  const match = timeString.match(/(\d+):(\d+)\s*(?:([APMapm]{2}))?/);

  // Check if the regular expression match was successful
  if (!match) {
    // Throw an error if the time format is invalid
    throw new Error('Invalid time format');
  }

  // Destructure the matched components from the regex result
  const [, hours, minutes, ampm] = match;
  // Parse hours as an integer
  let hours24 = parseInt(hours, 10);

  // Adjust hours for AM/PM format if provided
  if (ampm && (ampm.toLowerCase() === 'pm' || ampm.toLowerCase() === 'am')) {
    // If PM and not 12:00 PM, add 12 hours to convert to 24-hour format
    hours24 = (ampm.toLowerCase() === 'pm' && hours24 !== 12 ? hours24 + 12 : hours24) % 24;
  }

  
  return new Date('1999-01-01T' + hours24.toString().padStart(2, '0') + ':' + minutes);
}

//Displays a modal for viewing and adding events for a specific date.
function showModal(dateText) {
  clicked = dateText;
  showIndividualEvents(dateText);
  const eventsOfTheDay = events[dateText] || [];

  if (eventsOfTheDay.length > 0) {
    const eventText = document.querySelector("#eventText");
    eventText.innerText = "";
    document.querySelector("#eventText").innerText = eventsOfTheDay
      .map((event) => event.title)
      .join("\n");
    viewEventForm.style.display = "block";

    const addEventButton = viewEventForm.querySelector("#addEventButton");
    if (!addEventButton) {
      const addEventButton = document.createElement("button");
      addEventButton.textContent = "Add Event";
      addEventButton.classList.add("add-event-button");
      addEventButton.id = "addEventButton";
      addEventButton.addEventListener("click", () => {
        addEventForm.style.display = "block";
        viewEventForm.style.display = "none";
      });
      viewEventForm.appendChild(addEventButton);
    }
  } else {
    addEventForm.style.display = "block";
  }
  modal.style.display = "block";
}

function showIndividualEvents(dateText) {
  // Get events for the specified date or an empty array if none exist
  const eventsOfTheDay = events[dateText] || [];
  // Get the eventList element from the DOM
  const eventList = document.querySelector("#eventList");
  // Clear the existing content of eventList
  eventList.innerHTML = "";

  // Check if there are events for the specified date
  if (eventsOfTheDay.length > 0) {
    // Loop through each event of the day
    eventsOfTheDay.forEach((event, index) => {
      // Create a div element for each event
      const eventDiv = document.createElement("div");
      eventDiv.classList.add("individual-event");

      // Create a span element for the event title, classmate, start time, and end time
      const eventTitleElement = document.createElement("span");
      eventTitleElement.innerText = `${event.title},  ${event.classmate},  ${event.startTime} - ${event.endTime}`;

      // Create a delete button for each event
      const deleteButton = document.createElement("button");
      deleteButton.innerText = "Delete";
      // Add a click event listener to the delete button
      deleteButton.addEventListener("click", () => {
        // Remove the selected event from the events array
        events[dateText].splice(index, 1);
        // Update the events in local storage
        localStorage.setItem("events", JSON.stringify(events));
        // Refresh the displayed events for the date
        showIndividualEvents(dateText);
      });

      eventDiv.appendChild(eventTitleElement);
      eventDiv.appendChild(deleteButton);
      eventList.appendChild(eventDiv);
    });
  } else {
    const noEventsMessage = document.createElement("p");
    noEventsMessage.innerText = "No events for this date.";
    eventList.appendChild(noEventsMessage);
  }

  const eventText = document.querySelector("#eventText");
  eventText.innerText = "";
}

//Close the diaplay modal when "close" button is clicked
function closeModal() {
  viewEventForm.style.display = "none";
  addEventForm.style.display = "none";
  modal.style.display = "none";
  clicked = null;
  loadCalendar();
}

buttons();
loadCalendar();
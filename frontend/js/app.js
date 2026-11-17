
// CLÍNICA DENTAL SOMRIURE
// Sistema de reserves i assistent virtual

const bookingForm = document.getElementById("booking-form");
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const bookingStatus = document.getElementById("booking-status");

// Guardar reserves de demostració al navegador
function getBookings() {
  try {
    return JSON.parse(localStorage.getItem("somriureBookings")) || [];
  } catch {
    return [];
  }
}

function saveBookings(bookings) {
  localStorage.setItem("somriureBookings", JSON.stringify(bookings));
}

// Data mínima: avui
const today = new Date();
const todayString = [
  today.getFullYear(),
  String(today.getMonth() + 1).padStart(2, "0"),
  String(today.getDate()).padStart(2, "0")
].join("-");

dateInput.min = todayString;

// Generar horaris disponibles
dateInput.addEventListener("change", () => {
  const selectedDate = dateInput.value;

  timeSelect.innerHTML = "";
  timeSelect.disabled = true;

  if (!selectedDate) return;

  const date = new Date(selectedDate + "T12:00:00");
  const day = date.getDay();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Selecciona una hora";
  timeSelect.appendChild(placeholder);

  if (day === 0) {
    placeholder.textContent = "La clínica està tancada";
    return;
  }

  const start = 9 * 60;
  const end = day === 6 ? 13 * 60 : 18 * 60;

  const bookings = getBookings();

  for (let minutes = start; minutes < end; minutes += 30) {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mins = String(minutes % 60).padStart(2, "0");
    const time = `${hours}:${mins}`;

    const alreadyBooked = bookings.some(
      booking => booking.date === selectedDate &&
                booking.time === time
    );

    if (!alreadyBooked) {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    }
  }

  timeSelect.disabled = false;

  if (timeSelect.options.length === 1) {
    placeholder.textContent = "No hi ha hores disponibles";
    timeSelect.disabled = true;
  }
});

// Confirmació de reserva
bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(bookingForm);

  const booking = {
    name: formData.get("name").trim(),
    phone: formData.get("phone").trim(),
    service: formData.get("service"),
    date: formData.get("date"),
    time: formData.get("time")
  };

  if (!booking.name || !booking.phone ||
      !booking.service || !booking.date || !booking.time) {
    showBookingMessage("Completa tots els camps.", false);
    return;
  }

  const selectedDate = new Date(booking.date + "T12:00:00");
  const now = new Date();

  if (selectedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    showBookingMessage("No pots reservar en una data passada.", false);
    return;
  }

  const day = selectedDate.getDay();
  const [hour, minute] = booking.time.split(":").map(Number);
  const totalMinutes = hour * 60 + minute;

  if (day === 0 || totalMinutes < 540 ||
      totalMinutes >= (day === 6 ? 780 : 1080)) {
    showBookingMessage("Aquest horari no està disponible.", false);
    return;
  }

  if (booking.date === todayString &&
      totalMinutes <= now.getHours() * 60 + now.getMinutes()) {
    showBookingMessage("Selecciona una hora futura.", false);
    return;
  }

  const bookings = getBookings();

  const occupied = bookings.some(
    item => item.date === booking.date &&
            item.time === booking.time
  );

  if (occupied) {
    showBookingMessage("Aquesta hora ja està reservada. Selecciona'n una altra.", false);
    return;
  }

  booking.id = Date.now();

  bookings.push(booking);
  saveBookings(bookings);

  showBookingMessage(
    `Reserva confirmada! ${booking.name}, t'esperem el ${booking.date} a les ${booking.time}.`,
    true
  );

  bookingForm.reset();
  timeSelect.innerHTML = '<option value="">Primer selecciona una data</option>';
  timeSelect.disabled = true;
});

function showBookingMessage(message, success) {
  bookingStatus.textContent = message;
  bookingStatus.className = success ? "success" : "error";
}

// Eventos básicos conectados a funciones vacías: ya se puede ver dónde trabajar.
bookingForm.elements.date.addEventListener('change', loadAvailability);
bookingForm.addEventListener('submit', submitReservation);
chatForm.addEventListener('submit', sendMessage);
loadBusiness();
// Cambio da igual esto

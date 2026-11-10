
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

// ASSISTENT VIRTUAL

const chatForm = document.getElementById("chat-form");
const messages = document.getElementById("messages");

function addMessage(message, type) {
  const element = document.createElement("div");
  element.className = type === "user" ? "user-message" : "bot-message";
  element.textContent = message;

  messages.appendChild(element);
  messages.scrollTop = messages.scrollHeight;
}

function getBotResponse(question) {
  const text = question.toLowerCase();

  if (text.includes("horari") || text.includes("hora") || text.includes("obert")) {
    return "El nostre horari és de dilluns a divendres de 09:00 a 18:00 i dissabtes de 09:00 a 13:00.";
  }

  if (text.includes("preu") || text.includes("cost")) {
    return "Els preus depenen del tractament. Contacta amb nosaltres per obtenir un pressupost personalitzat.";
  }

  if (text.includes("neteja")) {
    return "Oferim neteges dentals professionals per eliminar la placa i el carrall. Pots reservar una cita a la nostra web.";
  }

  if (text.includes("blanquejament")) {
    return "Disposem de tractaments de blanquejament dental. El nostre equip t'informarà de les opcions disponibles.";
  }

  if (text.includes("ortodon") || text.includes("bràquet") || text.includes("brackets")) {
    return "Tenim servei d'ortodòncia per corregir la posició de les dents. Demana una primera visita!";
  }

  if (text.includes("reserva") || text.includes("cita")) {
    return "Pots reservar una cita des de l'apartat 'Reserva una cita', seleccionant el tractament, la data i l'hora.";
  }

  if (text.includes("hola") || text.includes("bon dia") || text.includes("bona tarda")) {
    return "Hola! Benvingut a Clínica Dental Somriure. En què et puc ajudar?";
  }

  if (text.includes("gràcies") || text.includes("gracies")) {
    return "De res! Estem encantats d'ajudar-te. Que tinguis un bon dia!";
  }

  if (text.includes("contacte") || text.includes("telèfon")) {
    return "Pots consultar els nostres horaris i reservar una cita des d'aquesta mateixa pàgina.";
  }

  return "No tinc aquesta informació. Pots consultar-ho amb el nostre equip de la clínica. Et puc ajudar amb horaris, serveis i reserves.";
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const input = chatForm.elements.message;
  const question = input.value.trim();

  if (!question) return;

  addMessage(question, "user");
  input.value = "";

  // Resposta automàtica de demostració
  setTimeout(() => {
    addMessage(getBotResponse(question), "bot");
  }, 400);
});

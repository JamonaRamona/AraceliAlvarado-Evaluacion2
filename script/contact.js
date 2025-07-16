$(document).ready(function () {
let editingIndex = -1; // -1 porque no estamos editando

//cargar paises desde la API
$.ajax({
    url: "https://restcountries.com/v3.1/lang/spanish",
    method: "GET",
    success: function (data) {
        $('#country').empty();
        $('#country').append('<option value="">Selecciona tu país</option>');
        data.forEach(function (country) {
            const commonName = country.name.common;
            const officialName = country.translations?.spa?.official || country.name.official;
            $('#country').append(
                `<option value="${commonName}" data-official="${officialName}">${commonName}</option>`
            );
        });
    },
    error: function () {
        alert("No se pudo cargar la lista de países");
    }
});

//mostrar nombre oficial del pais
$('#country').on('change', function () {
    const selected = $(this).find('option:selected');
    const official = selected.data('official') || '';
    $('#officialName').val(official);
});

//inicializar lista de contactos
let contactList = JSON.parse(localStorage.getItem('contacts')) || [];
renderTable();

//validacion de los campos del formulario
$('#submitForm').on('click', function () {
    let errors = [];
    let name = $('#fullName').val().trim();
    let phone = $('#phone').val().trim();
    let email = $('#email').val().trim();
    let country = $('#country').val().trim();
    let comments = $('#comments').val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name === '') errors.push('El nombre es obligatorio.');
    if (phone === '') { errors.push('El teléfono es obligatorio.'); }
    else if (!/^\+?\d{8,15}$/.test(phone)) { errors.push('El teléfono debe contener solo números y tener entre 8 y 15 dígitos.'); }
    if (email === '') errors.push('El correo electrónico es obligatorio.');
    else if (!emailRegex.test(email)) errors.push('El correo electrónico no tiene un formato válido.');
    if (country === '') errors.push('Debe seleccionar un país.');
    if (comments === '') errors.push('Debe ingresar un comentario.');

    if (errors.length > 0) {
        $('#errorList').empty();
        errors.forEach(error => $('#errorList').append('<li>' + error + '</li>'));

        $('#errorContainer').show();
    }
    else {
        $('#errorContainer').hide();
        const newContact = { fullName: name, phone, email, country, comments };

        if (editingIndex !== -1) {
            contactList[editingIndex] = newContact;
            editingIndex = -1;
            alert('¡Contacto actualizado correctamente!');
        }
        else {
            contactList.push(newContact);
            alert('¡Hemos recibido tu mensaje!');
        }

        localStorage.setItem('contacts', JSON.stringify(contactList));
        renderTable();
        $('#contactForm')[0].reset();
        $('#officialName').val('');
    }
});

//limpiar formulario
$('#resetForm').on('click', function () {
    $('#contactForm')[0].reset();           //resetea los inputs del formulario
    $('#officialName').val('');             //limpia campo deshabilitado
    $('#errorContainer').hide();            //oculta errores
});


//renderizar tabla
function renderTable() {
    const tbody = $('#contactsTable tbody');
    tbody.empty();
    contactList.forEach((contact, index) => {
        tbody.append(`
<tr>
<td>${contact.fullName}</td>
<td>${contact.phone}</td>
<td>${contact.email}</td>
<td>${contact.country}</td>
<td>${contact.comments}</td>
<td>
    <button class="btn btn-sm btn-warning edit-btn" data-index="${index}" title="Editar">
        <i class="bi bi-pencil-square"></i>
    </button>
    <button class="btn btn-sm btn-danger delete-btn" data-index="${index}" title="Eliminar">
        <i class="bi bi-trash-fill"></i>
    </button>
</td>
</tr>
`);
    });
};

//eliminar contacto (DELETE)
$('#contactsTable').on('click', '.delete-btn', function () {
    const index = $(this).data('index');
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este contacto?");

    if (confirmDelete) {
        contactList.splice(index, 1);
        localStorage.setItem('contacts', JSON.stringify(contactList));
        renderTable();
    }
});

//modificar contacto (UPDATE)
$(document).on('click', '.edit-btn', function () {
    const index = $(this).data('index');
    const contact = contactList[index];

    $('#fullName').val(contact.fullName);
    $('#phone').val(contact.phone);
    $('#email').val(contact.email);
    $('#country').val(contact.country).trigger('change'); // para que cargue el nombre oficial
    $('#comments').val(contact.comments);

    editingIndex = index;
    alert('Edita el contacto y luego haz clic en "Enviar" para guardar los cambios.');
});


});
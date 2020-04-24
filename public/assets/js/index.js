let $noteTitle = $(".note-title");
let $noteText = $(".note-textarea");
let $saveNoteBtn = $(".save-note");
let $newNoteBtn = $(".new-note");
let $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
let activeNote = {};

// A function for getting all notes from the db
let getNotes = function () {
  return $.ajax({
    url: "/api/notes",
    method: "GET",
  });
};

// A function for saving a note to the db
let saveNote = function (note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST",
  });
};

// A function for deleting a note from the db
let deleteNote = function (id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE",
  });
};

// A function for editing a note from the db
let editNote = function (id, newNote) {
  return $.ajax({
    url: "api/notes/" + id,
    data: newNote,
    method: "PUT",
  });
};

// If there is an activeNote, display it as read-only, otherwise render empty inputs
let renderActiveNote = function () {
  $saveNoteBtn.hide();

  if (activeNote.id) {
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
  } else {
    $noteTitle.val("");
    $noteText.val("");
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
  }
};

// Get the note data from the inputs, save the new note/updated note to the db ,and update the view
let handleNoteSave = async function () {
  let newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
    id: $noteTitle.val().replace(/\s+/g, "-").toLowerCase(),
  };

  //check if the note is a new note or an existing note to update
  if (!activeNote.id) {
    await saveNote(newNote);
  } else {
    await editNote(activeNote.id, newNote);
  }
  //update the view with the saved note
  activeNote = newNote;
  getAndRenderNotes();
  renderActiveNote();
};

// Delete the clicked note
let handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  let note = $(this).parent(".list-group-item").data();

  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(function () {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// edit the clicked note
let noteEditMode = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();

  //render the note clicked to the right
  activeNote = $(this).parent().data();
  renderActiveNote();

  //set the attribute as editable
  $noteTitle.attr("readonly", false);
  $noteText.attr("readonly", false);
};

// Get the note data from the inputs, save it to the db and update the view
let handleNoteEdit = function () {
  event.stopPropagation();
  let newNote = {
    title: $noteTitle.val(),
    text: $noteText.val(),
    id: $noteTitle.val().replace(/\s+/g, "-").toLowerCase(),
  };

  editNote(newNote).then(function (data) {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
let handleNoteView = function () {
  activeNote = $(this).data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
let handleNewNoteView = function () {
  activeNote = {};
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
let handleRenderSaveBtn = function () {
  if (!$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
  }
};

// Render's the list of note titles
let renderNoteList = function (notes) {
  $noteList.empty();

  let noteListItems = [];

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let $li = $(
      "<li class='list-group-item list-group-item-action id='" + note.id + ">'"
    ).data(note);
    let $span = $("<span>").text(note.title);
    let $editBtn = $("<i class='fas fa-pen float-right edit-note'>");
    let $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note ml-2'>"
    );

    $li.append($span, $delBtn, $editBtn);
    noteListItems.push($li);
  }

  $noteList.append(noteListItems);
};

// Gets notes from the db and renders them to the sidebar
let getAndRenderNotes = function () {
  return getNotes().then(function (data) {
    renderNoteList(data);
  });
};

$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteList.on("click", ".edit-note", noteEditMode);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();

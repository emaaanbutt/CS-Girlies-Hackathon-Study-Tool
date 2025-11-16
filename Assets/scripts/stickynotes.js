$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });
});

$(document).ready(function() {
    console.log('Sticky Notes loaded!');

    // Load notes from localStorage
    let notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];

    // Note colors palette
    const colors = [
        '#fef68a', // Yellow (default)
        '#ffb7c5', // Pink
        '#a8e6cf', // Mint green
        '#ffd3b6', // Peach
        '#d4a5a5', // Mauve
        '#aec6cf', // Sky blue
        '#fdfd96', // Pastel yellow
        '#b19cd9', // Lavender
        '#fff9c4', // Light yellow
        '#ffe4e1'  // Misty rose
    ];
    

    let draggedNote = null;
    let offsetX = 0;
    let offsetY = 0;

    // Save notes to localStorage
    function saveNotes() {
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
        console.log(`Saved ${notes.length} notes`);
    }

    // Generate unique ID
    function generateId() {
        return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get random color
    function getRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Get random position
    function getRandomPosition() {
        const boardWidth = $('#notes-board').width();
        const boardHeight = $('#notes-board').height();
        const noteWidth = 160;
        const noteHeight = 160;

        // Random position with some padding
        const maxX = boardWidth - noteWidth - 20;
        const maxY = boardHeight - noteHeight - 20;

        const x = Math.max(20, Math.floor(Math.random() * maxX));
        const y = Math.max(20, Math.floor(Math.random() * maxY));

        return { x, y };
    }

    // Create note element
    function createNoteElement(note) {
        const $note = $('<div>', {
            class: 'sticky-note',
            'data-id': note.id
        });

        $note.css({
            'top': note.y + 'px',
            'left': note.x + 'px',
            'background-color': note.color
        });

        $note.html(`
            <div class="note-header">
                <button class="note-btn color-btn" title="Change color">🎨</button>
                <button class="note-btn edit-btn" title="Edit">✏️</button>
                <button class="note-btn delete-btn" title="Delete">🗑️</button>
            </div>
            <textarea class="sticky-text" placeholder="Write your note here..." maxlength="500" readonly>${note.text}</textarea>
        `);

        return $note;
    }

    // Render all notes
    function renderNotes() {
        $('#notes-board').empty();

        if (notes.length === 0) {
            $('#notes-board').html(`
                <div class="empty-state">
                    <p style="text-align: center; padding: 50px; color: #7a5d00; font-size: 1.2rem;">
                        📝 No notes yet!<br>
                        Click "Add Note" to create one.
                    </p>
                </div>
            `);
            return;
        }

        notes.forEach(function(note) {
            const $noteElement = createNoteElement(note);
            $('#notes-board').append($noteElement);
        });

        attachNoteEvents();
        console.log(`Rendered ${notes.length} notes`);
    }

    // Add new note
    $('#add-note-btn').click(function() {
        const position = getRandomPosition();
        
        const newNote = {
            id: generateId(),
            text: '',
            color: getRandomColor(),
            x: position.x,
            y: position.y,
            createdAt: new Date().toISOString()
        };

        notes.push(newNote);
        saveNotes();
        renderNotes();

        // Focus on new note's textarea
        setTimeout(function() {
            $(`.sticky-note[data-id="${newNote.id}"] .sticky-text`).focus();
        }, 100);

        console.log('New note added');
    });

    // View all notes
    $('#view-notes-btn').click(function() {
        $('#notes-board').animate({ scrollTop: 0 }, 300);
        
        // Highlight all notes briefly
        $('.sticky-note').css('box-shadow', '0px 6px 20px rgba(252, 205, 76, 0.6)');
        setTimeout(function() {
            $('.sticky-note').css('box-shadow', '0px 4px 10px rgba(0,0,0,0.2)');
        }, 1000);
    });

    // Attach events to notes
    function attachNoteEvents() {
        // Update note text
        $('.sticky-text').off('input').on('input', function() {
            const noteId = $(this).closest('.sticky-note').data('id');
            const newText = $(this).val();
            
            const note = notes.find(n => n.id === noteId);
            if (note) {
                note.text = newText;
                saveNotes();
            }
        });

        // Delete note
        $('.delete-btn').off('click').on('click', function() {
            const $note = $(this).closest('.sticky-note');
            const noteId = $note.data('id');
            
            // Confirm if note has content
            const note = notes.find(n => n.id === noteId);
            if (note && note.text.trim().length > 0) {
                if (!confirm('🗑️ Delete this note?')) {
                    return;
                }
            }

            // Animate and remove
            $note.fadeOut(300, function() {
                notes = notes.filter(n => n.id !== noteId);
                saveNotes();
                renderNotes();
                console.log('🗑️ Note deleted');
            });
        });

         // Edit note
        $('.edit-btn').off('click').on('click', function() {
            const $note = $(this).closest('.sticky-note');
            const $textarea = $note.find('.sticky-text');
            
            // Toggle readonly state
            if ($textarea.prop('readonly')) {
                // Enable editing
                $textarea.prop('readonly', false);
                $textarea.focus();
                $textarea.css({
                    'border': '2px dashed #ffc94d',
                    'background': 'rgba(255, 255, 255, 0.5)'
                });
                $(this).text('💾'); 
                $(this).attr('title', 'Save');
            } else {
                // Disable editing
                $textarea.prop('readonly', true);
                $textarea.css({
                    'border': 'none',
                    'background': 'transparent'
                });
                $(this).text('✏️'); 
                $(this).attr('title', 'Edit');
                
                // Save the note
                const noteId = $note.data('id');
                const note = notes.find(n => n.id === noteId);
                if (note) {
                    note.text = $textarea.val();
                    saveNotes();
                    console.log('✏️ Note saved');
                }
            }
        });

        // Change color
        $('.color-btn').off('click').on('click', function(e) {
            e.stopPropagation();
            const $note = $(this).closest('.sticky-note');
            const noteId = $note.data('id');
            
            // Show color picker
            showColorPicker($note, noteId);
        });

        // Make notes draggable
        $('.sticky-note').off('mousedown').on('mousedown', function(e) {
            // Don't drag if clicking on textarea or buttons
            if ($(e.target).is('textarea') || $(e.target).is('button') || $(e.target).closest('button').length) {
                return;
            }

            draggedNote = $(this);
            draggedNote.css('cursor', 'grabbing');
            draggedNote.css('z-index', '100');

            const offset = draggedNote.offset();
            const boardOffset = $('#notes-board').offset();
            
            offsetX = e.pageX - offset.left;
            offsetY = e.pageY - offset.top;

            e.preventDefault();
        });
    }

    // Mouse move for dragging
    $(document).on('mousemove', function(e) {
        if (draggedNote) {
            const boardOffset = $('#notes-board').offset();
            const boardWidth = $('#notes-board').width();
            const boardHeight = $('#notes-board').height();

            let newX = e.pageX - boardOffset.left - offsetX;
            let newY = e.pageY - boardOffset.top - offsetY;

            // Keep note within bounds
            newX = Math.max(0, Math.min(newX, boardWidth - draggedNote.width()));
            newY = Math.max(0, Math.min(newY, boardHeight - draggedNote.height()));

            draggedNote.css({
                'left': newX + 'px',
                'top': newY + 'px'
            });
        }
    });

    // Mouse up - stop dragging
    $(document).on('mouseup', function() {
        if (draggedNote) {
            draggedNote.css('cursor', 'grab');
            draggedNote.css('z-index', '1');

            // Save new position
            const noteId = draggedNote.data('id');
            const note = notes.find(n => n.id === noteId);
            
            if (note) {
                note.x = parseInt(draggedNote.css('left'));
                note.y = parseInt(draggedNote.css('top'));
                saveNotes();
            }

            draggedNote = null;
        }
    });

    // Show color picker popup
    function showColorPicker($note, noteId) {
        // Remove existing picker
        $('.color-picker-popup').remove();

        const $picker = $('<div>', { class: 'color-picker-popup' });

        colors.forEach(color => {
            const $colorBtn = $('<button>', {
                class: 'color-option',
                'data-color': color
            });
            $colorBtn.css('background-color', color);
            $picker.append($colorBtn);
        });

        // Position picker near the note
        const noteOffset = $note.offset();
        $picker.css({
            'position': 'absolute',
            'top': (noteOffset.top - $('#notes-board').offset().top + 50) + 'px',
            'left': (noteOffset.left - $('#notes-board').offset().left) + 'px',
            'z-index': '200'
        });

        $('#notes-board').append($picker);

        // Color selection
        $picker.find('.color-option').click(function(e) {
            e.stopPropagation();
            const newColor = $(this).data('color');
            
            // Update note color
            const note = notes.find(n => n.id === noteId);
            if (note) {
                note.color = newColor;
                saveNotes();
                $note.css('background-color', newColor);
            }

            $picker.remove();
        });

        // Close on click outside
        setTimeout(function() {
            $(document).one('click', function() {
                $picker.remove();
            });
        }, 100);
    }

    // Prevent color picker from closing when clicking inside
    $(document).on('click', '.color-picker-popup', function(e) {
        e.stopPropagation();
    });

    renderNotes();

    // Welcome message
    console.log('Sticky Notes ready! Press Ctrl+N to add a note');
    console.log(`${notes.length} notes loaded`);
});
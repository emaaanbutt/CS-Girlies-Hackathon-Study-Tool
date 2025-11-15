//Back button functionality
$(document).ready(function() {
    $(".back-btn").on("click", function(){
    window.location.href = "../../Assets/pages/main.html"
    });
});

// To-Do List Functionality
$(document).ready(function() {
    console.log('To-Do List loaded!');

    // Load todos from localStorage
    let todos = JSON.parse(localStorage.getItem('todos')) || [];

    // Save todos to localStorage
    function saveTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        renderTodos();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update statistics
    function updateStats() {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        
        $('#total-tasks').text(`${total} ${total === 1 ? 'task' : 'tasks'}`);
        $('#completed-tasks').text(`${completed} completed`);
    }

    // Render todos
    function renderTodos() {
        const $list = $('#task-list');
        $list.empty();

        //show empty message if no tasks
        if (todos.length === 0) {
            $list.append(`
                <li class="empty-state">
                No tasks yet. Add one above!
                </li>
            `);
            updateStats();
            return;
        }

        // Add tasks to list
        todos.forEach((todo, index) => {
            
            const $li = $('<li>', {
                class: 'todo-item' + (todo.completed ? ' completed' : ''),
                'data-index': index
            });

            $li.html(`
                    <input type="checkbox" class="todo-checkbox" 
                           ${todo.completed ? 'checked' : ''} />
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    ${todo.deadline ? `<small class="todo-deadline"> | Due: ${todo.deadline}</small>` : ''}
               
                    <button class="edit-btn" title="Edit">✏️</button>
                    <button class="delete-btn" title="Delete">🗑️</button>
            `);

            $list.append($li);
        });

        updateStats();
    }

    // Add new todo
    function addTodo() {
        const text = $('#task-input').val().trim();
        const deadline = $('#task-deadline').val();
        
        if (text === '') {
            alert('⚠️ Please enter a task!');
            return;
        }

        if (text.length > 200) {
            alert('⚠️ Task is too long! Max 200 characters.');
            return;
        }

        todos.push({
            text: text,
            deadline: deadline || '',
            completed: false,
            createdAt: new Date().toISOString()
        });

        $('#task-input').val('').focus();
        $('#task-deadline').val('');
        saveTodos();

        // Animation
        $('#task-list li:last').hide().slideDown(300);
    }

    // Add task button click
    $('#add-task-btn').click(addTodo);


    // Toggle task completion
    $(document).on('change', '.todo-checkbox', function() {
        const index = $(this).closest('.todo-item').data('index');
        todos[index].completed = !todos[index].completed;
        saveTodos();
        
    });

    // Delete todo
    $(document).on('click', '.delete-btn', function() {
        const index = $(this).closest('.todo-item').data('index');
        if (confirm('🗑️ Delete this task?')) {
            // Animate removal
            $(this).closest('.todo-item').slideUp(300, function() {
                todos.splice(index, 1);
                saveTodos();
            });
        }
    });

    // Edit task
    $(document).on('click', '.edit-btn', function() {
        const $item = $(this).closest('.todo-item');
        const index = $item.data('index');
        const currentText = todos[index].text;
        const currentDeadline = todos[index].deadline || '';
        
        const newText = prompt('✏️ Edit task:', currentText);
        
        if (newText == null || newText.trim() === '') return;

        const newDeadline = prompt('📅 Edit deadline (YYYY-MM-DDTHH:MM):', currentDeadline);

        todos[index].text = newText.trim();
        todos[index].deadline = newDeadline ? newDeadline.trim() : '';
        saveTodos();
            
        
    });

    // Clear completed tasks
    $('#clear-completed').click(function() {
        const completedCount = todos.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            alert('ℹ️ No completed tasks to clear!');
            return;
        }

        if (confirm(`🗑️ Clear ${completedCount} completed task(s)?`)) {
            todos = todos.filter(t => !t.completed);
            saveTodos();
        }
    });

    // Clear all tasks
    $('#clear-all').click(function() {
        if (todos.length === 0) {
            alert('ℹ️ No tasks to clear!');
            return;
        }

        if (confirm('⚠️ Delete ALL tasks? This cannot be undone!')) {
            todos = [];
            saveTodos();
        }
    });

    renderTodos();
    $('#task-input').focus();

    console.log('To-Do List ready! Press Ctrl+K to add tasks');
});


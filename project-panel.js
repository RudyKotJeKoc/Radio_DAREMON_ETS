/**
 * PROJECT PANEL - Modern JavaScript Module
 * Unified project management system
 */

class ProjectPanel {
    constructor() {
        // Application state
        this.state = {
            tasks: [],
            equipment: [],
            users: [
                { id: 1, name: 'Administrator', initials: 'A', role: 'admin' },
                { id: 2, name: 'Roy', initials: 'R', role: 'manager' },
                { id: 3, name: 'Zespół ETS', initials: 'E', role: 'team' },
                { id: 4, name: 'Duif', initials: 'D', role: 'specialist' },
                { id: 5, name: 'Koot', initials: 'K', role: 'specialist' }
            ],
            currentTab: 'kanban',
            currentUser: 1,
            theme: 'light',
            filters: {
                gantt: { assignee: '', priority: '' },
                equipment: { search: '', type: '', status: '' }
            }
        };

        // DOM elements cache
        this.elements = {};
        
        // Event handlers binding
        this.handleTabSwitch = this.handleTabSwitch.bind(this);
        this.handleTaskAdd = this.handleTaskAdd.bind(this);
        this.handleEquipmentAdd = this.handleEquipmentAdd.bind(this);
        this.handleModalSubmit = this.handleModalSubmit.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleImport = this.handleImport.bind(this);
        
        // Initialize
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.showLoading(true);
            this.cacheElements();
            this.loadFromStorage();
            this.attachEventListeners();
            this.initializeData();
            this.render();
            this.showToast('Aplikacja załadowana pomyślnie', 'success');
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showToast('Błąd podczas ładowania aplikacji', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Cache frequently used DOM elements
     */
    cacheElements() {
        // Header elements
        this.elements.currentUser = document.getElementById('current-user');
        this.elements.themeToggle = document.getElementById('theme-toggle');
        
        // Dashboard elements
        this.elements.overallProgress = document.getElementById('overall-progress');
        this.elements.overallProgressBar = document.getElementById('overall-progress-bar');
        this.elements.completedTasks = document.getElementById('completed-tasks');
        this.elements.totalTasks = document.getElementById('total-tasks');
        
        // Status counts
        this.elements.todoCount = document.getElementById('todo-count');
        this.elements.inprogressCount = document.getElementById('inprogress-count');
        this.elements.blockedCount = document.getElementById('blocked-count');
        this.elements.doneCount = document.getElementById('done-count');
        
        // Equipment counts
        this.elements.equipmentTotal = document.getElementById('equipment-total');
        this.elements.equipmentPlanned = document.getElementById('equipment-planned');
        this.elements.equipmentActive = document.getElementById('equipment-active');
        this.elements.equipmentCompleted = document.getElementById('equipment-completed');
        
        // Team stats
        this.elements.teamStats = document.getElementById('team-stats');
        
        // Control buttons
        this.elements.addTaskBtn = document.getElementById('add-task-btn');
        this.elements.addEquipmentBtn = document.getElementById('add-equipment-btn');
        this.elements.exportBtn = document.getElementById('export-btn');
        this.elements.importBtn = document.getElementById('import-btn');
        
        // Tab elements
        this.elements.tabBtns = document.querySelectorAll('.tab-btn');
        this.elements.tabPanels = document.querySelectorAll('.tab-panel');
        
        // Content areas
        this.elements.kanbanBoard = document.getElementById('kanban-board');
        this.elements.ganttChart = document.getElementById('gantt-chart');
        this.elements.equipmentGrid = document.getElementById('equipment-grid');
        
        // Modal elements
        this.elements.modalOverlay = document.getElementById('modal-overlay');
        this.elements.modalTitle = document.getElementById('modal-title');
        this.elements.modalForm = document.getElementById('modal-form');
        this.elements.modalFields = document.getElementById('modal-fields');
        this.elements.modalClose = document.getElementById('modal-close');
        this.elements.modalCancel = document.getElementById('modal-cancel');
        
        // Filters
        this.elements.ganttFilterAssignee = document.getElementById('gantt-filter-assignee');
        this.elements.ganttFilterPriority = document.getElementById('gantt-filter-priority');
        this.elements.equipmentSearch = document.getElementById('equipment-search');
        this.elements.equipmentFilterType = document.getElementById('equipment-filter-type');
        this.elements.equipmentFilterStatus = document.getElementById('equipment-filter-status');
        
        // Utility elements
        this.elements.fileInput = document.getElementById('file-input');
        this.elements.toastContainer = document.getElementById('toast-container');
        this.elements.loadingOverlay = document.getElementById('loading-overlay');
        
        // Kanban columns
        this.elements.todoColumn = document.getElementById('todo-column');
        this.elements.inprogressColumn = document.getElementById('inprogress-column');
        this.elements.blockedColumn = document.getElementById('blocked-column');
        this.elements.doneColumn = document.getElementById('done-column');
        
        // Kanban column counts
        this.elements.todoColumnCount = document.getElementById('todo-column-count');
        this.elements.inprogressColumnCount = document.getElementById('inprogress-column-count');
        this.elements.blockedColumnCount = document.getElementById('blocked-column-count');
        this.elements.doneColumnCount = document.getElementById('done-column-count');
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Tab navigation
        this.elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', this.handleTabSwitch);
        });
        
        // Control buttons
        this.elements.addTaskBtn.addEventListener('click', this.handleTaskAdd);
        this.elements.addEquipmentBtn.addEventListener('click', this.handleEquipmentAdd);
        this.elements.exportBtn.addEventListener('click', this.handleExport);
        this.elements.importBtn.addEventListener('click', this.handleImport);
        this.elements.themeToggle.addEventListener('click', this.handleThemeToggle);
        
        // Modal events
        this.elements.modalForm.addEventListener('submit', this.handleModalSubmit);
        this.elements.modalClose.addEventListener('click', this.handleModalClose);
        this.elements.modalCancel.addEventListener('click', this.handleModalClose);
        this.elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.modalOverlay) {
                this.handleModalClose();
            }
        });
        
        // File input
        this.elements.fileInput.addEventListener('change', this.handleFileImport.bind(this));
        
        // Filter inputs
        if (this.elements.ganttFilterAssignee) {
            this.elements.ganttFilterAssignee.addEventListener('change', this.handleFilterChange.bind(this));
        }
        if (this.elements.ganttFilterPriority) {
            this.elements.ganttFilterPriority.addEventListener('change', this.handleFilterChange.bind(this));
        }
        if (this.elements.equipmentSearch) {
            this.elements.equipmentSearch.addEventListener('input', this.debounce(this.handleFilterChange.bind(this), 300));
        }
        if (this.elements.equipmentFilterType) {
            this.elements.equipmentFilterType.addEventListener('change', this.handleFilterChange.bind(this));
        }
        if (this.elements.equipmentFilterStatus) {
            this.elements.equipmentFilterStatus.addEventListener('change', this.handleFilterChange.bind(this));
        }
        
        // Kanban column add buttons
        document.querySelectorAll('.add-task-column').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.currentTarget.dataset.status;
                this.handleTaskAdd(status);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.handleTaskAdd();
                    break;
                case 'e':
                    e.preventDefault();
                    this.handleExport();
                    break;
                case 'Escape':
                    this.handleModalClose();
                    break;
            }
        }
    }

    /**
     * Initialize sample data if storage is empty
     */
    initializeData() {
        if (this.state.tasks.length === 0 && this.state.equipment.length === 0) {
            this.state.tasks = [
                {
                    id: this.generateId(),
                    name: "Przygotowanie wtryskarki MC22 do transportu",
                    status: "todo",
                    assignee: "Roy",
                    category: "Wtryskarki",
                    priority: "high",
                    startDate: "2025-01-15",
                    endDate: "2025-01-30",
                    equipmentId: null,
                    notes: "Wymaga specjalnego demontażu",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: "Demontaż Cleanroom Lijn 1",
                    status: "inprogress",
                    assignee: "Zespół ETS",
                    category: "Cleanroom",
                    priority: "high",
                    startDate: "2025-01-10",
                    endDate: "2025-02-15",
                    equipmentId: null,
                    notes: "Sterylne środowisko - specjalne procedury",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: "Stamping ontmantelen",
                    status: "todo",
                    assignee: "Duif",
                    category: "Stamping",
                    priority: "medium",
                    startDate: "2025-02-01",
                    endDate: "2025-02-28",
                    equipmentId: null,
                    notes: "Ciężki sprzęt - dźwig wymagany",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];

            this.state.equipment = [
                {
                    id: this.generateId(),
                    name: "Wtryskarka MC22",
                    type: "Wtryskarka",
                    destination: "CZ",
                    status: "planned",
                    czWishlist: true,
                    notes: "Priorytet dla oddziału CZ",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: "Cleanroom Lijn 1",
                    type: "Linia produkcyjna",
                    destination: "Mex",
                    status: "dismantling",
                    czWishlist: false,
                    notes: "Transfer do Meksyku",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    name: "Stamping Press 500T",
                    type: "Prasa",
                    destination: "Verschrot",
                    status: "planned",
                    czWishlist: false,
                    notes: "Na złom - stary sprzęt",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            ];
            
            this.saveToStorage();
        }
    }

    /**
     * Load data from localStorage
     */
    loadFromStorage() {
        try {
            const savedTasks = localStorage.getItem('radio_planner_tasks');
            const savedEquipment = localStorage.getItem('radio_planner_equipment');
            const savedTheme = localStorage.getItem('radio_planner_theme');
            const savedUser = localStorage.getItem('radio_planner_user');
            
            if (savedTasks) {
                this.state.tasks = JSON.parse(savedTasks);
            }
            if (savedEquipment) {
                this.state.equipment = JSON.parse(savedEquipment);
            }
            if (savedTheme) {
                this.state.theme = savedTheme;
                this.applyTheme(savedTheme);
            }
            if (savedUser) {
                this.state.currentUser = parseInt(savedUser);
            }
        } catch (error) {
            console.error('Failed to load from storage:', error);
            this.showToast('Błąd podczas ładowania danych', 'error');
        }
    }

    /**
     * Save data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem('radio_planner_tasks', JSON.stringify(this.state.tasks));
            localStorage.setItem('radio_planner_equipment', JSON.stringify(this.state.equipment));
            localStorage.setItem('radio_planner_theme', this.state.theme);
            localStorage.setItem('radio_planner_user', this.state.currentUser.toString());
        } catch (error) {
            console.error('Failed to save to storage:', error);
            this.showToast('Błąd podczas zapisywania danych', 'error');
        }
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Debounce function for input handlers
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Render all components
     */
    render() {
        this.renderDashboard();
        this.renderCurrentView();
        this.renderFilters();
    }

    /**
     * Render dashboard statistics
     */
    renderDashboard() {
        const totalTasks = this.state.tasks.length;
        const completedTasks = this.state.tasks.filter(t => t.status === 'done').length;
        const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Overall progress
        this.elements.overallProgress.textContent = overallProgress + '%';
        this.elements.overallProgressBar.style.width = overallProgress + '%';
        this.elements.completedTasks.textContent = completedTasks;
        this.elements.totalTasks.textContent = totalTasks;

        // Task status counts
        this.elements.todoCount.textContent = this.state.tasks.filter(t => t.status === 'todo').length;
        this.elements.inprogressCount.textContent = this.state.tasks.filter(t => t.status === 'inprogress').length;
        this.elements.blockedCount.textContent = this.state.tasks.filter(t => t.status === 'blocked').length;
        this.elements.doneCount.textContent = this.state.tasks.filter(t => t.status === 'done').length;

        // Equipment counts
        const totalEquipment = this.state.equipment.length;
        const plannedEquipment = this.state.equipment.filter(e => e.status === 'planned').length;
        const activeEquipment = this.state.equipment.filter(e => ['dismantling', 'ready', 'shipped'].includes(e.status)).length;
        const completedEquipment = this.state.equipment.filter(e => e.status === 'delivered').length;

        this.elements.equipmentTotal.textContent = totalEquipment;
        this.elements.equipmentPlanned.textContent = plannedEquipment;
        this.elements.equipmentActive.textContent = activeEquipment;
        this.elements.equipmentCompleted.textContent = completedEquipment;

        // Team workload
        this.renderTeamStats();
    }

    /**
     * Render team statistics
     */
    renderTeamStats() {
        const teamStats = this.state.users.map(user => {
            const userTasks = this.state.tasks.filter(t => t.assignee === user.name);
            return {
                ...user,
                taskCount: userTasks.length,
                completedTasks: userTasks.filter(t => t.status === 'done').length
            };
        }).filter(user => user.taskCount > 0);

        this.elements.teamStats.innerHTML = teamStats.map(member => `
            <div class="team-member">
                <div class="member-info">
                    <div class="member-avatar" style="background: hsl(${this.stringToHue(member.name)}, 70%, 50%)">
                        ${member.initials}
                    </div>
                    <span class="member-name">${member.name}</span>
                </div>
                <div class="member-tasks">
                    ${member.completedTasks}/${member.taskCount} zadań
                </div>
            </div>
        `).join('');
    }

    /**
     * Convert string to hue for avatar colors
     */
    stringToHue(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return Math.abs(hash) % 360;
    }

    /**
     * Render current view based on active tab
     */
    renderCurrentView() {
        switch (this.state.currentTab) {
            case 'kanban':
                this.renderKanban();
                break;
            case 'gantt':
                this.renderGantt();
                break;
            case 'equipment':
                this.renderEquipment();
                break;
        }
    }

    /**
     * Render Kanban board
     */
    renderKanban() {
        const columns = {
            todo: this.elements.todoColumn,
            inprogress: this.elements.inprogressColumn,
            blocked: this.elements.blockedColumn,
            done: this.elements.doneColumn
        };

        // Update column counts
        const statusCounts = {
            'todo': this.elements.todoColumnCount,
            'inprogress': this.elements.inprogressColumnCount,
            'blocked': this.elements.blockedColumnCount,
            'done': this.elements.doneColumnCount
        };
        
        Object.keys(columns).forEach(status => {
            const tasks = this.state.tasks.filter(task => task.status === status);
            const column = columns[status];
            
            if (column) {
                column.innerHTML = tasks.map(task => this.renderTaskCard(task)).join('');
            }
            
            // Update column counts
            if (statusCounts[status]) {
                statusCounts[status].textContent = tasks.length;
            }
        });

        // Add drag and drop functionality
        this.initDragAndDrop();
    }

    /**
     * Render task card
     */
    renderTaskCard(task) {
        const priorityClass = `priority-${task.priority}`;
        const equipment = this.state.equipment.find(e => e.id === task.equipmentId);
        
        return `
            <div class="task-card ${priorityClass}" data-task-id="${task.id}" draggable="true">
                <div class="task-title">${task.name}</div>
                <div class="task-meta">
                    <span class="task-assignee">👤 ${task.assignee}</span>
                    <span class="task-date">📅 ${this.formatDate(task.endDate)}</span>
                </div>
                ${equipment ? `<div class="task-equipment">🏭 ${equipment.name}</div>` : ''}
                ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Initialize drag and drop for Kanban
     */
    initDragAndDrop() {
        const taskCards = document.querySelectorAll('.task-card');
        const columns = document.querySelectorAll('.column-content');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', card.dataset.taskId);
                card.style.opacity = '0.5';
            });

            card.addEventListener('dragend', (e) => {
                card.style.opacity = '1';
            });

            card.addEventListener('click', (e) => {
                if (!e.target.closest('.task-card').dragging) {
                    this.editTask(card.dataset.taskId);
                }
            });
        });

        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.backgroundColor = 'var(--bg-tertiary)';
            });

            column.addEventListener('dragleave', (e) => {
                column.style.backgroundColor = '';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.backgroundColor = '';
                
                const taskId = e.dataTransfer.getData('text/plain');
                const newStatus = column.parentElement.dataset.status;
                
                this.updateTaskStatus(taskId, newStatus);
            });
        });
    }

    /**
     * Update task status
     */
    updateTaskStatus(taskId, newStatus) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            task.updatedAt = new Date().toISOString();
            
            this.saveToStorage();
            this.render();
            this.showToast(`Zadanie przeniesione do: ${this.getStatusLabel(newStatus)}`, 'success');
        }
    }

    /**
     * Get status label
     */
    getStatusLabel(status) {
        const labels = {
            todo: 'Do zrobienia',
            inprogress: 'W toku',
            blocked: 'Zablokowane',
            done: 'Zakończone'
        };
        return labels[status] || status;
    }

    /**
     * Render Gantt chart
     */
    renderGantt() {
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            this.elements.ganttChart.innerHTML = '<div class="no-data">Brak zadań do wyświetlenia</div>';
            return;
        }

        // Calculate date range
        const allDates = filteredTasks.flatMap(task => [new Date(task.startDate), new Date(task.endDate)]);
        const minDate = new Date(Math.min(...allDates));
        const maxDate = new Date(Math.max(...allDates));
        
        // Add some padding
        minDate.setDate(minDate.getDate() - 7);
        maxDate.setDate(maxDate.getDate() + 7);
        
        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

        this.elements.ganttChart.innerHTML = `
            <div class="gantt-header">
                <div class="gantt-timeline-header">
                    ${this.renderGanttTimelineHeader(minDate, maxDate)}
                </div>
            </div>
            <div class="gantt-body">
                ${filteredTasks.map(task => this.renderGanttRow(task, minDate, totalDays)).join('')}
            </div>
        `;
    }

    /**
     * Render Gantt timeline header
     */
    renderGanttTimelineHeader(minDate, maxDate) {
        const months = [];
        const currentDate = new Date(minDate);
        
        while (currentDate <= maxDate) {
            months.push(new Date(currentDate));
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
        
        return `
            <div class="timeline-months">
                ${months.map(month => `
                    <div class="timeline-month">
                        ${month.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' })}
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render Gantt row
     */
    renderGanttRow(task, minDate, totalDays) {
        const startDate = new Date(task.startDate);
        const endDate = new Date(task.endDate);
        const taskStart = Math.ceil((startDate - minDate) / (1000 * 60 * 60 * 24));
        const taskDuration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        
        const leftPercent = (taskStart / totalDays) * 100;
        const widthPercent = (taskDuration / totalDays) * 100;
        
        const priorityColor = {
            high: '#EF4444',
            medium: '#F59E0B',
            low: '#10B981'
        }[task.priority] || '#6B7280';

        return `
            <div class="gantt-row" data-task-id="${task.id}">
                <div class="gantt-label">${task.name}</div>
                <div class="gantt-timeline">
                    <div class="gantt-bar" style="
                        left: ${leftPercent}%; 
                        width: ${widthPercent}%; 
                        background: ${priorityColor};
                    " title="${task.assignee} - ${task.priority} priority">
                        <span class="gantt-bar-text">${task.assignee}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get filtered tasks for Gantt chart
     */
    getFilteredTasks() {
        let tasks = [...this.state.tasks];
        
        if (this.state.filters.gantt.assignee) {
            tasks = tasks.filter(task => task.assignee === this.state.filters.gantt.assignee);
        }
        
        if (this.state.filters.gantt.priority) {
            tasks = tasks.filter(task => task.priority === this.state.filters.gantt.priority);
        }
        
        return tasks.filter(task => task.startDate && task.endDate);
    }

    /**
     * Render equipment database
     */
    renderEquipment() {
        const filteredEquipment = this.getFilteredEquipment();
        
        if (filteredEquipment.length === 0) {
            this.elements.equipmentGrid.innerHTML = '<div class="no-data">Brak sprzętu do wyświetlenia</div>';
            return;
        }

        this.elements.equipmentGrid.innerHTML = filteredEquipment.map(item => 
            this.renderEquipmentCard(item)
        ).join('');
    }

    /**
     * Render equipment card
     */
    renderEquipmentCard(equipment) {
        const statusLabels = {
            planned: 'Zaplanowany',
            dismantling: 'W demontażu',
            ready: 'Gotowy do wysyłki',
            shipped: 'Wysłany',
            delivered: 'Dostarczony'
        };

        const relatedTasks = this.state.tasks.filter(t => t.equipmentId === equipment.id);

        return `
            <div class="equipment-card" data-equipment-id="${equipment.id}">
                <div class="equipment-header">
                    <div class="equipment-name">${equipment.name}</div>
                    <div class="status-badge status-${equipment.status}">
                        ${statusLabels[equipment.status] || equipment.status}
                    </div>
                </div>
                <div class="equipment-details">
                    <div><strong>Typ:</strong> ${equipment.type}</div>
                    <div><strong>Przeznaczenie:</strong> ${equipment.destination}</div>
                    ${equipment.czWishlist ? '<div style="color: var(--success-color);"><strong>✅ CZ Wishlist</strong></div>' : ''}
                    <div><strong>Powiązane zadania:</strong> ${relatedTasks.length}</div>
                </div>
                ${equipment.notes ? `<div class="equipment-notes">${equipment.notes}</div>` : ''}
            </div>
        `;
    }

    /**
     * Get filtered equipment
     */
    getFilteredEquipment() {
        let equipment = [...this.state.equipment];
        
        if (this.state.filters.equipment.search) {
            const search = this.state.filters.equipment.search.toLowerCase();
            equipment = equipment.filter(item => 
                item.name.toLowerCase().includes(search) ||
                item.type.toLowerCase().includes(search) ||
                item.notes.toLowerCase().includes(search)
            );
        }
        
        if (this.state.filters.equipment.type) {
            equipment = equipment.filter(item => item.type === this.state.filters.equipment.type);
        }
        
        if (this.state.filters.equipment.status) {
            equipment = equipment.filter(item => item.status === this.state.filters.equipment.status);
        }
        
        return equipment;
    }

    /**
     * Render filter dropdowns
     */
    renderFilters() {
        // Gantt filters
        if (this.elements.ganttFilterAssignee) {
            const assignees = [...new Set(this.state.tasks.map(t => t.assignee))];
            this.elements.ganttFilterAssignee.innerHTML = `
                <option value="">Wszyscy</option>
                ${assignees.map(assignee => 
                    `<option value="${assignee}" ${this.state.filters.gantt.assignee === assignee ? 'selected' : ''}>${assignee}</option>`
                ).join('')}
            `;
        }

        // Equipment filters
        if (this.elements.equipmentFilterType) {
            const types = [...new Set(this.state.equipment.map(e => e.type))];
            this.elements.equipmentFilterType.innerHTML = `
                <option value="">Wszystkie typy</option>
                ${types.map(type => 
                    `<option value="${type}" ${this.state.filters.equipment.type === type ? 'selected' : ''}>${type}</option>`
                ).join('')}
            `;
        }
    }

    /**
     * Handle tab switching
     */
    handleTabSwitch(e) {
        const tabName = e.currentTarget.dataset.tab;
        
        // Update active tab button
        this.elements.tabBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Update active tab panel
        this.elements.tabPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById(`${tabName}-panel`).classList.add('active');
        
        this.state.currentTab = tabName;
        this.renderCurrentView();
    }

    /**
     * Handle adding new task
     */
    handleTaskAdd(status = 'todo') {
        this.showModal('task', null, status);
    }

    /**
     * Handle adding new equipment
     */
    handleEquipmentAdd() {
        this.showModal('equipment');
    }

    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.state.theme);
        this.saveToStorage();
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.body.dataset.theme = theme;
        const themeIcon = this.elements.themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    /**
     * Handle export
     */
    handleExport() {
        const data = {
            tasks: this.state.tasks,
            equipment: this.state.equipment,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `radio_planner_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Dane zostały wyeksportowane', 'success');
    }

    /**
     * Handle import
     */
    handleImport() {
        this.elements.fileInput.click();
    }

    /**
     * Handle file import
     */
    handleFileImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                if (data.tasks && data.equipment) {
                    this.state.tasks = data.tasks;
                    this.state.equipment = data.equipment;
                    this.saveToStorage();
                    this.render();
                    this.showToast('Dane zostały zaimportowane pomyślnie', 'success');
                } else {
                    this.showToast('Nieprawidłowy format pliku', 'error');
                }
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('Błąd podczas importu pliku', 'error');
            }
        };
        
        reader.readAsText(file);
        e.target.value = ''; // Reset file input
    }

    /**
     * Handle filter changes
     */
    handleFilterChange() {
        // Update filter state
        if (this.elements.ganttFilterAssignee) {
            this.state.filters.gantt.assignee = this.elements.ganttFilterAssignee.value;
        }
        if (this.elements.ganttFilterPriority) {
            this.state.filters.gantt.priority = this.elements.ganttFilterPriority.value;
        }
        if (this.elements.equipmentSearch) {
            this.state.filters.equipment.search = this.elements.equipmentSearch.value;
        }
        if (this.elements.equipmentFilterType) {
            this.state.filters.equipment.type = this.elements.equipmentFilterType.value;
        }
        if (this.elements.equipmentFilterStatus) {
            this.state.filters.equipment.status = this.elements.equipmentFilterStatus.value;
        }

        // Re-render current view
        this.renderCurrentView();
    }

    /**
     * Show modal for adding/editing
     */
    showModal(type, item = null, defaultStatus = null) {
        const isEdit = !!item;
        const title = isEdit 
            ? (type === 'task' ? 'Edytuj Zadanie' : 'Edytuj Sprzęt')
            : (type === 'task' ? 'Dodaj Zadanie' : 'Dodaj Sprzęt');

        this.elements.modalTitle.textContent = title;
        this.elements.modalFields.innerHTML = type === 'task' 
            ? this.renderTaskForm(item, defaultStatus) 
            : this.renderEquipmentForm(item);

        // Store current modal data
        this.currentModal = { type, item };
        
        this.elements.modalOverlay.classList.add('active');
        
        // Focus first input
        const firstInput = this.elements.modalFields.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Render task form
     */
    renderTaskForm(task, defaultStatus) {
        const equipmentOptions = this.state.equipment.map(e => 
            `<option value="${e.id}" ${task && task.equipmentId === e.id ? 'selected' : ''}>${e.name}</option>`
        ).join('');

        const assigneeOptions = this.state.users.map(u => 
            `<option value="${u.name}" ${task && task.assignee === u.name ? 'selected' : ''}>${u.name}</option>`
        ).join('');

        return `
            <div class="form-group">
                <label class="form-label">Nazwa Zadania:</label>
                <input type="text" class="form-control" name="name" value="${task?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Status:</label>
                <select class="form-control" name="status" required>
                    <option value="todo" ${(task?.status || defaultStatus) === 'todo' ? 'selected' : ''}>Do zrobienia</option>
                    <option value="inprogress" ${(task?.status || defaultStatus) === 'inprogress' ? 'selected' : ''}>W toku</option>
                    <option value="blocked" ${(task?.status || defaultStatus) === 'blocked' ? 'selected' : ''}>Zablokowane</option>
                    <option value="done" ${(task?.status || defaultStatus) === 'done' ? 'selected' : ''}>Zakończone</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Osoba Odpowiedzialna:</label>
                <select class="form-control" name="assignee" required>
                    ${assigneeOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Kategoria:</label>
                <select class="form-control" name="category" required>
                    <option value="Wtryskarki" ${task?.category === 'Wtryskarki' ? 'selected' : ''}>Wtryskarki</option>
                    <option value="Cleanroom" ${task?.category === 'Cleanroom' ? 'selected' : ''}>Cleanroom</option>
                    <option value="Stamping" ${task?.category === 'Stamping' ? 'selected' : ''}>Stamping</option>
                    <option value="Infrastruktura" ${task?.category === 'Infrastruktura' ? 'selected' : ''}>Infrastruktura</option>
                    <option value="Personel" ${task?.category === 'Personel' ? 'selected' : ''}>Personel</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Priorytet:</label>
                <select class="form-control" name="priority" required>
                    <option value="low" ${task?.priority === 'low' ? 'selected' : ''}>Niski</option>
                    <option value="medium" ${task?.priority === 'medium' ? 'selected' : ''}>Średni</option>
                    <option value="high" ${task?.priority === 'high' ? 'selected' : ''}>Wysoki</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Data Rozpoczęcia:</label>
                <input type="date" class="form-control" name="startDate" value="${task?.startDate || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Data Zakończenia:</label>
                <input type="date" class="form-control" name="endDate" value="${task?.endDate || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Powiązany Sprzęt:</label>
                <select class="form-control" name="equipmentId">
                    <option value="">Brak</option>
                    ${equipmentOptions}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Notatki:</label>
                <textarea class="form-control textarea" name="notes" rows="3">${task?.notes || ''}</textarea>
            </div>
        `;
    }

    /**
     * Render equipment form
     */
    renderEquipmentForm(equipment) {
        return `
            <div class="form-group">
                <label class="form-label">Nazwa Sprzętu:</label>
                <input type="text" class="form-control" name="name" value="${equipment?.name || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Typ:</label>
                <select class="form-control" name="type" required>
                    <option value="Wtryskarka" ${equipment?.type === 'Wtryskarka' ? 'selected' : ''}>Wtryskarka</option>
                    <option value="Linia produkcyjna" ${equipment?.type === 'Linia produkcyjna' ? 'selected' : ''}>Linia produkcyjna</option>
                    <option value="Prasa" ${equipment?.type === 'Prasa' ? 'selected' : ''}>Prasa</option>
                    <option value="Infrastruktura" ${equipment?.type === 'Infrastruktura' ? 'selected' : ''}>Infrastruktura</option>
                    <option value="Inne" ${equipment?.type === 'Inne' ? 'selected' : ''}>Inne</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Przeznaczenie:</label>
                <select class="form-control" name="destination" required>
                    <option value="CZ" ${equipment?.destination === 'CZ' ? 'selected' : ''}>CZ</option>
                    <option value="Mex" ${equipment?.destination === 'Mex' ? 'selected' : ''}>Mex</option>
                    <option value="Verschrot" ${equipment?.destination === 'Verschrot' ? 'selected' : ''}>Verschrot (Złom)</option>
                    <option value="Na sprzedaż" ${equipment?.destination === 'Na sprzedaż' ? 'selected' : ''}>Na sprzedaż</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Status:</label>
                <select class="form-control" name="status" required>
                    <option value="planned" ${equipment?.status === 'planned' ? 'selected' : ''}>Zaplanowany</option>
                    <option value="dismantling" ${equipment?.status === 'dismantling' ? 'selected' : ''}>W demontażu</option>
                    <option value="ready" ${equipment?.status === 'ready' ? 'selected' : ''}>Gotowy do wysyłki</option>
                    <option value="shipped" ${equipment?.status === 'shipped' ? 'selected' : ''}>Wysłany</option>
                    <option value="delivered" ${equipment?.status === 'delivered' ? 'selected' : ''}>Dostarczony</option>
                </select>
            </div>
            <div class="form-group">
                <div class="checkbox-wrapper">
                    <input type="checkbox" name="czWishlist" id="czWishlist" ${equipment?.czWishlist ? 'checked' : ''}>
                    <label class="form-label" for="czWishlist">CZ Wishlist (pożądany przez oddział CZ)</label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Notatki:</label>
                <textarea class="form-control textarea" name="notes" rows="3">${equipment?.notes || ''}</textarea>
            </div>
        `;
    }

    /**
     * Handle modal form submission
     */
    handleModalSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Handle checkbox
        if (this.currentModal.type === 'equipment') {
            data.czWishlist = formData.has('czWishlist');
        }
        
        // Handle equipment ID conversion
        if (this.currentModal.type === 'task' && data.equipmentId) {
            data.equipmentId = data.equipmentId;
        } else if (this.currentModal.type === 'task') {
            data.equipmentId = null;
        }

        if (this.currentModal.item) {
            // Edit existing item
            this.updateItem(this.currentModal.type, this.currentModal.item.id, data);
        } else {
            // Create new item
            this.createItem(this.currentModal.type, data);
        }

        this.handleModalClose();
    }

    /**
     * Create new item
     */
    createItem(type, data) {
        const newItem = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (type === 'task') {
            this.state.tasks.push(newItem);
            this.showToast('Zadanie zostało dodane', 'success');
        } else if (type === 'equipment') {
            this.state.equipment.push(newItem);
            this.showToast('Sprzęt został dodany', 'success');
        }

        this.saveToStorage();
        this.render();
    }

    /**
     * Update existing item
     */
    updateItem(type, id, data) {
        let items = type === 'task' ? this.state.tasks : this.state.equipment;
        const item = items.find(i => i.id === id);
        
        if (item) {
            Object.assign(item, data, { updatedAt: new Date().toISOString() });
            this.saveToStorage();
            this.render();
            this.showToast(
                type === 'task' ? 'Zadanie zostało zaktualizowane' : 'Sprzęt został zaktualizowany', 
                'success'
            );
        }
    }

    /**
     * Edit task
     */
    editTask(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            this.showModal('task', task);
        }
    }

    /**
     * Edit equipment
     */
    editEquipment(equipmentId) {
        const equipment = this.state.equipment.find(e => e.id === equipmentId);
        if (equipment) {
            this.showModal('equipment', equipment);
        }
    }

    /**
     * Handle modal close
     */
    handleModalClose() {
        this.elements.modalOverlay.classList.remove('active');
        this.currentModal = null;
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideIn var(--transition-base) reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Show/hide loading overlay
     */
    showLoading(show) {
        if (this.elements.loadingOverlay) {
            if (show) {
                this.elements.loadingOverlay.classList.add('active');
            } else {
                this.elements.loadingOverlay.classList.remove('active');
            }
        }
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('pl-PL');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.projectPanel = new ProjectPanel();
});

// Add click handlers for equipment cards (delegated event handling)
document.addEventListener('click', (e) => {
    const equipmentCard = e.target.closest('.equipment-card');
    if (equipmentCard && window.projectPanel) {
        const equipmentId = equipmentCard.dataset.equipmentId;
        window.projectPanel.editEquipment(equipmentId);
    }
});
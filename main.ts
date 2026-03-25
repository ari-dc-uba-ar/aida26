import { translations, Lang } from './i18n.js';

/**
 * Student interface matching the database schema
 */
interface Student {
    libreta: string;
    first_name: string;
    last_name: string;
    email: string;
}

const API_BASE_URL = '/api';
let currentLang: Lang = (localStorage.getItem('preferred_lang') as Lang) || 'es';

// DOM Elements
const langSelector = document.getElementById('langSelector') as HTMLSelectElement;
const navbar = document.getElementById('navbar') as HTMLElement;
const content = document.getElementById('content') as HTMLElement;
const mainTitle = document.getElementById('mainTitle') as HTMLElement;

/**
 * Application entry point
 */
function init(): void {
    setupLanguage();
    renderNavbar();
    showStudents(); // Initial view
}

/**
 * Handles language selection and UI updates
 */
function setupLanguage(): void {
    if (langSelector) {
        langSelector.value = currentLang;
        langSelector.onchange = () => {
            currentLang = langSelector.value as Lang;
            localStorage.setItem('preferred_lang', currentLang);
            // Refresh UI labels
            renderNavbar();
            showStudents();
        };
    }
}

/**
 * Renders the main navigation buttons
 */
function renderNavbar(): void {
    const t = translations[currentLang];
    mainTitle.innerText = "SIA - Exactas UBA";
    
    navbar.innerHTML = '';
    const navItems = [
        { label: t.students, action: showStudents },
        { label: t.subjects, action: () => content.innerHTML = `<h2>${t.subjects}</h2><p>Coming soon...</p>` },
        { label: t.enrollments, action: () => content.innerHTML = `<h2>${t.enrollments}</h2><p>Coming soon...</p>` }
    ];

    navItems.forEach(item => {
        const btn = document.createElement('button');
        btn.innerText = item.label;
        btn.onclick = item.action;
        navbar.appendChild(btn);
    });
}

/**
 * Fetches and displays the Students Grid
 */
async function showStudents(): Promise<void> {
    const t = translations[currentLang];
    content.innerHTML = '<h3>Loading...</h3>';

    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const students: Student[] = await response.json();

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h2>${t.students}</h2>
                <button id="addStudentBtn" style="height: fit-content;">${t.add}</button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>${t.libreta}</th>
                        <th>${t.name}</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="studentsBody"></tbody>
            </table>
        `;

        document.getElementById('addStudentBtn')!.onclick = () => showStudentForm();

        const tbody = document.getElementById('studentsBody')!;
        students.forEach(student => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.libreta}</td>
                <td>${student.first_name} ${student.last_name}</td>
                <td>${student.email}</td>
                <td class="actions">
                    <button class="edit-btn">${t.edit}</button>
                    <button class="delete-btn">${t.delete}</button>
                </td>
            `;

            tr.querySelector('.edit-btn')!.onclick = () => showStudentForm(student);
            tr.querySelector('.delete-btn')!.onclick = async () => {
                if (confirm('¿Confirmar borrado? / Confirm delete?')) {
                    await fetch(`${API_BASE_URL}/students/${student.libreta}`, { method: 'DELETE' });
                    showStudents();
                }
            };
            tbody.appendChild(tr);
        });
    } catch (err) {
        content.innerHTML = `<p style="color:red">Error connecting to API: ${err}</p>`;
    }
}

/**
 * Renders the form for creating or editing a student
 */
function showStudentForm(student?: Student): void {
    const t = translations[currentLang];
    content.innerHTML = `
        <h2>${student ? t.edit : t.add} ${t.students}</h2>
        <form id="studentForm">
            <p><label>${t.libreta}:</label><br><input type="text" id="lib" value="${student?.libreta || ''}" ${student ? 'readonly' : 'required'}></p>
            <p><label>First Name:</label><br><input type="text" id="fn" value="${student?.first_name || ''}" required></p>
            <p><label>Last Name:</label><br><input type="text" id="ln" value="${student?.last_name || ''}" required></p>
            <p><label>Email:</label><br><input type="email" id="em" value="${student?.email || ''}" required></p>
            <button type="submit">${t.save}</button>
            <button type="button" id="cancelBtn">${t.cancel}</button>
        </form>
    `;

    document.getElementById('cancelBtn')!.onclick = showStudents;
    document.getElementById('studentForm')!.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            libreta: (document.getElementById('lib') as HTMLInputElement).value,
            first_name: (document.getElementById('fn') as HTMLInputElement).value,
            last_name: (document.getElementById('ln') as HTMLInputElement).value,
            email: (document.getElementById('em') as HTMLInputElement).value,
        };

        const url = student ? `${API_BASE_URL}/students/${student.libreta}` : `${API_BASE_URL}/students`;
        await fetch(url, {
            method: student ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        showStudents();
    };
}

init();
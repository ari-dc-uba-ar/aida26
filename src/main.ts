// In NodeNext ESM, explicit .js extensions are required for relative imports
import { translations, Lang } from './i18n.js';

interface Student {
    libreta: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface Subject {
    cod_mat: string;
    name: string;
    department: string;
}

interface Enrollment {
    libreta: string;
    cod_mat: string;
    subject_name?: string;
    student_name?: string;
    final_grade?: number;
}

const API_BASE_URL = '/api';
let currentLang: Lang = (localStorage.getItem('preferred_lang') as Lang) || 'es';

const langSelector = document.getElementById('langSelector') as HTMLSelectElement;
const navbar = document.getElementById('navbar') as HTMLElement;
const content = document.getElementById('content') as HTMLElement;
const mainTitle = document.getElementById('mainTitle') as HTMLElement;

function init(): void {
    setupLanguage();
    renderNavbar();
    showStudents(); 
}

function setupLanguage(): void {
    if (langSelector) {
        langSelector.value = currentLang;
        langSelector.onchange = () => {
            currentLang = langSelector.value as Lang;
            localStorage.setItem('preferred_lang', currentLang);
            renderNavbar();
            showStudents();
        };
    }
}

function renderNavbar(): void {
    const t = translations[currentLang];
    mainTitle.innerText = "SIA - Exactas UBA";
    
    navbar.innerHTML = `
        <button onclick="window.navTo('students')">${t.students}</button>
        <button onclick="window.navTo('subjects')">${t.subjects}</button>
        <button onclick="window.navTo('enrollments')">${t.enrollments}</button>
    `;
}

// Global navigation helper
(window as any).navTo = (view: string) => {
    if (view === 'students') showStudents();
    if (view === 'subjects') showSubjects();
    if (view === 'enrollments') showEnrollments();
};

async function showStudents(): Promise<void> {
    const t = translations[currentLang];
    content.innerHTML = '<h3>Loading...</h3>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        const students: Student[] = await response.json();
        
        if (!Array.isArray(students)) {
            throw new Error("Invalid data format received from API");
        }

        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 10px;">
            <h2>${t.students}</h2>
            <button id="addStudentBtn">${t.add}</button>
        </div>
        <table>
            <thead><tr><th>${t.libreta}</th><th>${t.name}</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody id="listBody"></tbody>
        </table>`;

    document.getElementById('addStudentBtn')!.onclick = () => showStudentForm();
    const tbody = document.getElementById('listBody')!;
    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.libreta}</td><td>${s.first_name} ${s.last_name}</td><td>${s.email}</td>
            <td class="actions"><button class="edit-btn">${t.edit}</button><button class="del-btn">${t.delete}</button></td>`;
        (tr.querySelector('.edit-btn') as HTMLElement).onclick = () => showStudentForm(s);
        (tr.querySelector('.del-btn') as HTMLElement).onclick = async () => { if(confirm(t.delete + '?')) { await fetch(`${API_BASE_URL}/students/${s.libreta}`, {method:'DELETE'}); showStudents(); }};
        tbody.appendChild(tr);
    });
    } catch (err: any) {
        content.innerHTML = `
            <div style="color: red; padding: 20px; border: 2px solid red;">
                <h3>FATAL ERROR: Could not load students</h3>
                <p>${err.message}</p>
            </div>`;
    }
}

function showStudentForm(student?: Student): void {
    const t = translations[currentLang];
    content.innerHTML = `
        <h2>${student ? t.edit : t.add} ${t.students}</h2>
        <form id="dataForm">
            <input type="text" id="lib" placeholder="${t.libreta}" value="${student?.libreta || ''}" ${student?'readonly':'required'}>
            <input type="text" id="fn" placeholder="First Name" value="${student?.first_name || ''}" required>
            <input type="text" id="ln" placeholder="Last Name" value="${student?.last_name || ''}" required>
            <input type="email" id="em" placeholder="Email" value="${student?.email || ''}" required>
            <button type="submit">${t.save}</button>
            <button type="button" id="cancelBtn">${t.cancel}</button>
        </form>`;
    document.getElementById('cancelBtn')!.onclick = showStudents;
    document.getElementById('dataForm')!.onsubmit = async (e) => {
        e.preventDefault();
        const data = { libreta: (document.getElementById('lib') as HTMLInputElement).value, first_name: (document.getElementById('fn') as HTMLInputElement).value, last_name: (document.getElementById('ln') as HTMLInputElement).value, email: (document.getElementById('em') as HTMLInputElement).value };
        await fetch(student ? `${API_BASE_URL}/students/${student.libreta}` : `${API_BASE_URL}/students`, { method: student ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)});
        showStudents();
    };
}

async function showSubjects(): Promise<void> {
    const t = translations[currentLang];
    content.innerHTML = '<h3>Loading...</h3>';
    try {
        const response = await fetch(`${API_BASE_URL}/subjects`);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const subjects: Subject[] = await response.json();
        
        content.innerHTML = `
            <div style="display: flex; justify-content: space-between; padding: 10px;">
                <h2>${t.subjects}</h2>
                <button id="addBtn">${t.add}</button>
            </div>
            <table>
                <thead>
                    <tr><th>${t.cod_mat}</th><th>${t.name}</th><th>Actions</th></tr>
                </thead>
                <tbody id="listBody"></tbody>
            </table>`;

    document.getElementById('addBtn')!.onclick = () => showSubjectForm();
    const tbody = document.getElementById('listBody')!;
    subjects.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.cod_mat}</td><td>${s.name}</td><td class="actions"><button class="edit-btn">${t.edit}</button><button class="del-btn">${t.delete}</button></td>`;
        (tr.querySelector('.edit-btn') as HTMLElement).onclick = () => showSubjectForm(s);
        (tr.querySelector('.del-btn') as HTMLElement).onclick = async () => { if(confirm(t.delete + '?')) { await fetch(`${API_BASE_URL}/subjects/${s.cod_mat}`, {method:'DELETE'}); showSubjects(); }};
        tbody.appendChild(tr);
    });
    } catch (err: any) {
        renderError(t.subjects, err.message);
    }
}

function renderError(title: string, message: string) {
    content.innerHTML = `<div style="color: red; padding: 20px; border: 2px solid red;"><h3>FATAL ERROR: ${title}</h3><p>${message}</p></div>`;
}

function showSubjectForm(subject?: Subject): void {
    const t = translations[currentLang];
    content.innerHTML = `<h2>${subject ? t.edit : t.add}</h2><form id="dataForm">
        <p><label>${t.cod_mat}:</label><input type="text" id="cod" value="${subject?.cod_mat || ''}" ${subject?'readonly':'required'}></p>
        <p><label>${t.name}:</label><input type="text" id="name" value="${subject?.name || ''}" required></p>
        <p><label>Department:</label><input type="text" id="dept" value="${subject?.department || ''}"></p>
        <div class="form-actions"><button type="submit">${t.save}</button><button type="button" id="cancelBtn">${t.cancel}</button></div>
    </form>`;
    document.getElementById('cancelBtn')!.onclick = showSubjects;
    document.getElementById('dataForm')!.onsubmit = async (e) => {
        e.preventDefault();
        const data = { 
            cod_mat: (document.getElementById('cod') as HTMLInputElement).value, 
            name: (document.getElementById('name') as HTMLInputElement).value,
            department: (document.getElementById('dept') as HTMLInputElement).value 
        };
        await fetch(subject ? `${API_BASE_URL}/subjects/${subject.cod_mat}` : `${API_BASE_URL}/subjects`, { method: subject ? 'PUT' : 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)});
        showSubjects();
    };
}

async function showEnrollments(): Promise<void> {
    const t = translations[currentLang];
    try {
        const response = await fetch(`${API_BASE_URL}/enrollments`);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        const data: Enrollment[] = await response.json();

    content.innerHTML = `
        <div style="display: flex; justify-content: space-between; padding: 10px;">
            <h2>${t.enrollments}</h2>
            <button id="addBtn">${t.add}</button>
        </div>
        <table>
            <thead>
                <tr><th>${t.libreta}</th><th>${t.name}</th><th>Grade</th><th>Actions</th></tr>
            </thead>
            <tbody id="listBody"></tbody>
        </table>`;

    document.getElementById('addBtn')!.onclick = () => showEnrollmentForm();
    const tbody = document.getElementById('listBody')!;
    data.forEach(e => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${e.libreta}</td>
            <td>${e.subject_name || e.cod_mat}</td>
            <td>${e.final_grade ?? '-'}</td>
            <td class="actions"><button class="del-btn">${t.delete}</button></td>`;
        (tr.querySelector('.del-btn') as HTMLElement).onclick = async () => { if(confirm(t.delete + '?')) { await fetch(`${API_BASE_URL}/enrollments/${e.libreta}/${e.cod_mat}`, {method:'DELETE'}); showEnrollments(); }};
        tbody.appendChild(tr);
    });
    } catch (err: any) {
        renderError(t.enrollments, err.message);
    }
}

function showEnrollmentForm(): void {
    const t = translations[currentLang];
    content.innerHTML = `<h2>${t.add} ${t.enrollments}</h2><form id="dataForm">
        <p><label>${t.libreta}:</label><input type="text" id="lib" required></p>
        <p><label>${t.cod_mat}:</label><input type="text" id="cod" required></p>
        <p><label>Grade:</label><input type="number" id="grade" step="0.01" min="0" max="10"></p>
        <div class="form-actions"><button type="submit">${t.save}</button><button type="button" id="cancelBtn">${t.cancel}</button></div>
    </form>`;
    document.getElementById('cancelBtn')!.onclick = showEnrollments;
    document.getElementById('dataForm')!.onsubmit = async (e) => {
        e.preventDefault();
        const gradeVal = (document.getElementById('grade') as HTMLInputElement).value;
        const data = { 
            libreta: (document.getElementById('lib') as HTMLInputElement).value, 
            cod_mat: (document.getElementById('cod') as HTMLInputElement).value,
            final_grade: gradeVal ? parseFloat(gradeVal) : null
        };
        await fetch(`${API_BASE_URL}/enrollments`, { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data)});
        showEnrollments();
    };
}

init();
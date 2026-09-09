 
        // Mock Sample Data
        // const MOCK_DATA = [
        //     { id: "STU-001", name: "សុខ ជា", date: "2026-03-01", time: "07:55 AM", status: "Present", note: "មកទាន់ពេល" },
        //     { id: "STU-001", name: "សុខ ជា", date: "2026-03-02", time: "08:15 AM", status: "Late", note: "ស្ទះចរាចរណ៍" },
        //     { id: "STU-002", name: "ចាន់ ធារី", date: "2026-03-01", time: "07:50 AM", status: "Present", note: "ល្អណាស់" },
        //     { id: "STU-002", name: "ចាន់ ធារី", date: "2026-03-02", time: "07:58 AM", status: "Present", note: "-" },
        //     { id: "STU-003", name: "កែវ មករា", date: "2026-03-01", time: "-", status: "Absent", note: "សុំច្បាប់ឈឺ" },
        //     { id: "STU-004", name: "ឡុង ពិសិដ្ឋ", date: "2026-03-01", time: "08:05 AM", status: "Late", note: "យឺត ៥ នាទី" },
        //     { id: "STU-004", name: "ឡុង ពិសិដ្ឋ", date: "2026-03-02", time: "07:45 AM", status: "Present", note: "-" },
        //     { id: "STU-005", name: "អ៊ឹម សុភា", date: "2026-03-01", time: "07:52 AM", status: "Present", note: "មកទាន់ពេល" }
        // ];

        let currentSheetUrl = localStorage.getItem('direct_gsheet_url') || '';
        let currentSheetName = localStorage.getItem('direct_gsheet_name') || '';

        // DOM Element references
        const searchInput = document.getElementById('searchInput');
        const btnClear = document.getElementById('btnClear');
        const initialState = document.getElementById('initialState');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        const resultHeader = document.getElementById('resultHeader');
        const resultsContent = document.getElementById('resultsContent');
        const cardsView = document.getElementById('cardsView');
        const tableBody = document.getElementById('tableBody');
        const resultCount = document.getElementById('resultCount');
        const missingKeyword = document.getElementById('missingKeyword');
        const activeQueryDisplay = document.getElementById('activeQueryDisplay');

        // Initial Page setup
        window.addEventListener('DOMContentLoaded', () => {
            // Check if opened via local file:// protocol
            if (window.location.protocol === 'file:') {
                const localWarning = document.getElementById('localFileWarning');
                if (localWarning) localWarning.classList.remove('hidden');
            }

            updateConnectionUI();

            // Toggle clear button visibility on input change
            searchInput.addEventListener('input', () => {
                if (searchInput.value.trim().length > 0) {
                    btnClear.classList.remove('hidden');
                } else {
                    btnClear.classList.add('hidden');
                }
            });

            // Modal Trigger events
            document.getElementById('btnSettings').addEventListener('click', () => {
                document.getElementById('sheetUrlInput').value = currentSheetUrl;
                document.getElementById('sheetNameInput').value = currentSheetName;
                openModal('settingsModal');
            });

            document.getElementById('btnHelp').addEventListener('click', () => {
                openModal('helpModal');
            });
        });

        // Extract Google Sheet ID from full URL or return ID string
        function extractSheetId(urlOrId) {
            if (!urlOrId) return '';
            const trimmed = urlOrId.trim();
            const match = trimmed.match(/\/d\/([a-zA-Z0-9-_]+)/);
            if (match && match[1]) {
                return match[1];
            }
            if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
                return trimmed;
            }
            return trimmed;
        }

        // Quick search trigger
        function quickSearch(query) {
            searchInput.value = query;
            btnClear.classList.remove('hidden');
            performSearch();
        }

        // Clear input box
        function clearSearch() {
            searchInput.value = '';
            btnClear.classList.add('hidden');
            searchInput.focus();
            showState('initial');
        }

        // Modal Helpers
        function openModal(id) {
            document.getElementById(id).classList.remove('hidden');
        }

        function closeModal(id) {
            document.getElementById(id).classList.add('hidden');
        }

        // Update API Connection Banner Status UI
        function updateConnectionUI() {
            const statusDot = document.getElementById('statusDot');
            const pingDot = document.getElementById('pingDot');
            const statusText = document.getElementById('statusText');

            if (currentSheetUrl) {
                statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500";
                pingDot.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
                statusText.innerText = "បានភ្ជាប់ជាមួយ Google Sheet ដោយផ្ទាល់ (Direct Link)។";
            } else {
                statusDot.className = "relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500";
                pingDot.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75";
                statusText.innerText = "កំពុងប្រើប្រាស់ទិន្នន័យគំរូ (Mock Data)។ អ្នកអាចភ្ជាប់ជាមួយ Google Sheet Link ដោយផ្ទាល់បាន។";
            }
        }

        // Save Custom Sheet URL
        function saveSheetUrl() {
            const url = document.getElementById('sheetUrlInput').value.trim();
            const sheetName = document.getElementById('sheetNameInput').value.trim();

            if (url) {
                localStorage.setItem('direct_gsheet_url', url);
                localStorage.setItem('direct_gsheet_name', sheetName);
                currentSheetUrl = url;
                currentSheetName = sheetName;
            } else {
                localStorage.removeItem('direct_gsheet_url');
                localStorage.removeItem('direct_gsheet_name');
                currentSheetUrl = '';
                currentSheetName = '';
            }
            updateConnectionUI();
            closeModal('settingsModal');
            if (searchInput.value.trim()) {
                performSearch();
            }
        }

        // Reset API Settings back to Mock Data
        function resetToMockData() {
            localStorage.removeItem('direct_gsheet_url');
            localStorage.removeItem('direct_gsheet_name');
            currentSheetUrl = '';
            currentSheetName = '';
            document.getElementById('sheetUrlInput').value = '';
            document.getElementById('sheetNameInput').value = '';
            updateConnectionUI();
            closeModal('settingsModal');
            if (searchInput.value.trim()) {
                performSearch();
            }
        }

        // Streamlined State View Switcher
        function showState(stateName) {
            initialState.classList.add('hidden');
            loadingState.classList.add('hidden');
            emptyState.classList.add('hidden');
            const errorState = document.getElementById('errorState');
            if (errorState) errorState.classList.add('hidden');
            resultHeader.classList.add('hidden');
            resultsContent.classList.add('hidden');

            if (stateName === 'initial') initialState.classList.remove('hidden');
            if (stateName === 'loading') loadingState.classList.remove('hidden');
            if (stateName === 'empty') emptyState.classList.remove('hidden');
            if (stateName === 'error' && errorState) errorState.classList.remove('hidden');
            if (stateName === 'results') {
                resultHeader.classList.remove('hidden');
                resultsContent.classList.remove('hidden');
            }
        }

        // Robust CSV Parser in pure JS
        function parseCSV(text) {
            const lines = [];
            let row = [];
            let cell = '';
            let inQuotes = false;

            for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const nextChar = text[i + 1];

                if (char === '"') {
                    if (inQuotes && nextChar === '"') {
                        cell += '"';
                        i++;
                    } else {
                        inQuotes = !inQuotes;
                    }
                } else if (char === ',' && !inQuotes) {
                    row.push(cell.trim());
                    cell = '';
                } else if ((char === '\r' || char === '\n') && !inQuotes) {
                    if (char === '\r' && nextChar === '\n') {
                        i++;
                    }
                    row.push(cell.trim());
                    if (row.length > 0 && row.some(c => c !== '')) {
                        lines.push(row);
                    }
                    row = [];
                    cell = '';
                } else {
                    cell += char;
                }
            }
            if (cell || row.length > 0) {
                row.push(cell.trim());
                if (row.some(c => c !== '')) lines.push(row);
            }
            return lines;
        }

        // Convert CSV array to Structured JSON Objects
        function convertCsvToObjects(csvRows) {
            if (!csvRows || csvRows.length < 2) return [];

            const headers = csvRows[0].map(h => h.toLowerCase().trim());
            
            // Find Column Indexes flexibly
            let idIdx = headers.findIndex(h => h.includes('id') || h.includes('អត្តលេខ'));
            let nameIdx = headers.findIndex(h => h.includes('name') || h.includes('ឈ្មោះ'));
            let dateIdx = headers.findIndex(h => h.includes('date') || h.includes('ថ្ងៃសរុប'));
            let timeIdx = headers.findIndex(h => h.includes('time') || h.includes('ម៉ោងសរុប'));

            let statusIdx = headers.findIndex(h => h.includes('status') || h.includes('ប្រាក់ខ្ចី') || h.includes('ស្ថានភាព'));
            let noteIdx = headers.findIndex(h => h.includes('note') || h.includes('ប្រាក់ពលកម្ម') || h.includes('កំណត់សម្គាល់'));

            return csvRows.slice(1).map(row => ({
                id: idIdx >= 0 ? row[idIdx] || '' : '',
                name: nameIdx >= 0 ? row[nameIdx] || '' : '',
                date: dateIdx >= 0 ? row[dateIdx] || '' : '',
                time: timeIdx >= 0 ? row[timeIdx] || '' : '',
                status: statusIdx >= 0 ? row[statusIdx] || '' : '',
                note: noteIdx >= 0 ? row[noteIdx] || '' : ''
            })).filter(record => Object.values(record).some(value => value !== ''));
        }

        // Fetch records directly from Google Sheet CSV endpoint with Fallback
        async function fetchDirectFromGoogleSheet(sheetId, sheetName) {
            // Method 1: standard gviz CSV endpoint
            let primaryUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
            if (sheetName) {
                primaryUrl += `&sheet=${encodeURIComponent(sheetName)}`;
            }

            // Method 2: publish to web CSV endpoint (fallback)
            let fallbackUrl = `https://docs.google.com/spreadsheets/d/${sheetName}/pub?output=csv`;
            if (sheetName) {
                fallbackUrl += `&sheet=${encodeURIComponent(sheetName)}`;
            }

            let response;
            let csvText = '';

            try {
                response = await fetch(primaryUrl);
                if (response.ok) {
                    csvText = await response.text();
                }
            } catch (e) {
                console.warn('Primary gviz endpoint fetch failed, trying publish fallback...', e);
            }

            // Fallback attempt if primary failed or returned html
            if (!csvText || csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
                try {
                    response = await fetch(fallbackUrl);
                    if (response.ok) {
                        csvText = await response.text();
                    }
                } catch (e) {
                    console.error('Fallback pub endpoint also failed', e);
                }
            }

            if (!csvText) {
                throw new Error('HTTP_FETCH_FAILED');
            }

            // Check if response is HTML login page (Sheet is private or restricted)
            if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html') || csvText.includes('google-site-verification')) {
                throw new Error('SHEET_NOT_PUBLIC');
            }

            const parsedRows = parseCSV(csvText);
            return convertCsvToObjects(parsedRows);
        }

        // Main Search Logic
        async function performSearch() {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                showState('initial');
                return;
            }

            showState('loading');

            try {
                let records = [];

                if (currentSheetUrl) {
                    const sheetId = extractSheetId(currentSheetUrl);
                    if (!sheetId) {
                        throw new Error('INVALID_SHEET_URL');
                    }
                    records = await fetchDirectFromGoogleSheet(sheetId, currentSheetName);
                } else {
                    // Simulate brief network delay for mock data
                    await new Promise(resolve => setTimeout(resolve, 300));
                    records = MOCK_DATA;
                }

                // Filter records by Name or ID matching search term
                const filtered = records.filter(item => {
                    const idMatch = item.id && item.id.toString().toLowerCase().includes(query);
                    const nameMatch = item.name && item.name.toString().toLowerCase().includes(query);
                    return idMatch || nameMatch;
                });

                if (filtered.length === 0) {
                    missingKeyword.innerText = searchInput.value.trim();
                    showState('empty');
                } else {
                    renderResults(filtered, searchInput.value.trim());
                    showState('results');
                }

            } catch (err) {
                console.error("Search fetch error:", err);
                
                const errorMessageEl = document.getElementById('errorMessage');
                if (err.message === 'SHEET_NOT_PUBLIC') {
                    errorMessageEl.innerHTML = `
                        <b>Google Sheet របស់អ្នកមិនទាន់បានបើកជាសាធារណៈឡើយ (Private)!</b><br>
                        ១. សូមចូលទៅកាន់ Google Sheet របស់អ្នក ➔ ចុចប៊ូតុង <b>Share (ចែករំលែក)</b> ➔ ត្រង់ <i>General access</i> ដូរទៅជា <b>Anyone with the link (អ្នកណាមានតំណភ្ជាប់ក៏អាចមើលបាន)</b>។<br>
                        ២. ប្រសិនបើនៅតែមិនដើរ សូមចូលទៅកាន់ <b>File</b> ➔ <b>Share</b> ➔ <b>Publish to web</b> រួចចុច Publish។
                    `;
                } else if (err.message === 'INVALID_SHEET_URL') {
                    errorMessageEl.innerHTML = `
                        <b>Link Google Sheet មិនត្រឹមត្រូវ!</b><br>
                        សូមពិនិត្យមើល Google Sheet Link ឬ ID ដែលអ្នកបានបញ្ចូលក្នុងទំព័រកំណត់ឡើងវិញ។
                    `;
                } else {
                    errorMessageEl.innerHTML = `
                        <b>មិនអាចទាញយកទិន្នន័យពី Google Sheet បានឡើយ (អាចមកពី CORS Restriction)!</b><br>
                        ប្រសិនបើអ្នកកំពុងបើក File HTML នេះផ្ទាល់ពី Computer (` + window.location.protocol + `) សូមសាកល្បងឡើងទិន្នន័យលើ Web Hosting (GitHub Pages/Netlify) ឬបើកតាមរយៈ Live Server។
                    `;
                }
                showState('error');
            }
        }

        // Status Badge Styling Helper
        function getStatusBadge(status) {
            const s = (status || '').toString().trim().toLowerCase();
            if (s === 'present' || s === 'វត្តមាន' || s === 'មក') {
                return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> វត្តមាន (Present)
                </span>`;
            } else if (s === 'late' || s === 'យឺត') {
                return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> យឺត (Late)
                </span>`;
            } else if (s === 'absent' || s === 'អវត្តមាន' || s === 'ឈប់') {
                return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span> អវត្តមាន (Absent)
                </span>`;
            } else if (s === 'permission' || s === 'ច្បាប់') {
                return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-500"></span> សុំច្បាប់ (Permission)
                </span>`;
            }
            return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">${status || '-'}</span>`;
        }

        // Render Search Result Items
        function renderResults(records, query) {
            resultCount.innerText = records.length;
            activeQueryDisplay.innerText = `ពាក្យស្វែងរក៖ "${query}"`;

            // Reset Containers
            cardsView.innerHTML = '';
            tableBody.innerHTML = '';

            records.forEach((item, index) => {
                const statusBadgeHtml = getStatusBadge(item.status);

                // Mobile Card Template
                const card = document.createElement('div');
                card.className = "bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3";
                card.innerHTML = `
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">${item.id || 'N/A'}</span>
                            <h4 class="font-bold text-slate-800 text-base">${item.name || '-'}</h4>
                        </div>
                        <div>${statusBadgeHtml}</div>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs text-slate-600">
                        <div>
                            <span class="text-slate-400 block text-[11px]">កាលបរិច្ឆេទ</span>
                            <span class="font-medium text-slate-700"><i class="fa-regular fa-calendar text-slate-400 mr-1"></i>${item.date || '-'}</span>
                        </div>
                        <div>
                            <span class="text-slate-400 block text-[11px]">ម៉ោង</span>
                            <span class="font-medium text-slate-700"><i class="fa-regular fa-clock text-slate-400 mr-1"></i>${item.time || '-'}</span>
                        </div>
                    </div>
                    ${item.note && item.note !== '-' ? `
                    <div class="text-xs bg-slate-50 p-2 rounded-lg text-slate-600 border border-slate-100">
                        <span class="text-slate-400 font-semibold">កំណត់សម្គាល់៖</span> ${item.note}
                    </div>` : ''}
                `;
                cardsView.appendChild(card);

                // Desktop Table Row Template
                const tr = document.createElement('tr');
                tr.className = index % 2 === 0 ? "bg-white hover:bg-slate-50/80 transition-colors" : "bg-slate-50/40 hover:bg-slate-50 transition-colors";
                tr.innerHTML = `
                    <td class="py-3.5 px-4 font-semibold text-sky-600">${item.id || 'N/A'}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-800">${item.name || '-'}</td>
                    <td class="py-3.5 px-4 text-slate-600 text-xs">${item.date || '-'}</td>
                    <td class="py-3.5 px-4 text-slate-600 text-xs">${item.time || '-'}</td>
                    <td class="py-3.5 px-4">${statusBadgeHtml}</td>
                    <td class="py-3.5 px-4 text-slate-500 text-xs">${item.note || '-'}</td>
                `;
                tableBody.appendChild(tr);
            });
        }
    
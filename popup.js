document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const fileNameDisplay = document.getElementById('fileName');
    const dibInput = document.getElementById('dibInput');
    const processButton = document.getElementById('processButton');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const copyOption = document.getElementById('copyOption');

    let selectedFile;

    fileInput.addEventListener('change', handleFileSelect);
    dibInput.addEventListener('input', handleInput);
    processButton.addEventListener('click', processFile);
    copyOption.addEventListener('change', storeData);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !processButton.disabled) {
            processFile();
        }
    });

    loadStoredData();

    function handleFileSelect(event) {
        selectedFile = event.target.files[0];
        if (selectedFile) {
            fileNameDisplay.textContent = `Último arquivo selecionado: ${selectedFile.name}`;
            storeData();
            updateButtonState();
        }
    }

    function handleInput() {
        formatDibInput();
        storeData();
        updateButtonState();
    }

    function formatDibInput() {
        let dib = dibInput.value.replace(/\D/g, '');
        if (dib.length > 2) dib = dib.slice(0, 2) + '/' + dib.slice(2);
        if (dib.length > 5) dib = dib.slice(0, 5) + '/' + dib.slice(5, 9);
        dibInput.value = dib;
    }

    function updateButtonState() {
        const dib = dibInput.value;
        const isValidDate = validateDate(dib);
        const fileSelected = !!selectedFile;

        processButton.disabled = !(fileSelected && isValidDate);
    }

    function validateDate(dateStr) {
        const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
        return datePattern.test(dateStr);
    }

    async function processFile() {
        const dibStr = dibInput.value;
        const dib = parseDate(dibStr);

        const data = await readExcelFile(selectedFile);
        const result = findDataByDib(data, dib);

        if (result) {
            const selectedOption = copyOption.value;
            let textToCopy = '';
            let textToDisplay = '';
            switch (selectedOption) {
                case 'totalValue':
                    textToCopy = `R$ ${formatCurrency(result.soma)}`;
                    textToDisplay = `R$ ${formatCurrency(result.soma)}`;
                    break;
                case 'concise':
                    textToCopy = formatConciseResult(result, dib);
                    textToDisplay = textToCopy;
                    break;
                case 'full':
                    textToCopy = formatResult(result, dib);
                    textToDisplay = formatConciseResult(result, dib);
                    break;
                default:
                    textToCopy = formatResult(result, dib);
                    textToDisplay = textToCopy;
            }
            copyToClipboard(textToCopy);
            showMessage("Valor(es) copiado(s) com sucesso! \nUse Ctrl+V ou 'colar' para inseri-los no documento.");
            displayResult(textToDisplay);
        } else {
            showMessage("Nenhum resultado encontrado para a DIB especificada.");
            displayResult("");
        }
    }

    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    function readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                resolve(jsonData);
            };
            reader.onerror = (event) => {
                reject(event.target.error);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    function findDataByDib(data, dib) {
        const mesAnoDib = `${('0' + (dib.getMonth() + 1)).slice(-2)}/${dib.getFullYear()}`;
        return data.find(row => {
            const dibDate = new Date(row.dib);
            const mesAnoRow = `${('0' + (dibDate.getMonth() + 1)).slice(-2)}/${dibDate.getFullYear()}`;
            return mesAnoRow === mesAnoDib;
        });
    }

    function formatResult(result, dib) {
        const { dip, p_ant, p_atual, v_ant, v_atual, soma } = result;
        return `
DIB (=DER): ${formatDate(dib)}

-----------------------------------------------------------------------------------------------------------------------------------------------

DIP: ${formatDate(new Date(dip))}

-----------------------------------------------------------------------------------------------------------------------------------------------

RMI: 01 (um) salário-mínimo

-----------------------------------------------------------------------------------------------------------------------------------------------

VALOR TOTAL DO ACORDO: R$ ${formatCurrency(soma)}

-----------------------------------------------------------------------------------------------------------------------------------------------

COMPOSIÇÃO:

- Parcelas de exercícios anteriores: ${p_ant}
- Parcelas do exercício atual: ${p_atual}
- Valor de exercícios anteriores: R$ ${formatCurrency(v_ant)}
- Valor do exercício atual: R$ ${formatCurrency(v_atual)}
        `.trim();
    }

    function formatConciseResult(result, dib) {
        const { dip, p_ant, p_atual, v_ant, v_atual, soma } = result;
        return `
DIB: ${formatDate(dib)}
DIP: ${formatDate(new Date(dip))}
RMI: 01 (um) salário-mínimo
VALOR TOTAL DO ACORDO: R$ ${formatCurrency(soma)}
COMPOSIÇÃO:
- Parcelas de exercícios anteriores: ${p_ant}
- Parcelas do exercício atual: ${p_atual}
- Valor de exercícios anteriores: R$ ${formatCurrency(v_ant)}
- Valor do exercício atual: R$ ${formatCurrency(v_atual)}
        `.trim();
    }

    function formatDate(date) {
        return date.toLocaleDateString('pt-BR');
    }

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Texto copiado para a área de transferência');
        }).catch(err => {
            console.error('Erro ao copiar texto: ', err);
        });
    }

    function showMessage(message) {
        statusDiv.innerText = message;
    }

    function displayResult(text) {
        resultDiv.innerText = text;
    }

    function storeData() {
        localStorage.setItem('dibInput', dibInput.value);
        localStorage.setItem('copyOption', copyOption.value);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64File = reader.result;
                localStorage.setItem('selectedFile', base64File);
                localStorage.setItem('fileName', selectedFile.name);
            };
            reader.readAsDataURL(selectedFile);
        }
    }

    function loadStoredData() {
        const storedDib = localStorage.getItem('dibInput');
        const storedCopyOption = localStorage.getItem('copyOption');
        const storedFile = localStorage.getItem('selectedFile');
        const storedFileName = localStorage.getItem('fileName');

        if (storedDib) {
            dibInput.value = storedDib;
        }

        if (storedCopyOption) {
            copyOption.value = storedCopyOption;
        }

        if (storedFile && storedFileName) {
            try {
                const byteString = atob(storedFile.split(',')[1]);
                const mimeString = storedFile.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                selectedFile = new Blob([ab], { type: mimeString });
                fileNameDisplay.textContent = `Último arquivo selecionado: ${storedFileName}`;
            } catch (e) {
                console.error('Erro ao carregar o arquivo do localStorage', e);
                localStorage.removeItem('selectedFile');
                localStorage.removeItem('fileName');
                fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
            }
        } else {
            fileNameDisplay.textContent = 'Nenhum arquivo selecionado';
        }

        updateButtonState();
    }
});

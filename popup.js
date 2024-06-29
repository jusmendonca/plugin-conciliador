document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('dibInput').addEventListener('input', handleInput);
document.getElementById('processButton').addEventListener('click', processFile);

let selectedFile;

function handleFileSelect(event) {
    selectedFile = event.target.files[0];
    updateButtonState();
}

function handleInput() {
    updateButtonState();
}

function updateButtonState() {
    const dib = document.getElementById('dibInput').value;
    const isValidDate = validateDate(dib);
    const fileSelected = !!selectedFile;

    document.getElementById('processButton').disabled = !(fileSelected && isValidDate);
}

function validateDate(dateStr) {
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    return datePattern.test(dateStr);
}

async function processFile() {
    const dibStr = document.getElementById('dibInput').value;
    const dib = parseDate(dibStr);
    
    const data = await readExcelFile(selectedFile);
    const result = findDataByDib(data, dib);
    
    if (result) {
        const text = formatResult(result, dib);
        copyToClipboard(text);
        showMessage("Parâmetros copiados com sucesso! \n\ Use Ctrl+V ou 'colar' para inseri-los na minuta de petição.");
        displayResult(text);
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
DIP: ${formatDate(new Date(dip))}

VALOR TOTAL DOS ATRASADOS: R$ ${formatCurrency(soma)}

Composição:
Número de parcelas de exercícios anteriores: ${p_ant}
Número de parcelas do exercício atual: ${p_atual}
Valor de exercícios anteriores: R$ ${formatCurrency(v_ant)}
Valor do exercício atual: R$ ${formatCurrency(v_atual)}
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
    document.getElementById('status').innerText = message;
}

function displayResult(text) {
    document.getElementById('result').innerText = text;
}
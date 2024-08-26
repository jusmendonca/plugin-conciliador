document.addEventListener('DOMContentLoaded', function() {
    const benefitSelect = document.getElementById('benefitSelect');
    const fileNameDisplay = document.getElementById('fileName');
    const dipInput = document.getElementById('dipInput');
    const dibInput = document.getElementById('dibInput');
    const percentualInput = document.getElementById('percentualInput');
    const processButton = document.getElementById('processButton');
    const generateHtmlButton = document.getElementById('generateHtmlButton');
    const statusDiv = document.getElementById('status');
    const resultDiv = document.getElementById('result');
    const copyOption = document.getElementById('copyOption');
    const openConfigButton = document.getElementById('openConfigButton');
    const honorariosToggle = document.getElementById('honorariosToggle');
    const honorariosInput = document.getElementById('honorariosInput');
    const numeroProcessoInput = document.getElementById('numeroProcesso');

    let selectedBenefitData;

    openConfigButton.addEventListener('click', function() {
        window.open('config.html');
    });

    benefitSelect.addEventListener('change', handleBenefitSelect);
    dipInput.addEventListener('input', handleInputChange);
    dibInput.addEventListener('input', handleInputChange);
    percentualInput.addEventListener('input', handleInputChange);
    processButton.addEventListener('click', processFile);
    generateHtmlButton.addEventListener('click', generateHtmlFile);
    copyOption.addEventListener('change', storeData);

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !processButton.disabled) {
            processFile();
        }
    });

    honorariosToggle.addEventListener('change', function() {
        honorariosInput.disabled = !honorariosToggle.checked;
        if (!honorariosToggle.checked) {
            honorariosInput.value = 0;
        }
        storeData();
        updateButtonState();
    });

    loadStoredData();

    function formatProcessNumberInput(event) {
        let input = event.target.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    
        // Aplica o hífen após os primeiros 7 dígitos
        if (input.length > 7) input = input.slice(0, 7) + '-' + input.slice(7);
    
        // Aplica o primeiro ponto após o segundo dígito depois do hífen
        if (input.length > 9) input = input.slice(0, 10) + '.' + input.slice(10);
    
        // Aplica o segundo ponto após os quatro dígitos subsequentes ao primeiro ponto
        if (input.length > 14) input = input.slice(0, 15) + '.' + input.slice(15);
    
        // Aplica o terceiro ponto após o 16º número digitado
        if (input.length > 16) input = input.slice(0, 17) + '.' + input.slice(17);

        // Aplica o quarto ponto após dois dígitos subsequentes ao terceiro ponto
        if (input.length > 19) input = input.slice(0, 20) + '.' + input.slice(20);
    
        // Atualiza o valor do campo de entrada
        event.target.value = input;
    }
    
    
    function handleBenefitSelect() {
        const benefit = benefitSelect.value;
        const dataSource = getDataPath();

        if (dataSource === 'custom') {
            const storedData = localStorage.getItem(`${benefit}CustomData`);
            if (storedData) {
                selectedBenefitData = JSON.parse(storedData).dados;
                fileNameDisplay.textContent = `Dados carregados de arquivo personalizado para: ${benefit}`;
                updateButtonState();
                resultDiv.classList.add('modified');
            } else {
                console.error(`Arquivo personalizado não encontrado para o benefício: ${benefit}`);
                fileNameDisplay.textContent = `Erro: Arquivo personalizado não encontrado para ${benefit}`;
            }
        } else {
            fetch(`${dataSource}/${benefit}.json`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    selectedBenefitData = data.dados;
                    fileNameDisplay.textContent = `Dados carregados de: ${dataSource}/${benefit}.json`;
                    storeData();
                    updateButtonState();
                    resultDiv.classList.add('modified');
                })
                .catch(error => {
                    console.error('Erro ao carregar o arquivo JSON:', error);
                    fileNameDisplay.textContent = 'Erro ao carregar o arquivo JSON';
                });
        }
    }

    function getDataPath() {
        return localStorage.getItem('dataSourceSelect') || 'json';
    }

    function handleInputChange() {
        formatDipInput();
        formatDibInput();
        storeData();
        updateButtonState();
        resultDiv.classList.add('modified');
    }

    function formatDipInput() {
        let dip = dipInput.value.replace(/\D/g, '');
        if (dip.length > 2) dip = dip.slice(0, 2) + '/' + dip.slice(2);
        if (dip.length > 5) dip = dip.slice(0, 5) + '/' + dip.slice(5, 9);
        dipInput.value = dip;
    }

    function formatDibInput() {
        let dib = dibInput.value.replace(/\D/g, '');
        if (dib.length > 2) dib = dib.slice(0, 2) + '/' + dib.slice(2);
        if (dib.length > 5) dib = dib.slice(0, 5) + '/' + dib.slice(5, 9);
        dibInput.value = dib;
    }

    function updateButtonState() {
        const dip = dipInput.value;
        const dib = dibInput.value;
        const isValidDate = validateDate(dip) && validateDate(dib);
        const benefitSelected = !!selectedBenefitData;

        processButton.disabled = !(benefitSelected && isValidDate);
    }

    function validateDate(dateStr) {
        const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
        return datePattern.test(dateStr);
    }

    function promptUserForDetails() {
        return new Promise((resolve) => {
            // Cria o formulário dentro de um diálogo
            const form = document.createElement('form');
            form.innerHTML = `
                <label for="numeroProcesso">Número do Processo:</label>
                <input type="text" id="numeroProcesso" maxlength="25" required><br>
                <label for="nomeInteressado">Nome do Interessado:</label>
                <input type="text" id="nomeInteressado" required><br>
                <label for="nomeBeneficio">Nome do Benefício:</label>
                <input type="text" id="nomeBeneficio" required><br>
                <button type="submit">OK</button>
                <button type="button" id="cancelButton">Cancelar</button>
            `;

            // Cria o diálogo
            const dialog = document.createElement('dialog');
            dialog.appendChild(form);
            document.body.appendChild(dialog);

            // Identifique o campo de entrada do número do processo
            const numeroProcessoInput = document.getElementById('numeroProcesso');

            // Aplique a função de formatação ao evento 'input'
            if (numeroProcessoInput) {
                numeroProcessoInput.addEventListener('input', formatProcessNumberInput);
            }

            // Manipulador de cancelamento
            const cancelButton = document.getElementById('cancelButton');
            cancelButton.addEventListener('click', () => {
                dialog.close();
                resolve(null); // Resolve com null se o usuário cancelar
            });

            // Manipulador de submissão
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const details = {
                    numeroProcesso: document.getElementById('numeroProcesso').value,
                    nomeInteressado: document.getElementById('nomeInteressado').value,
                    nomeBeneficio: document.getElementById('nomeBeneficio').value,
                };
                dialog.close();
                resolve(details); // Resolve com os detalhes fornecidos pelo usuário
            });

            // Exibe o diálogo
            dialog.showModal();
        });
    }

    async function processFile() {
        const dipStr = dipInput.value;
        const dibStr = dibInput.value;
        const dip = parseDate(dipStr);
        const dib = parseDate(dibStr);
        const percentual = parseFloat(percentualInput.value) / 100;
        const honorariosPercentual = honorariosToggle.checked ? parseFloat(honorariosInput.value) / 100 : 0;

        try {
            const result = findDataByDipDib(selectedBenefitData, dip, dib);

            if (result) {
                if (!result.originalValues) {
                    result.originalValues = { ...result };
                }
                result.v_ant = result.originalValues.v_ant;
                result.v_atual = result.originalValues.v_atual;
                result.soma = result.originalValues.soma;

                applyPercentual(result, percentual);

                const honorarios = result.soma * honorariosPercentual;

                const selectedOption = copyOption.value;
                let textToCopy = '';
                let textToDisplay = '';
                switch (selectedOption) {
                    case 'totalValue':
                        textToCopy = `${formatCurrency(result.soma)}`;
                        textToDisplay = `${formatCurrency(result.soma)}`;
                        break;
                    case 'concise':
                        textToCopy = formatConciseResult(result, dip, dib, percentual, honorariosPercentual, honorarios);
                        textToDisplay = textToCopy;
                        break;
                    case 'full':
                        textToCopy = formatResult(result, dip, dib, percentual, honorariosPercentual, honorarios);
                        textToDisplay = textToCopy;
                        break;
                    default:
                        textToCopy = formatResult(result, dip, dib, percentual, honorariosPercentual, honorarios);
                        textToDisplay = textToCopy;
                }
                copyToClipboard(textToCopy);
                showMessage("Cálculo feito com sucesso! CONFIRA os parâmetros e use Ctrl+V ou 'colar'.");
                displayResult(textToDisplay);
                resultDiv.classList.remove('modified');
            } else {
                showMessage("Sem resultados encontrados para a DIP e DIB inseridas.");
                displayResult("");
            }
        } catch (error) {
            showMessage(`Erro ao processar os dados: ${error}`);
        }
    }

    async function generateHtmlFile() {
        // Solicita as informações do usuário em uma única caixa de diálogo
        const userDetails = await promptUserForDetails();
        if (!userDetails) {
            showMessage("A operação foi cancelada.");
            return;
        }

        const { numeroProcesso, nomeInteressado, nomeBeneficio } = userDetails;

        if (!validateProcessNumber(numeroProcesso)) {
            showMessage("Número do processo inválido ou não informado.");
            return;
        }

        const formattedProcessNumber = formatProcessNumber(numeroProcesso);

        try {
            // Carrega os dados necessários para gerar o HTML
            const { dipStr, dibStr, result, percentual, honorariosPercentual, honorarios } = await loadDataForHtmlGeneration();

            // Gera o conteúdo HTML
            const htmlContent = generateHtmlContent(result, percentual, formattedProcessNumber, nomeInteressado, nomeBeneficio, dipStr, dibStr, honorarios, honorariosPercentual);
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${formattedProcessNumber}.html`;
            link.click();
            resultDiv.classList.remove('modified');
        } catch (error) {
            showMessage(`Erro ao gerar o arquivo HTML: ${error.message}`);
        }
    }

    async function loadDataForHtmlGeneration() {
        const dipStr = dipInput.value;
        const dibStr = dibInput.value;
        const dip = parseDate(dipStr);
        const dib = parseDate(dibStr);
        const percentual = parseFloat(percentualInput.value) / 100;
        const honorariosPercentual = honorariosToggle.checked ? parseFloat(honorariosInput.value) / 100 : 0;

        try {
            const result = findDataByDipDib(selectedBenefitData, dip, dib);

            if (result) {
                if (!result.originalValues) {
                    result.originalValues = { ...result };
                }
                result.v_ant = result.originalValues.v_ant;
                result.v_atual = result.originalValues.v_atual;
                result.soma = result.originalValues.soma;

                // Aplica o percentual ao valor
                applyPercentual(result, percentual);

                // Calcula os honorários, se aplicável
                const honorarios = result.soma * honorariosPercentual;

                // Retorna todos os dados necessários para a geração do HTML
                return {
                    dipStr,
                    dibStr,
                    result,
                    percentual,
                    honorariosPercentual,
                    honorarios
                };
            } else {
                throw new Error("Sem resultados encontrados para a DIP e DIB inseridas.");
            }
        } catch (error) {
            throw new Error(`Erro ao processar os dados: ${error.message}`);
        }
    }

    function storeData() {
        localStorage.setItem('dipInput', dipInput.value);
        localStorage.setItem('dibInput', dibInput.value);
        localStorage.setItem('percentualInput', percentualInput.value);
        localStorage.setItem('copyOption', copyOption.value);
        localStorage.setItem('benefitSelect', benefitSelect.value);
    }

    function loadStoredData() {
        const storedDip = localStorage.getItem('dipInput');
        const storedDib = localStorage.getItem('dibInput');
        const storedPercentual = localStorage.getItem('percentualInput');
        const storedCopyOption = localStorage.getItem('copyOption');
        const storedBenefit = localStorage.getItem('benefitSelect');

        if (storedDip) {
            dipInput.value = storedDip;
        }

        if (storedDib) {
            dibInput.value = storedDib;
        }

        if (storedPercentual) {
            percentualInput.value = storedPercentual;
        }

        if (storedCopyOption) {
            copyOption.value = storedCopyOption;
        }

        if (storedBenefit) {
            benefitSelect.value = storedBenefit;
            handleBenefitSelect(); // Carrega os dados do benefício armazenado
        }

        updateButtonState();
    }

    function applyPercentual(result, percentual) {
        result.v_ant *= percentual;
        result.v_atual *= percentual;
        result.soma = result.v_ant + result.v_atual;
    }

    function parseDate(dateStr) {
        const [day, month, year] = dateStr.split('/');
        return new Date(year, month - 1, day);
    }

    function findDataByDipDib(data, dip, dib) {
        const mesAnoDip = `${('0' + (dip.getMonth() + 1)).slice(-2)}/${dip.getFullYear()}`;
        const mesAnoDib = `${('0' + (dib.getMonth() + 1)).slice(-2)}/${dib.getFullYear()}`;
        return data.find(row => {
            const dipDate = new Date(row.dip);
            const dibDate = new Date(row.dib);
            const mesAnoRowDip = `${('0' + (dipDate.getMonth() + 1)).slice(-2)}/${dipDate.getFullYear()}`;
            const mesAnoRowDib = `${('0' + (dibDate.getMonth() + 1)).slice(-2)}/${dibDate.getFullYear()}`;
            return mesAnoRowDip === mesAnoDip && mesAnoRowDib === mesAnoDib;
        });
    }

    function formatResult(result, dip, dib, percentual, honorariosPercentual, honorarios) {
        const { rmi, p_ant, p_atual, v_ant, v_atual, soma } = result;
        return `
DIB (=DER): ${formatDate(dib)}

-----------------------------------------------------------------------------------------------------------------------------------------------

DIP: ${formatDate(dip)}

-----------------------------------------------------------------------------------------------------------------------------------------------

RMI: ${rmi}

-----------------------------------------------------------------------------------------------------------------------------------------------

VALOR DEVIDO: ${formatCurrency(soma)} (percentual aplicado: ${percentual * 100}%)

-----------------------------------------------------------------------------------------------------------------------------------------------

COMPOSIÇÃO:

- Parcelas de exercícios anteriores: ${p_ant}

- Parcelas do exercício atual: ${p_atual}

- Valor de exercícios anteriores: ${formatCurrency(v_ant)}

- Valor do exercício atual: ${formatCurrency(v_atual)}

Honorários Advocatícios: ${formatCurrency(honorarios)} (percentual aplicado: ${honorariosPercentual * 100}%)

        `.trim();
    }

    function formatConciseResult(result, dip, dib, percentual, honorariosPercentual, honorarios) {
        const { rmi, p_ant, p_atual, v_ant, v_atual, soma } = result;
        return `
DIB: ${formatDate(dib)}
DIP: ${formatDate(dip)}
RMI: ${rmi}
VALOR DEVIDO: ${formatCurrency(soma)} (percentual aplicado: ${percentual * 100}%)
COMPOSIÇÃO:
- Parcelas de exercícios anteriores: ${p_ant}
- Parcelas do exercício atual: ${p_atual}
- Valor de exercícios anteriores: ${formatCurrency(v_ant)}
- Valor do exercício atual: ${formatCurrency(v_atual)}
Honorários Advocatícios: ${formatCurrency(honorarios)} (percentual aplicado: ${honorariosPercentual * 100}%)
        `.trim();
    }

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatDate(date) {
        const day = ('0' + date.getDate()).slice(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Texto copiado para a área de transferência.');
        }).catch(err => {
            console.error('Erro ao copiar texto: ', err);
        });
    }

    function showMessage(message) {
        statusDiv.textContent = message;
    }

    function displayResult(text) {
        resultDiv.textContent = text;
    }

    function validateProcessNumber(processNumber) {
        const normalizedNumber = processNumber.replace(/\D/g, '');
        return /^\d{20}$/.test(normalizedNumber);
    }

    function formatProcessNumber(processNumber) {
        const normalizedNumber = processNumber.replace(/\D/g, '');

        if (!validateProcessNumber(normalizedNumber)) {
            throw new Error('Número de processo inválido. Deve conter exatamente 20 dígitos.');
        }

        return `${normalizedNumber.slice(0, 7)}-${normalizedNumber.slice(7, 9)}.${normalizedNumber.slice(9, 13)}.${normalizedNumber.slice(13, 14)}.${normalizedNumber.slice(14, 16)}.${normalizedNumber.slice(16)}`;
    }

    function generateHtmlContent(result, percentual, numeroProcesso, nomeInteressado, nomeBeneficio, dipStr, dibStr, honorarios, honorariosPercentual) {
        const formattedProcessNumber = numeroProcesso;
        const todayDate = new Date().toLocaleDateString('pt-BR');
        const { rmi, p_ant, p_atual, v_ant, v_atual, soma } = result;
        const percentualAplicado = (percentual * 100).toFixed(2);
        const honorariosAplicado = (honorariosPercentual * 100).toFixed(2);

        return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <title>Processo: ${formattedProcessNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
            h1 { color: #333; }
            .info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .bold { font-weight: bold; }
        </style>
    </head>
    <body>
        <h1>Resumo do cálculo</h1>

        <p><strong>Processo:</strong> ${formattedProcessNumber}</p>
        <p><strong>Interessado:</strong> ${nomeInteressado}</p>
        <p><strong>Nome do Benefício:</strong> ${nomeBeneficio}</p>
        <p><strong>DIB:</strong> ${dibStr}</p>
        <p><strong>DIP:</strong> ${dipStr}</p>

        <p><strong>RMI:</strong> ${rmi}</p>
        <p><strong>VALOR DEVIDO:</strong> <span class="bold">${formatCurrency(soma)}</span></p>
        <p><strong>Percentual aplicado:</strong> ${percentualAplicado}%</p>

        <p><strong>Composição dos valores para Declaração de Rendimentos Recebidos Acumuladamente:</strong></p>
        <ul>
            <li>Parcelas de exercícios anteriores: ${p_ant}</li>
            <li>Parcelas do exercício atual: ${p_atual}</li>
            <li>Valor de exercícios anteriores: ${formatCurrency(v_ant)}</li>
            <li>Valor do exercício atual: ${formatCurrency(v_atual)}</li>
        </ul>

        <!-- Se os honorários foram aplicados, exibe-os -->
        ${honorarios > 0 ? `
        <p><strong>Valor dos Honorários Advocatícios:</strong> <span class="bold">${formatCurrency(honorarios)}</span> (percentual aplicado: ${honorariosAplicado}%)</p>
        ` : ''}

        <p><strong>Observações:</strong></p>
        <ol>
            <li>Índices aplicados: ORTN/OTN/BTN até 02/91 + INPC até 12/92 + IRSM até 02/94 + URV até 06/94 + IPCR até 06/95 + INPC até 04/96 + IGPDI até 09/2006 + IPCA-E + Selic após 12/021.</li>
            <li>Cálculo limitado ao teto de alçada dos Juizados Especiais Federais.</li>
            <li>Cálculos atualizados até ${todayDate}.</li>
        </ol>
    </body>
    </html>
        `;
    }   

    function storeData() {
        localStorage.setItem('dipInput', dipInput.value);
        localStorage.setItem('dibInput', dibInput.value);
        localStorage.setItem('percentualInput', percentualInput.value);
        localStorage.setItem('copyOption', copyOption.value);
        localStorage.setItem('benefitSelect', benefitSelect.value);
    }

    function loadStoredData() {
        const storedDip = localStorage.getItem('dipInput');
        const storedDib = localStorage.getItem('dibInput');
        const storedPercentual = localStorage.getItem('percentualInput');
        const storedCopyOption = localStorage.getItem('copyOption');
        const storedBenefit = localStorage.getItem('benefitSelect');

        if (storedDip) {
            dipInput.value = storedDip;
        }

        if (storedDib) {
            dibInput.value = storedDib;
        }

        if (storedPercentual) {
            percentualInput.value = storedPercentual;
        }

        if (storedCopyOption) {
            copyOption.value = storedCopyOption;
        }

        if (storedBenefit) {
            benefitSelect.value = storedBenefit;
            handleBenefitSelect(); // Carrega os dados do benefício armazenado
        }

        updateButtonState();
    }
});
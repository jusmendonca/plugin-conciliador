document.addEventListener('DOMContentLoaded', function() {
    const dataSourceSelect = document.getElementById('dataSourceSelect');
    const customPathGroup = document.getElementById('customPathGroup');
    const ruralFileInput = document.getElementById('ruralFileInput');
    const bpcLoasFileInput = document.getElementById('bpcLoasFileInput');
    const ruralFileNameDisplay = document.getElementById('ruralFileName');
    const bpcLoasFileNameDisplay = document.getElementById('bpcLoasFileName');
    const saveConfigButton = document.getElementById('saveConfigButton');
    const helpIcon = document.getElementById('helpIcon');

    loadStoredConfig();

    dataSourceSelect.addEventListener('change', function() {
        const selectedSource = dataSourceSelect.value;
        customPathGroup.style.display = selectedSource === 'custom' ? 'block' : 'none';
    });

    saveConfigButton.addEventListener('click', function() {
        saveConfig();
    });

    helpIcon.addEventListener('click', function() {
        window.open('help.html'); // Página fictícia por enquanto
    });

    ruralFileInput.addEventListener('change', function() {
        ruralFileNameDisplay.textContent = ruralFileInput.files[0]?.name || 'Nenhum arquivo escolhido';
    });

    bpcLoasFileInput.addEventListener('change', function() {
        bpcLoasFileNameDisplay.textContent = bpcLoasFileInput.files[0]?.name || 'Nenhum arquivo escolhido';
    });

    function saveConfig() {
        const selectedSource = dataSourceSelect.value;
        localStorage.setItem('dataSourceSelect', selectedSource);

        if (selectedSource === 'custom') {
            saveCustomFileData('RURAL', ruralFileInput, ruralFileNameDisplay);
            saveCustomFileData('BPC-LOAS', bpcLoasFileInput, bpcLoasFileNameDisplay);
        }

        alert('Configurações salvas com sucesso!');
    }

    function saveCustomFileData(benefitType, fileInput, fileNameDisplay) {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem(`${benefitType}CustomData`, event.target.result);
                localStorage.setItem(`${benefitType}FileName`, file.name);
                fileNameDisplay.textContent = file.name;
            };
            reader.readAsText(file);
        }
    }

    function loadStoredConfig() {
        const storedDataSource = localStorage.getItem('dataSourceSelect');
        const storedRuralFileName = localStorage.getItem('RURALFileName');
        const storedBpcLoasFileName = localStorage.getItem('BPC-LOASFileName');

        if (storedDataSource) {
            dataSourceSelect.value = storedDataSource;
            customPathGroup.style.display = storedDataSource === 'custom' ? 'block' : 'none';
        }

        if (storedRuralFileName) {
            ruralFileNameDisplay.textContent = storedRuralFileName;
        }

        if (storedBpcLoasFileName) {
            bpcLoasFileNameDisplay.textContent = storedBpcLoasFileName;
        }
    }
});

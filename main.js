const input = document.querySelector('.input');
const button = document.querySelector('.btn');
const resposta = document.querySelector('.resposta');

function mostrarMensagem(texto, tipo = '') {
	resposta.textContent = texto;
}

async function perguntar() {
	const pergunta = input.value.trim();

	if (!pergunta) {
		mostrarMensagem('Digite uma pergunta antes de enviar.', 'erro');
		return;
	}

	mostrarMensagem('Consultando o oráculo...');

	try {
		const response = await fetch('https://yesnooracle.app/api/oracle?tool=tarot');

		if (!response.ok) {
			throw new Error('Falha ao consultar a API.');
		}

		const data = await response.json();
		mostrarMensagem(`${data.verdict}\n\n${data.word}\n\n${data.phrase}`);
	} catch (error) {
		mostrarMensagem('Não foi possível obter a resposta no momento.', 'erro');
	}
}

button.addEventListener('click', perguntar);

input.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		perguntar();
	}
});

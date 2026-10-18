import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://qkyqaeibgbxmnsyegkxz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FzldBKOrZbjdIrWXGpeS_g_GrgfPRq2";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const input = document.querySelector('.input');
const button = document.querySelector('.btn');
const respostaTexto = document.querySelector('.resposta-texto');
const btnFavoritar = document.querySelector('.btn-favoritar');
const listaFavoritos = document.querySelector('.lista-favoritos');
const statusFavoritos = document.querySelector('.favoritos-status');

let ultimaResposta = null; 
function mostrarMensagem(texto) {
	respostaTexto.textContent = texto;
	btnFavoritar.hidden = true;
}

async function perguntar() {
	const pergunta = input.value.trim();

	if (!pergunta) {
		mostrarMensagem('Digite uma pergunta antes de enviar.');
		return;
	}

	mostrarMensagem('Consultando o oráculo...');

	try {
		const response = await fetch('https://yesnooracle.app/api/oracle?tool=tarot');

		if (!response.ok) {
			throw new Error('Falha ao consultar a API.');
		}

		const data = await response.json();
		respostaTexto.textContent = `${data.verdict}\n\n${data.word}\n\n${data.phrase}`;
		ultimaResposta = {
			pergunta,
			veredito: data.verdict,
			carta: data.word,
			frase: data.phrase,
		};
		btnFavoritar.hidden = false;
		btnFavoritar.disabled = false;
	} catch (error) {
		mostrarMensagem('Não foi possível obter a resposta no momento.');
	}
}

async function salvarFavorito() {
	if (!ultimaResposta || !supabase) return;
	btnFavoritar.disabled = true;

	const { error } = await supabase.from('favoritos').insert(ultimaResposta);
	if (error) {
		console.error(error);
		statusFavoritos.textContent = 'Erro ao salvar o favorito.';
		btnFavoritar.disabled = false;
		return;
	}
	await listarFavoritos();
}

async function listarFavoritos() {
	if (!supabase) {
		statusFavoritos.textContent = 'Banco não configurado (preencha SUPABASE_URL e SUPABASE_ANON_KEY em main.js).';
		return;
	}

	const { data, error } = await supabase
		.from('favoritos')
		.select('*')
		.order('criado_em', { ascending: false });

	if (error) {
		console.error(error);
		statusFavoritos.textContent = 'Erro ao carregar os favoritos.';
		return;
	}
	renderizarFavoritos(data);
}

async function removerFavorito(id) {
	const { error } = await supabase.from('favoritos').delete().eq('id', id);
	if (error) {
		console.error(error);
		statusFavoritos.textContent = 'Erro ao excluir o favorito.';
		return;
	}
	await listarFavoritos();
}

function renderizarFavoritos(favoritos) {
	listaFavoritos.replaceChildren();
	statusFavoritos.textContent = favoritos.length ? '' : 'Nenhum favorito ainda.';

	for (const fav of favoritos) {
		const item = document.createElement('li');
		item.textContent = `"${fav.pergunta}"\n${fav.veredito} — ${fav.carta}\n${fav.frase}\n`;

		const excluir = document.createElement('button');
		excluir.className = 'btn';
		excluir.textContent = '🗑 Excluir';
		excluir.addEventListener('click', () => removerFavorito(fav.id));

		item.appendChild(excluir);
		listaFavoritos.appendChild(item);
	}
}

button.addEventListener('click', perguntar);
btnFavoritar.addEventListener('click', salvarFavorito);

input.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		perguntar();
	}
});

listarFavoritos(); 
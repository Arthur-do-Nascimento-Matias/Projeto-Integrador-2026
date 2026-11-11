// Para usar seus áudios, coloque-os em Frontend/public/sons e preencha abaixo.
// Exemplo: erro: '/sons/erro.mp3'. Deixe '' para usar o efeito gerado.
export const ARQUIVOS_SOM = {
    erro: '/sons/error2.mp3',
    acerto: '/sons/acerto.wav',
    missao: '/sons/win1.mp3'
};

let contexto;
const arquivos = new Map();

// Chamada no clique, antes das requisições, para liberar o áudio no navegador.
export function prepararSons() {
    try {
        const Contexto = window.AudioContext || window.webkitAudioContext;
        if (!Contexto) return Promise.resolve();
        if (!contexto || contexto.state === 'closed') contexto = new Contexto();
        return contexto.resume().catch(() => {});
    } catch { return Promise.resolve(); }
}

export async function tocarSom(tipo) {
    try {
        const caminho = ARQUIVOS_SOM[tipo];
        if (caminho) {
            let audio = arquivos.get(caminho);
            if (!audio) {
                audio = new Audio(caminho);
                const volumes = {
                    erro: 0.18,
                    acerto: 0.6,
                    missao: 0.35
                };

                audio.volume = volumes[tipo]?? 0.35;

                arquivos.set(caminho, audio);
            }
            audio.currentTime = 0;
            await audio.play();
            return;
        }
        if (contexto?.state !== 'running') return;
        // Erro: duas notas agudas descendentes. Acerto: sino ascendente.
        // Missão: pequeno arpejo de celebração.
        const notas = {
            erro: [1174.66, 880],
            acerto: [1046.5, 1567.98],
            missao: [1046.5, 1318.51, 1567.98, 2093]
        }[tipo];
        if (!notas) return;
        const intervalo = tipo === 'missao' ? 0.105 : 0.085;
        notas.forEach((frequencia, indice) => {
            const inicio = contexto.currentTime + indice * intervalo;
            const fim = inicio + (tipo === 'erro' ? 0.09 : 0.18);
            const nota = contexto.createOscillator();
            const volume = contexto.createGain();
            nota.type = 'sine';
            nota.frequency.setValueAtTime(frequencia, inicio);
            volume.gain.setValueAtTime(0.0001, inicio);
            volume.gain.exponentialRampToValueAtTime(0.055, inicio + 0.006);
            volume.gain.exponentialRampToValueAtTime(0.0001, fim);
            nota.connect(volume);
            volume.connect(contexto.destination);
            nota.onended = () => { nota.disconnect(); volume.disconnect(); };
            nota.start(inicio);
            nota.stop(fim);
        });
    } catch { /* Uma falha no áudio não interrompe a atividade ou a missão. */ }
}


import { useEffect } from 'react';

import atlas from '../../assets/moki-elements.png';

const atlasSize = 1254;

const sprites = {
  moki: [0, 0, 414, 478],
  book: [440, 65, 390, 398],
  medal: [851, 65, 400, 398],
  flask: [45, 500, 360, 365],
  atom: [452, 505, 378, 352],
  pencil: [875, 515, 350, 340],
  leaf: [70, 945, 285, 270],
  plant: [437, 880, 380, 355],
  bush: [836, 883, 413, 350],
};

const objects = [
  ["moki", 0, 40, 30, -5, 58, 53, 3, -8, -7],
  ["book", 51, 74, 17, 46, 78, 28, 4, -13, 18],
  ["medal", 32, 70, 12, 38, 57, 22, 4, -1.5, -18],
  ["flask", 85, 36, 13, 84, 51, 20, -5, -14, 24],
  ["atom", 77, 59, 12, 72, 65, 22, 5, -10, -22],
  ["pencil", 72, 79, 12, 73, 83, 21, -1, -9, 25],
  ["plant", 88, 73, 12, 84, 79, 21, 2, -4, -7],
  ["bush", -4, 81, 23, -10, 86, 34, -3, -3, -6],

  ["leaf", 2, 16, 7, 0, 23, 13, 4, -12, 65],
  ["leaf", 8, 31, 6, 0, 45, 11, -1, 12, -48],
  ["leaf", 32, 3, 6, 0, 90, 11, 4, 12, -48],
  ["leaf", 92, 23, 6, 88, 18, 12, -5, 15, -75],
  ["leaf", 68, 4, 5, 18, 18, 21, -5, 5, -75],
  ["leaf", 62, 64, 5, 60, 58, 9, 6, -22, 85],
  ["leaf", 47, 89, 4, 24, 84, 7, -5, -17, -90],
  ["leaf", 22, 69, 5, 31, 74, 9, 6, -12, 55],
];

const limitar = (valor) =>
  Math.max(0, Math.min(1, valor));


// Renderização dos sprites com React
export function ArteMoki() {

  return objects.map((objeto, index) => {

    const [key, x, y, size, mx, my, ms] = objeto;

    const [sx, sy, w, h] = sprites[key];

    return (
      <div
        key={`${key}-${index}`}
        className="object"
        style={{
          '--x': x,
          '--y': y,
          '--size': size,
          '--mx': mx,
          '--my': my,
          '--ms': ms,
          '--ratio': w / h,
        }}
      >
        <div className="sprite">
          <img
            src={atlas}
            alt=""
            draggable={false}
            style={{
              width: `${(atlasSize / w) * 100}%`,
              height: `${(atlasSize / h) * 100}%`,
              left: `${(-sx / w) * 100}%`,
              top: `${(-sy / h) * 100}%`,
            }}
          />
        </div>
      </div>
    );
  });
}


// Hook com todas as animações da página
export function useAnimacoesIndex() {

  useEffect(() => {

    const section = document.querySelector(
      '#moki-parallax'
    );

    const stage = section?.querySelector('.stage');

    const elements = [
      ...(section?.querySelectorAll('.art .object') || [])
    ];

    const phrases = [
      ...(section?.querySelectorAll('.phrase') || [])
    ];

    const bar = document.querySelector('.progress span');

    const restart = document.querySelector('#restart');

    const gamificacao = document.querySelector(
      '#gamificacao'
    );

    const barraGamificacao = document.querySelector(
      '.gamificacao .barra-progresso span'
    );

    const gamerWrap = document.querySelector(
      '.gamer-vinheta-wrap'
    );

    const biblioteca = document.querySelector(
      '#biblioteca-home'
    );

    const simia = document.querySelector(
      '#simia-apresentacao'
    );

    const familia = document.querySelector(
      '.familia-simio'
    );

    const movimentoReduzido = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const observadores = [];

    let framePendente = null;


    // ==============================
    // PARALLAX
    // ==============================


function atualizarParallax() {

  if (!section || !stage) return;

  const rect = section.getBoundingClientRect();
  const alturaTela = window.innerHeight;

  const range = Math.max(
    1,
    section.offsetHeight - alturaTela
  );

  const p = limitar(-rect.top / range);

  // ===========================
  // PRENDER A CENA NA TELA
  // ===========================

  let posicao;
  let topo;
  let baixo;
  let esquerda;
  let largura;

  if (rect.top > 0) {

    // Ainda não começou
    posicao = 'absolute';
    topo = '0px';
    baixo = 'auto';
    esquerda = '0px';
    largura = '100%';

  } else if (rect.bottom <= alturaTela) {

    // A animação terminou
    posicao = 'absolute';
    topo = 'auto';
    baixo = '0px';
    esquerda = '0px';
    largura = '100%';

  } else {

    // A animação está acontecendo:
    // manter a cena fixa na viewport
    posicao = 'fixed';
    topo = '0px';
    baixo = 'auto';
    esquerda = `${rect.left}px`;
    largura = `${rect.width}px`;

  }

  stage.style.setProperty(
    'position',
    posicao,
    'important'
  );

  stage.style.setProperty(
    'top',
    topo,
    'important'
  );

  stage.style.setProperty(
    'bottom',
    baixo,
    'important'
  );

  stage.style.setProperty(
    'left',
    esquerda,
    'important'
  );

  stage.style.setProperty(
    'width',
    largura,
    'important'
  );

  stage.style.setProperty(
    'height',
    `${alturaTela}px`,
    'important'
  );

  // ===========================
  // MOVIMENTAÇÃO DOS SPRITES
  // ===========================

  const enabled = !movimentoReduzido.matches;

  elements.forEach((el, index) => {

    const objeto = objects[index];

    if (!objeto) return;

    const dx = objeto[7];
    const dy = objeto[8];
    const rot = objeto[9];

    el.style.transform = enabled
      ? `
        translate(
          ${p * dx * 2}vw,
          ${p * dy * 2}vh
        )
        rotate(${p * rot * 1.7}deg)
      `
      : 'none';

  });

  // ===========================
  // TROCA DAS FRASES
  // ===========================

  const chapter =
    p < 0.33 ? 0 :
    p < 0.7 ? 1 : 2;

  phrases.forEach((el, index) => {

    const active = index === chapter;

    el.classList.toggle('current', active);

    el.setAttribute(
      'aria-hidden',
      String(!active)
    );

    el.inert = !active;

  });

  // ===========================
  // BARRA DE PROGRESSO
  // ===========================

  if (bar) {
    bar.style.width = `${p * 100}%`;
  }

}

    // ==============================
    // BIBLIOTECA
    // ==============================

    function atualizarBiblioteca() {

      if (!biblioteca) return;

      const rect = biblioteca.getBoundingClientRect();

      const alturaTela = window.innerHeight;

      const progresso = limitar(
        (alturaTela - rect.top) /
        (alturaTela * 0.9)
      );

      biblioteca.style.setProperty(
        '--biblioteca-scroll',
        movimentoReduzido.matches ? 1 : progresso
      );

      biblioteca.classList.toggle(
        'biblioteca-home--visivel',
        movimentoReduzido.matches || progresso > 0.3
      );

    }


    // ==============================
    // SIMIA
    // ==============================

    function atualizarSimia() {

      if (!simia) return;

      const rect = simia.getBoundingClientRect();

      const alturaTela = window.innerHeight;

      const progresso = limitar(
        (alturaTela - rect.top) /
        (alturaTela * 0.9)
      );

      simia.style.setProperty(
        '--simia-progresso',
        movimentoReduzido.matches ? 1 : progresso
      );

      if (
        movimentoReduzido.matches ||
        progresso >= 0.18
      ) {
        simia.classList.add(
          'simia-apresentacao--visivel'
        );
      }

    }


    // ==============================
    // ATUALIZAÇÃO CONJUNTA
    // ==============================

    function atualizarTudo() {

      framePendente = null;

      atualizarParallax();
      atualizarBiblioteca();
      atualizarSimia();

    }

    function solicitarAtualizacao() {

      if (framePendente !== null) return;

      framePendente = requestAnimationFrame(
        atualizarTudo
      );

    }


    // ==============================
    // PREFERÊNCIA DE MOVIMENTO
    // ==============================

    function atualizarPreferencia() {

      document.body.classList.toggle(
        'still',
        movimentoReduzido.matches
      );

      if (movimentoReduzido.matches && familia) {
        familia.classList.add(
          'familia-simio--entrou'
        );
      }

      solicitarAtualizacao();

    }


    // ==============================
    // REINICIAR PÁGINA
    // ==============================

    function reiniciar() {

      window.scrollTo({
        top: 0,
        behavior: movimentoReduzido.matches
          ? 'auto'
          : 'smooth',
      });

    }

    if (restart) {
      restart.addEventListener(
        'click',
        reiniciar
      );
    }


    // ==============================
    // GAMIFICAÇÃO
    // ==============================

    if (
      gamificacao &&
      barraGamificacao
    ) {

      if ('IntersectionObserver' in window) {

        const observadorGamificacao =
          new IntersectionObserver(
            ([entrada]) => {

              if (!entrada.isIntersecting) return;

              barraGamificacao.style.width = '83%';

              observadorGamificacao.disconnect();

            },
            {
              threshold: 0.35,
            }
          );

        observadorGamificacao.observe(
          gamificacao
        );

        observadores.push(
          observadorGamificacao
        );

      } else {
        barraGamificacao.style.width = '83%';
      }

    }


    // ==============================
    // PERSONAGEM GAMER
    // ==============================

    if (
      gamificacao &&
      gamerWrap
    ) {

      if ('IntersectionObserver' in window) {

        const observadorGamer =
          new IntersectionObserver(
            ([entrada]) => {

              if (entrada.isIntersecting) {

                gamerWrap.classList.add(
                  'gamer-apareceu'
                );

              } else if (
                entrada.boundingClientRect.top > 0
              ) {

                gamerWrap.classList.remove(
                  'gamer-apareceu'
                );

              }

            },
            {
              threshold: 0.35,
            }
          );

        observadorGamer.observe(
          gamificacao
        );

        observadores.push(
          observadorGamer
        );

      } else {
        gamerWrap.classList.add(
          'gamer-apareceu'
        );
      }

    }


    // ==============================
    // FAMÍLIA SIMIO
    // ==============================

    if (familia) {

      if (
        movimentoReduzido.matches ||
        !('IntersectionObserver' in window)
      ) {

        familia.classList.add(
          'familia-simio--entrou'
        );

      } else {

        const observadorFamilia =
          new IntersectionObserver(
            (entradas) => {

              entradas.forEach((entrada) => {

                if (!entrada.isIntersecting) return;

                familia.classList.add(
                  'familia-simio--entrou'
                );

                observadorFamilia.unobserve(
                  familia
                );

              });

            },
            {
              threshold: 0,
              rootMargin: '0px 0px -60px 0px',
            }
          );

        observadorFamilia.observe(familia);

        observadores.push(
          observadorFamilia
        );

      }

    }


    // ==============================
    // EVENTOS
    // ==============================

    window.addEventListener(
      'scroll',
      solicitarAtualizacao,
      { passive: true }
    );

    window.addEventListener(
      'resize',
      solicitarAtualizacao
    );

    movimentoReduzido.addEventListener(
      'change',
      atualizarPreferencia
    );


    // Executa logo após a montagem
    document.body.classList.toggle(
      'still',
      movimentoReduzido.matches
    );

    atualizarTudo();


    // ==============================
    // LIMPEZA DO REACT
    // ==============================

    return () => {

      window.removeEventListener(
        'scroll',
        solicitarAtualizacao
      );

      window.removeEventListener(
        'resize',
        solicitarAtualizacao
      );

      movimentoReduzido.removeEventListener(
        'change',
        atualizarPreferencia
      );

      if (restart) {
        restart.removeEventListener(
          'click',
          reiniciar
        );
      }

      if (framePendente !== null) {
        cancelAnimationFrame(framePendente);
      }

      observadores.forEach((observador) => {
        observador.disconnect();
      });

      document.body.classList.remove('still');

    };

  }, []);

}

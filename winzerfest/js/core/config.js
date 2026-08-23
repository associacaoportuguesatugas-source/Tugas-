/**
 * Winzerfest — Gestor de Fichas
 * config.js — Configuracao central da aplicacao.
 *
 * Tudo o que e "dados de negocio" (cores, categorias, prefixos de design)
 * vive aqui, para que uma futura expansao (novos eventos, novas cores,
 * novos modulos da Winzerfest) nao obrigue a mexer na logica.
 */
(function (WF) {
  'use strict';

  WF.config = {
    appName: 'Winzerfest — Gestor de Fichas',
    edition: 'WF26',
    currency: 'CHF',
    storageKey: 'winzerfest.fichas.v1',
    storageMetaKey: 'winzerfest.meta.v1',

    /**
     * Cores das fichas.
     *  key      -> identificador interno (nunca muda)
     *  label    -> nome apresentado
     *  scope    -> que produtos pertencem a esta cor
     *  slug     -> usado nas referencias de design (WF26-BRA-01)
     *  hex      -> cor "real" da ficha (referencia para a grafica)
     *  accent   -> cor forte usada em badges e bordas
     *  tint     -> fundo suave da linha na tabela
     *  tintDark -> fundo suave da linha em modo escuro
     *  ink      -> cor de texto legivel sobre o accent
     */
    colors: [
      {
        key: 'branco', label: 'Branco', slug: 'BRA',
        scope: 'Cerveja, refrigerantes ou sumos e agua',
        hex: '#FFFFFF', accent: '#94A3B8', tint: '#F8FAFC', tintDark: '#1B2230', ink: '#0F172A'
      },
      {
        key: 'verde', label: 'Verde', slug: 'VER',
        scope: 'Vinhos tinto e branco (75cl, 50cl, 1dl) e vinhos portugueses',
        hex: '#2FA84F', accent: '#2FA84F', tint: '#EEF9F0', tintDark: '#16281C', ink: '#FFFFFF'
      },
      {
        key: 'laranja', label: 'Laranja', slug: 'LAR',
        scope: 'Comida: sandes de porco no espeto, frango, sardinha, tapas',
        hex: '#F08A24', accent: '#F08A24', tint: '#FEF4E9', tintDark: '#2E2113', ink: '#3A2206'
      },
      {
        key: 'azul', label: 'Azul', slug: 'AZU',
        scope: 'Drinks, caipirinha e cafe',
        hex: '#2F76D6', accent: '#2F76D6', tint: '#EEF4FD', tintDark: '#152238', ink: '#FFFFFF'
      },
      {
        key: 'amarelo', label: 'Amarelo', slug: 'AMA',
        scope: 'Reservado — pronto para novos produtos',
        hex: '#F2C230', accent: '#D9A400', tint: '#FEFAEA', tintDark: '#2C2513', ink: '#3A2E03'
      }
    ]
  };

  /** Devolve a definicao de uma cor (com fallback seguro). */
  WF.config.color = function (key) {
    return WF.config.colors.filter(function (c) { return c.key === key; })[0] || WF.config.colors[0];
  };

  /** Lista de chaves de cor, pela ordem oficial de apresentacao. */
  WF.config.colorKeys = WF.config.colors.map(function (c) { return c.key; });

})(window.WF = window.WF || {});

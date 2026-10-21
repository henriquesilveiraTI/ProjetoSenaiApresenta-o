-- Cada partida sorteia suas fases do banco de perguntas. As partidas antigas
-- recebem a ordem fixa que existia antes do sorteio.
ALTER TABLE runs
  ADD COLUMN phase_ids text[] NOT NULL DEFAULT ARRAY[
    'botao-da-cor',
    'nao-clique',
    'tinta-nao-significado',
    'barra-cheia',
    'ordem-alfabetica',
    'quatro-por-extenso',
    'sem-a',
    'erro-na-frase',
    'segure-tres',
    'numero-palavra',
    'apenas-vogais',
    'perder-para-vencer'
  ]::text[];

ALTER TABLE runs ALTER COLUMN phase_ids DROP DEFAULT;

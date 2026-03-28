## Relatório de QA — Fluxo de Criação de Roteiro (Vereda / Travel AI)

Testei o fluxo completo de criação de roteiro da aplicação e encontrei os seguintes achados, separados por categoria:

---

### 🐛 Bugs

**1. Botão PDF sem feedback e sem funcionalidade**
Ao clicar em "PDF" na tela de preview do roteiro, nada acontece — sem loading, sem download, sem mensagem de erro ou sucesso. O usuário fica sem saber se o clique foi registrado ou se está aguardando algo. É provavelmente um recurso não implementado que deveria estar desabilitado ou com uma mensagem como "Em breve".

**2. Imagem de capa selecionada não persiste visualmente ao reabrir o roteiro**
Ao selecionar uma imagem de sugestão durante a criação e depois abrir o roteiro salvo novamente (via "Ver roteiro" do dashboard), o seletor de imagem exibe as três opções mas nenhuma aparece com a borda laranja de "selecionada". O estado de seleção não é restaurado visualmente, embora a imagem esteja correta no card do dashboard.

**3. Banner de erro não desaparece automaticamente ao corrigir os campos**
Ao tentar avançar sem preencher os campos e aparecer o banner "Preencha todos os campos obrigatórios", ele permanece na tela mesmo após o usuário preencher os campos corretamente. Só desaparece ao clicar em "Próximo" novamente.

**4. Aba "Minha foto" exibe input de arquivo nativo sem estilização**
Na seção "Imagem de capa", a aba "Minha foto" mostra um botão `<input type="file">` padrão do navegador ("Choose File / No file chosen"), completamente fora do design do sistema. Deveria ser substituído por uma área de arrastar-e-soltar estilizada ou um botão customizado consistente com o restante da UI.

**5. Link "← Editar formulário" desaparece após salvar**
Durante o preview (antes de salvar), existe o link "← Editar formulário" no topo. Após salvar a viagem e acessar o roteiro pelo dashboard, esse link desaparece, impedindo que o usuário retorne para editar os dados da viagem. Não há nenhuma forma visível de edição após o salvamento.

---

### ⚠️ Problemas de UX

**6. Campo "Origem" não tem asterisco de obrigatório, mas "Destino" tem**
No Step 1, o campo "Destino" tem o asterisco vermelho (*) indicando obrigatoriedade, mas "Origem" não tem — embora ambos sejam tratados de forma similar. Isso cria inconsistência na percepção do usuário sobre o que é ou não obrigatório.

**7. Mensagens de erro de validação inconsistentes**
Ao tentar avançar sem preencher os campos obrigatórios, apenas "Título da viagem" exibe uma mensagem de erro inline ("Preencha o título"). Os campos "Destino" e "Datas" ficam com borda vermelha mas sem mensagem explicativa abaixo deles. Isso prejudica a identificação do problema.

**8. Inconsistência visual nos botões de preferência (Step 2)**
Os botões de "Transporte" e "Interesses" usam o estilo `pill` (muito arredondado), enquanto os de "Hospedagem" e "Orçamento" usam um estilo de card com bordas menos arredondadas. São dois padrões visuais diferentes para o mesmo tipo de interação de seleção.

**9. Tela de loading muito espartana**
Durante a geração do roteiro (que pode durar mais de 10 segundos), a tela exibe apenas um spinner e os textos "Gerando seu roteiro..." e "Ainda processando...". Uma tela de espera mais rica — com dicas, animações relacionadas a viagens ou uma barra de progresso — melhoraria muito a percepção do tempo de espera e a qualidade percebida do produto.

**10. Campo "Número de pessoas" deveria ser um stepper (+/−)**
O campo de número de pessoas é um `<input type="number">` simples. Considerando que viagens raramente têm mais de 10 pessoas, um controle com botões + e − seria muito mais intuitivo e consistente com convenções de apps de viagem.

**11. Step 1 do stepper não mostra ícone de "concluído"**
Ao avançar para o Step 2 ou 3, o círculo do Step 1 permanece com o número "1" sem nenhuma indicação visual de que foi concluído (como um checkmark ✓). Isso é um padrão amplamente esperado em steppers multi-etapa.

---

### ✅ O que funciona bem

- Autocomplete de cidade com dados reais para Origem e Destino
- Sugestões de imagem de capa carregadas automaticamente ao selecionar o destino
- Validação de data invertida com mensagem clara ("A data de fim deve ser igual ou posterior à de início")
- Preservação dos dados ao navegar entre os steps com "Voltar"
- Modal de confirmação antes de excluir uma atividade do roteiro
- Qualidade do roteiro gerado pela IA — bem contextualizado (respeitou o horário de check-in, indicou restaurante vegetariano pela observação do usuário)
- Feedback de "Salvo" após salvar a viagem
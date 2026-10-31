# 🍃 Tem de Hoje

**Comida boa, preço bom, perto de você.**

Marketplace digital que conecta padarias e cafeterias a consumidores interessados em adquirir kits de alimentos excedentes, ainda próprios para consumo, com preços reduzidos.

**[Acessar aplicação](https://faithfully-framed-scene.lovable.app/)** | **[Repositório GitHub](https://github.com/nunesagabi/dio-tem-de-hoje-mvp)**

> Projeto demonstrativo desenvolvido para o desafio **MeuNegócio.AI: Construindo um Produto Digital com Agentes de IA e Lovable**, da trilha Santander Lovable 2026, na DIO. Os estabelecimentos e as ofertas apresentados são fictícios.

## 1. O problema

Padarias e cafeterias podem terminar o dia com alimentos não vendidos que, apesar de próprios para consumo, representam perdas financeiras e desperdício.

Ao mesmo tempo, consumidores procuram alternativas para economizar na alimentação.

O Tem de Hoje nasce da oportunidade de aproximar esses dois públicos por meio de uma plataforma simples, acessível e transparente.

## 2. A solução

O Tem de Hoje propõe um marketplace local em que:

1. Estabelecimentos cadastram kits de alimentos excedentes.
2. Consumidores visualizam as ofertas e o conteúdo exato de cada kit.
3. O consumidor realiza uma reserva online.
4. A retirada e o pagamento acontecem presencialmente no estabelecimento.

**Diferencial:** o consumidor sabe antecipadamente quais itens e quantidades fazem parte do kit, em vez de comprar uma sacola surpresa.

## 3. Público-alvo

**Consumidores:** pessoas que buscam alimentos com preços reduzidos e valorizam praticidade, transparência e comércio local.

**Estabelecimentos:** padarias e cafeterias que desejam reduzir perdas e recuperar parte do valor de produtos não vendidos.

**Região inicial proposta:** São Paulo, com potencial de expansão para outras cidades.

## 4. Análise de mercado: TAM, SAM e SOM

A análise considera três níveis de oportunidade:

| Indicador | Definição |
|---|---|
| TAM | Mercado potencial brasileiro de estabelecimentos elegíveis ao modelo |
| SAM | Parcela desse mercado que pode ser atendida inicialmente em São Paulo |
| SOM | Parcela do mercado que o negócio poderia conquistar realisticamente na fase inicial |

### Simulação de viabilidade

Para explorar o potencial econômico, foi elaborado um cenário hipotético:

| Premissa | Valor |
|---|---:|
| Estabelecimentos participantes | 20 |
| Pedidos por estabelecimento/mês | 15 |
| Ticket médio | R$ 20,00 |
| Comissão hipotética | 10% |
| Pedidos por ano | 3.600 |
| Volume bruto transacionado anual | R$ 72.000,00 |
| Receita bruta anual potencial da plataforma | R$ 7.200,00 |

**Importante:** os números são premissas ilustrativas de operação, não estimativas estatísticas comprovadas de TAM, SAM e SOM. O dimensionamento definitivo depende de pesquisa de estabelecimentos elegíveis, adesão e demanda.

## 5. Business Model Canvas

| Bloco | Descrição |
|---|---|
| Segmentos de clientes | Consumidores locais, padarias e cafeterias |
| Proposta de valor | Economia, redução de perdas e transparência sobre os kits |
| Canais | Plataforma web, redes sociais e estabelecimentos parceiros |
| Relacionamento | Autoatendimento e suporte manual |
| Fontes de receita | Comissão futura sobre pedidos concluídos |
| Recursos principais | Plataforma, catálogo, parceiros e dados operacionais |
| Atividades-chave | Gestão de ofertas, reservas e relacionamento com parceiros |
| Parcerias principais | Padarias, cafeterias e comércio local |
| Estrutura de custos | Infraestrutura, manutenção, suporte e divulgação |

## 6. Tese e hipóteses do MVP

**Tese:** consumidores podem se interessar por alimentos excedentes com preços reduzidos quando recebem informações claras sobre o conteúdo do kit, o preço e a retirada.

Hipóteses a testar:

- A proposta de valor é compreendida rapidamente.
- A descrição exata dos kits reduz dúvidas.
- O processo de reserva é simples.
- Estabelecimentos conseguem cadastrar ofertas sem dificuldades.
- O controle de estoque evita reservas acima da disponibilidade.
- O modelo de retirada presencial é operacionalmente viável.

A construção do MVP permite avaliar a experiência e o funcionamento técnico. A validação de demanda real ainda dependerá de testes com consumidores e comerciantes.

## 7. Escopo do MVP

### Experiência do consumidor

- Landing page explicativa.
- Catálogo de kits.
- Informações de preços, conteúdos e estabelecimentos.
- Busca e filtros de ofertas.
- Reserva de kits.
- Confirmação da reserva.

### Experiência do comerciante

- Acesso ao painel.
- Cadastro e edição de kits.
- Gestão de disponibilidade.
- Acompanhamento de reservas.
- Atualização do status das retiradas.

### Administração

- Gestão de estabelecimentos.
- Consulta de kits e reservas.
- Acompanhamento de indicadores.
- Gestão de solicitações de parceiros.

As funcionalidades acima representam o escopo definido para o MVP. A comprovação de cada fluxo deve ser registrada nos testes e capturas de tela.

## 8. O que ficou manual de propósito

Para manter o MVP enxuto, algumas operações foram deixadas fora da automação:

- Pagamento presencial, sem gateway integrado.
- Retirada diretamente no estabelecimento, sem delivery.
- Atendimento e relacionamento comercial sem chatbot.
- Captação inicial de parceiros sem automações externas.
- Validação comercial com usuários reais em uma etapa futura.

Essas decisões permitem priorizar a jornada principal antes de investir em funcionalidades mais complexas.

## 9. Desenvolvimento com Inteligência Artificial

O projeto foi planejado com o apoio do ChatGPT, utilizado como parceiro de análise e estruturação do produto.

Foram trabalhados:

- Identificação do problema e oportunidade.
- Definição da proposta de valor.
- Business Model Canvas.
- Hipóteses e análise de mercado.
- Documento de requisitos do produto (PRD).
- Mega prompt estruturado pelo método C.A.F.É.

**Método C.A.F.É:**
- **C:** Contexto.
- **A:** Ação.
- **F:** Formato.
- **E:** Especificações.

O Lovable foi utilizado para construir o MVP, com infraestrutura de backend integrada ao projeto.

## 10. Tecnologias

Tecnologias identificadas no projeto:

- Lovable.
- TypeScript.
- React.
- Vite.
- Tailwind CSS.
- Supabase e recursos de autenticação associados ao ambiente Lovable.
- Git e GitHub.

## 11. Testes e refinamentos

A validação técnica deve abranger:

- Navegação em dispositivos móveis e desktop.
- Visualização do catálogo e dos detalhes dos kits.
- Reserva de demonstração.
- Atualização de disponibilidade.
- Bloqueio de reservas acima do estoque.
- Cadastro e edição de kits.
- Controle de acesso aos painéis.
- Consulta e conclusão de reservas.
- Persistência das informações.

**Registro de correções:** adicionar as alterações efetivamente solicitadas ao Lovable durante o desenvolvimento, com o problema identificado, o prompt utilizado e o resultado observado.

**Revisão de segurança:** registrar a conclusão da verificação de segurança do Lovable antes da entrega.

## 12. Identidade visual

A marca utiliza uma linguagem acolhedora, simples e otimista.

| Cor | Código |
|---|---|
| Verde folha | `#32694E` |
| Creme | `#F9F5E9` |
| Pêssego | `#EBA16C` |
| Amarelo suave | `#F0C96C` |
| Verde escuro | `#27382D` |

## 13. Demonstração

**Aplicação publicada:** https://faithfully-framed-scene.lovable.app/

**Código-fonte:** https://github.com/nunesagabi/dio-tem-de-hoje-mvp

## Demonstração da aplicação

### Landing page
<img width="1892" height="821" alt="image" src="https://github.com/user-attachments/assets/97c1232e-cbb2-4490-9a79-0594058c31e6" />


### Catálogo de ofertas
<img width="1917" height="822" alt="image" src="https://github.com/user-attachments/assets/1d7c2907-7983-48d4-bde0-89e6a7317b0b" />


### Reserva
<img width="1902" height="825" alt="image" src="https://github.com/user-attachments/assets/cf806196-6fde-4773-983a-d882917e35a2" />
<img width="1917" height="825" alt="image" src="https://github.com/user-attachments/assets/73e8f78f-864f-49fa-911d-98ce164c59c2" />



### Painel administrativo
<img width="1912" height="827" alt="image" src="https://github.com/user-attachments/assets/546885e5-b50a-4b57-8569-571b639caf14" />


## 14. Próximos passos

- Realizar testes de usabilidade com usuários.
- Validar o interesse de estabelecimentos reais.
- Refinar o modelo de monetização.
- Investigar o potencial de expansão por bairros.
- Avaliar integrações de pagamento e notificações, conforme a necessidade.

---

**Projeto desenvolvido para fins educacionais no desafio DIO, Santander Lovable 2026.**

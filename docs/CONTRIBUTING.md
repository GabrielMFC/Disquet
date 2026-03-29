Fico feliz que tenha interesse em contribuir. Sabe, sempre quis ter um projeto open source com uma comunidade grande. As contribuições de todos os tamanhos são essenciais para a construção de um software robusto.

---

## Configuração de ambiente

Instale dependências:

```bash
npm install
```

Esse projeto necessita de alguns PATH e váriaveis de ambientes. Todos os recursos necessários para executar o ambiente de desenvolvimento estão dentro de [../commands/exports.txt](../commands/exports.txt).

---

## Execução de ambiente

Dentro de [.,/commands/buildCommands.txt](../commands/buildCommands.txt), tem anotações de comandos de build para copiar e colar rapidamente no terminal. Lembrando, que para executar o comando de Desenvolvimento, você precisará de um cabo USB com um dispositivo android conectado.

---

## Versionamento

Atualmente eu estou usando uma nomenclatura bem simples de versionamento. Os primeiros dois números, representam a quantidade de atualizações grandes que o disquet sofreu e o ultimo número é utilizado para quando uma atualização é implementada parcialmente, por exemplo:

```bash
0.1.5
```

Nesse exemplo, o disquet sofreu uma atualização grande representado pelo 1 no meio e a próxima atualização foi implementada parcialmente, representada pelo número 5. Quando o número do meio passa de 9, o primeiro número é incrementado em 1.

---

## Pull Request

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)  
3. Commit (`git commit -m 'Adiciona nova feature'`)  
4. Push (`git push origin feature/nova-feature`)  
5. Abra um Pull Request
/// <reference types = "cypress"/>

import { format, prepareLocalStorage } from '../support/utils'

describe('Dev Finances agilizei', () => {

    beforeEach(() => {
        cy.visit('https://devfinance-agilizei.netlify.app', {
            onBeforeLoad: (win) =>{
                prepareLocalStorage(win)
            }
        });

        // dois valores recuperados da configuracao do local storage
        cy.get('#data-table tbody tr').should('have.length', 2);
    });
    
    
    it('Cadastrar entradas', () => {

        // # localiza id
        //[] localiza atributo - valor
        // . localiza classe
        //   localiza pelo nome da tag exemplo get('button') localiza uma tag button

        cy.get('#transaction .button').click(); // id + classe
        cy.get('#description').type("Mesada"); // id
        cy.get('[name=amount]').type(12); // atributo = valor
        cy.get('[type=date]').type("2021-03-17"); // atributo = valor
        cy.get('button').contains('Salvar').click(); // tipo do elemento + label/texto

        // assert para o tamanho esperado da tabela de resultados
        cy.get('#data-table tbody tr').should('have.length', 3);        
    });

    it('Cadastra Saída', () => {

        cy.get('#transaction .button').click(); // id + classe
        cy.get('#description').type("Perdi a mesada"); // id
        cy.get('[name=amount]').type(-12); // atributo = valor
        cy.get('[type=date]').type("2021-03-17"); // atributo = valor
        cy.get('button').contains('Salvar').click(); // tipo do elemento + label/texto

        // assert para o tamanho esperado da tabela de resultados
        cy.get('#data-table tbody tr').should('have.length', 3); 
        
    });

    it('Remove entradas e saídas', () => {

        /*estrategia de localizacao 1: atraves da ancora, retornar ao elemento pai, 
        e a partir daí  avancar para um td img de attr*/
        //IMPORTANTE: ao usar contains, sempre garantir um get antes, pode ser por tipo do elemento
        cy.get('td.description')
            .contains('Mesada')
            .parent()
            .find('img[onclick*=remove]')
            .click()

        /*Estrategia de localizacao 2: buscar todos os elementos de mesmo nivel (irmaos)
        e verificar qual deles tem um filho com o atributo buscado*/
        cy.get('td.description')
            .contains('Suco Kapo')
            .siblings()
            .children('img[onclick*=remove]')
            .click()
        
        //assert: apos exluir as duas entradas, nao deve haver mais entradas na tabela
            cy.get('#data-table tbody tr').should('have.length', 0);
    });

    it('Validar saldo com diversas transações', () => {

        let incomes = 0
        let expenses = 0
        //capturar as linhas com as transacoes e as colunas com os valores
        cy.get('#data-table tbody tr')
            .each(($el, index, $list) =>{
                cy.get($el).find('td.income, td.expense')
                  .invoke('text').then(text => {

                    //formatar os valores dessas linhas
                    if(text.includes('-')){
                        expenses = expenses + format(text)
                    }
                    else{
                        incomes = incomes + format(text)
                    }

                    cy.log(`entradas`, incomes)
                    cy.log(`saidas`, expenses)

                  })
            })
        
        //capturar o texto do total
        cy.get('#totalDisplay').invoke('text').then(text => {

            let formattedTotalDisplay = format(text)
            let expectedTotal = incomes + expenses
            
            //comparar o somatorio de entradas e despesas com o total
            expect(formattedTotalDisplay).to.eq(expectedTotal)
        })

    });
});